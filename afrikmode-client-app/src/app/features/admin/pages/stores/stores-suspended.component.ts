// src/app/features/admin/pages/stores/stores-suspended.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-stores-suspended',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatChipsModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon>block</mat-icon>
          Boutiques Suspendues
        </h1>
        <mat-chip highlighted color="warn">8 boutiques</mat-chip>
      </div>
      <mat-card class="warning-card">
        <mat-icon>warning</mat-icon>
        <p>Boutiques temporairement suspendues pour non-conformité</p>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-page { padding: 24px; background: #f8f9fa; min-height: 100%; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .page-title { display: flex; align-items: center; gap: 12px; margin: 0; font-size: 32px; font-weight: 700; color: #1e293b; }
    .page-title mat-icon { font-size: 36px; width: 36px; height: 36px; color: #ef4444; }
    .warning-card { padding: 24px; border-radius: 16px; display: flex; align-items: center; gap: 16px; background: #fef2f2; border: 1px solid #fca5a5; }
    .warning-card mat-icon { color: #ef4444; }
  `]
})
export class StoresSuspendedComponent {}
