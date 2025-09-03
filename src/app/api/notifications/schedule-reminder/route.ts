import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ScheduleReminderRequest {
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    pickupDate: Date | string;
    pickupTime: string;
  };
  reminderTime: string; // ISO string
}

export async function POST(request: Request) {
  try {
    const body: ScheduleReminderRequest = await request.json();
    const { order, reminderTime } = body;

    if (!order || !reminderTime) {
      return NextResponse.json(
        { success: false, error: "Order and reminderTime are required" },
        { status: 400 }
      );
    }

    // Validate reminder time is in the future
    const reminderDateTime = new Date(reminderTime);
    const now = new Date();

    if (reminderDateTime <= now) {
      console.log("Reminder time is in the past, skipping:", reminderTime);
      return NextResponse.json({
        success: true,
        message: "Reminder time is in the past, skipping scheduling",
        skipped: true
      });
    }

    // Check if reminder already exists for this order
    const existingReminder = await prisma.scheduledReminder.findFirst({
      where: {
        orderId: order.id,
        status: "pending"
      }
    });

    if (existingReminder) {
      console.log("Reminder already exists for order:", order.id);
      return NextResponse.json({
        success: true,
        message: "Reminder already scheduled for this order",
        reminderId: existingReminder.id
      });
    }

    // Create scheduled reminder
    const scheduledReminder = await prisma.scheduledReminder.create({
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerPhone: order.customerPhone,
        customerName: order.customerName,
        reminderTime: reminderDateTime,
        pickupTime: order.pickupTime,
        pickupDate: new Date(order.pickupDate),
        status: "pending"
      }
    });

    console.log(`Reminder scheduled successfully for order ${order.orderNumber} at ${reminderTime}`);

    return NextResponse.json({
      success: true,
      reminderId: scheduledReminder.id,
      reminderTime: scheduledReminder.reminderTime,
      message: "Pickup reminder scheduled successfully"
    });

  } catch (error) {
    console.error("Error scheduling reminder:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to schedule reminder"
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check pending reminders (useful for debugging)
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'pending';

    const reminders = await prisma.scheduledReminder.findMany({
      where: { status },
      orderBy: { reminderTime: 'asc' },
      take: 20 // Limit to 20 for performance
    });

    return NextResponse.json({
      success: true,
      count: reminders.length,
      reminders
    });

  } catch (error) {
    console.error("Error fetching reminders:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch reminders"
      },
      { status: 500 }
    );
  }
}