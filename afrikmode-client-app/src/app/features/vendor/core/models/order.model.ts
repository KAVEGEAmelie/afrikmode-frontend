/**
 * Modèle Order - Gestion des commandes
 * Basé sur l'API backend /api/orders
 */

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  store_id: string;
  store_name?: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  shipping_status: ShippingStatus;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  currency: string;
  customer: OrderCustomer;
  shipping_address: OrderAddress;
  billing_address: OrderAddress;
  items: OrderItem[];
  payment_method?: string;
  payment_reference?: string;
  tracking_number?: string;
  tracking_url?: string;
  carrier?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  notes?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  variant_name?: string;
  product_image?: string;
  sku: string;
  quantity: number;
  price: number;
  total_price: number;
  weight?: number;
  attributes?: Record<string, string>;
}

export interface OrderCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface OrderAddress {
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  region?: string;
  postal_code: string;
  country: string;
  phone?: string;
  instructions?: string;
}

export interface OrderTracking {
  order_id: string;
  tracking_number: string;
  carrier: string;
  tracking_url?: string;
  status: ShippingStatus;
  estimated_delivery: string;
  actual_delivery?: string;
  history: TrackingEvent[];
}

export interface TrackingEvent {
  status: ShippingStatus;
  description: string;
  location?: string;
  timestamp: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  previous_status?: OrderStatus;
  changed_by: string;
  changed_by_name: string;
  reason?: string;
  notes?: string;
  created_at: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'returned';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'
  | 'cancelled';

export type ShippingStatus = 
  | 'pending'
  | 'preparing'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed_delivery'
  | 'returned';

export interface OrderFilters {
  page?: number;
  limit?: number;
  store_id?: string;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  shipping_status?: ShippingStatus;
  date_from?: string;
  date_to?: string;
  search?: string;
  sort?: 'created_at' | 'total_amount' | 'status' | 'customer_name';
  order?: 'asc' | 'desc';
}

export interface OrderListResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary?: {
    total_orders: number;
    total_revenue: number;
    pending_orders: number;
    completed_orders: number;
  };
}

export interface OrderCreateRequest {
  store_id: string;
  items: Array<{
    product_id: string;
    variant_id?: string;
    quantity: number;
  }>;
  shipping_address: OrderAddress;
  billing_address?: OrderAddress;
  payment_method: string;
  notes?: string;
  coupon_code?: string;
}

export interface OrderUpdateRequest {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  shipping_status?: ShippingStatus;
  tracking_number?: string;
  tracking_url?: string;
  carrier?: string;
  estimated_delivery_date?: string;
  notes?: string;
  internal_notes?: string;
}

export interface OrderStatusUpdate {
  order_id: string;
  status: OrderStatus;
  reason?: string;
  notes?: string;
  notify_customer?: boolean;
}

export interface OrderAnalytics {
  period: string;
  summary: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    completedOrders: number;
    cancelledOrders: number;
    conversionRate: number;
  };
  statusBreakdown: Array<{
    status: OrderStatus;
    count: number;
    percentage: number;
  }>;
  dailyStats: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  topProducts: Array<{
    product_id: string;
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }>;
  customerStats: {
    new_customers: number;
    returning_customers: number;
    average_orders_per_customer: number;
  };
}

export interface OrderRefund {
  id: string;
  order_id: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  created_by: string;
  created_at: string;
  processed_at?: string;
  notes?: string;
}

export interface OrderReturn {
  id: string;
  order_id: string;
  items: Array<{
    order_item_id: string;
    quantity: number;
    reason: string;
  }>;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  reason: string;
  notes?: string;
  created_at: string;
  processed_at?: string;
}


































