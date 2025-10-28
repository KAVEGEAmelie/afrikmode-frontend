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

interface DialogData {
  zone?: any;
}

@Component({
  selector: 'app-zone-config-dialog',
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
    MatCheckboxModule
  ],
  template: `
    <div class="zone-config-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>location_on</mat-icon>
          {{ data.zone ? 'Modifier la zone' : 'Nouvelle zone de livraison' }}
        </h2>
        <button mat-icon-button (click)="onCancel()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <div class="zone-form">
          <mat-form-field appearance="outline" class="name-field">
            <mat-label>Nom de la zone</mat-label>
            <input 
              matInput 
              [(ngModel)]="zoneName"
              placeholder="Ex: Lomé Centre">
          </mat-form-field>

          <mat-form-field appearance="outline" class="regions-field">
            <mat-label>Régions couvertes</mat-label>
            <mat-select [(ngModel)]="selectedRegions" multiple>
              @for (region of availableRegions; track region) {
                <mat-option [value]="region">{{ region }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <div class="delivery-settings">
            <h4>Paramètres de livraison</h4>
            
            <mat-form-field appearance="outline" class="time-field">
              <mat-label>Délai de livraison (jours)</mat-label>
              <input 
                matInput 
                type="number" 
                [(ngModel)]="deliveryTime"
                placeholder="3">
            </mat-form-field>

            <mat-form-field appearance="outline" class="cost-field">
              <mat-label>Coût de base (FCFA)</mat-label>
              <input 
                matInput 
                type="number" 
                [(ngModel)]="baseCost"
                placeholder="500">
            </mat-form-field>

            <mat-form-field appearance="outline" class="threshold-field">
              <mat-label>Seuil livraison gratuite (FCFA)</mat-label>
              <input 
                matInput 
                type="number" 
                [(ngModel)]="freeShippingThreshold"
                placeholder="50000">
            </mat-form-field>
          </div>

          <div class="weight-settings">
            <h4>Suppléments par poids</h4>
            
            <mat-form-field appearance="outline" class="weight-rate-field">
              <mat-label>Tarif par kg (FCFA)</mat-label>
              <input 
                matInput 
                type="number" 
                [(ngModel)]="weightRate"
                placeholder="200">
            </mat-form-field>

            <mat-form-field appearance="outline" class="max-weight-field">
              <mat-label>Poids maximum (kg)</mat-label>
              <input 
                matInput 
                type="number" 
                [(ngModel)]="maxWeight"
                placeholder="10">
            </mat-form-field>
          </div>

          <div class="distance-settings">
            <h4>Suppléments par distance</h4>
            
            <mat-form-field appearance="outline" class="distance-rate-field">
              <mat-label>Tarif par km (FCFA)</mat-label>
              <input 
                matInput 
                type="number" 
                [(ngModel)]="distanceRate"
                placeholder="50">
            </mat-form-field>

            <mat-form-field appearance="outline" class="max-distance-field">
              <mat-label>Distance maximum (km)</mat-label>
              <input 
                matInput 
                type="number" 
                [(ngModel)]="maxDistance"
                placeholder="50">
            </mat-form-field>
          </div>

          <div class="special-settings">
            <h4>Paramètres spéciaux</h4>
            
            <mat-checkbox [(ngModel)]="allowExpress">
              Livraison express disponible
            </mat-checkbox>
            
            <mat-checkbox [(ngModel)]="allowWeekend">
              Livraison week-end
            </mat-checkbox>
            
            <mat-checkbox [(ngModel)]="requireSignature">
              Signature requise
            </mat-checkbox>
          </div>
        </div>

        <div class="preview-section">
          <h4>Prévisualisation des tarifs :</h4>
          <div class="preview-card">
            <div class="preview-item">
              <span>Commande 1kg, 5km :</span>
              <span>{{ calculatePreviewCost(1000, 5) | currency:'XOF':'symbol':'1.0-0':'fr' }}</span>
            </div>
            <div class="preview-item">
              <span>Commande 2kg, 10km :</span>
              <span>{{ calculatePreviewCost(2000, 10) | currency:'XOF':'symbol':'1.0-0':'fr' }}</span>
            </div>
            <div class="preview-item">
              <span>Commande 5kg, 20km :</span>
              <span>{{ calculatePreviewCost(5000, 20) | currency:'XOF':'symbol':'1.0-0':'fr' }}</span>
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
          [disabled]="!zoneName || !selectedRegions.length">
          <mat-icon>save</mat-icon>
          {{ data.zone ? 'Modifier' : 'Créer' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .zone-config-dialog {
      max-width: 800px;
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

    .zone-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .name-field,
    .regions-field {
      width: 100%;
    }

    .delivery-settings,
    .weight-settings,
    .distance-settings,
    .special-settings {
      background: #f9fafb;
      border-radius: 8px;
      padding: 1rem;
    }

    .delivery-settings h4,
    .weight-settings h4,
    .distance-settings h4,
    .special-settings h4 {
      margin: 0 0 1rem 0;
      color: #374151;
      font-size: 1rem;
    }

    .delivery-settings,
    .weight-settings,
    .distance-settings {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .special-settings {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
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

    mat-dialog-actions {
      justify-content: flex-end;
      gap: 0.5rem;
    }

    @media (max-width: 768px) {
      .delivery-settings,
      .weight-settings,
      .distance-settings {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ZoneConfigDialogComponent {
  zoneName: string = '';
  selectedRegions: string[] = [];
  deliveryTime: number = 3;
  baseCost: number = 500;
  freeShippingThreshold: number = 50000;
  weightRate: number = 200;
  maxWeight: number = 10;
  distanceRate: number = 50;
  maxDistance: number = 50;
  allowExpress: boolean = false;
  allowWeekend: boolean = false;
  requireSignature: boolean = false;

  availableRegions = [
    'Lomé Centre',
    'Lomé Banlieue',
    'Kara Centre',
    'Kara Banlieue',
    'Sokodé Centre',
    'Sokodé Banlieue',
    'Atakpamé',
    'Kpalimé',
    'Aného',
    'Tsévié'
  ];

  constructor(
    public dialogRef: MatDialogRef<ZoneConfigDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    if (data.zone) {
      this.zoneName = data.zone.name;
      this.selectedRegions = data.zone.regions;
      this.deliveryTime = data.zone.deliveryTime;
      this.baseCost = data.zone.cost;
      this.freeShippingThreshold = data.zone.freeShippingThreshold;
    }
  }

  calculatePreviewCost(weight: number, distance: number): number {
    const weightCost = (weight / 1000) * this.weightRate;
    const distanceCost = distance * this.distanceRate;
    return this.baseCost + weightCost + distanceCost;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.zoneName && this.selectedRegions.length > 0) {
      this.dialogRef.close({
        name: this.zoneName,
        regions: this.selectedRegions,
        deliveryTime: this.deliveryTime,
        cost: this.baseCost,
        freeShippingThreshold: this.freeShippingThreshold,
        weightRate: this.weightRate,
        maxWeight: this.maxWeight,
        distanceRate: this.distanceRate,
        maxDistance: this.maxDistance,
        allowExpress: this.allowExpress,
        allowWeekend: this.allowWeekend,
        requireSignature: this.requireSignature
      });
    }
  }
}











