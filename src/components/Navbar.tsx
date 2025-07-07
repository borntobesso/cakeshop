'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const pathname = usePathname();
  const { items } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
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
        </div>
      </div>
    </nav>
  );
} 