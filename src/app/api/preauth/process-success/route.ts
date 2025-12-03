import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/order-utils";
import { useSpecialCode } from "@/lib/payment-utils";
import { sendMailNotificationsOnly } from "@/lib/order-notifications";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    // Retrieve the Stripe Checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);


    // For setup mode sessions, payment_status should be 'no_payment_required'
    if (session.payment_status !== 'no_payment_required' || !session.setup_intent) {
      console.error("Session validation failed:", {
        payment_status: session.payment_status,
        setup_intent: session.setup_intent,
        expected_payment_status: 'no_payment_required',
        has_setup_intent: !!session.setup_intent
      });
      return NextResponse.json(
        { error: "Session de pré-autorisation invalide" },
        { status: 400 }
      );
    }

    // Retrieve the SetupIntent to get the payment method
    const setupIntent = await stripe.setupIntents.retrieve(session.setup_intent as string);

    if (setupIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: "Pré-autorisation échouée" },
        { status: 400 }
      );
    }

    // Check if order was already created for this session to prevent duplicates
    const existingOrder = await prisma.order.findFirst({
      where: {
        stripePaymentIntent: setupIntent.id
      }
    });

    if (existingOrder) {
      // Order already exists, return existing order
      return NextResponse.json({
        success: true,
        message: 'Pré-autorisation déjà confirmée',
        order: {
          id: existingOrder.id,
          orderNumber: existingOrder.orderNumber,
          pickupDate: existingOrder.pickupDate.toISOString().split('T')[0],
          pickupTime: existingOrder.pickupTime,
          totalAmount: existingOrder.totalAmount,
          preAuthStatus: existingOrder.preAuthStatus
        }
      });
    }

    // Create order from session metadata (since this is always for first-time users)
    const metadata = session.metadata;

    if (!metadata?.userId || !metadata?.items) {
      return NextResponse.json(
        { error: "Données de commande manquantes dans la session" },
        { status: 400 }
      );
    }

    // Handle special code if provided
    let specialCodeUsed = false;
    if (metadata.specialCode) {
      specialCodeUsed = await useSpecialCode(metadata.specialCode);
    }

    // Parse items from metadata
    const items = JSON.parse(metadata.items);
    const totalAmount = parseFloat(metadata.amount);

    // Create the order with retry logic for order number conflicts
    let order;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        // Generate order number
        const orderNumber = await generateOrderNumber();

        // Create the order
        order = await prisma.order.create({
          data: {
            orderNumber,
            userId: metadata.userId,
            customerName: metadata.customerName,
            firstName: metadata.firstName,
            lastName: metadata.lastName,
            customerEmail: metadata.email,
            customerPhone: metadata.phone,
            items,
            totalAmount,
            paymentMethod: "onsite",
            paymentStatus: "pending",
            specialCode: specialCodeUsed ? metadata.specialCode : null,
            pickupDate: new Date(metadata.pickupDate),
            pickupTime: metadata.pickupTime,
            status: "confirmed",
            // Pre-authorization fields
            requiresPreAuth: true,
            preAuthStatus: 'authorized',
            stripePaymentIntent: setupIntent.id,
            preAuthAmount: totalAmount,
            preAuthExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          },
        });
        break; // Success, exit loop
      } catch (error: any) {
        attempts++;

        // Check if it's a duplicate order number error
        if (error.code === 'P2002' && error.meta?.target?.includes('orderNumber')) {
          console.log(`Order number conflict, attempt ${attempts}/${maxAttempts}`);
          if (attempts >= maxAttempts) {
            // Final check: maybe the order was created by another request
            const finalCheck = await prisma.order.findFirst({
              where: {
                stripePaymentIntent: setupIntent.id
              }
            });

            if (finalCheck) {
              return NextResponse.json({
                success: true,
                message: 'Pré-autorisation déjà confirmée',
                order: {
                  id: finalCheck.id,
                  orderNumber: finalCheck.orderNumber,
                  pickupDate: finalCheck.pickupDate.toISOString().split('T')[0],
                  pickupTime: finalCheck.pickupTime,
                  totalAmount: finalCheck.totalAmount,
                  preAuthStatus: finalCheck.preAuthStatus
                }
              });
            }
            throw error; // Re-throw if still failing
          }
          // Wait a bit before retry to avoid race conditions
          await new Promise(resolve => setTimeout(resolve, 100 * attempts));
        } else {
          throw error; // Re-throw if it's a different error
        }
      }
    }

    // Send notifications now that order is created
    try {
      await sendMailNotificationsOnly(order);
      console.log("Email notifications sent successfully for pre-auth order");
    } catch (notificationError) {
      console.error("Notification error:", notificationError);
    }

    return NextResponse.json({
      success: true,
      message: 'Pré-autorisation confirmée avec succès',
      order: {
        id: order!.id,
        orderNumber: order!.orderNumber,
        pickupDate: order!.pickupDate.toISOString().split('T')[0],
        pickupTime: order!.pickupTime,
        totalAmount: order!.totalAmount,
        preAuthStatus: order!.preAuthStatus
      }
    });

  } catch (error) {
    console.error("Pre-authorization processing error:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement de la pré-autorisation" },
      { status: 500 }
    );
  }
}