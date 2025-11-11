import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/admin/orders - Fetch orders with optional filters
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");
    const productName = searchParams.get("productName");
    const customerName = searchParams.get("customerName");

    // Build filter conditions
    const where: any = {};

    // Date range filter (pickup date)
    if (startDate || endDate) {
      where.pickupDate = {};
      if (startDate) {
        where.pickupDate.gte = new Date(startDate);
      }
      if (endDate) {
        // Include the entire end date by setting time to end of day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.pickupDate.lte = endDateTime;
      }
    }

    // Status filter
    if (status && status !== "all") {
      where.status = status;
    }

    // Customer name filter
    if (customerName) {
      where.OR = [
        {
          customerName: {
            contains: customerName,
            mode: "insensitive" as any,
          },
        },
        {
          firstName: {
            contains: customerName,
            mode: "insensitive" as any,
          },
        },
        {
          lastName: {
            contains: customerName,
            mode: "insensitive" as any,
          },
        },
      ];
    }

    // Fetch orders
    const orders = await prisma.order.findMany({
      where,
      orderBy: [
        { pickupDate: "asc" },
        { pickupTime: "asc" },
      ],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Filter by product name if specified (items is JSON field)
    let filteredOrders = orders;
    if (productName) {
      filteredOrders = orders.filter((order) => {
        const items = order.items as any[];
        return items.some((item) =>
          item.name?.toLowerCase().includes(productName.toLowerCase())
        );
      });
    }

    // Calculate summary statistics
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    // Group orders by pickup date for calendar view
    const ordersByDate: Record<string, any[]> = {};
    filteredOrders.forEach((order) => {
      const dateKey = new Date(order.pickupDate).toISOString().split("T")[0];
      if (!ordersByDate[dateKey]) {
        ordersByDate[dateKey] = [];
      }
      ordersByDate[dateKey].push(order);
    });

    return NextResponse.json({
      success: true,
      orders: filteredOrders,
      ordersByDate,
      summary: {
        totalOrders,
        totalRevenue,
        dateRange: {
          start: startDate,
          end: endDate,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}
