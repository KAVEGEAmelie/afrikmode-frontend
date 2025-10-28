/**
 * Interfaces spécifiques aux commandes
 */

import { Order, OrderFilters, OrderListResponse, OrderAnalytics } from '../models/order.model';

export interface OrderFormData {
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shipping_address: {
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
  };
  billing_address: {
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
  };
  items: Array<{
    product_id: string;
    variant_id?: string;
    quantity: number;
    price: number;
  }>;
  payment: {
    method: string;
    status: string;
  };
  shipping: {
    method: string;
    cost: number;
    tracking_number?: string;
    carrier?: string;
  };
  notes?: string;
  internal_notes?: string;
}

export interface OrderStatusUpdate {
  order_id: string;
  status: string;
  reason?: string;
  notes?: string;
  notify_customer?: boolean;
  tracking_number?: string;
  carrier?: string;
  estimated_delivery?: string;
}

export interface OrderBulkAction {
  action: 'update_status' | 'print_labels' | 'export' | 'send_notifications';
  order_ids: string[];
  data?: Record<string, any>;
}

export interface OrderBulkStatusUpdate {
  order_ids: string[];
  status: string;
  reason?: string;
  notes?: string;
  notify_customer?: boolean;
}

export interface OrderPrintLabel {
  order_id: string;
  carrier: string;
  service: string;
  package_type: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  from_address: {
    name: string;
    company?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    region?: string;
    postal_code: string;
    country: string;
    phone: string;
  };
  to_address: {
    name: string;
    company?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    region?: string;
    postal_code: string;
    country: string;
    phone: string;
  };
}

export interface OrderTracking {
  order_id: string;
  tracking_number: string;
  carrier: string;
  tracking_url?: string;
  status: string;
  estimated_delivery: string;
  actual_delivery?: string;
  history: Array<{
    status: string;
    description: string;
    location?: string;
    timestamp: string;
  }>;
}

export interface OrderRefund {
  order_id: string;
  items: Array<{
    order_item_id: string;
    quantity: number;
    reason: string;
  }>;
  amount: number;
  reason: string;
  notes?: string;
  notify_customer?: boolean;
}

export interface OrderReturn {
  order_id: string;
  items: Array<{
    order_item_id: string;
    quantity: number;
    reason: string;
    condition: 'new' | 'used' | 'damaged';
  }>;
  reason: string;
  notes?: string;
  return_method: 'pickup' | 'dropoff' | 'mail';
  pickup_address?: {
    name: string;
    address: string;
    city: string;
    postal_code: string;
    phone: string;
  };
}

export interface OrderExport {
  format: 'csv' | 'xlsx' | 'pdf';
  filters: OrderFilters;
  fields: string[];
  include_items: boolean;
  include_customer: boolean;
  include_addresses: boolean;
}

export interface OrderTemplate {
  id: string;
  name: string;
  description: string;
  template_data: Partial<OrderFormData>;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderNote {
  id: string;
  order_id: string;
  user_id: string;
  user_name: string;
  note: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderAttachment {
  id: string;
  order_id: string;
  filename: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  url: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface OrderTimeline {
  order_id: string;
  events: Array<{
    id: string;
    type: 'status_change' | 'payment' | 'shipping' | 'note' | 'refund' | 'return';
    title: string;
    description: string;
    data?: Record<string, any>;
    user_id?: string;
    user_name?: string;
    timestamp: string;
  }>;
}

export interface OrderSummary {
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  pending_orders: number;
  processing_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  refunded_orders: number;
  total_items_sold: number;
  unique_customers: number;
  repeat_customers: number;
  conversion_rate: number;
}

export interface OrderDashboard {
  summary: OrderSummary;
  recent_orders: Order[];
  top_products: Array<{
    product_id: string;
    name: string;
    image: string;
    quantity_sold: number;
    revenue: number;
  }>;
  order_status_chart: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  daily_orders: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  monthly_orders: Array<{
    month: string;
    orders: number;
    revenue: number;
    growth: number;
  }>;
}

export interface OrderNotification {
  id: string;
  order_id: string;
  type: 'status_change' | 'payment_received' | 'shipping_update' | 'cancellation' | 'refund';
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface OrderSearch {
  query: string;
  filters: {
    status?: string[];
    payment_status?: string[];
    date_from?: string;
    date_to?: string;
    min_amount?: number;
    max_amount?: number;
    customer?: string;
    product?: string;
  };
  sort: {
    field: string;
    order: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    limit: number;
  };
}
