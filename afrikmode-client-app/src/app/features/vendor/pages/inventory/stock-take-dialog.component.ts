import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';

export interface StockTakeData {
  items: any[];
}

export interface StockTakeResult {
  adjustments: {
    itemId: string;
    currentStock: number;
    countedStock: number;
    difference: number;
  }[];
}

@Component({
  selector: 'app-stock-take-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatTableModule,
    MatCheckboxModule
  ],
  template: `
    <div class="stock-take-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>inventory_2</mat-icon>
          Inventaire Physique
        </h2>
        <button mat-icon-button (click)="onCancel()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="instructions">
          <mat-card class="info-card">
            <mat-card-content>
              <h3>Instructions</h3>
              <ul>
                <li>Comptez physiquement chaque produit en stock</li>
                <li>Entrez la quantité réelle comptée</li>
                <li>Le système calculera automatiquement les écarts</li>
                <li>Vous pourrez valider les ajustements à la fin</li>
              </ul>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="stock-take-table">
          <table mat-table [dataSource]="data.items" class="full-width">
            <ng-container matColumnDef="product">
              <th mat-header-cell *matHeaderCellDef>Produit</th>
              <td mat-cell *matCellDef="let item">
                <div class="product-cell">
                  <img [src]="item.productImage" [alt]="item.productName" class="product-thumb">
                  <div class="product-info">
                    <div class="product-name">{{ item.productName }}</div>
                    <div class="product-sku">SKU: {{ item.sku }}</div>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="currentStock">
              <th mat-header-cell *matHeaderCellDef>Stock Système</th>
              <td mat-cell *matCellDef="let item">
                <span class="stock-value">{{ item.currentStock }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="countedStock">
              <th mat-header-cell *matHeaderCellDef>Stock Compté</th>
              <td mat-cell *matCellDef="let item; let i = index">
                <mat-form-field appearance="outline" class="count-field">
                  <input matInput type="number" [(ngModel)]="countedStocks[i]" 
                         (input)="updateDifference(i, item.currentStock)" 
                         placeholder="0" min="0">
                </mat-form-field>
              </td>
            </ng-container>

            <ng-container matColumnDef="difference">
              <th mat-header-cell *matHeaderCellDef>Écart</th>
              <td mat-cell *matCellDef="let item; let i = index">
                <span class="difference-value" [ngClass]="getDifferenceClass(differences[i])">
                  {{ differences[i] > 0 ? '+' : '' }}{{ differences[i] || 0 }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let item; let i = index">
                <button mat-icon-button (click)="resetCount(i, item.currentStock)" 
                        [disabled]="!countedStocks[i]">
                  <mat-icon>refresh</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <div class="summary">
          <mat-card class="summary-card">
            <mat-card-content>
              <h3>Résumé de l'inventaire</h3>
              <div class="summary-stats">
                <div class="stat-item">
                  <span class="label">Produits comptés:</span>
                  <span class="value">{{ getCountedItems() }}/{{ data.items.length }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">Écarts positifs:</span>
                  <span class="value positive">{{ getPositiveDifferences() }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">Écarts négatifs:</span>
                  <span class="value negative">{{ getNegativeDifferences() }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">Total des écarts:</span>
                  <span class="value" [ngClass]="getTotalDifferenceClass()">{{ getTotalDifference() }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">Annuler</button>
        <button mat-button (click)="resetAll()">
          <mat-icon>refresh</mat-icon>
          Réinitialiser
        </button>
        <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!canSave()">
          <mat-icon>check</mat-icon>
          Valider l'Inventaire
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .stock-take-dialog {
      max-width: 1000px;
      max-height: 80vh;
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
      max-height: 60vh;
      overflow-y: auto;
    }

    .instructions {
      margin-bottom: 1.5rem;
    }

    .info-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .info-card h3 {
      margin: 0 0 1rem 0;
      color: #1f2937;
      font-size: 1.1rem;
    }

    .info-card ul {
      margin: 0;
      padding-left: 1.5rem;
      color: #6b7280;
    }

    .info-card li {
      margin-bottom: 0.5rem;
    }

    .stock-take-table {
      margin-bottom: 1.5rem;
    }

    .full-width {
      width: 100%;
    }

    .product-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .product-thumb {
      width: 40px;
      height: 40px;
      border-radius: 6px;
      object-fit: cover;
    }

    .product-name {
      font-weight: 600;
      color: #1f2937;
      font-size: 0.9rem;
    }

    .product-sku {
      color: #6b7280;
      font-size: 0.8rem;
    }

    .stock-value {
      font-weight: 600;
      color: #1f2937;
    }

    .count-field {
      width: 100px;
    }

    .difference-value {
      font-weight: 600;
      font-size: 1.1rem;
    }

    .difference-value.positive {
      color: #059669;
    }

    .difference-value.negative {
      color: #dc2626;
    }

    .difference-value.neutral {
      color: #6b7280;
    }

    .summary-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .summary-card h3 {
      margin: 0 0 1rem 0;
      color: #1f2937;
      font-size: 1.1rem;
    }

    .summary-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .stat-item .label {
      color: #6b7280;
      font-size: 0.9rem;
    }

    .stat-item .value {
      font-weight: 600;
      color: #1f2937;
    }

    .stat-item .value.positive {
      color: #059669;
    }

    .stat-item .value.negative {
      color: #dc2626;
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
export class StockTakeDialogComponent {
  countedStocks: number[] = [];
  differences: number[] = [];
  displayedColumns = ['product', 'currentStock', 'countedStock', 'difference', 'actions'];

  constructor(
    public dialogRef: MatDialogRef<StockTakeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StockTakeData
  ) {
    // Initialiser les tableaux
    this.countedStocks = new Array(data.items.length).fill(null);
    this.differences = new Array(data.items.length).fill(0);
  }

  updateDifference(index: number, currentStock: number): void {
    const counted = this.countedStocks[index] || 0;
    this.differences[index] = counted - currentStock;
  }

  getDifferenceClass(difference: number): string {
    if (difference > 0) return 'positive';
    if (difference < 0) return 'negative';
    return 'neutral';
  }

  resetCount(index: number, currentStock: number): void {
    this.countedStocks[index] = currentStock;
    this.updateDifference(index, currentStock);
  }

  getCountedItems(): number {
    return this.countedStocks.filter(count => count !== null && count !== undefined).length;
  }

  getPositiveDifferences(): number {
    return this.differences.filter(diff => diff > 0).length;
  }

  getNegativeDifferences(): number {
    return this.differences.filter(diff => diff < 0).length;
  }

  getTotalDifference(): number {
    return this.differences.reduce((sum, diff) => sum + (diff || 0), 0);
  }

  getTotalDifferenceClass(): string {
    const total = this.getTotalDifference();
    if (total > 0) return 'positive';
    if (total < 0) return 'negative';
    return 'neutral';
  }

  canSave(): boolean {
    return this.getCountedItems() === this.data.items.length;
  }

  resetAll(): void {
    this.countedStocks = new Array(this.data.items.length).fill(null);
    this.differences = new Array(this.data.items.length).fill(0);
  }

  onSave(): void {
    if (this.canSave()) {
      const adjustments = this.data.items.map((item, index) => ({
        itemId: item.id,
        currentStock: item.currentStock,
        countedStock: this.countedStocks[index],
        difference: this.differences[index]
      }));

      this.dialogRef.close({ adjustments });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}