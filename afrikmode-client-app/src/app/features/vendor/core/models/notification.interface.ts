/**
 * Interfaces pour les notifications vendeur
 */

export interface VendorNotification {
  id: string;
  vendor_id: string;
  store_id?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  resource_type?: string;
  resource_id?: string;
  action_url?: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  sent_push: boolean;
  sent_email: boolean;
  sent_sms: boolean;
  read_at?: string;
  archived_at?: string;
  created_at: string;
  expires_at?: string;
}

export type NotificationType =
  | 'order'
  | 'product'
  | 'payment'
  | 'review'
  | 'message'
  | 'system'
  | 'stock'
  | 'performance';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationStatus = 'unread' | 'read' | 'archived';

export interface NotificationStats {
  unread: number;
  byType: { [key: string]: number };
  byStatus: { [key: string]: number };
  byPriority: { [key: string]: number };
}

export interface NotificationResponse {
  success: boolean;
  data: VendorNotification[];
  pagination: {
    total: number;
    unread: number;
    limit: number;
    offset: number;
  };
}

export interface NotificationFilter {
  limit?: number;
  offset?: number;
  unread_only?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
  store_id?: string;
}
