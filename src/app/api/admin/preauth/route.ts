import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Fetch orders with pre-authorization
    const orders = await prisma.order.findMany({
      where: {
        requiresPreAuth: true,
        OR: [
          { preAuthStatus: 'pending' },
          { preAuthStatus: 'authorized' },
          { preAuthStatus: 'captured' },
          { preAuthStatus: 'released' }
        ]
      },
      orderBy: [
        { preAuthStatus: 'asc' }, // Show 'authorized' first
        { createdAt: 'desc' }
      ]
    });

    // Format the response
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      totalAmount: order.totalAmount,
      preAuthAmount: order.preAuthAmount || order.totalAmount,
      preAuthStatus: order.preAuthStatus,
      preAuthExpiresAt: order.preAuthExpiresAt?.toISOString(),
      pickupDate: order.pickupDate.toISOString().split('T')[0],
      pickupTime: order.pickupTime,
      createdAt: order.createdAt.toISOString()
    }));

    return NextResponse.json({
      orders: formattedOrders,
      totalCount: formattedOrders.length
    });

  } catch (error) {
    console.error("Error fetching pre-auth orders:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}