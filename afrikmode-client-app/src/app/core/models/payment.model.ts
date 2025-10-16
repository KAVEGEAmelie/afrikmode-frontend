export interface Payment {
    id: string;
    order_id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
    payment_method: string;
    payment_provider: 'stripe' | 'paypal' | 'mobile_money';
    provider_transaction_id?: string;
    reference?: string;
    metadata?: { [key: string]: any };
    created_at: string;
    updated_at: string;
  }
  
  export interface PaymentMethod {
    id: string;
    type: 'card' | 'paypal' | 'mobile_money';
    provider: string;
    details: {
      last_digits?: string;
      brand?: string;
      expires_at?: string;
      phone_number?: string;
    };
    is_default: boolean;
    created_at: string;
  }
  
  export interface PaymentIntent {
    id: string;
    client_secret: string;
    amount: number;
    currency: string;
    status: string;
    payment_method_types: string[];
  }