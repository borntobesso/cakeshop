export default function GateauxEvenementielsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif text-center mb-8">
        Gâteaux Événementiels
      </h1>
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-lg text-gray-600 leading-relaxed">
            Créations sur mesure pour vos événements spéciaux : mariages, anniversaires, 
            baptêmes, entreprises... Nous donnons vie à vos rêves les plus gourmands.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-serif mb-4 text-gray-600">Nos Créations</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <span className="text-patisserie-coral mr-3">💒</span>
                Wedding cakes personnalisés
              </li>
              <li className="flex items-center">
                <span className="text-patisserie-coral mr-3">🎂</span>
                Gâteaux d&apos;anniversaire uniques
              </li>
              <li className="flex items-center">
                <span className="text-patisserie-coral mr-3">🏢</span>
                Pâtisseries corporate
              </li>
              <li className="flex items-center">
                <span className="text-patisserie-coral mr-3">🎈</span>
                Desserts pour événements
              </li>
              <li className="flex items-center">
                <span className="text-patisserie-coral mr-3">✨</span>
                Créations thématiques
              </li>
            </ul>
          </div>

          <div className="bg-patisserie-mint rounded-lg p-6">
            <h2 className="text-2xl font-serif mb-4 text-gray-800">Comment Procéder</h2>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start">
                <span className="bg-patisserie-coral text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">1</span>
                <p>Contactez-nous pour discuter de votre projet</p>
              </div>
              <div className="flex items-start">
                <span className="bg-patisserie-coral text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">2</span>
                <p>Nous étudions vos souhaits et proposons un devis</p>
              </div>
              <div className="flex items-start">
                <span className="bg-patisserie-coral text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">3</span>
                <p>Création de votre gâteau unique</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-2xl font-serif mb-6 text-gray-800">Contactez-Nous</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-medium mb-3 text-gray-600">Par Téléphone</h3>
              <p className="text-lg font-medium text-gray-800 mb-2">01 40 21 04 55</p>
              <p className="text-sm text-gray-500">Mardi - Vendredi: 8h30 - 19h00</p>
              <p className="text-sm text-gray-500">Samedi - Dimanche: 9h30 - 19h00</p>
            </div>
            
            <div>
              <h3 className="font-medium mb-3 text-gray-600">Par Email</h3>
              <p className="text-lg font-medium text-gray-800 mb-2">fupatisserie@gmail.com</p>
              <p className="text-sm text-gray-500">Réponse sous 24h</p>
            </div>
          </div>

          <div className="bg-patisserie-yellow rounded-lg p-6">
            <h3 className="font-medium mb-3">⏰ Délais de Commande</h3>
            <p className="text-gray-700">
              Merci de nous contacter <strong>au moins 2 semaines à l&apos;avance</strong> pour 
              vos commandes événementielles afin de garantir la disponibilité et la qualité 
              de nos créations sur mesure.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}