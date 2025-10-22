"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
	const { data: session, status } = useSession();
	const router = useRouter();
	
	useEffect(() => {
		if (status === "loading") return;
		
		if (!session || session.user?.role !== "admin") {
			router.push("/admin/login");
		}
	}, [session, status, router]);
	
	if (status === "loading") {
		return <div className="p-8">Chargement...</div>
	}
	
	if (!session || session.user?.role !== "admin") {
		return null;
	}
	
	return (
		<div className="min-h-screen bg-gray-100 py-8">
			<div className="container mx-auto px-4">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">
					Tableau de Bord Administrateur
				</h1>
				
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-xl font-semibold mb-4">
						Bienvenue, {session.user?.name}!
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<div className="bg-white rounded-lg shadow p-6">
							<h3 className="text-lg font-semibold mb-4">Pré-Autorisations</h3>
							<p className="text-gray-600 mb-4">
								Gérer les pré-autorisations bancaires des nouveaux clients
							</p>
							<a
								href="/admin/preauth"
								className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
							>
								Gérer les pré-autorisations
							</a>
						</div>

						<div className="bg-white rounded-lg shadow p-6">
							<h3 className="text-lg font-semibold mb-4">Codes Cadeau</h3>
							<p className="text-gray-600 mb-4">
								Générer et gérer les codes pour les cartes cadeaux
							</p>
							<a
								href="/admin/special-codes"
								className="bg-patisserie-coral hover:bg-patisserie-yellow text-white px-4 py-2 rounded-lg transition-colors"
							>
								Gérer les codes
							</a>
						</div>
						{/* Other features.. */}
					</div>
				</div>
			</div>
		</div>
	);
}