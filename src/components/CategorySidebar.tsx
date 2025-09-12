'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ProductCategory } from '@/types/category'

interface CategorySidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CategorySidebar({ isOpen, onClose }: CategorySidebarProps) {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        setCategories(data.categories || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const isActive = (path: string) => {
    return pathname === path ? 'text-gray-900 bg-patisserie-yellow' : 'text-gray-700 hover:text-gray-800 hover:bg-patisserie-mint'
  }

  // Separate "La maison" and sort other categories
  const lamaisonCategory = categories.find(cat => cat.slug === 'la-maison')
  const otherCategories = categories.filter(cat => cat.slug !== 'la-maison')

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-72
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-serif text-gray-900">Navigation</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Fermer le menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Categories */}
        <div className="p-4 overflow-y-auto h-full pb-20">
          {loading ? (
            <div className="text-sm text-gray-500">Chargement...</div>
          ) : (
            <nav className="space-y-1">
              {/* La maison first */}
              {lamaisonCategory && (
                <Link
                  key={lamaisonCategory.id}
                  href={`/${lamaisonCategory.slug}`}
                  className={`
                    block px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive(`/${lamaisonCategory.slug}`)}
                  `}
                  onClick={() => {
                    // Only close on mobile
                    if (window.innerWidth < 768) {
                      onClose()
                    }
                  }}
                >
                  {lamaisonCategory.name}
                </Link>
              )}

              {/* Separator after La maison */}
              {lamaisonCategory && otherCategories.length > 0 && (
                <div className="border-t border-gray-200 my-3"></div>
              )}

              {/* All other categories in display order */}
              {otherCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/${category.slug}`}
                  className={`
                    block px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive(`/${category.slug}`)}
                  `}
                  onClick={() => {
                    // Only close on mobile
                    if (window.innerWidth < 768) {
                      onClose()
                    }
                  }}
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </>
  )
}