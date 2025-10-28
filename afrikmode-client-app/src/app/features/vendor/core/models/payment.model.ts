/**
 * Modèle Payment - Gestion des paiements et commissions
 * Basé sur l'API backend /api/payments
 */

export interface Payment {
  id: string;
  order_id: string;
  store_id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_id?: string;
  gateway_response?: Record<string, any>;
  fees: PaymentFees;
  commission: CommissionDetails;
  payout: PayoutDetails;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  failed_at?: string;
  refunded_at?: string;
  refund_amount?: number;
  refund_reason?: string;
}

export interface PaymentFees {
  platform_fee: number;
  payment_gateway_fee: number;
  processing_fee: number;
  total_fees: number;
}

export interface CommissionDetails {
  rate: number;
  amount: number;
  platform_commission: number;
  store_payout: number;
  calculated_at: string;
}

export interface PayoutDetails {
  amount: number;
  status: PayoutStatus;
  method: PayoutMethod;
  account_details?: PayoutAccount;
  scheduled_date?: string;
  processed_date?: string;
  reference?: string;
  failure_reason?: string;
}

export interface PayoutAccount {
  bank_name?: string;
  account_number?: string;
  routing_number?: string;
  swift_code?: string;
  account_holder_name?: string;
  mobile_money_provider?: string;
  mobile_money_number?: string;
  wallet_address?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  provider: string;
  is_active: boolean;
  fees: {
    fixed: number;
    percentage: number;
  };
  supported_currencies: string[];
  processing_time: string;
  icon?: string;
}

export interface PaymentMethodType {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_digital: boolean;
  requires_verification: boolean;
}

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export type PayoutStatus = 
  | 'pending'
  | 'scheduled'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type PayoutMethod = 
  | 'bank_transfer'
  | 'mobile_money'
  | 'crypto_wallet'
  | 'check'
  | 'paypal';

export interface PaymentFilters {
  page?: number;
  limit?: number;
  store_id?: string;
  status?: PaymentStatus;
  payment_method?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
  sort?: 'created_at' | 'amount' | 'status';
  order?: 'asc' | 'desc';
}

export interface PaymentListResponse {
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary?: {
    total_amount: number;
    total_fees: number;
    net_amount: number;
    pending_amount: number;
  };
}

export interface PayoutFilters {
  page?: number;
  limit?: number;
  store_id?: string;
  status?: PayoutStatus;
  method?: PayoutMethod;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  sort?: 'created_at' | 'amount' | 'status';
  order?: 'asc' | 'desc';
}

export interface PayoutListResponse {
  payouts: PayoutDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary?: {
    total_payouts: number;
    pending_payouts: number;
    completed_payouts: number;
    failed_payouts: number;
  };
}

export interface PaymentCreateRequest {
  order_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_details: Record<string, any>;
  return_url?: string;
  cancel_url?: string;
}

export interface PaymentRefundRequest {
  payment_id: string;
  amount?: number; // Si non spécifié, rembourse le montant total
  reason: string;
  notify_customer?: boolean;
}

export interface PayoutRequest {
  store_id: string;
  amount: number;
  method: PayoutMethod;
  account_details: PayoutAccount;
  notes?: string;
}

export interface CommissionSettings {
  store_id: string;
  commission_rate: number;
  minimum_commission: number;
  maximum_commission?: number;
  payment_terms: number; // Jours avant paiement
  auto_payout: boolean;
  payout_threshold: number;
  payout_method: PayoutMethod;
  account_details: PayoutAccount;
  created_at: string;
  updated_at: string;
}

export interface PaymentAnalytics {
  period: string;
  summary: {
    total_payments: number;
    total_amount: number;
    total_fees: number;
    net_amount: number;
    success_rate: number;
    average_payment: number;
  };
  paymentMethods: Array<{
    method: string;
    count: number;
    amount: number;
    percentage: number;
    success_rate: number;
  }>;
  dailyPayments: Array<{
    date: string;
    count: number;
    amount: number;
    fees: number;
    net_amount: number;
  }>;
  commissionBreakdown: {
    total_commission: number;
    platform_commission: number;
    store_payouts: number;
    pending_payouts: number;
  };
  refunds: {
    total_refunds: number;
    refund_amount: number;
    refund_rate: number;
    top_reasons: Array<{
      reason: string;
      count: number;
      amount: number;
    }>;
  };
}

export interface PayoutAnalytics {
  period: string;
  summary: {
    total_payouts: number;
    total_amount: number;
    pending_amount: number;
    average_payout: number;
    success_rate: number;
  };
  payoutMethods: Array<{
    method: PayoutMethod;
    count: number;
    amount: number;
    success_rate: number;
  }>;
  monthlyPayouts: Array<{
    month: string;
    count: number;
    amount: number;
    fees: number;
    net_amount: number;
  }>;
  processingTimes: {
    average_days: number;
    fastest_days: number;
    slowest_days: number;
  };
}

export interface PaymentWebhook {
  id: string;
  event_type: string;
  payment_id: string;
  payload: Record<string, any>;
  processed: boolean;
  processed_at?: string;
  error_message?: string;
  created_at: string;
}

export interface PaymentGateway {
  id: string;
  name: string;
  provider: string;
  is_active: boolean;
  supported_methods: string[];
  supported_currencies: string[];
  fees: {
    fixed: number;
    percentage: number;
  };
  configuration: Record<string, any>;
  webhook_url?: string;
  created_at: string;
  updated_at: string;
}


































