import ProductListing from '@/components/ProductListing'

export default function CarteCodeauPage() {
  return (
    <ProductListing
      categorySlug="carte-cadeau"
      title="Cartes Cadeaux"
      description="Offrez le plaisir de nos pâtisseries avec nos cartes cadeaux. Le cadeau parfait pour partager la gourmandise et faire découvrir notre univers sucré à vos proches."
      showPrices={true}
      allowAddToCart={true}
      specialSizes={false}
    />
  )
}