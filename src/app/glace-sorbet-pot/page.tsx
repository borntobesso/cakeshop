import ProductListing from '@/components/ProductListing'

export default function GlaceSorbetPotPage() {
  return (
    <ProductListing
      categorySlug="glace-sorbet-pot"
      title="Glace & Sorbet en Pot"
      description="Glaces et sorbets artisanaux à emporter, préparés avec des ingrédients naturels et des saveurs authentiques pour prolonger le plaisir à la maison."
      showPrices={true}
      allowAddToCart={true}
      specialSizes={false}
    />
  )
}