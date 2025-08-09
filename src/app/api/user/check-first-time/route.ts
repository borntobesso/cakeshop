import { NextRequest, NextResponse } from "next/server";
import { isFirstTimeCustomer } from "@/lib/payment-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID requis" }, { status: 400 });
    }

    const isFirstTime = await isFirstTimeCustomer(userId);

    return NextResponse.json({ isFirstTime });
  } catch (error) {
    console.error("Error checking first-time user: ", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
