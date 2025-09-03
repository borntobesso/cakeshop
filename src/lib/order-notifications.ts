/**
 * Unified Order Notification Service
 * Handles all notifications for order creation (email, SMS, print, reminders)
 */

import { logPrintError } from './error-logger';

interface OrderNotificationOptions {
  sendCustomerEmail?: boolean;
  sendShopEmail?: boolean;
  sendShopSMS?: boolean;
  printReceipts?: boolean;
  scheduleReminder?: boolean;
}

const DEFAULT_OPTIONS: OrderNotificationOptions = {
  sendCustomerEmail: true,
  sendShopEmail: true,
  sendShopSMS: process.env.NODE_ENV === 'production', // 개발 시 SMS 비활성화
  printReceipts: false, // 개발 시 프린트 비활성화
  scheduleReminder: process.env.NODE_ENV === 'production',
};

/**
 * Send all order notifications
 * @param order - Order object from database
 * @param options - Which notifications to send (default: all)
 */
export async function sendAllOrderNotifications(
  order: any,
  options: OrderNotificationOptions = DEFAULT_OPTIONS
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const notifications = [];

  // Customer confirmation email
  if (opts.sendCustomerEmail) {
    notifications.push(sendCustomerConfirmationEmail(order));
  }

  // Shop notification email
  if (opts.sendShopEmail) {
    notifications.push(sendShopNotificationEmail(order));
  }

  // Shop SMS notification
  if (opts.sendShopSMS) {
    notifications.push(sendShopSMSNotification(order));
  }

  // Print receipts (twice)
  if (opts.printReceipts) {
    notifications.push(printOrderReceipts(order));
  }

  // Schedule pickup reminder
  if (opts.scheduleReminder) {
    notifications.push(schedulePickupReminder(order));
  }

  try {
    await Promise.all(notifications);
    console.log(`All notifications sent successfully for order ${order.id}`);
  } catch (error) {
    console.error('Notification error:', error);
    throw error;
  }
}

/**
 * Send customer confirmation email
 */
async function sendCustomerConfirmationEmail(order: any) {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/notifications/email`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "order_confirmation",
          order,
          to: order.customerEmail,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Customer email failed: ${response.status}`);
    }

    console.log("Customer email sent successfully");
    return response.json();
  } catch (error) {
    console.error("Customer email error:", error);
    throw error;
  }
}

/**
 * Send shop notification email
 */
async function sendShopNotificationEmail(order: any) {
  try {
    const shopEmail = process.env.NEXT_PUBLIC_SHOP_EMAIL;
    if (!shopEmail) {
      console.warn("Shop email not configured, skipping shop notification");
      return;
    }

    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/notifications/email`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "new_order_shop",
          order,
          to: shopEmail,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shop email failed: ${response.status} - ${errorText}`);
    }

    console.log("Shop email sent successfully");
    return response.json();
  } catch (error) {
    console.error("Shop email error:", error);
    throw error;
  }
}

/**
 * Send SMS notification to shop
 */
async function sendShopSMSNotification(order: any) {
  try {
    const shopPhone = process.env.NEXT_PUBLIC_SHOP_PHONE;
    if (!shopPhone) {
      console.warn("Shop phone not configured, skipping SMS notification");
      return;
    }

    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/notifications/sms`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "new_order",
          order,
          to: shopPhone,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`SMS failed: ${response.status}`);
    }

    console.log("Shop SMS sent successfully");
    return response.json();
  } catch (error) {
    console.error("Shop SMS error:", error);
    throw error;
  }
}

/**
 * Print order receipts (twice) with retry logic
 */
async function printOrderReceipts(order: any) {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds
  
  const printResults: Array<{ success: boolean; attempt: number; error?: string; apiResponse?: any }> = [];
  let successfulPrints = 0;
  let totalAttempts = 0;
  let lastApiResponse: any = null;

  // Try to print twice (with retries for each)
  for (let printCopy = 1; printCopy <= 2; printCopy++) {
    let printed = false;
    let lastError: string | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES && !printed; attempt++) {
      totalAttempts++;
      try {
        console.log(`Attempting print copy ${printCopy}, attempt ${attempt}/${MAX_RETRIES}`);
        
        const result = await printSingleReceiptWithRetry(order);
        lastApiResponse = result;
        printed = true;
        successfulPrints++;
        
        printResults.push({ 
          success: true, 
          attempt,
          apiResponse: result
        });
        
        console.log(`✅ Print copy ${printCopy} succeeded on attempt ${attempt}`);
        break;
        
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`❌ Print copy ${printCopy} attempt ${attempt} failed: ${lastError}`);
        
        // Store API response if available in error
        if (error instanceof Error && (error as any).apiResponse) {
          lastApiResponse = (error as any).apiResponse;
        }
        
        // Wait before retry (except on last attempt)
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }
    }

    if (!printed) {
      printResults.push({ 
        success: false, 
        attempt: MAX_RETRIES,
        error: lastError || 'Print failed after all retries',
        apiResponse: lastApiResponse
      });
    }
  }

  // Log the print attempt results
  const severity = successfulPrints === 0 ? 'critical' : 'warning';
  
  if (successfulPrints < 2) {
    try {
      await logPrintError(order, 
        successfulPrints === 0 
          ? `All prints failed. Errors: ${printResults.filter(r => !r.success).map(r => r.error).join('; ')}`
          : `Only ${successfulPrints} of 2 receipts printed. Errors: ${printResults.filter(r => !r.success).map(r => r.error).join('; ')}`,
        severity,
        {
          printAttempts: totalAttempts,
          successfulPrints,
          failedPrints: 2 - successfulPrints,
          retryCount: totalAttempts - 2, // Total retries beyond initial attempts
          printerApiResponse: lastApiResponse,
          httpStatus: lastApiResponse?.status
        }
      );
    } catch (logError) {
      console.error('Failed to log print error:', logError);
    }
  }

  // Evaluate overall success
  if (successfulPrints === 0) {
    // Complete failure - send urgent notification
    const errorSummary = `All prints failed. Errors: ${printResults
      .filter(r => !r.success)
      .map(r => r.error)
      .join('; ')}`;
    
    console.error("🚨 Critical: All print attempts failed");
    await sendPrintFailureNotification(order, errorSummary, 'critical');
    throw new Error(errorSummary);
    
  } else if (successfulPrints === 1) {
    // Partial success - send warning but don't fail
    const errorSummary = `Only 1 of 2 receipts printed. Errors: ${printResults
      .filter(r => !r.success)
      .map(r => r.error)
      .join('; ')}`;
    
    console.warn("⚠️ Warning: Only partial print success");
    await sendPrintFailureNotification(order, errorSummary, 'warning');
    
  } else {
    // Full success
    console.log("✅ Both receipts printed successfully");
  }

  console.log(`Print summary: ${successfulPrints}/2 copies printed successfully`);
}

/**
 * Print single receipt with enhanced error handling
 */
async function printSingleReceiptWithRetry(order: any) {
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/print/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Print HTTP error ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  
  // Check if the response indicates print success
  if (!result.success) {
    throw new Error(result.error || 'Print API returned success: false');
  }

  return result;
}

/**
 * Send print failure notification with severity level
 */
async function sendPrintFailureNotification(order: any, error: string, severity: 'warning' | 'critical') {
  try {
    const shopPhone = process.env.NEXT_PUBLIC_SHOP_PHONE;
    const shopEmail = process.env.NEXT_PUBLIC_SHOP_EMAIL;

    const notificationPromises = [];

    // Send SMS notification (always for print issues)
    if (shopPhone) {
      const smsMessage = severity === 'critical' 
        ? `🚨 URGENT: Impression impossible pour commande #${order.orderNumber || order.id.slice(-8)}. ${error}`
        : `⚠️ Attention: Probleme impression commande #${order.orderNumber || order.id.slice(-8)}. ${error}`;

      notificationPromises.push(
        fetch(`${process.env.NEXTAUTH_URL}/api/notifications/sms`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "print_failure",
            order,
            to: shopPhone,
            error: smsMessage.length > 160 ? error : smsMessage // Use original error if too long
          }),
        })
      );
    }

    // Send email notification for critical issues or if no SMS
    if (severity === 'critical' || !shopPhone) {
      if (shopEmail) {
        notificationPromises.push(
          fetch(`${process.env.NEXTAUTH_URL}/api/notifications/email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "print_failure",
              order,
              to: shopEmail,
              error,
              severity
            }),
          })
        );
      }
    }

    // Wait for all notifications to complete
    const results = await Promise.allSettled(notificationPromises);
    
    const failedNotifications = results.filter(r => r.status === 'rejected').length;
    if (failedNotifications > 0) {
      console.error(`${failedNotifications} print failure notifications failed to send`);
    } else {
      console.log(`Print failure notifications sent (severity: ${severity})`);
    }

  } catch (notificationError) {
    console.error("Failed to send print failure notification:", notificationError);
    // Don't throw - notification failure shouldn't break the print process
  }
}

/**
 * Print single receipt (legacy function for compatibility)
 */
async function printSingleReceipt(order: any) {
  return printSingleReceiptWithRetry(order);
}

/**
 * Schedule pickup reminder (24h before pickup)
 */
async function schedulePickupReminder(order: any) {
  try {
    const pickupDateTime = new Date(
      `${order.pickupDate.toISOString().split("T")[0]}T${order.pickupTime}`
    );
    const reminderTime = new Date(
      pickupDateTime.getTime() - 24 * 60 * 60 * 1000
    ); // 24 hours before

    // Only schedule if reminder time is in the future
    if (reminderTime <= new Date()) {
      console.log("Pickup time is within 24 hours, skipping reminder");
      return;
    }

    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/notifications/schedule-reminder`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order,
          reminderTime: reminderTime.toISOString(),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Reminder scheduling failed: ${response.status}`);
    }

    console.log("Pickup reminder scheduled successfully");
    return response.json();
  } catch (error) {
    console.error("Reminder scheduling error:", error);
    throw error;
  }
}

/**
 * Quick access functions for common notification combinations
 */

// Send only customer notifications (email only)
export async function sendCustomerNotificationsOnly(order: any) {
  return sendAllOrderNotifications(order, {
    sendCustomerEmail: true,
    sendShopEmail: false,
    sendShopSMS: false,
    printReceipts: false,
    scheduleReminder: false,
  });
}

// Send everything except print (for testing)
export async function sendAllNotificationsExceptPrint(order: any) {
  return sendAllOrderNotifications(order, {
    sendCustomerEmail: true,
    sendShopEmail: true,
    sendShopSMS: true,
    printReceipts: false,
    scheduleReminder: true,
  });
}

// Send only shop notifications (email + SMS)
export async function sendShopNotificationsOnly(order: any) {
  return sendAllOrderNotifications(order, {
    sendCustomerEmail: false,
    sendShopEmail: true,
    sendShopSMS: true,
    printReceipts: false,
    scheduleReminder: false,
  });
}

// Send only email notifications (customer, shop)
export async function sendMailNotificationsOnly(order: any) {
  return sendAllOrderNotifications(order, {
    sendCustomerEmail: true,
    sendShopEmail: true,
    sendShopSMS: false,
    printReceipts: true,
    scheduleReminder: false,
  });
}