import Image from "next/image";
import Link from "next/link";
import productsData from '@/data/products.json'

export default function Home() {
  const products = productsData.products
  
  return (
    <main className="min-h-screen bg-patisserie-cream">
      {/* Hero Section */}
      <div className="bg-patisserie-mint py-16">
        <div className="container mx-auto px-4 text-center">
          <Image
            src="/logo-JPG.webp"
            alt="Logo Pâtisserie"
            width={150}
            height={150}
            className="mx-auto mb-8"
          />
          <h1 className="text-4xl md:text-5xl font-serif mb-4">
            Fu Pâtisserie - Coffee Shop - Brunch
          </h1>
          <p className="text-lg mb-8 tn ext-gray-700">
            Christine Fu by FuLiFamily since 2018
          </p>
          <Link 
            href="/patisseries" 
            className="bg-patisserie-coral hover:bg-patisserie-yellow transition-colors duration-300 text-gray-800 px-8 py-3 rounded-full font-medium"
          >
            Voir Notre Menu
          </Link>
        </div>
      </div>

      {/* Featured Products */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-serif text-center mb-12">
          Nos Spécialités
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.slice(0, 3).map((product) => (
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
                <p className="text-gray-600">{product.description}</p>
                <p className="text-gray-800 font-medium mt-2">{product.price}€</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
