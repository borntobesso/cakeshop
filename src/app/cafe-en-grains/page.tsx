import ProductListing from '@/components/ProductListing'

export default function CafeEnGrainsPage() {
  return (
    <ProductListing
      categorySlug="cafe-en-grains"
      title="Café en Grains"
      description="Découvrez notre sélection de cafés en grains de spécialité, soigneusement sélectionnés pour vous permettre de déguster à la maison les mêmes saveurs qu'en boutique."
      showPrices={true}
      allowAddToCart={true}
      specialSizes={false}
    />
  )
}