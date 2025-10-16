import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface TopProduct {
  name: string;
  value: string | number;
  status?: 'normal' | 'low-stock' | 'out-of-stock';
  trend?: 'up' | 'down' | 'stable';
}

@Component({
  selector: 'app-top-products',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="top-products-container">
      <div class="top-products-header">
        <h3 class="top-products-title">{{ title }}</h3>
      </div>
      <div class="top-products-content">
        @for (product of products; track product.name; let i = $index) {
          <div class="product-item">
            <div class="product-rank">{{ i + 1 }}</div>
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-value">{{ product.value }}</div>
            </div>
            @if (product.status) {
              <div class="product-status" [ngClass]="'status-' + product.status">
                <mat-icon>{{ getStatusIcon(product.status) }}</mat-icon>
                <span>{{ getStatusText(product.status) }}</span>
              </div>
            }
            @if (product.trend) {
              <div class="product-trend" [ngClass]="'trend-' + product.trend">
                <mat-icon>{{ getTrendIcon(product.trend) }}</mat-icon>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./top-products.component.scss']
})
export class TopProductsComponent {
  @Input() title: string = '';
  @Input() products: TopProduct[] = [];

  getStatusIcon(status: string): string {
    switch (status) {
      case 'low-stock': return 'warning';
      case 'out-of-stock': return 'error';
      default: return 'check_circle';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'low-stock': return 'Stock Faible';
      case 'out-of-stock': return 'Non disponible';
      default: return 'Disponible';
    }
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      default: return 'trending_flat';
    }
  }
}