'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface CarouselProps {
  children: React.ReactNode[]
  itemsPerView?: number
  gap?: number
  autoScroll?: boolean
  autoScrollInterval?: number
  showArrows?: boolean
  showDots?: boolean
  className?: string
}

export default function Carousel({
  children,
  itemsPerView = 3,
  gap = 16,
  autoScroll = false,
  autoScrollInterval = 3000,
  showArrows = true,
  showDots = true,
  className = ''
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)
  
  const totalItems = children.length
  const maxIndex = Math.max(0, totalItems - itemsPerView)

  useEffect(() => {
    if (!autoScroll || isHovered || totalItems <= itemsPerView) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        return prevIndex >= maxIndex ? 0 : prevIndex + 1
      })
    }, autoScrollInterval)

    return () => clearInterval(interval)
  }, [autoScroll, autoScrollInterval, isHovered, maxIndex, totalItems, itemsPerView])

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)))
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => {
      return prevIndex === 0 ? maxIndex : prevIndex - 1
    })
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => {
      return prevIndex >= maxIndex ? 0 : prevIndex + 1
    })
  }

  const translateX = -(currentIndex * (100 / itemsPerView))

  if (totalItems === 0) {
    return null
  }

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carousel Container */}
      <div 
        ref={carouselRef}
        className="overflow-hidden"
      >
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ 
            transform: `translateX(${translateX}%)`,
            gap: `${gap}px`
          }}
        >
          {children.map((child, index) => (
            <div 
              key={index}
              className="flex-shrink-0"
              style={{ width: `calc(${100 / itemsPerView}% - ${gap * (itemsPerView - 1) / itemsPerView}px)` }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && totalItems > itemsPerView && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && totalItems > itemsPerView && maxIndex > 0 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-patisserie-coral scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}