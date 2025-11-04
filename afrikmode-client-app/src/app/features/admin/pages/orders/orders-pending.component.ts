// src/app/features/admin/pages/orders/orders-pending.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-orders-pending',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule
  ],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon>hourglass_empty</mat-icon>
          Commandes en Attente
        </h1>
        <p class="page-subtitle">Liste des commandes en attente de traitement</p>
      </div>

      <mat-card class="stats-card">
        <div class="stats-grid">
          <div class="stat-item">
            <mat-icon class="stat-icon warning">hourglass_empty</mat-icon>
            <div class="stat-details">
              <div class="stat-value">34</div>
              <div class="stat-label">En attente</div>
            </div>
          </div>
          <div class="stat-item">
            <mat-icon class="stat-icon">schedule</mat-icon>
            <div class="stat-details">
              <div class="stat-value">2.5h</div>
              <div class="stat-label">Temps moyen</div>
            </div>
          </div>
          <div class="stat-item">
            <mat-icon class="stat-icon success">trending_up</mat-icon>
            <div class="stat-details">
              <div class="stat-value">+15%</div>
              <div class="stat-label">vs hier</div>
            </div>
          </div>
        </div>
      </mat-card>

      <mat-card class="content-card">
        <div class="card-header">
          <h3>Liste des commandes</h3>
          <button mat-raised-button color="primary">
            <mat-icon>refresh</mat-icon>
            Actualiser
          </button>
        </div>
        
        <p class="info-text">
          <mat-icon>info</mat-icon>
          34 commandes en attente de validation et de traitement
        </p>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-page {
      padding: 24px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .page-header {
      margin-bottom: 24px;

      .page-title {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0 0 8px 0;
        font-size: 32px;
        font-weight: 700;
        color: #1e293b;

        mat-icon {
          font-size: 36px;
          width: 36px;
          height: 36px;
          color: #f59e0b;
        }
      }

      .page-subtitle {
        margin: 0;
        color: #64748b;
        font-size: 16px;
      }
    }

    .stats-card {
      padding: 24px;
      margin-bottom: 24px;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;

        .stat-item {
          display: flex;
          align-items: center;
          gap: 16px;

          .stat-icon {
            font-size: 48px;
            width: 48px;
            height: 48px;
            color: #64748b;

            &.warning { color: #f59e0b; }
            &.success { color: #10b981; }
          }

          .stat-details {
            .stat-value {
              font-size: 28px;
              font-weight: 700;
              color: #1e293b;
            }

            .stat-label {
              font-size: 14px;
              color: #64748b;
            }
          }
        }
      }
    }

    .content-card {
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
        }

        button mat-icon {
          margin-right: 8px;
        }
      }

      .info-text {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 16px;
        background: #fef3c7;
        border-radius: 8px;
        color: #92400e;
        margin: 0;

        mat-icon {
          color: #f59e0b;
        }
      }
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr !important;
      }
    }
  `]
})
export class OrdersPendingComponent {}
