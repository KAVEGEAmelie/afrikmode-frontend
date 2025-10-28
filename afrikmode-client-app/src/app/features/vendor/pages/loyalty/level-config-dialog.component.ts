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
import { MatSliderModule } from '@angular/material/slider';

interface DialogData {
  level?: any;
}

@Component({
  selector: 'app-level-config-dialog',
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
    MatSliderModule
  ],
  template: `
    <div class="level-config-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>star</mat-icon>
          {{ data.level ? 'Modifier le niveau' : 'Nouveau niveau' }}
        </h2>
        <button mat-icon-button (click)="onCancel()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <div class="level-form">
          <div class="basic-info">
            <h4>Informations de base</h4>
            
            <mat-form-field appearance="outline" class="name-field">
              <mat-label>Nom du niveau</mat-label>
              <input 
                matInput 
                [(ngModel)]="levelName"
                placeholder="Ex: Bronze, Argent, Or">
            </mat-form-field>

            <mat-form-field appearance="outline" class="description-field">
              <mat-label>Description</mat-label>
              <textarea 
                matInput 
                [(ngModel)]="levelDescription"
                placeholder="Description du niveau"
                rows="3">
              </textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="icon-field">
              <mat-label>Icône</mat-label>
              <mat-select [(ngModel)]="levelIcon">
                @for (icon of availableIcons; track icon.value) {
                  <mat-option [value]="icon.value">
                    <mat-icon>{{ icon.value }}</mat-icon>
                    {{ icon.label }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="color-field">
              <mat-label>Couleur</mat-label>
              <mat-select [(ngModel)]="levelColor">
                @for (color of availableColors; track color.value) {
                  <mat-option [value]="color.value">
                    <div class="color-option">
                      <div class="color-preview" [style.background-color]="color.value"></div>
                      {{ color.label }}
                    </div>
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <div class="points-settings">
            <h4>Seuils de points</h4>
            
            <mat-form-field appearance="outline" class="min-points-field">
              <mat-label>Points minimum</mat-label>
              <input 
                matInput 
                type="number" 
                [(ngModel)]="minPoints"
                placeholder="0">
            </mat-form-field>

            <mat-form-field appearance="outline" class="max-points-field">
              <mat-label>Points maximum</mat-label>
              <input 
                matInput 
                type="number" 
                [(ngModel)]="maxPoints"
                placeholder="10000">
            </mat-form-field>
          </div>

          <div class="benefits-settings">
            <h4>Avantages du niveau</h4>
            
            <mat-form-field appearance="outline" class="discount-field">
              <mat-label>Réduction (%)</mat-label>
              <input 
                matInput 
                type="number" 
                min="0" 
                max="100"
                [(ngModel)]="discountPercentage"
                placeholder="5">
            </mat-form-field>

            <div class="benefits-checkboxes">
              <mat-checkbox [(ngModel)]="freeShipping">
                Livraison gratuite
              </mat-checkbox>
              
              <mat-checkbox [(ngModel)]="prioritySupport">
                Support prioritaire
              </mat-checkbox>
              
              <mat-checkbox [(ngModel)]="earlyAccess">
                Accès anticipé aux nouveautés
              </mat-checkbox>
              
              <mat-checkbox [(ngModel)]="exclusiveOffers">
                Offres exclusives
              </mat-checkbox>
              
              <mat-checkbox [(ngModel)]="birthdayReward">
                Cadeau d'anniversaire
              </mat-checkbox>
            </div>
          </div>

          <div class="preview-section">
            <h4>Prévisualisation :</h4>
            <div class="preview-card">
              <div class="level-preview">
                <div class="level-icon" [style.background-color]="levelColor">
                  <mat-icon>{{ levelIcon }}</mat-icon>
                </div>
                <div class="level-info">
                  <h5>{{ levelName || 'Nom du niveau' }}</h5>
                  <p>{{ levelDescription || 'Description du niveau' }}</p>
                  <div class="level-details">
                    <span class="points-range">
                      <mat-icon>loyalty</mat-icon>
                      {{ formatPoints(minPoints) }} - {{ formatPoints(maxPoints) }} pts
                    </span>
                    @if (discountPercentage > 0) {
                      <span class="discount">
                        <mat-icon>percent</mat-icon>
                        {{ discountPercentage }}% de réduction
                      </span>
                    }
                  </div>
                  <div class="benefits-list">
                    @if (freeShipping) {
                      <mat-chip>Livraison gratuite</mat-chip>
                    }
                    @if (prioritySupport) {
                      <mat-chip>Support prioritaire</mat-chip>
                    }
                    @if (earlyAccess) {
                      <mat-chip>Accès anticipé</mat-chip>
                    }
                    @if (exclusiveOffers) {
                      <mat-chip>Offres exclusives</mat-chip>
                    }
                    @if (birthdayReward) {
                      <mat-chip>Cadeau d'anniversaire</mat-chip>
                    }
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
          [disabled]="!levelName || !levelDescription || minPoints < 0 || maxPoints <= minPoints">
          <mat-icon>save</mat-icon>
          {{ data.level ? 'Modifier' : 'Créer' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .level-config-dialog {
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

    .level-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .basic-info,
    .points-settings,
    .benefits-settings {
      background: #f9fafb;
      border-radius: 8px;
      padding: 1rem;
    }

    .basic-info h4,
    .points-settings h4,
    .benefits-settings h4 {
      margin: 0 0 1rem 0;
      color: #374151;
    }

    .name-field,
    .description-field,
    .icon-field,
    .color-field {
      width: 100%;
      margin-bottom: 1rem;
    }

    .points-settings {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .benefits-settings {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .benefits-checkboxes {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }

    .color-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .color-preview {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid #e5e7eb;
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

    .level-preview {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .level-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .level-icon mat-icon {
      font-size: 2rem;
    }

    .level-info h5 {
      margin: 0 0 0.25rem 0;
      color: #1f2937;
    }

    .level-info p {
      margin: 0 0 0.5rem 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .level-details {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .level-details span {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.9rem;
      color: #374151;
    }

    .level-details mat-icon {
      font-size: 1rem;
    }

    .benefits-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .benefits-list mat-chip {
      font-size: 0.8rem;
    }

    mat-dialog-actions {
      justify-content: flex-end;
      gap: 0.5rem;
    }

    @media (max-width: 768px) {
      .points-settings,
      .benefits-checkboxes {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LevelConfigDialogComponent {
  levelName: string = '';
  levelDescription: string = '';
  levelIcon: string = 'star';
  levelColor: string = '#8B2E2E';
  minPoints: number = 0;
  maxPoints: number = 10000;
  discountPercentage: number = 0;
  freeShipping: boolean = false;
  prioritySupport: boolean = false;
  earlyAccess: boolean = false;
  exclusiveOffers: boolean = false;
  birthdayReward: boolean = false;

  availableIcons = [
    { value: 'star', label: 'Étoile' },
    { value: 'diamond', label: 'Diamant' },
    { value: 'crown', label: 'Couronne' },
    { value: 'trophy', label: 'Trophée' },
    { value: 'medal', label: 'Médaille' },
    { value: 'local_fire_department', label: 'Flamme' },
    { value: 'workspace_premium', label: 'Premium' },
    { value: 'emoji_events', label: 'Événement' }
  ];

  availableColors = [
    { value: '#8B2E2E', label: 'Rouge Afrikmode' },
    { value: '#CD7F32', label: 'Bronze' },
    { value: '#C0C0C0', label: 'Argent' },
    { value: '#FFD700', label: 'Or' },
    { value: '#E5E4E2', label: 'Platine' },
    { value: '#B9F2FF', label: 'Diamant' },
    { value: '#6A0DAD', label: 'Violet' },
    { value: '#00CED1', label: 'Turquoise' }
  ];

  constructor(
    public dialogRef: MatDialogRef<LevelConfigDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    if (data.level) {
      this.levelName = data.level.name;
      this.levelDescription = data.level.description;
      this.levelIcon = data.level.icon;
      this.levelColor = data.level.color;
      this.minPoints = data.level.minPoints;
      this.maxPoints = data.level.maxPoints;
      this.discountPercentage = data.level.discountPercentage;
      this.freeShipping = data.level.freeShipping;
      this.prioritySupport = data.level.prioritySupport;
      this.earlyAccess = data.level.earlyAccess;
      this.exclusiveOffers = data.level.exclusiveOffers;
      this.birthdayReward = data.level.birthdayReward;
    }
  }

  formatPoints(points: number): string {
    return new Intl.NumberFormat('fr-FR').format(points);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.levelName && this.levelDescription && this.minPoints >= 0 && this.maxPoints > this.minPoints) {
      this.dialogRef.close({
        name: this.levelName,
        description: this.levelDescription,
        icon: this.levelIcon,
        color: this.levelColor,
        minPoints: this.minPoints,
        maxPoints: this.maxPoints,
        discountPercentage: this.discountPercentage,
        freeShipping: this.freeShipping,
        prioritySupport: this.prioritySupport,
        earlyAccess: this.earlyAccess,
        exclusiveOffers: this.exclusiveOffers,
        birthdayReward: this.birthdayReward
      });
    }
  }
}











