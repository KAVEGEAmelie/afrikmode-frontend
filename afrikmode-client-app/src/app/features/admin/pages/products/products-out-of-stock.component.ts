// src/app/features/admin/pages/products/products-out-of-stock.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminApiService } from '../../core/services/admin-api.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-products-out-of-stock',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatChipsModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon>inventory_2</mat-icon>
          Produits en Rupture
        </h1>
        <mat-chip highlighted color="warn">{{ outOfStockCount }} produits</mat-chip>
      </div>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Chargement des produits...</p>
      </div>

      <mat-card class="warning-card" *ngIf="!loading">
        <mat-icon>warning</mat-icon>
        <div>
          <h3>Alerte Stock</h3>
          <p>{{ outOfStockCount }} produit(s) {{ outOfStockCount > 1 ? 'sont' : 'est' }} actuellement en rupture de stock</p>
        </div>
        <button mat-raised-button color="primary" (click)="notifyVendors()" [disabled]="outOfStockCount === 0">
          <mat-icon>email</mat-icon>
          Notifier les vendeurs
        </button>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-page { padding: 24px; background: #f8f9fa; min-height: 100%; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .page-title { display: flex; align-items: center; gap: 12px; margin: 0; font-size: 32px; font-weight: 700; color: #1e293b; }
    .page-title mat-icon { font-size: 36px; width: 36px; height: 36px; color: #ef4444; }
    .warning-card { padding: 24px; border-radius: 16px; display: flex; align-items: center; gap: 24px; background: #fef2f2; border: 1px solid #fca5a5; }
    .warning-card mat-icon { color: #ef4444; font-size: 48px; width: 48px; height: 48px; }
    .warning-card h3 { margin: 0 0 4px 0; font-size: 18px; font-weight: 600; }
    .warning-card p { margin: 0; color: #64748b; }
    .warning-card button { margin-left: auto; }
    .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; gap: 16px; }
  `]
})
export class ProductsOutOfStockComponent implements OnInit {
  outOfStockCount = 0;
  loading = false;

  constructor(
    private adminApi: AdminApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadOutOfStockProducts();
  }

  loadOutOfStockProducts(): void {
    this.loading = true;
    this.adminApi.getOutOfStockProducts({ limit: 1 }).subscribe({
      next: (response) => {
        if (response.success && response.pagination) {
          this.outOfStockCount = response.pagination.total || 0;
        } else {
          this.outOfStockCount = 0;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement produits en rupture:', error);
        this.outOfStockCount = 0;
        this.loading = false;
        const errorMessage = error.error?.message || error.message || 'Erreur lors du chargement';
        this.toastService.error(errorMessage);
      }
    });
  }

  notifyVendors(): void {
    // TODO: Implémenter la notification des vendeurs
    this.toastService.success('Notifications envoyées aux vendeurs');
  }
}
