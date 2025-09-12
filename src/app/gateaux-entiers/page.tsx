import ProductListing from '@/components/ProductListing'

export default function WholeGateauPage() {
  return (
    <ProductListing
      categorySlug="gateaux-entiers"
      title="Nos Gâteaux Entiers"
      description="Toutes nos pâtisseries peuvent être commandées en gâteaux entiers pour vos occasions spéciales. Commande à passer au moins 48h à l'avance pour garantir la fraîcheur et la qualité de nos créations artisanales."
      showPrices={true}
      allowAddToCart={true}
      specialSizes={true}
    />
  )
} 