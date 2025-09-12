import ProductListing from '@/components/ProductListing'

export default function BougiesTopperCakePage() {
  return (
    <ProductListing
      categorySlug="bougies-topper-cake"
      title="Bougies & Topper Cake"
      description="Accessoires pour sublimer vos gâteaux : bougies d'anniversaire originales, toppers personnalisés et décorations pour faire de chaque moment une célébration unique."
      showPrices={true}
      allowAddToCart={true}
      specialSizes={false}
    />
  )
}