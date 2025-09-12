import ProductListing from '@/components/ProductListing'

export default function BrunchPage() {
  return (
    <ProductListing
      categorySlug="brunch"
      title="Notre Brunch"
      description="Découvrez nos plats brunch fusion asiatique-française, préparés avec des ingrédients frais et des saveurs authentiques pour un moment gourmand unique."
      showPrices={false}
      allowAddToCart={false}
      specialSizes={false}
    />
  )
}