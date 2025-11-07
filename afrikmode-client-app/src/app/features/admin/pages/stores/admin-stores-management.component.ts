import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
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
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { ToastService } from '../../../../core/services/toast.service';

export interface Store {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  banner?: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  isVerified: boolean;
  isFeatured: boolean;
  rating: number;
  totalReviews: number;
  totalProducts: number;
  totalSales: number;
  revenue: number;
  address: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  settings: {
    currency: string;
    language: string;
    timezone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  verified: number;
  featured: number;
  totalRevenue: number;
  totalProducts: number;
}

@Component({
  selector: 'app-admin-stores-management',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
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
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="stores-management">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>Gestion des Boutiques</h1>
          <p>Gérez toutes les boutiques de la marketplace</p>
        </div>
        <div class="header-right">
          <button mat-raised-button color="primary" (click)="openAddStoreDialog()">
            <mat-icon>store</mat-icon>
            Nouvelle boutique
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-cards">
        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <mat-icon>store</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ storeStats.total }}</div>
              <div class="stat-label">Total boutiques</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon active">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ storeStats.active }}</div>
              <div class="stat-label">Actives</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon pending">
              <mat-icon>pending</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ storeStats.pending }}</div>
              <div class="stat-label">En attente</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon verified">
              <mat-icon>verified</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ storeStats.verified }}</div>
              <div class="stat-label">Vérifiées</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon revenue">
              <mat-icon>account_balance_wallet</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatCurrency(storeStats.totalRevenue) }}</div>
              <div class="stat-label">Revenus totaux</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon products">
              <mat-icon>inventory</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ storeStats.totalProducts }}</div>
              <div class="stat-label">Produits totaux</div>
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
              <input matInput [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="Nom, propriétaire, ville...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="status-field">
              <mat-label>Statut</mat-label>
              <mat-select [(ngModel)]="selectedStatus" (selectionChange)="applyFilters()">
                <mat-option value="">Tous les statuts</mat-option>
                <mat-option value="active">Actif</mat-option>
                <mat-option value="pending">En attente</mat-option>
                <mat-option value="suspended">Suspendu</mat-option>
                <mat-option value="rejected">Rejeté</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="verification-field">
              <mat-label>Vérification</mat-label>
              <mat-select [(ngModel)]="selectedVerification" (selectionChange)="applyFilters()">
                <mat-option value="">Toutes</mat-option>
                <mat-option value="verified">Vérifiées</mat-option>
                <mat-option value="unverified">Non vérifiées</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-button (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
              Effacer
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Stores Table -->
      <mat-card class="table-card">
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="filteredStores" matSort class="stores-table">
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

              <!-- Store Column -->
              <ng-container matColumnDef="store">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Boutique</th>
                <td mat-cell *matCellDef="let store">
                  <div class="store-info">
                    <div class="store-logo">
                      <img *ngIf="store.logo" [src]="store.logo" [alt]="store.name">
                      <mat-icon *ngIf="!store.logo">store</mat-icon>
                    </div>
                    <div class="store-details">
                      <div class="store-name">{{ store.name }}</div>
                      <div class="store-owner">Propriétaire: {{ store.owner.name }}</div>
                      <div class="store-location">{{ store.address.city }}, {{ store.address.country }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
                <td mat-cell *matCellDef="let store">
                  <mat-chip [ngClass]="'status-' + store.status">
                    {{ getStatusLabel(store.status) }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Verification Column -->
              <ng-container matColumnDef="verification">
                <th mat-header-cell *matHeaderCellDef>Vérification</th>
                <td mat-cell *matCellDef="let store">
                  <div class="verification-badges">
                    <mat-chip *ngIf="store.isVerified" class="verified">
                      <mat-icon>verified</mat-icon>
                      Vérifiée
                    </mat-chip>
                    <mat-chip *ngIf="store.isFeatured" class="featured">
                      <mat-icon>star</mat-icon>
                      En vedette
                    </mat-chip>
                  </div>
                </td>
              </ng-container>

              <!-- Stats Column -->
              <ng-container matColumnDef="stats">
                <th mat-header-cell *matHeaderCellDef>Statistiques</th>
                <td mat-cell *matCellDef="let store">
                  <div class="store-stats">
                    <div class="stat-item">
                      <mat-icon>inventory</mat-icon>
                      <span>{{ store.totalProducts }} produits</span>
                    </div>
                    <div class="stat-item">
                      <mat-icon>star</mat-icon>
                      <span>{{ store.rating }}/5 ({{ store.totalReviews }})</span>
                    </div>
                    <div class="stat-item">
                      <mat-icon>account_balance_wallet</mat-icon>
                      <span>{{ formatCurrency(store.revenue) }}</span>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Created At Column -->
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Créée le</th>
                <td mat-cell *matCellDef="let store">
                  {{ store.createdAt | date:'short' }}
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let store">
                  <button mat-icon-button [matMenuTriggerFor]="storeMenu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #storeMenu="matMenu">
                    <button mat-menu-item (click)="viewStore(store)">
                      <mat-icon>visibility</mat-icon>
                      <span>Voir</span>
                    </button>
                    <button mat-menu-item (click)="editStore(store)">
                      <mat-icon>edit</mat-icon>
                      <span>Modifier</span>
                    </button>
                    <button mat-menu-item (click)="toggleStoreStatus(store)">
                      <mat-icon>{{ store.status === 'active' ? 'block' : 'check_circle' }}</mat-icon>
                      <span>{{ store.status === 'active' ? 'Suspendre' : 'Activer' }}</span>
                    </button>
                    <button mat-menu-item (click)="toggleVerification(store)">
                      <mat-icon>{{ store.isVerified ? 'cancel' : 'verified' }}</mat-icon>
                      <span>{{ store.isVerified ? 'Désactiver vérification' : 'Vérifier' }}</span>
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item (click)="viewStoreAnalytics(store)">
                      <mat-icon>analytics</mat-icon>
                      <span>Analytics</span>
                    </button>
                    <button mat-menu-item (click)="deleteStore(store)" class="danger">
                      <mat-icon>delete</mat-icon>
                      <span>Supprimer</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                  (click)="viewStore(row)" class="clickable-row"></tr>
            </table>

            <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]" 
                           showFirstLastButtons
                           [length]="totalStores"
                           [pageSize]="pageSize"
                           (page)="onPageChange($event)">
            </mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./admin-stores-management.component.scss']
})
export class AdminStoresManagementComponent implements OnInit {
  displayedColumns: string[] = ['select', 'store', 'status', 'verification', 'stats', 'createdAt', 'actions'];
  stores: Store[] = [];
  filteredStores: Store[] = [];
  storeStats: StoreStats = {
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    verified: 0,
    featured: 0,
    totalRevenue: 0,
    totalProducts: 0
  };

  // Filters
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedVerification: string = '';

  // Pagination
  pageSize: number = 25;
  totalStores: number = 0;
  currentPage: number = 0;

  // Selection
  selection = new Set<Store>();

  loading = true;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadStores();
    this.loadStoreStats();
  }

  private loadStoreStats(): void {
    this.adminService.getStoreStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.storeStats = {
            total: response.data.total || 0,
            active: response.data.active || 0,
            pending: response.data.pending || 0,
            suspended: 0, // Pas dans la réponse, on le calcule depuis les stores
            verified: response.data.active || 0, // Approximatif
            featured: 0, // Pas dans la réponse
            totalRevenue: 0, // Pas dans la réponse
            totalProducts: 0 // Pas dans la réponse
          };
        }
      },
      error: (error: any) => {
        console.error('Erreur chargement stats boutiques:', error);
      }
    });
  }

  private loadStores(): void {
    this.loading = true;

    // Charger les boutiques depuis le backend
    this.adminService.getStoreRequests({
      page: 1,
      limit: 1000,
      sortBy: 'created_at',
      sortOrder: 'desc'
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Transformer les données du backend en format Store
          this.stores = response.data.map((store: any) => this.mapBackendStoreToStore(store));
          this.filteredStores = [...this.stores];
          this.calculateStats();
          this.loading = false;
        } else {
          this.toastService.error('Erreur lors du chargement des boutiques');
          this.loading = false;
        }
      },
      error: (error: any) => {
        console.error('Erreur chargement boutiques:', error);
        this.toastService.error('Erreur lors du chargement des boutiques');
        this.loading = false;
      }
    });
  }

  private mapBackendStoreToStore(backendStore: any): Store {
    return {
      id: backendStore.id,
      name: backendStore.business_name || backendStore.name,
      slug: backendStore.slug || backendStore.id,
      description: backendStore.description || '',
      logo: backendStore.logo,
      banner: backendStore.banner,
      owner: {
        id: backendStore.owner_id || '',
        name: backendStore.vendor_name || '',
        email: backendStore.email || ''
      },
      status: this.mapBackendStatusToStatus(backendStore.status),
      isVerified: backendStore.is_verified || false,
      isFeatured: backendStore.is_featured || false,
      rating: backendStore.rating || 0,
      totalReviews: backendStore.total_reviews || 0,
      totalProducts: backendStore.total_products || 0,
      totalSales: backendStore.total_sales || 0,
      revenue: backendStore.revenue || 0,
      address: {
        street: backendStore.address || '',
        city: backendStore.city || '',
        country: backendStore.country || '',
        postalCode: backendStore.postal_code || ''
      },
      contact: {
        phone: backendStore.phone || '',
        email: backendStore.email || '',
        website: backendStore.website
      },
      settings: {
        currency: backendStore.currency || 'XOF',
        language: backendStore.language || 'fr',
        timezone: backendStore.timezone || 'Africa/Lome'
      },
      createdAt: new Date(backendStore.submitted_at || backendStore.created_at),
      updatedAt: new Date(backendStore.updated_at || backendStore.created_at)
    };
  }

  private mapBackendStatusToStatus(backendStatus: string): 'pending' | 'active' | 'suspended' | 'rejected' {
    const status = (backendStatus || '').toLowerCase();
    if (status === 'active' || status === 'approved') return 'active';
    if (status === 'suspended') return 'suspended';
    if (status === 'rejected') return 'rejected';
    return 'pending';
  }

  private generateMockStores(): Store[] {
    const stores: Store[] = [];
    const statuses: Store['status'][] = ['active', 'pending', 'suspended', 'rejected'];
    const cities = ['Lomé', 'Kara', 'Sokodé', 'Kpalimé', 'Atakpamé'];
    const countries = ['Togo', 'Ghana', 'Bénin', 'Burkina Faso'];
    
    for (let i = 1; i <= 50; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const country = countries[Math.floor(Math.random() * countries.length)];
      
      stores.push({
        id: `store-${i}`,
        name: `Boutique ${i}`,
        slug: `boutique-${i}`,
        description: `Description de la boutique ${i} spécialisée dans la mode africaine`,
        logo: Math.random() > 0.3 ? `https://via.placeholder.com/50x50?text=B${i}` : undefined,
        banner: Math.random() > 0.5 ? `https://via.placeholder.com/300x100?text=Banner${i}` : undefined,
        owner: {
          id: `owner-${i}`,
          name: `Propriétaire ${i}`,
          email: `owner${i}@example.com`
        },
        status,
        isVerified: Math.random() > 0.4,
        isFeatured: Math.random() > 0.8,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        totalReviews: Math.floor(Math.random() * 100),
        totalProducts: Math.floor(Math.random() * 200) + 10,
        totalSales: Math.floor(Math.random() * 1000) + 50,
        revenue: Math.floor(Math.random() * 50000) + 5000,
        address: {
          street: `Rue ${i}`,
          city,
          country,
          postalCode: `${Math.floor(Math.random() * 90000) + 10000}`
        },
        contact: {
          phone: `+228${Math.floor(Math.random() * 90000000) + 10000000}`,
          email: `contact${i}@boutique${i}.com`,
          website: Math.random() > 0.5 ? `https://boutique${i}.com` : undefined
        },
        settings: {
          currency: 'XOF',
          language: 'fr',
          timezone: 'Africa/Lome'
        },
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      });
    }
    
    return stores;
  }

  private calculateStats(): void {
    this.storeStats = {
      total: this.stores.length,
      active: this.stores.filter(s => s.status === 'active').length,
      pending: this.stores.filter(s => s.status === 'pending').length,
      suspended: this.stores.filter(s => s.status === 'suspended').length,
      verified: this.stores.filter(s => s.isVerified).length,
      featured: this.stores.filter(s => s.isFeatured).length,
      totalRevenue: this.stores.reduce((sum, s) => sum + s.revenue, 0),
      totalProducts: this.stores.reduce((sum, s) => sum + s.totalProducts, 0)
    };
  }

  applyFilters(): void {
    this.filteredStores = this.stores.filter(store => {
      const matchesSearch = !this.searchTerm || 
        store.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        store.owner.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        store.address.city.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || store.status === this.selectedStatus;
      
      const matchesVerification = !this.selectedVerification || 
        (this.selectedVerification === 'verified' && store.isVerified) ||
        (this.selectedVerification === 'unverified' && !store.isVerified);
      
      return matchesSearch && matchesStatus && matchesVerification;
    });
    
    this.totalStores = this.filteredStores.length;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedVerification = '';
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
      this.filteredStores.forEach(store => this.selection.add(store));
    }
  }

  isAllSelected(): boolean {
    return this.selection.size === this.filteredStores.length;
  }

  hasValue(): boolean {
    return this.selection.size > 0;
  }

  toggle(store: Store): void {
    if (this.selection.has(store)) {
      this.selection.delete(store);
    } else {
      this.selection.add(store);
    }
  }

  isSelected(store: Store): boolean {
    return this.selection.has(store);
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Actif',
      'pending': 'En attente',
      'suspended': 'Suspendu',
      'rejected': 'Rejeté'
    };
    return labels[status] || status;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(value);
  }

  openAddStoreDialog(): void {
    console.log('Ouvrir dialog ajout boutique');
  }

  viewStore(store: Store): void {
    console.log('Voir boutique:', store);
  }

  editStore(store: Store): void {
    console.log('Modifier boutique:', store);
  }

  toggleStoreStatus(store: Store): void {
    console.log('Changer statut boutique:', store);
  }

  toggleVerification(store: Store): void {
    console.log('Changer vérification boutique:', store);
  }

  viewStoreAnalytics(store: Store): void {
    console.log('Voir analytics boutique:', store);
  }

  deleteStore(store: Store): void {
    console.log('Supprimer boutique:', store);
  }
}




































