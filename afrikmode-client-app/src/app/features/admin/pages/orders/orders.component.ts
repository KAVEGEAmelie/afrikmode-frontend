// src/app/features/admin/pages/orders/orders.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

// Angular Material Modules
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  store: {
    name: string;
    id: string;
  };
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
  trackingNumber?: string;
  notes?: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<Order>([]);
  displayedColumns: string[] = ['orderNumber', 'customer', 'store', 'items', 'status', 'paymentStatus', 'total', 'createdAt', 'actions'];
  
  loading = false;
  searchForm: FormGroup;
  
  orderStatuses = [
    { value: 'pending', label: 'En attente' },
    { value: 'confirmed', label: 'Confirmée' },
    { value: 'processing', label: 'En cours' },
    { value: 'shipped', label: 'Expédiée' },
    { value: 'delivered', label: 'Livrée' },
    { value: 'cancelled', label: 'Annulée' },
    { value: 'returned', label: 'Retournée' }
  ];

  paymentStatuses = [
    { value: 'pending', label: 'En attente' },
    { value: 'paid', label: 'Payée' },
    { value: 'failed', label: 'Échouée' },
    { value: 'refunded', label: 'Remboursée' }
  ];

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      search: [''],
      status: [''],
      paymentStatus: [''],
      dateFrom: [''],
      dateTo: ['']
    });
  }

  ngOnInit(): void {
    this.loadOrders();
    this.setupSearch();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private setupSearch(): void {
    this.searchForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  private applyFilters(): void {
    const filters = this.searchForm.value;
    
    this.dataSource.filterPredicate = (data: Order, filter: string) => {
      const searchMatch = !filters.search || 
        data.orderNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        data.customer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        data.customer.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        data.store.name.toLowerCase().includes(filters.search.toLowerCase());
      
      const statusMatch = !filters.status || data.status === filters.status;
      const paymentStatusMatch = !filters.paymentStatus || data.paymentStatus === filters.paymentStatus;
      
      const dateFromMatch = !filters.dateFrom || data.createdAt >= new Date(filters.dateFrom);
      const dateToMatch = !filters.dateTo || data.createdAt <= new Date(filters.dateTo);
      
      return searchMatch && statusMatch && paymentStatusMatch && dateFromMatch && dateToMatch;
    };
    
    this.dataSource.filter = Math.random().toString();
  }

  loadOrders(): void {
    this.loading = true;
    
    // Simuler des données pour l'instant
    const mockOrders: Order[] = [
      {
        id: '1',
        orderNumber: 'CMD-2024-001',
        customer: {
          name: 'Marie Dupont',
          email: 'marie.dupont@email.com',
          phone: '+33 1 23 45 67 89'
        },
        store: {
          name: 'Boutique Afrique',
          id: 'store-1'
        },
        items: [
          { productName: 'Robe Wax Africaine', quantity: 1, price: 89.99 },
          { productName: 'Sac à Main Cuir', quantity: 1, price: 45.00 }
        ],
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'Carte bancaire',
        subtotal: 134.99,
        shipping: 9.99,
        tax: 14.50,
        total: 159.48,
        currency: 'EUR',
        shippingAddress: {
          street: '123 Rue de la Paix',
          city: 'Paris',
          postalCode: '75001',
          country: 'France'
        },
        createdAt: new Date('2024-09-25'),
        updatedAt: new Date('2024-10-01'),
        trackingNumber: 'TRK123456789',
        notes: 'Livraison réussie'
      },
      {
        id: '2',
        orderNumber: 'CMD-2024-002',
        customer: {
          name: 'Jean Martin',
          email: 'jean.martin@email.com',
          phone: '+33 6 12 34 56 78'
        },
        store: {
          name: 'Mode Ghana',
          id: 'store-2'
        },
        items: [
          { productName: 'Chemise Kente', quantity: 2, price: 75.50 }
        ],
        status: 'shipped',
        paymentStatus: 'paid',
        paymentMethod: 'PayPal',
        subtotal: 151.00,
        shipping: 12.99,
        tax: 16.40,
        total: 180.39,
        currency: 'EUR',
        shippingAddress: {
          street: '456 Avenue des Champs',
          city: 'Lyon',
          postalCode: '69001',
          country: 'France'
        },
        createdAt: new Date('2024-09-28'),
        updatedAt: new Date('2024-10-02'),
        trackingNumber: 'TRK987654321'
      },
      {
        id: '3',
        orderNumber: 'CMD-2024-003',
        customer: {
          name: 'Sophie Bernard',
          email: 'sophie.bernard@email.com',
          phone: '+33 7 89 01 23 45'
        },
        store: {
          name: 'Petits Africains',
          id: 'store-3'
        },
        items: [
          { productName: 'Ensemble Enfant Bogolan', quantity: 1, price: 45.00 }
        ],
        status: 'processing',
        paymentStatus: 'paid',
        paymentMethod: 'Virement bancaire',
        subtotal: 45.00,
        shipping: 6.99,
        tax: 5.20,
        total: 57.19,
        currency: 'EUR',
        shippingAddress: {
          street: '789 Boulevard de la République',
          city: 'Marseille',
          postalCode: '13001',
          country: 'France'
        },
        createdAt: new Date('2024-10-01'),
        updatedAt: new Date('2024-10-02')
      },
      {
        id: '4',
        orderNumber: 'CMD-2024-004',
        customer: {
          name: 'Pierre Dubois',
          email: 'pierre.dubois@email.com',
          phone: '+33 6 98 76 54 32'
        },
        store: {
          name: 'Artisanat Africain',
          id: 'store-4'
        },
        items: [
          { productName: 'Boubou Brodé', quantity: 1, price: 150.00 }
        ],
        status: 'cancelled',
        paymentStatus: 'refunded',
        paymentMethod: 'Carte bancaire',
        subtotal: 150.00,
        shipping: 15.99,
        tax: 16.60,
        total: 182.59,
        currency: 'EUR',
        shippingAddress: {
          street: '321 Rue de la Liberté',
          city: 'Toulouse',
          postalCode: '31000',
          country: 'France'
        },
        createdAt: new Date('2024-09-30'),
        updatedAt: new Date('2024-10-01'),
        notes: 'Annulée par le client'
      },
      {
        id: '5',
        orderNumber: 'CMD-2024-005',
        customer: {
          name: 'Claire Laurent',
          email: 'claire.laurent@email.com',
          phone: '+33 5 55 44 33 22'
        },
        store: {
          name: 'Traditions Sénégal',
          id: 'store-5'
        },
        items: [
          { productName: 'Robe Wax Africaine', quantity: 1, price: 89.99 },
          { productName: 'Sac à Main Cuir', quantity: 1, price: 45.00 }
        ],
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'Chèque',
        subtotal: 134.99,
        shipping: 9.99,
        tax: 14.50,
        total: 159.48,
        currency: 'EUR',
        shippingAddress: {
          street: '654 Avenue de la Gare',
          city: 'Nice',
          postalCode: '06000',
          country: 'France'
        },
        createdAt: new Date('2024-10-02'),
        updatedAt: new Date('2024-10-02')
      }
    ];

    setTimeout(() => {
      this.dataSource.data = mockOrders;
      this.loading = false;
    }, 1000);
  }

  getStatusLabel(status: string): string {
    const statusObj = this.orderStatuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'accent';
      case 'confirmed':
        return 'primary';
      case 'processing':
        return 'warn';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'primary';
      case 'cancelled':
        return 'warn';
      case 'returned':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getPaymentStatusLabel(status: string): string {
    const statusObj = this.paymentStatuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  }

  getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'accent';
      case 'paid':
        return 'primary';
      case 'failed':
        return 'warn';
      case 'refunded':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getTotalItems(order: Order): number {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  }

  updateOrderStatus(order: Order, newStatus: string): void {
    console.log('Update order status:', order, newStatus);
    // TODO: Mettre à jour le statut
  }

  updatePaymentStatus(order: Order, newStatus: string): void {
    console.log('Update payment status:', order, newStatus);
    // TODO: Mettre à jour le statut de paiement
  }

  viewOrderDetails(order: Order): void {
    console.log('View order details:', order);
    // TODO: Naviguer vers détails commande
  }

  printOrder(order: Order): void {
    console.log('Print order:', order);
    // TODO: Imprimer la commande
  }

  sendTrackingEmail(order: Order): void {
    console.log('Send tracking email:', order);
    // TODO: Envoyer email de suivi
  }

  cancelOrder(order: Order): void {
    console.log('Cancel order:', order);
    // TODO: Annuler la commande
  }

  refundOrder(order: Order): void {
    console.log('Refund order:', order);
    // TODO: Rembourser la commande
  }

  exportOrders(): void {
    console.log('Export orders');
    // TODO: Exporter les commandes
  }

  clearFilters(): void {
    this.searchForm.reset();
  }
}
