'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import Image from 'next/image'
import CheckoutForm from '@/components/CheckoutForm'
import { useSession } from 'next-auth/react'

interface OrderDetails {
  customerName: string
  email: string
  phone: string
  pickupDate: string
  pickupTime: string
}

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart()
  const { data: session } = useSession()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | null; message: string | null }>({
    type: null,
    message: null,
  })

  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleCheckout = async (orderDetails: OrderDetails) => {
    setNotification({ type: null, message: null }) // Clear previous notifications
    
    if (!session) {
      setNotification({ type: 'error', message: 'Vous devez être connecté pour passer commande.' })
      return false
    }

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: orderDetails.customerName,
          email: orderDetails.email,
          phone: orderDetails.phone,
          pickupDate: orderDetails.pickupDate,
          pickupTime: orderDetails.pickupTime,
          paymentMethod: "onsite",
          items: items.map(item => ({
            id: item.id.toString(),
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            size: item.size
          }))
        })
      })

      if (response.ok) {
        clearCart()
        // Don't close checkout here - let CheckoutForm handle it
        // setIsCheckoutOpen(false)
        setNotification({ type: 'success', message: 'Votre commande a été enregistrée avec succès !' })
        return true
      } else {
        const errorData = await response.json()
        setNotification({ type: 'error', message: errorData.error || 'Une erreur est survenue lors de l\'enregistrement de votre commande.' })
        return false
      }
    } catch (error) {
      console.error('Order creation error:', error)
      setNotification({ type: 'error', message: 'Une erreur est survenue lors de l\'enregistrement de votre commande. Veuillez réessayer.' })
      return false
    }
  }

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false)
    setNotification({ type: null, message: null }) // Clear notification when closing checkout
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
        onClose={handleCloseCheckout}
        onConfirm={handleCheckout}
      />
      
      {notification.message && (
        <div
          className={`mt-8 p-4 rounded-md text-white ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  )
} 