// Admin Orders Shipped Component
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-orders-shipped',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon>local_shipping</mat-icon>
          Commandes Expédiées
        </h1>
        <p class="page-subtitle">Commandes en cours de livraison</p>
      </div>

      <mat-card class="stats-card">
        <div class="stats-grid">
          <div class="stat-item">
            <mat-icon class="stat-icon primary">local_shipping</mat-icon>
            <div class="stat-details">
              <div class="stat-value">123</div>
              <div class="stat-label">Expédiées</div>
            </div>
          </div>
        </div>
      </mat-card>

      <mat-card class="content-card">
        <p class="info-text">
          <mat-icon>info</mat-icon>
          123 commandes actuellement en transit vers les clients
        </p>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-page { padding: 24px; background: #f8f9fa; min-height: 100vh; }
    .page-header { margin-bottom: 24px; }
    .page-title { display: flex; align-items: center; gap: 12px; margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #1e293b; }
    .page-title mat-icon { font-size: 36px; width: 36px; height: 36px; color: #8b5cf6; }
    .page-subtitle { margin: 0; color: #64748b; font-size: 16px; }
    .stats-card { padding: 24px; margin-bottom: 24px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
    .stat-item { display: flex; align-items: center; gap: 16px; }
    .stat-icon { font-size: 48px; width: 48px; height: 48px; }
    .stat-icon.primary { color: #8b5cf6; }
    .stat-details .stat-value { font-size: 28px; font-weight: 700; color: #1e293b; }
    .stat-details .stat-label { font-size: 14px; color: #64748b; }
    .content-card { padding: 24px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
    .info-text { display: flex; align-items: center; gap: 8px; padding: 16px; background: #f3e8ff; border-radius: 8px; color: #6b21a8; margin: 0; }
    .info-text mat-icon { color: #8b5cf6; }
  `]
})
export class OrdersShippedComponent {}
