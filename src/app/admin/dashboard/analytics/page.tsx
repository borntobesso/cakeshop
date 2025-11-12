"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AnalyticsData {
	overview: {
		totalOrders: number;
		totalRevenue: number;
		averageOrderValue: number;
		dateRange: {
			start: string | null;
			end: string | null;
		};
	};
	paymentMethods: Record<string, number>;
	orderStatuses: Record<string, number>;
	popularProducts: Array<{
		name: string;
		count: number;
		revenue: number;
	}>;
	ordersByHour: Array<{
		hour: string;
		count: number;
	}>;
	ordersByDayOfWeek: Array<{
		day: string;
		count: number;
	}>;
	dailyRevenue: Array<{
		date: string;
		revenue: number;
	}>;
}

export default function AdminAnalyticsPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
	const [loading, setLoading] = useState(true);

	// Date range filters
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");

	useEffect(() => {
		if (status === "loading") return;

		if (!session || session.user?.role !== "admin") {
			router.push("/admin/login");
		}
	}, [session, status, router]);

	const fetchAnalytics = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (startDate) params.append("startDate", startDate);
			if (endDate) params.append("endDate", endDate);

			const response = await fetch(`/api/admin/analytics?${params.toString()}`);
			const data = await response.json();

			if (data.success) {
				setAnalytics(data.analytics);
			}
		} catch (error) {
			console.error("Error fetching analytics:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (status === "authenticated" && session?.user?.role === "admin") {
			fetchAnalytics();
		}
	}, [status, session, startDate, endDate]);

	if (status === "loading" || loading) {
		return <div className="p-8">Chargement...</div>;
	}

	if (!session || session.user?.role !== "admin") {
		return null;
	}

	if (!analytics) {
		return <div className="p-8">Aucune donnée disponible</div>;
	}

	// Calculate max values for scaling charts
	const maxDailyRevenue = Math.max(...analytics.dailyRevenue.map((d) => d.revenue), 1);
	const maxOrdersByHour = Math.max(...analytics.ordersByHour.map((h) => h.count), 1);
	const maxOrdersByDay = Math.max(...analytics.ordersByDayOfWeek.map((d) => d.count), 1);

	return (
		<div className="min-h-screen bg-gray-100 py-8">
			<div className="container mx-auto px-4">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						Analytiques et Statistiques
					</h1>
					<p className="text-gray-600">
						Analysez les tendances de commandes et les performances
					</p>
				</div>

				{/* Date Range Filter */}
				<div className="bg-white rounded-lg shadow p-6 mb-6">
					<h2 className="text-lg font-semibold mb-4">Période d'analyse</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Date de début
							</label>
							<input
								type="date"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-patisserie-coral focus:border-transparent"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Date de fin
							</label>
							<input
								type="date"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-patisserie-coral focus:border-transparent"
							/>
						</div>
						<div className="flex items-end">
							<button
								onClick={() => {
									setStartDate("");
									setEndDate("");
								}}
								className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
							>
								Réinitialiser
							</button>
						</div>
					</div>
				</div>

				{/* Overview Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600 mb-1">Total des commandes</p>
								<p className="text-3xl font-bold text-gray-900">
									{analytics.overview.totalOrders}
								</p>
							</div>
							<div className="w-12 h-12 bg-patisserie-mint rounded-lg flex items-center justify-center">
								<span className="text-2xl">📦</span>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600 mb-1">Revenu total</p>
								<p className="text-3xl font-bold text-gray-900">
									{analytics.overview.totalRevenue.toFixed(2)}€
								</p>
							</div>
							<div className="w-12 h-12 bg-patisserie-coral rounded-lg flex items-center justify-center">
								<span className="text-2xl">💰</span>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600 mb-1">Valeur moyenne</p>
								<p className="text-3xl font-bold text-gray-900">
									{analytics.overview.averageOrderValue.toFixed(2)}€
								</p>
							</div>
							<div className="w-12 h-12 bg-patisserie-yellow rounded-lg flex items-center justify-center">
								<span className="text-2xl">📊</span>
							</div>
						</div>
					</div>
				</div>

				{/* Charts Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
					{/* Daily Revenue Chart */}
					<div className="bg-white rounded-lg shadow p-6">
						<h2 className="text-lg font-semibold mb-4">Revenu quotidien</h2>
						<div className="space-y-2">
							{analytics.dailyRevenue.length === 0 ? (
								<p className="text-gray-500 text-sm">Aucune donnée disponible</p>
							) : (
								<div className="h-64 flex items-end justify-between gap-1">
									{analytics.dailyRevenue.map((item) => {
										const heightPercent = (item.revenue / maxDailyRevenue) * 100;
										return (
											<div
												key={item.date}
												className="flex-1 flex flex-col items-center group relative"
											>
												<div
													className="w-full bg-patisserie-coral hover:bg-patisserie-yellow transition-colors rounded-t"
													style={{ height: `${heightPercent}%` }}
												>
													<div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
														{new Date(item.date).toLocaleDateString("fr-FR")}
														<br />
														{item.revenue.toFixed(2)}€
													</div>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>
					</div>

					{/* Popular Products */}
					<div className="bg-white rounded-lg shadow p-6">
						<h2 className="text-lg font-semibold mb-4">Produits populaires</h2>
						<div className="space-y-3">
							{analytics.popularProducts.slice(0, 8).map((product, index) => {
								const maxCount = analytics.popularProducts[0]?.count || 1;
								const widthPercent = (product.count / maxCount) * 100;
								return (
									<div key={product.name}>
										<div className="flex items-center justify-between text-sm mb-1">
											<span className="font-medium text-gray-900 truncate flex-1">
												{index + 1}. {product.name}
											</span>
											<span className="text-gray-600 ml-2">
												{product.count} × {product.revenue.toFixed(2)}€
											</span>
										</div>
										<div className="w-full bg-gray-200 rounded-full h-2">
											<div
												className="bg-patisserie-mint rounded-full h-2 transition-all"
												style={{ width: `${widthPercent}%` }}
											/>
										</div>
									</div>
								);
							})}
							{analytics.popularProducts.length === 0 && (
								<p className="text-gray-500 text-sm">Aucun produit trouvé</p>
							)}
						</div>
					</div>

					{/* Orders by Hour */}
					<div className="bg-white rounded-lg shadow p-6">
						<h2 className="text-lg font-semibold mb-4">
							Heures de retrait populaires
						</h2>
						<div className="h-64 flex items-end justify-between gap-2">
							{analytics.ordersByHour.length === 0 ? (
								<p className="text-gray-500 text-sm">Aucune donnée disponible</p>
							) : (
								analytics.ordersByHour.map((item) => {
									const heightPercent = (item.count / maxOrdersByHour) * 100;
									return (
										<div
											key={item.hour}
											className="flex-1 flex flex-col items-center group relative"
										>
											<div
												className="w-full bg-patisserie-yellow hover:bg-patisserie-coral transition-colors rounded-t flex items-end justify-center pb-1"
												style={{ height: `${Math.max(heightPercent, 10)}%` }}
											>
												<span className="text-xs font-semibold text-gray-900">
													{item.count}
												</span>
												<div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
													{item.hour}: {item.count} commandes
												</div>
											</div>
											<span className="text-xs text-gray-600 mt-2">
												{item.hour}
											</span>
										</div>
									);
								})
							)}
						</div>
					</div>

					{/* Orders by Day of Week */}
					<div className="bg-white rounded-lg shadow p-6">
						<h2 className="text-lg font-semibold mb-4">Commandes par jour</h2>
						<div className="space-y-3">
							{analytics.ordersByDayOfWeek.map((item) => {
								const widthPercent = (item.count / maxOrdersByDay) * 100;
								return (
									<div key={item.day}>
										<div className="flex items-center justify-between text-sm mb-1">
											<span className="font-medium text-gray-900">{item.day}</span>
											<span className="text-gray-600">{item.count}</span>
										</div>
										<div className="w-full bg-gray-200 rounded-full h-3">
											<div
												className="bg-patisserie-coral rounded-full h-3 transition-all"
												style={{ width: `${widthPercent}%` }}
											/>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>

				{/* Payment Methods & Order Statuses */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Payment Methods */}
					<div className="bg-white rounded-lg shadow p-6">
						<h2 className="text-lg font-semibold mb-4">Méthodes de paiement</h2>
						<div className="space-y-3">
							{Object.entries(analytics.paymentMethods).map(([method, count]) => {
								const totalPayments = Object.values(analytics.paymentMethods).reduce(
									(a, b) => a + b,
									0
								);
								const percentage = ((count / totalPayments) * 100).toFixed(1);
								return (
									<div key={method} className="flex items-center justify-between">
										<div className="flex items-center gap-3 flex-1">
											<span className="text-2xl">
												{method === "online" ? "💳" : "💵"}
											</span>
											<div className="flex-1">
												<div className="flex items-center justify-between mb-1">
													<span className="font-medium text-gray-900">
														{method === "online" ? "En ligne" : "Sur place"}
													</span>
													<span className="text-sm text-gray-600">
														{count} ({percentage}%)
													</span>
												</div>
												<div className="w-full bg-gray-200 rounded-full h-2">
													<div
														className="bg-patisserie-mint rounded-full h-2"
														style={{ width: `${percentage}%` }}
													/>
												</div>
											</div>
										</div>
									</div>
								);
							})}
							{Object.keys(analytics.paymentMethods).length === 0 && (
								<p className="text-gray-500 text-sm">Aucune donnée disponible</p>
							)}
						</div>
					</div>

					{/* Order Statuses */}
					<div className="bg-white rounded-lg shadow p-6">
						<h2 className="text-lg font-semibold mb-4">Statuts des commandes</h2>
						<div className="space-y-3">
							{Object.entries(analytics.orderStatuses).map(([statusKey, count]) => {
								const totalOrders = Object.values(analytics.orderStatuses).reduce(
									(a, b) => a + b,
									0
								);
								const percentage = ((count / totalOrders) * 100).toFixed(1);

								const statusLabels: Record<string, string> = {
									pending: "En attente",
									confirmed: "Confirmée",
									ready: "Prête",
									completed: "Complétée",
									cancelled: "Annulée",
								};

								const statusColors: Record<string, string> = {
									pending: "bg-yellow-500",
									confirmed: "bg-blue-500",
									ready: "bg-green-500",
									completed: "bg-gray-500",
									cancelled: "bg-red-500",
								};

								return (
									<div key={statusKey} className="flex items-center justify-between">
										<div className="flex items-center gap-3 flex-1">
											<div
												className={`w-3 h-3 rounded-full ${
													statusColors[statusKey] || "bg-gray-400"
												}`}
											/>
											<div className="flex-1">
												<div className="flex items-center justify-between mb-1">
													<span className="font-medium text-gray-900">
														{statusLabels[statusKey] || statusKey}
													</span>
													<span className="text-sm text-gray-600">
														{count} ({percentage}%)
													</span>
												</div>
												<div className="w-full bg-gray-200 rounded-full h-2">
													<div
														className={`${
															statusColors[statusKey] || "bg-gray-400"
														} rounded-full h-2`}
														style={{ width: `${percentage}%` }}
													/>
												</div>
											</div>
										</div>
									</div>
								);
							})}
							{Object.keys(analytics.orderStatuses).length === 0 && (
								<p className="text-gray-500 text-sm">Aucune donnée disponible</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
