import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Cron job endpoint to send pickup reminders
 * Should be called every few minutes by external cron service
 * URL: /api/cron/send-reminders
 */

export async function POST(request: Request) {
  try {
    // Security check for production
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN;
    
    // In production, always require authentication
    if (process.env.NODE_ENV === 'production' && expectedToken) {
      if (authHeader !== `Bearer ${expectedToken}`) {
        console.log("❌ Unauthorized cron job attempt");
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    console.log("🕐 Starting reminder cron job...");

    // Find reminders that should be sent now
    const now = new Date();
    const reminderBuffer = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes buffer

    const pendingReminders = await prisma.scheduledReminder.findMany({
      where: {
        status: "pending",
        reminderTime: {
          lte: reminderBuffer // Send reminders that are due now (with 5min buffer)
        }
      },
      orderBy: { reminderTime: 'asc' },
      take: 10 // Process max 10 at a time to avoid timeouts
    });

    if (pendingReminders.length === 0) {
      console.log("No pending reminders to send");
      return NextResponse.json({
        success: true,
        message: "No pending reminders",
        processed: 0
      });
    }

    console.log(`Found ${pendingReminders.length} reminders to send`);

    const results = await Promise.allSettled(
      pendingReminders.map(async (reminder) => {
        try {
          // Send SMS reminder
          const smsResponse = await fetch(
            `${process.env.NEXTAUTH_URL}/api/notifications/sms`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "pickup_reminder",
                order: {
                  id: reminder.orderId,
                  orderNumber: reminder.orderNumber,
                  customerName: reminder.customerName,
                  pickupDate: reminder.pickupDate,
                  pickupTime: reminder.pickupTime,
                  totalAmount: 0 // Not needed for reminder
                },
                to: reminder.customerPhone,
              }),
            }
          );

          if (smsResponse.ok) {
            // Mark reminder as sent
            await prisma.scheduledReminder.update({
              where: { id: reminder.id },
              data: {
                status: "sent",
                sentAt: new Date()
              }
            });

            console.log(`✅ Reminder sent successfully for order ${reminder.orderNumber}`);
            return { 
              success: true, 
              reminderId: reminder.id, 
              orderNumber: reminder.orderNumber 
            };
          } else {
            throw new Error(`SMS API returned ${smsResponse.status}`);
          }

        } catch (error) {
          console.error(`❌ Failed to send reminder for order ${reminder.orderNumber}:`, error);

          // Mark reminder as failed
          await prisma.scheduledReminder.update({
            where: { id: reminder.id },
            data: {
              status: "failed",
              sentAt: new Date()
            }
          });

          return { 
            success: false, 
            reminderId: reminder.id, 
            orderNumber: reminder.orderNumber,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    // Count successes and failures
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;

    console.log(`🎯 Reminder job completed: ${successful} sent, ${failed} failed`);

    return NextResponse.json({
      success: true,
      processed: pendingReminders.length,
      successful,
      failed,
      results: results.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: 'Promise rejected' })
    });

  } catch (error) {
    console.error("❌ Cron job error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Cron job failed"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // GET endpoint for manual testing
  return NextResponse.json({
    message: "Reminder cron job endpoint",
    usage: "Send POST request to trigger reminder sending",
    status: "ready"
  });
}