import { User } from './user.model';
import { Address } from './address.model';
import { Product, ProductVariant } from './product.model';

export interface Order {
    id: string;
    order_number: string;
    user_id: string;
    user?: User;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
    items: OrderItem[];
    subtotal: number;
    tax_amount: number;
    shipping_cost: number;
    discount_amount: number;
    total: number;
    currency: string;
    shipping_address: Address;
    billing_address?: Address;
    payment_method: string;
    payment_provider?: string;
    tracking_info?: TrackingInfo;
    notes?: string;
    created_at: string;
    updated_at: string;
    delivered_at?: string;
    confirmed_at?: string;
    confirmed_by?: string;
    delivery_confirmation_notes?: string;
    auto_confirmed?: boolean;
    payout_processed?: boolean;
    payout_processed_at?: string;
    vendor_payout_amount?: number;
    platform_commission?: number;
  }
  
  export interface OrderItem {
    id: string;
    product_id: string;
    product: Product;
    variant_id?: string;
    variant?: ProductVariant;
    quantity: number;
    unit_price: number;
    total_price: number;
    status: string;
  }
  
  export interface TrackingInfo {
    carrier: string;
    tracking_number: string;
    tracking_url?: string;
    status: string;
    estimated_delivery?: string;
    updates: TrackingUpdate[];
  }
  
  export interface TrackingUpdate {
    date: string;
    status: string;
    description: string;
    location?: string;
  }