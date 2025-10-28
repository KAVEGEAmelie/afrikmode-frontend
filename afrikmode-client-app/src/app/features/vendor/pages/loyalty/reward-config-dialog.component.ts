import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

interface DialogData {
  reward?: any;
}

@Component({
  selector: 'app-reward-config-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatChipsModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="reward-config-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>card_giftcard</mat-icon>
          {{ data.reward ? 'Modifier la récompense' : 'Nouvelle récompense' }}
        </h2>
        <button mat-icon-button (click)="onCancel()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <div class="reward-form">
          <div class="basic-info">
            <h4>Informations de base</h4>
            
            <mat-form-field appearance="outline" class="name-field">
              <mat-label>Nom de la récompense</mat-label>
              <input 
                matInput 
                [(ngModel)]="rewardName"
                placeholder="Ex: Réduction 10%">
            </mat-form-field>

            <mat-form-field appearance="outline" class="description-field">
              <mat-label>Description</mat-label>
              <textarea 
                matInput 
                [(ngModel)]="rewardDescription"
                placeholder="Description de la récompense"
                rows="3">
              </textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="type-field">
              <mat-label>Type de récompense</mat-label>
              <mat-select [(ngModel)]="rewardType">
                @for (type of rewardTypes; track type.value) {
                  <mat-option [value]="type.value">
                    <mat-icon>{{ type.icon }}</mat-icon>
                    {{ type.label }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <div class="cost-settings">
            <h4>Coût et valeur</h4>
            
            <mat-form-field appearance="outline" class="points-cost-field">
              <mat-label>Coût en points</mat-label>
              <input 
                matInput 
                type="number" 
                [(ngModel)]="pointsCost"
                placeholder="1000">
            </mat-form-field>

            <mat-form-field appearance="outline" class="value-field">
              <mat-label>Valeur de la récompense</mat-label>
              <input 
                matInput 
                type="number" 
                [(ngModel)]="rewardValue"
                placeholder="10">
              <span matSuffix>{{ getValueSuffix() }}</span>
            </mat-form-field>
          </div>

          <div class="availability-settings">
            <h4>Disponibilité</h4>
            
            <mat-checkbox [(ngModel)]="isActive">
              Récompense active
            </mat-checkbox>

            <mat-form-field appearance="outline" class="usage-limit-field">
              <mat-label>Limite d'utilisation</mat-label>
              <input 
                matInput 
                type="number" 
                [(ngModel)]="usageLimit"
                placeholder="100">
              <span matSuffix>utilisations</span>
            </mat-form-field>

            <mat-form-field appearance="outline" class="valid-until-field">
              <mat-label>Valide jusqu'au</mat-label>
              <input 
                matInput 
                [matDatepicker]="picker"
                [(ngModel)]="validUntil">
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
          </div>

          <div class="preview-section">
            <h4>Prévisualisation :</h4>
            <div class="preview-card">
              <div class="reward-preview">
                <div class="reward-icon">
                  <mat-icon>{{ getRewardTypeIcon(rewardType) }}</mat-icon>
                </div>
                <div class="reward-info">
                  <h5>{{ rewardName || 'Nom de la récompense' }}</h5>
                  <p>{{ rewardDescription || 'Description de la récompense' }}</p>
                  <div class="reward-details">
                    <span class="points-cost">
                      <mat-icon>loyalty</mat-icon>
                      {{ formatPoints(pointsCost) }} pts
                    </span>
                    <span class="reward-value">
                      <mat-icon>{{ getRewardTypeIcon(rewardType) }}</mat-icon>
                      {{ formatRewardValue() }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-button (click)="onCancel()">
          Annuler
        </button>
        <button 
          mat-raised-button 
          color="primary" 
          (click)="onConfirm()"
          [disabled]="!rewardName || !rewardDescription || pointsCost <= 0">
          <mat-icon>save</mat-icon>
          {{ data.reward ? 'Modifier' : 'Créer' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .reward-config-dialog {
      max-width: 700px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .dialog-header h2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      color: #8B2E2E;
    }

    .reward-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .basic-info,
    .cost-settings,
    .availability-settings {
      background: #f9fafb;
      border-radius: 8px;
      padding: 1rem;
    }

    .basic-info h4,
    .cost-settings h4,
    .availability-settings h4 {
      margin: 0 0 1rem 0;
      color: #374151;
    }

    .name-field,
    .description-field,
    .type-field {
      width: 100%;
      margin-bottom: 1rem;
    }

    .cost-settings {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .availability-settings {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .preview-section h4 {
      margin: 1rem 0 0.5rem 0;
      color: #374151;
    }

    .preview-card {
      background: #fef3f2;
      border-radius: 8px;
      padding: 1rem;
      border-left: 4px solid #8B2E2E;
    }

    .reward-preview {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .reward-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #8B2E2E;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .reward-icon mat-icon {
      font-size: 2rem;
    }

    .reward-info h5 {
      margin: 0 0 0.25rem 0;
      color: #1f2937;
    }

    .reward-info p {
      margin: 0 0 0.5rem 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .reward-details {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .reward-details span {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.9rem;
      color: #374151;
    }

    .reward-details mat-icon {
      font-size: 1rem;
    }

    mat-dialog-actions {
      justify-content: flex-end;
      gap: 0.5rem;
    }

    @media (max-width: 768px) {
      .cost-settings {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RewardConfigDialogComponent {
  rewardName: string = '';
  rewardDescription: string = '';
  rewardType: string = 'discount';
  pointsCost: number = 1000;
  rewardValue: number = 10;
  isActive: boolean = true;
  usageLimit: number = 100;
  validUntil: Date | null = null;

  rewardTypes = [
    { value: 'discount', label: 'Réduction', icon: 'percent' },
    { value: 'free_shipping', label: 'Livraison gratuite', icon: 'local_shipping' },
    { value: 'free_product', label: 'Produit gratuit', icon: 'card_giftcard' },
    { value: 'cashback', label: 'Cashback', icon: 'account_balance_wallet' }
  ];

  constructor(
    public dialogRef: MatDialogRef<RewardConfigDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    if (data.reward) {
      this.rewardName = data.reward.name;
      this.rewardDescription = data.reward.description;
      this.rewardType = data.reward.type;
      this.pointsCost = data.reward.pointsCost;
      this.rewardValue = data.reward.value;
      this.isActive = data.reward.isActive;
      this.usageLimit = data.reward.usageLimit || 100;
      this.validUntil = data.reward.validUntil;
    }
  }

  getRewardTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'discount': 'percent',
      'free_shipping': 'local_shipping',
      'free_product': 'card_giftcard',
      'cashback': 'account_balance_wallet'
    };
    return icons[type] || 'loyalty';
  }

  getValueSuffix(): string {
    const suffixes: { [key: string]: string } = {
      'discount': '%',
      'free_shipping': 'FCFA',
      'free_product': 'FCFA',
      'cashback': 'FCFA'
    };
    return suffixes[this.rewardType] || '';
  }

  formatPoints(points: number): string {
    return new Intl.NumberFormat('fr-FR').format(points);
  }

  formatRewardValue(): string {
    if (this.rewardType === 'discount') {
      return `${this.rewardValue}%`;
    } else if (this.rewardType === 'free_shipping') {
      return 'Livraison gratuite';
    } else if (this.rewardType === 'free_product') {
      return `${this.rewardValue} FCFA`;
    } else if (this.rewardType === 'cashback') {
      return `${this.rewardValue} FCFA`;
    }
    return '';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.rewardName && this.rewardDescription && this.pointsCost > 0) {
      this.dialogRef.close({
        name: this.rewardName,
        description: this.rewardDescription,
        type: this.rewardType,
        pointsCost: this.pointsCost,
        value: this.rewardValue,
        isActive: this.isActive,
        usageLimit: this.usageLimit,
        validUntil: this.validUntil
      });
    }
  }
}











