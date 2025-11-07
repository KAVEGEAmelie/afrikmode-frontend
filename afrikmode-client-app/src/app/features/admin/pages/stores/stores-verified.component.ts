// src/app/features/admin/pages/stores/stores-verified.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { AdminService, VendorRequest } from '../../../../core/services/admin.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../users/confirm-dialog/confirm-dialog.component';
import { StoreReasonDialogComponent, StoreReasonDialogData } from './store-reason-dialog/store-reason-dialog.component';
import { StoreDetailsDialogComponent, StoreDetailsData } from './store-details-dialog/store-details-dialog.component';

interface VerifiedStore {
  id: string;
  name: string;
  vendor_name: string;
  vendor_id: string;
  email: string;
  phone: string;
  description: string;
  city: string;
  country: string;
  status: string;
  is_verified: boolean;
  is_featured: boolean;
  verified_at: string;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  rating: number;
  created_at: string;
}

@Component({
  selector: 'app-stores-verified',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    FormsModule
  ],
  template: `
    <div class="admin-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">
            <mat-icon>verified</mat-icon>
            Boutiques Vérifiées
          </h1>
          <p class="page-subtitle">Gérez les boutiques approuvées et actives sur la plateforme</p>
        </div>
        <div class="header-right">
          <mat-chip highlighted color="primary">{{ totalStores }} boutiques vérifiées</mat-chip>
        </div>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Rechercher une boutique</mat-label>
            <input matInput [(ngModel)]="searchQuery" (input)="onSearchChange()" placeholder="Nom, vendeur, ville...">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Pays</mat-label>
            <input matInput [(ngModel)]="countryFilter" (input)="applyFilters()" placeholder="Tous les pays">
          </mat-form-field>

          <button mat-stroked-button (click)="toggleFeaturedFilter()" [class.active]="showFeaturedOnly">
            <mat-icon>star</mat-icon>
            {{ showFeaturedOnly ? 'Toutes' : 'En vedette' }}
          </button>

          <button mat-stroked-button (click)="clearFilters()">
            <mat-icon>clear</mat-icon>
            Réinitialiser
          </button>
        </div>
      </mat-card>

      <!-- Loading -->
      @if (loading) {
        <div class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Chargement des boutiques vérifiées...</p>
        </div>
      }

      <!-- Stores Grid -->
      @if (!loading && stores.length > 0) {
        <div class="stores-grid">
          <mat-card class="store-card" *ngFor="let store of stores">
            <div class="store-header">
              <div class="store-logo">
                <mat-icon>store</mat-icon>
                @if (store.is_featured) {
                  <div class="featured-badge">
                    <mat-icon>star</mat-icon>
                  </div>
                }
              </div>
              <div class="store-info">
                <div class="store-title-row">
                  <h3>{{ store.name }}</h3>
                  <mat-chip class="verified-chip" color="primary">
                    <mat-icon>verified</mat-icon>
                    Vérifiée
                  </mat-chip>
                </div>
                <p class="vendor-name">
                  <mat-icon>person</mat-icon>
                  {{ store.vendor_name }}
                </p>
                <p class="store-location">
                  <mat-icon>location_on</mat-icon>
                  {{ store.city }}, {{ store.country }}
                </p>
              </div>
            </div>

            <div class="store-stats">
              <div class="stat-item">
                <mat-icon>inventory</mat-icon>
                <div>
                  <span class="stat-value">{{ store.total_products }}</span>
                  <span class="stat-label">Produits</span>
                </div>
              </div>
              <div class="stat-item">
                <mat-icon>shopping_cart</mat-icon>
                <div>
                  <span class="stat-value">{{ store.total_orders }}</span>
                  <span class="stat-label">Commandes</span>
                </div>
              </div>
              <div class="stat-item">
                <mat-icon>attach_money</mat-icon>
                <div>
                  <span class="stat-value">{{ formatCurrency(store.total_revenue) }}</span>
                  <span class="stat-label">Revenus</span>
                </div>
              </div>
              @if (store.rating > 0) {
                <div class="stat-item">
                  <mat-icon>star</mat-icon>
                  <div>
                    <span class="stat-value">{{ store.rating.toFixed(1) }}</span>
                    <span class="stat-label">Note</span>
                  </div>
                </div>
              }
            </div>

            <div class="store-details">
              <p class="store-description">{{ store.description }}</p>
              <div class="detail-row">
                <span class="label">Vérifiée le:</span>
                <span class="value">{{ formatDate(store.verified_at) }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="store-actions">
              <button 
                mat-raised-button 
                color="primary" 
                (click)="viewStoreDetails(store)"
                matTooltip="Voir les détails">
                <mat-icon>visibility</mat-icon>
                Détails
              </button>
              <button 
                mat-stroked-button 
                [color]="store.is_featured ? 'accent' : 'primary'"
                (click)="toggleFeatured(store)"
                [disabled]="processingStoreId === store.id"
                matTooltip="{{ store.is_featured ? 'Retirer de la vedette' : 'Mettre en vedette' }}">
                <mat-icon>{{ store.is_featured ? 'star' : 'star_border' }}</mat-icon>
                {{ store.is_featured ? 'En vedette' : 'Mettre en vedette' }}
              </button>
              <button 
                mat-icon-button 
                [matMenuTriggerFor]="menu"
                matTooltip="Plus d'options">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="suspendStore(store)">
                  <mat-icon>block</mat-icon>
                  Suspendre
                </button>
                <button mat-menu-item (click)="viewProducts(store)">
                  <mat-icon>inventory</mat-icon>
                  Voir produits
                </button>
                <button mat-menu-item (click)="viewOrders(store)">
                  <mat-icon>shopping_cart</mat-icon>
                  Voir commandes
                </button>
                <button mat-menu-item (click)="contactVendor(store)">
                  <mat-icon>email</mat-icon>
                  Contacter
                </button>
              </mat-menu>
            </div>

            @if (processingStoreId === store.id) {
              <div class="processing-overlay">
                <mat-spinner diameter="30"></mat-spinner>
                <span>Traitement en cours...</span>
              </div>
            }
          </mat-card>
        </div>

        <!-- Pagination -->
        <mat-paginator
          [length]="totalStores"
          [pageSize]="pageSize"
          [pageIndex]="currentPage"
          [pageSizeOptions]="[12, 24, 48, 96]"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      }

      <!-- Empty State -->
      @if (!loading && stores.length === 0) {
        <mat-card class="empty-state">
          <mat-icon>store</mat-icon>
          <h2>Aucune boutique vérifiée</h2>
          <p>{{ searchQuery || countryFilter ? 'Aucun résultat pour vos critères de recherche' : 'Aucune boutique n\'a été vérifiée pour le moment' }}</p>
          @if (searchQuery || countryFilter) {
            <button mat-raised-button color="primary" (click)="clearFilters()">
              Réinitialiser les filtres
            </button>
          }
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .admin-page {
      padding: 24px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-left {
      flex: 1;
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
    }

    .page-title mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #10b981;
    }

    .page-subtitle {
      margin: 0;
      color: #64748b;
      font-size: 14px;
    }

    .filters-card {
      margin-bottom: 24px;
      padding: 20px;
    }

    .filters-row {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 250px;
    }

    .filter-field {
      width: 200px;
    }

    .filters-row button.active {
      background: #3b82f6;
      color: white;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      gap: 16px;
    }

    .loading-container p {
      color: #64748b;
      margin: 0;
    }

    .stores-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .store-card {
      padding: 24px;
      border-radius: 16px;
      position: relative;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .store-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .store-header {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      align-items: flex-start;
    }

    .store-logo {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
    }

    .store-logo mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .featured-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #f59e0b;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .featured-badge mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: white;
    }

    .store-info {
      flex: 1;
    }

    .store-title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }

    .store-info h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
    }

    .verified-chip {
      font-size: 11px;
      height: 24px;
    }

    .verified-chip mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .vendor-name, .store-location {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 4px 0;
      color: #64748b;
      font-size: 14px;
    }

    .vendor-name mat-icon, .store-location mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .store-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 20px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 12px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .stat-item mat-icon {
      color: #10b981;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .stat-item div {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-weight: 700;
      font-size: 16px;
      color: #1e293b;
    }

    .stat-label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
    }

    .store-details {
      margin-bottom: 20px;
    }

    .store-description {
      color: #475569;
      margin-bottom: 12px;
      line-height: 1.6;
      font-size: 14px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 13px;
    }

    .detail-row .label {
      font-weight: 500;
      color: #64748b;
    }

    .detail-row .value {
      color: #1e293b;
    }

    .store-actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }

    .store-actions button {
      flex: 1;
    }

    .processing-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .empty-state {
      padding: 60px 20px;
      text-align: center;
      background: white;
      border-radius: 12px;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #cbd5e1;
      margin-bottom: 16px;
    }

    .empty-state h2 {
      margin: 0 0 8px 0;
      color: #1e293b;
    }

    .empty-state p {
      margin: 0 0 20px 0;
      color: #64748b;
    }

    mat-paginator {
      background: white;
      border-radius: 12px;
      padding: 16px;
    }
  `]
})
export class StoresVerifiedComponent implements OnInit {
  stores: VerifiedStore[] = [];
  loading = true;
  processingStoreId: string | null = null;
  searchQuery = '';
  countryFilter = '';
  showFeaturedOnly = false;
  totalStores = 0;
  currentPage = 0;
  pageSize = 12;

  constructor(
    private adminService: AdminService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadVerifiedStores();
  }

  private loadVerifiedStores(): void {
    this.loading = true;
    
    const params: any = {
      status: 'active',
      is_verified: true,
      page: this.currentPage + 1,
      limit: this.pageSize,
      sortBy: 'verified_at',
      sortOrder: 'desc'
    };

    if (this.searchQuery) {
      params.search = this.searchQuery;
    }

    if (this.countryFilter) {
      params.country = this.countryFilter;
    }

    if (this.showFeaturedOnly) {
      params.is_featured = true;
    }

    this.adminService.getStoreRequests(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stores = response.data.map((item: VendorRequest) => this.mapToVerifiedStore(item));
          this.totalStores = response.pagination?.total || response.data.length;
          this.loading = false;
        } else {
          this.toastService.error('Erreur lors du chargement des boutiques');
          this.loading = false;
        }
      },
      error: (error: any) => {
        console.error('Erreur chargement boutiques vérifiées:', error);
        this.toastService.error('Erreur lors du chargement des boutiques');
        this.loading = false;
      }
    });
  }

  onSearchChange(): void {
    // Debounce search
    setTimeout(() => {
      this.currentPage = 0;
      this.loadVerifiedStores();
    }, 500);
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadVerifiedStores();
  }

  toggleFeaturedFilter(): void {
    this.showFeaturedOnly = !this.showFeaturedOnly;
    this.currentPage = 0;
    this.loadVerifiedStores();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.countryFilter = '';
    this.showFeaturedOnly = false;
    this.currentPage = 0;
    this.loadVerifiedStores();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadVerifiedStores();
  }

  toggleFeatured(store: VerifiedStore): void {
    this.processingStoreId = store.id;
    
    this.adminService.toggleStoreFeatured(store.id, !store.is_featured).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.toastService.success(
            store.is_featured 
              ? 'Boutique retirée de la vedette' 
              : 'Boutique mise en vedette'
          );
          this.loadVerifiedStores();
        } else {
          this.toastService.error(response.message || 'Erreur lors de la modification');
          this.processingStoreId = null;
        }
      },
      error: (error: any) => {
        console.error('Erreur toggle featured:', error);
        this.toastService.error('Erreur lors de la modification');
        this.processingStoreId = null;
      }
    });
  }

  suspendStore(store: VerifiedStore): void {
    const dialogRef = this.dialog.open(StoreReasonDialogComponent, {
      width: '500px',
      data: {
        title: 'Suspendre la boutique',
        message: `Veuillez indiquer la raison de la suspension pour la boutique "${store.name}" :`,
        placeholder: 'Raison de la suspension',
        confirmText: 'Suspendre',
        cancelText: 'Annuler',
        type: 'warning',
        icon: 'block',
        required: true
      } as StoreReasonDialogData
    });

    dialogRef.afterClosed().subscribe((reason) => {
      if (reason) {
        this.processingStoreId = store.id;
        
        this.adminService.suspendStore(store.id, reason).subscribe({
          next: (response: any) => {
            if (response.success) {
              this.toastService.success('Boutique suspendue');
              this.loadVerifiedStores();
            } else {
              this.toastService.error(response.message || 'Erreur lors de la suspension');
              this.processingStoreId = null;
            }
          },
          error: (error: any) => {
            console.error('Erreur suspension boutique:', error);
            this.toastService.error('Erreur lors de la suspension');
            this.processingStoreId = null;
          }
        });
      }
    });
  }

  viewStoreDetails(store: VerifiedStore): void {
    this.dialog.open(StoreDetailsDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        store: store
      } as StoreDetailsData
    });
  }

  viewProducts(store: VerifiedStore): void {
    // TODO: Naviguer vers la page des produits de la boutique
    this.toastService.info(`Redirection vers les produits de ${store.name}`);
  }

  viewOrders(store: VerifiedStore): void {
    // TODO: Naviguer vers les commandes de la boutique
    this.toastService.info(`Redirection vers les commandes de ${store.name}`);
  }

  contactVendor(store: VerifiedStore): void {
    window.location.href = `mailto:${store.email}?subject=Contact depuis l'administration`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  private mapToVerifiedStore(item: VendorRequest): VerifiedStore {
    return {
      id: item.id,
      name: item.business_name || item.vendor_name,
      vendor_name: item.vendor_name,
      vendor_id: item.id, // Utiliser l'ID comme vendor_id pour l'instant
      email: item.email,
      phone: item.phone,
      description: item.description,
      city: item.city,
      country: item.country,
      status: item.status === 'approved' ? 'active' : item.status,
      is_verified: item.status === 'approved',
      is_featured: false, // À récupérer depuis le backend si disponible
      verified_at: item.reviewed_at || item.submitted_at,
      total_products: 0, // À récupérer depuis le backend
      total_orders: 0, // À récupérer depuis le backend
      total_revenue: 0, // À récupérer depuis le backend
      rating: 0, // À récupérer depuis le backend
      created_at: item.submitted_at
    };
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  }
}
