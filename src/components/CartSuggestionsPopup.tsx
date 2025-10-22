"use client"

import { useState, Fragment, useEffect } from "react"
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react"
import { useCart } from "@/context/CartContext"
import Image from "next/image"

interface CartSuggestionsPopupProps {
  isOpen: boolean
  onClose: () => void
  onContinue: () => void
}

interface SuggestionProduct {
  id: string
  name: string
  description: string
  price: number
  image: string
  sizeOptions?: { size: string; price: number }[]
  category: {
    name: string
  }
}

export default function CartSuggestionsPopup({
  isOpen,
  onClose,
  onContinue
}: CartSuggestionsPopupProps) {
  const { items, addToCart } = useCart()
  const [suggestions, setSuggestions] = useState<SuggestionProduct[]>([])
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && items.length > 0) {
      fetchSuggestions()
    }
  }, [isOpen, items])

  const fetchSuggestions = async () => {
    setLoading(true)
    try {
      const cartItemIds = items.map(item => item.id.toString())
      const response = await fetch('/api/products/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cartItemIds })
      })

      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions)
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSuggestion = (suggestion: SuggestionProduct) => {
    // Get the base price or first size option price
    const price = suggestion.sizeOptions && suggestion.sizeOptions.length > 0
      ? suggestion.sizeOptions[0].price
      : suggestion.price

    const size = suggestion.sizeOptions && suggestion.sizeOptions.length > 0
      ? suggestion.sizeOptions[0].size
      : undefined

    addToCart({
      id: parseInt(suggestion.id),
      name: suggestion.name,
      description: suggestion.description,
      price: price,
      image: suggestion.image,
      quantity: 1,
      size: size,
      preparationTime: suggestion.preparationTime
    })

    setSelectedSuggestions([...selectedSuggestions, suggestion.id])
  }

  const handleContinue = () => {
    setSelectedSuggestions([])
    onContinue()
  }

  const handleClose = () => {
    setSelectedSuggestions([])
    onClose()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 text-center mb-4"
                >
                  Suggestions pour compléter votre commande
                </DialogTitle>

                <div className="mt-6">
                  {loading ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Aucune suggestion disponible pour le moment.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {suggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="relative w-full h-40 mb-4">
                            <Image
                              src={suggestion.image}
                              alt={suggestion.name}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div className="mb-2">
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                              {suggestion.category.name}
                            </span>
                          </div>
                          <h4 className="text-lg font-medium mb-2">{suggestion.name}</h4>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{suggestion.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-patisserie-coral">
                              {(suggestion.sizeOptions && suggestion.sizeOptions.length > 0
                                ? suggestion.sizeOptions[0].price
                                : suggestion.price
                              ).toFixed(2)}€
                            </span>
                            <button
                              onClick={() => handleAddSuggestion(suggestion)}
                              disabled={selectedSuggestions.includes(suggestion.id)}
                              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                selectedSuggestions.includes(suggestion.id)
                                  ? "bg-green-100 text-green-800 cursor-not-allowed"
                                  : "bg-blue-600 text-white hover:bg-blue-700"
                              }`}
                            >
                              {selectedSuggestions.includes(suggestion.id) ? "Ajouté ✓" : "Ajouter"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-center gap-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={handleClose}
                  >
                    Retour au panier
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-green-700 px-6 py-2 text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700"
                    onClick={handleContinue}
                  >
                    Continuer la commande
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}