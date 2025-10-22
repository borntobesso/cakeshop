"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface PaymentOptionsProps {
	totalAmount: number;
	onPaymentMethodChange: (method: "online" | "onsite") => void;
	selectedMethod?: "online" | "onsite";
	onPaymentDataChange: (data: { specialCode: string; isCodeValid: boolean; isFirstTimeUser: boolean }) => void;
	showCustomAlert: (title: string, message: string, type: "success" | "error" | "info", closeMainForm?: boolean) => void;
}

export default function PaymentOptions({
	totalAmount,
	onPaymentMethodChange,
	selectedMethod = "online",
	onPaymentDataChange,
	showCustomAlert
}: PaymentOptionsProps) {
	const { data: session } = useSession();
	const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
	const [specialCode, setSpecialCode] = useState("");
	const [isCodeValid, setIsCodeValid] = useState(false);
	const [showCodeInput, setShowCodeInput] = useState(false);
	const [isValidating, setIsValidating] = useState(false);
	
	useEffect(() => {
		onPaymentDataChange({
			specialCode,
			isCodeValid,
			isFirstTimeUser
		});
	}, [specialCode, isCodeValid, isFirstTimeUser, onPaymentDataChange])
	
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
		if (!specialCode.trim()) {
			showCustomAlert("Code Requis", "Veuillez entrer un code.", "info", false);
			return;
		}
		
		setIsValidating(true);
		
		try {
			const response = await fetch("/api/special-code/validate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ code: specialCode.trim() })
			});
			
			const data = await response.json();
			setIsCodeValid(data.valid);
			
			if (data.valid) {
				showCustomAlert("Code Valide!", "Votre code est valide. Vous pouvez maintenant choisir le paiement sur place.", "success", false);
			} else {
				showCustomAlert("Code Invalide", "Le code entré est invalide ou a expiré.", "error", false);
				setSpecialCode("");
			}
		} catch (error) {
			console.error("Error validating code: ", error);
			showCustomAlert("Erreur", "Une erreur est survenue lors de la validation du code.", "error", false);
		} finally {
			setIsValidating(false);
		}
	}
	
	const handleCodeChange = (value: string) => {
		setSpecialCode(value.toUpperCase());
		if (isCodeValid) {
			setIsCodeValid(false); // Re-initialize validity if code changes
		}
	}
	
	const handlePaymentChange = (method: "online" | "onsite") => {
		onPaymentMethodChange(method);
	}
	
	const canPayOnsite = true; // All users can select onsite payment - first-time users will go through pre-authorization
	
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
				} ${
					selectedMethod === "onsite" && canPayOnsite ? "border-patisserie-coral bg-patisserie-coral bg-opacity-10" : "border-gray-200"
				}`}>
					<input
						type="radio"
						id="onsite"
						name="payment"
						value="onsite"
						checked={selectedMethod === "onsite"}
						onChange={() => handlePaymentChange("onsite")}
						disabled={!canPayOnsite}
						className="mr-3 text-patisserie-coral focus:ring-patisserie-coral"
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
						<div className="text-blue-600 mr-2">🔒</div>
						<div>
							<div className="font-medium text-blue-800">Première commande - Garantie requise</div>
							<div className="text-sm text-blue-700 mt-1">
								Si vous choisissez "Paiement sur place", vous devrez d'abord pré-autoriser une carte de crédit.
								Cette étape garantit votre commande sans vous débiter - vous pourrez payer en espèces lors du retrait.
							</div>

							<div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
								<div className="text-sm text-yellow-800">
									💳 <strong>Comment ça marche ?</strong><br/>
									• Étape 1 : Pré-autorisation de votre carte (pas de débit)<br/>
									• Étape 2 : Retrait - payez en espèces → la pré-autorisation est annulée<br/>
									• Étape 2 bis : Retrait - payez avec cette carte → le paiement est finalisé
								</div>
							</div>

							{/* Display special code option for gift cards */}
							{isCodeValid && (
								<div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
									<div className="flex items-center text-green-800">
										<span className="mr-2">🎁</span>
										<span className="font-medium">Carte cadeau appliquée: {specialCode}</span>
									</div>
									<div className="text-sm text-green-700 mt-1">
										Votre carte cadeau est valide !
									</div>
								</div>
							)}

							{/* Gift card input */}
							<div className="mt-3">
								<button
									onClick={() => setShowCodeInput(!showCodeInput)}
									className="text-sm text-blue-600 hover:text-blue-800 underline"
									disabled={isCodeValid}
									type="button"
								>
									{isCodeValid ? "Carte cadeau appliquée" : "J'ai une carte cadeau"}
								</button>

								{showCodeInput && !isCodeValid && (
									<div className="mt-2 space-y-2">
										<div className="flex gap-2">
											<input
												type="text"
												value={specialCode}
												onChange={(e) => handleCodeChange(e.target.value)}
												placeholder="Code de carte cadeau"
												className="px-3 py-2 border rounded text-sm flex-1 uppercase"
												maxLength={6}
												disabled={isValidating}
											/>
											<button
												type="button"
												onClick={handleSpecialCodeSubmit}
												disabled={isValidating || specialCode.length !== 6}
												className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
											>
												{isValidating ? (
													<div className="flex items-center">
														<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
														<span>...</span>
													</div>
												) : (
													"Appliquer"
												)}
											</button>
										</div>
										<div className="text-xs text-gray-500">
											Code de 6 caractères
										</div>
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