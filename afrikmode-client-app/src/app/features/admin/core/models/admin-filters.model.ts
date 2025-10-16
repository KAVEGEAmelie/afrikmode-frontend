export interface AdminFilters {
  search?: string;
  status?: string;
  role?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  // Filters pour Stores
  country?: string;
  verified?: boolean;
  featured?: boolean;
  // Filters pour Coupons
  type?: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean' | 'multiselect';
  options?: FilterOption[];
  placeholder?: string;
  defaultValue?: any;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface FilterOption {
  value: any;
  label: string;
  icon?: string;
  color?: string;
  disabled?: boolean;
}

export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filters: AdminFilters;
  isDefault: boolean;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuickFilter {
  label: string;
  filters: AdminFilters;
  icon?: string;
  color?: string;
}

export interface DateRange {
  start: Date;
  end: Date;
  label?: string;
}

export interface PriceRange {
  min: number;
  max: number;
  currency?: string;
}

export interface SearchSuggestion {
  value: string;
  label: string;
  type: 'user' | 'product' | 'order' | 'category';
  icon?: string;
  metadata?: Record<string, any>;
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: AdminFilters;
  category: 'users' | 'products' | 'orders' | 'analytics' | 'general';
  isSystem: boolean;
}

export const COMMON_FILTERS: { [key: string]: QuickFilter } = {
  TODAY: {
    label: 'Aujourd\'hui',
    filters: {
      dateFrom: new Date().toISOString().split('T')[0],
      dateTo: new Date().toISOString().split('T')[0]
    },
    icon: 'today',
    color: 'primary'
  },
  
  THIS_WEEK: {
    label: 'Cette semaine',
    filters: {
      dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dateTo: new Date().toISOString().split('T')[0]
    },
    icon: 'date_range',
    color: 'accent'
  },
  
  THIS_MONTH: {
    label: 'Ce mois',
    filters: {
      dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      dateTo: new Date().toISOString().split('T')[0]
    },
    icon: 'calendar_month',
    color: 'warn'
  },
  
  ACTIVE_USERS: {
    label: 'Utilisateurs actifs',
    filters: {
      status: 'active'
    },
    icon: 'person',
    color: 'success'
  },
  
  PENDING_ORDERS: {
    label: 'Commandes en attente',
    filters: {
      status: 'pending'
    },
    icon: 'pending',
    color: 'warning'
  },
  
  OUT_OF_STOCK: {
    label: 'Rupture de stock',
    filters: {
      status: 'out_of_stock'
    },
    icon: 'inventory',
    color: 'error'
  }
};