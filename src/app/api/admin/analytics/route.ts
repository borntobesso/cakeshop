import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/analytics - Get order analytics and statistics
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

    // Build date filter
    const where: any = {};
    if (startDate || endDate) {
      where.pickupDate = {};
      if (startDate) {
        where.pickupDate.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.pickupDate.lte = endDateTime;
      }
    }

    // Fetch orders
    const orders = await prisma.order.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Payment method breakdown
    const paymentMethods = orders.reduce((acc: any, order) => {
      acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + 1;
      return acc;
    }, {});

    // Order status breakdown
    const orderStatuses = orders.reduce((acc: any, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // Product popularity analysis
    const productStats: Record<string, { count: number; revenue: number }> = {};
    orders.forEach((order) => {
      const items = order.items as any[];
      items.forEach((item) => {
        if (!productStats[item.name]) {
          productStats[item.name] = { count: 0, revenue: 0 };
        }
        productStats[item.name].count += item.quantity;
        productStats[item.name].revenue += item.price * item.quantity;
      });
    });

    // Convert to sorted array
    const popularProducts = Object.entries(productStats)
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 products

    // Orders by hour (pickup time analysis)
    const ordersByHour: Record<string, number> = {};
    orders.forEach((order) => {
      const hour = order.pickupTime.split(":")[0] + ":00";
      ordersByHour[hour] = (ordersByHour[hour] || 0) + 1;
    });

    // Orders by day of week
    const ordersByDayOfWeek = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    orders.forEach((order) => {
      const dayOfWeek = new Date(order.pickupDate).getDay();
      ordersByDayOfWeek[dayOfWeek]++;
    });

    // Daily revenue trend
    const revenueByDate: Record<string, number> = {};
    orders.forEach((order) => {
      const dateKey = new Date(order.pickupDate).toISOString().split("T")[0];
      revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + order.totalAmount;
    });

    // Convert to array for charts
    const dailyRevenue = Object.entries(revenueByDate)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalOrders,
          totalRevenue,
          averageOrderValue,
          dateRange: {
            start: startDate,
            end: endDate,
          },
        },
        paymentMethods,
        orderStatuses,
        popularProducts,
        ordersByHour: Object.entries(ordersByHour)
          .map(([hour, count]) => ({ hour, count }))
          .sort((a, b) => a.hour.localeCompare(b.hour)),
        ordersByDayOfWeek: [
          { day: "Dimanche", count: ordersByDayOfWeek[0] },
          { day: "Lundi", count: ordersByDayOfWeek[1] },
          { day: "Mardi", count: ordersByDayOfWeek[2] },
          { day: "Mercredi", count: ordersByDayOfWeek[3] },
          { day: "Jeudi", count: ordersByDayOfWeek[4] },
          { day: "Vendredi", count: ordersByDayOfWeek[5] },
          { day: "Samedi", count: ordersByDayOfWeek[6] },
        ],
        dailyRevenue,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch analytics",
      },
      { status: 500 }
    );
  }
}
