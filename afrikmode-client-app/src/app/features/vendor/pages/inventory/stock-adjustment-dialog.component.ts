import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';

export interface StockAdjustmentData {
  item: any;
}

export interface StockAdjustmentResult {
  quantity: number;
  reason: string;
  reference: string;
}

@Component({
  selector: 'app-stock-adjustment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule
  ],
  template: `
    <div class="stock-adjustment-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>edit</mat-icon>
          Ajustement de Stock
        </h2>
        <button mat-icon-button (click)="onCancel()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="product-info">
          <mat-card class="product-card">
            <mat-card-content>
              <div class="product-header">
                <div class="product-image">
                  <img [src]="data.item.productImage" [alt]="data.item.productName">
                </div>
                <div class="product-details">
                  <h3>{{ data.item.productName }}</h3>
                  <p>SKU: {{ data.item.sku }}</p>
                  <div class="current-stock">
                    <span class="label">Stock actuel:</span>
                    <span class="value">{{ data.item.currentStock }} unités</span>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="adjustment-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Quantité à ajuster</mat-label>
            <input matInput type="number" [(ngModel)]="adjustment.quantity" placeholder="Entrez la quantité">
            <mat-hint>Utilisez + pour ajouter, - pour retirer</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Raison de l'ajustement</mat-label>
            <mat-select [(ngModel)]="adjustment.reason">
              <mat-option value="inventory_correction">Correction d'inventaire</mat-option>
              <mat-option value="damaged_goods">Marchandises endommagées</mat-option>
              <mat-option value="theft">Vol</mat-option>
              <mat-option value="return">Retour client</mat-option>
              <mat-option value="transfer">Transfert entre magasins</mat-option>
              <mat-option value="other">Autre</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Référence (optionnel)</mat-label>
            <input matInput [(ngModel)]="adjustment.reference" placeholder="Ex: INV-2025-001">
          </mat-form-field>

          <div class="stock-preview">
            <h4>Prévisualisation</h4>
            <div class="preview-item">
              <span>Stock actuel:</span>
              <span>{{ data.item.currentStock }}</span>
            </div>
            <div class="preview-item">
              <span>Ajustement:</span>
              <span [class.positive]="adjustment.quantity > 0" [class.negative]="adjustment.quantity < 0">
                {{ adjustment.quantity > 0 ? '+' : '' }}{{ adjustment.quantity || 0 }}
              </span>
            </div>
            <div class="preview-item total">
              <span>Nouveau stock:</span>
              <span class="new-stock">{{ getNewStock() }}</span>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">Annuler</button>
        <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!isValid()">
          <mat-icon>save</mat-icon>
          Ajuster le Stock
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .stock-adjustment-dialog {
      max-width: 500px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .dialog-header h2 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #1f2937;
      font-size: 1.25rem;
    }

    .dialog-header mat-icon {
      color: #8B2E2E;
    }

    .close-btn {
      color: #6b7280;
    }

    .dialog-content {
      padding: 1.5rem;
    }

    .product-card {
      margin-bottom: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .product-header {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .product-image {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      background: #e5e7eb;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-details h3 {
      margin: 0 0 0.25rem 0;
      color: #1f2937;
      font-size: 1.1rem;
    }

    .product-details p {
      margin: 0 0 0.5rem 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .current-stock {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .current-stock .label {
      color: #6b7280;
      font-size: 0.9rem;
    }

    .current-stock .value {
      font-weight: 600;
      color: #1f2937;
    }

    .adjustment-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .stock-preview {
      background: #f9fafb;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .stock-preview h4 {
      margin: 0 0 1rem 0;
      color: #1f2937;
      font-size: 1rem;
    }

    .preview-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .preview-item:last-child {
      border-bottom: none;
    }

    .preview-item.total {
      font-weight: 600;
      background: #f3f4f6;
      padding: 0.75rem;
      border-radius: 6px;
      margin-top: 0.5rem;
    }

    .positive {
      color: #059669;
    }

    .negative {
      color: #dc2626;
    }

    .new-stock {
      font-weight: 700;
      color: #1f2937;
    }

    .dialog-actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
  `]
})
export class StockAdjustmentDialogComponent {
  adjustment: StockAdjustmentResult = {
    quantity: 0,
    reason: 'inventory_correction',
    reference: ''
  };

  constructor(
    public dialogRef: MatDialogRef<StockAdjustmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StockAdjustmentData
  ) {}

  getNewStock(): number {
    return this.data.item.currentStock + (this.adjustment.quantity || 0);
  }

  isValid(): boolean {
    return this.adjustment.quantity !== 0 && this.adjustment.reason !== '';
  }

  onSave(): void {
    if (this.isValid()) {
      this.dialogRef.close(this.adjustment);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}