// Admin Orders Processing Component
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-orders-processing',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon>sync</mat-icon>
          Commandes en Traitement
        </h1>
        <p class="page-subtitle">Commandes actuellement en cours de préparation</p>
      </div>

      <mat-card class="stats-card">
        <div class="stats-grid">
          <div class="stat-item">
            <mat-icon class="stat-icon info">sync</mat-icon>
            <div class="stat-details">
              <div class="stat-value">67</div>
              <div class="stat-label">En traitement</div>
            </div>
          </div>
        </div>
      </mat-card>

      <mat-card class="content-card">
        <p class="info-text">
          <mat-icon>info</mat-icon>
          67 commandes en cours de préparation par les vendeurs
        </p>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-page { padding: 24px; background: #f8f9fa; min-height: 100vh; }
    .page-header { margin-bottom: 24px; }
    .page-title { display: flex; align-items: center; gap: 12px; margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #1e293b; }
    .page-title mat-icon { font-size: 36px; width: 36px; height: 36px; color: #3b82f6; }
    .page-subtitle { margin: 0; color: #64748b; font-size: 16px; }
    .stats-card { padding: 24px; margin-bottom: 24px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
    .stat-item { display: flex; align-items: center; gap: 16px; }
    .stat-icon { font-size: 48px; width: 48px; height: 48px; color: #3b82f6; }
    .stat-icon.info { color: #3b82f6; }
    .stat-details .stat-value { font-size: 28px; font-weight: 700; color: #1e293b; }
    .stat-details .stat-label { font-size: 14px; color: #64748b; }
    .content-card { padding: 24px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
    .info-text { display: flex; align-items: center; gap: 8px; padding: 16px; background: #dbeafe; border-radius: 8px; color: #1e40af; margin: 0; }
    .info-text mat-icon { color: #3b82f6; }
  `]
})
export class OrdersProcessingComponent {}
