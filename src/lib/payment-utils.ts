import { prisma } from "@/lib/prisma";

export async function isFirstTimeCustomer(userId: string): Promise<boolean> {
  const orderCount = await prisma.order.count({
    where: {
      userId,
      paymentStatus: "paid",
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
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

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
