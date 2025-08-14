import Link from "next/link";

export default function CheckoutCancelPage() {
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
			<div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
				<div className="text-orange-600 text-6xl mb-4">⚠️</div>
				<h1 className="text-2xl font-bold text-gray-900 mb-4">Paiement annulé</h1>
				<p className="text-gray-600 mb-6">
					Votre paiement a été annulé. Aucun montant n&apos;a été débité.
				</p>
				
				<div className="space-y-3">
					<Link
						href="/panier"
						className="w-full bg-patisserie-coral text-white px-6 py-3 rounded-lg hover:bg-patisserie-yellow transition-colors block"
					>
						Retour au panier
					</Link>
					<Link
						href="/"
						className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors block"
					>
						Retour à l&apos;accueil
					</Link>
				</div>
			</div>
		</div>	
	);
}