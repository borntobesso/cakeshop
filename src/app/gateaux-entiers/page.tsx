'use client'

import { useState } from 'react'
import Image from 'next/image'
import productsData from '@/data/products.json'
import { Product } from '@/types/product'
import SizeSelectionDialog from '@/components/SizeSelectionDialog'
import { useCart } from '@/context/CartContext'

export default function WholeGateauPage() {
  const products = productsData.products as Product[]
  
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { addToCart } = useCart()

  const cakeProducts = products.filter(product => product.category === 'CAKE')

  const handleOrderClick = (product: typeof products[0]) => {
    setSelectedProduct(product)
    setIsDialogOpen(true)
  }

  const handleSizeConfirm = (size: string, price: number) => {
    if (selectedProduct) {
      addToCart({
        ...selectedProduct,
        price,
        size,
        quantity: 1
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif text-center mb-8">Nos Gâteaux Entiers</h1>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        Toutes nos pâtisseries peuvent être commandées en gâteaux entiers pour vos 
        occasions spéciales. Commande à passer au moins 48h à l&apos;avance pour garantir 
        la fraîcheur et la qualité de nos créations artisanales.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cakeProducts.map((product) => (
          <div 
            key={product.id} 
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="relative h-64">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6 bg-patisserie-yellow">
              <h3 className="text-xl font-serif mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <button
                onClick={() => handleOrderClick(product)}
                className="w-full bg-patisserie-coral hover:bg-patisserie-yellow transition-colors duration-300 text-white px-4 py-2 rounded-full font-medium"
              >
                Ajouter au panier
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <SizeSelectionDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onConfirm={handleSizeConfirm}
          productName={selectedProduct.name}
        />
      )}
    </div>
  )
} 