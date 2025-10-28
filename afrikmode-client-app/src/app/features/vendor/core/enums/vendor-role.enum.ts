/**
 * Enums pour les rôles et permissions du vendor
 */

export enum VendorRole {
  VENDOR = 'vendor',
  ADMIN = 'admin',
  // Only core roles retained in app
}

export enum VendorPermission {
  // Gestion des boutiques
  STORE_CREATE = 'store:create',
  STORE_READ = 'store:read',
  STORE_UPDATE = 'store:update',
  STORE_DELETE = 'store:delete',
  STORE_VERIFY = 'store:verify',
  STORE_SUSPEND = 'store:suspend',

  // Gestion des produits
  PRODUCT_CREATE = 'product:create',
  PRODUCT_READ = 'product:read',
  PRODUCT_UPDATE = 'product:update',
  PRODUCT_DELETE = 'product:delete',
  PRODUCT_PUBLISH = 'product:publish',
  PRODUCT_FEATURE = 'product:feature',

  // Gestion des commandes
  ORDER_READ = 'order:read',
  ORDER_UPDATE = 'order:update',
  ORDER_CANCEL = 'order:cancel',
  ORDER_REFUND = 'order:refund',
  ORDER_SHIP = 'order:ship',

  // Gestion des paiements
  PAYMENT_READ = 'payment:read',
  PAYMENT_PROCESS = 'payment:process',
  PAYOUT_REQUEST = 'payout:request',
  PAYOUT_READ = 'payout:read',

  // Analytics et rapports
  ANALYTICS_READ = 'analytics:read',
  ANALYTICS_EXPORT = 'analytics:export',
  REPORTS_GENERATE = 'reports:generate',

  // Gestion des clients
  CUSTOMER_READ = 'customer:read',
  CUSTOMER_UPDATE = 'customer:update',
  CUSTOMER_COMMUNICATE = 'customer:communicate',

  // Gestion des notifications
  NOTIFICATION_READ = 'notification:read',
  NOTIFICATION_SEND = 'notification:send',
  NOTIFICATION_MANAGE = 'notification:manage',

  // Gestion des paramètres
  SETTINGS_READ = 'settings:read',
  SETTINGS_UPDATE = 'settings:update',
  SETTINGS_ADVANCED = 'settings:advanced',

  // Gestion des intégrations
  INTEGRATION_READ = 'integration:read',
  INTEGRATION_UPDATE = 'integration:update',
  INTEGRATION_MANAGE = 'integration:manage'
}

export enum VendorStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
  INACTIVE = 'inactive'
}

export enum VendorTier {
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  PREMIUM = 'premium'
}

// Définir d'abord les permissions de base
const VENDOR_BASE_PERMISSIONS: VendorPermission[] = [
  VendorPermission.STORE_CREATE,
  VendorPermission.STORE_READ,
  VendorPermission.STORE_UPDATE,
  VendorPermission.PRODUCT_CREATE,
  VendorPermission.PRODUCT_READ,
  VendorPermission.PRODUCT_UPDATE,
  VendorPermission.PRODUCT_DELETE,
  VendorPermission.PRODUCT_PUBLISH,
  VendorPermission.ORDER_READ,
  VendorPermission.ORDER_UPDATE,
  VendorPermission.ORDER_SHIP,
  VendorPermission.PAYMENT_READ,
  VendorPermission.PAYOUT_REQUEST,
  VendorPermission.PAYOUT_READ,
  VendorPermission.ANALYTICS_READ,
  VendorPermission.CUSTOMER_READ,
  VendorPermission.CUSTOMER_COMMUNICATE,
  VendorPermission.NOTIFICATION_READ,
  VendorPermission.SETTINGS_READ,
  VendorPermission.SETTINGS_UPDATE,
  VendorPermission.INTEGRATION_READ
];

const MANAGER_ADDITIONAL_PERMISSIONS: VendorPermission[] = [
  VendorPermission.STORE_DELETE,
  VendorPermission.PRODUCT_FEATURE,
  VendorPermission.ORDER_CANCEL,
  VendorPermission.ORDER_REFUND,
  VendorPermission.PAYMENT_PROCESS,
  VendorPermission.ANALYTICS_EXPORT,
  VendorPermission.REPORTS_GENERATE,
  VendorPermission.CUSTOMER_UPDATE,
  VendorPermission.NOTIFICATION_SEND,
  VendorPermission.SETTINGS_ADVANCED,
  VendorPermission.INTEGRATION_UPDATE
];

const ADMIN_ADDITIONAL_PERMISSIONS: VendorPermission[] = [
  VendorPermission.STORE_VERIFY,
  VendorPermission.STORE_SUSPEND,
  VendorPermission.NOTIFICATION_MANAGE,
  VendorPermission.INTEGRATION_MANAGE
];

export const VENDOR_ROLE_PERMISSIONS: Record<VendorRole, VendorPermission[]> = {
  [VendorRole.VENDOR]: VENDOR_BASE_PERMISSIONS,
  [VendorRole.ADMIN]: [...VENDOR_BASE_PERMISSIONS, ...MANAGER_ADDITIONAL_PERMISSIONS, ...ADMIN_ADDITIONAL_PERMISSIONS],
};

export const VENDOR_TIER_LIMITS: Record<VendorTier, {
  maxStores: number;
  maxProducts: number;
  maxOrdersPerMonth: number;
  maxStorage: number; // en MB
  maxUsers: number;
  features: string[];
}> = {
  [VendorTier.BASIC]: {
    maxStores: 1,
    maxProducts: 100,
    maxOrdersPerMonth: 1000,
    maxStorage: 1000,
    maxUsers: 1,
    features: [
      'basic_analytics',
      'email_support',
      'mobile_app'
    ]
  },
  [VendorTier.PROFESSIONAL]: {
    maxStores: 3,
    maxProducts: 1000,
    maxOrdersPerMonth: 10000,
    maxStorage: 10000,
    maxUsers: 5,
    features: [
      'advanced_analytics',
      'priority_support',
      'mobile_app',
      'custom_domain',
      'seo_tools'
    ]
  },
  [VendorTier.ENTERPRISE]: {
    maxStores: 10,
    maxProducts: 10000,
    maxOrdersPerMonth: 100000,
    maxStorage: 100000,
    maxUsers: 25,
    features: [
      'advanced_analytics',
      'priority_support',
      'mobile_app',
      'custom_domain',
      'seo_tools',
      'api_access',
      'webhooks',
      'custom_integrations'
    ]
  },
  [VendorTier.PREMIUM]: {
    maxStores: -1, // Illimité
    maxProducts: -1, // Illimité
    maxOrdersPerMonth: -1, // Illimité
    maxStorage: -1, // Illimité
    maxUsers: -1, // Illimité
    features: [
      'advanced_analytics',
      'priority_support',
      'mobile_app',
      'custom_domain',
      'seo_tools',
      'api_access',
      'webhooks',
      'custom_integrations',
      'dedicated_support',
      'white_label',
      'custom_features'
    ]
  }
};
