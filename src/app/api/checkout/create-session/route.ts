import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { stripe } from "@/lib/stripe";

interface CheckoutRequest {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
  }>;
  customerInfo: {
    customerName: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    pickupDate: string;
    pickupTime: string;
  };
  specialCode?: string;
  paymentMethod: "online" | "onsite";
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

    const body: CheckoutRequest = await request.json();
    const { items, customerInfo, specialCode, paymentMethod } = body;

    // If onsite payment, error
    if (paymentMethod !== "online") {
      return NextResponse.json(
        { error: "Cette API est uniquement pour les paiements en ligne" },
        { status: 400 }
      );
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create Stripe line items
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name,
          description: item.size ? `Taille: ${item.size}` : undefined,
        },
        unit_amount: Math.round(item.price * 100), // convert in centimes
      },
      quantity: item.quantity,
    }));

    // Prepare order metadata (saved in Stripe)
    const metadata = {
      userId: session.user.id,
      customerName: customerInfo.customerName,
      firstName: customerInfo.firstName,
      lastName: customerInfo.lastName,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      pickupDate: customerInfo.pickupDate,
      pickupTime: customerInfo.pickupTime,
      specialCode: specialCode || "",
      items: JSON.stringify(items),
      totalAmount: totalAmount.toString(),
    };

    // Create Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/checkout/cancel`,
      customer_email: customerInfo.email,
      metadata,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // expires in 30 minutes
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Error creating checkout session: ", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la session de paiement" },
      { status: 500 }
    );
  }
}
