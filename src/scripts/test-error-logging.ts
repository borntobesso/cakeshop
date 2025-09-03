/**
 * Test script for error logging system
 * Run with: npx tsx src/scripts/test-error-logging.ts
 */

import { getErrorLogger, logPrintError } from '@/lib/error-logger';

// Mock order data for testing
const MOCK_ORDERS = [
  {
    id: "test_order_logging_001",
    orderNumber: "020925-001",
    customerName: "Alice Dupont",
    customerPhone: "+33123456789",
    customerEmail: "alice@example.com",
    pickupDate: new Date(),
    pickupTime: "14:30",
    totalAmount: 35.50,
    paymentMethod: "online",
    items: [
      { name: "Tarte aux Fraises", size: "Large", quantity: 1, price: 25.50 },
      { name: "Éclair Chocolat", quantity: 2, price: 5.00 }
    ]
  },
  {
    id: "test_order_logging_002", 
    orderNumber: "020925-002",
    customerName: "Bob Martin",
    customerPhone: "+33987654321",
    customerEmail: "bob@example.com",
    pickupDate: new Date(),
    pickupTime: "16:00",
    totalAmount: 18.00,
    paymentMethod: "onsite",
    items: [
      { name: "Croissant aux Amandes", quantity: 3, price: 6.00 }
    ]
  }
];

async function testErrorLogging() {
  console.log("🧪 Testing Error Logging System");
  console.log("=" .repeat(50));
  
  const logger = getErrorLogger();

  // Test 1: Log a critical error
  console.log("\n1. Testing Critical Error Logging");
  console.log("-".repeat(30));
  
  const criticalLogId = await logPrintError(
    MOCK_ORDERS[0],
    "Printer is offline - cannot reach printer at IP address",
    'critical',
    {
      printAttempts: 6,
      successfulPrints: 0,
      failedPrints: 2,
      retryCount: 4,
      printerApiResponse: { 
        error: "Connection timeout", 
        printer_status: "offline",
        document_printed: 0 
      },
      httpStatus: 500
    }
  );
  
  console.log(`✅ Critical error logged with ID: ${criticalLogId}`);

  // Test 2: Log a warning error
  console.log("\n2. Testing Warning Error Logging");
  console.log("-".repeat(30));
  
  const warningLogId = await logPrintError(
    MOCK_ORDERS[1],
    "Only 1 of 2 receipts printed successfully",
    'warning',
    {
      printAttempts: 3,
      successfulPrints: 1,
      failedPrints: 1,
      retryCount: 1,
      printerApiResponse: { 
        document_printed: 1,
        printer_status: "online",
        warning: "Paper low" 
      },
      httpStatus: 200
    }
  );
  
  console.log(`⚠️ Warning error logged with ID: ${warningLogId}`);

  // Test 3: Retrieve logs
  console.log("\n3. Testing Log Retrieval");
  console.log("-".repeat(30));
  
  const allLogs = logger.getLogs();
  console.log(`📋 Total logs in system: ${allLogs.length}`);
  
  const criticalLogs = logger.getLogs({ severity: 'critical', limit: 5 });
  console.log(`🚨 Critical logs: ${criticalLogs.length}`);
  
  const warningLogs = logger.getLogs({ severity: 'warning', limit: 5 });
  console.log(`⚠️ Warning logs: ${warningLogs.length}`);

  // Test 4: Get statistics
  console.log("\n4. Testing Error Statistics");
  console.log("-".repeat(30));
  
  const stats = logger.getErrorStats();
  console.log(`📊 Error Statistics:`);
  console.log(`   Total errors: ${stats.totalErrors}`);
  console.log(`   Critical: ${stats.criticalErrors}`);
  console.log(`   Warnings: ${stats.warningErrors}`);
  console.log(`   Errors/hour: ${stats.errorsPerHour.toFixed(2)}`);
  console.log(`   Affected orders: ${stats.affectedOrders}`);
  console.log(`   Most common errors:`);
  stats.commonErrors.forEach((error, index) => {
    console.log(`     ${index + 1}. "${error.error}" (${error.count}x)`);
  });

  // Test 5: Mark error as resolved
  console.log("\n5. Testing Error Resolution");
  console.log("-".repeat(30));
  
  const resolved = logger.markResolved(
    criticalLogId,
    "Printer was restarted and IP connectivity restored. Issue resolved.",
    "admin_test"
  );
  
  if (resolved) {
    console.log(`✅ Error ${criticalLogId} marked as resolved`);
  } else {
    console.log(`❌ Failed to resolve error ${criticalLogId}`);
  }

  // Test 6: Export functionality
  console.log("\n6. Testing Log Export");
  console.log("-".repeat(30));
  
  // JSON export (sample)
  const jsonExport = logger.exportLogs('json');
  console.log(`📄 JSON export size: ${jsonExport.length} characters`);
  console.log(`📄 JSON export preview: ${jsonExport.substring(0, 100)}...`);
  
  // CSV export (sample)
  const csvExport = logger.exportLogs('csv');
  const csvLines = csvExport.split('\n');
  console.log(`📊 CSV export: ${csvLines.length - 1} data rows + 1 header`);
  console.log(`📊 CSV header: ${csvLines[0]}`);
  if (csvLines.length > 1) {
    console.log(`📊 CSV sample: ${csvLines[1]}`);
  }

  // Test 7: Filter by order ID
  console.log("\n7. Testing Order-Specific Filtering");
  console.log("-".repeat(30));
  
  const orderLogs = logger.getLogs({ orderId: MOCK_ORDERS[0].id });
  console.log(`🔍 Logs for order ${MOCK_ORDERS[0].orderNumber}: ${orderLogs.length}`);
  
  if (orderLogs.length > 0) {
    const orderLog = orderLogs[0];
    console.log(`   Customer: ${orderLog.orderContext.customerName}`);
    console.log(`   Error: ${orderLog.errorMessage}`);
    console.log(`   Attempts: ${orderLog.technicalDetails.printAttempts}`);
    console.log(`   Resolved: ${orderLog.resolution?.resolved ? 'Yes' : 'No'}`);
  }

  console.log("\n" + "=".repeat(50));
  console.log("🎉 Error Logging System Test Complete!");
}

// Run tests if this file is executed directly
if (require.main === module) {
  testErrorLogging().catch(error => {
    console.error("Test execution error:", error);
    process.exit(1);
  });
}

export { testErrorLogging };