// src/app/features/admin/core/models/admin-user.model.ts

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRoleType;  // ⚠️ Changé de UserRole à UserRoleType
  status: UserStatus;
  is_verified: boolean;
  two_factor_enabled: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at?: string;
  
  orders_count?: number;
  total_spent?: number;
  admin_notes?: string;
}

// Type pour les rôles simples
export type UserRoleType = 'customer' | 'vendor' | 'admin' | 'super_admin' | 'manager';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'banned';

export interface UserListResponse {
  users: AdminUser[];
  pagination: Pagination;
  filters: UserFilters;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface UserFilters {
  roles: UserRoleType[];
  statuses: UserStatus[];
}

export interface UserUpdateData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role?: UserRoleType;
  status?: UserStatus;
  admin_notes?: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Interface détaillée pour les rôles avec permissions
export interface UserRole {
  id: string;
  name: UserRoleType;
  displayName: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}