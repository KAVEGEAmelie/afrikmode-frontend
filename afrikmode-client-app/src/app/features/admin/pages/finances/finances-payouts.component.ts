// Finances Payouts Component
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-finances-payouts',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon>account_balance_wallet</mat-icon>
          Paiements aux Vendeurs
        </h1>
        <p class="page-subtitle">Paiements effectués aux vendeurs</p>
      </div>

      <mat-card class="stat-card">
        <mat-icon class="stat-icon">account_balance_wallet</mat-icon>
        <div class="stat-details">
          <div class="stat-value">23,456 €</div>
          <div class="stat-label">Paiements en attente</div>
        </div>
      </mat-card>

      <mat-card class="content-card">
        <p class="info-text">
          <mat-icon>info</mat-icon>
          23,456 € en paiements sont en attente de traitement vers les vendeurs
        </p>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-page { padding: 24px; background: #f8f9fa; min-height: 100vh; }
    .page-header { margin-bottom: 24px; }
    .page-title { display: flex; align-items: center; gap: 12px; margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #1e293b; }
    .page-title mat-icon { font-size: 36px; width: 36px; height: 36px; color: #f59e0b; }
    .page-subtitle { margin: 0; color: #64748b; font-size: 16px; }
    .stat-card { padding: 24px; margin-bottom: 24px; display: flex; align-items: center; gap: 16px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .stat-icon { font-size: 48px; width: 48px; height: 48px; color: #f59e0b; }
    .stat-details .stat-value { font-size: 28px; font-weight: 700; color: #1e293b; }
    .stat-details .stat-label { font-size: 14px; color: #64748b; }
    .content-card { padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .info-text { display: flex; align-items: center; gap: 8px; padding: 16px; background: #fef3c7; border-radius: 8px; color: #92400e; margin: 0; }
    .info-text mat-icon { color: #f59e0b; }
  `]
})
export class FinancesPayoutsComponent {}
