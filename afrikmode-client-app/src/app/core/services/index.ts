// src/app/core/services/index.ts
// Export central de tous les services AfrikMode

// Services de base
export * from './base.service';
export * from './auth.service';
export * from './user.service';

// Services E-commerce
export * from './product.service';
export * from './cart.service';
export * from './order.service';
export * from './payment.service';
export * from './wishlist.service'; 

// Services Support & Communication
export * from './address.service';
export * from './review.service';
export * from './notification.service';
export * from './ticket.service';
export * from './websocket.service'; 

// Services Catalogue
export * from './category.service';
export * from './store.service';

// Services Utilitaires
export * from './upload.service';
export * from './search.service';
export * from './analytics.service';
export * from './loading.service';
export * from './connectivity.service';

// Liste des services pour injection
export const AFRIKMODE_SERVICES = [
  'BaseService',
  'AuthService',
  'UserService',
  'ProductService',
  'CartService',
  'OrderService',
  'PaymentService',
  'WishlistService', 
  'AddressService',
  'ReviewService',
  'NotificationService',
  'TicketService',
  'WebsocketService', 
  'CategoryService',
  'StoreService',
  'UploadService',
  'SearchService',
  'AnalyticsService',
  'LoadingService'
] as const;