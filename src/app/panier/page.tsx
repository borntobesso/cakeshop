'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import Image from 'next/image'
import CheckoutForm from '@/components/CheckoutForm'
import { sendOrderConfirmation } from '@/services/notificationService'

interface OrderDetails {
  customerName: string
  email: string
  phone: string
  pickupDate: string
  pickupTime: string
}

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleCheckout = async (orderDetails: OrderDetails) => {
    const orderData = {
      ...orderDetails,
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        size: item.size
      })),
      totalPrice
    }

    const success = await sendOrderConfirmation(orderData)
    if (success) {
      clearCart()
      setIsCheckoutOpen(false)
      // TODO: Show success message
    } else {
      // TODO: Show error message
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif text-center mb-8">Votre Panier</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Votre panier est vide</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {items.map((item) => (
            <div
              key={`${item.id}-${item.size}`}
              className="bg-white rounded-lg shadow-sm p-6 flex flex-col md:flex-row gap-6"
            >
              <div className="relative w-full md:w-48 h-48">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-serif mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-2">{item.description}</p>
                {item.size && (
                  <p className="text-gray-600 mb-2">Taille: {item.size}</p>
                )}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-medium">{item.price * item.quantity}€</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
            <div className="flex justify-between items-center">
              <span className="text-xl font-medium">Total</span>
              <span className="text-2xl font-medium">{totalPrice}€</span>
            </div>
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full mt-6 bg-patisserie-coral hover:bg-patisserie-yellow transition-colors duration-300 text-white px-6 py-3 rounded-full font-medium"
            >
              Passer la commande
            </button>
          </div>
        </div>
      )}

      <CheckoutForm
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onConfirm={handleCheckout}
      />
    </div>
  )
} 