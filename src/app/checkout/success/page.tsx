"use client";

import { useEffect, useState, Suspense} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

function SuccessContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { clearCart } = useCart();
	const [isLoading, setIsLoading] = useState(true);
	const [orderDetails, setOrderDetails] = useState<any>(null);
	const [error, setError] = useState("");
	const [countdown, setCountdown] = useState(15);
	
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

				// Clear cart after successful payment processing
				clearCart();

				// Start countdown and redirect to home
				const countdownInterval = setInterval(() => {
					setCountdown(prev => {
						if (prev <= 1) {
							clearInterval(countdownInterval);
							setTimeout(() => router.push("/"), 0);
							return 0;
						}
						return prev - 1;
					});
				}, 1000);
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
					<p className="text-lg text-gray-600 mb-4">
						Votre commande a été confirmée et sera prête pour le retrait.
					</p>
					<p className="text-sm text-gray-500 mb-8">
						Retour à l&apos;accueil dans {countdown} secondes...
					</p>
				</div>
				
				{orderDetails && (
					<div className="bg-gray-50 rounded-lg p-6 mb-8">
						<h2 className="text-xl font-semibold mb-4">Détails de votre commande</h2>
						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="font-medium">Numéro de commande:</span>
								<span className="font-mono text-lg font-bold text-patisserie-coral">
									{orderDetails.orderNumber || orderDetails.id.slice(-8)}
								</span>
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
						Vous receverez également un email de rappel 24h avant le retrait.
					</p>
				</div>
				
				<div className="flex gap-4 justify-center">
					<Link
						href="/"
						className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors"
					>
						Retour à l&apos;accueil
					</Link>
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