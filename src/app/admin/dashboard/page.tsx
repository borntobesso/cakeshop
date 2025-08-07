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
					<p className="text-gray-600">
						Interface d&apos;administration en cours de développement...
					</p>
				</div>
			</div>
		</div>
	);
}