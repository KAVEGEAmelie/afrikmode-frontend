// src/app/features/admin/pages/products/products-moderation.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-products-moderation',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon>gavel</mat-icon>
          Modération Produits
        </h1>
        <mat-chip highlighted color="warn">15 en attente</mat-chip>
      </div>

      <div class="products-grid">
        <mat-card class="product-card" *ngFor="let product of products">
          <div class="product-image">
            <mat-icon>image</mat-icon>
          </div>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="price">{{ product.price }} €</p>
            <p class="vendor">{{ product.vendor }}</p>
          </div>
          <div class="product-actions">
            <button mat-raised-button color="primary">
              <mat-icon>check</mat-icon>
              Approuver
            </button>
            <button mat-stroked-button color="warn">
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
  `]
})
export class ProductsModerationComponent {
  products = [
    { name: 'Robe Africaine', price: '49.99', vendor: 'Boutique A' },
    { name: 'Chemise Wax', price: '35.00', vendor: 'Boutique B' },
    { name: 'Sac à Main', price: '28.50', vendor: 'Boutique C' }
  ];
}
