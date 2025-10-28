/**
 * Constantes pour le module Vendor
 */

export const VENDOR_CONSTANTS = {
  // Rôles et permissions
  ROLES: {
    VENDOR: 'vendor',
    MANAGER: 'manager',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
  },

  // Statuts des boutiques
  STORE_STATUS: {
    PENDING: 'pending',
    ACTIVE: 'active',
    SUSPENDED: 'suspended',
    CLOSED: 'closed',
    BANNED: 'banned'
  },

  // Statuts des produits
  PRODUCT_STATUS: {
    DRAFT: 'draft',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    ARCHIVED: 'archived',
    BANNED: 'banned'
  },

  // Statuts des commandes
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
    RETURNED: 'returned'
  },

  // Statuts des paiements
  PAYMENT_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
    PARTIALLY_REFUNDED: 'partially_refunded'
  },

  // Statuts des expéditions
  SHIPPING_STATUS: {
    PENDING: 'pending',
    PREPARING: 'preparing',
    SHIPPED: 'shipped',
    IN_TRANSIT: 'in_transit',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    FAILED_DELIVERY: 'failed_delivery',
    RETURNED: 'returned'
  },

  // Types de notifications
  NOTIFICATION_TYPES: {
    ORDER_RECEIVED: 'order_received',
    ORDER_UPDATED: 'order_updated',
    PAYMENT_RECEIVED: 'payment_received',
    PAYOUT_PROCESSED: 'payout_processed',
    PRODUCT_LOW_STOCK: 'product_low_stock',
    PRODUCT_OUT_OF_STOCK: 'product_out_of_stock',
    REVIEW_RECEIVED: 'review_received',
    STORE_VERIFIED: 'store_verified',
    STORE_SUSPENDED: 'store_suspended',
    COMMISSION_UPDATED: 'commission_updated',
    SYSTEM_MAINTENANCE: 'system_maintenance',
    PROMOTION_AVAILABLE: 'promotion_available'
  },

  // Priorités des notifications
  NOTIFICATION_PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  },

  // Types de business
  BUSINESS_TYPES: {
    FASHION: 'fashion',
    ACCESSORIES: 'accessories',
    HOME_DECOR: 'home_decor',
    ART_CRAFTS: 'art_crafts',
    BEAUTY_COSMETICS: 'beauty_cosmetics',
    FOOD_BEVERAGES: 'food_beverages',
    ELECTRONICS: 'electronics',
    BOOKS_MEDIA: 'books_media',
    SPORTS_FITNESS: 'sports_fitness',
    OTHER: 'other'
  },

  // Méthodes de paiement
  PAYMENT_METHODS: {
    BANK_TRANSFER: 'bank_transfer',
    MOBILE_MONEY: 'mobile_money',
    CRYPTO_WALLET: 'crypto_wallet',
    CHECK: 'check',
    PAYPAL: 'paypal'
  },

  // Périodes d'analytics
  ANALYTICS_PERIODS: {
    LAST_7_DAYS: '7d',
    LAST_30_DAYS: '30d',
    LAST_90_DAYS: '90d',
    LAST_YEAR: '1y',
    CUSTOM: 'custom'
  },

  // Limites de pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },

  // Formats de fichiers
  FILE_FORMATS: {
    IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    DOCUMENTS: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
    EXPORTS: ['csv', 'xlsx', 'pdf', 'json']
  },

  // Tailles de fichiers (en MB)
  FILE_SIZES: {
    MAX_IMAGE: 5,
    MAX_DOCUMENT: 10,
    MAX_EXPORT: 50
  },

  // URLs des API
  API_ENDPOINTS: {
    STORES: '/api/stores',
    PRODUCTS: '/api/products',
    ORDERS: '/api/orders',
    ANALYTICS: '/api/analytics',
    PAYMENTS: '/api/payments',
    NOTIFICATIONS: '/api/notifications',
    UPLOADS: '/api/uploads'
  },

  // Codes d'erreur
  ERROR_CODES: {
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
    INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    STORE_SUSPENDED: 'STORE_SUSPENDED',
    PRODUCT_INACTIVE: 'PRODUCT_INACTIVE',
    ORDER_CANCELLED: 'ORDER_CANCELLED'
  },

  // Messages d'erreur
  ERROR_MESSAGES: {
    UNAUTHORIZED: 'Vous devez être connecté pour accéder à cette ressource',
    FORBIDDEN: 'Vous n\'avez pas les permissions nécessaires',
    NOT_FOUND: 'Ressource introuvable',
    VALIDATION_ERROR: 'Données invalides',
    DUPLICATE_ENTRY: 'Cette ressource existe déjà',
    INSUFFICIENT_STOCK: 'Stock insuffisant',
    PAYMENT_FAILED: 'Échec du paiement',
    STORE_SUSPENDED: 'Votre boutique est suspendue',
    PRODUCT_INACTIVE: 'Ce produit n\'est plus disponible',
    ORDER_CANCELLED: 'Cette commande a été annulée'
  },

  // Messages de succès
  SUCCESS_MESSAGES: {
    STORE_CREATED: 'Boutique créée avec succès',
    STORE_UPDATED: 'Boutique mise à jour avec succès',
    PRODUCT_CREATED: 'Produit créé avec succès',
    PRODUCT_UPDATED: 'Produit mis à jour avec succès',
    ORDER_UPDATED: 'Commande mise à jour avec succès',
    PAYMENT_PROCESSED: 'Paiement traité avec succès',
    NOTIFICATION_SENT: 'Notification envoyée avec succès'
  },

  // Configuration par défaut
  DEFAULT_CONFIG: {
    COMMISSION_RATE: 10,
    MINIMUM_PAYOUT: 1000,
    PAYOUT_FREQUENCY: 'weekly',
    AUTO_ACCEPT_ORDERS: false,
    REQUIRE_ORDER_APPROVAL: true,
    ALLOW_CANCELLATIONS: true,
    CANCELLATION_TIME_LIMIT: 24,
    FREE_SHIPPING_THRESHOLD: 5000,
    FLAT_RATE_SHIPPING: 1000
  },

  // Couleurs par défaut
  DEFAULT_COLORS: {
    PRIMARY: '#8B2E2E',
    SECONDARY: '#2C3E50',
    SUCCESS: '#27AE60',
    WARNING: '#F39C12',
    ERROR: '#E74C3C',
    INFO: '#3498DB'
  },

  // Validation
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 100,
    MIN_DESCRIPTION_LENGTH: 10,
    MAX_DESCRIPTION_LENGTH: 5000,
    MIN_PRICE: 0,
    MAX_PRICE: 999999999,
    MIN_QUANTITY: 0,
    MAX_QUANTITY: 999999
  },

  // Cache
  CACHE_KEYS: {
    VENDOR_PROFILE: 'vendor:profile',
    STORE_LIST: 'vendor:stores',
    PRODUCT_LIST: 'vendor:products',
    ORDER_LIST: 'vendor:orders',
    ANALYTICS: 'vendor:analytics',
    NOTIFICATIONS: 'vendor:notifications'
  },

  // Cache TTL (en secondes)
  CACHE_TTL: {
    PROFILE: 3600, // 1 heure
    STORES: 1800,  // 30 minutes
    PRODUCTS: 900, // 15 minutes
    ORDERS: 300,   // 5 minutes
    ANALYTICS: 1800, // 30 minutes
    NOTIFICATIONS: 60 // 1 minute
  }
} as const;

// Types pour les constantes
export type VendorRole = typeof VENDOR_CONSTANTS.ROLES[keyof typeof VENDOR_CONSTANTS.ROLES];
export type StoreStatus = typeof VENDOR_CONSTANTS.STORE_STATUS[keyof typeof VENDOR_CONSTANTS.STORE_STATUS];
export type ProductStatus = typeof VENDOR_CONSTANTS.PRODUCT_STATUS[keyof typeof VENDOR_CONSTANTS.PRODUCT_STATUS];
export type OrderStatus = typeof VENDOR_CONSTANTS.ORDER_STATUS[keyof typeof VENDOR_CONSTANTS.ORDER_STATUS];
export type PaymentStatus = typeof VENDOR_CONSTANTS.PAYMENT_STATUS[keyof typeof VENDOR_CONSTANTS.PAYMENT_STATUS];
export type ShippingStatus = typeof VENDOR_CONSTANTS.SHIPPING_STATUS[keyof typeof VENDOR_CONSTANTS.SHIPPING_STATUS];
export type NotificationType = typeof VENDOR_CONSTANTS.NOTIFICATION_TYPES[keyof typeof VENDOR_CONSTANTS.NOTIFICATION_TYPES];
export type NotificationPriority = typeof VENDOR_CONSTANTS.NOTIFICATION_PRIORITIES[keyof typeof VENDOR_CONSTANTS.NOTIFICATION_PRIORITIES];
export type BusinessType = typeof VENDOR_CONSTANTS.BUSINESS_TYPES[keyof typeof VENDOR_CONSTANTS.BUSINESS_TYPES];
export type PaymentMethod = typeof VENDOR_CONSTANTS.PAYMENT_METHODS[keyof typeof VENDOR_CONSTANTS.PAYMENT_METHODS];
export type AnalyticsPeriod = typeof VENDOR_CONSTANTS.ANALYTICS_PERIODS[keyof typeof VENDOR_CONSTANTS.ANALYTICS_PERIODS];
export type ErrorCode = typeof VENDOR_CONSTANTS.ERROR_CODES[keyof typeof VENDOR_CONSTANTS.ERROR_CODES];
