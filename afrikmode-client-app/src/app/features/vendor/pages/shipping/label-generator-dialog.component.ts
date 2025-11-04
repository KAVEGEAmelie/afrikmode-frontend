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
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';

export interface LabelGeneratorData {
  order?: any;
}

export interface LabelGeneratorResult {
  carrier: string;
  service: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  insurance: boolean;
  signature: boolean;
  fragile: boolean;
}

@Component({
  selector: 'app-label-generator-dialog',
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
    MatStepperModule,
    MatCheckboxModule
  ],
  template: `
    <div class="label-generator-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>print</mat-icon>
          Générateur d'Étiquette
        </h2>
        <button mat-icon-button (click)="onCancel()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        @if (data.order) {
          <div class="order-info">
            <mat-card class="order-card">
              <mat-card-content>
                <h3>Commande #{{ data.order.orderNumber }}</h3>
                <p>{{ data.order.customer.name }} - {{ data.order.customer.email }}</p>
                <div class="order-details">
                  <span><mat-icon>location_on</mat-icon> {{ data.order.address.city }}, {{ data.order.address.region }}</span>
                  <span><mat-icon>inventory</mat-icon> {{ data.order.items.length }} articles</span>
                  <span><mat-icon>scale</mat-icon> {{ data.order.totalWeight }}kg</span>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        }

        <mat-stepper #stepper>
          <!-- Étape 1: Transporteur -->
          <mat-step label="Transporteur">
            <div class="step-content">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Transporteur</mat-label>
                <mat-select [(ngModel)]="labelData.carrier">
                  <mat-option value="dhl">DHL Express</mat-option>
                  <mat-option value="fedex">FedEx</mat-option>
                  <mat-option value="ups">UPS</mat-option>
                  <mat-option value="poste">Poste Togolaise</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Service</mat-label>
                <mat-select [(ngModel)]="labelData.service">
                  <mat-option value="express">Express (24h)</mat-option>
                  <mat-option value="standard">Standard (2-3 jours)</mat-option>
                  <mat-option value="economy">Économique (5-7 jours)</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </mat-step>

          <!-- Étape 2: Dimensions -->
          <mat-step label="Dimensions">
            <div class="step-content">
              <div class="dimensions-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Longueur (cm)</mat-label>
                  <input matInput type="number" [(ngModel)]="labelData.dimensions.length" min="1" max="200">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Largeur (cm)</mat-label>
                  <input matInput type="number" [(ngModel)]="labelData.dimensions.width" min="1" max="200">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Hauteur (cm)</mat-label>
                  <input matInput type="number" [(ngModel)]="labelData.dimensions.height" min="1" max="200">
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Poids (kg)</mat-label>
                <input matInput type="number" [(ngModel)]="labelData.weight" min="0.1" step="0.1">
              </mat-form-field>
            </div>
          </mat-step>

          <!-- Étape 3: Options -->
          <mat-step label="Options">
            <div class="step-content">
              <div class="options-grid">
                <mat-checkbox [(ngModel)]="labelData.insurance">
                  <div class="option-info">
                    <h4>Assurance</h4>
                    <p>Protection contre la perte et les dommages</p>
                  </div>
                </mat-checkbox>

                <mat-checkbox [(ngModel)]="labelData.signature">
                  <div class="option-info">
                    <h4>Signature requise</h4>
                    <p>Le destinataire doit signer à la réception</p>
                  </div>
                </mat-checkbox>

                <mat-checkbox [(ngModel)]="labelData.fragile">
                  <div class="option-info">
                    <h4>Fragile</h4>
                    <p>Manipulation spéciale requise</p>
                  </div>
                </mat-checkbox>
              </div>
            </div>
          </mat-step>

          <!-- Étape 4: Résumé -->
          <mat-step label="Résumé">
            <div class="step-content">
              <mat-card class="summary-card">
                <mat-card-content>
                  <h3>Résumé de l'étiquette</h3>
                  <div class="summary-details">
                    <div class="summary-item">
                      <span class="label">Transporteur:</span>
                      <span class="value">{{ getCarrierName(labelData.carrier) }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="label">Service:</span>
                      <span class="value">{{ getServiceName(labelData.service) }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="label">Dimensions:</span>
                      <span class="value">{{ labelData.dimensions.length }}x{{ labelData.dimensions.width }}x{{ labelData.dimensions.height }} cm</span>
                    </div>
                    <div class="summary-item">
                      <span class="label">Poids:</span>
                      <span class="value">{{ labelData.weight }} kg</span>
                    </div>
                    <div class="summary-item">
                      <span class="label">Options:</span>
                      <span class="value">{{ getSelectedOptions() }}</span>
                    </div>
                    <div class="summary-item total">
                      <span class="label">Coût estimé:</span>
                      <span class="value">{{ getEstimatedCost() | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-step>
        </mat-stepper>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">Annuler</button>
        <button mat-button (click)="stepper.previous()" [disabled]="stepper.selectedIndex === 0">
          <mat-icon>arrow_back</mat-icon>
          Précédent
        </button>
        <button mat-button (click)="stepper.next()" [disabled]="stepper.selectedIndex === 3">
          <mat-icon>arrow_forward</mat-icon>
          Suivant
        </button>
        <button mat-raised-button color="primary" (click)="onGenerate()" [disabled]="stepper.selectedIndex !== 3">
          <mat-icon>print</mat-icon>
          Générer l'Étiquette
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .label-generator-dialog {
      max-width: 800px;
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

    .order-info {
      margin-bottom: 1.5rem;
    }

    .order-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .order-card h3 {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
      font-size: 1.1rem;
    }

    .order-card p {
      margin: 0 0 0.5rem 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .order-details {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .order-details span {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.85rem;
      color: #6b7280;
    }

    .step-content {
      padding: 1rem 0;
    }

    .full-width {
      width: 100%;
    }

    .dimensions-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .options-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .option-info h4 {
      margin: 0 0 0.25rem 0;
      color: #1f2937;
      font-size: 1rem;
    }

    .option-info p {
      margin: 0;
      color: #6b7280;
      font-size: 0.85rem;
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

    .summary-details {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .summary-item:last-child {
      border-bottom: none;
    }

    .summary-item.total {
      font-weight: 600;
      background: #f9fafb;
      padding: 0.75rem;
      border-radius: 6px;
      margin-top: 0.5rem;
    }

    .summary-item .label {
      color: #6b7280;
      font-size: 0.9rem;
    }

    .summary-item .value {
      color: #1f2937;
      font-weight: 500;
    }

    .dialog-actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    @media (max-width: 768px) {
      .dimensions-grid {
        grid-template-columns: 1fr;
      }

      .order-details {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class LabelGeneratorDialogComponent {
  labelData: LabelGeneratorResult = {
    carrier: 'dhl',
    service: 'express',
    weight: 1.0,
    dimensions: {
      length: 30,
      width: 20,
      height: 10
    },
    insurance: false,
    signature: false,
    fragile: false
  };

  constructor(
    public dialogRef: MatDialogRef<LabelGeneratorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LabelGeneratorData
  ) {
    if (data.order) {
      this.labelData.weight = data.order.totalWeight;
    }
  }

  getCarrierName(carrier: string): string {
    const names: { [key: string]: string } = {
      'dhl': 'DHL Express',
      'fedex': 'FedEx',
      'ups': 'UPS',
      'poste': 'Poste Togolaise'
    };
    return names[carrier] || carrier;
  }

  getServiceName(service: string): string {
    const names: { [key: string]: string } = {
      'express': 'Express (24h)',
      'standard': 'Standard (2-3 jours)',
      'economy': 'Économique (5-7 jours)'
    };
    return names[service] || service;
  }

  getSelectedOptions(): string {
    const options = [];
    if (this.labelData.insurance) options.push('Assurance');
    if (this.labelData.signature) options.push('Signature requise');
    if (this.labelData.fragile) options.push('Fragile');
    return options.length > 0 ? options.join(', ') : 'Aucune';
  }

  getEstimatedCost(): number {
    let cost = 2000; // Coût de base
    
    // Coût par transporteur
    const carrierCosts: { [key: string]: number } = {
      'dhl': 1000,
      'fedex': 800,
      'ups': 700,
      'poste': 500
    };
    cost += carrierCosts[this.labelData.carrier] || 0;
    
    // Coût par service
    const serviceCosts: { [key: string]: number } = {
      'express': 2000,
      'standard': 1000,
      'economy': 500
    };
    cost += serviceCosts[this.labelData.service] || 0;
    
    // Coût par poids
    cost += this.labelData.weight * 500;
    
    // Options supplémentaires
    if (this.labelData.insurance) cost += 1000;
    if (this.labelData.signature) cost += 500;
    if (this.labelData.fragile) cost += 300;
    
    return cost;
  }

  onGenerate(): void {
    this.dialogRef.close(this.labelData);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}





























