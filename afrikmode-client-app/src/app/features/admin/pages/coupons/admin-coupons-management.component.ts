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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  isPublic: boolean;
  applicableTo: 'all' | 'category' | 'product' | 'store';
  applicableItems: string[];
  validFrom: Date;
  validUntil: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: {
    id: string;
    name: string;
  };
}

export interface CouponStats {
  total: number;
  active: number;
  expired: number;
  used: number;
  totalSavings: number;
  totalUsage: number;
}

@Component({
  selector: 'app-admin-coupons-management',
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
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="coupons-management">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>Gestion des Coupons</h1>
          <p>Créez et gérez les codes de réduction et promotions</p>
        </div>
        <div class="header-right">
          <button mat-raised-button color="accent" (click)="exportCoupons()">
            <mat-icon>download</mat-icon>
            Exporter
          </button>
          <button mat-raised-button color="primary" (click)="createCoupon()">
            <mat-icon>add</mat-icon>
            Nouveau coupon
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-cards">
        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <mat-icon>local_offer</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ couponStats.total }}</div>
              <div class="stat-label">Total coupons</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon active">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ couponStats.active }}</div>
              <div class="stat-label">Actifs</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon expired">
              <mat-icon>schedule</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ couponStats.expired }}</div>
              <div class="stat-label">Expirés</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon used">
              <mat-icon>shopping_cart</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ couponStats.used }}</div>
              <div class="stat-label">Utilisés</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon savings">
              <mat-icon>savings</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatCurrency(couponStats.totalSavings) }}</div>
              <div class="stat-label">Économies totales</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon usage">
              <mat-icon>trending_up</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ couponStats.totalUsage }}</div>
              <div class="stat-label">Utilisations totales</div>
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
              <input matInput [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="Code, nom, description...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="type-field">
              <mat-label>Type</mat-label>
              <mat-select [(ngModel)]="selectedType" (selectionChange)="applyFilters()">
                <mat-option value="">Tous les types</mat-option>
                <mat-option value="percentage">Pourcentage</mat-option>
                <mat-option value="fixed">Montant fixe</mat-option>
                <mat-option value="free_shipping">Livraison gratuite</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="status-field">
              <mat-label>Statut</mat-label>
              <mat-select [(ngModel)]="selectedStatus" (selectionChange)="applyFilters()">
                <mat-option value="">Tous les statuts</mat-option>
                <mat-option value="active">Actif</mat-option>
                <mat-option value="inactive">Inactif</mat-option>
                <mat-option value="expired">Expiré</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="applicable-field">
              <mat-label>Applicable à</mat-label>
              <mat-select [(ngModel)]="selectedApplicable" (selectionChange)="applyFilters()">
                <mat-option value="">Tous</mat-option>
                <mat-option value="all">Tous les produits</mat-option>
                <mat-option value="category">Catégorie</mat-option>
                <mat-option value="product">Produit</mat-option>
                <mat-option value="store">Boutique</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-button (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
              Effacer
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Coupons Table -->
      <mat-card class="table-card">
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="filteredCoupons" matSort class="coupons-table">
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

              <!-- Code Column -->
              <ng-container matColumnDef="code">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Code</th>
                <td mat-cell *matCellDef="let coupon">
                  <div class="coupon-code">
                    <div class="code-text">{{ coupon.code }}</div>
                    <div class="code-copy" (click)="copyCode(coupon.code)">
                      <mat-icon>content_copy</mat-icon>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Nom</th>
                <td mat-cell *matCellDef="let coupon">
                  <div class="coupon-info">
                    <div class="coupon-name">{{ coupon.name }}</div>
                    <div class="coupon-description">{{ coupon.description }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Type Column -->
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
                <td mat-cell *matCellDef="let coupon">
                  <mat-chip [ngClass]="'type-' + coupon.type">
                    {{ getTypeLabel(coupon.type) }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Value Column -->
              <ng-container matColumnDef="value">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Valeur</th>
                <td mat-cell *matCellDef="let coupon">
                  <div class="coupon-value">
                    <div class="value-amount">{{ formatCouponValue(coupon) }}</div>
                    @if (coupon.minOrderAmount) {
                      <div class="value-conditions">
                        Min: {{ formatCurrency(coupon.minOrderAmount) }}
                      </div>
                    }
                  </div>
                </td>
              </ng-container>

              <!-- Usage Column -->
              <ng-container matColumnDef="usage">
                <th mat-header-cell *matHeaderCellDef>Utilisation</th>
                <td mat-cell *matCellDef="let coupon">
                  <div class="usage-info">
                    <div class="usage-count">{{ coupon.usedCount }}/{{ coupon.usageLimit || '∞' }}</div>
                    @if (coupon.usageLimit) {
                      <div class="usage-progress">
                        <div class="progress-bar">
                          <div class="progress-fill" [style.width.%]="(coupon.usedCount / coupon.usageLimit) * 100"></div>
                        </div>
                      </div>
                    }
                  </div>
                </td>
              </ng-container>

              <!-- Validity Column -->
              <ng-container matColumnDef="validity">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Validité</th>
                <td mat-cell *matCellDef="let coupon">
                  <div class="validity-info">
                    <div class="validity-dates">
                      Du {{ coupon.validFrom | date:'short' }}
                    </div>
                    <div class="validity-dates">
                      Au {{ coupon.validUntil | date:'short' }}
                    </div>
                    <div class="validity-status" [ngClass]="getValidityClass(coupon)">
                      {{ getValidityStatus(coupon) }}
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
                <td mat-cell *matCellDef="let coupon">
                  <div class="status-badges">
                    <mat-chip [ngClass]="'status-' + (coupon.isActive ? 'active' : 'inactive')">
                      {{ coupon.isActive ? 'Actif' : 'Inactif' }}
                    </mat-chip>
                    <mat-chip [ngClass]="'visibility-' + (coupon.isPublic ? 'public' : 'private')">
                      {{ coupon.isPublic ? 'Public' : 'Privé' }}
                    </mat-chip>
                  </div>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let coupon">
                  <button mat-icon-button [matMenuTriggerFor]="couponMenu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #couponMenu="matMenu">
                    <button mat-menu-item (click)="viewCoupon(coupon)">
                      <mat-icon>visibility</mat-icon>
                      <span>Voir détails</span>
                    </button>
                    <button mat-menu-item (click)="editCoupon(coupon)">
                      <mat-icon>edit</mat-icon>
                      <span>Modifier</span>
                    </button>
                    <button mat-menu-item (click)="duplicateCoupon(coupon)">
                      <mat-icon>content_copy</mat-icon>
                      <span>Dupliquer</span>
                    </button>
                    <button mat-menu-item (click)="toggleStatus(coupon)">
                      <mat-icon>{{ coupon.isActive ? 'block' : 'check_circle' }}</mat-icon>
                      <span>{{ coupon.isActive ? 'Désactiver' : 'Activer' }}</span>
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item (click)="viewUsage(coupon)">
                      <mat-icon>analytics</mat-icon>
                      <span>Voir utilisation</span>
                    </button>
                    <button mat-menu-item (click)="deleteCoupon(coupon)" class="danger">
                      <mat-icon>delete</mat-icon>
                      <span>Supprimer</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                  (click)="viewCoupon(row)" class="clickable-row"></tr>
            </table>

            <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]" 
                           showFirstLastButtons
                           [length]="totalCoupons"
                           [pageSize]="pageSize"
                           (page)="onPageChange($event)">
            </mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./admin-coupons-management.component.scss']
})
export class AdminCouponsManagementComponent implements OnInit {
  displayedColumns: string[] = ['select', 'code', 'name', 'type', 'value', 'usage', 'validity', 'status', 'actions'];
  coupons: Coupon[] = [];
  filteredCoupons: Coupon[] = [];
  couponStats: CouponStats = {
    total: 0,
    active: 0,
    expired: 0,
    used: 0,
    totalSavings: 0,
    totalUsage: 0
  };

  // Filters
  searchTerm: string = '';
  selectedType: string = '';
  selectedStatus: string = '';
  selectedApplicable: string = '';

  // Pagination
  pageSize: number = 25;
  totalCoupons: number = 0;
  currentPage: number = 0;

  // Selection
  selection = new Set<Coupon>();

  loading = true;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadCoupons();
  }

  private loadCoupons(): void {
    this.loading = true;
    
    setTimeout(() => {
      this.coupons = this.generateMockCoupons();
      this.filteredCoupons = [...this.coupons];
      this.calculateStats();
      this.loading = false;
    }, 1000);
  }

  private generateMockCoupons(): Coupon[] {
    const coupons: Coupon[] = [];
    const types: Coupon['type'][] = ['percentage', 'fixed', 'free_shipping'];
    const applicableTo: Coupon['applicableTo'][] = ['all', 'category', 'product', 'store'];
    const creators = [
      { id: 'admin-1', name: 'Admin Principal' },
      { id: 'admin-2', name: 'Admin Marketing' },
      { id: 'manager-1', name: 'Manager Ventes' }
    ];
    
    for (let i = 1; i <= 50; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const applicable = applicableTo[Math.floor(Math.random() * applicableTo.length)];
      const creator = creators[Math.floor(Math.random() * creators.length)];
      const isActive = Math.random() > 0.2;
      const isPublic = Math.random() > 0.3;
      
      const validFrom = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
      const validUntil = new Date(validFrom.getTime() + (Math.random() * 60 + 30) * 24 * 60 * 60 * 1000);
      const isExpired = validUntil < new Date();
      
      coupons.push({
        id: `coupon-${i}`,
        code: `AFRIK${String(i).padStart(4, '0')}`,
        name: `Coupon ${i}`,
        description: `Description du coupon ${i}`,
        type,
        value: type === 'percentage' ? Math.floor(Math.random() * 50) + 5 : Math.floor(Math.random() * 10000) + 1000,
        minOrderAmount: Math.random() > 0.5 ? Math.floor(Math.random() * 50000) + 10000 : undefined,
        maxDiscountAmount: type === 'percentage' ? Math.floor(Math.random() * 20000) + 5000 : undefined,
        usageLimit: Math.random() > 0.3 ? Math.floor(Math.random() * 1000) + 100 : undefined,
        usedCount: Math.floor(Math.random() * 50),
        isActive: isActive && !isExpired,
        isPublic,
        applicableTo: applicable,
        applicableItems: applicable !== 'all' ? [`item-${i}`] : [],
        validFrom,
        validUntil,
        createdAt: validFrom,
        updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        createdBy: creator
      });
    }
    
    return coupons.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  private calculateStats(): void {
    const now = new Date();
    this.couponStats = {
      total: this.coupons.length,
      active: this.coupons.filter(c => c.isActive && c.validUntil > now).length,
      expired: this.coupons.filter(c => c.validUntil <= now).length,
      used: this.coupons.filter(c => c.usedCount > 0).length,
      totalSavings: this.coupons.reduce((sum, c) => sum + (c.usedCount * c.value), 0),
      totalUsage: this.coupons.reduce((sum, c) => sum + c.usedCount, 0)
    };
  }

  applyFilters(): void {
    this.filteredCoupons = this.coupons.filter(coupon => {
      const matchesSearch = !this.searchTerm || 
        coupon.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        coupon.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        coupon.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesType = !this.selectedType || coupon.type === this.selectedType;
      
      const now = new Date();
      let matchesStatus = true;
      if (this.selectedStatus === 'active') {
        matchesStatus = coupon.isActive && coupon.validUntil > now;
      } else if (this.selectedStatus === 'inactive') {
        matchesStatus = !coupon.isActive;
      } else if (this.selectedStatus === 'expired') {
        matchesStatus = coupon.validUntil <= now;
      }
      
      const matchesApplicable = !this.selectedApplicable || coupon.applicableTo === this.selectedApplicable;
      
      return matchesSearch && matchesType && matchesStatus && matchesApplicable;
    });
    
    this.totalCoupons = this.filteredCoupons.length;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedStatus = '';
    this.selectedApplicable = '';
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
      this.filteredCoupons.forEach(coupon => this.selection.add(coupon));
    }
  }

  isAllSelected(): boolean {
    return this.selection.size === this.filteredCoupons.length;
  }

  hasValue(): boolean {
    return this.selection.size > 0;
  }

  toggle(coupon: Coupon): void {
    if (this.selection.has(coupon)) {
      this.selection.delete(coupon);
    } else {
      this.selection.add(coupon);
    }
  }

  isSelected(coupon: Coupon): boolean {
    return this.selection.has(coupon);
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'percentage': 'Pourcentage',
      'fixed': 'Montant fixe',
      'free_shipping': 'Livraison gratuite'
    };
    return labels[type] || type;
  }

  formatCouponValue(coupon: Coupon): string {
    if (coupon.type === 'percentage') {
      return `${coupon.value}%`;
    } else if (coupon.type === 'fixed') {
      return this.formatCurrency(coupon.value);
    } else {
      return 'Livraison gratuite';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(value);
  }

  getValidityClass(coupon: Coupon): string {
    const now = new Date();
    if (coupon.validUntil <= now) return 'expired';
    if (coupon.validFrom > now) return 'future';
    return 'valid';
  }

  getValidityStatus(coupon: Coupon): string {
    const now = new Date();
    if (coupon.validUntil <= now) return 'Expiré';
    if (coupon.validFrom > now) return 'À venir';
    return 'Valide';
  }

  copyCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      console.log('Code copié:', code);
    });
  }

  exportCoupons(): void {
    console.log('Exporter coupons');
  }

  createCoupon(): void {
    console.log('Créer nouveau coupon');
  }

  viewCoupon(coupon: Coupon): void {
    console.log('Voir coupon:', coupon);
  }

  editCoupon(coupon: Coupon): void {
    console.log('Modifier coupon:', coupon);
  }

  duplicateCoupon(coupon: Coupon): void {
    console.log('Dupliquer coupon:', coupon);
  }

  toggleStatus(coupon: Coupon): void {
    console.log('Changer statut coupon:', coupon);
  }

  viewUsage(coupon: Coupon): void {
    console.log('Voir utilisation coupon:', coupon);
  }

  deleteCoupon(coupon: Coupon): void {
    console.log('Supprimer coupon:', coupon);
  }
}
