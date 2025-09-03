import { NextResponse } from "next/server";

interface PrintFailureRequest {
  order: any;
  error: string;
}

export async function POST(request: Request) {
  try {
    const body: PrintFailureRequest = await request.json();
    const { order, error } = body;

    const shopPhone = process.env.NEXT_PUBLIC_SHOP_PHONE;
    const shopEmail = process.env.NEXT_PUBLIC_SHOP_EMAIL;

    // Send SMS alert to shop
    if (shopPhone) {
      try {
        await fetch(`${process.env.NEXTAUTH_URL}/api/notifications/sms`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "print_failure",
            order,
            to: shopPhone,
            error
          }),
        });
        console.log("Print failure SMS sent to shop");
      } catch (smsError) {
        console.error("Failed to send print failure SMS:", smsError);
      }
    }

    // Send email alert to shop
    if (shopEmail) {
      try {
        await fetch(`${process.env.NEXTAUTH_URL}/api/notifications/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "print_failure",
            order,
            to: shopEmail,
            error
          }),
        });
        console.log("Print failure email sent to shop");
      } catch (emailError) {
        console.error("Failed to send print failure email:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Print failure notifications sent"
    });

  } catch (error) {
    console.error("Print failure notification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Notification failed"
      },
      { status: 500 }
    );
  }
}