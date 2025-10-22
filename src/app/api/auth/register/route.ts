import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { normalizePhoneNumber } from "@/lib/phone-utils";

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, phone, password } = await request.json();

    // Basic validation
    if (!firstName || !lastName || !password) {
      return NextResponse.json(
        { error: "Prénom, nom et mot de passe sont requis" },
        { status: 400 }
      );
    }

    // Email OR phone validation
    if (!email && !phone) {
      return NextResponse.json(
        { error: "Veuillez fournir au moins un email ou un numéro de téléphone" },
        { status: 400 }
      );
    }

    // Email duplication validation (only if email is provided)
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Un compte avec cet email existe déjà" },
          { status: 400 }
        );
      }
    }

    // Normalize phone number if provided
    const normalizedPhone = phone ? normalizePhoneNumber(phone) : null;

    // Phone duplication validation (only if phone is provided)
    if (normalizedPhone) {
      const existingUserByPhone = await prisma.user.findFirst({
        where: { phone: normalizedPhone },
      });

      if (existingUserByPhone) {
        return NextResponse.json(
          { error: "Un compte avec ce numéro de téléphone existe déjà" },
          { status: 400 }
        );
      }
    }

    // Password hashing
    const hashedPassword = await bcrypt.hash(password, 12);

    // User creation
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`, // Keep for backward compatibility with NextAuth
        email: email || null,
        phone: normalizedPhone,
        password: hashedPassword,
        role: "customer",
      },
    });

    // Omit password from response
    const userWithoutPassword = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(
      {
        message: "Compte créé avec succès",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error: ", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
