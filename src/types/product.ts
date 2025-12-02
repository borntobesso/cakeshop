export interface SizeOption {
  size: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  stock: number;
  displayOrder: number;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  allergens?: string | null;
  availableForPickup: boolean;
  imageGallery?: any | null;
  ingredients?: string | null;
  longDescription?: string | null;
  nutritionInfo?: any | null;
  preparationTime?: number | null;
  relatedProductIds?: any | null;
  sizeOptions?: any | null;
  storage?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}
