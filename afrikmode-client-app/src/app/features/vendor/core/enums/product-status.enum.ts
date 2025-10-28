/**
 * Enums pour les statuts des produits
 */

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
  BANNED = 'banned'
}

export enum ProductType {
  PHYSICAL = 'physical',
  DIGITAL = 'digital',
  SERVICE = 'service',
  SUBSCRIPTION = 'subscription'
}

export enum ProductCondition {
  NEW = 'new',
  USED = 'used',
  REFURBISHED = 'refurbished',
  DAMAGED = 'damaged'
}

export enum ProductVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  HIDDEN = 'hidden'
}

export enum ProductAttributeType {
  TEXT = 'text',
  COLOR = 'color',
  SIZE = 'size',
  MATERIAL = 'material',
  BRAND = 'brand',
  WEIGHT = 'weight',
  DIMENSIONS = 'dimensions'
}

export enum ProductImageType {
  PRIMARY = 'primary',
  GALLERY = 'gallery',
  THUMBNAIL = 'thumbnail',
  ZOOM = 'zoom'
}

export enum ProductSortBy {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  NAME = 'name',
  PRICE = 'price',
  RATING = 'rating',
  SALES_COUNT = 'sales_count',
  VIEW_COUNT = 'view_count',
  STOCK = 'stock'
}

export enum ProductSortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  [ProductStatus.DRAFT]: 'Brouillon',
  [ProductStatus.ACTIVE]: 'Actif',
  [ProductStatus.INACTIVE]: 'Inactif',
  [ProductStatus.ARCHIVED]: 'Archivé',
  [ProductStatus.BANNED]: 'Banni'
};

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  [ProductType.PHYSICAL]: 'Physique',
  [ProductType.DIGITAL]: 'Numérique',
  [ProductType.SERVICE]: 'Service',
  [ProductType.SUBSCRIPTION]: 'Abonnement'
};

export const PRODUCT_CONDITION_LABELS: Record<ProductCondition, string> = {
  [ProductCondition.NEW]: 'Neuf',
  [ProductCondition.USED]: 'Occasion',
  [ProductCondition.REFURBISHED]: 'Reconditionné',
  [ProductCondition.DAMAGED]: 'Endommagé'
};

export const PRODUCT_VISIBILITY_LABELS: Record<ProductVisibility, string> = {
  [ProductVisibility.PUBLIC]: 'Public',
  [ProductVisibility.PRIVATE]: 'Privé',
  [ProductVisibility.HIDDEN]: 'Masqué'
};

export const PRODUCT_STATUS_COLORS: Record<ProductStatus, string> = {
  [ProductStatus.DRAFT]: '#95A5A6',
  [ProductStatus.ACTIVE]: '#27AE60',
  [ProductStatus.INACTIVE]: '#F39C12',
  [ProductStatus.ARCHIVED]: '#8E44AD',
  [ProductStatus.BANNED]: '#E74C3C'
};

export const PRODUCT_STATUS_ICONS: Record<ProductStatus, string> = {
  [ProductStatus.DRAFT]: 'draft',
  [ProductStatus.ACTIVE]: 'check_circle',
  [ProductStatus.INACTIVE]: 'pause_circle',
  [ProductStatus.ARCHIVED]: 'archive',
  [ProductStatus.BANNED]: 'block'
};

export const PRODUCT_ATTRIBUTE_TYPE_ICONS: Record<ProductAttributeType, string> = {
  [ProductAttributeType.TEXT]: 'text_fields',
  [ProductAttributeType.COLOR]: 'palette',
  [ProductAttributeType.SIZE]: 'straighten',
  [ProductAttributeType.MATERIAL]: 'category',
  [ProductAttributeType.BRAND]: 'business',
  [ProductAttributeType.WEIGHT]: 'fitness_center',
  [ProductAttributeType.DIMENSIONS]: 'aspect_ratio'
};

export const PRODUCT_ATTRIBUTE_TYPE_LABELS: Record<ProductAttributeType, string> = {
  [ProductAttributeType.TEXT]: 'Texte',
  [ProductAttributeType.COLOR]: 'Couleur',
  [ProductAttributeType.SIZE]: 'Taille',
  [ProductAttributeType.MATERIAL]: 'Matériau',
  [ProductAttributeType.BRAND]: 'Marque',
  [ProductAttributeType.WEIGHT]: 'Poids',
  [ProductAttributeType.DIMENSIONS]: 'Dimensions'
};

export const PRODUCT_SORT_LABELS: Record<ProductSortBy, string> = {
  [ProductSortBy.CREATED_AT]: 'Date de création',
  [ProductSortBy.UPDATED_AT]: 'Date de modification',
  [ProductSortBy.NAME]: 'Nom',
  [ProductSortBy.PRICE]: 'Prix',
  [ProductSortBy.RATING]: 'Note',
  [ProductSortBy.SALES_COUNT]: 'Ventes',
  [ProductSortBy.VIEW_COUNT]: 'Vues',
  [ProductSortBy.STOCK]: 'Stock'
};

export const PRODUCT_STATUS_FLOW: ProductStatus[] = [
  ProductStatus.DRAFT,
  ProductStatus.ACTIVE,
  ProductStatus.INACTIVE,
  ProductStatus.ARCHIVED
];

export const PRODUCT_PUBLISHABLE_STATUSES: ProductStatus[] = [
  ProductStatus.DRAFT,
  ProductStatus.INACTIVE
];

export const PRODUCT_EDITABLE_STATUSES: ProductStatus[] = [
  ProductStatus.DRAFT,
  ProductStatus.ACTIVE,
  ProductStatus.INACTIVE
];

export const PRODUCT_DELETABLE_STATUSES: ProductStatus[] = [
  ProductStatus.DRAFT,
  ProductStatus.INACTIVE,
  ProductStatus.ARCHIVED
];

export interface ProductStatusTransition {
  from: ProductStatus;
  to: ProductStatus;
  allowed: boolean;
  requiresConfirmation: boolean;
  message: string;
}

export const PRODUCT_STATUS_TRANSITIONS: ProductStatusTransition[] = [
  {
    from: ProductStatus.DRAFT,
    to: ProductStatus.ACTIVE,
    allowed: true,
    requiresConfirmation: false,
    message: 'Publier le produit'
  },
  {
    from: ProductStatus.DRAFT,
    to: ProductStatus.ARCHIVED,
    allowed: true,
    requiresConfirmation: true,
    message: 'Archiver le produit'
  },
  {
    from: ProductStatus.ACTIVE,
    to: ProductStatus.INACTIVE,
    allowed: true,
    requiresConfirmation: false,
    message: 'Désactiver le produit'
  },
  {
    from: ProductStatus.ACTIVE,
    to: ProductStatus.ARCHIVED,
    allowed: true,
    requiresConfirmation: true,
    message: 'Archiver le produit'
  },
  {
    from: ProductStatus.INACTIVE,
    to: ProductStatus.ACTIVE,
    allowed: true,
    requiresConfirmation: false,
    message: 'Activer le produit'
  },
  {
    from: ProductStatus.INACTIVE,
    to: ProductStatus.ARCHIVED,
    allowed: true,
    requiresConfirmation: true,
    message: 'Archiver le produit'
  },
  {
    from: ProductStatus.ARCHIVED,
    to: ProductStatus.DRAFT,
    allowed: true,
    requiresConfirmation: false,
    message: 'Restaurer le produit'
  }
];

export const PRODUCT_VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 200,
    REQUIRED: true
  },
  DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 5000,
    REQUIRED: true
  },
  SHORT_DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 500,
    REQUIRED: true
  },
  SKU: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    REQUIRED: true,
    PATTERN: /^[A-Z0-9-_]+$/
  },
  PRICE: {
    MIN: 0,
    MAX: 999999999,
    REQUIRED: true
  },
  QUANTITY: {
    MIN: 0,
    MAX: 999999,
    REQUIRED: true
  },
  WEIGHT: {
    MIN: 0,
    MAX: 999999,
    REQUIRED: false
  },
  TAGS: {
    MAX_COUNT: 20,
    MAX_LENGTH_PER_TAG: 50
  },
  IMAGES: {
    MIN_COUNT: 1,
    MAX_COUNT: 10,
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  }
} as const;
