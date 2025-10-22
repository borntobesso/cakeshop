import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, customerEmail, customerName } = await request.json();

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: "orderId and amount are required" },
        { status: 400 }
      );
    }

    // Verify the order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Commande introuvable" },
        { status: 404 }
      );
    }

    // Create Stripe Checkout session for pre-authorization
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "setup", // Use setup mode for pre-authorization instead of payment
      setup_intent_data: {
        metadata: {
          orderId: orderId,
          type: 'preauthorization',
          amount: (amount * 100).toString(), // Store amount in cents as metadata
        }
      },
      success_url: `${process.env.NEXTAUTH_URL}/preauth/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/panier?preauth=cancelled`,
      customer_email: customerEmail,
      metadata: {
        orderId: orderId,
        customerName: customerName,
        amount: amount.toString(),
        type: 'preauthorization'
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // expires in 30 minutes
    });

    // Update the order with pre-authorization details
    await prisma.order.update({
      where: { id: orderId },
      data: {
        requiresPreAuth: true,
        preAuthStatus: 'pending',
        preAuthAmount: amount,
        preAuthExpiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), // 7 days from now
      }
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });

  } catch (error) {
    console.error("Pre-authorization session creation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la session de pré-autorisation" },
      { status: 500 }
    );
  }
}