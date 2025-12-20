import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import ComingSoon from "@/components/ComingSoon";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fu Pâtisserie | Christine Fu by FuLiFamili since 2018",
  description: "Découvrez nos gâteaux artisanaux et pâtisseries fait maison. Service de click & collect disponible.",
};

// Set this to true to show "Coming Soon" page, false to show normal site
const COMING_SOON_MODE = process.env.NEXT_PUBLIC_COMING_SOON === 'true';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          {COMING_SOON_MODE ? (
            <ComingSoon />
          ) : (
            <>
              <Navbar />
              <main className="min-h-screen">
                {children}
              </main>
              <Footer />
            </>
          )}
        </Providers>
      </body>
    </html>
  );
}
