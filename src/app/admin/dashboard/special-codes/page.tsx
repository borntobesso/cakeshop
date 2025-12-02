"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SpecialCode {
	id: string;
	code: string;
	isUsed: boolean;
	expiresAt: string;
	createdAt: string;
	usedAt?: string;
}

export default function AdminSpecialCodesPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	
	const [codes, setCodes] = useState<SpecialCode[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState("");
	
	// Admin role check
	useEffect(() => {
		if (status === "loading") return;
		if (!session || session.user?.role !== "admin")
			router.push("/admin/login");
	}, [session, status, router]);
	
	// Load codes
	useEffect(() => {
		if (session?.user?.role === "admin")
			fetchCodes();
	}, [session]);
	
	const fetchCodes = async () => {
		try {
			setIsLoading(true);
			const response = await fetch("/api/admin/special-codes");
			
			if (response.ok) {
				const data = await response.json();
				setCodes(data.codes);
			} else {
				setError("Erreur lors du chargement des codes");
			}
		} catch {
			setError("Erreur de connexion");
		} finally {
			setIsLoading(false);
		}
	}
	
	// New code generation
	const generateNewCode = async () => {
		try {
			setIsGenerating(true);
			setError("");
			
			const response = await fetch("/api/admin/special-codes/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" }
			});
			
			if (response.ok) {
				const data = await response.json();
				// add the new code at the beginning
				setCodes(prev => [data.code, ...prev]);
			} else {
				const data = await response.json();
				setError(data.error || "Erreur lors de la génération");
			}
		} catch {
			setError("Erreur de connexion");
		} finally {
			setIsGenerating(false);
		}
	}
	
	const getCodeStatus = (code: SpecialCode) => {
		if (code.isUsed) {
			return { text: "Utilisé", color: "text-red-600 bg-red-50" };
		}
		
		const now = new Date();
		const expires = new Date(code.expiresAt);
		
		if (expires < now) {
			return { text: "Expiré", color: "text-orange-600 bg-orange-50" };
		}
		
		return { text: "Actif", color: "text-green-600 bg-green-50" };
	}
	
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString("fr-FR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		});
	}
	
	if (status === "loading" || isLoading) {
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center">
				<div className="text-lg">Chargement...</div>
			</div>
		)
	}
	
	if (!session || session?.user?.role !== "admin") {
		return null;
	}
	
	return (
		<div className="min-h-screen bg-gray-100 py-8">
			<div className="container mx-auto px-4 max-w-6xl">
				{/* Back Button */}
				<div className="mb-4">
					<Link
						href="/admin/dashboard"
						className="inline-block px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
					>
						← Retour au tableau de bord
					</Link>
				</div>

				{/* Header */}
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">
							Gestion des Codes Spéciaux
						</h1>
						<p className="text-gray-600 mt-2">
							Codes permettant aux nouveaux clients de payer sur place
						</p>
					</div>

					<button
						onClick={generateNewCode}
						disabled={isGenerating}
						className="bg-patisserie-coral hover:bg-patisserie-yellow text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						{isGenerating ? (
							<div className="flex items-center">
								<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
								Génération...
							</div>
						) : (
							"+ Générer un nouveau code"
						)}
					</button>
				</div>
				
				{/* Error */}
				{error && (
					<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
						<div className="text-red-700">{error}</div>
					</div>
				)}
				
				{/* Rapid statistics */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<div className="bg-white p-6 rounded-lg shadow-sm">
						<div className="text-2xl font-bold text-gray-900">
							{codes.length}
						</div>
						<div className="text-sm text-gray-600">Total codes</div>
					</div>
					
					<div className="bg-white p-6 rounded-lg shadow-sm">
						<div className="text-2xl font-bold text-green-600">
							{codes.filter(c => !c.isUsed && new Date(c.expiresAt) > new Date()).length}
						</div>
						<div className="text-sm text-gray-600">Codes actifs</div>
					</div>
					
					<div className="bg-white p-6 rounded-lg shadow-sm">
						<div className="text-2xl font-bold text-red-600">
							{codes.filter(c => c.isUsed).length}
						</div>
						<div className="text-sm text-gray-600">Code utilisés</div>
					</div>
					
					<div className="bg-white p-6 rounded-lg shadow-sm">
						<div className="text-2xl font-bold text-orange-600">
							{codes.filter(c => !c.isUsed && new Date(c.expiresAt) < new Date()).length}
						</div>
						<div className="text-sm text-gray-600">Codes expirés</div>
					</div>
				</div>
				{/* Table of codes */}
				<div className="bg-white rounded-lg shadow-sm overflow-hidden">
					<div className="px-6 py-4 border-b border-gray-200">
						<h2 className="text-lg font-semibold text-gray-900">
							Liste des codes ({codes.length})
						</h2>
					</div>
					
					{codes.length === 0 ? (
						<div className="p-8 text-center text-gray-500">
							Aucun code généré pour le moment
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Code
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Statut
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Créé le
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Expire le
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Utilisé le
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{codes.map((code) => {
										const status = getCodeStatus(code);
										return (
											<tr key={code.id} className="hover:bg-gray-50">
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-lg font-mono font-bold text-gray-900">
														{code.code}
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
														{status.text}
													</span>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
													{formatDate(code.createdAt)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
													{formatDate(code.expiresAt)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
													{code.usedAt ? formatDate(code.usedAt) : "-"}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		</div>	
	);
}