import { Product, ProductVariant } from './product.model';

export interface Cart {
    id: string;
    user_id?: string;
    items: CartItem[];
    total_items: number;
    subtotal: number;
    tax_amount: number;
    shipping_cost: number;
    discount_amount: number;
    total: number;
    currency: string;
    created_at: string;
    updated_at: string;
    coupon_code?: string;
  }

  // Ajoutez ces interfaces dans votre cart.model.ts
export interface UpdateCartItemRequest {
    quantity: number;
  }
  
  export interface AddToCartRequest {
    product_id: string;
    variant_id?: string;
    quantity: number;
  }
  
  export interface CartItem {
    id: string;
    product_id: string;
    product: Product;
    variant_id?: string;
    variant?: ProductVariant;
    quantity: number;
    unit_price: number;
    total_price: number;
    added_at: string;
    customization?: any;
  }
  
  export interface AddToCartRequest {
    product_id: string;
    variant_id?: string;
    quantity: number;
  }