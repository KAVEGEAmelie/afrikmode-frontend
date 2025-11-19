// src/app/features/admin/pages/products/products-moderation.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminApiService } from '../../core/services/admin-api.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-products-moderation',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon>gavel</mat-icon>
          Modération Produits
        </h1>
        <mat-chip highlighted color="warn">{{ products.length }} en attente</mat-chip>
      </div>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Chargement des produits...</p>
      </div>

      <div *ngIf="!loading && products.length === 0" class="empty-state">
        <mat-icon>check_circle</mat-icon>
        <p>Aucun produit en attente de modération</p>
      </div>

      <div class="products-grid" *ngIf="!loading && products.length > 0">
        <mat-card class="product-card" *ngFor="let product of products">
          <div class="product-image">
            <img *ngIf="product.primary_image" [src]="product.primary_image" [alt]="product.name">
            <mat-icon *ngIf="!product.primary_image">image</mat-icon>
          </div>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="price">{{ formatCurrency(product.price) }}</p>
            <p class="vendor">{{ product.store_name }}</p>
          </div>
          <div class="product-actions">
            <button mat-raised-button color="primary" (click)="approveProduct(product)" [disabled]="processing">
              <mat-icon>check</mat-icon>
              Approuver
            </button>
            <button mat-stroked-button color="warn" (click)="rejectProduct(product)" [disabled]="processing">
              <mat-icon>close</mat-icon>
              Rejeter
            </button>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .admin-page { padding: 24px; background: #f8f9fa; min-height: 100%; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .page-title { display: flex; align-items: center; gap: 12px; margin: 0; font-size: 32px; font-weight: 700; color: #1e293b; }
    .page-title mat-icon { font-size: 36px; width: 36px; height: 36px; color: #f59e0b; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
    .product-card { padding: 0; overflow: hidden; border-radius: 16px; }
    .product-image { width: 100%; height: 200px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; }
    .product-image mat-icon { font-size: 64px; width: 64px; height: 64px; color: #94a3b8; }
    .product-info { padding: 16px; }
    .product-info h3 { margin: 0 0 8px 0; font-size: 16px; font-weight: 600; }
    .product-info .price { margin: 0 0 4px 0; font-size: 20px; font-weight: 700; color: #3b82f6; }
    .product-info .vendor { margin: 0; font-size: 13px; color: #64748b; }
    .product-actions { display: flex; gap: 8px; padding: 16px; border-top: 1px solid #e2e8f0; }
    .product-actions button { flex: 1; }
    .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; gap: 16px; }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; gap: 16px; color: #64748b; }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; color: #10b981; }
    .product-image img { width: 100%; height: 200px; object-fit: cover; }
  `]
})
export class ProductsModerationComponent implements OnInit {
  products: any[] = [];
  loading = false;
  processing = false;

  constructor(
    private adminApi: AdminApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadPendingProducts();
  }

  loadPendingProducts(): void {
    this.loading = true;
    this.adminApi.getPendingProducts({ limit: 100 }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.products = Array.isArray(response.data) ? response.data : [];
        } else {
          this.products = [];
          this.toastService.error(response.message || 'Erreur lors du chargement des produits');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement produits en attente:', error);
        this.products = [];
        this.loading = false;
        const errorMessage = error.error?.message || error.message || 'Erreur lors du chargement des produits';
        this.toastService.error(errorMessage);
      }
    });
  }

  approveProduct(product: any): void {
    this.processing = true;
    this.adminApi.updateProductStatus(product.id, 'active').subscribe({
      next: () => {
        this.toastService.success('Produit approuvé avec succès');
        this.loadPendingProducts();
        this.processing = false;
      },
      error: (error) => {
        console.error('Erreur approbation produit:', error);
        const errorMessage = error.error?.message || error.message || 'Erreur lors de l\'approbation';
        this.toastService.error(errorMessage);
        this.processing = false;
      }
    });
  }

  rejectProduct(product: any): void {
    if (!confirm(`Êtes-vous sûr de vouloir rejeter le produit "${product.name}" ?`)) {
      return;
    }
    this.processing = true;
    this.adminApi.updateProductStatus(product.id, 'inactive').subscribe({
      next: () => {
        this.toastService.success('Produit rejeté');
        this.loadPendingProducts();
        this.processing = false;
      },
      error: (error) => {
        console.error('Erreur rejet produit:', error);
        const errorMessage = error.error?.message || error.message || 'Erreur lors du rejet';
        this.toastService.error(errorMessage);
        this.processing = false;
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(value);
  }
}
