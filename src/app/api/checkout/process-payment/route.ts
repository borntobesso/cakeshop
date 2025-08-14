import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { useSpecialCode } from "@/lib/payment-utils";

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID requis" }, { status: 400 });
    }

    // Get payment session info from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "payment_intent"],
    });

    // Check if payment was confirmed
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Paiement non confirmé" },
        { status: 400 }
      );
    }

    // Check if the order already confirmed (avoid duplicate processing)
    const existingOrder = await prisma.order.findFirst({
      where: {
        AND: [
          { customerEmail: session.metadata?.customerEmail },
          { totalAmount: parseFloat(session.metadata?.totalAmount || "0") },
          { pickupDate: new Date(session.metadata?.pickupDate || "") },
          { paymentStatus: "paid" },
        ],
      },
    });

    if (existingOrder) {
      return NextResponse.json({
        message: "Commande déjà traitée",
        order: existingOrder,
      });
    }

    // Process special code
    let specialCodeUsed = false;
    const specialCode = session.metadata?.specialCode;

    if (specialCode) {
      specialCodeUsed = await useSpecialCode(specialCode);
      if (!specialCodeUsed) {
        console.warn(`Failed to use special code: ${specialCode}`);
      }
    }

    // Parse order details
    const orderItems = JSON.parse(session.metadata?.items || "[]");
    const totalAmount = parseFloat(session.metadata?.totalAmount || "0");

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: session.metadata?.userId || "",
        customerName: session.metadata?.customerName || "",
        customerEmail: session.metadata?.customerEmail || "",
        customerPhone: session.metadata?.customerPhone || "",
        items: orderItems,
        totalAmount,
        paymentMethod: "online",
        paymentStatus: "paid",
        specialCode: specialCodeUsed ? specialCode : null,
        pickupDate: new Date(session.metadata?.pickupDate || ""),
        pickupTime: session.metadata?.pickupTime || "",
        status: "confirmed",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    try {
      await Promise.all([
        sendOrderConfirmationEmail(order),
        sendShopSMSNotification(order),
        printOrderReceipt(order),
        schedulePickupReminder(order),
      ]);
    } catch (notificationError) {
      console.error("Notificationerror: ", notificationError);
    }

    return NextResponse.json({
      message: "Commande traitée avec succès",
      order: {
        id: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        pickupDate: order.pickupDate,
        pickupTime: order.pickupTime,
        totalAmount: order.totalAmount,
        specialCodeUsed: specialCodeUsed,
      },
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement de la commande" },
      { status: 500 }
    );
  }
}

async function sendOrderConfirmationEmail(order: any) {
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
      throw new Error("Email sending failed");
    }
  } catch (error) {
    console.error("Email notification error:", error);
    throw error;
  }
}

async function sendShopSMSNotification(order: any) {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/notifications/sms`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "new_order",
          order,
          to: process.env.NEXT_PUBLIC_SHOP_PHONE,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("SMS sending failed");
    }
  } catch (error) {
    console.error("SMS notification error:", error);
    throw error;
  }
}

async function printOrderReceipt(order: any) {
  try {
    await Promise.all([
      fetch(`${process.env.NEXTAUTH_URL}/api/print/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      }),
      fetch(`${process.env.NEXTAUTH_URL}/api/print/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      }),
    ]);
  } catch (error) {
    console.error("Print error:", error);

    try {
      await fetch(
        `${process.env.NEXTAUTH_URL}/api/notifications/print-failure`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order, error: (error as any).message }),
        }
      );
    } catch (notifyError) {
      console.error("Print failure notification error:", notifyError);
    }
    
    throw error;
  }
}

async function schedulePickupReminder(order: any) {
  try {
    const pickupDateTime = new Date(`${order.pickupDate.toISOString().split("T")[0]}T${order.pickupTime}`);
    const reminderTime = new Date(pickupDateTime.getTime() - (24 * 60 * 60 * 1000)); // 24 hours in advance
    
    if (reminderTime > new Date()) {
      await fetch(`${process.env.NEXTAUTH_URL}/api/notifications/schedule-reminder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order,
          reminderTime: reminderTime.toISOString()
        })
      });
    }
  } catch (error) {
    console.error("Reminder scheduling error:", error);
    throw error;
  }
}
