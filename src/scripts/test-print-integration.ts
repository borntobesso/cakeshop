/**
 * Integration test for print failure handling
 * Tests the full notification flow including retries
 * Run with: npx tsx src/scripts/test-print-integration.ts
 */

// Mock order for testing
const MOCK_ORDER = {
  id: "test_order_integration_123",
  orderNumber: "010925-999",
  customerName: "Test Integration Customer",
  customerEmail: "test.integration@example.com",
  customerPhone: "+33123456789",
  pickupDate: new Date(),
  pickupTime: "14:30",
  totalAmount: 25.50,
  paymentMethod: "online" as const,
  items: [
    {
      name: "Test Tarte aux Fraises",
      size: "Medium",
      quantity: 1,
      price: 15.50
    },
    {
      name: "Test Éclair Chocolat",
      quantity: 2,
      price: 5.00
    }
  ]
};

/**
 * Mock the fetch function to simulate different print API responses
 */
function createMockFetch(scenario: 'success' | 'partial_failure' | 'complete_failure') {
  let callCount = 0;
  
  return async (url: string, options?: any): Promise<Response> => {
    callCount++;
    console.log(`📡 Mock API call ${callCount} to ${url}`);
    
    // Mock the print API endpoint
    if (url.includes('/api/print/order')) {
      let mockResponse: any;
      let status = 200;
      
      switch (scenario) {
        case 'success':
          mockResponse = { success: true, document_printed: 1, message: "Print successful" };
          break;
          
        case 'partial_failure':
          // First call fails, second succeeds
          if (callCount === 1) {
            mockResponse = { success: false, document_printed: 0, message: "Printer temporarily unavailable" };
            status = 200; // API responds but print fails
          } else {
            mockResponse = { success: true, document_printed: 1, message: "Print successful on retry" };
          }
          break;
          
        case 'complete_failure':
          mockResponse = { success: false, document_printed: 0, printer_status: "offline", message: "Printer offline" };
          break;
      }
      
      return Promise.resolve({
        ok: status === 200,
        status,
        json: () => Promise.resolve(mockResponse),
        text: () => Promise.resolve(JSON.stringify(mockResponse))
      } as Response);
    }
    
    // Mock notification endpoints (just return success)
    if (url.includes('/api/notifications/')) {
      console.log(`📧 Mock notification sent to ${url}`);
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, message: "Notification sent" }),
        text: () => Promise.resolve('{"success": true}')
      } as Response);
    }
    
    // Default mock response
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve('{}')
    } as Response);
  };
}

/**
 * Test the print notification with different failure scenarios
 */
async function testPrintNotificationFlow(scenario: 'success' | 'partial_failure' | 'complete_failure') {
  console.log(`\n🧪 Testing scenario: ${scenario.toUpperCase()}`);
  console.log("-".repeat(40));
  
  // Define expected behavior for each scenario
  const expectedToSucceed = scenario !== 'complete_failure';
  
  // Mock fetch globally
  const originalFetch = global.fetch;
  global.fetch = createMockFetch(scenario) as any;
  
  try {
    // Import the notification function
    const { sendAllOrderNotifications } = await import('@/lib/order-notifications');
    
    const startTime = Date.now();
    
    // Test with print enabled for this specific test
    const testOptions = {
      sendCustomerEmail: false, // Disable emails for test
      sendShopEmail: false,
      sendShopSMS: false,
      printReceipts: true,      // Enable print for testing
      scheduleReminder: false
    };
    
    console.log(`📄 Starting print notification test with options:`, testOptions);
    console.log(`🎯 Expected to ${expectedToSucceed ? 'succeed' : 'fail (throw error)'}`);
    
    try {
      await sendAllOrderNotifications(MOCK_ORDER, testOptions);
      
      const duration = Date.now() - startTime;
      
      if (expectedToSucceed) {
        console.log(`✅ Scenario completed successfully in ${duration}ms (as expected)`);
        return { success: true, duration, scenario };
      } else {
        console.log(`❌ Scenario unexpectedly succeeded in ${duration}ms (should have failed)`);
        return { 
          success: false, 
          duration, 
          scenario,
          error: "Expected failure but function succeeded"
        };
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (expectedToSucceed) {
        console.log(`❌ Scenario unexpectedly failed after ${duration}ms: ${errorMessage}`);
        return { 
          success: false, 
          duration, 
          scenario,
          error: errorMessage
        };
      } else {
        console.log(`✅ Scenario correctly failed after ${duration}ms: ${errorMessage} (as expected)`);
        return { success: true, duration, scenario };
      }
    }
    
  } catch (importError) {
    console.log(`💥 Failed to import notification module: ${importError instanceof Error ? importError.message : 'Unknown error'}`);
    return { 
      success: false, 
      scenario,
      error: `Import failed: ${importError instanceof Error ? importError.message : 'Unknown error'}`
    };
  } finally {
    // Restore original fetch
    global.fetch = originalFetch;
  }
}

async function runIntegrationTests() {
  console.log("🧪 Running Print Integration Tests");
  console.log("=" .repeat(50));
  console.log(`📦 Mock Order: ${MOCK_ORDER.customerName} - ${MOCK_ORDER.totalAmount}€`);
  console.log(`🏷️  Order #${MOCK_ORDER.orderNumber}`);
  
  const scenarios: ('success' | 'partial_failure' | 'complete_failure')[] = [
    'success',
    'partial_failure', 
    'complete_failure'
  ];
  
  const results = [];
  
  for (const scenario of scenarios) {
    const result = await testPrintNotificationFlow(scenario);
    results.push(result);
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log("\n" + "=".repeat(50));
  console.log("📊 Integration Test Results:");
  
  results.forEach((result, index) => {
    const icon = result.success ? "✅" : "❌";
    console.log(`${icon} ${result.scenario}: ${result.success ? 'PASSED' : 'FAILED'}${result.duration ? ` (${result.duration}ms)` : ''}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\n🎯 Summary: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log("🎉 All integration tests passed!");
  } else {
    console.log("⚠️  Some integration tests failed.");
    process.exit(1);
  }
}

// Test retry timing function
async function testRetryTiming() {
  console.log("\n⏱️  Testing Retry Timing");
  console.log("-".repeat(30));
  
  const RETRY_DELAY = 2000;
  const MAX_RETRIES = 3;
  
  console.log(`📋 Configuration: ${MAX_RETRIES} retries with ${RETRY_DELAY}ms delay`);
  
  const startTime = Date.now();
  
  // Simulate the retry loop timing
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const attemptStart = Date.now();
    console.log(`🔄 Attempt ${attempt}/${MAX_RETRIES} at ${attemptStart - startTime}ms`);
    
    // Simulate failure and delay (except on last attempt)
    if (attempt < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  
  const totalTime = Date.now() - startTime;
  const expectedTime = (MAX_RETRIES - 1) * RETRY_DELAY;
  
  console.log(`⏱️  Total time: ${totalTime}ms (expected: ~${expectedTime}ms)`);
  console.log(`✅ Retry timing test completed`);
}

// Run tests if this file is executed directly
if (require.main === module) {
  (async () => {
    try {
      await runIntegrationTests();
      await testRetryTiming();
    } catch (error) {
      console.error("Test execution error:", error);
      process.exit(1);
    }
  })();
}

export { runIntegrationTests, testRetryTiming };