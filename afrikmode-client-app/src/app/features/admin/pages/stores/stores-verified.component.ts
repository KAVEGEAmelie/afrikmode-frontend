// src/app/features/admin/pages/stores/stores-verified.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-stores-verified',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatChipsModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon>verified</mat-icon>
          Boutiques Vérifiées
        </h1>
        <mat-chip highlighted color="primary">234 boutiques</mat-chip>
      </div>
      <mat-card class="info-card">
        <mat-icon>info</mat-icon>
        <p>Liste des boutiques vérifiées et approuvées par l'équipe</p>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-page { padding: 24px; background: #f8f9fa; min-height: 100%; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .page-title { display: flex; align-items: center; gap: 12px; margin: 0; font-size: 32px; font-weight: 700; color: #1e293b; }
    .page-title mat-icon { font-size: 36px; width: 36px; height: 36px; color: #10b981; }
    .info-card { padding: 24px; border-radius: 16px; display: flex; align-items: center; gap: 16px; background: #f0fdf4; border: 1px solid #86efac; }
    .info-card mat-icon { color: #10b981; }
  `]
})
export class StoresVerifiedComponent {}
