import { Store } from './store.model';
import { Category } from './category.model';

export interface Brand {
    id: string;
    name: string;
    description?: string;
    logo?: string;
    website?: string;
    is_active: boolean;
    products_count: number;
    created_at: string;
    updated_at: string;
  }
  
export interface Product {
    id: string;
    name: string;
    description: string;
    slug: string;
    sku: string;
    price: number;
    compare_price?: number;
    cost_price?: number;
    stock_quantity: number;
    min_stock_level?: number;
    status: 'active' | 'inactive' | 'out_of_stock';
    approval_status: 'pending' | 'approved' | 'rejected';
    is_featured: boolean;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    store_id: string;
    store?: Store;
    category_id: string;
    category?: Category;
    brand_id?: string;
    brand?: Brand;
    image_url?: string;  // URL de l'image principale pour la compatibilité
    images: ProductImage[];
    variants: ProductVariant[];
    attributes: ProductAttribute[];
    tags: string[];
    seo?: {
      meta_title?: string;
      meta_description?: string;
      meta_keywords?: string;
    };
    average_rating: number;
    reviews_count: number;
    views_count: number;
    orders_count: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface ProductImage {
    id: string;
    url: string;
    alt_text?: string;
    is_main: boolean;
    sort_order: number;
  }
  
  export interface ProductVariant {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock_quantity: number;
    attributes: { [key: string]: string };
    image?: string;
  }
  
  export interface ProductAttribute {
    id: string;
    name: string;
    value: string;
    type: 'text' | 'number' | 'boolean' | 'select';
  }