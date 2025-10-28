// src/app/core/models/address.model.ts

export interface Address {
  id?: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  postal_code: string;
  country: string;
  state?: string;
  type: 'shipping' | 'billing';
  is_default: boolean;
  label?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}