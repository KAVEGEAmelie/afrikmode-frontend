// Admin Payments Management Component
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-payments-management',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon>payment</mat-icon>
          Gestion des Paiements
        </h1>
        <p class="page-subtitle">Vue d'ensemble de tous les paiements</p>
      </div>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-icon class="stat-icon success">check_circle</mat-icon>
          <div class="stat-details">
            <div class="stat-value">1,234</div>
            <div class="stat-label">Paiements complétés</div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <mat-icon class="stat-icon warning">pending</mat-icon>
          <div class="stat-details">
            <div class="stat-value">45</div>
            <div class="stat-label">En attente</div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <mat-icon class="stat-icon error">error</mat-icon>
          <div class="stat-details">
            <div class="stat-value">12</div>
            <div class="stat-label">Échecs</div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <mat-icon class="stat-icon primary">account_balance</mat-icon>
          <div class="stat-details">
            <div class="stat-value">45,678 €</div>
            <div class="stat-label">Total traité</div>
          </div>
        </mat-card>
      </div>

      <mat-card class="content-card">
        <h2><mat-icon>info</mat-icon> Gestion des Paiements</h2>
        <p>Consultez et gérez tous les paiements de la plateforme. Utilisez le menu latéral pour filtrer par statut.</p>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-page { padding: 24px; background: #f8f9fa; min-height: 100vh; }
    .page-header { margin-bottom: 32px; }
    .page-title { display: flex; align-items: center; gap: 12px; margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #1e293b; }
    .page-title mat-icon { font-size: 36px; width: 36px; height: 36px; color: #10b981; }
    .page-subtitle { margin: 0; color: #64748b; font-size: 16px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; margin-bottom: 24px; }
    .stat-card { padding: 24px; display: flex; align-items: center; gap: 16px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .stat-icon { font-size: 48px; width: 48px; height: 48px; }
    .stat-icon.success { color: #10b981; }
    .stat-icon.warning { color: #f59e0b; }
    .stat-icon.error { color: #ef4444; }
    .stat-icon.primary { color: #3b82f6; }
    .stat-details .stat-value { font-size: 28px; font-weight: 700; color: #1e293b; }
    .stat-details .stat-label { font-size: 14px; color: #64748b; }
    .content-card { padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .content-card h2 { display: flex; align-items: center; gap: 8px; margin: 0 0 16px 0; color: #1e293b; }
    .content-card mat-icon { color: #3b82f6; }
    .content-card p { margin: 0; color: #64748b; line-height: 1.6; }
  `]
})
export class AdminPaymentsManagementComponent {}
