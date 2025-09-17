export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconPath?: string;
  isPrincipal: boolean;
  displayOrder: number;
}