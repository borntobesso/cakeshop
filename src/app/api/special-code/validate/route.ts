import { NextRequest, NextResponse } from "next/server";
import { validateSpecialCode } from "@/lib/payment-utils";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Code requis" }, { status: 400 });
    }

    const valid = await validateSpecialCode(code);

    return NextResponse.json({ valid });
  } catch (error) {
    console.error("Error validating special code: ", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
