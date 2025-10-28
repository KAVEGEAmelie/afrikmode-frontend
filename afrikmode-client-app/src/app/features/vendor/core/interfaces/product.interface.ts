/**
 * Interfaces spécifiques aux produits
 */

import { Product, ProductFilters, ProductListResponse, ProductAnalytics } from '../models/product.model';

export interface ProductFormData {
  basic_info: {
    name: string;
    description: string;
    short_description: string;
    category_id: string;
    sku: string;
    tags: string[];
  };
  pricing: {
    price: number;
    compare_price?: number;
    cost_price?: number;
    currency: string;
    taxable: boolean;
  };
  inventory: {
    quantity: number;
    min_quantity: number;
    max_quantity?: number;
    track_quantity: boolean;
    allow_backorder: boolean;
  };
  shipping: {
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
      unit: 'cm' | 'in';
    };
    requires_shipping: boolean;
  };
  variants: Array<{
    name: string;
    sku: string;
    price: number;
    compare_price?: number;
    cost_price?: number;
    quantity: number;
    weight?: number;
    attributes: Record<string, string>;
    images: string[];
  }>;
  attributes: Array<{
    name: string;
    values: string[];
    type: 'text' | 'color' | 'size' | 'material' | 'brand';
    required: boolean;
    sort_order: number;
  }>;
  seo: {
    meta_title?: string;
    meta_description?: string;
    seo_keywords?: string[];
  };
  status: 'draft' | 'active' | 'inactive';
  featured: boolean;
  digital: boolean;
  downloadable: boolean;
}

export interface ProductImageUpload {
  product_id: string;
  variant_id?: string;
  files: File[];
  alt_text?: string;
  sort_order?: number;
  is_primary?: boolean;
}

export interface ProductBulkAction {
  action: 'activate' | 'deactivate' | 'delete' | 'duplicate' | 'export' | 'update_price' | 'update_stock';
  product_ids: string[];
  data?: Record<string, any>;
}

export interface ProductBulkUpdate {
  product_ids: string[];
  updates: {
    status?: string;
    category_id?: string;
    price?: number;
    compare_price?: number;
    quantity?: number;
    featured?: boolean;
    tags?: string[];
  };
}

export interface ProductImport {
  file: File;
  mapping: {
    name: string;
    description: string;
    sku: string;
    price: string;
    quantity: string;
    category: string;
    status: string;
  };
  options: {
    update_existing: boolean;
    skip_duplicates: boolean;
    validate_data: boolean;
  };
}

export interface ProductExport {
  format: 'csv' | 'xlsx' | 'json';
  filters: ProductFilters;
  fields: string[];
  include_variants: boolean;
  include_images: boolean;
}

export interface ProductTemplate {
  id: string;
  name: string;
  description: string;
  category_id: string;
  template_data: Partial<ProductFormData>;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCategoryTree {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: string;
  children?: ProductCategoryTree[];
  product_count: number;
  is_active: boolean;
  sort_order: number;
}

export interface ProductAttributeSet {
  id: string;
  name: string;
  attributes: Array<{
    name: string;
    type: 'text' | 'color' | 'size' | 'material' | 'brand';
    required: boolean;
    sort_order: number;
  }>;
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

export interface ProductReviewFilters {
  page?: number;
  limit?: number;
  product_id?: string;
  rating?: number;
  verified_only?: boolean;
  sort?: 'created_at' | 'rating' | 'helpful';
  order?: 'asc' | 'desc';
}

export interface ProductReviewResponse {
  reviews: ProductReview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    total_reviews: number;
    average_rating: number;
    rating_breakdown: Array<{
      rating: number;
      count: number;
      percentage: number;
    }>;
  };
}

export interface ProductStockAlert {
  id: string;
  product_id: string;
  product_name: string;
  variant_id?: string;
  variant_name?: string;
  current_stock: number;
  min_stock: number;
  status: 'low' | 'out';
  created_at: string;
  resolved_at?: string;
}

export interface ProductPerformance {
  product_id: string;
  period: string;
  metrics: {
    views: number;
    unique_views: number;
    sales: number;
    revenue: number;
    conversion_rate: number;
    average_rating: number;
    total_reviews: number;
  };
  trends: {
    views_trend: 'up' | 'down' | 'stable';
    sales_trend: 'up' | 'down' | 'stable';
    revenue_trend: 'up' | 'down' | 'stable';
  };
  comparison: {
    previous_period: {
      views: number;
      sales: number;
      revenue: number;
    };
    growth: {
      views: number;
      sales: number;
      revenue: number;
    };
  };
}

export interface ProductRecommendation {
  product_id: string;
  name: string;
  image: string;
  price: number;
  reason: 'similar' | 'complementary' | 'trending' | 'personalized';
  score: number;
  confidence: number;
}

export interface ProductComparison {
  products: Array<{
    id: string;
    name: string;
    image: string;
    price: number;
    rating: number;
    features: Record<string, any>;
  }>;
  comparison_matrix: Array<{
    feature: string;
    values: Array<{
      product_id: string;
      value: any;
    }>;
  }>;
}
