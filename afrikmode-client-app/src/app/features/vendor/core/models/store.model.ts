/**
 * Modèle Store - Gestion des boutiques
 * Basé sur l'API backend /api/stores
 */

export interface Store {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  owner_id: string;
  email: string;
  phone: string;
  whatsapp?: string;
  website?: string;
  social_links: SocialLinks;
  country: string;
  region?: string;
  city: string;
  address: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  business_type: BusinessType;
  specialties: string[];
  brand_story?: string;
  operating_hours: OperatingHours;
  delivery_zones: DeliveryZone[];
  delivery_fee: number;
  min_order_amount: number;
  return_policy?: string;
  theme_color: string;
  brand_colors: BrandColors;
  logo_url?: string;
  banner_url?: string;
  status: StoreStatus;
  is_verified: boolean;
  is_featured: boolean;
  average_rating: number;
  total_reviews: number;
  total_sales: number;
  total_revenue: number;
  followers_count: number;
  created_at: string;
  updated_at: string;
  verified_at?: string;
  suspended_at?: string;
  suspension_reason?: string;
  deleted_at?: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
}

export interface OperatingHours {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface DaySchedule {
  open: string; // Format HH:mm
  close: string; // Format HH:mm
  is_closed: boolean;
}

export interface DeliveryZone {
  name: string;
  country: string;
  region?: string;
  cities: string[];
  delivery_fee: number;
  estimated_days: number;
}

export interface BrandColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  text?: string;
}

export type BusinessType = 
  | 'fashion'
  | 'accessories'
  | 'home_decor'
  | 'art_crafts'
  | 'beauty_cosmetics'
  | 'food_beverages'
  | 'electronics'
  | 'books_media'
  | 'sports_fitness'
  | 'other';

export type StoreStatus = 
  | 'pending'
  | 'active'
  | 'suspended'
  | 'closed'
  | 'banned';

export interface StoreStats {
  products: {
    total: number;
    active: number;
    draft: number;
  };
  orders: {
    total: number;
    items_sold: number;
    revenue: number;
  };
  reviews: {
    total: number;
    average_rating: number;
  };
}

export interface StoreAnalytics {
  period: string;
  summary: {
    totalOrders: number;
    revenue: number;
    averageOrderValue: number;
    completedOrders: number;
    cancelledOrders: number;
    conversionRate: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    slug: string;
    image: string;
    totalSold: number;
    totalRevenue: number;
  }>;
  salesEvolution: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

export interface StoreFilters {
  page?: number;
  limit?: number;
  status?: StoreStatus;
  country?: string;
  city?: string;
  business_type?: BusinessType;
  is_verified?: boolean;
  search?: string;
  sort?: 'created_at' | 'name' | 'rating' | 'total_sales';
  order?: 'asc' | 'desc';
}

export interface StoreListResponse {
  stores: Store[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StoreCreateRequest {
  name: string;
  description: string;
  short_description: string;
  email: string;
  phone: string;
  whatsapp?: string;
  website?: string;
  social_links?: SocialLinks;
  country: string;
  region?: string;
  city: string;
  address: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  business_type: BusinessType;
  specialties: string[];
  brand_story?: string;
  operating_hours?: OperatingHours;
  delivery_zones?: DeliveryZone[];
  delivery_fee?: number;
  min_order_amount?: number;
  return_policy?: string;
  theme_color?: string;
  brand_colors?: BrandColors;
}

export interface StoreUpdateRequest extends Partial<StoreCreateRequest> {
  logo_url?: string;
  banner_url?: string;
}


































