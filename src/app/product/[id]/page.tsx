'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { DatabaseProduct } from '@/types/database'
import Carousel from '@/components/Carousel'
import ProductCard from '@/components/ProductCard'

export default function ProductDetailPage() {
  const params = useParams()
  const { addToCart, openCart } = useCart()
  const [product, setProduct] = useState<DatabaseProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedPrice, setSelectedPrice] = useState<number>(0)
  const [quantity, setQuantity] = useState(1)
  const [showCartSuccess, setShowCartSuccess] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<DatabaseProduct[]>([])
  const [loadingRelated, setLoadingRelated] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`)
        if (!response.ok) {
          throw new Error('Product not found')
        }
        const data = await response.json()
        console.log('Fetched product data:', data.product)
        console.log('preparationTime in product:', data.product.preparationTime)
        setProduct(data.product)

        // Set default size and price
        if (data.product.sizeOptions && data.product.sizeOptions.length > 0) {
          setSelectedSize(data.product.sizeOptions[0].size)
          setSelectedPrice(data.product.sizeOptions[0].price)
        } else {
          setSelectedSize('individuel')
          setSelectedPrice(data.product.price)
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        setError('Product not found')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!params.id) return
      
      setLoadingRelated(true)
      try {
        const response = await fetch(`/api/products/${params.id}/related`)
        if (response.ok) {
          const data = await response.json()
          setRelatedProducts(data.products || [])
        }
      } catch (error) {
        console.error('Error fetching related products:', error)
      } finally {
        setLoadingRelated(false)
      }
    }

    if (params.id && product) {
      fetchRelatedProducts()
    }
  }, [params.id, product])

  const handleAddToCart = () => {
    if (!product) return

    console.log('Product before creating cart item:', product)
    console.log('product.preparationTime:', product.preparationTime)

    const cartItem = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: selectedPrice,
      image: product.image,
      size: selectedSize,
      quantity: quantity,
      preparationTime: product.preparationTime
    }

    console.log('Cart item being added:', cartItem)
    addToCart(cartItem)
    setShowCartSuccess(true)
    openCart()
    setTimeout(() => setShowCartSuccess(false), 3000)
  }

  const calculatePickupDate = () => {
    const now = new Date()
    const preparationHours = product?.preparationTime || 24 // Default 24h
    const pickupDate = new Date(now.getTime() + preparationHours * 60 * 60 * 1000)
    
    return pickupDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-lg text-gray-500">Chargement du produit...</div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-lg text-red-500">{error || 'Produit non trouvé'}</div>
          <Link href="/" className="text-patisserie-coral hover:text-patisserie-yellow mt-4 inline-block">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex space-x-2 text-sm text-gray-500">
          <li><Link href="/" className="hover:text-patisserie-coral">Accueil</Link></li>
          <li>/</li>
          <li><Link href={`/${product.category.slug}`} className="hover:text-patisserie-coral">{product.category.name}</Link></li>
          <li>/</li>
          <li className="text-gray-700">{product.name}</li>
        </ol>
      </nav>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          
          {/* Additional images gallery */}
          {product.imageGallery && product.imageGallery.length > 0 && (
            <Carousel
              itemsPerView={4}
              gap={8}
              showArrows={product.imageGallery.length > 4}
              showDots={false}
              className="mt-4"
            >
              {product.imageGallery.map((image, index) => (
                <div key={index} className="relative aspect-square bg-gray-100 rounded overflow-hidden">
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover cursor-pointer hover:opacity-80 transition-opacity duration-200"
                  />
                </div>
              ))}
            </Carousel>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-serif mb-2">{product.name}</h1>
            <p className="text-gray-600 text-lg">{product.description}</p>
            {product.longDescription && (
              <p className="text-gray-700 mt-4">{product.longDescription}</p>
            )}
          </div>

          {/* Price */}
          <div className="text-2xl font-bold text-patisserie-coral">
            {selectedPrice}€
          </div>

          {/* Size Selection */}
          {product.sizeOptions && product.sizeOptions.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Taille</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizeOptions.map((option) => (
                  <button
                    key={option.size}
                    onClick={() => {
                      setSelectedSize(option.size)
                      setSelectedPrice(option.price)
                    }}
                    className={`px-4 py-2 rounded-md border transition-colors ${
                      selectedSize === option.size
                        ? 'bg-patisserie-coral text-white border-patisserie-coral'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-patisserie-coral'
                    }`}
                  >
                    {option.size} - {option.price}€
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selection */}
          <div>
            <h3 className="font-medium mb-3">Quantité</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-patisserie-coral"
              >
                -
              </button>
              <span className="text-lg font-medium w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-patisserie-coral"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!product.isAvailable}
            className={`w-full py-3 px-6 rounded-md font-medium transition-colors ${
              product.isAvailable
                ? 'bg-patisserie-coral hover:bg-patisserie-yellow text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {product.isAvailable ? 'Ajouter au panier' : 'Produit indisponible'}
          </button>

          {/* Success Message */}
          {showCartSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Produit ajouté au panier avec succès !
            </div>
          )}

          {/* Click & Collect Info */}
          {product.availableForPickup && (
            <div className="bg-patisserie-mint p-4 rounded-lg">
              <h3 className="font-medium mb-2">📅 Click & Collect</h3>
              <p className="text-sm text-gray-700">
                Disponible pour retrait le <strong>{calculatePickupDate()}</strong>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Temps de préparation : {product.preparationTime || 24}h
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button className="border-b-2 border-patisserie-coral text-patisserie-coral py-2 px-1 text-sm font-medium">
              Détails
            </button>
          </nav>
        </div>
        
        <div className="mt-6 grid md:grid-cols-3 gap-8">
          {/* Ingredients */}
          {product.ingredients && (
            <div>
              <h3 className="font-medium mb-3">🥄 Ingrédients</h3>
              <p className="text-sm text-gray-700">{product.ingredients}</p>
            </div>
          )}

          {/* Storage */}
          {product.storage && (
            <div>
              <h3 className="font-medium mb-3">🏠 Conservation</h3>
              <p className="text-sm text-gray-700">{product.storage}</p>
            </div>
          )}

          {/* Allergens */}
          {product.allergens && (
            <div>
              <h3 className="font-medium mb-3">⚠️ Allergènes</h3>
              <p className="text-sm text-gray-700">{product.allergens}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-serif mb-8">Vous aimerez aussi</h2>
        
        {loadingRelated ? (
          <div className="text-gray-500 text-center py-8">
            Chargement des produits similaires...
          </div>
        ) : relatedProducts.length > 0 ? (
          <Carousel
            itemsPerView={4}
            gap={20}
            showArrows={true}
            showDots={false}
            className="relative"
          >
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
                showAddToCart={true}
                compact={true}
              />
            ))}
          </Carousel>
        ) : (
          <div className="text-gray-500 text-center py-8">
            Aucun produit similaire trouvé.
          </div>
        )}
      </div>
    </div>
  )
}