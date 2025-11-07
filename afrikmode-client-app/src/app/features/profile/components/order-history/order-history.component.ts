// src/app/features/profile/components/order-history/order-history.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../core/services/order.service';
import { Order } from '../../../../core/models/order.model';

interface OrderDisplay {
  id: string;
  orderNumber: string;
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
  
  orders: OrderDisplay[] = [];
  isLoading = true;
  selectedStatus = 'all';
  error: string | null = null;

  statusOptions = [
    { value: 'all', label: 'Toutes' },
    { value: 'pending', label: 'En attente' },
    { value: 'processing', label: 'En cours' },
    { value: 'shipped', label: 'Expédiée' },
    { value: 'delivered', label: 'Livrée' },
    { value: 'cancelled', label: 'Annulée' }
  ];

  constructor(private orderService: OrderService) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.error = null;
    
    const params: any = {
      page: 1,
      limit: 50
    };

    if (this.selectedStatus !== 'all') {
      params.status = this.selectedStatus;
    }

    this.orderService.getOrders(params).subscribe({
      next: (response: any) => {
        const ordersData = Array.isArray(response) ? response : response.data || [];
        this.orders = ordersData.map((order: Order) => ({
          id: order.id,
          orderNumber: order.order_number,
          date: new Date(order.created_at),
          total: order.total,
          status: order.status as any,
          items: order.items.map(item => ({
            id: parseInt(item.id),
            name: item.product.name,
            image: item.product.image_url || (item.product.images && item.product.images.length > 0 
              ? item.product.images[0].url 
              : 'assets/images/products/default.jpg'),
            quantity: item.quantity,
            price: item.unit_price
          }))
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement commandes:', error);
        this.error = 'Erreur lors du chargement de vos commandes';
        this.isLoading = false;
      }
    });
  }

  get filteredOrders(): OrderDisplay[] {
    if (this.selectedStatus === 'all') {
      return this.orders;
    }
    return this.orders.filter(order => order.status === this.selectedStatus);
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.loadOrders();
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
    // Navigation vers les détails de commande
    window.location.href = `/orders/${orderId}`;
  }

  reorderItems(order: OrderDisplay): void {
    if (confirm('Voulez-vous vraiment recommander ces articles ?')) {
      this.orderService.reorder(order.id).subscribe({
        next: () => {
          alert('Articles ajoutés au panier !');
          window.location.href = '/cart';
        },
        error: (error) => {
          console.error('Erreur recommande:', error);
          alert('Erreur lors de la recommande');
        }
      });
    }
  }
}
