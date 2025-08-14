import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { generateSpecialCode } from "@/lib/payment-utils";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Accès aadministrateur requis" },
        { status: 403 }
      );
    }

    const newCode = await generateSpecialCode();

    const codeData = await prisma.specialCode.findUnique({
      where: { code: newCode },
    });

    if (!codeData) {
      return NextResponse.json(
        { error: "Erreur lors de la création du code" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Code généré avec succès",
      code: codeData,
    });
  } catch (error) {
    console.error("Error generating special code: ", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
