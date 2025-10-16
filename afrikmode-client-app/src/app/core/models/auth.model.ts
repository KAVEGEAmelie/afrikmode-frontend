export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role: 'customer' | 'vendor' | 'admin' | 'super_admin' | 'manager';
    status: 'active' | 'inactive' | 'suspended' | 'banned';
    is_verified: boolean;
    two_factor_enabled: boolean;
    avatar?: string;
    date_of_birth?: string;
    gender?: 'male' | 'female' | 'other';
    created_at: string;
    updated_at: string;
    last_login_at?: string;
  }
  
  export interface AuthResponse {
    user: User;
    token: string;
    refresh_token: string;
    expires_in: number;
  }
  
  export interface LoginRequest {
    email: string;
    password: string;
    remember_me?: boolean;
  }
  
  export interface RegisterRequest {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    terms_accepted: boolean;
  }