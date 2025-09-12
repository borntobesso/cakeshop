export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isPrincipal: boolean;
  displayOrder: number;
}