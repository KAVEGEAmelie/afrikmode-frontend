// src/app/features/admin/core/models/dashboard-stats.model.ts

export interface DashboardStats {
  userStats: UserStats;
  storeStats: StoreStats;
  productStats: ProductStats;
  orderStats: OrderStats;
  recentActivity: ActivityItem[];
  todayStats: TodayStats;  // ✅ Ajouté ici
}

export interface UserStats {
  total_users: number;
  new_users_30d: number;
  total_vendors: number;
  total_customers: number;
  active_users: number;
  growth_percentage?: number;
}

export interface StoreStats {
  total_stores: number;
  active_stores: number;
  verified_stores: number;
  featured_stores: number;
  pending_approval: number;
  growth_percentage?: number;
}

export interface ProductStats {
  total_products: number;
  active_products: number;
  out_of_stock: number;
  pending_approval: number;
  growth_percentage?: number;
}

export interface OrderStats {
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  average_order_value: number;
  growth_percentage?: number;
}

export interface ActivityItem {
  id: string;
  type: 'order' | 'user' | 'store' | 'product' | 'system';
  icon: string;
  description: string;
  user?: {
    id: string;
    name: string;
  };
  metadata?: any;
  created_at: string;
}

// ✅ Interface TodayStats créée
export interface TodayStats {
  visitors: number;
  orders: number;
  revenue: number;
  conversions: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  tension?: number;
}