import { prisma } from "@/lib/prisma";

export async function isFirstTimeCustomer(userId: string): Promise<boolean> {
  const orderCount = await prisma.order.count({
    where: {
      userId,
      // Count any order that was successfully created (not just paid ones)
      OR: [
        { paymentStatus: "paid" },
        { paymentStatus: "pending" }, // Include pending orders for onsite payments
      ],
    },
  });

  return orderCount === 0;
}

export async function validateSpecialCode(code: string): Promise<boolean> {
  const specialCode = await prisma.specialCode.findUnique({
    where: { code },
  });

  if (!specialCode) return false;
  if (specialCode.isUsed) return false;
  if (specialCode.expiresAt < new Date()) return false;

  return true;
}

export async function generateSpecialCode(): Promise<string> {
  // 6-digit random code generation
  let code: string;
  let isUnique = false;

  // Repeat until unique code
  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const existingCode = await prisma.specialCode.findUnique({
      where: { code },
    });

    isUnique = !existingCode;
  } while (!isUnique);

  // expires in 24 hours
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await prisma.specialCode.create({
    data: {
      code,
      expiresAt,
    },
  });

  return code;
}

export async function useSpecialCode(code: string): Promise<boolean> {
  try {
    const specialCode = await prisma.specialCode.findUnique({
      where: { code },
    });

    if (
      !specialCode ||
      specialCode.isUsed ||
      specialCode.expiresAt < new Date()
    ) {
      return false;
    }

    // Mark the code as used
    await prisma.specialCode.update({
      where: { code },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error("Error using special code:", error);
    return false;
  }
}
