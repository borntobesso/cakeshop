export interface DatabaseProduct {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  image: string;
  imageGallery?: string[]; // Array of additional image URLs
  isAvailable: boolean;
  stock: number;
  displayOrder: number;
  
  // Product details
  ingredients?: string;
  allergens?: string;
  storage?: string;
  nutritionInfo?: Record<string, any>; // Nutrition facts
  
  // Size and pricing options
  sizeOptions?: { size: string; price: number }[];
  
  // Related products
  relatedProductIds?: string[];
  
  // Click & collect info
  preparationTime?: number; // Hours needed to prepare
  availableForPickup: boolean;
  
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}