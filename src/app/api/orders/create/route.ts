import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { useSpecialCode } from "@/lib/payment-utils";
import { sendAllOrderNotifications, sendCustomerNotificationsOnly, sendMailNotificationsOnly } from "@/lib/order-notifications";
import { generateOrderNumber } from "@/lib/order-utils";

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

    // Generate human-readable order number
    const orderNumber = await generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
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
      // await sendAllOrderNotifications(order);
      await sendMailNotificationsOnly(order);
    } catch (notificationError) {
      console.error("Notification error:", notificationError);
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

