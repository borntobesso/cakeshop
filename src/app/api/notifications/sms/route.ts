import { NextResponse } from "next/server";
import { Twilio } from "twilio";

// Twilio configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const client = TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN 
  ? new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  : null;

interface SMSRequest {
  type: "new_order" | "pickup_reminder" | "print_failure";
  order: any;
  to: string;
  error?: string;
}

function formatOrderSMS(order: any, type: string, error?: string): string {
  const pickupDate = new Date(order.pickupDate).toLocaleDateString('fr-FR');
  
  switch (type) {
    case "new_order":
      // 상품명 축약 (최대 25자까지만)
      const itemSummary = order.items.map((item: any) => {
        const name = item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name;
        return `${name}${item.quantity > 1 ? ` x${item.quantity}` : ''}`;
      }).join(', ').substring(0, 80); // 전체 최대 80자

      return `NOUVELLE COMMANDE
${order.customerName} - ${order.totalAmount}€
${pickupDate} ${order.pickupTime}
${itemSummary}
Tel: ${order.customerPhone}
#${order.orderNumber || order.id.slice(-8)}`;

    case "pickup_reminder":
      return `RAPPEL: Votre commande #${order.orderNumber || order.id.slice(-8)}
Retrait demain ${pickupDate} ${order.pickupTime}
Fu Patisserie, 101 Ave Choisy
Total: ${order.totalAmount}€`;

    case "print_failure":
      return `⚠️ ERREUR IMPRESSION

Commande: ${order.customerName}
Total: ${order.totalAmount}€
Retrait: ${pickupDate} à ${order.pickupTime}
ID: ${order.id.slice(-8)}

Erreur: ${error || 'Erreur inconnue'}

Veuillez vérifier l'imprimante.`;

    default:
      return `Notification: ${JSON.stringify(order)}`;
  }
}

export async function POST(request: Request) {
  try {
    if (!client || !TWILIO_PHONE_NUMBER) {
      console.error("Twilio configuration missing");
      return NextResponse.json(
        { success: false, error: "SMS service not configured" },
        { status: 500 }
      );
    }

    const body: SMSRequest = await request.json();
    const { type, order, to, error } = body;

    if (!to) {
      return NextResponse.json(
        { success: false, error: "Recipient phone number required" },
        { status: 400 }
      );
    }

    const message = formatOrderSMS(order, type, error);

    const result = await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: to,
    });

    console.log(`SMS sent successfully: ${result.sid}`);

    return NextResponse.json({
      success: true,
      messageSid: result.sid,
      status: result.status
    });

  } catch (error) {
    console.error("SMS sending error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "SMS sending failed"
      },
      { status: 500 }
    );
  }
}