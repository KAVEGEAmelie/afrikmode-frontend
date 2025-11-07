// src/app/features/admin/pages/stores/stores-suspended.component.ts
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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { AdminService, VendorRequest } from '../../../../core/services/admin.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../users/confirm-dialog/confirm-dialog.component';
import { StoreDetailsDialogComponent, StoreDetailsData } from './store-details-dialog/store-details-dialog.component';

interface SuspendedStore {
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
  suspended_at: string;
  suspension_reason: string;
  suspended_by: string;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  created_at: string;
}

@Component({
  selector: 'app-stores-suspended',
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
    MatPaginatorModule,
    FormsModule
  ],
  template: `
    <div class="admin-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
        <h1 class="page-title">
          <mat-icon>block</mat-icon>
          Boutiques Suspendues
        </h1>
          <p class="page-subtitle">Boutiques temporairement suspendues pour non-conformité</p>
        </div>
        <div class="header-right">
          <mat-chip highlighted color="warn">{{ totalStores }} suspendues</mat-chip>
        </div>
      </div>

      <!-- Warning Banner -->
      <mat-card class="warning-banner">
        <mat-icon>warning</mat-icon>
        <div>
          <h3>Boutiques suspendues</h3>
          <p>Ces boutiques ont été suspendues pour violation des règles de la plateforme. Vous pouvez les réactiver ou les supprimer définitivement.</p>
        </div>
      </mat-card>

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
          <p>Chargement des boutiques suspendues...</p>
        </div>
      }

      <!-- Stores Grid -->
      @if (!loading && stores.length > 0) {
        <div class="stores-grid">
          <mat-card class="store-card" *ngFor="let store of stores">
            <div class="store-header">
              <div class="store-logo">
                <mat-icon>block</mat-icon>
              </div>
              <div class="store-info">
                <div class="store-title-row">
                  <h3>{{ store.name }}</h3>
                  <mat-chip class="suspended-chip" color="warn">
                    <mat-icon>block</mat-icon>
                    Suspendue
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

            <!-- Suspension Info -->
            <div class="suspension-info">
              <div class="suspension-header">
                <mat-icon>info</mat-icon>
                <h4>Informations de suspension</h4>
              </div>
              <div class="suspension-details">
                <div class="detail-row">
                  <span class="label">Raison:</span>
                  <span class="value reason">{{ store.suspension_reason }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Suspendue le:</span>
                  <span class="value">{{ formatDate(store.suspended_at) }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Par:</span>
                  <span class="value">{{ store.suspended_by }}</span>
                </div>
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
            </div>

            <div class="store-details">
              <p class="store-description">{{ store.description }}</p>
            </div>

            <!-- Actions -->
            <div class="store-actions">
              <button 
                mat-raised-button 
                color="primary" 
                (click)="reactivateStore(store)"
                [disabled]="processingStoreId === store.id">
                <mat-icon>check_circle</mat-icon>
                Réactiver
              </button>
              <button 
                mat-stroked-button 
                color="warn" 
                (click)="viewDetails(store)"
                matTooltip="Voir les détails">
                <mat-icon>visibility</mat-icon>
                Détails
              </button>
              <button 
                mat-icon-button 
                [matMenuTriggerFor]="menu"
                matTooltip="Plus d'options">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="deleteStore(store)">
                  <mat-icon>delete</mat-icon>
                  Supprimer définitivement
                </button>
                <button mat-menu-item (click)="contactVendor(store)">
                  <mat-icon>email</mat-icon>
                  Contacter le vendeur
                </button>
                <button mat-menu-item (click)="viewHistory(store)">
                  <mat-icon>history</mat-icon>
                  Historique
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
          <mat-icon>check_circle</mat-icon>
          <h2>Aucune boutique suspendue</h2>
          <p>{{ searchQuery || countryFilter ? 'Aucun résultat pour vos critères de recherche' : 'Toutes les boutiques sont actives' }}</p>
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
      color: #ef4444;
    }

    .page-subtitle {
      margin: 0;
      color: #64748b;
      font-size: 14px;
    }

    .warning-banner {
      margin-bottom: 24px;
      padding: 20px;
      background: #fef2f2;
      border: 1px solid #fca5a5;
      border-radius: 12px;
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .warning-banner mat-icon {
      color: #ef4444;
      font-size: 32px;
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }

    .warning-banner h3 {
      margin: 0 0 8px 0;
      color: #991b1b;
      font-size: 16px;
      font-weight: 600;
    }

    .warning-banner p {
      margin: 0;
      color: #7f1d1d;
      font-size: 14px;
      line-height: 1.6;
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
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .store-card {
      padding: 24px;
      border-radius: 16px;
      position: relative;
      transition: transform 0.2s, box-shadow 0.2s;
      border-left: 4px solid #ef4444;
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
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .store-logo mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
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

    .suspended-chip {
      font-size: 11px;
      height: 24px;
    }

    .suspended-chip mat-icon {
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

    .suspension-info {
      margin-bottom: 20px;
      padding: 16px;
      background: #fef2f2;
      border-radius: 12px;
      border: 1px solid #fca5a5;
    }

    .suspension-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .suspension-header mat-icon {
      color: #ef4444;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .suspension-header h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #991b1b;
    }

    .suspension-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
    }

    .detail-row .label {
      font-weight: 500;
      color: #7f1d1d;
    }

    .detail-row .value {
      color: #991b1b;
      text-align: right;
      flex: 1;
      margin-left: 12px;
    }

    .detail-row .value.reason {
      font-weight: 500;
    }

    .store-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
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
      color: #64748b;
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
      line-height: 1.6;
      font-size: 14px;
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
export class StoresSuspendedComponent implements OnInit {
  stores: SuspendedStore[] = [];
  loading = true;
  processingStoreId: string | null = null;
  searchQuery = '';
  countryFilter = '';
  totalStores = 0;
  currentPage = 0;
  pageSize = 12;

  constructor(
    private adminService: AdminService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadSuspendedStores();
  }

  private loadSuspendedStores(): void {
    this.loading = true;
    
    const params: any = {
      status: 'suspended',
      page: this.currentPage + 1,
      limit: this.pageSize,
      sortBy: 'suspended_at',
      sortOrder: 'desc'
    };

    if (this.searchQuery) {
      params.search = this.searchQuery;
    }

    if (this.countryFilter) {
      params.country = this.countryFilter;
    }

    this.adminService.getStoreRequests(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stores = response.data.map((item: VendorRequest) => this.mapToSuspendedStore(item));
          this.totalStores = response.pagination?.total || response.data.length;
          this.loading = false;
        } else {
          this.toastService.error('Erreur lors du chargement des boutiques');
          this.loading = false;
        }
      },
      error: (error: any) => {
        console.error('Erreur chargement boutiques suspendues:', error);
        this.toastService.error('Erreur lors du chargement des boutiques');
        this.loading = false;
      }
    });
  }

  onSearchChange(): void {
    setTimeout(() => {
      this.currentPage = 0;
      this.loadSuspendedStores();
    }, 500);
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadSuspendedStores();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.countryFilter = '';
    this.currentPage = 0;
    this.loadSuspendedStores();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadSuspendedStores();
  }

  reactivateStore(store: SuspendedStore): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Réactiver la boutique',
        message: `Êtes-vous sûr de vouloir réactiver la boutique "${store.name}" ?`,
        confirmText: 'Réactiver',
        cancelText: 'Annuler',
        type: 'info',
        icon: 'check_circle'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.processingStoreId = store.id;
        
        this.adminService.activateStore(store.id).subscribe({
          next: (response: any) => {
            if (response.success) {
              this.toastService.success('Boutique réactivée avec succès');
              this.loadSuspendedStores();
            } else {
              this.toastService.error(response.message || 'Erreur lors de la réactivation');
              this.processingStoreId = null;
            }
          },
          error: (error: any) => {
            console.error('Erreur réactivation boutique:', error);
            this.toastService.error('Erreur lors de la réactivation de la boutique');
            this.processingStoreId = null;
          }
        });
      }
    });
  }

  deleteStore(store: SuspendedStore): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'Supprimer définitivement',
        message: `ATTENTION: Cette action est irréversible. Êtes-vous sûr de vouloir supprimer définitivement la boutique "${store.name}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        type: 'danger',
        icon: 'delete'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.processingStoreId = store.id;
        
        this.adminService.deleteStore(store.id).subscribe({
          next: (response: any) => {
            if (response.success) {
              this.toastService.success('Boutique supprimée définitivement');
              this.loadSuspendedStores();
            } else {
              this.toastService.error(response.message || 'Erreur lors de la suppression');
              this.processingStoreId = null;
            }
          },
          error: (error: any) => {
            console.error('Erreur suppression boutique:', error);
            this.toastService.error('Erreur lors de la suppression de la boutique');
            this.processingStoreId = null;
          }
        });
      }
    });
  }

  viewDetails(store: SuspendedStore): void {
    this.dialog.open(StoreDetailsDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        store: store
      } as StoreDetailsData
    });
  }

  contactVendor(store: SuspendedStore): void {
    window.location.href = `mailto:${store.email}?subject=Contact depuis l'administration - Boutique suspendue`;
  }

  viewHistory(store: SuspendedStore): void {
    // TODO: Ouvrir un dialog avec l'historique de la boutique
    this.toastService.info(`Historique de ${store.name}`);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private mapToSuspendedStore(item: VendorRequest): SuspendedStore {
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
      status: 'suspended',
      suspended_at: item.reviewed_at || item.submitted_at,
      suspension_reason: item.rejection_reason || 'Non spécifiée',
      suspended_by: item.reviewed_by || 'Admin',
      total_products: 0, // À récupérer depuis le backend
      total_orders: 0, // À récupérer depuis le backend
      total_revenue: 0, // À récupérer depuis le backend
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
