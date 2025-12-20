import Image from "next/image";

export default function ComingSoon() {
  return (
    <main className="min-h-screen bg-patisserie-cream flex items-center justify-center">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/logo-JPG.webp"
              alt="Logo Fu Pâtisserie"
              width={200}
              height={200}
              className="mx-auto"
            />
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl font-serif mb-6 text-gray-800">
            Bientôt disponible
          </h1>

          {/* Subheading */}
          <div className="bg-patisserie-mint p-8 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl md:text-3xl font-serif mb-4 text-gray-800">
              Fu Pâtisserie - Coffee Shop - Brunch
            </h2>
            <p className="text-lg text-gray-700 mb-2">
              Christine Fu by FuLiFamily since 2018
            </p>
          </div>

          {/* Message */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-xl text-gray-700 mb-4">
              Notre nouveau site web arrive très prochainement.
            </p>
            <p className="text-lg text-gray-600">
              Nous préparons quelque chose de spécial pour vous !
            </p>
          </div>

          {/* Decorative element */}
          <div className="mt-8 flex justify-center gap-2">
            <div className="w-3 h-3 bg-patisserie-coral rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-patisserie-yellow rounded-full animate-pulse delay-100"></div>
            <div className="w-3 h-3 bg-patisserie-mint rounded-full animate-pulse delay-200"></div>
          </div>
        </div>
      </div>
    </main>
  );
}
