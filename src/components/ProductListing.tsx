'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { DatabaseProduct } from '@/types/database'

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
  const { addToCart } = useCart()

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

  const handleAddToCart = (product: DatabaseProduct) => {
    if (!allowAddToCart) return

    // Convert database product to cart format
    const cartItem = {
      id: parseInt(product.id) || 0,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category.slug,
      available: product.isAvailable,
      stock: product.stock,
      size: specialSizes ? undefined : 'individuel', // Will trigger size selection for whole cakes
      quantity: 1
    }

    if (specialSizes) {
      // For gateaux-entiers, we need size selection - this will be handled in the future
      // For now, just add with a default size
      addToCart({ ...cartItem, size: 'individuel' })
    } else {
      addToCart(cartItem)
    }
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
          {products.map((product) => (
            <div 
              key={product.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <Link href={`/product/${product.id}`}>
                <div className="relative h-64 cursor-pointer">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              <div className="p-6">
                <Link href={`/product/${product.id}`}>
                  <h2 className="text-xl font-serif mb-2 hover:text-patisserie-coral transition-colors cursor-pointer">
                    {product.name}
                  </h2>
                </Link>
                <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>
                
                <div className="mt-4 flex justify-between items-center">
                  {showPrices && (
                    <span className="text-lg font-medium">{product.price}€</span>
                  )}
                  {!showPrices && <div></div>}
                  
                  {allowAddToCart && product.isAvailable ? (
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="bg-patisserie-coral hover:bg-patisserie-yellow text-gray-800 px-4 py-2 rounded-full transition-colors"
                    >
                      Ajouter au panier
                    </button>
                  ) : allowAddToCart ? (
                    <span className="text-gray-400 text-sm">Indisponible</span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}