import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { AdminService } from '../../../../core/services/admin.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ReportsService } from '../../core/services/reports.service';

@Component({
  selector: 'app-reports-inventory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    MatTabsModule
  ],
  template: `
    <div class="reports-inventory-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>
            <mat-icon>inventory</mat-icon>
            Rapport d'Inventaire
          </h1>
          <p class="subtitle">État des stocks et niveaux d'inventaire</p>
        </div>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <form [formGroup]="filterForm" class="filters-form">
            <mat-form-field appearance="outline">
              <mat-label>Format d'export</mat-label>
              <mat-select formControlName="format">
                <mat-option value="pdf">PDF</mat-option>
                <mat-option value="excel">Excel</mat-option>
                <mat-option value="csv">CSV</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Filtre par statut</mat-label>
              <mat-select formControlName="statusFilter">
                <mat-option value="">Tous</mat-option>
                <mat-option value="in_stock">En stock</mat-option>
                <mat-option value="low_stock">Stock faible</mat-option>
                <mat-option value="out_of_stock">Rupture de stock</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button color="primary" (click)="loadInventoryData()" [disabled]="loading">
                <mat-icon>refresh</mat-icon>
                Actualiser
              </button>
              <button mat-raised-button color="accent" (click)="generateReport()" [disabled]="loading">
                <mat-icon>download</mat-icon>
                Générer & Télécharger
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Loading -->
      @if (loading) {
        <div class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Chargement des données...</p>
        </div>
      }

      <!-- Inventory Stats -->
      @if (!loading) {
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon total">
                <mat-icon>inventory_2</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ inventoryStats.totalProducts }}</h3>
                <p>Produits totaux</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon in-stock">
                <mat-icon>check_circle</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ inventoryStats.inStock }}</h3>
                <p>En stock</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon low-stock">
                <mat-icon>warning</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ inventoryStats.lowStock }}</h3>
                <p>Stock faible</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon out-of-stock">
                <mat-icon>cancel</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ inventoryStats.outOfStock }}</h3>
                <p>Rupture de stock</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Products Table -->
        <mat-card class="products-card">
          <mat-card-header>
            <mat-card-title>Détails des produits</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="productsData" class="mat-elevation-z0">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Produit</th>
                <td mat-cell *matCellDef="let product">{{ product.name }}</td>
              </ng-container>
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef>Catégorie</th>
                <td mat-cell *matCellDef="let product">{{ product.category }}</td>
              </ng-container>
              <ng-container matColumnDef="stock">
                <th mat-header-cell *matHeaderCellDef>Stock</th>
                <td mat-cell *matCellDef="let product">{{ product.stock }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let product">
                  <mat-chip [color]="getStockStatusColor(product.status)">
                    {{ getStockStatusLabel(product.status) }}
                  </mat-chip>
                </td>
              </ng-container>
              <ng-container matColumnDef="value">
                <th mat-header-cell *matHeaderCellDef>Valeur</th>
                <td mat-cell *matCellDef="let product">{{ formatCurrency(product.value) }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .reports-inventory-page {
      padding: 24px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .page-header {
      margin-bottom: 24px;
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .page-header h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
    }

    .page-header h1 mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #3b82f6;
    }

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-form {
      display: flex;
      gap: 16px;
      align-items: flex-end;
      flex-wrap: wrap;
    }

    .filters-form mat-form-field {
      flex: 1;
      min-width: 200px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      gap: 16px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 24px !important;
    }

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .stat-icon.total {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
    }

    .stat-icon.in-stock {
      background: linear-gradient(135deg, #10b981, #059669);
    }

    .stat-icon.low-stock {
      background: linear-gradient(135deg, #f59e0b, #d97706);
    }

    .stat-icon.out-of-stock {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    .stat-info h3 {
      margin: 0 0 4px 0;
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }

    .stat-info p {
      margin: 0;
      color: #64748b;
      font-size: 14px;
    }

    .products-card {
      margin-top: 24px;
    }

    table {
      width: 100%;
    }
  `]
})
export class ReportsInventoryComponent implements OnInit {
  filterForm: FormGroup;
  loading = false;
  inventoryStats = {
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0
  };
  productsData: any[] = [];
  displayedColumns = ['name', 'category', 'stock', 'status', 'value'];

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private reportsService: ReportsService,
    private toastService: ToastService
  ) {
    this.filterForm = this.fb.group({
      format: ['pdf'],
      statusFilter: ['']
    });
  }

  ngOnInit(): void {
    this.loadInventoryData();
  }

  loadInventoryData(): void {
    this.loading = true;
    // TODO: Appeler l'API pour récupérer les données d'inventaire
    // Pour l'instant, on simule les données
    setTimeout(() => {
      this.inventoryStats = {
        totalProducts: 1250,
        inStock: 980,
        lowStock: 150,
        outOfStock: 120
      };
      this.productsData = [
        { name: 'Produit A', category: 'Mode', stock: 45, status: 'in_stock', value: 125000 },
        { name: 'Produit B', category: 'Accessoires', stock: 5, status: 'low_stock', value: 35000 },
        { name: 'Produit C', category: 'Mode', stock: 0, status: 'out_of_stock', value: 0 }
      ];
      this.loading = false;
    }, 1000);
  }

  generateReport(): void {
    const format = this.filterForm.value.format;
    this.toastService.info(`Génération du rapport d'inventaire en format ${format.toUpperCase()}...`);
    // TODO: Implémenter la génération du rapport
  }

  getStockStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'in_stock': 'En stock',
      'low_stock': 'Stock faible',
      'out_of_stock': 'Rupture'
    };
    return labels[status] || status;
  }

  getStockStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'in_stock': 'primary',
      'low_stock': 'accent',
      'out_of_stock': 'warn'
    };
    return colors[status] || 'primary';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  }
}

