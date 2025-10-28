/**
 * Interfaces principales pour le module Vendor
 */

import { Store, StoreStats, StoreAnalytics } from '../models/store.model';
import { Product, ProductAnalytics } from '../models/product.model';
import { Order, OrderAnalytics } from '../models/order.model';
import { VendorDashboard, SalesAnalytics, CustomerAnalytics, FinancialAnalytics } from '../models/analytics.model';
import { Payment, PayoutDetails, CommissionSettings } from '../models/payment.model';

export interface VendorProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'vendor';
  status: 'active' | 'pending' | 'suspended' | 'banned';
  stores: Store[];
  created_at: string;
  updated_at: string;
}

export interface VendorDashboardData {
  profile: VendorProfile;
  dashboard: VendorDashboard;
  recent_orders: Order[];
  top_products: Product[];
  notifications: VendorNotification[];
  quick_stats: VendorQuickStats;
}

export interface VendorQuickStats {
  total_revenue: number;
  total_orders: number;
  total_products: number;
  total_customers: number;
  pending_orders: number;
  low_stock_products: number;
  unread_notifications: number;
  pending_payouts: number;
}

export interface VendorNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  expires_at?: string;
}

export type NotificationType = 
  | 'order_received'
  | 'order_updated'
  | 'payment_received'
  | 'payout_processed'
  | 'product_low_stock'
  | 'product_out_of_stock'
  | 'review_received'
  | 'store_verified'
  | 'store_suspended'
  | 'commission_updated'
  | 'system_maintenance'
  | 'promotion_available';

export interface VendorSettings {
  id: string;
  user_id: string;
  store_settings: StoreSettings;
  notification_settings: NotificationSettings;
  payment_settings: PaymentSettings;
  shipping_settings: ShippingSettings;
  commission_settings: CommissionSettings;
  created_at: string;
  updated_at: string;
}

export interface StoreSettings {
  auto_accept_orders: boolean;
  require_order_approval: boolean;
  allow_cancellations: boolean;
  cancellation_time_limit: number; // en heures
  return_policy: string;
  shipping_policy: string;
  privacy_policy: string;
  terms_of_service: string;
  support_email: string;
  support_phone: string;
  business_hours: Record<string, { open: string; close: string; closed: boolean }>;
  timezone: string;
  currency: string;
  language: string;
}

export interface NotificationSettings {
  email_notifications: {
    order_received: boolean;
    order_updated: boolean;
    payment_received: boolean;
    payout_processed: boolean;
    low_stock: boolean;
    new_review: boolean;
    store_updates: boolean;
  };
  push_notifications: {
    enabled: boolean;
    order_received: boolean;
    order_updated: boolean;
    payment_received: boolean;
    low_stock: boolean;
  };
  sms_notifications: {
    enabled: boolean;
    order_received: boolean;
    payment_received: boolean;
    low_stock: boolean;
  };
}

export interface PaymentSettings {
  preferred_payment_methods: string[];
  auto_payout_enabled: boolean;
  payout_threshold: number;
  payout_frequency: 'daily' | 'weekly' | 'monthly';
  payout_method: 'bank_transfer' | 'mobile_money' | 'crypto_wallet';
  bank_account?: {
    bank_name: string;
    account_number: string;
    routing_number: string;
    account_holder_name: string;
  };
  mobile_money?: {
    provider: string;
    number: string;
    account_holder_name: string;
  };
}

export interface ShippingSettings {
  free_shipping_threshold: number;
  flat_rate_shipping: number;
  weight_based_shipping: boolean;
  shipping_zones: ShippingZone[];
  packaging: {
    default_weight: number;
    default_dimensions: {
      length: number;
      width: number;
      height: number;
    };
  };
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  regions?: string[];
  cities?: string[];
  shipping_rates: ShippingRate[];
  free_shipping_threshold?: number;
}

export interface ShippingRate {
  id: string;
  name: string;
  condition: 'weight' | 'price' | 'quantity';
  min_value: number;
  max_value?: number;
  rate: number;
  free_shipping: boolean;
}

export interface VendorApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface VendorError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;
}

export interface VendorFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface VendorStats {
  total_revenue: number;
  total_orders: number;
  total_products: number;
  total_customers: number;
  average_order_value: number;
  conversion_rate: number;
  growth_rate: number;
  commission_paid: number;
  pending_payouts: number;
  active_stores: number;
  verified_stores: number;
}

export interface VendorActivity {
  id: string;
  type: 'order' | 'product' | 'payment' | 'store' | 'customer';
  action: string;
  description: string;
  data?: Record<string, any>;
  created_at: string;
  user_id: string;
  user_name: string;
}

export interface VendorReport {
  id: string;
  type: 'sales' | 'products' | 'customers' | 'financial' | 'custom';
  title: string;
  description?: string;
  period: string;
  filters: Record<string, any>;
  data: any;
  generated_at: string;
  expires_at: string;
  download_url?: string;
}

export interface VendorSupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'account' | 'feature_request' | 'other';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  messages: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_name: string;
  sender_type: 'vendor' | 'support';
  message: string;
  attachments?: string[];
  created_at: string;
  is_read: boolean;
}
