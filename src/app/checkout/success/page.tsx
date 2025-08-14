"use client";

import { useEffect, useState, Suspense} from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(true);
	const [orderDetails, setOrderDetails] = useState<any>(null);
	const [error, setError] = useState("");
	
	useEffect(() => {
		const sessionId = searchParams.get("session_id");
		
		if (sessionId) {
			processOrder(sessionId);
		} else {
			setError("Session ID manquant");
			setIsLoading(false);
		}
	}, [searchParams]);
	
	const processOrder = async (sessionId: string) => {
		try {
			const response = await fetch("/api/checkout/process-payment", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ sessionId })
			});
			
			if (response.ok) {
				const data = await response.json();
				setOrderDetails(data.order);
			} else {
				setError("Erreur lors du traitement de la commande");
			}
		} catch {
			setError("Erreur de connexion");
		} finally {
			setIsLoading(false);
		}
	}
	
	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-patisserie-coral mx-auto mb-4"></div>
					<p className="text-lg font-medium">Traitement de votre commande...</p>
				</div>
			</div>
		);
	}
	
	if (error) {
		return (
			<div className="min-h-screen bg-bgay-50 flex items-center justify-center">
				<div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
					<div className="text-red-600 text-6xl mb-4">❌</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
					<p className="text-gray-600 mb-6">{error}</p>
					<Link href="/" className="bg-patisserie-coral text-white px-6 py-3 rounded-lg hover:bg-patisserie-yellow transition-colors">
						Retour à l&apos;accueil
					</Link>
				</div>
			</div>
		);
	}
	
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
			<div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
				<div className="text-center">
					<div className="text-green-600 text-6xl mb-4">✅</div>
					<h1 className="text-3xl font-bold text-gray-900 mb-4">Paiement réussi !</h1>
					<p className="text-lg text-gray-600 mb-8">
						Votre commande a été confirmée et sera prête pour le retrait.
					</p>
				</div>
				
				{orderDetails && (
					<div className="bg-gray-50 rounded-lg p-6 mb-8">
						<h2 className="text-xl font-semibold mb-4">Détails de votre commande</h2>
						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="font-medium">Numéro de commande:</span>
								<span className="font-mono">{orderDetails.id}</span>
							</div>
							<div className="flex justify-between">
								<span className="font-medium">Date de retrait:</span>
								<span>{orderDetails.pickupDate} à {orderDetails.pickupTime}</span>
							</div>
							<div className="flex justify-between">
								<span className="font-medium">Montant payé:</span>
								<span className="font-bold">{orderDetails.totalAmount}€</span>
							</div>
						</div>
					</div>
				)}
				
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
					<h3 className="font-semibold text-blue-800 mb-2">📧 Confirmation envoyée</h3>
					<p className="text-sm text-blue-700">
						Un email de confirmation a été envoyé avec tous les détails de votre commande.
						Vous receverez également un SMS de rappel 24h avant le retrait.
					</p>
				</div>
				
				<div className="flex gap-4 justify-center">
					<Link
						href="/patisseries"
						className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
					>
						Continuer les achats
					</Link>
				</div>
			</div>
		</div>
	);
}

export default function CheckoutSuccessPage() {
	return (
		<Suspense fallback={<div className="p-8 text-center">Chargement...</div>}>
			<SuccessContent />
		</Suspense>
	)
}