'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { DatabaseProduct } from '@/types/database'

interface ProductCardProps {
  product: DatabaseProduct
  showAddToCart?: boolean
  compact?: boolean
}

export default function ProductCard({ 
  product, 
  showAddToCart = false,
  compact = false 
}: ProductCardProps) {
  const { addToCart, openCart } = useCart()
  const [showCartSuccess, setShowCartSuccess] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!product.isAvailable) return

    const defaultSize = product.sizeOptions && product.sizeOptions.length > 0
      ? product.sizeOptions[0].size
      : 'individuel'
    const defaultPrice = product.sizeOptions && product.sizeOptions.length > 0
      ? product.sizeOptions[0].price
      : product.price

    console.log('ProductCard - Adding to cart, product:', product)
    console.log('ProductCard - preparationTime:', product.preparationTime)

    const cartItem = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: defaultPrice,
      image: product.image,
      size: defaultSize,
      quantity: 1,
      preparationTime: product.preparationTime
    }

    console.log('ProductCard - Cart item:', cartItem)
    addToCart(cartItem)
    setShowCartSuccess(true)
    openCart()
    setTimeout(() => setShowCartSuccess(false), 2000)
  }

  const displayPrice = product.sizeOptions && product.sizeOptions.length > 0
    ? `À partir de ${Math.min(...product.sizeOptions.map(opt => opt.price))}€`
    : `${product.price}€`

  return (
    <div className={`group relative ${compact ? 'h-64' : 'h-80'}`}>
      <Link href={`/product/${product.id}`} className="block h-full">
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col overflow-hidden">
          {/* Product Image */}
          <div className={`relative bg-gray-100 ${compact ? 'h-40' : 'h-48'} overflow-hidden`}>
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
            
            {/* Availability Badge */}
            {!product.isAvailable && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                Indisponible
              </div>
            )}

            {/* Quick Add Button */}
            {showAddToCart && product.isAvailable && (
              <button
                onClick={handleAddToCart}
                className="absolute bottom-2 right-2 bg-patisserie-coral hover:bg-patisserie-yellow text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                aria-label="Ajouter au panier"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            )}

            {/* Success Message */}
            {showCartSuccess && (
              <div className="absolute inset-0 bg-green-500/90 flex items-center justify-center">
                <div className="text-white text-sm font-medium text-center">
                  ✓ Ajouté au panier
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-3 flex-1 flex flex-col">
            <h3 className={`font-medium text-gray-900 mb-1 ${compact ? 'text-sm' : 'text-base'} line-clamp-2`}>
              {product.name}
            </h3>
            
            {!compact && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2 flex-1">
                {product.description}
              </p>
            )}

            <div className="mt-auto">
              <div className={`font-bold text-patisserie-coral ${compact ? 'text-sm' : 'text-base'}`}>
                {displayPrice}
              </div>
              
              {/* Category */}
              <div className="text-xs text-gray-500 mt-1">
                {product.category.name}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}