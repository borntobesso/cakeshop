import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// This endpoint is for the shop owner to capture the payment when customer pays with the pre-authorized card
export async function POST(request: NextRequest) {
  try {
    const { orderId, captureAmount } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );
    }

    // Find the order with pre-authorization
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || !order.stripePaymentIntent) {
      return NextResponse.json(
        { error: "Commande ou pré-autorisation introuvable" },
        { status: 404 }
      );
    }

    if (order.preAuthStatus !== 'authorized') {
      return NextResponse.json(
        { error: "La pré-autorisation n'est pas dans un état capturable" },
        { status: 400 }
      );
    }

    // Capture the payment
    const paymentIntent = await stripe.paymentIntents.capture(
      order.stripePaymentIntent,
      {
        amount_to_capture: captureAmount ? Math.round(captureAmount * 100) : undefined
      }
    );

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'paid',
        preAuthStatus: 'captured'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Paiement capturé avec succès',
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100
      }
    });

  } catch (error) {
    console.error("Payment capture error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la capture du paiement" },
      { status: 500 }
    );
  }
}