import ProductListing from '@/components/ProductListing'

export default function CakeGateauxVoyagePage() {
  return (
    <ProductListing
      categorySlug="cake-gateaux-voyage"
      title="Cake & Gâteaux de Voyage"
      description="Gâteaux parfaits pour vos voyages et déplacements, conçus pour être transportés facilement tout en conservant leur fraîcheur et leur goût."
      showPrices={true}
      allowAddToCart={true}
      specialSizes={false}
    />
  )
}