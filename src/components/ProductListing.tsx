'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { DatabaseProduct } from '@/types/database'
import SizeSelectionDialog from './SizeSelectionDialog'

interface ProductListingProps {
  categorySlug: string
  title: string
  description: string
  showPrices?: boolean
  allowAddToCart?: boolean
  specialSizes?: boolean // For gateaux-entiers
}

export default function ProductListing({ 
  categorySlug, 
  title, 
  description, 
  showPrices = true, 
  allowAddToCart = true,
  specialSizes = false
}: ProductListingProps) {
  const [products, setProducts] = useState<DatabaseProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<DatabaseProduct | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedSizes, setSelectedSizes] = useState<Record<string, { size: string, price: number }>>({})
  const { addToCart, openCart } = useCart()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`/api/products?category=${categorySlug}`)
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const data = await response.json()
        setProducts(data.products || [])
      } catch (error) {
        console.error('Error fetching products:', error)
        setError('Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [categorySlug])

  // Helper functions
  const calculatePickupDate = (preparationTime: number = 24) => {
    const now = new Date()
    const pickupDate = new Date(now.getTime() + preparationTime * 60 * 60 * 1000)
    return pickupDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  const getDisplayPrice = (product: DatabaseProduct) => {
    if (!product.sizeOptions || product.sizeOptions.length === 0) {
      return `${product.price}€`
    }
    const minPrice = Math.min(...product.sizeOptions.map(opt => opt.price))
    return `À partir de ${minPrice}€`
  }

  const getSmallSizes = (product: DatabaseProduct) => {
    return product.sizeOptions?.filter(option => {
      const parts = parseInt(option.size.split(' ')[0])
      return parts < 10
    }) || []
  }

  const hasLargeSizes = (product: DatabaseProduct) => {
    return product.sizeOptions?.some(option => {
      const parts = parseInt(option.size.split(' ')[0])
      return parts >= 10
    }) || false
  }

  const getCurrentPrice = (product: DatabaseProduct) => {
    const selected = selectedSizes[product.id]
    if (selected) {
      return selected.price
    }
    
    if (product.sizeOptions && product.sizeOptions.length > 0) {
      return Math.min(...product.sizeOptions.map(opt => opt.price))
    }
    
    return product.price
  }

  const getCurrentSize = (product: DatabaseProduct) => {
    const selected = selectedSizes[product.id]
    if (selected) {
      return selected.size
    }
    
    if (product.sizeOptions && product.sizeOptions.length > 0) {
      return product.sizeOptions[0].size
    }
    
    return 'individuel'
  }

  const handleSizeSelect = (product: DatabaseProduct, size: string, price: number) => {
    setSelectedSizes(prev => ({
      ...prev,
      [product.id]: { size, price }
    }))
  }

  const handleLargeSizeSelect = (product: DatabaseProduct) => {
    setSelectedProduct(product)
    setIsDialogOpen(true)
  }

  const handleDialogConfirm = (size: string, price: number) => {
    if (selectedProduct) {
      handleSizeSelect(selectedProduct, size, price)
      handleAddToCart(selectedProduct, size, price)
    }
  }

  const handleAddToCart = (product: DatabaseProduct, customSize?: string, customPrice?: number) => {
    if (!allowAddToCart) return

    const size = customSize || getCurrentSize(product)
    const price = customPrice || getCurrentPrice(product)

    console.log('ProductListing - Adding to cart, product:', product)
    console.log('ProductListing - preparationTime:', product.preparationTime)

    // Convert database product to cart format
    const cartItem = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: price,
      image: product.image,
      size: size,
      quantity: 1,
      preparationTime: product.preparationTime
    }

    console.log('ProductListing - Cart item:', cartItem)
    addToCart(cartItem)
    openCart()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-lg text-gray-500">Chargement des produits...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif text-center mb-8">
        {title}
      </h1>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        {description}
      </p>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Aucun produit disponible dans cette catégorie pour le moment.
          </p>
        </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
              const isWholeCake = specialSizes || (product.sizeOptions && product.sizeOptions.length > 0)
              const smallSizes = getSmallSizes(product)
              const hasLargeSizesAvailable = hasLargeSizes(product)
              
              return (
                <div 
                  key={product.id}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <Link href={`/product/${product.id}`}>
                    <div className="relative w-full aspect-square cursor-pointer">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                  
                  <div className="p-6">
                    {/* Product Name and Price (moved to same line, price aligned right) */}
                    <div className="flex justify-between items-start mb-2">
                      <Link href={`/product/${product.id}`}>
                        <h2 className="text-xl font-serif hover:text-patisserie-coral transition-colors cursor-pointer flex-1 mr-4">
                          {product.name}
                        </h2>
                      </Link>
                      {showPrices && (
                        <span className="text-lg font-medium text-patisserie-coral whitespace-nowrap">
                          {isWholeCake ? getDisplayPrice(product) : `${product.price}€`}
                        </span>
                      )}
                    </div>
                      
                    {/* Pickup Date Availability */}
                    <p className="text-sm text-gray-500 mb-3">
                      📅 Disponible {calculatePickupDate(product.preparationTime)}
                    </p>
                      
                    <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>
                      
                    {/* Size Selection for Whole Cakes */}
                    {isWholeCake && allowAddToCart && product.isAvailable && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Taille:</h4>
                        
                        {/* Small sizes buttons (4p, 6p, 8p) */}
                        <div className="flex flex-wrap gap-2 mb-2">
                          {smallSizes.map((option) => (
                            <button
                              key={option.size}
                              onClick={() => handleSizeSelect(product, option.size, option.price)}
                              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                                getCurrentSize(product) === option.size
                                  ? 'bg-patisserie-coral text-white border-patisserie-coral'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-patisserie-coral'
                              }`}
                            >
                              {option.size.replace(' parts', 'p')} - {option.price}€
                            </button>
                          ))}
                          
                          {/* 10 ou plus button */}
                          {hasLargeSizesAvailable && (
                            <button
                              onClick={() => handleLargeSizeSelect(product)}
                              className="px-3 py-1 text-sm rounded-full border border-gray-300 bg-white text-gray-700 hover:border-patisserie-coral transition-colors"
                            >
                              10 ou plus
                            </button>
                          )}
                        </div>
                      
                      {/* Selected size display with dynamic price */}
                      <div className="text-sm text-gray-600">
                        Sélectionné: {getCurrentSize(product)} - <span className="font-medium text-patisserie-coral">{getCurrentPrice(product)}€</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Add to Cart Button */}
                  <div className="mt-4">
                    {allowAddToCart && product.isAvailable ? (
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="w-full bg-patisserie-coral hover:bg-patisserie-yellow text-white px-4 py-2 rounded-full transition-colors font-medium"
                      >
                        Ajouter au panier
                      </button>
                    ) : allowAddToCart ? (
                      <div className="w-full text-center text-gray-400 text-sm py-2">
                        Indisponible
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {/* Size Selection Dialog */}
      <SizeSelectionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDialogConfirm}
        productName={selectedProduct?.name || ''}
        sizeOptions={selectedProduct?.sizeOptions || []}
        showLargeSizesOnly={true}
      /> 
    </div>
  )
}