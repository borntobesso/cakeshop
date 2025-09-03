import { NextResponse } from "next/server";

// Hiboutik API configuration
const HIBOUTIK_API_LOGIN = process.env.NEXT_PUBLIC_HIBOUTIK_API_LOGIN;
const HIBOUTIK_API_KEY = process.env.NEXT_PUBLIC_HIBOUTIK_API_KEY;
const HIBOUTIK_STORE_ID = 1; // Store ID as specified
const STORE_IP_ADDR = process.env.NEXT_PUBLIC_STORE_IP_ADDR;
const HIBOUTIK_PRINTER_PORT = process.env.NEXT_PUBLIC_HIBOUTIK_PRINTER_PORT;

// Use the orderNumber from database instead of generating a random one

/**
 * Validate Hiboutik print API response
 */
function validatePrintResult(printResult: any): { success: boolean; error?: string } {
  // Check if response exists
  if (!printResult) {
    return { success: false, error: "No response from printer API" };
  }

  // Check for explicit success indicators
  if (printResult.document_printed === 1) {
    return { success: true };
  }

  // Check for error messages first
  if (printResult.error) {
    return { success: false, error: `Printer API error: ${printResult.error}` };
  }

  // Check for specific printer status indicators (before generic document_printed check)
  if (printResult.printer_status === "offline") {
    return { success: false, error: "Printer is offline" };
  }

  if (printResult.printer_status === "no_paper") {
    return { success: false, error: "Printer out of paper" };
  }

  // Check for known failure patterns
  if (printResult.document_printed === 0) {
    return { success: false, error: "Printer failed to print document (document_printed: 0)" };
  }

  // Check for network/connection issues
  if (printResult.connection_failed || printResult.timeout) {
    return { success: false, error: "Printer connection failed or timeout" };
  }

  // If document_printed field is missing but no errors, warn but allow
  if (printResult.document_printed === undefined) {
    console.warn("Print result missing document_printed field:", printResult);
    return { success: true }; // Assume success if no explicit failure
  }

  // Any other falsy document_printed value
  if (!printResult.document_printed) {
    return { success: false, error: `Print failed: document_printed = ${printResult.document_printed}` };
  }

  return { success: true };
}

function createPrintContent(order: any): string {
  const pickupDate = new Date(order.pickupDate).toLocaleDateString('fr-FR');
  const orderNumber = order.orderNumber || order.id.slice(-8); // Fallback to ID if orderNumber missing

  return `
<hibou_font_size>2|2
=============================
N° de commande - ${orderNumber}
=============================

<hibou_align_left>
DATE DE RETRAIT:

${pickupDate}
    
${order.pickupTime}

    
CLIENT: ${order.customerName}

Tel: ${order.customerPhone}

Email: ${order.customerEmail}


PRODUITS:
${order.items
  .map((item: any) => 
    `${item.name}${item.size ? ` (${item.size})` : ""}
    
  Qté: ${item.quantity}
  
  Prix: ${(item.price * item.quantity).toFixed(2)}€`
  )
  .join('\n')}

<hibou_font_size>2|1
=========================
<hibou_align_right>
TOTAL: ${order.totalAmount.toFixed(2)} euros
<hibou_align_left>
=========================

Méthode: ${order.paymentMethod === 'online' ? 'PAYÉ EN LIGNE' : 'PAIEMENT SUR PLACE'}
${order.specialCode ? `Code spécial: ${order.specialCode}` : ''}

=========================
`.trim();
}

export async function POST(request: Request) {
  try {
    const order = await request.json();

    if (!HIBOUTIK_API_LOGIN || !HIBOUTIK_API_KEY || !STORE_IP_ADDR) {
      console.error("Hiboutik configuration missing");
      throw new Error("Print service not configured");
    }

    const printContent = createPrintContent(order);
    
    // Create authentication string for Basic Auth
    const auth = Buffer.from(
      `${HIBOUTIK_API_LOGIN}:${HIBOUTIK_API_KEY}`
    ).toString("base64");

    // Send the print request
    const printResponse = await fetch(
      "https://fupatisserie.hiboutik.com/api/print/misc",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          store_id: HIBOUTIK_STORE_ID,
          ip_address: STORE_IP_ADDR,
          port: HIBOUTIK_PRINTER_PORT || "9100",
          data: printContent,
        }),
      }
    );

    const printResult = await printResponse.json();
    
    if (!printResponse.ok) {
      console.error("Print API HTTP error:", printResponse.status, printResult);
      throw new Error(printResult.message || `Print HTTP error: ${printResponse.status}`);
    }

    // 상세한 프린터 상태 검사
    const printStatus = validatePrintResult(printResult);
    if (!printStatus.success) {
      console.error("Print validation failed:", printStatus.error);
      throw new Error(printStatus.error);
    }

    console.log("Print request successful:", printResult);

    return NextResponse.json({
      success: true,
      printResult: printResult,
      orderNumber: order.orderNumber
    });

  } catch (error) {
    console.error("Print error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Print failed"
      },
      { status: 500 }
    );
  }
}