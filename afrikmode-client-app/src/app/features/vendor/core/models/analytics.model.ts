/**
 * Modèle Analytics - Gestion des statistiques et rapports
 * Basé sur l'API backend /api/analytics
 */

export interface VendorDashboard {
  period: string;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    averageOrderValue: number;
    conversionRate: number;
    growthRate: number;
  };
  revenue: {
    current: number;
    previous: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
  orders: {
    current: number;
    previous: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
  products: {
    total: number;
    active: number;
    low_stock: number;
    out_of_stock: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    growth: number;
  };
  recentOrders: Array<{
    id: string;
    order_number: string;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    image: string;
    sales: number;
    revenue: number;
    growth: number;
  }>;
  salesChart: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export interface SalesAnalytics {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  growthRate: number;
  dailySales: Array<{
    date: string;
    revenue: number;
    orders: number;
    customers: number;
  }>;
  monthlySales: Array<{
    month: string;
    revenue: number;
    orders: number;
    growth: number;
  }>;
  topProducts: Array<{
    product_id: string;
    name: string;
    image: string;
    sales: number;
    revenue: number;
    growth: number;
  }>;
  topCategories: Array<{
    category_id: string;
    name: string;
    sales: number;
    revenue: number;
    growth: number;
  }>;
  paymentMethods: Array<{
    method: string;
    count: number;
    revenue: number;
    percentage: number;
  }>;
  orderStatusBreakdown: Array<{
    status: string;
    count: number;
    percentage: number;
    revenue: number;
  }>;
}

export interface ProductAnalytics {
  period: string;
  totalProducts: number;
  activeProducts: number;
  totalViews: number;
  totalSales: number;
  conversionRate: number;
  topPerformingProducts: Array<{
    product_id: string;
    name: string;
    image: string;
    views: number;
    sales: number;
    revenue: number;
    conversion_rate: number;
    growth: number;
  }>;
  lowPerformingProducts: Array<{
    product_id: string;
    name: string;
    image: string;
    views: number;
    sales: number;
    revenue: number;
    conversion_rate: number;
  }>;
  stockAlerts: Array<{
    product_id: string;
    name: string;
    current_stock: number;
    min_stock: number;
    status: 'low' | 'out';
  }>;
  categoryPerformance: Array<{
    category_id: string;
    name: string;
    products_count: number;
    total_sales: number;
    total_revenue: number;
    average_rating: number;
  }>;
  productViewsChart: Array<{
    date: string;
    views: number;
    unique_views: number;
  }>;
  salesChart: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
}

export interface CustomerAnalytics {
  period: string;
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerGrowth: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
  retentionRate: number;
  topCustomers: Array<{
    customer_id: string;
    name: string;
    email: string;
    total_orders: number;
    total_spent: number;
    last_order_date: string;
  }>;
  customerSegments: Array<{
    segment: string;
    count: number;
    percentage: number;
    average_value: number;
  }>;
  geographicDistribution: Array<{
    country: string;
    region?: string;
    customers: number;
    revenue: number;
  }>;
  customerAcquisition: Array<{
    date: string;
    new_customers: number;
    returning_customers: number;
  }>;
  customerRetention: Array<{
    cohort: string;
    customers: number;
    retention_rate: number;
  }>;
}

export interface FinancialAnalytics {
  period: string;
  totalRevenue: number;
  totalCommission: number;
  netRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  commissionRate: number;
  revenueBreakdown: {
    gross_revenue: number;
    platform_commission: number;
    payment_fees: number;
    shipping_costs: number;
    net_revenue: number;
  };
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    commission: number;
    net_revenue: number;
    growth: number;
  }>;
  paymentMethods: Array<{
    method: string;
    count: number;
    revenue: number;
    fees: number;
    net_revenue: number;
  }>;
  commissionHistory: Array<{
    date: string;
    commission_rate: number;
    total_commission: number;
    orders_count: number;
  }>;
  payoutHistory: Array<{
    date: string;
    amount: number;
    status: string;
    method: string;
  }>;
}

export interface StoreAnalytics {
  store_id: string;
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
  customerMetrics: {
    total_customers: number;
    new_customers: number;
    returning_customers: number;
    average_orders_per_customer: number;
  };
  performanceMetrics: {
    page_views: number;
    unique_visitors: number;
    bounce_rate: number;
    average_session_duration: number;
  };
}

export interface AnalyticsFilters {
  period?: '7d' | '30d' | '90d' | '1y' | 'custom';
  date_from?: string;
  date_to?: string;
  store_id?: string;
  category_id?: string;
  product_id?: string;
  group_by?: 'day' | 'week' | 'month' | 'year';
}

export interface AnalyticsExport {
  type: 'dashboard' | 'sales' | 'products' | 'customers' | 'financial';
  format: 'csv' | 'xlsx' | 'pdf';
  period: string;
  filters?: AnalyticsFilters;
  generated_at: string;
  download_url: string;
  expires_at: string;
}

export interface RealTimeMetrics {
  online_visitors: number;
  current_orders: number;
  today_revenue: number;
  today_orders: number;
  pending_orders: number;
  low_stock_products: number;
  recent_activity: Array<{
    type: 'order' | 'product' | 'customer' | 'payment';
    description: string;
    timestamp: string;
    value?: number;
  }>;
}
