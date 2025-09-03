import { NextResponse } from "next/server";

/**
 * Test endpoint for print failure scenarios
 * This simulates different printer failure conditions to test error handling
 */

interface TestScenario {
  name: string;
  description: string;
  mockResponse: any;
  httpStatus?: number;
}

const TEST_SCENARIOS: TestScenario[] = [
  {
    name: "success",
    description: "Successful print",
    mockResponse: {
      document_printed: 1,
      printer_status: "online",
      message: "Document printed successfully"
    }
  },
  {
    name: "print_failed",
    description: "Print failed - document_printed: 0",
    mockResponse: {
      document_printed: 0,
      printer_status: "online",
      message: "Print job failed"
    }
  },
  {
    name: "printer_offline",
    description: "Printer is offline",
    mockResponse: {
      document_printed: 0,
      printer_status: "offline",
      message: "Printer is not responding"
    }
  },
  {
    name: "no_paper",
    description: "Printer out of paper",
    mockResponse: {
      document_printed: 0,
      printer_status: "no_paper",
      message: "Printer out of paper"
    }
  },
  {
    name: "connection_timeout",
    description: "Connection timeout",
    mockResponse: {
      document_printed: 0,
      timeout: true,
      message: "Connection timeout"
    }
  },
  {
    name: "api_error",
    description: "API returns error message",
    mockResponse: {
      error: "Printer API error: Network unreachable",
      message: "Internal server error"
    }
  },
  {
    name: "http_error",
    description: "HTTP error response",
    mockResponse: {
      message: "Internal Server Error"
    },
    httpStatus: 500
  },
  {
    name: "malformed_response",
    description: "Malformed response (missing document_printed)",
    mockResponse: {
      printer_status: "online",
      message: "Response missing key fields"
    }
  }
];

// Mock order for testing
const MOCK_ORDER = {
  id: "test_order_123",
  orderNumber: "010925-001",
  customerName: "Test Customer",
  customerEmail: "test@example.com",
  customerPhone: "+33123456789",
  pickupDate: new Date(),
  pickupTime: "14:30",
  totalAmount: 25.50,
  paymentMethod: "online",
  items: [
    {
      name: "Tarte aux Fraises",
      size: "Medium",
      quantity: 1,
      price: 15.50
    },
    {
      name: "Éclair Chocolat",
      quantity: 2,
      price: 5.00
    }
  ]
};

export async function GET() {
  return NextResponse.json({
    message: "Print Failure Test Endpoint",
    availableScenarios: TEST_SCENARIOS.map(s => ({
      name: s.name,
      description: s.description
    })),
    usage: "POST to this endpoint with { scenario: 'scenario_name' } to test different failure modes"
  });
}

export async function POST(request: Request) {
  try {
    const { scenario, testFullFlow } = await request.json();

    if (!scenario) {
      return NextResponse.json(
        { error: "Scenario parameter required" },
        { status: 400 }
      );
    }

    const testScenario = TEST_SCENARIOS.find(s => s.name === scenario);
    if (!testScenario) {
      return NextResponse.json(
        { 
          error: "Invalid scenario",
          availableScenarios: TEST_SCENARIOS.map(s => s.name)
        },
        { status: 400 }
      );
    }

    console.log(`🧪 Testing print failure scenario: ${testScenario.name}`);
    console.log(`📝 Description: ${testScenario.description}`);

    if (testFullFlow) {
      // Test the full notification flow with mocked printer response
      return await testFullNotificationFlow(testScenario);
    } else {
      // Just return the mock response for manual testing
      const response = testScenario.httpStatus 
        ? NextResponse.json(testScenario.mockResponse, { status: testScenario.httpStatus })
        : NextResponse.json(testScenario.mockResponse);

      console.log(`📤 Mock response:`, testScenario.mockResponse);
      return response;
    }

  } catch (error) {
    console.error("Test endpoint error:", error);
    return NextResponse.json(
      { error: "Test execution failed" },
      { status: 500 }
    );
  }
}

/**
 * Test the full notification flow with a mocked printer response
 */
async function testFullNotificationFlow(testScenario: TestScenario) {
  try {
    // Import the validation function to test it directly
    const { validatePrintResult } = await import('@/app/api/print/order/route');
    
    console.log(`🔍 Testing validation with mock response:`, testScenario.mockResponse);
    
    // Test our validation function directly
    const validationResult = validatePrintResult(testScenario.mockResponse);
    console.log(`✅ Validation result:`, validationResult);

    // Simulate what would happen in the print flow
    if (!validationResult.success) {
      console.log(`❌ Print would fail with error: ${validationResult.error}`);
      
      // Test sending notification (in development mode)
      if (process.env.NODE_ENV === 'development') {
        console.log(`📱 Would send print failure notification:`, {
          order: MOCK_ORDER,
          error: validationResult.error,
          severity: 'critical'
        });
      }
    } else {
      console.log(`✅ Print would succeed`);
    }

    return NextResponse.json({
      scenario: testScenario.name,
      description: testScenario.description,
      mockResponse: testScenario.mockResponse,
      validationResult,
      testOrder: MOCK_ORDER,
      fullFlowTested: true
    });

  } catch (error) {
    console.error("Full flow test error:", error);
    return NextResponse.json(
      { 
        error: "Full flow test failed", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}