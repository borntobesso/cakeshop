"use client"

import { useState } from "react"

interface PreAuthFormProps {
  orderId: string
  amount: number
  customerEmail: string
  customerName: string
  onSuccess: () => void
  onError: (error: string) => void
}

export default function PreAuthForm({ orderId, amount, customerEmail, customerName, onSuccess, onError }: PreAuthFormProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePreAuth = async () => {
    setIsProcessing(true)

    try {
      // Create pre-authorization checkout session
      const response = await fetch('/api/preauth/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount,
          customerEmail,
          customerName
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to Stripe Checkout for pre-authorization
        if (data.url) {
          window.location.href = data.url
        } else {
          onError("URL de redirection manquante")
        }
      } else {
        const errorData = await response.json()
        onError(errorData.error || "Erreur lors de la création de la pré-autorisation")
      }
    } catch (error) {
      onError("Erreur de connexion lors de la création de la pré-autorisation")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">🔒 Garantie par carte de crédit requise par mesure de sécurité</h3>
        <p className="text-sm text-blue-700 mb-2">
          En tant que nouveau client, nous devons pré-autoriser votre carte de crédit par mesure de sécurité.
        </p>
        <ul className="text-xs text-blue-600 list-disc list-inside space-y-1">
          <li><strong>Aucune charge ne sera effectuée maintenant</strong></li>
          <li>Votre carte sera seulement "réservée" pour le montant de {amount.toFixed(2)}€</li>
          <li>Le jour du retrait : payez en espèces → la réservation est automatiquement annulée</li>
          <li>Le jour du retrait : payez avec cette carte → le paiement est finalisé</li>
          <li>Si vous ne venez pas récupérer votre commande → la réservation expire automatiquement</li>
        </ul>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">💳 Comment ça marche ?</h4>
        <p className="text-sm text-yellow-700">
          Vous allez être redirigé vers une page sécurisée pour saisir vos informations de carte.
          Cette étape garantit votre commande sans vous débiter immédiatement.
        </p>
      </div>

      <button
        onClick={handlePreAuth}
        disabled={isProcessing}
        className="w-full bg-blue-700 text-white py-3 px-4 rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Redirection en cours...
          </div>
        ) : (
          "Continuer vers l'empreinte bancaire"
        )}
      </button>
    </div>
  )
}