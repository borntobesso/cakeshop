"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession(); 
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  
  const isActive = (path: string) => {
    return pathname === path ? 'text-patisserie-coral font-medium' : 'text-gray-600 hover:text-patisserie-coral';
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <Link href="/" className="text-2xl font-serif mb-4 md:mb-0">
          Fu Pâtisserie
          </Link>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 items-center">
            <div className="flex space-x-8 items-center">
              <Link href="/gateaux-entiers" className={`${isActive('/gateaux-entiers')} transition-colors`}>
                Gâteaux Entiers
              </Link>
              <Link href="/patisseries" className={`${isActive('/patisseries')} transition-colors`}>
                Pâtisseries
              </Link>
              {/* <Link href="/click-and-collect" className={`${isActive('/click-and-collect')} transition-colors`}>
                Click & Collect
              </Link>
              <Link href="/contact" className={`${isActive('/contact')} transition-colors`}>
                Contact
              </Link> */}
              <Link 
                href="/panier" 
                className="bg-patisserie-mint hover:bg-patisserie-yellow text-gray-800 px-4 py-2 rounded-full transition-colors"
              >
                Panier ({totalItems})
              </Link>
            </div>
              
            <div className="flex items-center">  
              <div className="flex items-center space-x-4">
                {status === "loading" ? (
                  <div className="text-sm text-gray-500">Chargement...</div>
                ) : session ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-700">
                      Bonjour, <span className="font-medium">{session.user?.name}</span>
                    </span>
                    <button
                      onClick={() => signOut()}
                      className="text-sm text-patisserie-coral hover:text-patisserie-yellow transition-colors"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-3">
                    <Link
                      href="/login"
                      className="text-sm text-patisserie-coral hover:text-patisserie-yellow px-3 py-1 transition-colors"
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/register"
                      className="text-sm bg-patisserie-coral hover:bg-patisserie-yellow text-white px-3 py-1 rounded-full transition-colors"
                    >
                      Inscription
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 