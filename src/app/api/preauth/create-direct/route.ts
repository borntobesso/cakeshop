import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { isFirstTimeCustomer } from "@/lib/payment-utils";

interface CreateDirectPreAuthRequest {
  customerInfo: {
    firstName: string;
    lastName: string;
    customerName: string;
    email: string;
    phone: string;
    pickupDate: string;
    pickupTime: string;
  };
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
  }>;
  amount: number;
  specialCode?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body: CreateDirectPreAuthRequest = await request.json();
    const { customerInfo, items, amount, specialCode } = body;

    // Verify user is actually first-time customer
    const isFirstTime = await isFirstTimeCustomer(session.user.id);
    if (!isFirstTime) {
      return NextResponse.json(
        { error: "La pré-autorisation n'est requise que pour les nouveaux clients" },
        { status: 400 }
      );
    }

    // Create Stripe checkout session for pre-authorization
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "setup", // Setup mode for pre-authorization
      payment_method_types: ["card"],
      customer_email: customerInfo.email,
      success_url: `${process.env.NEXTAUTH_URL}/preauth/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/panier`,
      metadata: {
        // Store all order data in metadata for later order creation
        userId: session.user.id,
        type: "preauth_direct",
        customerName: customerInfo.customerName,
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone,
        pickupDate: customerInfo.pickupDate,
        pickupTime: customerInfo.pickupTime,
        amount: amount.toString(),
        items: JSON.stringify(items),
        specialCode: specialCode || "",
      },
    });

    return NextResponse.json({
      sessionId: stripeSession.id,
      url: stripeSession.url,
    });

  } catch (error) {
    console.error("Direct pre-authorization creation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la pré-autorisation" },
      { status: 500 }
    );
  }
}