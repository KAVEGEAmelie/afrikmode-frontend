// src/app/features/admin/pages/dashboard/components/recent-orders/recent-orders.component.ts

import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../../environments/environment';

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
  @Input() orders: Order[] = [];
  loading = true;
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Si des orders sont passés en Input, les utiliser, sinon charger depuis l'API
    if (this.orders && this.orders.length > 0) {
      this.loading = false;
    } else {
      this.loadOrders();
    }
  }

  loadOrders(): void {
    this.http.get(`${this.apiUrl}/dashboard/recent-activity?limit=5`).subscribe({
      next: (response: any) => {
        if (response.success && response.data && response.data.recentOrders) {
          this.orders = response.data.recentOrders.map((order: any) => ({
            id: order.order_number || order.id || '',
            customer: order.customer_name || order.customer_email || 'Client',
            amount: parseFloat(order.total_amount || 0),
            status: this.mapStatus(order.status),
            date: new Date(order.created_at)
          }));
        } else {
          this.orders = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes récentes:', error);
        this.orders = [];
        this.loading = false;
      }
    });
  }
  
  private mapStatus(status: string): 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' {
    const statusMap: { [key: string]: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' } = {
      'pending': 'pending',
      'processing': 'processing',
      'confirmed': 'processing',
      'shipped': 'shipped',
      'delivered': 'delivered',
      'completed': 'delivered',
      'cancelled': 'cancelled'
    };
    return statusMap[status] || 'pending';
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