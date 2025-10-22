"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

function PreAuthSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(15);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (sessionId && !isProcessing) {
      processPreAuth(sessionId);
    } else if (!sessionId) {
      setError("Session ID manquant");
      setIsLoading(false);
    }
  }, [searchParams, isProcessing]);

  const processPreAuth = async (sessionId: string) => {
    if (isProcessing) return; // Prevent duplicate calls
    setIsProcessing(true);

    try {
      const response = await fetch("/api/preauth/process-success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });

      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data.order);
        
        // Clear cart after successful pre-authorization processing
        clearCart();

        // Start countdown and redirect to home
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              setTimeout(() => router.push("/"), 0); // Defer router navigation
              return 0;
            }
            return prev - 1;
          });
        }, 1000); // Should be 1000ms for per-second countdown
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Erreur lors du traitement de la pré-autorisation");
      }
    } catch (error) {
      setError("Erreur de connexion");
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Traitement de votre pré-autorisation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/panier" className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors">
            Retour au panier
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Pré-autorisation réussie !</h1>
          <p className="text-lg text-gray-600 mb-4">
            Votre carte a été pré-autorisée avec succès. Votre commande est confirmée.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Retour à l'accueil dans {countdown} secondes...
          </p>
        </div>

        {orderDetails && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Détails de votre commande</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Numéro de commande:</span>
                <span className="font-mono text-lg font-bold text-blue-600">
                  {orderDetails.orderNumber || orderDetails.id.slice(-8)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date de retrait:</span>
                <span>{orderDetails.pickupDate} à {orderDetails.pickupTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Montant pré-autorisé:</span>
                <span className="font-bold">{orderDetails.totalAmount}€</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-blue-800 mb-2">💳 Pré-autorisation confirmée</h3>
          <p className="text-sm text-blue-700 mb-2">
            Votre carte de crédit a été pré-autorisée pour le montant de votre commande.
          </p>
          <ul className="text-xs text-blue-600 list-disc list-inside space-y-1">
            <li>Aucun débit n'a été effectué sur votre compte</li>
            <li>Le jour du retrait, vous pourrez payer en espèces ou avec cette carte</li>
            <li>Si vous payez autrement, la pré-autorisation sera automatiquement annulée</li>
            <li>Vous recevrez un email de rappel 24h avant le retrait</li>
          </ul>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors"
          >
            Retour à l'accueil
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

export default function PreAuthSuccessPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Chargement...</div>}>
      <PreAuthSuccessContent />
    </Suspense>
  );
}