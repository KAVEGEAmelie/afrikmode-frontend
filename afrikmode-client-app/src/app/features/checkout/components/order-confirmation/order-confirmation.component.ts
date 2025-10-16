import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderData {
  orderId: string;
  items: OrderItem[];
  total: number;
  currency: string;
  shippingAddress: any;
  paymentMethod: string;
  estimatedDelivery: string;
  trackingNumber?: string;
}

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf, NgFor],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss']
})
export class OrderConfirmationComponent implements OnInit {
  
  @Input() orderData: OrderData | null = null;

  // Données de simulation si aucune commande n'est fournie
  mockOrderData: OrderData = {
    orderId: 'AFM-2024-001234',
    items: [
      {
        id: 1,
        name: 'Robe Ankara Élégante',
        price: 45000,
        quantity: 1,
        image: '/assets/images/products/robe-1.jpg'
      },
      {
        id: 2,
        name: 'Chemise Wax Premium',
        price: 35000,
        quantity: 2,
        image: '/assets/images/products/chemise-1.jpg'
      }
    ],
    total: 120000,
    currency: 'FCFA',
    shippingAddress: {
      firstName: 'Marie',
      lastName: 'Dupont',
      address: '123 Rue de la Paix',
      city: 'Lomé',
      country: 'Togo',
      phone: '+228 XX XX XX XX'
    },
    paymentMethod: 'Carte bancaire',
    estimatedDelivery: '2024-10-15',
    trackingNumber: 'AFM-TRACK-789456'
  };

  currentOrder: OrderData | null = null;

  ngOnInit(): void {
    this.currentOrder = this.orderData || this.mockOrderData;
  }

  getOrderSubtotal(): number {
    if (!this.currentOrder) return 0;
    return this.currentOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getShippingCost(): number {
    if (!this.currentOrder) return 0;
    return this.currentOrder.total - this.getOrderSubtotal();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  downloadInvoice(): void {
    // Simulation de téléchargement de facture
    console.log('Téléchargement de la facture...');
    alert('Facture téléchargée !');
  }

  trackOrder(): void {
    // Redirection vers le suivi de commande
    console.log('Redirection vers le suivi...');
  }

  continueShopping(): void {
    // Redirection vers la boutique
    console.log('Retour à la boutique...');
  }
}






