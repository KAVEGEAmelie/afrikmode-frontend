// Admin Finances Overview Component
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-finances-overview',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon>account_balance</mat-icon>
          Vue d'ensemble Financière
        </h1>
        <p class="page-subtitle">Aperçu global des finances de la plateforme</p>
      </div>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-icon class="stat-icon success">trending_up</mat-icon>
          <div class="stat-details">
            <div class="stat-value">125,430 €</div>
            <div class="stat-label">Revenus totaux</div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <mat-icon class="stat-icon primary">payments</mat-icon>
          <div class="stat-details">
            <div class="stat-value">8,567 €</div>
            <div class="stat-label">Commissions</div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <mat-icon class="stat-icon warning">account_balance_wallet</mat-icon>
          <div class="stat-details">
            <div class="stat-value">23,456 €</div>
            <div class="stat-label">Paiements en attente</div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <mat-icon class="stat-icon info">receipt</mat-icon>
          <div class="stat-details">
            <div class="stat-value">1,234</div>
            <div class="stat-label">Factures générées</div>
          </div>
        </mat-card>
      </div>

      <mat-card class="content-card">
        <h2><mat-icon>info</mat-icon> Finances de la Plateforme</h2>
        <p>Consultez et gérez toutes les finances de la plateforme. Utilisez le menu latéral pour accéder aux différentes sections.</p>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-page { padding: 24px; background: #f8f9fa; min-height: 100vh; }
    .page-header { margin-bottom: 32px; }
    .page-title { display: flex; align-items: center; gap: 12px; margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #1e293b; }
    .page-title mat-icon { font-size: 36px; width: 36px; height: 36px; color: #3b82f6; }
    .page-subtitle { margin: 0; color: #64748b; font-size: 16px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; margin-bottom: 24px; }
    .stat-card { padding: 24px; display: flex; align-items: center; gap: 16px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .stat-icon { font-size: 48px; width: 48px; height: 48px; }
    .stat-icon.success { color: #10b981; }
    .stat-icon.primary { color: #3b82f6; }
    .stat-icon.warning { color: #f59e0b; }
    .stat-icon.info { color: #8b5cf6; }
    .stat-details .stat-value { font-size: 28px; font-weight: 700; color: #1e293b; }
    .stat-details .stat-label { font-size: 14px; color: #64748b; }
    .content-card { padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .content-card h2 { display: flex; align-items: center; gap: 8px; margin: 0 0 16px 0; color: #1e293b; }
    .content-card mat-icon { color: #3b82f6; }
    .content-card p { margin: 0; color: #64748b; line-height: 1.6; }
  `]
})
export class AdminFinancesOverviewComponent {}
