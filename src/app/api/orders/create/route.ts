import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { useSpecialCode, isFirstTimeCustomer } from "@/lib/payment-utils";
import { sendAllOrderNotifications } from "@/lib/order-notifications";
import { generateOrderNumber } from "@/lib/order-utils";

interface CreateOrderRequest {
  customerName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  pickupDate: string;
  pickupTime: string;
  paymentMethod: "onsite" | "online";
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
      firstName,
      lastName,
      email,
      phone,
      pickupDate,
      pickupTime,
      paymentMethod,
      specialCode,
      items,
    } = body;

    // For online payments, use the checkout API instead
    if (paymentMethod === "online") {
      return NextResponse.json(
        { error: "Pour les paiements en ligne, utilisez l'API checkout" },
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

    // Check if user is first-time customer for pre-authorization requirement
    const isFirstTime = await isFirstTimeCustomer(session.user.id);
    const requiresPreAuth = isFirstTime && !specialCodeUsed;

    // Generate human-readable order number
    const orderNumber = await generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        customerName,
        firstName,
        lastName,
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
        // Pre-authorization fields
        requiresPreAuth,
        preAuthStatus: requiresPreAuth ? "pending" : null,
        preAuthAmount: requiresPreAuth ? totalAmount : null,
        preAuthExpiresAt: requiresPreAuth ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null, // 7 days from now
      },
    });

    try {
      await sendAllOrderNotifications(order);
      console.log("Notifications sent successfully for on-site order");
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

