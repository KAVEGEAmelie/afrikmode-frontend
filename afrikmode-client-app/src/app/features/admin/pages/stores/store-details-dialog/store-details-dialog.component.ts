import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

export interface StoreDetailsData {
  store: any;
}

@Component({
  selector: 'app-store-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="store-details-dialog">
      <div class="dialog-header">
        <div class="store-logo">
          <mat-icon>store</mat-icon>
        </div>
        <div class="store-info">
          <h2 mat-dialog-title>{{ store.name }}</h2>
          <p class="store-vendor">{{ store.vendor_name || store.vendor }}</p>
        </div>
        <button mat-icon-button (click)="onClose()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <mat-tab-group>
          <!-- Informations générales -->
          <mat-tab label="Informations">
            <div class="tab-content">
              <div class="details-grid">
                <mat-card class="detail-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>info</mat-icon>
                      Informations générales
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="detail-item">
                      <span class="label">Nom de la boutique:</span>
                      <span class="value">{{ store.name }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Vendeur:</span>
                      <span class="value">{{ store.vendor_name || store.vendor }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Email:</span>
                      <span class="value">{{ store.email }}</span>
                    </div>
                    <div class="detail-item" *ngIf="store.phone">
                      <span class="label">Téléphone:</span>
                      <span class="value">{{ store.phone }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Ville:</span>
                      <span class="value">{{ store.city }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Pays:</span>
                      <span class="value">{{ store.country }}</span>
                    </div>
                    <div class="detail-item" *ngIf="store.business_type">
                      <span class="label">Type d'entreprise:</span>
                      <span class="value">{{ store.business_type }}</span>
                    </div>
                    <div class="detail-item" *ngIf="store.tax_id">
                      <span class="label">ID Fiscal:</span>
                      <span class="value">{{ store.tax_id }}</span>
                    </div>
                    <div class="detail-item" *ngIf="store.description">
                      <span class="label">Description:</span>
                      <span class="value">{{ store.description }}</span>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="detail-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>admin_panel_settings</mat-icon>
                      Statut et vérification
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="detail-item">
                      <span class="label">Statut:</span>
                      <mat-chip [color]="getStatusColor(store.status)" selected>
                        {{ getStatusLabel(store.status) }}
                      </mat-chip>
                    </div>
                    <div class="detail-item" *ngIf="store.is_verified !== undefined">
                      <span class="label">Vérifiée:</span>
                      <mat-chip [color]="store.is_verified ? 'primary' : 'accent'" selected>
                        {{ store.is_verified ? 'Oui' : 'Non' }}
                      </mat-chip>
                    </div>
                    <div class="detail-item" *ngIf="store.is_featured !== undefined">
                      <span class="label">En vedette:</span>
                      <mat-chip [color]="store.is_featured ? 'accent' : 'primary'" selected>
                        {{ store.is_featured ? 'Oui' : 'Non' }}
                      </mat-chip>
                    </div>
                    <div class="detail-item" *ngIf="store.created_at">
                      <span class="label">Créée le:</span>
                      <span class="value">{{ formatDate(store.created_at) }}</span>
                    </div>
                    <div class="detail-item" *ngIf="store.verified_at">
                      <span class="label">Vérifiée le:</span>
                      <span class="value">{{ formatDate(store.verified_at) }}</span>
                    </div>
                    <div class="detail-item" *ngIf="store.suspended_at">
                      <span class="label">Suspendue le:</span>
                      <span class="value">{{ formatDate(store.suspended_at) }}</span>
                    </div>
                    <div class="detail-item" *ngIf="store.suspension_reason">
                      <span class="label">Raison suspension:</span>
                      <span class="value reason">{{ store.suspension_reason }}</span>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Statistiques -->
          <mat-tab label="Statistiques" *ngIf="store.total_products !== undefined || store.total_orders !== undefined">
            <div class="tab-content">
              <mat-card class="detail-card">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>analytics</mat-icon>
                    Statistiques de la boutique
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="stats-grid">
                    <div class="stat-box" *ngIf="store.total_products !== undefined">
                      <mat-icon>inventory</mat-icon>
                      <div class="stat-info">
                        <span class="stat-value">{{ store.total_products }}</span>
                        <span class="stat-label">Produits</span>
                      </div>
                    </div>
                    <div class="stat-box" *ngIf="store.total_orders !== undefined">
                      <mat-icon>shopping_cart</mat-icon>
                      <div class="stat-info">
                        <span class="stat-value">{{ store.total_orders }}</span>
                        <span class="stat-label">Commandes</span>
                      </div>
                    </div>
                    <div class="stat-box" *ngIf="store.total_revenue !== undefined">
                      <mat-icon>attach_money</mat-icon>
                      <div class="stat-info">
                        <span class="stat-value">{{ formatCurrency(store.total_revenue) }}</span>
                        <span class="stat-label">Revenus</span>
                      </div>
                    </div>
                    <div class="stat-box" *ngIf="store.rating !== undefined && store.rating > 0">
                      <mat-icon>star</mat-icon>
                      <div class="stat-info">
                        <span class="stat-value">{{ store.rating.toFixed(1) }}</span>
                        <span class="stat-label">Note moyenne</span>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Produits -->
          <mat-tab label="Produits">
            <div class="tab-content">
              <div class="tab-header">
                <h3>Produits de la boutique</h3>
                <button mat-raised-button color="primary" (click)="loadProducts()">
                  <mat-icon>refresh</mat-icon>
                  Actualiser
                </button>
              </div>
              @if (loadingProducts) {
                <div class="loading-state">
                  <mat-spinner diameter="40"></mat-spinner>
                  <p>Chargement des produits...</p>
                </div>
              } @else {
                <div class="products-list">
                  @if (products.length === 0) {
                    <div class="empty-state">
                      <mat-icon>inventory_2</mat-icon>
                      <p>Aucun produit pour cette boutique</p>
                    </div>
                  } @else {
                    <div class="products-grid">
                      @for (product of products; track product.id) {
                        <mat-card class="product-card">
                          <img *ngIf="product.primary_image" [src]="product.primary_image" [alt]="product.name" class="product-image">
                          <mat-icon *ngIf="!product.primary_image" class="product-icon">image</mat-icon>
                          <mat-card-content>
                            <h4>{{ product.name }}</h4>
                            <p class="product-price">{{ formatCurrency(product.price) }}</p>
                            <div class="product-stats">
                              <span><mat-icon>inventory</mat-icon> Stock: {{ product.stock_quantity }}</span>
                              <span><mat-icon>star</mat-icon> {{ product.average_rating || 0 }}/5</span>
                            </div>
                          </mat-card-content>
                        </mat-card>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </mat-tab>

          <!-- Commandes -->
          <mat-tab label="Commandes">
            <div class="tab-content">
              <div class="tab-header">
                <h3>Commandes de la boutique</h3>
                <button mat-raised-button color="primary" (click)="loadOrders()">
                  <mat-icon>refresh</mat-icon>
                  Actualiser
                </button>
              </div>
              @if (loadingOrders) {
                <div class="loading-state">
                  <mat-spinner diameter="40"></mat-spinner>
                  <p>Chargement des commandes...</p>
                </div>
              } @else {
                <div class="orders-list">
                  @if (orders.length === 0) {
                    <div class="empty-state">
                      <mat-icon>shopping_cart</mat-icon>
                      <p>Aucune commande pour cette boutique</p>
                    </div>
                  } @else {
                    <table class="orders-table">
                      <thead>
                        <tr>
                          <th>N° Commande</th>
                          <th>Client</th>
                          <th>Montant</th>
                          <th>Statut</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (order of orders; track order.id) {
                          <tr>
                            <td>{{ order.order_number }}</td>
                            <td>{{ order.first_name }} {{ order.last_name }}</td>
                            <td>{{ formatCurrency(order.total_amount) }}</td>
                            <td><mat-chip [ngClass]="'status-' + order.status">{{ getStatusLabel(order.status) }}</mat-chip></td>
                            <td>{{ formatDate(order.created_at) }}</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  }
                </div>
              }
            </div>
          </mat-tab>

          <!-- Historique -->
          <mat-tab label="Historique">
            <div class="tab-content">
              <div class="tab-header">
                <h3>Historique de la boutique</h3>
                <button mat-raised-button color="primary" (click)="loadHistory()">
                  <mat-icon>refresh</mat-icon>
                  Actualiser
                </button>
              </div>
              @if (loadingHistory) {
                <div class="loading-state">
                  <mat-spinner diameter="40"></mat-spinner>
                  <p>Chargement de l'historique...</p>
                </div>
              } @else {
                <div class="history-list">
                  @if (history.length === 0) {
                    <div class="empty-state">
                      <mat-icon>history</mat-icon>
                      <p>Aucun historique disponible</p>
                    </div>
                  } @else {
                    <div class="history-timeline">
                      @for (item of history; track item.date) {
                        <div class="history-item">
                          <div class="history-icon">
                            <mat-icon>{{ getHistoryIcon(item.type) }}</mat-icon>
                          </div>
                          <div class="history-content">
                            <p class="history-description">{{ item.description }}</p>
                            <span class="history-date">{{ formatDate(item.date) }}</span>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </mat-tab>

          <!-- Documents -->
          <mat-tab label="Documents" *ngIf="store.documents">
            <div class="tab-content">
              <mat-card class="detail-card">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>description</mat-icon>
                    Documents fournis
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="documents-list">
                    <div class="doc-item" *ngIf="store.documents.business_registration">
                      <mat-icon>description</mat-icon>
                      <span>Enregistrement commercial</span>
                      <button mat-icon-button (click)="viewDocument(store.documents.business_registration)">
                        <mat-icon>visibility</mat-icon>
                      </button>
                    </div>
                    <div class="doc-item" *ngIf="store.documents.tax_certificate">
                      <mat-icon>description</mat-icon>
                      <span>Certificat fiscal</span>
                      <button mat-icon-button (click)="viewDocument(store.documents.tax_certificate)">
                        <mat-icon>visibility</mat-icon>
                      </button>
                    </div>
                    <div class="doc-item" *ngIf="store.documents.id_card">
                      <mat-icon>badge</mat-icon>
                      <span>Pièce d'identité</span>
                      <button mat-icon-button (click)="viewDocument(store.documents.id_card)">
                        <mat-icon>visibility</mat-icon>
                      </button>
                    </div>
                    <div class="doc-item" *ngIf="store.documents.product_samples && store.documents.product_samples.length > 0">
                      <mat-icon>image</mat-icon>
                      <span>{{ store.documents.product_samples.length }} échantillon(s) produit</span>
                      <button mat-icon-button (click)="viewSamples(store.documents.product_samples)">
                        <mat-icon>visibility</mat-icon>
                      </button>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onClose()">
          Fermer
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .store-details-dialog {
      min-width: 700px;
      max-width: 900px;
      max-height: 85vh;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e0e0e0;
      position: relative;

      .store-logo {
        width: 64px;
        height: 64px;
        border-radius: 12px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
        }
      }

      .store-info {
        flex: 1;

        h2 {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 600;
          color: #333;
        }

        .store-vendor {
          margin: 0;
          color: #666;
          font-size: 16px;
        }
      }

      .close-btn {
        position: absolute;
        top: 0;
        right: 0;
      }
    }

    .dialog-content {
      max-height: 60vh;
      overflow-y: auto;
      padding: 0 0 24px 0;
    }

    .tab-content {
      padding: 16px 0;
    }

    .details-grid {
      display: grid;
      gap: 16px;
    }

    .detail-card {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      mat-card-header {
        padding-bottom: 8px;

        mat-card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          font-weight: 600;
          color: #1976d2;

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }
      }

      mat-card-content {
        padding-top: 0;
      }
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .label {
        font-weight: 500;
        color: #666;
        min-width: 150px;
      }

      .value {
        color: #333;
        text-align: right;
        flex: 1;
        margin-left: 16px;

        &.reason {
          color: #ef4444;
          font-weight: 500;
        }
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .stat-box {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;

      mat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
        color: #10b981;
      }

      .stat-info {
        display: flex;
        flex-direction: column;

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
        }

        .stat-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
        }
      }
    }

    .documents-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .doc-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;

      mat-icon:first-child {
        color: #64748b;
      }

      span {
        flex: 1;
        color: #1e293b;
      }
    }

    .tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      gap: 16px;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .product-card {
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-4px);
      }
    }

    .product-image {
      width: 100%;
      height: 150px;
      object-fit: cover;
    }

    .product-icon {
      width: 100%;
      height: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 64px;
      color: #ccc;
    }

    .product-price {
      font-size: 18px;
      font-weight: 600;
      color: #10b981;
      margin: 8px 0;
    }

    .product-stats {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #666;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    .orders-table {
      width: 100%;
      border-collapse: collapse;

      th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
      }

      th {
        background: #f8f9fa;
        font-weight: 600;
      }
    }

    .history-timeline {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .history-item {
      display: flex;
      gap: 16px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .history-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #10b981;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .history-content {
      flex: 1;
    }

    .history-description {
      margin: 0 0 4px 0;
      font-weight: 500;
    }

    .history-date {
      font-size: 12px;
      color: #666;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #999;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
        opacity: 0.5;
      }
    }

    mat-dialog-actions {
      padding: 16px 0 0 0;
      margin: 0;
      border-top: 1px solid #e0e0e0;
    }

    @media (max-width: 768px) {
      .store-details-dialog {
        min-width: 90vw;
        max-width: 95vw;
      }

      .dialog-header {
        flex-direction: column;
        text-align: center;
        gap: 12px;

        .close-btn {
          position: static;
          align-self: flex-end;
        }
      }

      .detail-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;

        .value {
          text-align: left;
          margin-left: 0;
        }
      }
    }
  `]
})
export class StoreDetailsDialogComponent {
  store: any;
  products: any[] = [];
  orders: any[] = [];
  history: any[] = [];
  loadingProducts = false;
  loadingOrders = false;
  loadingHistory = false;

  private apiUrl = `${environment.apiUrl}/admin/stores`;

  constructor(
    private dialogRef: MatDialogRef<StoreDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StoreDetailsData,
    private http: HttpClient
  ) {
    this.store = data.store;
  }

  getStatusLabel(status: string): string {
    const statuses: { [key: string]: string } = {
      'pending': 'En attente',
      'active': 'Active',
      'suspended': 'Suspendue',
      'rejected': 'Rejetée',
      'under_review': 'En révision',
      'additional_info_required': 'Infos requises'
    };
    return statuses[status] || status;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'primary';
      case 'pending': return 'accent';
      case 'suspended': return 'warn';
      case 'rejected': return 'warn';
      default: return 'primary';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  }

  viewDocument(url: string): void {
    window.open(url, '_blank');
  }

  viewSamples(samples: string[]): void {
    // TODO: Ouvrir une galerie d'images
    console.log('Échantillons:', samples);
  }

  loadProducts(): void {
    if (!this.store.id) return;
    this.loadingProducts = true;
    this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/${this.store.id}/products`).subscribe({
      next: (response) => {
        if (response.success) {
          this.products = response.data;
        }
        this.loadingProducts = false;
      },
      error: (error) => {
        console.error('Erreur chargement produits:', error);
        this.loadingProducts = false;
      }
    });
  }

  loadOrders(): void {
    if (!this.store.id) return;
    this.loadingOrders = true;
    this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/${this.store.id}/orders`).subscribe({
      next: (response) => {
        if (response.success) {
          this.orders = response.data;
        }
        this.loadingOrders = false;
      },
      error: (error) => {
        console.error('Erreur chargement commandes:', error);
        this.loadingOrders = false;
      }
    });
  }

  loadHistory(): void {
    if (!this.store.id) return;
    this.loadingHistory = true;
    this.http.get<{ success: boolean; data: { store_info: any; history: any[] } }>(`${this.apiUrl}/${this.store.id}/history`).subscribe({
      next: (response) => {
        if (response.success && response.data.history) {
          this.history = response.data.history;
        }
        this.loadingHistory = false;
      },
      error: (error) => {
        console.error('Erreur chargement historique:', error);
        this.loadingHistory = false;
      }
    });
  }

  getHistoryIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'status_change': 'swap_horiz',
      'product_added': 'add_circle',
      'order_received': 'shopping_cart',
      'verification': 'verified',
      'suspension': 'block'
    };
    return icons[type] || 'info';
  }

  onClose(): void {
    this.dialogRef.close();
  }
}




