import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { useSpecialCode } from "@/lib/payment-utils";

interface CreateOrderRequest {
  customerName: string;
  email: string;
  phone: string;
  pickupDate: string;
  pickupTime: string;
  paymentMethod: "onsite";
  specialCode?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
  }>;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body: CreateOrderRequest = await request.json();
    const {
      customerName,
      email,
      phone,
      pickupDate,
      pickupTime,
      paymentMethod,
      specialCode,
      items,
    } = body;

    if (paymentMethod !== "onsite") {
      return NextResponse.json(
        { error: "Cette API est uniquement pour les paiements sur place" },
        { status: 400 }
      );
    }

    let specialCodeUsed = false;
    if (specialCode) {
      specialCodeUsed = await useSpecialCode(specialCode);
      if (!specialCodeUsed) {
        return NextResponse.json(
          { error: "Code spécial invalide ou expiré" },
          { status: 400 }
        );
      }
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        customerName,
        customerEmail: email,
        customerPhone: phone,
        items,
        totalAmount,
        paymentMethod: "onsite",
        paymentStatus: "pending",
        specialCode: specialCodeUsed ? specialCode : null,
        pickupDate: new Date(pickupDate),
        pickupTime,
        status: "confirmed",
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
      console.error("Notificationerror:", notificationError);
    }

    return NextResponse.json({
      message: "Commande créée avec succès",
      order: {
        id: order.id,
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la commande" },
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
    const pickupDateTime = new Date(
      `${order.pickupDate.toISOString().split("T")[0]}T${order.pickupTime}`
    );
    const reminderTime = new Date(
      pickupDateTime.getTime() - 24 * 60 * 60 * 1000
    ); // 24 hours in advance

    if (reminderTime > new Date()) {
      await fetch(
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
    }
  } catch (error) {
    console.error("Reminder scheduling error:", error);
    throw error;
  }
}
