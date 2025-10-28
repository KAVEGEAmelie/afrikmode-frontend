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
import { MatTableModule } from '@angular/material/table';

interface DialogData {
  carrier?: any;
}

@Component({
  selector: 'app-carrier-config-dialog',
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
    MatTableModule
  ],
  template: `
    <div class="carrier-config-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>local_shipping</mat-icon>
          {{ data.carrier ? 'Modifier le transporteur' : 'Nouveau transporteur' }}
        </h2>
        <button mat-icon-button (click)="onCancel()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <div class="carrier-form">
          <div class="basic-info">
            <h4>Informations de base</h4>
            
            <mat-form-field appearance="outline" class="name-field">
              <mat-label>Nom du transporteur</mat-label>
              <input 
                matInput 
                [(ngModel)]="carrierName"
                placeholder="Ex: DHL Express">
            </mat-form-field>

            <mat-form-field appearance="outline" class="logo-field">
              <mat-label>URL du logo</mat-label>
              <input 
                matInput 
                [(ngModel)]="carrierLogo"
                placeholder="https://example.com/logo.png">
            </mat-form-field>

            <mat-form-field appearance="outline" class="rating-field">
              <mat-label>Note (1-5)</mat-label>
              <input 
                matInput 
                type="number" 
                min="1" 
                max="5" 
                step="0.1"
                [(ngModel)]="carrierRating"
                placeholder="4.5">
            </mat-form-field>

            <mat-checkbox [(ngModel)]="isActive">
              Transporteur actif
            </mat-checkbox>
          </div>

          <div class="services-section">
            <h4>Services disponibles</h4>
            <div class="services-header">
              <button mat-raised-button (click)="addService()">
                <mat-icon>add</mat-icon>
                Ajouter un service
              </button>
            </div>

            <div class="services-list">
              @for (service of services; track $index) {
                <mat-card class="service-card">
                  <mat-card-content>
                    <div class="service-form">
                      <mat-form-field appearance="outline" class="service-name">
                        <mat-label>Nom du service</mat-label>
                        <input 
                          matInput 
                          [(ngModel)]="service.name"
                          placeholder="Ex: Express 24h">
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="service-description">
                        <mat-label>Description</mat-label>
                        <input 
                          matInput 
                          [(ngModel)]="service.description"
                          placeholder="Livraison express en 24h">
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="service-days">
                        <mat-label>Délai (jours)</mat-label>
                        <input 
                          matInput 
                          type="number" 
                          [(ngModel)]="service.estimatedDays"
                          placeholder="1">
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="service-cost">
                        <mat-label>Coût de base (FCFA)</mat-label>
                        <input 
                          matInput 
                          type="number" 
                          [(ngModel)]="service.cost"
                          placeholder="1000">
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="service-weight">
                        <mat-label>Poids max (kg)</mat-label>
                        <input 
                          matInput 
                          type="number" 
                          [(ngModel)]="service.maxWeight"
                          placeholder="5">
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="service-dimensions">
                        <mat-label>Dimensions max (cm)</mat-label>
                        <input 
                          matInput 
                          [(ngModel)]="service.maxDimensions"
                          placeholder="60x40x30">
                      </mat-form-field>

                      <button mat-icon-button (click)="removeService($index)" color="warn">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </div>

          <div class="preview-section">
            <h4>Prévisualisation :</h4>
            <div class="preview-card">
              <div class="carrier-preview">
                <div class="carrier-logo">
                  @if (carrierLogo) {
                    <img [src]="carrierLogo" [alt]="carrierName">
                  } @else {
                    <mat-icon>local_shipping</mat-icon>
                  }
                </div>
                <div class="carrier-info">
                  <h5>{{ carrierName || 'Nom du transporteur' }}</h5>
                  <p>{{ services.length }} service(s) disponible(s)</p>
                  <div class="rating">
                    @for (star of [1,2,3,4,5]; track star) {
                      <mat-icon [class.filled]="star <= carrierRating" [class.empty]="star > carrierRating">
                        {{ star <= carrierRating ? 'star' : 'star_border' }}
                      </mat-icon>
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
          [disabled]="!carrierName || services.length === 0">
          <mat-icon>save</mat-icon>
          {{ data.carrier ? 'Modifier' : 'Créer' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .carrier-config-dialog {
      max-width: 900px;
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

    .carrier-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .basic-info {
      background: #f9fafb;
      border-radius: 8px;
      padding: 1rem;
    }

    .basic-info h4 {
      margin: 0 0 1rem 0;
      color: #374151;
    }

    .name-field,
    .logo-field,
    .rating-field {
      width: 100%;
      margin-bottom: 1rem;
    }

    .services-section h4 {
      margin: 0 0 1rem 0;
      color: #374151;
    }

    .services-header {
      margin-bottom: 1rem;
    }

    .services-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .service-card {
      border-left: 4px solid #8B2E2E;
    }

    .service-form {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1rem;
      align-items: end;
    }

    .service-name,
    .service-description {
      grid-column: 1 / -1;
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

    .carrier-preview {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .carrier-logo {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .carrier-logo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .carrier-logo mat-icon {
      font-size: 2rem;
      color: #6b7280;
    }

    .carrier-info h5 {
      margin: 0 0 0.25rem 0;
      color: #1f2937;
    }

    .carrier-info p {
      margin: 0 0 0.5rem 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .rating {
      display: flex;
      gap: 0.25rem;
    }

    .rating mat-icon {
      font-size: 1rem;
    }

    .rating mat-icon.filled {
      color: #ffc107;
    }

    .rating mat-icon.empty {
      color: #d1d5db;
    }

    mat-dialog-actions {
      justify-content: flex-end;
      gap: 0.5rem;
    }

    @media (max-width: 768px) {
      .service-form {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CarrierConfigDialogComponent {
  carrierName: string = '';
  carrierLogo: string = '';
  carrierRating: number = 4.0;
  isActive: boolean = true;
  services: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<CarrierConfigDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    if (data.carrier) {
      this.carrierName = data.carrier.name;
      this.carrierLogo = data.carrier.logo;
      this.carrierRating = data.carrier.rating;
      this.isActive = data.carrier.isActive;
      this.services = data.carrier.services || [];
    } else {
      this.addService();
    }
  }

  addService(): void {
    this.services.push({
      name: '',
      description: '',
      estimatedDays: 1,
      cost: 1000,
      maxWeight: 5,
      maxDimensions: '60x40x30'
    });
  }

  removeService(index: number): void {
    this.services.splice(index, 1);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.carrierName && this.services.length > 0) {
      this.dialogRef.close({
        name: this.carrierName,
        logo: this.carrierLogo,
        rating: this.carrierRating,
        isActive: this.isActive,
        services: this.services
      });
    }
  }
}











