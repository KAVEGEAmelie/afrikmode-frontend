/**
 * Interfaces spécifiques aux boutiques
 */

import { Store, StoreStats, StoreAnalytics, StoreFilters, StoreListResponse } from '../models/store.model';

export interface StoreFormData {
  name: string;
  description: string;
  short_description: string;
  email: string;
  phone: string;
  whatsapp?: string;
  website?: string;
  social_links: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
    linkedin?: string;
  };
  address: {
    country: string;
    region?: string;
    city: string;
    address: string;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
  };
  business: {
    type: string;
    specialties: string[];
    brand_story?: string;
  };
  policies: {
    return_policy?: string;
    delivery_zones: Array<{
      name: string;
      country: string;
      region?: string;
      cities: string[];
      delivery_fee: number;
      estimated_days: number;
    }>;
    delivery_fee: number;
    min_order_amount: number;
  };
  appearance: {
    theme_color: string;
    brand_colors: {
      primary?: string;
      secondary?: string;
      accent?: string;
      background?: string;
      text?: string;
    };
  };
  operating_hours: {
    monday?: { open: string; close: string; is_closed: boolean };
    tuesday?: { open: string; close: string; is_closed: boolean };
    wednesday?: { open: string; close: string; is_closed: boolean };
    thursday?: { open: string; close: string; is_closed: boolean };
    friday?: { open: string; close: string; is_closed: boolean };
    saturday?: { open: string; close: string; is_closed: boolean };
    sunday?: { open: string; close: string; is_closed: boolean };
  };
}

export interface StoreImageUpload {
  type: 'logo' | 'banner' | 'gallery';
  file: File;
  store_id: string;
  alt_text?: string;
  sort_order?: number;
}

export interface StoreVerificationRequest {
  store_id: string;
  documents: {
    business_license?: File;
    tax_certificate?: File;
    id_document?: File;
    address_proof?: File;
  };
  additional_info?: string;
}

export interface StoreVerificationStatus {
  is_verified: boolean;
  verification_date?: string;
  verification_documents: Array<{
    type: string;
    status: 'pending' | 'approved' | 'rejected';
    uploaded_at: string;
    reviewed_at?: string;
    notes?: string;
  }>;
  requirements: Array<{
    type: string;
    required: boolean;
    status: 'pending' | 'completed';
    description: string;
  }>;
}

export interface StoreFollowers {
  total: number;
  followers: Array<{
    user_id: string;
    name: string;
    avatar?: string;
    followed_at: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StoreReviews {
  total: number;
  average_rating: number;
  reviews: Array<{
    id: string;
    user_id: string;
    user_name: string;
    user_avatar?: string;
    rating: number;
    comment?: string;
    images?: string[];
    verified_purchase: boolean;
    helpful_count: number;
    created_at: string;
  }>;
  rating_breakdown: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StorePerformance {
  period: string;
  metrics: {
    views: number;
    unique_visitors: number;
    conversion_rate: number;
    bounce_rate: number;
    average_session_duration: number;
    page_views: number;
  };
  traffic_sources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  top_pages: Array<{
    page: string;
    views: number;
    unique_views: number;
    bounce_rate: number;
  }>;
  geographic_data: Array<{
    country: string;
    region?: string;
    visitors: number;
    revenue: number;
  }>;
}

export interface StoreSettings {
  store_id: string;
  general: {
    auto_accept_orders: boolean;
    require_order_approval: boolean;
    allow_cancellations: boolean;
    cancellation_time_limit: number;
    timezone: string;
    currency: string;
    language: string;
  };
  notifications: {
    email_notifications: boolean;
    sms_notifications: boolean;
    push_notifications: boolean;
    order_notifications: boolean;
    payment_notifications: boolean;
    review_notifications: boolean;
  };
  shipping: {
    free_shipping_threshold: number;
    flat_rate_shipping: number;
    weight_based_shipping: boolean;
    shipping_zones: Array<{
      name: string;
      countries: string[];
      regions?: string[];
      cities?: string[];
      shipping_rates: Array<{
        name: string;
        condition: 'weight' | 'price' | 'quantity';
        min_value: number;
        max_value?: number;
        rate: number;
        free_shipping: boolean;
      }>;
    }>;
  };
  seo: {
    meta_title?: string;
    meta_description?: string;
    keywords?: string[];
    custom_domain?: string;
    ssl_enabled: boolean;
  };
}

export interface StoreTheme {
  store_id: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_family: string;
  font_size: 'small' | 'medium' | 'large';
  layout: 'grid' | 'list' | 'masonry';
  product_card_style: 'minimal' | 'detailed' | 'compact';
  header_style: 'minimal' | 'detailed' | 'banner';
  footer_style: 'minimal' | 'detailed' | 'links';
  custom_css?: string;
}

export interface StoreSocialMedia {
  store_id: string;
  platforms: {
    facebook?: {
      page_url: string;
      enabled: boolean;
      auto_post: boolean;
    };
    instagram?: {
      username: string;
      enabled: boolean;
      auto_post: boolean;
    };
    twitter?: {
      username: string;
      enabled: boolean;
      auto_post: boolean;
    };
    youtube?: {
      channel_url: string;
      enabled: boolean;
    };
    tiktok?: {
      username: string;
      enabled: boolean;
    };
    linkedin?: {
      page_url: string;
      enabled: boolean;
    };
  };
  auto_posting: {
    enabled: boolean;
    new_product: boolean;
    product_update: boolean;
    order_update: boolean;
    promotion: boolean;
  };
}

export interface StoreIntegration {
  store_id: string;
  integrations: {
    google_analytics?: {
      tracking_id: string;
      enabled: boolean;
    };
    facebook_pixel?: {
      pixel_id: string;
      enabled: boolean;
    };
    google_tag_manager?: {
      container_id: string;
      enabled: boolean;
    };
    mailchimp?: {
      api_key: string;
      list_id: string;
      enabled: boolean;
    };
    zapier?: {
      webhook_url: string;
      enabled: boolean;
    };
  };
  webhooks: Array<{
    id: string;
    url: string;
    events: string[];
    secret: string;
    enabled: boolean;
    created_at: string;
  }>;
}
