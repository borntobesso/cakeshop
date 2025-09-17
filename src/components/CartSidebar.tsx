'use client'

import { useCart } from '@/context/CartContext'
import Image from 'next/image'
import Link from 'next/link'
import { XMarkIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useEffect } from 'react'

export default function CartSidebar() {
  const { 
    items, 
    isCartOpen, 
    closeCart, 
    updateQuantity, 
    removeFromCart, 
    getTotalPrice, 
    getTotalItems 
  } = useCart()

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isCartOpen])

  const handleQuantityChange = (id: number | string, size: string | undefined, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id, size)
    } else {
      updateQuantity(id, newQuantity, size)
    }
  }

  const handleRemoveItem = (id: number | string, size: string | undefined) => {
    removeFromCart(id, size)
  }

  if (!isCartOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={closeCart}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">
              Panier ({getTotalItems()} {getTotalItems() === 1 ? 'article' : 'articles'})
            </h2>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">Votre panier est vide</div>
                <Link 
                  href="/"
                  onClick={closeCart}
                  className="text-patisserie-coral hover:text-patisserie-yellow transition-colors"
                >
                  Continuer vos achats
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    {/* Product Image */}
                    <div className="relative w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{item.name}</h3>
                      {item.size && (
                        <p className="text-xs text-gray-600 mt-1">Taille: {item.size}</p>
                      )}
                      <div className="text-sm font-semibold text-patisserie-coral mt-1">
                        {item.price}€
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.size, item.quantity - 1)}
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:border-patisserie-coral transition-colors"
                          >
                            <MinusIcon className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.size, item.quantity + 1)}
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:border-patisserie-coral transition-colors"
                          >
                            <PlusIcon className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.id, item.size)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              {/* Total */}
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span className="text-patisserie-coral">{getTotalPrice().toFixed(2)}€</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Link 
                  href="/panier"
                  onClick={closeCart}
                  className="w-full bg-patisserie-coral hover:bg-patisserie-yellow text-white py-3 px-4 rounded-md text-center font-medium transition-colors block"
                >
                  Voir le panier
                </Link>
                <Link 
                  href="/panier"
                  onClick={closeCart}
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 px-4 rounded-md text-center font-medium transition-colors block"
                >
                  Commander
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}