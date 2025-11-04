// src/app/features/admin/pages/stores/stores-pending.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-stores-pending',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon>hourglass_empty</mat-icon>
          Boutiques en Attente
        </h1>
        <mat-chip highlighted color="warn">{{ stores.length }} en attente</mat-chip>
      </div>

      <div class="stores-grid">
        <mat-card class="store-card" *ngFor="let store of stores">
          <div class="store-header">
            <div class="store-logo">
              <mat-icon>store</mat-icon>
            </div>
            <div>
              <h3>{{ store.name }}</h3>
              <p>{{ store.vendor }}</p>
            </div>
          </div>
          <p class="store-description">{{ store.description }}</p>
          <div class="store-actions">
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
    .stores-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px; }
    .store-card { padding: 24px; border-radius: 16px; }
    .store-header { display: flex; gap: 16px; margin-bottom: 16px; align-items: center; }
    .store-logo { width: 64px; height: 64px; background: #f1f5f9; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .store-logo mat-icon { font-size: 32px; width: 32px; height: 32px; color: #64748b; }
    .store-header h3 { margin: 0 0 4px 0; font-size: 18px; font-weight: 600; }
    .store-header p { margin: 0; color: #64748b; font-size: 14px; }
    .store-description { color: #64748b; margin-bottom: 16px; }
    .store-actions { display: flex; gap: 12px; }
    .store-actions button { flex: 1; }
  `]
})
export class StoresPendingComponent {
  stores = [
    { name: 'Boutique Mode Africaine', vendor: 'Jean Dupont', description: 'Vêtements traditionnels africains' },
    { name: 'Style & Elegance', vendor: 'Marie Martin', description: 'Mode contemporaine africaine' },
    { name: 'African Fashion Hub', vendor: 'Paul Bernard', description: 'Accessoires et vêtements' }
  ];
}
