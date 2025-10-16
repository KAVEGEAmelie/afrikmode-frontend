// src/app/features/profile/components/addresses/addresses.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';

interface Address {
  id: string;
  type: 'shipping' | 'billing';
  first_name: string;
  last_name: string;
  address_line_1: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean;
}

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor],
  templateUrl: './addresses.component.html',
  styleUrls: ['./addresses.component.scss']
})
export class AddressesComponent implements OnInit {
  
  addresses: Address[] = [
    {
      id: '1',
      type: 'shipping',
      first_name: 'John',
      last_name: 'Doe',
      address_line_1: '123 Rue de la Liberté, Quartier Admin',
      city: 'Lomé',
      postal_code: '01BP123',
      country: 'Togo',
      phone: '+228 90 12 34 56',
      is_default: true
    },
    {
      id: '2',
      type: 'billing',
      first_name: 'John',
      last_name: 'Doe',
      address_line_1: '456 Avenue du Commerce',
      city: 'Lomé',
      postal_code: '01BP456',
      country: 'Togo',
      phone: '+228 90 12 34 56',
      is_default: false
    }
  ];

  showAddForm = false;

  ngOnInit(): void {}

  addNewAddress(): void {
    this.showAddForm = true;
  }

  editAddress(address: Address): void {
    console.log('Edit address:', address);
  }

  deleteAddress(addressId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) {
      this.addresses = this.addresses.filter(a => a.id !== addressId);
    }
  }

  setDefaultAddress(addressId: string): void {
    this.addresses = this.addresses.map(addr => ({
      ...addr,
      is_default: addr.id === addressId
    }));
  }

  getTypeLabel(type: string): string {
    return type === 'shipping' ? 'Livraison' : 'Facturation';
  }
}