import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { VendorService } from '../../../../core/services/vendor.service';
import { StockAdjustmentDialogComponent } from './stock-adjustment-dialog.component';
import { ReorderDialogComponent } from './reorder-dialog.component';
import { StockTakeDialogComponent } from './stock-take-dialog.component';
import { SupplierDialogComponent } from './supplier-dialog.component';

interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  timestamp: Date;
  user: string;
  reference?: string;
}

interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  status: 'critical' | 'low' | 'high' | 'out_of_stock';
  daysUntilOut: number;
  suggestedOrder: number;
}

interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  leadTime: number;
  paymentTerms: string;
  status: 'active' | 'inactive';
}

interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  totalAmount: number;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  orderDate: Date;
  expectedDelivery: Date;
  actualDelivery?: Date;
}

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reservedStock: number;
  availableStock: number;
  unitCost: number;
  totalValue: number;
  lastMovement: Date;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock';
}

@Component({
  selector: 'app-vendor-inventory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatBadgeModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatTableModule,
    MatPaginatorModule
  ],
  template: `
    <div class="vendor-inventory">
      <!-- Header -->
      <div class="inventory-header">
        <div class="header-content">
          <h1>
            <mat-icon>warehouse</mat-icon>
            Gestion Stock Avancée
          </h1>
          <p>Gérez votre inventaire, mouvements et fournisseurs</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="createPurchaseOrder()">
            <mat-icon>add_shopping_cart</mat-icon>
            Nouvelle Commande
          </button>
          <button mat-raised-button (click)="performStockTake()">
            <mat-icon>inventory_2</mat-icon>
            Inventaire
          </button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="inventory-kpis">
        <mat-card class="kpi-card">
          <mat-card-content>
            <div class="kpi-header">
              <mat-icon class="kpi-icon">inventory</mat-icon>
              <div class="kpi-info">
                <h3>Stock Total</h3>
                <p>{{ totalStock }} unités</p>
              </div>
            </div>
            <div class="kpi-value">
              <span class="value">{{ totalValue | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card">
          <mat-card-content>
            <div class="kpi-header">
              <mat-icon class="kpi-icon">warning</mat-icon>
              <div class="kpi-info">
                <h3>Alertes Stock</h3>
                <p>{{ stockAlerts.length }} produits</p>
              </div>
            </div>
            <div class="kpi-value">
              <span class="value critical">{{ criticalAlerts }}</span>
              <span class="subtitle">Critiques</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card">
          <mat-card-content>
            <div class="kpi-header">
              <mat-icon class="kpi-icon">trending_up</mat-icon>
              <div class="kpi-info">
                <h3>Mouvements</h3>
                <p>Ce mois</p>
              </div>
            </div>
            <div class="kpi-value">
              <span class="value">{{ monthlyMovements }}</span>
              <span class="subtitle">Mouvements</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card">
          <mat-card-content>
            <div class="kpi-header">
              <mat-icon class="kpi-icon">local_shipping</mat-icon>
              <div class="kpi-info">
                <h3>Commandes Fournisseurs</h3>
                <p>En cours</p>
              </div>
            </div>
            <div class="kpi-value">
              <span class="value">{{ pendingOrders }}</span>
              <span class="subtitle">En attente</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Contenu principal -->
      <div class="inventory-content">
        <mat-tab-group>
          <!-- Onglet Inventaire -->
          <mat-tab label="Inventaire">
            <div class="tab-content">
              <!-- Filtres -->
              <div class="inventory-filters">
                <mat-card class="filters-card">
                  <mat-card-content>
                    <div class="filters-container">
                      <div class="search-section">
                        <mat-form-field appearance="outline" class="search-field">
                          <mat-label>Rechercher un produit</mat-label>
                          <input matInput [(ngModel)]="searchQuery" (input)="filterInventory()" placeholder="Nom, SKU, description...">
                          <mat-icon matSuffix>search</mat-icon>
                        </mat-form-field>
                      </div>
                      
                      <div class="filters-section">
                        <div class="filter-group">
                          <mat-form-field appearance="outline" class="filter-field">
                            <mat-label>Statut</mat-label>
                            <mat-select [(ngModel)]="selectedStatus" (selectionChange)="filterInventory()">
                              <mat-option value="all">Tous les statuts</mat-option>
                              <mat-option value="in_stock">En stock</mat-option>
                              <mat-option value="low_stock">Stock faible</mat-option>
                              <mat-option value="out_of_stock">Rupture</mat-option>
                              <mat-option value="overstock">Surstock</mat-option>
                            </mat-select>
                          </mat-form-field>
                        </div>

                        <div class="filter-actions">
                          <button mat-button (click)="clearFilters()" class="clear-filters-btn">
                            <mat-icon>clear</mat-icon>
                            Effacer
                          </button>
                          <button mat-raised-button (click)="exportInventory()" class="export-btn">
                            <mat-icon>download</mat-icon>
                            Exporter
                          </button>
                        </div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>

              <!-- Liste des produits -->
              <div class="inventory-list">
                @for (item of filteredInventory; track item.id) {
                  <mat-card class="inventory-item" [class.low-stock]="item.status === 'low_stock'" [class.out-of-stock]="item.status === 'out_of_stock'">
                    <mat-card-content>
                      <div class="item-header">
                        <div class="product-info">
                          <div class="product-image">
                            <img [src]="item.productImage" [alt]="item.productName">
                          </div>
                          <div class="product-details">
                            <h4>{{ item.productName }}</h4>
                            <p>SKU: {{ item.sku }}</p>
                            <div class="product-status">
                              <mat-chip [ngClass]="'status-' + item.status">
                                {{ getStatusLabel(item.status) }}
                              </mat-chip>
                            </div>
                          </div>
                        </div>
                        
                        <div class="stock-info">
                          <div class="stock-levels">
                            <div class="stock-item">
                              <span class="label">Stock actuel:</span>
                              <span class="value">{{ item.currentStock }}</span>
                            </div>
                            <div class="stock-item">
                              <span class="label">Réservé:</span>
                              <span class="value">{{ item.reservedStock }}</span>
                            </div>
                            <div class="stock-item">
                              <span class="label">Disponible:</span>
                              <span class="value">{{ item.availableStock }}</span>
                            </div>
                          </div>
                          
                          <div class="stock-range">
                            <div class="range-info">
                              <span>Min: {{ item.minStock }}</span>
                              <span>Max: {{ item.maxStock }}</span>
                            </div>
                            <mat-progress-bar 
                              mode="determinate" 
                              [value]="getStockPercentage(item)"
                              [color]="getStockColor(item)">
                            </mat-progress-bar>
                          </div>
                        </div>

                        <div class="item-actions">
                          <button mat-raised-button (click)="adjustStock(item)">
                            <mat-icon>edit</mat-icon>
                            Ajuster
                          </button>
                          <button mat-raised-button (click)="reorderProduct(item)">
                            <mat-icon>add_shopping_cart</mat-icon>
                            Réapprovisionner
                          </button>
                          <button mat-icon-button [matMenuTriggerFor]="itemMenu">
                            <mat-icon>more_vert</mat-icon>
                          </button>
                          
                          <mat-menu #itemMenu="matMenu">
                            <button mat-menu-item (click)="viewMovements(item)">
                              <mat-icon>history</mat-icon>
                              Historique
                            </button>
                            <button mat-menu-item (click)="editProduct(item)">
                              <mat-icon>edit</mat-icon>
                              Modifier
                            </button>
                            <button mat-menu-item (click)="deleteProduct(item)">
                              <mat-icon>delete</mat-icon>
                              Supprimer
                            </button>
                          </mat-menu>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            </div>
          </mat-tab>

          <!-- Onglet Mouvements -->
          <mat-tab label="Mouvements">
            <div class="tab-content">
              <!-- Filtres mouvements -->
              <div class="movements-filters">
                <mat-form-field appearance="outline">
                  <mat-label>Type de mouvement</mat-label>
                  <mat-select [(ngModel)]="selectedMovementType" (selectionChange)="filterMovements()">
                    <mat-option value="all">Tous les types</mat-option>
                    <mat-option value="in">Entrées</mat-option>
                    <mat-option value="out">Sorties</mat-option>
                    <mat-option value="adjustment">Ajustements</mat-option>
                    <mat-option value="transfer">Transferts</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Période</mat-label>
                  <mat-select [(ngModel)]="selectedPeriod" (selectionChange)="filterMovements()">
                    <mat-option value="today">Aujourd'hui</mat-option>
                    <mat-option value="week">Cette semaine</mat-option>
                    <mat-option value="month">Ce mois</mat-option>
                    <mat-option value="quarter">Ce trimestre</mat-option>
                  </mat-select>
                </mat-form-field>

                <button mat-raised-button (click)="exportMovements()">
                  <mat-icon>download</mat-icon>
                  Exporter
                </button>
              </div>

              <!-- Liste des mouvements -->
              <div class="movements-list">
                @for (movement of filteredMovements; track movement.id) {
                  <mat-card class="movement-item">
                    <mat-card-content>
                      <div class="movement-header">
                        <div class="movement-info">
                          <div class="movement-icon" [ngClass]="'type-' + movement.type">
                            <mat-icon>{{ getMovementIcon(movement.type) }}</mat-icon>
                          </div>
                          <div class="movement-details">
                            <h4>{{ movement.productName }}</h4>
                            <p>{{ movement.reason }}</p>
                            <small>{{ formatDate(movement.timestamp) }} par {{ movement.user }}</small>
                          </div>
                        </div>
                        
                        <div class="movement-quantity">
                          <div class="quantity-change" [ngClass]="'change-' + movement.type">
                            <span class="operator">{{ getQuantityOperator(movement.type) }}</span>
                            <span class="quantity">{{ movement.quantity }}</span>
                          </div>
                          <div class="stock-before-after">
                            <span>{{ movement.previousStock }} → {{ movement.newStock }}</span>
                          </div>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            </div>
          </mat-tab>

          <!-- Onglet Alertes -->
          <mat-tab label="Alertes">
            <div class="tab-content">
              <div class="alerts-list">
                @for (alert of stockAlerts; track alert.id) {
                  <mat-card class="alert-item" [class.critical]="alert.status === 'critical'" [class.low]="alert.status === 'low'">
                    <mat-card-content>
                      <div class="alert-header">
                        <div class="alert-icon" [ngClass]="'status-' + alert.status">
                          <mat-icon>{{ getAlertIcon(alert.status) }}</mat-icon>
                        </div>
                        <div class="alert-info">
                          <h4>{{ alert.productName }}</h4>
                          <p>{{ getAlertMessage(alert) }}</p>
                        </div>
                        <div class="alert-actions">
                          <button mat-raised-button color="primary" (click)="reorderProduct(alert)">
                            <mat-icon>add_shopping_cart</mat-icon>
                            Commander {{ alert.suggestedOrder }}
                          </button>
                          <button mat-icon-button (click)="dismissAlert(alert)">
                            <mat-icon>close</mat-icon>
                          </button>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            </div>
          </mat-tab>

          <!-- Onglet Fournisseurs -->
          <mat-tab label="Fournisseurs">
            <div class="tab-content">
              <div class="suppliers-header">
                <button mat-raised-button color="primary" (click)="addSupplier()">
                  <mat-icon>add</mat-icon>
                  Nouveau Fournisseur
                </button>
              </div>

              <div class="suppliers-list">
                @for (supplier of suppliers; track supplier.id) {
                  <mat-card class="supplier-item">
                    <mat-card-content>
                      <div class="supplier-header">
                        <div class="supplier-info">
                          <h4>{{ supplier.name }}</h4>
                          <p>{{ supplier.contact }}</p>
                          <div class="supplier-details">
                            <span><mat-icon>email</mat-icon> {{ supplier.email }}</span>
                            <span><mat-icon>phone</mat-icon> {{ supplier.phone }}</span>
                            <span><mat-icon>schedule</mat-icon> {{ supplier.leadTime }} jours</span>
                          </div>
                        </div>
                        
                        <div class="supplier-rating">
                          <div class="rating-stars">
                            @for (star of [1,2,3,4,5]; track star) {
                              <mat-icon [class.filled]="star <= supplier.rating">
                                {{ star <= supplier.rating ? 'star' : 'star_border' }}
                              </mat-icon>
                            }
                          </div>
                          <span class="rating-value">{{ supplier.rating }}/5</span>
                        </div>

                        <div class="supplier-actions">
                          <button mat-raised-button (click)="createPurchaseOrder(supplier)">
                            <mat-icon>add_shopping_cart</mat-icon>
                            Commander
                          </button>
                          <button mat-icon-button [matMenuTriggerFor]="supplierMenu">
                            <mat-icon>more_vert</mat-icon>
                          </button>
                          
                          <mat-menu #supplierMenu="matMenu">
                            <button mat-menu-item (click)="editSupplier(supplier)">
                              <mat-icon>edit</mat-icon>
                              Modifier
                            </button>
                            <button mat-menu-item (click)="viewSupplierHistory(supplier)">
                              <mat-icon>history</mat-icon>
                              Historique
                            </button>
                            <button mat-menu-item (click)="deleteSupplier(supplier)">
                              <mat-icon>delete</mat-icon>
                              Supprimer
                            </button>
                          </mat-menu>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            </div>
          </mat-tab>

          <!-- Onglet Commandes -->
          <mat-tab label="Commandes Fournisseurs">
            <div class="tab-content">
              <div class="orders-header">
                <button mat-raised-button color="primary" (click)="createPurchaseOrder()">
                  <mat-icon>add</mat-icon>
                  Nouvelle Commande
                </button>
              </div>

              <div class="orders-list">
                @for (order of purchaseOrders; track order.id) {
                  <mat-card class="order-item" [class.pending]="order.status === 'sent'" [class.received]="order.status === 'received'">
                    <mat-card-content>
                      <div class="order-header">
                        <div class="order-info">
                          <h4>Commande #{{ order.id }}</h4>
                          <p>{{ order.supplierName }}</p>
                          <div class="order-details">
                            <span>Date: {{ formatDate(order.orderDate) }}</span>
                            <span>Livraison prévue: {{ formatDate(order.expectedDelivery) }}</span>
                            <span>Total: {{ order.totalAmount | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
                          </div>
                        </div>
                        
                        <div class="order-status">
                          <mat-chip [ngClass]="'status-' + order.status">
                            {{ getOrderStatusLabel(order.status) }}
                          </mat-chip>
                        </div>

                        <div class="order-actions">
                          <button mat-raised-button (click)="viewOrderDetails(order)">
                            <mat-icon>visibility</mat-icon>
                            Détails
                          </button>
                          <button mat-icon-button [matMenuTriggerFor]="orderMenu">
                            <mat-icon>more_vert</mat-icon>
                          </button>
                          
                          <mat-menu #orderMenu="matMenu">
                            <button mat-menu-item (click)="editOrder(order)">
                              <mat-icon>edit</mat-icon>
                              Modifier
                            </button>
                            <button mat-menu-item (click)="receiveOrder(order)">
                              <mat-icon>check</mat-icon>
                              Réceptionner
                            </button>
                            <button mat-menu-item (click)="cancelOrder(order)">
                              <mat-icon>cancel</mat-icon>
                              Annuler
                            </button>
                          </mat-menu>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .vendor-inventory {
      background: #f8fafc;
      min-height: 100vh;
    }

    .inventory-header {
      background: linear-gradient(135deg, #8B2E2E 0%, #6B1F1F 100%);
      color: white;
      padding: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-content h1 {
      font-size: 2rem;
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-content h1 mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .header-content p {
      margin: 0;
      opacity: 0.9;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .inventory-kpis {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      padding: 2rem;
    }

    .kpi-card {
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .kpi-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .kpi-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .kpi-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #8B2E2E, #D9744F);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
    }

    .kpi-info h3 {
      font-size: 1.1rem;
      margin: 0 0 0.25rem 0;
      color: #1f2937;
    }

    .kpi-info p {
      margin: 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .kpi-value {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .value {
      font-size: 1.8rem;
      font-weight: 700;
      color: #1f2937;
    }

    .value.critical {
      color: #dc2626;
    }

    .subtitle {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .inventory-content {
      padding: 0 2rem 2rem 2rem;
    }

    .tab-content {
      padding: 1.5rem 0;
    }

    .inventory-filters,
    .movements-filters {
      margin-bottom: 2rem;
    }

    .filters-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .filters-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .search-section {
      display: flex;
      justify-content: center;
    }

    .search-field {
      width: 100%;
      max-width: 500px;
    }

    .filters-section {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
      justify-content: center;
    }

    .filter-group {
      display: flex;
      align-items: center;
    }

    .filter-field {
      min-width: 150px;
      width: 180px;
    }

    .filter-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-left: auto;
    }

    .clear-filters-btn {
      color: #6b7280;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .clear-filters-btn:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }

    .export-btn {
      background-color: #8B2E2E;
      color: white;
    }

    .export-btn:hover {
      background-color: #D9744F;
    }

    .inventory-list,
    .movements-list,
    .alerts-list,
    .suppliers-list,
    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .inventory-item,
    .movement-item,
    .alert-item,
    .supplier-item,
    .order-item {
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .inventory-item:hover,
    .movement-item:hover,
    .alert-item:hover,
    .supplier-item:hover,
    .order-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .inventory-item.low-stock {
      border-left: 4px solid #ff9800;
    }

    .inventory-item.out-of-stock {
      border-left: 4px solid #f44336;
    }

    .alert-item.critical {
      border-left: 4px solid #f44336;
    }

    .alert-item.low {
      border-left: 4px solid #ff9800;
    }

    .order-item.pending {
      border-left: 4px solid #2196f3;
    }

    .order-item.received {
      border-left: 4px solid #4caf50;
    }

    .item-header,
    .movement-header,
    .alert-header,
    .supplier-header,
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .product-info,
    .movement-info,
    .alert-info,
    .supplier-info,
    .order-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
    }

    .product-image {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      background: #e5e7eb;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-details h4,
    .movement-details h4,
    .alert-info h4,
    .supplier-info h4,
    .order-info h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1.1rem;
      color: #1f2937;
    }

    .product-details p,
    .movement-details p,
    .alert-info p,
    .supplier-info p,
    .order-info p {
      margin: 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .product-status mat-chip,
    .order-status mat-chip {
      font-size: 0.75rem;
      height: 24px;
    }

    .status-in_stock {
      background: #d1fae5;
      color: #065f46;
    }

    .status-low_stock {
      background: #fef3c7;
      color: #92400e;
    }

    .status-out_of_stock {
      background: #fee2e2;
      color: #991b1b;
    }

    .status-overstock {
      background: #e0e7ff;
      color: #3730a3;
    }

    .status-draft {
      background: #f3f4f6;
      color: #374151;
    }

    .status-sent {
      background: #dbeafe;
      color: #1e40af;
    }

    .status-confirmed {
      background: #d1fae5;
      color: #065f46;
    }

    .status-received {
      background: #d1fae5;
      color: #065f46;
    }

    .status-cancelled {
      background: #fee2e2;
      color: #991b1b;
    }

    .stock-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-width: 200px;
    }

    .stock-levels {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .stock-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stock-item .label {
      color: #6b7280;
      font-size: 0.9rem;
    }

    .stock-item .value {
      font-weight: 600;
      color: #1f2937;
    }

    .stock-range {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .range-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: #6b7280;
    }

    .item-actions,
    .alert-actions,
    .supplier-actions,
    .order-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .movement-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
    }

    .type-in {
      background: #4caf50;
    }

    .type-out {
      background: #f44336;
    }

    .type-adjustment {
      background: #ff9800;
    }

    .type-transfer {
      background: #2196f3;
    }

    .movement-quantity {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .quantity-change {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .change-in {
      color: #4caf50;
    }

    .change-out {
      color: #f44336;
    }

    .change-adjustment {
      color: #ff9800;
    }

    .change-transfer {
      color: #2196f3;
    }

    .operator {
      font-size: 1.2rem;
    }

    .stock-before-after {
      font-size: 0.9rem;
      color: #6b7280;
    }

    .alert-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
    }

    .status-critical {
      background: #f44336;
    }

    .status-low {
      background: #ff9800;
    }

    .status-high {
      background: #4caf50;
    }

    .status-out_of_stock {
      background: #9e9e9e;
    }

    .supplier-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-top: 0.5rem;
    }

    .supplier-details span {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #6b7280;
    }

    .supplier-rating {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .rating-stars {
      display: flex;
      gap: 0.25rem;
    }

    .rating-stars mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .rating-stars mat-icon.filled {
      color: #ffc107;
    }

    .rating-stars mat-icon:not(.filled) {
      color: #d1d5db;
    }

    .rating-value {
      font-size: 0.9rem;
      color: #6b7280;
    }

    .order-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-top: 0.5rem;
    }

    .order-details span {
      font-size: 0.85rem;
      color: #6b7280;
    }

    .suppliers-header,
    .orders-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 2rem;
    }

    @media (max-width: 768px) {
      .inventory-kpis {
        grid-template-columns: 1fr;
      }

      .filters-container {
        gap: 1rem;
      }

      .filters-section {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .filter-field {
        width: 100%;
        min-width: auto;
      }

      .filter-actions {
        margin-left: 0;
        justify-content: center;
      }

      .search-field {
        max-width: none;
      }

      .item-header,
      .movement-header,
      .alert-header,
      .supplier-header,
      .order-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .item-actions,
      .alert-actions,
      .supplier-actions,
      .order-actions {
        justify-content: center;
      }
    }
  `]
})
export class VendorInventoryComponent implements OnInit {
  searchQuery: string = '';
  selectedStatus: string = 'all';
  selectedMovementType: string = 'all';
  selectedPeriod: string = 'month';

  inventory: InventoryItem[] = [
    {
      id: '1',
      productId: 'PROD-001',
      productName: 'Robe Ankara Élégante',
      productImage: '/assets/images/products/robe-1.jpg',
      sku: 'ROBE-001',
      currentStock: 15,
      minStock: 10,
      maxStock: 50,
      reservedStock: 3,
      availableStock: 12,
      unitCost: 15000,
      totalValue: 225000,
      lastMovement: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: 'in_stock'
    },
    {
      id: '2',
      productId: 'PROD-002',
      productName: 'Chemise Wax Premium',
      productImage: '/assets/images/products/chemise-1.jpg',
      sku: 'CHEM-001',
      currentStock: 5,
      minStock: 8,
      maxStock: 30,
      reservedStock: 2,
      availableStock: 3,
      unitCost: 12000,
      totalValue: 60000,
      lastMovement: new Date(Date.now() - 1000 * 60 * 60 * 4),
      status: 'low_stock'
    },
    {
      id: '3',
      productId: 'PROD-003',
      productName: 'Ensemble Kente Royal',
      productImage: '/assets/images/products/ensemble-1.jpg',
      sku: 'ENS-001',
      currentStock: 0,
      minStock: 5,
      maxStock: 20,
      reservedStock: 0,
      availableStock: 0,
      unitCost: 25000,
      totalValue: 0,
      lastMovement: new Date(Date.now() - 1000 * 60 * 60 * 24),
      status: 'out_of_stock'
    }
  ];

  filteredInventory: InventoryItem[] = [];

  stockMovements: StockMovement[] = [
    {
      id: '1',
      productId: 'PROD-001',
      productName: 'Robe Ankara Élégante',
      productImage: '/assets/images/products/robe-1.jpg',
      type: 'in',
      quantity: 20,
      previousStock: 10,
      newStock: 30,
      reason: 'Réception commande fournisseur',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      user: 'Admin',
      reference: 'PO-2025-001'
    },
    {
      id: '2',
      productId: 'PROD-001',
      productName: 'Robe Ankara Élégante',
      productImage: '/assets/images/products/robe-1.jpg',
      type: 'out',
      quantity: 15,
      previousStock: 30,
      newStock: 15,
      reason: 'Vente commande #CMD-001',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      user: 'Système',
      reference: 'CMD-001'
    }
  ];

  filteredMovements: StockMovement[] = [];

  stockAlerts: StockAlert[] = [
    {
      id: '1',
      productId: 'PROD-002',
      productName: 'Chemise Wax Premium',
      productImage: '/assets/images/products/chemise-1.jpg',
      currentStock: 5,
      minStock: 8,
      maxStock: 30,
      status: 'low',
      daysUntilOut: 7,
      suggestedOrder: 25
    },
    {
      id: '2',
      productId: 'PROD-003',
      productName: 'Ensemble Kente Royal',
      productImage: '/assets/images/products/ensemble-1.jpg',
      currentStock: 0,
      minStock: 5,
      maxStock: 20,
      status: 'out_of_stock',
      daysUntilOut: 0,
      suggestedOrder: 15
    }
  ];

  suppliers: Supplier[] = [
    {
      id: '1',
      name: 'Textiles Africains SARL',
      contact: 'M. Koffi Mensah',
      email: 'contact@textiles-africains.tg',
      phone: '+228 90 12 34 56',
      address: 'Lomé, Togo',
      rating: 4.5,
      leadTime: 7,
      paymentTerms: '30 jours',
      status: 'active'
    },
    {
      id: '2',
      name: 'Wax & Co',
      contact: 'Mme Fatou Diallo',
      email: 'fatou@wax-co.com',
      phone: '+228 91 23 45 67',
      address: 'Kara, Togo',
      rating: 4.2,
      leadTime: 10,
      paymentTerms: '15 jours',
      status: 'active'
    }
  ];

  purchaseOrders: PurchaseOrder[] = [
    {
      id: 'PO-2025-001',
      supplierId: '1',
      supplierName: 'Textiles Africains SARL',
      status: 'sent',
      totalAmount: 450000,
      items: [
        {
          productId: 'PROD-001',
          productName: 'Robe Ankara Élégante',
          quantity: 20,
          unitPrice: 15000,
          totalPrice: 300000
        },
        {
          productId: 'PROD-002',
          productName: 'Chemise Wax Premium',
          quantity: 15,
          unitPrice: 12000,
          totalPrice: 180000
        }
      ],
      orderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      expectedDelivery: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4)
    }
  ];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private vendorService: VendorService
  ) {}

  ngOnInit(): void {
    this.loadInventory();
    this.filteredMovements = this.stockMovements;
  }

  loadInventory(): void {
    this.vendorService.getInventory().subscribe({
      next: (data: any) => {
        if (data.inventory) {
          this.inventory = data.inventory;
          this.filteredInventory = this.inventory;
        }
        if (data.movements) {
          this.stockMovements = data.movements;
        }
        if (data.alerts) {
          this.stockAlerts = data.alerts;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'inventaire:', error);
        this.filteredInventory = this.inventory;
      }
    });
  }

  get totalStock(): number {
    return this.inventory.reduce((sum, item) => sum + item.currentStock, 0);
  }

  get totalValue(): number {
    return this.inventory.reduce((sum, item) => sum + item.totalValue, 0);
  }

  get criticalAlerts(): number {
    return this.stockAlerts.filter(alert => alert.status === 'critical' || alert.status === 'out_of_stock').length;
  }

  get monthlyMovements(): number {
    return this.stockMovements.length;
  }

  get pendingOrders(): number {
    return this.purchaseOrders.filter(order => order.status === 'sent' || order.status === 'confirmed').length;
  }

  filterInventory(): void {
    this.filteredInventory = this.inventory.filter(item => {
      const matchesSearch = item.productName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           item.sku.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = this.selectedStatus === 'all' || item.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = 'all';
    this.filterInventory();
    this.snackBar.open('Filtres effacés', 'Fermer', { duration: 2000 });
  }

  filterMovements(): void {
    this.filteredMovements = this.stockMovements.filter(movement => {
      const matchesType = this.selectedMovementType === 'all' || movement.type === this.selectedMovementType;
      return matchesType;
    });
  }

  getStockPercentage(item: InventoryItem): number {
    const range = item.maxStock - item.minStock;
    const current = item.currentStock - item.minStock;
    return Math.max(0, Math.min(100, (current / range) * 100));
  }

  getStockColor(item: InventoryItem): string {
    if (item.status === 'out_of_stock') return 'warn';
    if (item.status === 'low_stock') return 'accent';
    return 'primary';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'in_stock': 'En stock',
      'low_stock': 'Stock faible',
      'out_of_stock': 'Rupture',
      'overstock': 'Surstock'
    };
    return labels[status] || status;
  }

  getMovementIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'in': 'add',
      'out': 'remove',
      'adjustment': 'edit',
      'transfer': 'swap_horiz'
    };
    return icons[type] || 'help';
  }

  getQuantityOperator(type: string): string {
    const operators: { [key: string]: string } = {
      'in': '+',
      'out': '-',
      'adjustment': '±',
      'transfer': '↔'
    };
    return operators[type] || '';
  }

  getAlertIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'critical': 'warning',
      'low': 'info',
      'high': 'trending_up',
      'out_of_stock': 'remove_shopping_cart'
    };
    return icons[status] || 'help';
  }

  getAlertMessage(alert: StockAlert): string {
    switch (alert.status) {
      case 'critical':
        return `Stock critique ! Plus que ${alert.currentStock} unités en stock.`;
      case 'low':
        return `Stock faible. Seulement ${alert.currentStock} unités restantes.`;
      case 'out_of_stock':
        return 'Rupture de stock ! Réapprovisionnement urgent nécessaire.';
      default:
        return 'Alerte de stock';
    }
  }

  getOrderStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'draft': 'Brouillon',
      'sent': 'Envoyée',
      'confirmed': 'Confirmée',
      'received': 'Réceptionnée',
      'cancelled': 'Annulée'
    };
    return labels[status] || status;
  }

  formatDate(timestamp: Date): string {
    return timestamp.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  adjustStock(item: InventoryItem): void {
    const dialogRef = this.dialog.open(StockAdjustmentDialogComponent, {
      width: '500px',
      data: { item }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const movement: StockMovement = {
          id: Date.now().toString(),
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          type: 'adjustment',
          quantity: result.quantity,
          previousStock: item.currentStock,
          newStock: item.currentStock + result.quantity,
          reason: result.reason,
          timestamp: new Date(),
          user: 'Vendeur',
          reference: result.reference
        };

        item.currentStock += result.quantity;
        item.availableStock = item.currentStock - item.reservedStock;
        item.totalValue = item.currentStock * item.unitCost;
        item.lastMovement = new Date();

        this.stockMovements.unshift(movement);
        this.updateStockStatus(item);
        this.snackBar.open('Stock ajusté avec succès', 'Fermer', { duration: 3000 });
      }
    });
  }

  reorderProduct(item: InventoryItem | StockAlert): void {
    const dialogRef = this.dialog.open(ReorderDialogComponent, {
      width: '600px',
      data: { item }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const order: PurchaseOrder = {
          id: 'PO-' + Date.now(),
          supplierId: result.supplierId,
          supplierName: result.supplierName,
          status: 'draft',
          totalAmount: result.quantity * result.unitPrice,
          items: [{
            productId: item.productId,
            productName: item.productName,
            quantity: result.quantity,
            unitPrice: result.unitPrice,
            totalPrice: result.quantity * result.unitPrice
          }],
          orderDate: new Date(),
          expectedDelivery: result.expectedDelivery
        };

        this.purchaseOrders.unshift(order);
        this.snackBar.open('Commande de réapprovisionnement créée', 'Fermer', { duration: 3000 });
      }
    });
  }

  viewMovements(item: InventoryItem): void {
    console.log('📊 Voir l\'historique:', item.productName);
    this.snackBar.open(`Historique des mouvements pour ${item.productName} - Fonctionnalité en développement`, 'Fermer', { duration: 3000 });
  }

  editProduct(item: InventoryItem): void {
    console.log('✏️ Modifier le produit:', item.productName);
    this.snackBar.open(`Modification de ${item.productName} - Fonctionnalité en développement`, 'Fermer', { duration: 3000 });
  }

  deleteProduct(item: InventoryItem): void {
    console.log('🗑️ Supprimer le produit:', item.productName);
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${item.productName}" de l'inventaire ?`)) {
      const index = this.inventory.indexOf(item);
      if (index > -1) {
        this.inventory.splice(index, 1);
        this.filterInventory();
        this.snackBar.open('Produit supprimé de l\'inventaire', 'Fermer', { duration: 3000 });
      }
    }
  }

  dismissAlert(alert: StockAlert): void {
    const index = this.stockAlerts.indexOf(alert);
    if (index > -1) {
      this.stockAlerts.splice(index, 1);
    }
  }

  addSupplier(): void {
    console.log('➕ Ajouter un fournisseur');
    
    const dialogRef = this.dialog.open(SupplierDialogComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newSupplier: Supplier = {
          id: Date.now().toString(),
          name: result.name,
          contact: result.contact,
          email: result.email,
          phone: result.phone,
          address: result.address,
          rating: 0,
          leadTime: result.leadTime,
          paymentTerms: result.paymentTerms,
          status: 'active'
        };

        this.suppliers.unshift(newSupplier);
        this.snackBar.open('Fournisseur ajouté avec succès', 'Fermer', { duration: 3000 });
      }
    });
  }

  createPurchaseOrder(supplier?: Supplier): void {
    console.log('📦 Créer une commande fournisseur', supplier?.name);
    
    // Si un fournisseur spécifique est sélectionné, créer directement une commande
    if (supplier) {
      this.snackBar.open(`Création d'une commande pour ${supplier.name}`, 'Fermer', { duration: 2000 });
      // TODO: Ouvrir un dialog de création de commande avec le fournisseur pré-sélectionné
    } else {
      // Afficher la liste des fournisseurs pour sélection
      this.snackBar.open('Sélectionnez un fournisseur dans l\'onglet Fournisseurs', 'Fermer', { duration: 3000 });
    }
  }

  editSupplier(supplier: Supplier): void {
    console.log('✏️ Modifier le fournisseur:', supplier.name);
    
    const dialogRef = this.dialog.open(SupplierDialogComponent, {
      width: '600px',
      data: { supplier }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        Object.assign(supplier, result);
        this.snackBar.open('Fournisseur modifié avec succès', 'Fermer', { duration: 3000 });
      }
    });
  }

  viewSupplierHistory(supplier: Supplier): void {
    console.log('📊 Historique du fournisseur:', supplier.name);
    this.snackBar.open(`Historique de ${supplier.name} - Fonctionnalité en développement`, 'Fermer', { duration: 3000 });
  }

  deleteSupplier(supplier: Supplier): void {
    console.log('🗑️ Supprimer le fournisseur:', supplier.name);
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer le fournisseur "${supplier.name}" ?`)) {
      const index = this.suppliers.indexOf(supplier);
      if (index > -1) {
        this.suppliers.splice(index, 1);
        this.snackBar.open('Fournisseur supprimé', 'Fermer', { duration: 3000 });
      }
    }
  }

  viewOrderDetails(order: PurchaseOrder): void {
    console.log('👁️ Détails de la commande:', order.id);
    this.snackBar.open(`Détails de la commande ${order.id} - Fonctionnalité en développement`, 'Fermer', { duration: 3000 });
  }

  editOrder(order: PurchaseOrder): void {
    console.log('✏️ Modifier la commande:', order.id);
    this.snackBar.open(`Modification de la commande ${order.id} - Fonctionnalité en développement`, 'Fermer', { duration: 3000 });
  }

  receiveOrder(order: PurchaseOrder): void {
    order.status = 'received';
    order.actualDelivery = new Date();
    this.snackBar.open('Commande réceptionnée', 'Fermer', { duration: 3000 });
  }

  cancelOrder(order: PurchaseOrder): void {
    order.status = 'cancelled';
    this.snackBar.open('Commande annulée', 'Fermer', { duration: 3000 });
  }

  performStockTake(): void {
    console.log('📋 Effectuer un inventaire physique');
    
    const dialogRef = this.dialog.open(StockTakeDialogComponent, {
      width: '1000px',
      maxHeight: '80vh',
      data: { items: this.inventory }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.adjustments) {
        console.log('✅ Inventaire validé:', result.adjustments);
        
        // Appliquer les ajustements
        result.adjustments.forEach((adjustment: any) => {
          const item = this.inventory.find(i => i.id === adjustment.itemId);
          if (item) {
            item.currentStock = adjustment.countedStock;
            item.availableStock = item.currentStock - item.reservedStock;
            item.totalValue = item.currentStock * item.unitCost;
            item.lastMovement = new Date();
            this.updateStockStatus(item);
          }
        });

        this.snackBar.open('Inventaire physique terminé avec succès', 'Fermer', { duration: 3000 });
      }
    });
  }

  exportInventory(): void {
    console.log('📊 Exporter l\'inventaire');
    this.snackBar.open('Export de l\'inventaire en cours...', 'Fermer', { duration: 2000 });
    // TODO: Implémenter l'export CSV/Excel
  }

  exportMovements(): void {
    console.log('📊 Exporter les mouvements');
    this.snackBar.open('Export des mouvements en cours...', 'Fermer', { duration: 2000 });
    // TODO: Implémenter l'export CSV/Excel
  }

  updateStockStatus(item: InventoryItem): void {
    if (item.currentStock <= 0) {
      item.status = 'out_of_stock';
    } else if (item.currentStock <= item.minStock) {
      item.status = 'low_stock';
    } else if (item.currentStock >= item.maxStock) {
      item.status = 'overstock';
    } else {
      item.status = 'in_stock';
    }
  }

  getStockStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'in_stock': 'primary',
      'low_stock': 'warn',
      'out_of_stock': 'warn',
      'overstock': 'accent'
    };
    return colors[status] || 'primary';
  }

  getStockStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'in_stock': 'En stock',
      'low_stock': 'Stock bas',
      'out_of_stock': 'Rupture',
      'overstock': 'Surstock'
    };
    return labels[status] || status;
  }

  getMovementTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'in': 'Entrée',
      'out': 'Sortie',
      'adjustment': 'Ajustement',
      'transfer': 'Transfert'
    };
    return labels[type] || type;
  }

  getMovementTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'in': 'primary',
      'out': 'warn',
      'adjustment': 'accent',
      'transfer': 'primary'
    };
    return colors[type] || 'primary';
  }
}


