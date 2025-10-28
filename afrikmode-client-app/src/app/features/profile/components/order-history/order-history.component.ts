// src/app/features/profile/components/order-history/order-history.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Order {
  id: string;
  date: Date;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit {
  
  orders: Order[] = [];
  isLoading = true;
  selectedStatus = 'all';

  statusOptions = [
    { value: 'all', label: 'Toutes' },
    { value: 'pending', label: 'En attente' },
    { value: 'processing', label: 'En cours' },
    { value: 'shipped', label: 'Expédiée' },
    { value: 'delivered', label: 'Livrée' },
    { value: 'cancelled', label: 'Annulée' }
  ];

  constructor() { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    
    // Simuler le chargement des commandes
    setTimeout(() => {
      this.orders = [
        {
          id: 'AFR-2025-001',
          date: new Date('2025-09-28'),
          total: 85000,
          status: 'delivered',
          items: [
            {
              id: 1,
              name: 'Robe Ankara Elegante',
              image: 'assets/images/products/robe-ankara-1.jpg',
              quantity: 1,
              price: 45000
            },
            {
              id: 2,
              name: 'Sac Kente Premium',
              image: 'assets/images/products/sac-kente-1.jpg',
              quantity: 1,
              price: 40000
            }
          ]
        },
        {
          id: 'AFR-2025-002',
          date: new Date('2025-09-25'),
          total: 120000,
          status: 'shipped',
          items: [
            {
              id: 3,
              name: 'Ensemble Bogolan Moderne',
              image: 'assets/images/products/ensemble-bogolan-1.jpg',
              quantity: 1,
              price: 120000
            }
          ]
        }
      ];
      
      this.isLoading = false;
    }, 1000);
  }

  get filteredOrders(): Order[] {
    if (this.selectedStatus === 'all') {
      return this.orders;
    }
    return this.orders.filter(order => order.status === this.selectedStatus);
  }

  get deliveredOrdersCount(): number {
    return this.orders.filter(order => order.status === 'delivered').length;
  }

  get pendingOrdersCount(): number {
    return this.orders.filter(order => order.status === 'pending' || order.status === 'processing').length;
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  }

  getStatusClass(status: string): string {
    const classes = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return classes[status as keyof typeof classes] || 'status-default';
  }

  viewOrderDetails(orderId: string): void {
    console.log('Voir détails commande:', orderId);
    // Navigation vers les détails de commande
  }

  reorderItems(order: Order): void {
    console.log('Recommander les articles:', order);
    // Logique pour recommander
  }
}
