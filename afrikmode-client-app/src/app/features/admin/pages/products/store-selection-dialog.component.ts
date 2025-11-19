import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '../../core/services/admin-api.service';

@Component({
  selector: 'app-store-selection-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  template: `
    <div class="store-selection-dialog">
      <h2 mat-dialog-title>Sélectionner une boutique</h2>
      <mat-dialog-content>
        <p>Choisissez la boutique pour laquelle vous souhaitez créer un produit :</p>
        <div class="stores-list">
          @for (store of stores; track store.id) {
            <mat-card class="store-card" (click)="selectStore(store)" [class.selected]="selectedStore?.id === store.id">
              <mat-card-content>
                <div class="store-info">
                  <div class="store-header">
                    <h3>{{ store.name }}</h3>
                    @if (store.isVerified) {
                      <mat-icon class="verified-icon">verified</mat-icon>
                    }
                  </div>
                  <p class="store-description">{{ store.description || 'Aucune description' }}</p>
                  <div class="store-meta">
                    <span><mat-icon>person</mat-icon> {{ store.owner.firstName }} {{ store.owner.lastName }}</span>
                    <span><mat-icon>inventory</mat-icon> {{ store.totalProducts || 0 }} produits</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="cancel()">Annuler</button>
        <button mat-raised-button color="primary" (click)="confirm()" [disabled]="!selectedStore">
          Continuer
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .store-selection-dialog {
      min-width: 500px;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    h2 {
      margin: 0;
      padding: 20px 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    mat-dialog-content {
      padding: 24px;
      max-height: 500px;
      overflow-y: auto;
    }

    p {
      margin-bottom: 20px;
      color: #666;
    }

    .stores-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .store-card {
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .store-card:hover {
      border-color: #2563eb;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
    }

    .store-card.selected {
      border-color: #2563eb;
      background-color: #f0f7ff;
    }

    .store-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .store-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .store-header h3 {
      margin: 0;
      font-size: 1.1rem;
      color: #1a1a1a;
    }

    .verified-icon {
      color: #2563eb;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .store-description {
      color: #666;
      font-size: 0.9rem;
      margin: 0;
    }

    .store-meta {
      display: flex;
      gap: 16px;
      margin-top: 8px;
      font-size: 0.85rem;
      color: #999;
    }

    .store-meta span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .store-meta mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class StoreSelectionDialogComponent {
  selectedStore: Store | null = null;

  constructor(
    public dialogRef: MatDialogRef<StoreSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { stores: Store[] }
  ) {}

  get stores(): Store[] {
    return this.data.stores || [];
  }

  selectStore(store: Store): void {
    this.selectedStore = store;
  }

  confirm(): void {
    if (this.selectedStore) {
      this.dialogRef.close(this.selectedStore);
    }
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}


