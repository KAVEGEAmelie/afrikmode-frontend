/**
 * Modèle Product - Gestion des produits
 * Basé sur l'API backend /api/products
 */

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  store_id: string;
  category_id: string;
  category_name?: string;
  sku: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  currency: string;
  quantity: number;
  min_quantity: number;
  max_quantity?: number;
  weight?: number;
  dimensions?: ProductDimensions;
  images: ProductImage[];
  primary_image?: string;
  variants: ProductVariant[];
  attributes: ProductAttribute[];
  tags: string[];
  status: ProductStatus;
  featured: boolean;
  digital: boolean;
  downloadable: boolean;
  requires_shipping: boolean;
  taxable: boolean;
  track_quantity: boolean;
  allow_backorder: boolean;
  meta_title?: string;
  meta_description?: string;
  seo_keywords?: string[];
  average_rating: number;
  total_reviews: number;
  total_sales: number;
  view_count: number;
  wishlist_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  deleted_at?: string;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

export interface ProductImage {
  id: string;
  url: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  quantity: number;
  weight?: number;
  attributes: Record<string, string>;
  images: string[];
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

export interface ProductAttribute {
  name: string;
  values: string[];
  type: 'text' | 'color' | 'size' | 'material' | 'brand';
  required: boolean;
  sort_order: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  image?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export type ProductStatus = 
  | 'draft'
  | 'active'
  | 'inactive'
  | 'archived'
  | 'banned';

export interface ProductFilters {
  page?: number;
  limit?: number;
  store_id?: string;
  category_id?: string;
  status?: ProductStatus;
  featured?: boolean;
  search?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  sort?: 'created_at' | 'name' | 'price' | 'rating' | 'sales_count' | 'view_count';
  order?: 'asc' | 'desc';
  tags?: string[];
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters?: {
    categories: ProductCategory[];
    price_range: {
      min: number;
      max: number;
    };
    tags: string[];
  };
}

export interface ProductCreateRequest {
  name: string;
  description: string;
  short_description: string;
  category_id: string;
  sku: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  currency: string;
  quantity: number;
  min_quantity?: number;
  max_quantity?: number;
  weight?: number;
  dimensions?: ProductDimensions;
  images?: string[];
  variants?: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>[];
  attributes?: Omit<ProductAttribute, 'id'>[];
  tags?: string[];
  status?: ProductStatus;
  featured?: boolean;
  digital?: boolean;
  downloadable?: boolean;
  requires_shipping?: boolean;
  taxable?: boolean;
  track_quantity?: boolean;
  allow_backorder?: boolean;
  meta_title?: string;
  meta_description?: string;
  seo_keywords?: string[];
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
  id: string;
}

export interface ProductStockUpdate {
  product_id: string;
  variant_id?: string;
  quantity: number;
  operation: 'set' | 'add' | 'subtract';
  reason?: string;
}

export interface ProductAnalytics {
  product_id: string;
  period: string;
  views: number;
  sales: number;
  revenue: number;
  conversion_rate: number;
  average_rating: number;
  total_reviews: number;
  top_variants: Array<{
    variant_id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  daily_stats: Array<{
    date: string;
    views: number;
    sales: number;
    revenue: number;
  }>;
}


































