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

    // Create a PaymentIntent with manual capture for pre-authorization
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'eur',
      capture_method: 'manual', // This is key for pre-authorization
      payment_method_types: ['card'],
      metadata: {
        orderId: orderId,
        type: 'preauthorization'
      },
      receipt_email: customerEmail,
      description: `Pré-autorisation pour commande - ${customerName}`,
    });

    // Update the order with pre-authorization details
    await prisma.order.update({
      where: { id: orderId },
      data: {
        requiresPreAuth: true,
        preAuthStatus: 'pending',
        stripePaymentIntent: paymentIntent.id,
        preAuthAmount: amount,
        preAuthExpiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), // 7 days from now
      }
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error("Pre-authorization creation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la pré-autorisation" },
      { status: 500 }
    );
  }
}