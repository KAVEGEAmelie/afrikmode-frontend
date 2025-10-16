// src/app/features/admin/core/models/product.model.ts

export interface Product {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  sku: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  stock_quantity: number;
  min_stock_quantity?: number;
  category_id?: string;
  category_name?: string;
  brand?: string;
  status: ProductStatus;
  is_featured: boolean;
  is_digital: boolean;
  weight?: number;
  dimensions?: ProductDimensions;
  images: ProductImage[];
  variants?: ProductVariant[];
  tags: string[];
  created_at: string;
  updated_at?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  attributes: {[key: string]: string};
}

export type ProductStatus = 'draft' | 'active' | 'inactive' | 'archived';

export interface ProductListResponse {
  products: Product[];
  pagination: Pagination;
  filters: ProductFilters;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ProductFilters {
  categories: string[];
  statuses: ProductStatus[];
  brands: string[];
}

export interface ProductCreateData {
  name: string;
  description: string;
  short_description?: string;
  sku: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  stock_quantity: number;
  min_stock_quantity?: number;
  category_id?: string;
  brand?: string;
  status: ProductStatus;
  is_featured: boolean;
  is_digital: boolean;
  weight?: number;
  dimensions?: ProductDimensions;
  tags: string[];
}

export interface ProductUpdateData extends Partial<ProductCreateData> {
  id: string;
}