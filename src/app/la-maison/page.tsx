export default function LaMaisonPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif text-center mb-8">
        Fu Pâtisserie - Notre Maison
      </h1>
      
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <p className="text-lg text-gray-600 leading-relaxed">
            Bienvenue chez Fu Pâtisserie, où la tradition française rencontre l&apos;art culinaire asiatique 
            pour créer des expériences gustatives uniques et mémorables.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-serif mb-4 text-patisserie-coral">Notre Histoire</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Fondée par une passion commune pour la pâtisserie d&apos;excellence, Fu Pâtisserie 
              propose une fusion innovante entre les techniques françaises traditionnelles 
              et les saveurs authentiques d&apos;Asie.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Chaque création est préparée avec des ingrédients de qualité premium, 
              dans le respect des traditions tout en apportant une touche d&apos;originalité 
              qui fait notre signature.
            </p>
          </div>
          <div className="bg-patisserie-mint rounded-lg p-8 text-center">
            <h3 className="text-xl font-serif mb-4">Nos Valeurs</h3>
            <ul className="text-gray-700 space-y-2">
              <li>✨ Qualité artisanale</li>
              <li>🌿 Ingrédients frais et naturels</li>
              <li>🎨 Créativité et innovation</li>
              <li>❤️ Passion du goût authentique</li>
            </ul>
          </div>
        </div>

        <div className="text-center bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-serif mb-4 text-patisserie-coral">Notre Engagement</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Nous nous engageons à vous offrir des pâtisseries fraîches, préparées quotidiennement 
            dans notre atelier avec le plus grand soin. Chaque gâteau, chaque entremet raconte 
            une histoire de savoir-faire et de créativité.
          </p>
          <p className="text-sm text-gray-500 italic">
            &quot;L&apos;art de la pâtisserie, c&apos;est transformer des ingrédients simples en moments de bonheur.&quot;
          </p>
        </div>
      </div>
    </div>
  )
}