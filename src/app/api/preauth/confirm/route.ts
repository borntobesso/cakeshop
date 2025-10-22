import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "paymentIntentId is required" },
        { status: 400 }
      );
    }

    // Retrieve the PaymentIntent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'requires_capture') {
      // Update order status to authorized
      await prisma.order.updateMany({
        where: { stripePaymentIntent: paymentIntentId },
        data: {
          preAuthStatus: 'authorized'
        }
      });

      return NextResponse.json({
        success: true,
        status: 'authorized',
        message: 'Pré-autorisation confirmée avec succès'
      });
    } else if (paymentIntent.status === 'succeeded') {
      // This shouldn't happen with manual capture, but handle it
      await prisma.order.updateMany({
        where: { stripePaymentIntent: paymentIntentId },
        data: {
          preAuthStatus: 'authorized',
          paymentStatus: 'paid'
        }
      });

      return NextResponse.json({
        success: true,
        status: 'paid',
        message: 'Paiement confirmé avec succès'
      });
    } else {
      // Payment failed
      await prisma.order.updateMany({
        where: { stripePaymentIntent: paymentIntentId },
        data: {
          preAuthStatus: 'failed'
        }
      });

      return NextResponse.json({
        success: false,
        status: paymentIntent.status,
        message: 'La pré-autorisation a échoué'
      });
    }

  } catch (error) {
    console.error("Pre-authorization confirmation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la confirmation de la pré-autorisation" },
      { status: 500 }
    );
  }
}