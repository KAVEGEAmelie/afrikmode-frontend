// src/app/features/orders/components/orders-list/orders-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../core/services/order.service';
import { Order } from '../../../../core/models/order.model';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgIf, NgFor],
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})
export class OrdersListComponent implements OnInit {
  
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  isLoading = true;
  error: string | null = null;

  // Filters
  selectedStatus: string = 'all';
  searchQuery: string = '';
  sortBy: 'date' | 'amount' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Status options
  statusOptions = [
    { value: 'all', label: 'Toutes les commandes', icon: 'fa-list', color: '#6c757d' },
    { value: 'pending', label: 'En attente', icon: 'fa-clock', color: '#ffc107' },
    { value: 'processing', label: 'En préparation', icon: 'fa-box-open', color: '#17a2b8' },
    { value: 'shipped', label: 'Expédiée', icon: 'fa-shipping-fast', color: '#007bff' },
    { value: 'delivered', label: 'Livrée', icon: 'fa-check-circle', color: '#28a745' },
    { value: 'cancelled', label: 'Annulée', icon: 'fa-times-circle', color: '#dc3545' }
  ];

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.error = null;

    const params = {
      page: this.currentPage,
      per_page: this.itemsPerPage,
      status: this.selectedStatus !== 'all' ? this.selectedStatus : undefined,
      sort_by: this.sortBy,
      sort_order: this.sortOrder
    };

    this.orderService.getOrders(params).subscribe({
      next: (response) => {
        this.orders = response.data;
        // Vérifier si la réponse a 'total' ou 'total_items' ou utiliser la longueur
        this.totalItems = (response as any).total || (response as any).total_items || response.data.length;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error = 'Erreur lors du chargement des commandes';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.orders];

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.order_number.toLowerCase().includes(query) ||
        order.items.some(item => item.product.name.toLowerCase().includes(query))
      );
    }

    this.filteredOrders = filtered;
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.loadOrders();
  }

  onSearch(): void {
    this.applyFilters();
  }

  onSort(field: 'date' | 'amount'): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'desc';
    }
    this.loadOrders();
  }

  viewOrder(orderId: string): void {
    this.router.navigate(['/orders', orderId]);
  }

  trackOrder(orderId: string): void {
    this.router.navigate(['/orders', orderId, 'tracking']);
  }

  reorder(orderId: string): void {
    if (confirm('Voulez-vous vraiment recommander ces articles ?')) {
      this.orderService.reorder(orderId).subscribe({
        next: () => {
          alert('Articles ajoutés au panier !');
          this.router.navigate(['/cart']);
        },
        error: (err) => {
          console.error('Error reordering:', err);
          alert('Erreur lors de la recommande');
        }
      });
    }
  }

  downloadInvoice(orderId: string): void {
    this.orderService.downloadInvoice(orderId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `facture-${orderId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading invoice:', err);
        alert('Erreur lors du téléchargement de la facture');
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOrders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  }

  getStatusIcon(status: string): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.icon : 'fa-circle';
  }

  getStatusColor(status: string): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.color : '#6c757d';
  }

  getPaymentStatusLabel(status: string): string {
    const labels: any = {
      'pending': 'En attente',
      'paid': 'Payé',
      'failed': 'Échoué',
      'refunded': 'Remboursé',
      'partially_refunded': 'Partiellement remboursé'
    };
    return labels[status] || status;
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get paginationArray(): number[] {
    const total = this.getTotalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  }
}