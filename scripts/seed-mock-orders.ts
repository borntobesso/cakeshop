/**
 * Mock Order Data Generator
 *
 * This script generates realistic mock orders for testing the admin dashboard features.
 * It creates:
 * - Mock customer users
 * - Orders spanning the last 3 months
 * - Various products, payment methods, and order statuses
 * - Realistic pickup dates and times
 */

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Mock customer data
const mockCustomers = [
	{ firstName: "Marie", lastName: "Dubois", email: "marie.dubois@example.fr", phone: "+33612345001" },
	{ firstName: "Jean", lastName: "Martin", email: "jean.martin@example.fr", phone: "+33612345002" },
	{ firstName: "Sophie", lastName: "Bernard", email: "sophie.bernard@example.fr", phone: "+33612345003" },
	{ firstName: "Pierre", lastName: "Petit", email: "pierre.petit@example.fr", phone: "+33612345004" },
	{ firstName: "Claire", lastName: "Rousseau", email: "claire.rousseau@example.fr", phone: "+33612345005" },
	{ firstName: "Lucas", lastName: "Simon", email: "lucas.simon@example.fr", phone: "+33612345006" },
	{ firstName: "Emma", lastName: "Laurent", email: "emma.laurent@example.fr", phone: "+33612345007" },
	{ firstName: "Thomas", lastName: "Michel", email: "thomas.michel@example.fr", phone: "+33612345008" },
	{ firstName: "Julie", lastName: "Leroy", email: "julie.leroy@example.fr", phone: "+33612345009" },
	{ firstName: "Antoine", lastName: "Moreau", email: "antoine.moreau@example.fr", phone: "+33612345010" },
];

// Mock product data (common cake types)
const mockProducts = [
	{ name: "Tarte au Citron", price: 6.50 },
	{ name: "Éclair au Chocolat", price: 4.50 },
	{ name: "Macaron Assortiment", price: 12.00 },
	{ name: "Paris-Brest", price: 5.50 },
	{ name: "Millefeuille", price: 5.00 },
	{ name: "Fraisier", price: 32.00 },
	{ name: "Opéra", price: 28.00 },
	{ name: "Forêt Noire", price: 30.00 },
	{ name: "Saint-Honoré", price: 35.00 },
	{ name: "Gâteau au Chocolat", price: 25.00 },
	{ name: "Cheesecake", price: 28.00 },
	{ name: "Tarte aux Fruits", price: 24.00 },
];

// Whole cake sizes
const cakeSizes = ["6 parts", "8 parts", "10 parts", "12 parts"];

// Pickup times
const pickupTimes = [
	"09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
	"12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
	"16:00", "16:30", "17:00", "17:30", "18:00", "18:30"
];

// Order statuses with weights (more confirmed/completed than cancelled)
const orderStatuses = [
	{ status: "pending", weight: 2 },
	{ status: "confirmed", weight: 5 },
	{ status: "ready", weight: 3 },
	{ status: "completed", weight: 8 },
	{ status: "cancelled", weight: 1 },
];

// Payment methods
const paymentMethods = ["online", "onsite"];

// Helper: Get random item from array
function randomItem<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

// Helper: Get weighted random status
function getWeightedStatus(): string {
	const totalWeight = orderStatuses.reduce((sum, s) => sum + s.weight, 0);
	let random = Math.random() * totalWeight;

	for (const { status, weight } of orderStatuses) {
		random -= weight;
		if (random <= 0) return status;
	}

	return "confirmed";
}

// Helper: Generate random date in the last N days
function randomDateInLast(days: number): Date {
	const now = new Date();
	const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
	const randomTime = pastDate.getTime() + Math.random() * (now.getTime() - pastDate.getTime());
	return new Date(randomTime);
}

// Helper: Generate future pickup date (within next 30 days)
function randomFutureDate(maxDays: number = 30): Date {
	const now = new Date();
	const futureTime = now.getTime() + Math.random() * maxDays * 24 * 60 * 60 * 1000;
	const date = new Date(futureTime);

	// Skip Sundays (assuming shop is closed)
	while (date.getDay() === 0) {
		date.setDate(date.getDate() + 1);
	}

	return date;
}

// Helper: Generate order items (1-5 items per order)
function generateOrderItems(): any[] {
	const itemCount = Math.floor(Math.random() * 4) + 1; // 1-5 items
	const items = [];

	for (let i = 0; i < itemCount; i++) {
		const product = randomItem(mockProducts);
		const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity

		// 30% chance it's a whole cake with size
		const isWholeCake = Math.random() < 0.3;

		items.push({
			name: product.name,
			price: product.price,
			quantity,
			size: isWholeCake ? randomItem(cakeSizes) : undefined,
		});
	}

	return items;
}

// Helper: Calculate total amount
function calculateTotal(items: any[]): number {
	return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Helper: Generate unique order number
function generateOrderNumber(index: number): string {
	const timestamp = Date.now().toString().slice(-8);
	const padded = String(index).padStart(4, "0");
	return `ORD-${timestamp}-${padded}`;
}

async function main() {
	console.log("🚀 Starting mock data generation...\n");

	// 1. Create mock customers
	console.log("👥 Creating mock customers...");
	const createdUsers = [];

	for (const customer of mockCustomers) {
		try {
			const hashedPassword = await bcrypt.hash("password123", 10);
			const user = await prisma.user.create({
				data: {
					firstName: customer.firstName,
					lastName: customer.lastName,
					name: `${customer.firstName} ${customer.lastName}`,
					email: customer.email,
					phone: customer.phone,
					password: hashedPassword,
					role: "customer",
				},
			});
			createdUsers.push(user);
			console.log(`  ✓ Created user: ${user.name} (${user.email})`);
		} catch (error: any) {
			if (error.code === "P2002") {
				console.log(`  ⚠ User ${customer.email} already exists, skipping...`);
				// Fetch existing user
				const existingUser = await prisma.user.findUnique({
					where: { email: customer.email },
				});
				if (existingUser) createdUsers.push(existingUser);
			} else {
				console.error(`  ✗ Error creating user ${customer.email}:`, error.message);
			}
		}
	}

	console.log(`\n✅ Created/found ${createdUsers.length} users\n`);

	// 2. Generate orders spanning last 90 days
	console.log("📦 Generating mock orders...");
	const ordersToCreate = 150; // Generate 150 orders
	let createdOrdersCount = 0;

	for (let i = 0; i < ordersToCreate; i++) {
		try {
			const customer = randomItem(createdUsers);
			const items = generateOrderItems();
			const totalAmount = calculateTotal(items);
			const paymentMethod = randomItem(paymentMethods);
			const status = getWeightedStatus();

			// For past orders, use random date in last 90 days
			// For pending/confirmed orders, use future dates
			let pickupDate: Date;
			let createdAt: Date;

			if (status === "pending" || status === "confirmed") {
				// Future pickup
				pickupDate = randomFutureDate(30);
				createdAt = randomDateInLast(7); // Created in last week
			} else {
				// Past pickup
				pickupDate = randomDateInLast(90);
				// Created a few days before pickup
				createdAt = new Date(pickupDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
			}

			const order = await prisma.order.create({
				data: {
					orderNumber: generateOrderNumber(i),
					userId: customer.id,
					customerName: customer.name || `${customer.firstName} ${customer.lastName}`,
					customerEmail: customer.email!,
					customerPhone: customer.phone,
					firstName: customer.firstName,
					lastName: customer.lastName,
					items,
					totalAmount,
					paymentMethod,
					paymentStatus: status === "cancelled" ? "refunded" : "paid",
					pickupDate,
					pickupTime: randomItem(pickupTimes),
					status,
					createdAt,
					updatedAt: createdAt,
				},
			});

			createdOrdersCount++;

			if ((i + 1) % 25 === 0) {
				console.log(`  ⏳ Progress: ${i + 1}/${ordersToCreate} orders created...`);
			}
		} catch (error: any) {
			console.error(`  ✗ Error creating order ${i}:`, error.message);
		}
	}

	console.log(`\n✅ Created ${createdOrdersCount} orders\n`);

	// 3. Print summary statistics
	console.log("📊 Summary Statistics:");

	const totalOrders = await prisma.order.count();
	const ordersByStatus = await prisma.order.groupBy({
		by: ["status"],
		_count: true,
	});

	const ordersByPayment = await prisma.order.groupBy({
		by: ["paymentMethod"],
		_count: true,
	});

	const totalRevenue = await prisma.order.aggregate({
		_sum: {
			totalAmount: true,
		},
	});

	console.log(`  • Total orders in database: ${totalOrders}`);
	console.log(`  • Total revenue: ${totalRevenue._sum.totalAmount?.toFixed(2)}€`);
	console.log("\n  Orders by status:");
	ordersByStatus.forEach(({ status, _count }) => {
		console.log(`    - ${status}: ${_count}`);
	});

	console.log("\n  Orders by payment method:");
	ordersByPayment.forEach(({ paymentMethod, _count }) => {
		console.log(`    - ${paymentMethod}: ${_count}`);
	});

	console.log("\n🎉 Mock data generation complete!\n");
	console.log("You can now test the admin dashboard features:");
	console.log("  📅 Calendar view: /admin/dashboard/calendar");
	console.log("  📊 Orders table: /admin/dashboard/orders");
	console.log("  📈 Analytics: /admin/dashboard/analytics");
}

main()
	.catch((error) => {
		console.error("❌ Error:", error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
