export interface Notification {
    id: string;
    user_id: string;
    type: 'order_update' | 'promotion' | 'new_product' | 'price_drop' | 'account' | 'system';
    title: string;
    message: string;
    data?: { [key: string]: any };
    is_read: boolean;
    action_url?: string;
    created_at: string;
    expires_at?: string;
  }
  
  export interface NotificationPreferences {
    email_notifications: boolean;
    push_notifications: boolean;
    sms_notifications: boolean;
    order_updates: boolean;
    promotions: boolean;
    price_drops: boolean;
    new_products: boolean;
    newsletter: boolean;
  }