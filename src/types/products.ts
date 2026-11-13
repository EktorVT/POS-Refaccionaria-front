export interface Product {
  id: number;
  name: string;
  barcode?: string | null;
  stock: number;
  minStock: number;
  category: string;
  subcategory: string;
  purchasePrice: number;
  salePrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPayload {
  name: string;
  barcode?: string;
  stock?: number;
  minStock: number;
  category: string;
  subcategory: string;
  purchasePrice: number;
  salePrice: number;
}

export interface ProductFilters {
  q?: string;
  category?: string;
  subcategory?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface CategoryGroup {
  category: string;
  subcategories: string[];
}
