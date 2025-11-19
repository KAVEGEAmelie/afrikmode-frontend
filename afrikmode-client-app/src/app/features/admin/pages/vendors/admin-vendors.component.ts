import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AdminApiService } from '../../core/services/admin-api.service';
import { ToastService } from '../../../../core/services/toast.service';
import { environment } from '../../../../../environments/environment';

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  store_name: string;
  store_logo?: string;
  status: 'active' | 'suspended' | 'warning' | 'banned';
  subscription_plan: 'basic' | 'pro' | 'premium';
  joined_date: string;
  last_active: string;
  stats: {
    total_products: number;
    total_sales: number;
    revenue: number;
    rating: number;
    total_reviews: number;
    response_rate: number;
  };
  warnings: Array<{
    date: string;
    reason: string;
    issued_by: string;
  }>;
  violations?: string[];
}

@Component({
  selector: 'app-admin-vendors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="vendors-page">
      <div class="page-header">
        <div class="header-content">
          <h1>Modération des Vendeurs</h1>
          <p class="subtitle">Gérez et modérez tous les vendeurs actifs de la plateforme</p>
        </div>
        <div class="stats-overview">
          <div class="stat-card active">
            <div class="stat-value">{{ getVendorsByStatus('active').length }}</div>
            <div class="stat-label">Actifs</div>
          </div>
          <div class="stat-card suspended">
            <div class="stat-value">{{ getVendorsByStatus('suspended').length }}</div>
            <div class="stat-label">Suspendus</div>
          </div>
          <div class="stat-card warning">
            <div class="stat-value">{{ getVendorsByStatus('warning').length }}</div>
            <div class="stat-label">Avertissements</div>
          </div>
        </div>
      </div>

      <div class="filters-bar">
        <div class="filter-group">
          <select [(ngModel)]="filterStatus" (change)="applyFilters()" class="filter-select">
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="suspended">Suspendus</option>
            <option value="warning">Avec avertissement</option>
            <option value="banned">Bannis</option>
          </select>
        </div>
        <div class="filter-group">
          <select [(ngModel)]="filterPlan" (change)="applyFilters()" class="filter-select">
            <option value="all">Tous les plans</option>
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        <div class="filter-group">
          <select [(ngModel)]="sortBy" (change)="applyFilters()" class="filter-select">
            <option value="name">Nom (A-Z)</option>
            <option value="revenue_desc">Revenus (↓)</option>
            <option value="sales_desc">Ventes (↓)</option>
            <option value="rating_desc">Note (↓)</option>
            <option value="date_desc">Plus récents</option>
          </select>
        </div>
        <div class="search-box">
          <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (input)="applyFilters()"
            placeholder="Rechercher un vendeur..."
            class="search-input"
          />
        </div>
      </div>

      <div class="vendors-grid" *ngIf="!isLoading">
        <div *ngFor="let vendor of filteredVendors" class="vendor-card" [class]="vendor.status">
          <div class="vendor-header">
            <div class="vendor-info">
              <div class="vendor-logo">
                <img *ngIf="vendor.store_logo" [src]="vendor.store_logo" [alt]="vendor.store_name">
                <span *ngIf="!vendor.store_logo">{{ vendor.store_name.charAt(0) }}</span>
              </div>
              <div class="vendor-details">
                <h3>{{ vendor.store_name }}</h3>
                <p class="vendor-name">{{ vendor.name }}</p>
                <div class="vendor-meta">
                  <span class="plan-badge" [class]="vendor.subscription_plan">{{ vendor.subscription_plan }}</span>
                  <span class="status-badge" [class]="vendor.status">{{ getStatusLabel(vendor.status) }}</span>
                </div>
              </div>
            </div>
            <div class="vendor-actions">
              <button class="btn-icon" (click)="viewVendorDetails(vendor)" title="Voir détails">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
              <button class="btn-icon" (click)="openActionsMenu(vendor)" title="Actions">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="vendor-stats">
            <div class="stat-item">
              <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              <div class="stat-content">
                <div class="stat-value">{{ vendor.stats.total_products }}</div>
                <div class="stat-label">Produits</div>
              </div>
            </div>
            <div class="stat-item">
              <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              <div class="stat-content">
                <div class="stat-value">{{ vendor.stats.total_sales }}</div>
                <div class="stat-label">Ventes</div>
              </div>
            </div>
            <div class="stat-item">
              <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div class="stat-content">
                <div class="stat-value">{{ formatCurrency(vendor.stats.revenue) }}</div>
                <div class="stat-label">Revenus</div>
              </div>
            </div>
            <div class="stat-item">
              <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
              </svg>
              <div class="stat-content">
                <div class="stat-value">{{ vendor.stats.rating.toFixed(1) }}</div>
                <div class="stat-label">Note ({{ vendor.stats.total_reviews }})</div>
              </div>
            </div>
          </div>

          <div *ngIf="vendor.warnings && vendor.warnings.length > 0" class="vendor-warnings">
            <div class="warning-header">
              <svg class="warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <span>{{ vendor.warnings.length }} avertissement(s)</span>
            </div>
          </div>

          <div class="vendor-footer">
            <div class="vendor-dates">
              <span>Inscrit {{ formatDate(vendor.joined_date) }}</span>
              <span class="separator">•</span>
              <span>Actif {{ formatDate(vendor.last_active) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-state">
        <p>Chargement des vendeurs...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && filteredVendors.length === 0" class="empty-state">
        <p>Aucun vendeur trouvé</p>
      </div>

      <!-- Modal Actions -->
      <div *ngIf="showActionsModal" class="modal-overlay" (click)="closeModals()">
        <div class="modal-content actions-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Actions pour {{ selectedVendor?.store_name }}</h3>
            <button class="btn-close" (click)="closeModals()">&times;</button>
          </div>
          <div class="modal-body">
            <button 
              class="action-btn warning-btn" 
              (click)="openWarningModal()"
              [disabled]="selectedVendor?.status === 'banned'"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <span>Envoyer un avertissement</span>
            </button>
            <button 
              class="action-btn suspend-btn" 
              (click)="openSuspendModal()"
              [disabled]="selectedVendor?.status === 'suspended' || selectedVendor?.status === 'banned'"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
              </svg>
              <span>Suspendre temporairement</span>
            </button>
            <button 
              class="action-btn reactivate-btn" 
              (click)="reactivateVendor()"
              [disabled]="selectedVendor?.status === 'active'"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Réactiver le compte</span>
            </button>
            <button 
              class="action-btn ban-btn" 
              (click)="openBanModal()"
              [disabled]="selectedVendor?.status === 'banned'"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
              </svg>
              <span>Bannir définitivement</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Avertissement -->
      <div *ngIf="showWarningModal" class="modal-overlay" (click)="closeModals()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Envoyer un avertissement</h3>
            <button class="btn-close" (click)="closeModals()">&times;</button>
          </div>
          <div class="modal-body">
            <p>Raison de l'avertissement <span class="required">*</span></p>
            <textarea 
              [(ngModel)]="warningReason" 
              class="modal-textarea"
              placeholder="Expliquez la raison de l'avertissement..."
              rows="5"
            ></textarea>
          </div>
          <div class="modal-footer">
            <button class="btn btn-cancel" (click)="closeModals()">Annuler</button>
            <button class="btn btn-warning" (click)="sendWarning()" [disabled]="!warningReason">Envoyer</button>
          </div>
        </div>
      </div>

      <!-- Modal Suspension -->
      <div *ngIf="showSuspendModal" class="modal-overlay" (click)="closeModals()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Suspendre le compte</h3>
            <button class="btn-close" (click)="closeModals()">&times;</button>
          </div>
          <div class="modal-body">
            <p>Durée de la suspension</p>
            <select [(ngModel)]="suspensionDuration" class="modal-select">
              <option value="7">7 jours</option>
              <option value="14">14 jours</option>
              <option value="30">30 jours</option>
              <option value="90">90 jours</option>
            </select>
            <p style="margin-top: 1rem">Raison <span class="required">*</span></p>
            <textarea 
              [(ngModel)]="suspensionReason" 
              class="modal-textarea"
              placeholder="Raison de la suspension..."
              rows="4"
            ></textarea>
          </div>
          <div class="modal-footer">
            <button class="btn btn-cancel" (click)="closeModals()">Annuler</button>
            <button class="btn btn-suspend" (click)="suspendVendor()" [disabled]="!suspensionReason">Suspendre</button>
          </div>
        </div>
      </div>

      <!-- Modal Bannissement -->
      <div *ngIf="showBanModal" class="modal-overlay" (click)="closeModals()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Bannir définitivement</h3>
            <button class="btn-close" (click)="closeModals()">&times;</button>
          </div>
          <div class="modal-body">
            <p class="danger-text">⚠️ Cette action est définitive et ne peut pas être annulée.</p>
            <p>Raison <span class="required">*</span></p>
            <textarea 
              [(ngModel)]="banReason" 
              class="modal-textarea"
              placeholder="Raison du bannissement..."
              rows="5"
            ></textarea>
          </div>
          <div class="modal-footer">
            <button class="btn btn-cancel" (click)="closeModals()">Annuler</button>
            <button class="btn btn-danger" (click)="banVendor()" [disabled]="!banReason">Confirmer le bannissement</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./admin-vendors.component.scss']
})
export class AdminVendorsComponent implements OnInit {
  vendors: Vendor[] = [];
  filteredVendors: Vendor[] = [];
  selectedVendor: Vendor | null = null;

  filterStatus = 'all';
  filterPlan = 'all';
  sortBy = 'date_desc';
  searchQuery = '';

  showActionsModal = false;
  showWarningModal = false;
  showSuspendModal = false;
  showBanModal = false;

  warningReason = '';
  suspensionReason = '';
  suspensionDuration = '30';
  banReason = '';

  isLoading = false;

  constructor(
    private adminApi: AdminApiService,
    private http: HttpClient,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadVendors();
  }

  loadVendors() {
    this.isLoading = true;
    
    // Charger les boutiques actives (vendeurs) depuis l'API
    // Utiliser l'endpoint /api/admin/stores/requests avec status='active'
    let httpParams = new HttpParams();
    httpParams = httpParams.set('status', 'active');
    httpParams = httpParams.set('limit', '1000');
    httpParams = httpParams.set('sortBy', 'created_at');
    httpParams = httpParams.set('sortOrder', 'desc');
    
    this.http.get<any>(`${environment.apiUrl}/admin/stores/requests`, {
      headers: this.adminApi.getHeaders(),
      params: httpParams
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Fonction helper pour parser une date de manière sécurisée
          const parseDate = (dateValue: any): string => {
            if (!dateValue) {
              return new Date().toISOString().split('T')[0];
            }
            if (dateValue instanceof Date) {
              return isNaN(dateValue.getTime()) 
                ? new Date().toISOString().split('T')[0]
                : dateValue.toISOString().split('T')[0];
            }
            if (typeof dateValue === 'string') {
              const date = new Date(dateValue);
              return isNaN(date.getTime()) 
                ? new Date().toISOString().split('T')[0]
                : date.toISOString().split('T')[0];
            }
            return new Date().toISOString().split('T')[0];
          };

          // Transformer les données de stores en format Vendor
          this.vendors = (Array.isArray(response.data) ? response.data : []).map((store: any) => {
            return {
              id: store.id,
              name: store.vendor_name || store.business_name || 'Vendeur',
              email: store.email || '',
              phone: store.phone || '',
              store_name: store.business_name || store.name || 'Boutique sans nom',
              store_logo: undefined, // Logo non disponible dans cette réponse
              status: this.mapStoreStatusToVendorStatus(store.status),
              subscription_plan: 'basic' as const,
              joined_date: parseDate(store.submitted_at),
              last_active: parseDate(store.submitted_at),
              stats: {
                total_products: 0, // Non disponible dans cette réponse
                total_sales: 0,
                revenue: 0,
                rating: 0,
                total_reviews: 0,
                response_rate: 0
              },
              warnings: []
            };
          });
          
          this.applyFilters();
        } else {
          this.vendors = [];
          this.filteredVendors = [];
          this.toastService.error(response.message || 'Erreur lors du chargement des vendeurs');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement vendeurs:', error);
        this.vendors = [];
        this.filteredVendors = [];
        this.isLoading = false;
        const errorMessage = error.error?.message || error.message || 'Erreur lors du chargement des vendeurs';
        this.toastService.error(errorMessage);
      }
    });
  }

  mapStoreStatusToVendorStatus(storeStatus: string): 'active' | 'suspended' | 'warning' | 'banned' {
    switch (storeStatus) {
      case 'active':
        return 'active';
      case 'suspended':
        return 'suspended';
      case 'closed':
        return 'banned';
      case 'rejected':
        return 'banned';
      default:
        return 'active';
    }
  }

  // Méthode temporaire pour charger les données mockées (à supprimer)
  loadVendorsMock() {
    this.vendors = [
      {
        id: '1',
        name: 'Fatou Diallo',
        email: 'fatou@diallomode.sn',
        phone: '+221 77 123 45 67',
        store_name: 'Boutique Diallo Mode',
        status: 'active',
        subscription_plan: 'premium',
        joined_date: '2024-01-15',
        last_active: '2025-10-20',
        stats: {
          total_products: 245,
          total_sales: 1580,
          revenue: 45850000,
          rating: 4.8,
          total_reviews: 342,
          response_rate: 98
        },
        warnings: []
      },
      {
        id: '2',
        name: 'Kofi Mensah',
        email: 'kofi@kenteroyale.gh',
        phone: '+233 24 987 65 43',
        store_name: 'Kente Royale',
        status: 'warning',
        subscription_plan: 'pro',
        joined_date: '2024-03-22',
        last_active: '2025-10-19',
        stats: {
          total_products: 156,
          total_sales: 890,
          revenue: 28900000,
          rating: 4.3,
          total_reviews: 178,
          response_rate: 85
        },
        warnings: [
          {
            date: '2025-10-15',
            reason: 'Retards de livraison répétés',
            issued_by: 'Admin System'
          }
        ]
      },
      {
        id: '3',
        name: 'Aisha Njoroge',
        email: 'aisha@maasaistyle.ke',
        phone: '+254 71 234 56 78',
        store_name: 'Maasai Style',
        status: 'suspended',
        subscription_plan: 'basic',
        joined_date: '2024-06-10',
        last_active: '2025-10-05',
        stats: {
          total_products: 78,
          total_sales: 420,
          revenue: 12500000,
          rating: 3.9,
          total_reviews: 95,
          response_rate: 72
        },
        warnings: [
          {
            date: '2025-09-20',
            reason: 'Produits non conformes',
            issued_by: 'Admin System'
          },
          {
            date: '2025-10-01',
            reason: 'Violation des conditions de vente',
            issued_by: 'Admin System'
          }
        ]
      }
    ];
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.vendors];

    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(v => v.status === this.filterStatus);
    }

    if (this.filterPlan !== 'all') {
      filtered = filtered.filter(v => v.subscription_plan === this.filterPlan);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(v =>
        v.name.toLowerCase().includes(query) ||
        v.store_name.toLowerCase().includes(query) ||
        v.email.toLowerCase().includes(query)
      );
    }

    // Tri
    switch (this.sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'revenue_desc':
        filtered.sort((a, b) => b.stats.revenue - a.stats.revenue);
        break;
      case 'sales_desc':
        filtered.sort((a, b) => b.stats.total_sales - a.stats.total_sales);
        break;
      case 'rating_desc':
        filtered.sort((a, b) => b.stats.rating - a.stats.rating);
        break;
      case 'date_desc':
        filtered.sort((a, b) => new Date(b.joined_date).getTime() - new Date(a.joined_date).getTime());
        break;
    }

    this.filteredVendors = filtered;
  }

  getVendorsByStatus(status: string): Vendor[] {
    return this.vendors.filter(v => v.status === status);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'active': 'Actif',
      'suspended': 'Suspendu',
      'warning': 'Avertissement',
      'banned': 'Banni'
    };
    return labels[status] || status;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  viewVendorDetails(vendor: Vendor) {
    console.log('Voir détails vendeur:', vendor);
    // TODO: Naviguer vers page détails
  }

  openActionsMenu(vendor: Vendor) {
    this.selectedVendor = vendor;
    this.showActionsModal = true;
  }

  openWarningModal() {
    this.showActionsModal = false;
    this.showWarningModal = true;
    this.warningReason = '';
  }

  openSuspendModal() {
    this.showActionsModal = false;
    this.showSuspendModal = true;
    this.suspensionReason = '';
  }

  openBanModal() {
    this.showActionsModal = false;
    this.showBanModal = true;
    this.banReason = '';
  }

  closeModals() {
    this.showActionsModal = false;
    this.showWarningModal = false;
    this.showSuspendModal = false;
    this.showBanModal = false;
    this.warningReason = '';
    this.suspensionReason = '';
    this.banReason = '';
  }

  sendWarning() {
    if (this.selectedVendor && this.warningReason) {
      const warning = {
        date: new Date().toISOString(),
        reason: this.warningReason,
        issued_by: 'Admin User'
      };
      this.selectedVendor.warnings.push(warning);
      this.selectedVendor.status = 'warning';
      console.log('⚠️ Avertissement envoyé:', this.selectedVendor);
      this.closeModals();
      this.applyFilters();
    }
  }

  suspendVendor() {
    if (this.selectedVendor && this.suspensionReason) {
      this.selectedVendor.status = 'suspended';
      console.log(`🚫 Vendeur suspendu pour ${this.suspensionDuration} jours:`, this.selectedVendor);
      this.closeModals();
      this.applyFilters();
    }
  }

  reactivateVendor() {
    if (this.selectedVendor) {
      this.selectedVendor.status = 'active';
      console.log('✅ Vendeur réactivé:', this.selectedVendor);
      this.closeModals();
      this.applyFilters();
    }
  }

  banVendor() {
    if (this.selectedVendor && this.banReason) {
      this.selectedVendor.status = 'banned';
      console.log('❌ Vendeur banni:', this.selectedVendor);
      this.closeModals();
      this.applyFilters();
    }
  }
}
