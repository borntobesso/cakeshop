"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { ProductCategory } from "@/types/category";
import CategorySidebar from "./CategorySidebar";
import CartSidebar from "./CartSidebar";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { getTotalItems, toggleCart, isHydrated } = useCart();
  const totalItems = getTotalItems();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isActive = (path: string) => {
    return pathname === path ? 'text-patisserie-coral font-medium' : 'text-gray-600 hover:text-patisserie-coral';
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const principalCategories = categories.filter(cat => cat.isPrincipal);

  return (
    <>
      <nav className="bg-white shadow-sm relative">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Left side - Sidebar toggle */}
            <div className="flex items-center">
              {/* Sidebar Toggle Button (Always visible) */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-patisserie-coral focus:outline-none transition-colors"
                aria-label="Menu des catégories"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Logo */}
            <Link href="/" className="text-2xl font-serif">
              Fu Pâtisserie
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Principal Categories */}
              <div className="flex space-x-6">
                {!loading && principalCategories.map((category) => (
                  <Link 
                    key={category.id}
                    href={`/${category.slug}`} 
                    className={`${isActive(`/${category.slug}`)} transition-colors`}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="bg-patisserie-mint hover:bg-patisserie-yellow text-gray-800 px-4 py-2 rounded-full transition-colors"
              >
                Panier ({isHydrated ? totalItems : 0})
              </button>

              {/* User Authentication */}
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

            {/* Mobile Cart & User Menu */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={toggleCart}
                className="bg-patisserie-mint hover:bg-patisserie-yellow text-gray-800 px-3 py-1 rounded-full text-sm transition-colors"
              >
                Panier ({isHydrated ? totalItems : 0})
              </button>

              {/* Mobile User Menu Button (Three dots) */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-patisserie-coral focus:outline-none transition-colors"
                aria-label="Menu utilisateur"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile User Menu Overlay */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t z-50">
              <div className="px-4 py-6">
                {/* Mobile Auth */}
                <div className="space-y-3">
                  {status === "loading" ? (
                    <div className="text-sm text-gray-500">Chargement...</div>
                  ) : session ? (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-700">
                        Bonjour, <span className="font-medium">{session.user?.name}</span>
                      </div>
                      <button
                        onClick={() => {
                          signOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="block text-sm text-patisserie-coral hover:text-patisserie-yellow transition-colors"
                      >
                        Déconnexion
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        href="/login"
                        className="block text-sm text-patisserie-coral hover:text-patisserie-yellow transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Connexion
                      </Link>
                      <Link
                        href="/register"
                        className="block text-sm text-patisserie-coral hover:text-patisserie-yellow transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Inscription
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Category Sidebar */}
      <CategorySidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Cart Sidebar */}
      <CartSidebar />
    </>
  );
}