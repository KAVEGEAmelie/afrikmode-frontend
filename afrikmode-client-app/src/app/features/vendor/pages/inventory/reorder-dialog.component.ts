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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

export interface ReorderData {
  item: any;
}

export interface ReorderResult {
  supplierId: string;
  supplierName: string;
  quantity: number;
  unitPrice: number;
  expectedDelivery: Date;
}

@Component({
  selector: 'app-reorder-dialog',
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
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="reorder-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>add_shopping_cart</mat-icon>
          Réapprovisionnement
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
                  <div class="stock-info">
                    <span class="label">Stock actuel:</span>
                    <span class="value">{{ data.item.currentStock || data.item.currentStock }} unités</span>
                  </div>
                  <div class="stock-info">
                    <span class="label">Stock minimum:</span>
                    <span class="value">{{ data.item.minStock || data.item.minStock }} unités</span>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="reorder-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Fournisseur</mat-label>
            <mat-select [(ngModel)]="reorder.supplierId" (selectionChange)="onSupplierChange()">
              <mat-option *ngFor="let supplier of suppliers" [value]="supplier.id">
                {{ supplier.name }} - {{ supplier.contact }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Quantité à commander</mat-label>
            <input matInput type="number" [(ngModel)]="reorder.quantity" placeholder="Entrez la quantité">
            <mat-hint>Quantité suggérée: {{ getSuggestedQuantity() }}</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Prix unitaire (FCFA)</mat-label>
            <input matInput type="number" [(ngModel)]="reorder.unitPrice" placeholder="Prix par unité">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Date de livraison prévue</mat-label>
            <input matInput [matDatepicker]="picker" [(ngModel)]="reorder.expectedDelivery" placeholder="Sélectionnez une date">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <div class="order-summary">
            <h4>Résumé de la commande</h4>
            <div class="summary-item">
              <span>Quantité:</span>
              <span>{{ reorder.quantity || 0 }} unités</span>
            </div>
            <div class="summary-item">
              <span>Prix unitaire:</span>
              <span>{{ reorder.unitPrice || 0 | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
            </div>
            <div class="summary-item total">
              <span>Total:</span>
              <span class="total-amount">{{ getTotalAmount() | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">Annuler</button>
        <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!isValid()">
          <mat-icon>add_shopping_cart</mat-icon>
          Créer la Commande
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .reorder-dialog {
      max-width: 600px;
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

    .stock-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }

    .stock-info .label {
      color: #6b7280;
      font-size: 0.9rem;
    }

    .stock-info .value {
      font-weight: 600;
      color: #1f2937;
    }

    .reorder-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .order-summary {
      background: #f9fafb;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .order-summary h4 {
      margin: 0 0 1rem 0;
      color: #1f2937;
      font-size: 1rem;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .summary-item:last-child {
      border-bottom: none;
    }

    .summary-item.total {
      font-weight: 600;
      background: #f3f4f6;
      padding: 0.75rem;
      border-radius: 6px;
      margin-top: 0.5rem;
    }

    .total-amount {
      font-weight: 700;
      color: #1f2937;
      font-size: 1.1rem;
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
export class ReorderDialogComponent {
  reorder: ReorderResult = {
    supplierId: '',
    supplierName: '',
    quantity: 0,
    unitPrice: 0,
    expectedDelivery: new Date()
  };

  suppliers = [
    { id: '1', name: 'Textiles Africains SARL', contact: 'M. Koffi Mensah' },
    { id: '2', name: 'Wax & Co', contact: 'Mme Fatou Diallo' },
    { id: '3', name: 'Fashion House', contact: 'M. Jean Kouassi' }
  ];

  constructor(
    public dialogRef: MatDialogRef<ReorderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReorderData
  ) {
    // Définir la date de livraison par défaut (7 jours)
    this.reorder.expectedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  getSuggestedQuantity(): number {
    const currentStock = this.data.item.currentStock || this.data.item.currentStock;
    const minStock = this.data.item.minStock || this.data.item.minStock;
    const maxStock = this.data.item.maxStock || this.data.item.maxStock;
    
    // Suggérer de commander pour atteindre le stock maximum
    return Math.max(0, maxStock - currentStock);
  }

  getTotalAmount(): number {
    return (this.reorder.quantity || 0) * (this.reorder.unitPrice || 0);
  }

  onSupplierChange(): void {
    const supplier = this.suppliers.find(s => s.id === this.reorder.supplierId);
    if (supplier) {
      this.reorder.supplierName = supplier.name;
    }
  }

  isValid(): boolean {
    return this.reorder.supplierId !== '' && 
           this.reorder.quantity > 0 && 
           this.reorder.unitPrice > 0 &&
           this.reorder.expectedDelivery !== null;
  }

  onSave(): void {
    if (this.isValid()) {
      this.dialogRef.close(this.reorder);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}