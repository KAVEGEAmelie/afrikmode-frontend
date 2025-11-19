// src/app/features/profile/components/addresses/addresses.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddressService } from '../../../../core/services/address.service';
import { Address } from '../../../../core/models/address.model';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './addresses.component.html',
  styleUrls: ['./addresses.component.scss']
})
export class AddressesComponent implements OnInit {
  
  addresses: Address[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  showAddForm = false;
  showEditForm = false;
  editingAddress: Address | null = null;
  newAddress: Partial<Address> = {
    type: 'shipping',
    is_default: false,
    first_name: '',
    last_name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    postal_code: '',
    country: 'CI',
    phone: ''
  };

  constructor(private addressService: AddressService) {}

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.loading = true;
    this.errorMessage = '';
    
    console.log('🔄 Chargement des adresses...');
    
    this.addressService.getAddresses().subscribe({
      next: (addresses) => {
        console.log('✅ Adresses chargées:', addresses);
        // S'assurer que addresses est toujours un tableau
        this.addresses = Array.isArray(addresses) ? addresses : [];
        this.loading = false;
        this.successMessage = `${this.addresses.length} adresse(s) chargée(s)`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des adresses:', error);
        this.loading = false;
        this.errorMessage = `Erreur de connexion: ${error.userMessage || error.message || 'Impossible de charger les adresses'}`;
        // S'assurer que addresses reste un tableau même en cas d'erreur
        this.addresses = [];
      }
    });
  }

  addNewAddress(): void {
    this.showAddForm = true;
    this.resetNewAddress();
  }

  cancelAddAddress(): void {
    this.showAddForm = false;
    this.resetNewAddress();
  }

  resetNewAddress(): void {
    this.newAddress = {
      type: 'shipping',
      is_default: false,
      first_name: '',
      last_name: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      postal_code: '',
      country: 'CI',
      phone: ''
    };
  }

  saveNewAddress(): void {
    if (!this.newAddress.first_name || !this.newAddress.last_name || 
        !this.newAddress.address_line_1 || !this.newAddress.city || 
        !this.newAddress.postal_code || !this.newAddress.phone) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    console.log('🚀 Envoi création adresse vers API:', this.newAddress);

    this.addressService.createAddress(this.newAddress as Address).subscribe({
      next: (address) => {
        console.log('✅ Adresse créée:', address);
        // S'assurer que addresses est un tableau avant d'ajouter
        if (Array.isArray(this.addresses)) {
          this.addresses.push(address);
        } else {
          this.addresses = [address];
        }
        this.showAddForm = false;
        this.loading = false;
        this.successMessage = 'Adresse ajoutée avec succès';
        this.resetNewAddress();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création de l\'adresse:', error);
        this.loading = false;
        this.errorMessage = `Erreur: ${error.userMessage || error.message || 'Impossible d\'ajouter l\'adresse'}`;
      }
    });
  }

  editAddress(address: Address): void {
    console.log('Edit address:', address);
    this.editingAddress = { ...address };
    this.showEditForm = true;
    this.showAddForm = false;
  }

  cancelEditAddress(): void {
    this.showEditForm = false;
    this.editingAddress = null;
  }

  saveEditedAddress(): void {
    if (!this.editingAddress) return;

    if (!this.editingAddress.first_name || !this.editingAddress.last_name || 
        !this.editingAddress.address_line_1 || !this.editingAddress.city || 
        !this.editingAddress.postal_code || !this.editingAddress.phone) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const id = this.editingAddress.id;
    if (!id) {
      this.errorMessage = 'ID d\'adresse manquant';
      this.loading = false;
      return;
    }

    this.addressService.updateAddress(id, this.editingAddress as Address).subscribe({
      next: (address) => {
        console.log('✅ Adresse mise à jour:', address);
        // Mettre à jour la liste
        if (Array.isArray(this.addresses)) {
          const index = this.addresses.findIndex(a => a.id === id);
          if (index !== -1) {
            this.addresses[index] = address;
          }
        }
        this.showEditForm = false;
        this.editingAddress = null;
        this.loading = false;
        this.successMessage = 'Adresse mise à jour avec succès';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la mise à jour de l\'adresse:', error);
        this.loading = false;
        this.errorMessage = `Erreur: ${error.userMessage || error.message || 'Impossible de mettre à jour l\'adresse'}`;
      }
    });
  }

  deleteAddress(addressId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) {
      this.addressService.deleteAddress(addressId).subscribe({
        next: () => {
          // S'assurer que addresses est un tableau avant de filtrer
          if (Array.isArray(this.addresses)) {
          this.addresses = this.addresses.filter(a => a.id !== addressId);
          } else {
            this.addresses = [];
          }
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }

  setDefaultAddress(addressId: string, type: 'shipping' | 'billing'): void {
    this.addressService.setDefaultAddress(addressId, type).subscribe({
      next: () => {
        // S'assurer que addresses est un tableau avant de mapper
        if (Array.isArray(this.addresses)) {
        this.addresses = this.addresses.map(addr => ({
          ...addr,
          is_default: addr.id === addressId
        }));
        } else {
          this.addresses = [];
        }
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
      }
    });
  }

  viewAddressDetails(address: Address): void {
    // Afficher les détails de l'adresse dans une modal ou console
    console.log('📋 Détails de l\'adresse:', address);
    
    const details = `
NOM: ${address.first_name} ${address.last_name}
${address.label ? `LABEL: ${address.label}` : ''}
ADRESSE: ${address.address_line_1}
${address.address_line_2 ? `COMPLÉMENT: ${address.address_line_2}` : ''}
VILLE: ${address.city}, ${address.postal_code}
PAYS: ${this.getCountryName(address.country)}
TÉLÉPHONE: ${address.phone}
${address.email ? `EMAIL: ${address.email}` : ''}
TYPE: ${address.type === 'shipping' ? 'Livraison' : 'Facturation'}
DÉFAUT: ${address.is_default ? 'Oui' : 'Non'}
    `;
    
    alert(details);
  }

  getTypeLabel(type?: string): string {
    if (!type) return 'Livraison';
    return type === 'shipping' ? 'Livraison' : 'Facturation';
  }

  getCountryName(code?: string): string {
    const countries: { [key: string]: string } = {
      'CI': 'Côte d\'Ivoire',
      'SN': 'Sénégal',
      'ML': 'Mali',
      'BF': 'Burkina Faso',
      'NE': 'Niger',
      'TG': 'Togo',
      'BJ': 'Bénin',
      'CM': 'Cameroun',
      'FR': 'France',
      'US': 'États-Unis',
      'GN': 'Guinée',
      'TD': 'Tchad',
      'CF': 'République centrafricaine',
      'GA': 'Gabon',
      'CG': 'Congo',
      'CD': 'RD Congo',
      'AO': 'Angola',
      'ZM': 'Zambie',
      'ZW': 'Zimbabwe',
      'ZA': 'Afrique du Sud',
      'MG': 'Madagascar',
      'MU': 'Maurice',
      'RE': 'Réunion'
    };
    return countries[code || ''] || code || 'N/A';
  }
}