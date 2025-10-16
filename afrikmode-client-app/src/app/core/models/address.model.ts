// src/app/core/models/address.model.ts

export interface Address {
  id?: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  phone?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  address_line_1?: string;
  address_line_2?: string;
}