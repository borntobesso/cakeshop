import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// This endpoint is for releasing (canceling) a pre-authorization when customer pays with cash/different method
export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

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
        { error: "La pré-autorisation n'est pas dans un état annulable" },
        { status: 400 }
      );
    }

    // Cancel the PaymentIntent to release the pre-authorization
    const paymentIntent = await stripe.paymentIntents.cancel(order.stripePaymentIntent);

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        preAuthStatus: 'released',
        paymentStatus: 'paid' // Customer paid by other means (cash, etc.)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Pré-autorisation libérée avec succès',
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status
      }
    });

  } catch (error) {
    console.error("Pre-authorization release error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la libération de la pré-autorisation" },
      { status: 500 }
    );
  }
}