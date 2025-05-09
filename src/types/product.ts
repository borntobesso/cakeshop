export type ProductCategory = "gateau-entier" | "patisserie";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  image: string;
  available: boolean;
  preparationTime?: string; // For whole cakes that need preparation time
  minimumNotice?: string; // Minimum notice required for ordering
  serves?: number; // Number of people the cake serves
}
