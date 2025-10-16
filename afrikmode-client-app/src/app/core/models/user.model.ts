export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role: UserRole;
    status: UserStatus;
    is_verified: boolean;
    two_factor_enabled: boolean;
    avatar?: string;
    date_of_birth?: string;
    gender?: Gender;
    created_at: string;
    updated_at: string;
    last_login_at?: string;
    
    // Informations supplémentaires
    preferences?: UserPreferences;
    profile?: UserProfile;
    stats?: UserStats;
  }
  
  export type UserRole = 'customer' | 'vendor' | 'admin' | 'super_admin' | 'manager';
  
  export type UserStatus = 'active' | 'inactive' | 'suspended' | 'banned' | 'pending_verification';
  
  export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
  
  export interface UserProfile {
    bio?: string;
    website?: string;
    location?: string;
    timezone?: string;
    language?: string;
    currency?: string;
    avatar_url?: string;
    cover_image_url?: string;
    social_links?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
      tiktok?: string;
    };
  }
  
  export interface UserPreferences {
    email_notifications: boolean;
    push_notifications: boolean;
    sms_notifications: boolean;
    marketing_emails: boolean;
    order_updates: boolean;
    promotions: boolean;
    price_drops: boolean;
    new_products: boolean;
    newsletter: boolean;
    
    // Préférences d'affichage
    theme: 'light' | 'dark' | 'auto';
    language: string;
    currency: string;
    
    // Préférences de confidentialité
    profile_visibility: 'public' | 'private' | 'friends_only';
    show_email: boolean;
    show_phone: boolean;
    show_activity: boolean;
  }
  
  export interface UserStats {
    total_orders: number;
    total_spent: number;
    favorite_products_count: number;
    reviews_count: number;
    wishlist_count: number;
    loyalty_points: number;
    referrals_count: number;
    stores_following: number;
    
    // Stats spécifiques aux vendors
    store_id?: string;
    products_count?: number;
    store_revenue?: number;
    store_orders?: number;
    store_rating?: number;
    store_reviews_count?: number;
  }
  
  // Interfaces pour les opérations d'authentification
  export interface LoginRequest {
    email: string;
    password: string;
    remember_me?: boolean;
    device_info?: DeviceInfo;
  }
  
  export interface RegisterRequest {
    email: string;
    password: string;
    password_confirmation: string;
    first_name: string;
    last_name: string;
    phone?: string;
    date_of_birth?: string;
    gender?: Gender;
    terms_accepted: boolean;
    marketing_consent?: boolean;
  }
  
  export interface AuthResponse {
    user: User;
    token: string;
    refresh_token: string;
    expires_in: number;
    two_factor_required?: boolean;
  }
  
  export interface DeviceInfo {
    device_type: 'web' | 'mobile' | 'tablet';
    device_name: string;
    browser?: string;
    os?: string;
    ip_address?: string;
    user_agent?: string;
  }
  
  // Interfaces pour la gestion du profil
  export interface UpdateProfileRequest {
    first_name?: string;
    last_name?: string;
    phone?: string;
    date_of_birth?: string;
    gender?: Gender;
    bio?: string;
    website?: string;
    location?: string;
  }
  
  export interface ChangePasswordRequest {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }
  
  export interface UpdatePreferencesRequest {
    preferences: Partial<UserPreferences>;
  }
  
  // Interface pour la vérification 2FA
  export interface TwoFactorSetupResponse {
    secret: string;
    qr_code: string;
    backup_codes: string[];
  }
  
  export interface TwoFactorVerifyRequest {
    code: string;
    backup_code?: string;
  }
  
  // Interface pour la récupération de mot de passe
  export interface ForgotPasswordRequest {
    email: string;
  }
  
  export interface ResetPasswordRequest {
    token: string;
    password: string;
  }
  
  // Interface pour la vérification d'email
  export interface EmailVerificationRequest {
    token: string;
  }
  
  export interface ResendVerificationRequest {
    email: string;
  }
  
  // Interfaces pour la gestion des sessions
  export interface UserSession {
    id: string;
    user_id: string;
    device_info: DeviceInfo;
    ip_address: string;
    is_current: boolean;
    created_at: string;
    last_activity: string;
    expires_at: string;
  }
  
  // Interface pour les adresses utilisateur
  export interface UserAddress {
    id: string;
    user_id: string;
    type: 'shipping' | 'billing';
    first_name: string;
    last_name: string;
    company?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
  }
  
  // Interface pour les méthodes de paiement
  export interface UserPaymentMethod {
    id: string;
    user_id: string;
    type: 'card' | 'paypal' | 'mobile_money';
    provider: string;
    details: {
      last_digits?: string;
      brand?: string;
      expires_at?: string;
      phone_number?: string;
      account_name?: string;
    };
    is_default: boolean;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
  }
  
  // Interface pour l'activité utilisateur
  export interface UserActivity {
    id: string;
    user_id: string;
    action: string;
    description: string;
    ip_address: string;
    user_agent: string;
    metadata?: { [key: string]: any };
    created_at: string;
  }
  
  // Utilitaires pour les rôles et permissions
  export const USER_ROLES = {
    CUSTOMER: 'customer',
    VENDOR: 'vendor', 
    MANAGER: 'manager',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
  } as const;
  
  export const USER_PERMISSIONS = {
    // Permissions customer
    PLACE_ORDER: 'place_order',
    WRITE_REVIEW: 'write_review',
    CREATE_TICKET: 'create_ticket',
    
    // Permissions vendor
    MANAGE_STORE: 'manage_store',
    MANAGE_PRODUCTS: 'manage_products',
    VIEW_ORDERS: 'view_orders',
    
    // Permissions manager
    MODERATE_CONTENT: 'moderate_content',
    HANDLE_TICKETS: 'handle_tickets',
    VIEW_REPORTS: 'view_reports',
    
    // Permissions admin
    MANAGE_USERS: 'manage_users',
    MANAGE_STORES: 'manage_stores',
    VIEW_ANALYTICS: 'view_analytics',
    SYSTEM_CONFIG: 'system_config',
    
    // Permissions super admin
    MANAGE_ADMINS: 'manage_admins',
    SYSTEM_MAINTENANCE: 'system_maintenance'
  } as const;
  
  // Helper functions
  export function hasRole(user: User, role: UserRole): boolean {
    return user.role === role;
  }
  
  export function hasAnyRole(user: User, roles: UserRole[]): boolean {
    return roles.includes(user.role);
  }
  
  export function isAdmin(user: User): boolean {
    return hasAnyRole(user, ['admin', 'super_admin']);
  }
  
  export function isVendor(user: User): boolean {
    return hasRole(user, 'vendor');
  }
  
  export function isCustomer(user: User): boolean {
    return hasRole(user, 'customer');
  }
  
  export function getFullName(user: User): string {
    return `${user.first_name} ${user.last_name}`.trim();
  }
  
  export function getUserDisplayName(user: User): string {
    return getFullName(user) || user.email;
  }
  
  export function isEmailVerified(user: User): boolean {
    return user.is_verified;
  }
  
  export function isAccountActive(user: User): boolean {
    return user.status === 'active';
  }