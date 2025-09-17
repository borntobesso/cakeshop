import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fu Pâtisserie | Christine Fu by FuLiFamili since 2018",
  description: "Découvrez nos gâteaux artisanaux et pâtisseries fait maison. Service de click & collect disponible.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <footer className="bg-patisserie-mint py-8 mt-16">
            <div className="container mx-auto px-4 text-center">
              <p className="text-gray-700">© 2025 Fu Pâtisserie - Tous droits réservés</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
