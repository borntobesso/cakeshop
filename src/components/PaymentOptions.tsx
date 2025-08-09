"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface PaymentOptionsProps {
	totalAmount: number;
	onPaymentMethodChange: (method: "online" | "onsite") => void;
	selectedMethod?: "online" | "onsite";
}

export default function PaymentOptions({
	totalAmount,
	onPaymentMethodChange,
	selectedMethod = "online"
}: PaymentOptionsProps) {
	const { data: session } = useSession();
	const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
	const [specialCode, setSpecialCode] = useState("");
	const [isCodeValid, setIsCodeValid] = useState(false);
	const [showCodeInput, setShowCodeInput] = useState(false);
	
	// Verify first-time user
	useEffect(() => {
		async function checkFirstTimeUser() {
			if (!session?.user?.id) return;
			
			try {
				const response = await fetch(`/api/user/check-first-time?userId=${session.user.id}`);
				const data = await response.json();
				setIsFirstTimeUser(data.isFirstTime);
			} catch (error) {
				console.error("Error checking first-time user: ", error);
			}
		}
		checkFirstTimeUser();
	}, [session?.user?.id]);
	
	// Verify special code
	const handleSpecialCodeSubmit = async () => {
		try {
			const response = await fetch("/api/special-code/validate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ code: specialCode })
			});
			
			const data = await response.json();
			setIsCodeValid(data.valid);
			
			if (data.valid) {
				// permit onsite payment if valid
			} else {
				alert("Code invalide ou expiré");
			}
		} catch (error) {
			console.error("Error validating code: ", error);
			alert("Erreur lors de la validation du code");
		}
	}
	
	const handlePaymentChange = (method: "online" | "onsite") => {
		onPaymentMethodChange(method);
	}
	
	const canPayOnsite = !isFirstTimeUser || isCodeValid;
	
	return (
		<div className="bg-white p-6 rounded-lg shadow-sm border">
			<h3 className="text-lg font-semibold mb-4">Mode de paiement</h3>
			
			{/* Total amount */}
			<div className="mb-4 p-4 bg-gray-50 rounded-lg">
				<div className="flex justify-between items-center">
					<span className="text-lg font-medium">Total:</span>
					<span className="text-2xl font-bold text-patisserie-coral">
						{totalAmount.toFixed(2)}€
					</span>
				</div>
			</div>
			
			{/* Payment options */}
			<div className="space-y-4">
				{/* Online payment (always available) */}
				<div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
					<input
						type="radio"
						id="online"
						name="payment"
						value="online"
						checked={selectedMethod === "online"}
						onChange={() => handlePaymentChange("online")}
						className="mr-3"
					/>
					<label htmlFor="online" className="flex-1 cursor-pointer">
						<div className="font-medium">Paiement en ligne</div>
						<div className="text-sm text-gray-600">Carte bancaire - Paiement sécurisé</div>
					</label>
					<div className="text-green-600 font-medium">✓ Disponible</div>
				</div>
				
				{/* Onsite payment */}
				<div className={`flex items-center p-4 border rounded-lg ${
					canPayOnsite ? "hover:bg-gray-50 cursor-pointer" : "bg-gray-100 cursor-not-allowed"
				}`}>
					<input
						type="radio"
						id="onsite"
						name="payment"
						value="onsite"
						checked={selectedMethod === "onsite"}
						onChange={() => handlePaymentChange("onsite")}
						disabled={!canPayOnsite}
						className="mr-3"
					/>
					<label htmlFor="onsite" className={`flex-1 ${canPayOnsite ? "cursor-pointer" : "cursor-not-allowed"}`}>
						<div className="font-medium">Paiement sur place</div>
						<div className="text-sm text-gray-600">
							Espèces ou carte lors du retrait
						</div>
					</label>
					<div className={`font-medium ${
						canPayOnsite ? "text-green-600" : "text-red-600"
					}`}>
						{canPayOnsite ? "✓ Disponible" : "✗ Non disponible"}
					</div>
				</div>
			</div>
			
			{/* First order information */}
			{isFirstTimeUser && !isCodeValid && (
				<div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
					<div className="flex-items-start">
						<div className="text-blue-600 mr-2">ℹ️</div>
						<div>
							<div className="font-medium text-blue-800">Première commande</div>
							<div className="text-sm text-blue-700 mt-1">
								Pour votre première commandem le paiement en ligne est requis pour éviter les no-shows.
								Si vous préférez payer sur place, contactez-nous pour obtenir un code spécial.
							</div>
							
							{/* Special code input */}
							<div className="mt-3">
								<button
									onClick={() => setShowCodeInput(!showCodeInput)}
									className="text-sm text-blue-600 hover:text-blue-800 underline"
								>
									J&apos;ai un code spécial
								</button>
								
								{showCodeInput && (
									<div className="mt-2 flex-gap-2">
										<input
											type="text"
											value={specialCode}
											onChange={(e) => setSpecialCode(e.target.value.toUpperCase())}
											placeholder="Entrez votre code"
											className="px-3 py-1 border rounded text-sm"
											maxLength={6}
										/>
										<button
											onClick={handleSpecialCodeSubmit}
											className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
										>
											Valider
										</button>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}