import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Accès administrateur requis" },
        { status: 403 }
      );
    }
    // Get special codes list (most recent)
    const codes = await prisma.specialCode.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ codes });
  } catch (error) {
    console.error("Error fetching special codes:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
