/**
 * Enums pour les statuts des commandes
 */

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  RETURNED = 'returned'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

export enum ShippingStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED_DELIVERY = 'failed_delivery',
  RETURNED = 'returned'
}

export enum OrderPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum OrderSource {
  WEBSITE = 'website',
  MOBILE_APP = 'mobile_app',
  ADMIN_PANEL = 'admin_panel',
  API = 'api',
  IMPORT = 'import'
}

export enum OrderType {
  REGULAR = 'regular',
  PREORDER = 'preorder',
  BACKORDER = 'backorder',
  RUSH = 'rush',
  BULK = 'bulk'
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'En attente',
  [OrderStatus.CONFIRMED]: 'Confirmée',
  [OrderStatus.PROCESSING]: 'En préparation',
  [OrderStatus.SHIPPED]: 'Expédiée',
  [OrderStatus.DELIVERED]: 'Livrée',
  [OrderStatus.CANCELLED]: 'Annulée',
  [OrderStatus.REFUNDED]: 'Remboursée',
  [OrderStatus.RETURNED]: 'Retournée'
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'En attente',
  [PaymentStatus.PROCESSING]: 'En cours',
  [PaymentStatus.COMPLETED]: 'Payé',
  [PaymentStatus.FAILED]: 'Échoué',
  [PaymentStatus.CANCELLED]: 'Annulé',
  [PaymentStatus.REFUNDED]: 'Remboursé',
  [PaymentStatus.PARTIALLY_REFUNDED]: 'Partiellement remboursé'
};

export const SHIPPING_STATUS_LABELS: Record<ShippingStatus, string> = {
  [ShippingStatus.PENDING]: 'En attente',
  [ShippingStatus.PREPARING]: 'En préparation',
  [ShippingStatus.SHIPPED]: 'Expédié',
  [ShippingStatus.IN_TRANSIT]: 'En transit',
  [ShippingStatus.OUT_FOR_DELIVERY]: 'En livraison',
  [ShippingStatus.DELIVERED]: 'Livré',
  [ShippingStatus.FAILED_DELIVERY]: 'Livraison échouée',
  [ShippingStatus.RETURNED]: 'Retourné'
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: '#F39C12',
  [OrderStatus.CONFIRMED]: '#3498DB',
  [OrderStatus.PROCESSING]: '#9B59B6',
  [OrderStatus.SHIPPED]: '#E67E22',
  [OrderStatus.DELIVERED]: '#27AE60',
  [OrderStatus.CANCELLED]: '#E74C3C',
  [OrderStatus.REFUNDED]: '#95A5A6',
  [OrderStatus.RETURNED]: '#8E44AD'
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: '#F39C12',
  [PaymentStatus.PROCESSING]: '#3498DB',
  [PaymentStatus.COMPLETED]: '#27AE60',
  [PaymentStatus.FAILED]: '#E74C3C',
  [PaymentStatus.CANCELLED]: '#95A5A6',
  [PaymentStatus.REFUNDED]: '#8E44AD',
  [PaymentStatus.PARTIALLY_REFUNDED]: '#E67E22'
};

export const SHIPPING_STATUS_COLORS: Record<ShippingStatus, string> = {
  [ShippingStatus.PENDING]: '#F39C12',
  [ShippingStatus.PREPARING]: '#9B59B6',
  [ShippingStatus.SHIPPED]: '#E67E22',
  [ShippingStatus.IN_TRANSIT]: '#3498DB',
  [ShippingStatus.OUT_FOR_DELIVERY]: '#8E44AD',
  [ShippingStatus.DELIVERED]: '#27AE60',
  [ShippingStatus.FAILED_DELIVERY]: '#E74C3C',
  [ShippingStatus.RETURNED]: '#95A5A6'
};

export const ORDER_STATUS_ICONS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'pending',
  [OrderStatus.CONFIRMED]: 'check_circle',
  [OrderStatus.PROCESSING]: 'build',
  [OrderStatus.SHIPPED]: 'local_shipping',
  [OrderStatus.DELIVERED]: 'done_all',
  [OrderStatus.CANCELLED]: 'cancel',
  [OrderStatus.REFUNDED]: 'money_off',
  [OrderStatus.RETURNED]: 'keyboard_return'
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED
];

export const ORDER_CANCELLABLE_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED
];

export const ORDER_REFUNDABLE_STATUSES: OrderStatus[] = [
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED
];

export const ORDER_SHIPPABLE_STATUSES: OrderStatus[] = [
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING
];

export const ORDER_DELIVERABLE_STATUSES: OrderStatus[] = [
  OrderStatus.SHIPPED
];

export interface OrderStatusTransition {
  from: OrderStatus;
  to: OrderStatus;
  allowed: boolean;
  requiresConfirmation: boolean;
  message: string;
}

export const ORDER_STATUS_TRANSITIONS: OrderStatusTransition[] = [
  {
    from: OrderStatus.PENDING,
    to: OrderStatus.CONFIRMED,
    allowed: true,
    requiresConfirmation: false,
    message: 'Confirmer la commande'
  },
  {
    from: OrderStatus.PENDING,
    to: OrderStatus.CANCELLED,
    allowed: true,
    requiresConfirmation: true,
    message: 'Annuler la commande'
  },
  {
    from: OrderStatus.CONFIRMED,
    to: OrderStatus.PROCESSING,
    allowed: true,
    requiresConfirmation: false,
    message: 'Commencer la préparation'
  },
  {
    from: OrderStatus.CONFIRMED,
    to: OrderStatus.CANCELLED,
    allowed: true,
    requiresConfirmation: true,
    message: 'Annuler la commande'
  },
  {
    from: OrderStatus.PROCESSING,
    to: OrderStatus.SHIPPED,
    allowed: true,
    requiresConfirmation: false,
    message: 'Expédier la commande'
  },
  {
    from: OrderStatus.SHIPPED,
    to: OrderStatus.DELIVERED,
    allowed: true,
    requiresConfirmation: false,
    message: 'Marquer comme livrée'
  },
  {
    from: OrderStatus.DELIVERED,
    to: OrderStatus.RETURNED,
    allowed: true,
    requiresConfirmation: true,
    message: 'Enregistrer un retour'
  },
  {
    from: OrderStatus.DELIVERED,
    to: OrderStatus.REFUNDED,
    allowed: true,
    requiresConfirmation: true,
    message: 'Rembourser la commande'
  }
];
