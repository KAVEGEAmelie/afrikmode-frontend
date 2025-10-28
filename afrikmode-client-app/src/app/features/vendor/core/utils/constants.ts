/**
 * Constantes pour les fonctionnalités vendor
 */

// ========== CONFIGURATION GÉNÉRALE ==========

export const VENDOR_CONFIG = {
  MAX_PRODUCTS_PER_STORE: 1000,
  MAX_IMAGES_PER_PRODUCT: 10,
  MAX_FILE_SIZE_MB: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  DEFAULT_CURRENCY: 'XOF',
  DEFAULT_LANGUAGE: 'fr',
  PAGINATION_DEFAULT_LIMIT: 20,
  PAGINATION_MAX_LIMIT: 100,
  COMMISSION_RATE_MIN: 0,
  COMMISSION_RATE_MAX: 50,
  DEFAULT_COMMISSION_RATE: 10,
  MIN_ORDER_AMOUNT: 1000,
  MAX_DELIVERY_FEE: 10000,
  PASSWORD_MIN_LENGTH: 8,
  PHONE_LENGTH: 8,
  SKU_LENGTH: 10,
  ORDER_NUMBER_PREFIX: 'AFM',
  COUPON_CODE_LENGTH: 8,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_SHORT_DESCRIPTION_LENGTH: 200,
  MAX_TITLE_LENGTH: 100,
  MAX_TAG_LENGTH: 50,
  MAX_TAGS_PER_PRODUCT: 10
} as const;

// ========== STATUTS ==========

export const ORDER_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const;

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
} as const;

export const STORE_STATUSES = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  CLOSED: 'closed'
} as const;

export const PRODUCT_STATUSES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  OUT_OF_STOCK: 'out_of_stock'
} as const;

export const PAYOUT_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
} as const;

// ========== TYPES DE BOUTIQUES ==========

export const BUSINESS_TYPES = [
  { value: 'individual', label: 'Particulier' },
  { value: 'company', label: 'Entreprise' },
  { value: 'association', label: 'Association' },
  { value: 'cooperative', label: 'Coopérative' },
  { value: 'ngo', label: 'ONG' }
] as const;

// ========== SPÉCIALITÉS ==========

export const SPECIALTIES = [
  { value: 'fashion', label: 'Mode & Vêtements' },
  { value: 'accessories', label: 'Accessoires' },
  { value: 'jewelry', label: 'Bijoux' },
  { value: 'shoes', label: 'Chaussures' },
  { value: 'bags', label: 'Sacs & Maroquinerie' },
  { value: 'beauty', label: 'Beauté & Cosmétiques' },
  { value: 'home', label: 'Maison & Décoration' },
  { value: 'electronics', label: 'Électronique' },
  { value: 'books', label: 'Livres & Médias' },
  { value: 'sports', label: 'Sport & Loisirs' },
  { value: 'food', label: 'Alimentation' },
  { value: 'health', label: 'Santé & Bien-être' },
  { value: 'automotive', label: 'Automobile' },
  { value: 'tools', label: 'Outillage' },
  { value: 'garden', label: 'Jardinage' },
  { value: 'kids', label: 'Enfants & Bébés' },
  { value: 'pets', label: 'Animaux' },
  { value: 'art', label: 'Art & Artisanat' },
  { value: 'other', label: 'Autre' }
] as const;

// ========== PAYS ==========

export const COUNTRIES = [
  { code: 'CI', name: 'Côte d\'Ivoire', currency: 'XOF' },
  { code: 'SN', name: 'Sénégal', currency: 'XOF' },
  { code: 'ML', name: 'Mali', currency: 'XOF' },
  { code: 'BF', name: 'Burkina Faso', currency: 'XOF' },
  { code: 'NE', name: 'Niger', currency: 'XOF' },
  { code: 'TG', name: 'Togo', currency: 'XOF' },
  { code: 'BJ', name: 'Bénin', currency: 'XOF' },
  { code: 'GH', name: 'Ghana', currency: 'GHS' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN' },
  { code: 'CM', name: 'Cameroun', currency: 'XAF' },
  { code: 'TD', name: 'Tchad', currency: 'XAF' },
  { code: 'CF', name: 'République Centrafricaine', currency: 'XAF' },
  { code: 'CD', name: 'République Démocratique du Congo', currency: 'CDF' },
  { code: 'CG', name: 'République du Congo', currency: 'XAF' },
  { code: 'GA', name: 'Gabon', currency: 'XAF' },
  { code: 'GQ', name: 'Guinée Équatoriale', currency: 'XAF' },
  { code: 'ST', name: 'São Tomé-et-Príncipe', currency: 'STD' }
] as const;

// ========== RÉGIONS DE CÔTE D'IVOIRE ==========

export const IVORY_COAST_REGIONS = [
  'Abidjan',
  'Bas-Sassandra',
  'Comoé',
  'Denguélé',
  'Gôh-Djiboua',
  'Lacs',
  'Lagunes',
  'Montagnes',
  'Sassandra-Marahoué',
  'Savanes',
  'Vallée du Bandama',
  'Woroba',
  'Yamoussoukro',
  'Zanzan'
] as const;

// ========== MÉTHODES DE PAIEMENT ==========

export const PAYMENT_METHODS = [
  { value: 'mobile_money', label: 'Mobile Money', icon: 'phone_android' },
  { value: 'bank_transfer', label: 'Virement Bancaire', icon: 'account_balance' },
  { value: 'credit_card', label: 'Carte de Crédit', icon: 'credit_card' },
  { value: 'cash_on_delivery', label: 'Paiement à la Livraison', icon: 'local_shipping' },
  { value: 'paypal', label: 'PayPal', icon: 'paypal' },
  { value: 'stripe', label: 'Stripe', icon: 'payment' }
] as const;

// ========== MÉTHODES DE LIVRAISON ==========

export const DELIVERY_METHODS = [
  { value: 'standard', label: 'Livraison Standard', duration: '3-5 jours' },
  { value: 'express', label: 'Livraison Express', duration: '1-2 jours' },
  { value: 'pickup', label: 'Retrait en Boutique', duration: 'Immédiat' },
  { value: 'scheduled', label: 'Livraison Programmée', duration: 'Selon planning' }
] as const;

// ========== TYPES DE PRODUITS ==========

export const PRODUCT_TYPES = [
  { value: 'physical', label: 'Produit Physique' },
  { value: 'digital', label: 'Produit Numérique' },
  { value: 'service', label: 'Service' },
  { value: 'subscription', label: 'Abonnement' }
] as const;

// ========== UNITÉS DE MESURE ==========

export const MEASUREMENT_UNITS = [
  { value: 'piece', label: 'Pièce', symbol: 'pce' },
  { value: 'kg', label: 'Kilogramme', symbol: 'kg' },
  { value: 'g', label: 'Gramme', symbol: 'g' },
  { value: 'l', label: 'Litre', symbol: 'L' },
  { value: 'ml', label: 'Millilitre', symbol: 'ml' },
  { value: 'm', label: 'Mètre', symbol: 'm' },
  { value: 'cm', label: 'Centimètre', symbol: 'cm' },
  { value: 'box', label: 'Boîte', symbol: 'bx' },
  { value: 'pack', label: 'Paquet', symbol: 'pk' },
  { value: 'set', label: 'Ensemble', symbol: 'st' }
] as const;

// ========== COULEURS ==========

export const COLORS = [
  { value: 'black', label: 'Noir', hex: '#000000' },
  { value: 'white', label: 'Blanc', hex: '#FFFFFF' },
  { value: 'red', label: 'Rouge', hex: '#FF0000' },
  { value: 'blue', label: 'Bleu', hex: '#0000FF' },
  { value: 'green', label: 'Vert', hex: '#008000' },
  { value: 'yellow', label: 'Jaune', hex: '#FFFF00' },
  { value: 'orange', label: 'Orange', hex: '#FFA500' },
  { value: 'purple', label: 'Violet', hex: '#800080' },
  { value: 'pink', label: 'Rose', hex: '#FFC0CB' },
  { value: 'brown', label: 'Marron', hex: '#A52A2A' },
  { value: 'gray', label: 'Gris', hex: '#808080' },
  { value: 'beige', label: 'Beige', hex: '#F5F5DC' },
  { value: 'navy', label: 'Bleu Marine', hex: '#000080' },
  { value: 'maroon', label: 'Bordeaux', hex: '#800000' },
  { value: 'olive', label: 'Olive', hex: '#808000' },
  { value: 'teal', label: 'Sarcelle', hex: '#008080' },
  { value: 'silver', label: 'Argent', hex: '#C0C0C0' },
  { value: 'gold', label: 'Or', hex: '#FFD700' }
] as const;

// ========== TAILLES ==========

export const SIZES = {
  CLOTHING: [
    'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
    '36', '38', '40', '42', '44', '46', '48', '50', '52', '54'
  ],
  SHOES: [
    '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48'
  ],
  HATS: [
    'S', 'M', 'L', 'XL', 'XXL'
  ],
  RINGS: [
    '48', '50', '52', '54', '56', '58', '60', '62', '64', '66', '68', '70'
  ],
  UNISEX: [
    'XS', 'S', 'M', 'L', 'XL', 'XXL'
  ]
} as const;

// ========== MATÉRIAUX ==========

export const MATERIALS = [
  'Coton',
  'Polyester',
  'Laine',
  'Soie',
  'Lin',
  'Cuir',
  'Daim',
  'Denim',
  'Jersey',
  'Velours',
  'Satin',
  'Organza',
  'Tulle',
  'Chiffon',
  'Crêpe',
  'Gabardine',
  'Tweed',
  'Tricot',
  'Mesh',
  'Plastique',
  'Métal',
  'Bois',
  'Verre',
  'Céramique',
  'Pierre',
  'Perle',
  'Autre'
] as const;

// ========== PÉRIODES D'ANALYSE ==========

export const ANALYTICS_PERIODS = [
  { value: '7d', label: '7 derniers jours' },
  { value: '30d', label: '30 derniers jours' },
  { value: '90d', label: '3 derniers mois' },
  { value: '1y', label: '1 an' },
  { value: 'all', label: 'Tout le temps' }
] as const;

// ========== TYPES DE NOTIFICATIONS ==========

export const NOTIFICATION_TYPES = {
  ORDER: 'order',
  PAYMENT: 'payment',
  PRODUCT: 'product',
  STORE: 'store',
  SYSTEM: 'system',
  MARKETING: 'marketing'
} as const;

// ========== PRIORITÉS DE NOTIFICATIONS ==========

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

// ========== TYPES DE COUPONS ==========

export const COUPON_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  FREE_SHIPPING: 'free_shipping',
  BUY_X_GET_Y: 'buy_x_get_y'
} as const;

// ========== TYPES DE PROMOTIONS ==========

export const PROMOTION_TYPES = {
  DISCOUNT: 'discount',
  BOGO: 'bogo', // Buy One Get One
  FLASH_SALE: 'flash_sale',
  SEASONAL: 'seasonal',
  CLEARANCE: 'clearance'
} as const;

// ========== RÉSEAUX SOCIAUX ==========

export const SOCIAL_NETWORKS = [
  { value: 'facebook', label: 'Facebook', icon: 'facebook', color: '#1877F2' },
  { value: 'instagram', label: 'Instagram', icon: 'instagram', color: '#E4405F' },
  { value: 'twitter', label: 'Twitter', icon: 'twitter', color: '#1DA1F2' },
  { value: 'linkedin', label: 'LinkedIn', icon: 'linkedin', color: '#0077B5' },
  { value: 'youtube', label: 'YouTube', icon: 'youtube', color: '#FF0000' },
  { value: 'tiktok', label: 'TikTok', icon: 'tiktok', color: '#000000' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp', color: '#25D366' }
] as const;

// ========== HEURES D'OUVERTURE ==========

export const WEEKDAYS = [
  { value: 'monday', label: 'Lundi' },
  { value: 'tuesday', label: 'Mardi' },
  { value: 'wednesday', label: 'Mercredi' },
  { value: 'thursday', label: 'Jeudi' },
  { value: 'friday', label: 'Vendredi' },
  { value: 'saturday', label: 'Samedi' },
  { value: 'sunday', label: 'Dimanche' }
] as const;

// ========== MESSAGES D'ERREUR ==========

export const ERROR_MESSAGES = {
  REQUIRED: 'Ce champ est obligatoire',
  INVALID_EMAIL: 'Adresse email invalide',
  INVALID_PHONE: 'Numéro de téléphone invalide',
  INVALID_URL: 'URL invalide',
  INVALID_DATE: 'Date invalide',
  INVALID_PRICE: 'Prix invalide',
  INVALID_QUANTITY: 'Quantité invalide',
  INVALID_PERCENTAGE: 'Pourcentage invalide',
  INVALID_SKU: 'SKU invalide',
  INVALID_SLUG: 'Slug invalide',
  PASSWORD_TOO_SHORT: 'Mot de passe trop court',
  PASSWORD_MISMATCH: 'Les mots de passe ne correspondent pas',
  FILE_TOO_LARGE: 'Fichier trop volumineux',
  INVALID_FILE_TYPE: 'Type de fichier non autorisé',
  INVALID_IMAGE_DIMENSIONS: 'Dimensions d\'image invalides',
  INVALID_COORDINATES: 'Coordonnées GPS invalides',
  INVALID_COUNTRY_CODE: 'Code pays invalide',
  INVALID_CURRENCY_CODE: 'Code devise invalide',
  INVALID_DATE_RANGE: 'Plage de dates invalide',
  INVALID_OPERATING_HOURS: 'Heures d\'ouverture invalides',
  INVALID_SOCIAL_LINK: 'Lien social invalide',
  INVALID_COUPON_CODE: 'Code de réduction invalide',
  INVALID_FILE_NAME: 'Nom de fichier invalide',
  FILE_NAME_TOO_LONG: 'Nom de fichier trop long',
  IMAGE_DIMENSIONS_EXCEEDED: 'Dimensions d\'image dépassées',
  FILE_SIZE_EXCEEDED: 'Taille de fichier dépassée',
  INVALID_FILE_TYPE_DETAILED: 'Type de fichier non autorisé',
  PAST_DATE: 'Date dans le passé',
  FUTURE_DATE: 'Date dans le futur',
  INVALID_IMAGE: 'Image invalide'
} as const;

// ========== MESSAGES DE SUCCÈS ==========

export const SUCCESS_MESSAGES = {
  STORE_CREATED: 'Boutique créée avec succès',
  STORE_UPDATED: 'Boutique mise à jour avec succès',
  PRODUCT_CREATED: 'Produit créé avec succès',
  PRODUCT_UPDATED: 'Produit mis à jour avec succès',
  PRODUCT_DELETED: 'Produit supprimé avec succès',
  ORDER_UPDATED: 'Commande mise à jour avec succès',
  PAYMENT_PROCESSED: 'Paiement traité avec succès',
  PAYOUT_REQUESTED: 'Demande de paiement envoyée',
  SETTINGS_SAVED: 'Paramètres sauvegardés',
  PROFILE_UPDATED: 'Profil mis à jour',
  PASSWORD_CHANGED: 'Mot de passe modifié',
  EMAIL_SENT: 'Email envoyé',
  NOTIFICATION_SENT: 'Notification envoyée',
  COUPON_CREATED: 'Coupon créé avec succès',
  PROMOTION_CREATED: 'Promotion créée avec succès'
} as const;

// ========== CONFIGURATION DES TABLEAUX ==========

export const TABLE_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  SORT_DIRECTIONS: ['asc', 'desc'] as const,
  DEFAULT_SORT_DIRECTION: 'desc' as const
} as const;

// ========== CONFIGURATION DES GRAPHIQUES ==========

export const CHART_CONFIG = {
  COLORS: [
    '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
    '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#f1c40f'
  ],
  DEFAULT_COLOR: '#3498db',
  ANIMATION_DURATION: 1000,
  RESPONSIVE: true,
  MAINTAIN_ASPECT_RATIO: false
} as const;

// ========== CONFIGURATION DES UPLOADS ==========

export const UPLOAD_CONFIG = {
  MAX_FILES: 10,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'image/jpeg', 'image/png'],
    ALL: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  },
  UPLOAD_URL: '/api/upload',
  CHUNK_SIZE: 1024 * 1024 // 1MB
} as const;


































