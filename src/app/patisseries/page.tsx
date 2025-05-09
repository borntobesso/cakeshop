import Image from 'next/image';
import productsData from '@/data/products.json'
import { Product } from '@/types/product'

export default function PatisseriesPage() {
  const products = productsData.products as Product[]
  const pastries = products.filter(
    (product) => product.category === 'patisserie'
  ) as Product[];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif text-center mb-8">
        Nos Pâtisseries
      </h1>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        Découvrez notre sélection de pâtisseries françaises traditionnelles,
        préparées chaque jour avec des ingrédients frais et de qualité.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pastries.map((pastry) => (
          <div 
            key={pastry.id}
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="relative h-64">
              <Image
                src={pastry.image}
                alt={pastry.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-serif mb-2">{pastry.name}</h2>
              <p className="text-gray-600 mb-4">{pastry.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-lg font-medium">{pastry.price}€</span>
                <button 
                  className="bg-patisserie-coral hover:bg-patisserie-yellow text-gray-800 px-4 py-2 rounded-full transition-colors"
                >
                  Ajouter au panier
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 