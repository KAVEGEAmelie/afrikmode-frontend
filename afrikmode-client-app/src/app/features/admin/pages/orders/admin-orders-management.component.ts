import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  paymentMethod: 'mobile_money' | 'cash_on_delivery' | 'bank_transfer' | 'card';
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress: Address;
  billingAddress: Address;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    image?: string;
    sku: string;
  };
  store: {
    id: string;
    name: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant?: {
    size?: string;
    color?: string;
    fabric?: string;
  };
}

export interface Address {
  street: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
  phone: string;
}

export interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalItems: number;
}

@Component({
  selector: 'app-admin-orders-management',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatChipsModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTabsModule,
    MatBadgeModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="orders-management">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>Gestion des Commandes</h1>
          <p>Suivez et gérez toutes les commandes de la marketplace</p>
        </div>
        <div class="header-right">
          <button mat-raised-button color="accent" (click)="exportOrders()">
            <mat-icon>download</mat-icon>
            Exporter
          </button>
          <button mat-raised-button color="primary" (click)="createOrder()">
            <mat-icon>add</mat-icon>
            Nouvelle commande
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-cards">
        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <mat-icon>shopping_cart</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ orderStats.total }}</div>
              <div class="stat-label">Total commandes</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon pending">
              <mat-icon>pending</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ orderStats.pending }}</div>
              <div class="stat-label">En attente</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon processing">
              <mat-icon>local_shipping</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ orderStats.processing }}</div>
              <div class="stat-label">En cours</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon delivered">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ orderStats.delivered }}</div>
              <div class="stat-label">Livrées</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon revenue">
              <mat-icon>account_balance_wallet</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatCurrency(orderStats.totalRevenue) }}</div>
              <div class="stat-label">Chiffre d'affaires</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon average">
              <mat-icon>trending_up</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatCurrency(orderStats.averageOrderValue) }}</div>
              <div class="stat-label">Panier moyen</div>
            </div>
          </div>
        </mat-card>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Rechercher</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="N° commande, client, email...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="status-field">
              <mat-label>Statut</mat-label>
              <mat-select [(ngModel)]="selectedStatus" (selectionChange)="applyFilters()">
                <mat-option value="">Tous les statuts</mat-option>
                <mat-option value="pending">En attente</mat-option>
                <mat-option value="confirmed">Confirmée</mat-option>
                <mat-option value="processing">En cours</mat-option>
                <mat-option value="shipped">Expédiée</mat-option>
                <mat-option value="delivered">Livrée</mat-option>
                <mat-option value="cancelled">Annulée</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="payment-field">
              <mat-label>Paiement</mat-label>
              <mat-select [(ngModel)]="selectedPaymentStatus" (selectionChange)="applyFilters()">
                <mat-option value="">Tous les paiements</mat-option>
                <mat-option value="pending">En attente</mat-option>
                <mat-option value="paid">Payé</mat-option>
                <mat-option value="failed">Échoué</mat-option>
                <mat-option value="refunded">Remboursé</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="date-field">
              <mat-label>Date de début</mat-label>
              <input matInput type="date" [(ngModel)]="startDate" (change)="applyFilters()">
            </mat-form-field>

            <mat-form-field appearance="outline" class="date-field">
              <mat-label>Date de fin</mat-label>
              <input matInput type="date" [(ngModel)]="endDate" (change)="applyFilters()">
            </mat-form-field>

            <button mat-button (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
              Effacer
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Orders Table -->
      <mat-card class="table-card">
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="filteredOrders" matSort class="orders-table">
              <!-- Checkbox Column -->
              <ng-container matColumnDef="select">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-checkbox (change)="$event ? masterToggle() : null"
                                [checked]="hasValue() && isAllSelected()"
                                [indeterminate]="hasValue() && !isAllSelected()">
                  </mat-checkbox>
                </th>
                <td mat-cell *matCellDef="let row">
                  <mat-checkbox (click)="$event.stopPropagation()"
                                (change)="$event ? toggle(row) : null"
                                [checked]="isSelected(row)">
                  </mat-checkbox>
                </td>
              </ng-container>

              <!-- Order Column -->
              <ng-container matColumnDef="order">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Commande</th>
                <td mat-cell *matCellDef="let order">
                  <div class="order-info">
                    <div class="order-number">#{{ order.orderNumber }}</div>
                    <div class="order-date">{{ order.createdAt | date:'short' }}</div>
                    <div class="order-items">{{ order.items.length }} article(s)</div>
                  </div>
                </td>
              </ng-container>

              <!-- Customer Column -->
              <ng-container matColumnDef="customer">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Client</th>
                <td mat-cell *matCellDef="let order">
                  <div class="customer-info">
                    <div class="customer-name">{{ order.customer.name }}</div>
                    <div class="customer-email">{{ order.customer.email }}</div>
                    <div class="customer-phone">{{ order.customer.phone }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Items Column -->
              <ng-container matColumnDef="items">
                <th mat-header-cell *matHeaderCellDef>Articles</th>
                <td mat-cell *matCellDef="let order">
                  <div class="order-items-preview">
                    <div *ngFor="let item of order.items.slice(0, 2)" class="item-preview">
                      <img *ngIf="item.product.image" [src]="item.product.image" [alt]="item.product.name" class="item-image">
                      <mat-icon *ngIf="!item.product.image" class="item-icon">image</mat-icon>
                      <div class="item-details">
                        <div class="item-name">{{ item.product.name }}</div>
                        <div class="item-quantity">x{{ item.quantity }}</div>
                      </div>
                    </div>
                    <div *ngIf="order.items.length > 2" class="more-items">
                      +{{ order.items.length - 2 }} autres
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
                <td mat-cell *matCellDef="let order">
                  <mat-chip [ngClass]="'status-' + order.status">
                    {{ getStatusLabel(order.status) }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Payment Column -->
              <ng-container matColumnDef="payment">
                <th mat-header-cell *matHeaderCellDef>Paiement</th>
                <td mat-cell *matCellDef="let order">
                  <div class="payment-info">
                    <mat-chip [ngClass]="'payment-' + order.paymentStatus">
                      {{ getPaymentStatusLabel(order.paymentStatus) }}
                    </mat-chip>
                    <div class="payment-method">{{ getPaymentMethodLabel(order.paymentMethod) }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Total Column -->
              <ng-container matColumnDef="total">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Total</th>
                <td mat-cell *matCellDef="let order">
                  <div class="total-info">
                    <div class="total-amount">{{ formatCurrency(order.total) }}</div>
                    <div *ngIf="order.discount > 0" class="discount">
                      -{{ formatCurrency(order.discount) }} de réduction
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Tracking Column -->
              <ng-container matColumnDef="tracking">
                <th mat-header-cell *matHeaderCellDef>Suivi</th>
                <td mat-cell *matCellDef="let order">
                  <div class="tracking-info">
                    <div *ngIf="order.trackingNumber" class="tracking-number">
                      {{ order.trackingNumber }}
                    </div>
                    <div *ngIf="order.estimatedDelivery" class="estimated-delivery">
                      Livraison: {{ order.estimatedDelivery | date:'short' }}
                    </div>
                    <div *ngIf="!order.trackingNumber && !order.estimatedDelivery" class="no-tracking">
                      Aucun suivi
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let order">
                  <button mat-icon-button [matMenuTriggerFor]="orderMenu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #orderMenu="matMenu">
                    <button mat-menu-item (click)="viewOrder(order)">
                      <mat-icon>visibility</mat-icon>
                      <span>Voir détails</span>
                    </button>
                    <button mat-menu-item (click)="editOrder(order)">
                      <mat-icon>edit</mat-icon>
                      <span>Modifier</span>
                    </button>
                    <button mat-menu-item (click)="updateStatus(order)">
                      <mat-icon>update</mat-icon>
                      <span>Changer statut</span>
                    </button>
                    <button mat-menu-item (click)="addTracking(order)">
                      <mat-icon>local_shipping</mat-icon>
                      <span>Ajouter suivi</span>
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item (click)="printInvoice(order)">
                      <mat-icon>print</mat-icon>
                      <span>Imprimer facture</span>
                    </button>
                    <button mat-menu-item (click)="sendEmail(order)">
                      <mat-icon>email</mat-icon>
                      <span>Envoyer email</span>
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item (click)="cancelOrder(order)" class="danger">
                      <mat-icon>cancel</mat-icon>
                      <span>Annuler</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                  (click)="viewOrder(row)" class="clickable-row"></tr>
            </table>

            <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]" 
                           showFirstLastButtons
                           [length]="totalOrders"
                           [pageSize]="pageSize"
                           (page)="onPageChange($event)">
            </mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./admin-orders-management.component.scss']
})
export class AdminOrdersManagementComponent implements OnInit {
  displayedColumns: string[] = ['select', 'order', 'customer', 'items', 'status', 'payment', 'total', 'tracking', 'actions'];
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  orderStats: OrderStats = {
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalItems: 0
  };

  // Filters
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedPaymentStatus: string = '';
  startDate: string = '';
  endDate: string = '';

  // Pagination
  pageSize: number = 25;
  totalOrders: number = 0;
  currentPage: number = 0;

  // Selection
  selection = new Set<Order>();

  loading = true;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  private loadOrders(): void {
    this.loading = true;
    
    setTimeout(() => {
      this.orders = this.generateMockOrders();
      this.filteredOrders = [...this.orders];
      this.calculateStats();
      this.loading = false;
    }, 1000);
  }

  private generateMockOrders(): Order[] {
    const orders: Order[] = [];
    const statuses: Order['status'][] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    const paymentStatuses: Order['paymentStatus'][] = ['pending', 'paid', 'failed', 'refunded'];
    const paymentMethods: Order['paymentMethod'][] = ['mobile_money', 'cash_on_delivery', 'bank_transfer', 'card'];
    const cities = ['Lomé', 'Kara', 'Sokodé', 'Kpalimé', 'Atakpamé'];
    
    for (let i = 1; i <= 100; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      
      const itemCount = Math.floor(Math.random() * 5) + 1;
      const items: OrderItem[] = [];
      
      for (let j = 1; j <= itemCount; j++) {
        items.push({
          id: `item-${i}-${j}`,
          product: {
            id: `product-${j}`,
            name: `Produit ${j}`,
            image: Math.random() > 0.3 ? `https://via.placeholder.com/40x40?text=P${j}` : undefined,
            sku: `SKU-${j}`
          },
          store: {
            id: `store-${j}`,
            name: `Boutique ${j}`
          },
          quantity: Math.floor(Math.random() * 3) + 1,
          unitPrice: Math.floor(Math.random() * 50000) + 5000,
          totalPrice: 0,
          variant: {
            size: ['S', 'M', 'L', 'XL'][Math.floor(Math.random() * 4)],
            color: ['Rouge', 'Bleu', 'Vert', 'Jaune'][Math.floor(Math.random() * 4)],
            fabric: ['Wax', 'Kente', 'Bogolan'][Math.floor(Math.random() * 3)]
          }
        });
        
        items[j-1].totalPrice = items[j-1].quantity * items[j-1].unitPrice;
      }
      
      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const shipping = Math.floor(Math.random() * 5000) + 2000;
      const tax = Math.floor(subtotal * 0.18);
      const discount = Math.random() > 0.7 ? Math.floor(subtotal * 0.1) : 0;
      const total = subtotal + shipping + tax - discount;
      
      orders.push({
        id: `order-${i}`,
        orderNumber: `CMD-${String(i).padStart(6, '0')}`,
        customer: {
          id: `customer-${i}`,
          name: `Client ${i}`,
          email: `client${i}@example.com`,
          phone: `+228${Math.floor(Math.random() * 90000000) + 10000000}`
        },
        items,
        status,
        paymentStatus,
        paymentMethod,
        subtotal,
        shipping,
        tax,
        discount,
        total,
        currency: 'XOF',
        shippingAddress: {
          street: `Rue ${i}`,
          city,
          region: 'Région',
          country: 'Togo',
          postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
          phone: `+228${Math.floor(Math.random() * 90000000) + 10000000}`
        },
        billingAddress: {
          street: `Rue ${i}`,
          city,
          region: 'Région',
          country: 'Togo',
          postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
          phone: `+228${Math.floor(Math.random() * 90000000) + 10000000}`
        },
        notes: Math.random() > 0.7 ? `Note pour la commande ${i}` : undefined,
        trackingNumber: status === 'shipped' || status === 'delivered' ? `TRK${String(i).padStart(8, '0')}` : undefined,
        estimatedDelivery: status === 'shipped' ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
        deliveredAt: status === 'delivered' ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      });
    }
    
    return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  private calculateStats(): void {
    this.orderStats = {
      total: this.orders.length,
      pending: this.orders.filter(o => o.status === 'pending').length,
      confirmed: this.orders.filter(o => o.status === 'confirmed').length,
      processing: this.orders.filter(o => o.status === 'processing').length,
      shipped: this.orders.filter(o => o.status === 'shipped').length,
      delivered: this.orders.filter(o => o.status === 'delivered').length,
      cancelled: this.orders.filter(o => o.status === 'cancelled').length,
      totalRevenue: this.orders.reduce((sum, o) => sum + o.total, 0),
      averageOrderValue: this.orders.length > 0 ? this.orders.reduce((sum, o) => sum + o.total, 0) / this.orders.length : 0,
      totalItems: this.orders.reduce((sum, o) => sum + o.items.length, 0)
    };
  }

  applyFilters(): void {
    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch = !this.searchTerm || 
        order.orderNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || order.status === this.selectedStatus;
      const matchesPaymentStatus = !this.selectedPaymentStatus || order.paymentStatus === this.selectedPaymentStatus;
      
      const matchesDateRange = (!this.startDate || new Date(order.createdAt) >= new Date(this.startDate)) &&
                              (!this.endDate || new Date(order.createdAt) <= new Date(this.endDate));
      
      return matchesSearch && matchesStatus && matchesPaymentStatus && matchesDateRange;
    });
    
    this.totalOrders = this.filteredOrders.length;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedPaymentStatus = '';
    this.startDate = '';
    this.endDate = '';
    this.applyFilters();
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.filteredOrders.forEach(order => this.selection.add(order));
    }
  }

  isAllSelected(): boolean {
    return this.selection.size === this.filteredOrders.length;
  }

  hasValue(): boolean {
    return this.selection.size > 0;
  }

  toggle(order: Order): void {
    if (this.selection.has(order)) {
      this.selection.delete(order);
    } else {
      this.selection.add(order);
    }
  }

  isSelected(order: Order): boolean {
    return this.selection.has(order);
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'En attente',
      'confirmed': 'Confirmée',
      'processing': 'En cours',
      'shipped': 'Expédiée',
      'delivered': 'Livrée',
      'cancelled': 'Annulée',
      'returned': 'Retournée'
    };
    return labels[status] || status;
  }

  getPaymentStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'En attente',
      'paid': 'Payé',
      'failed': 'Échoué',
      'refunded': 'Remboursé',
      'partially_refunded': 'Partiellement remboursé'
    };
    return labels[status] || status;
  }

  getPaymentMethodLabel(method: string): string {
    const labels: { [key: string]: string } = {
      'mobile_money': 'Mobile Money',
      'cash_on_delivery': 'Paiement à la livraison',
      'bank_transfer': 'Virement bancaire',
      'card': 'Carte bancaire'
    };
    return labels[method] || method;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(value);
  }

  exportOrders(): void {
    console.log('Exporter commandes');
  }

  createOrder(): void {
    console.log('Créer nouvelle commande');
  }

  viewOrder(order: Order): void {
    console.log('Voir commande:', order);
  }

  editOrder(order: Order): void {
    console.log('Modifier commande:', order);
  }

  updateStatus(order: Order): void {
    console.log('Changer statut commande:', order);
  }

  addTracking(order: Order): void {
    console.log('Ajouter suivi commande:', order);
  }

  printInvoice(order: Order): void {
    console.log('Imprimer facture commande:', order);
  }

  sendEmail(order: Order): void {
    console.log('Envoyer email commande:', order);
  }

  cancelOrder(order: Order): void {
    console.log('Annuler commande:', order);
  }
}














