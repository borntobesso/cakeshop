import Link from 'next/link'

export default function BrunchPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
            Notre Brunch
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez nos plats brunch fusion asiatique-française, préparés avec des ingrédients frais et des saveurs authentiques pour un moment gourmand unique.
          </p>
        </div>

        {/* Menu Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 border border-gray-200">
          <div className="flex flex-col items-center space-y-6">
            {/* Menu Icon */}
            <div className="w-20 h-20 bg-patisserie-mint rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center">
              Carte Brunch
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-center max-w-md">
              Consultez notre carte complète avec tous nos plats brunch, boissons et desserts.
            </p>

            {/* View Menu Button */}
            <Link
              href="https://www.canva.com/design/DAGDPc7tMRc/gIk6r9e3UcxDBlqt_ZHXiQ/view?utm_content=DAGDPc7tMRc&utm_campaign=designshare&utm_medium=link&utm_source=editor"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-patisserie-coral hover:bg-patisserie-yellow transition-colors duration-300 text-gray-900 font-medium px-8 py-4 rounded-full shadow-md hover:shadow-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span>Voir la Carte Brunch</span>
            </Link>

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-gray-200 w-full">
              <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
                <div className="flex items-start space-x-3">
                  <svg
                    className="w-5 h-5 text-patisserie-coral flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">Horaires Brunch</p>
                    <p>Samedi & Dimanche: 9h30 - 15h00</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <svg
                    className="w-5 h-5 text-patisserie-coral flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">Réservation</p>
                    <p>Recommandée pour les groupes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}