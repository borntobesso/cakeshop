/**
 * Test script for print failure detection
 * Run with: npx tsx src/scripts/test-print-failures.ts
 */

// Import the validation function
import { validatePrintResult } from '@/app/api/print/order/route';

interface TestCase {
  name: string;
  description: string;
  mockResponse: any;
  expectedSuccess: boolean;
  expectedErrorPattern?: string;
}

const TEST_CASES: TestCase[] = [
  {
    name: "Successful Print",
    description: "Normal successful print response",
    mockResponse: {
      document_printed: 1,
      printer_status: "online",
      message: "Document printed successfully"
    },
    expectedSuccess: true
  },
  {
    name: "Print Failed - document_printed: 0",
    description: "Print job failed",
    mockResponse: {
      document_printed: 0,
      printer_status: "online"
    },
    expectedSuccess: false,
    expectedErrorPattern: "failed to print document"
  },
  {
    name: "Printer Offline",
    description: "Printer is offline",
    mockResponse: {
      document_printed: 0,
      printer_status: "offline"
    },
    expectedSuccess: false,
    expectedErrorPattern: "offline"
  },
  {
    name: "Printer Out of Paper",
    description: "Printer out of paper",
    mockResponse: {
      document_printed: 0,
      printer_status: "no_paper"
    },
    expectedSuccess: false,
    expectedErrorPattern: "out of paper"
  },
  {
    name: "Connection Timeout",
    description: "Connection timeout",
    mockResponse: {
      timeout: true,
      connection_failed: false
    },
    expectedSuccess: false,
    expectedErrorPattern: "timeout"
  },
  {
    name: "Connection Failed",
    description: "Connection failed",
    mockResponse: {
      connection_failed: true
    },
    expectedSuccess: false,
    expectedErrorPattern: "connection failed"
  },
  {
    name: "API Error",
    description: "Printer API returns error",
    mockResponse: {
      error: "Printer API error: Network unreachable"
    },
    expectedSuccess: false,
    expectedErrorPattern: "Printer API error"
  },
  {
    name: "No Response",
    description: "Null/undefined response",
    mockResponse: null,
    expectedSuccess: false,
    expectedErrorPattern: "No response"
  },
  {
    name: "Empty Response",
    description: "Empty object response",
    mockResponse: {},
    expectedSuccess: true // Should assume success if no explicit failure
  },
  {
    name: "Missing document_printed Field",
    description: "Response missing document_printed field",
    mockResponse: {
      printer_status: "online",
      message: "Success"
    },
    expectedSuccess: true // Should assume success and warn
  },
  {
    name: "False document_printed",
    description: "document_printed is false",
    mockResponse: {
      document_printed: false
    },
    expectedSuccess: false,
    expectedErrorPattern: "document_printed = false"
  }
];

function runTests() {
  console.log("🧪 Running Print Failure Detection Tests");
  console.log("=" .repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  TEST_CASES.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.name}`);
    console.log(`   ${testCase.description}`);
    
    try {
      const result = validatePrintResult(testCase.mockResponse);
      
      // Check if success/failure matches expectation
      const successMatches = result.success === testCase.expectedSuccess;
      
      // Check if error message contains expected pattern (when failure is expected)
      let errorPatternMatches = true;
      if (!testCase.expectedSuccess && testCase.expectedErrorPattern) {
        errorPatternMatches = result.error?.toLowerCase().includes(testCase.expectedErrorPattern.toLowerCase()) ?? false;
      }
      
      if (successMatches && errorPatternMatches) {
        console.log(`   ✅ PASS`);
        if (result.error) {
          console.log(`   📄 Error: ${result.error}`);
        }
        passed++;
      } else {
        console.log(`   ❌ FAIL`);
        console.log(`   Expected success: ${testCase.expectedSuccess}, Got: ${result.success}`);
        if (testCase.expectedErrorPattern) {
          console.log(`   Expected error pattern: "${testCase.expectedErrorPattern}"`);
        }
        console.log(`   Actual error: ${result.error || 'none'}`);
        failed++;
      }
      
    } catch (error) {
      console.log(`   💥 ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      failed++;
    }
  });
  
  console.log("\n" + "=".repeat(50));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log("🎉 All tests passed!");
  } else {
    console.log("⚠️  Some tests failed. Please review the validation logic.");
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

export { runTests, TEST_CASES };