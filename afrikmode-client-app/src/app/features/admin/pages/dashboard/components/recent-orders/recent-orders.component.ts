// src/app/features/admin/pages/dashboard/components/recent-orders/recent-orders.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Order {
  id: string;
  customer: string;
  amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: Date;
}

@Component({
  selector: 'app-recent-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-orders.component.html',
  styleUrls: ['./recent-orders.component.scss']
})
export class RecentOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    // Simulation de données - À remplacer par un vrai service
    setTimeout(() => {
      this.orders = [
        {
          id: '#12345',
          customer: 'Amina Touré',
          amount: 45000,
          status: 'processing',
          date: new Date(Date.now() - 2 * 3600000)
        },
        {
          id: '#12344',
          customer: 'Kofi Mensah',
          amount: 32500,
          status: 'shipped',
          date: new Date(Date.now() - 5 * 3600000)
        },
        {
          id: '#12343',
          customer: 'Fatou Diallo',
          amount: 78000,
          status: 'delivered',
          date: new Date(Date.now() - 24 * 3600000)
        },
        {
          id: '#12342',
          customer: 'Ibrahim Kane',
          amount: 25000,
          status: 'pending',
          date: new Date(Date.now() - 36 * 3600000)
        },
        {
          id: '#12341',
          customer: 'Awa Ndiaye',
          amount: 56000,
          status: 'delivered',
          date: new Date(Date.now() - 48 * 3600000)
        }
      ];
      this.loading = false;
    }, 500);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'En attente',
      processing: 'En cours',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  formatDate(date: Date): string {
    const now = Date.now();
    const diff = now - date.getTime();
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 24) {
      return `Il y a ${hours}h`;
    }
    
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
  }
}