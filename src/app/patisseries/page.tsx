import ProductListing from '@/components/ProductListing'

export default function PatisseriesPage() {
  return (
    <ProductListing
      categorySlug="patisseries"
      title="Nos Pâtisseries"
      description="Découvrez notre sélection de pâtisseries françaises traditionnelles, préparées chaque jour avec des ingrédients frais et de qualité."
      showPrices={true}
      allowAddToCart={true}
      specialSizes={false}
    />
  )
}