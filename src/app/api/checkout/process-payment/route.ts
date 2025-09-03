import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { useSpecialCode } from "@/lib/payment-utils";
import { sendAllOrderNotifications, sendCustomerNotificationsOnly, sendMailNotificationsOnly } from "@/lib/order-notifications";
import { generateOrderNumber } from "@/lib/order-utils";

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

    // Generate human-readable order number
    const orderNumber = await generateOrderNumber();

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
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
      // await sendAllOrderNotifications(order);
      await sendMailNotificationsOnly(order);
    } catch (notificationError) {
      console.error("Notification error:", notificationError);
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

