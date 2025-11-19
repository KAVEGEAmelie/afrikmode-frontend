/**
 * Interfaces pour les variantes de produits
 */

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  barcode?: string;
  name: string;

  // Attributs
  color?: string;
  color_hex?: string;
  size?: string;
  material?: string;
  pattern?: string;
  custom_attributes?: any;

  // Prix
  price?: number;
  compare_at_price?: number;
  cost_price?: number;

  // Inventaire
  stock_quantity: number;
  reserved_quantity: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  allow_backorders: boolean;

  // Physique
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  shipping_dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };

  // Média
  images?: string[];
  primary_image?: string;

  // Statut
  status: VariantStatus;
  available: boolean;
  position: number;

  // Analytics
  sales_count: number;
  total_revenue: number;
  views_count: number;

  // Timestamps
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  created_by?: string;
  updated_by?: string;
}

export type VariantStatus = 'active' | 'inactive' | 'out_of_stock';

export type StockOperation = 'set' | 'add' | 'subtract';

export interface VariantStockUpdate {
  operation: StockOperation;
  stock_quantity: number;
  reason?: string;
}

export interface VariantAnalytics {
  sales_count: number;
  total_revenue: number;
  views_count: number;
  stock_quantity: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface VariantFormData {
  sku: string;
  name: string;
  color?: string;
  color_hex?: string;
  size?: string;
  material?: string;
  pattern?: string;
  custom_attributes?: any;
  price?: number;
  compare_at_price?: number;
  cost_price?: number;
  stock_quantity: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  allow_backorders: boolean;
  weight?: number;
  dimensions?: any;
  shipping_dimensions?: any;
  images?: string[];
  primary_image?: string;
  position?: number;
}
