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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';

export interface ShippingSettingsData {
  settings?: any;
}

export interface ShippingSettingsResult {
  defaultCarrier: string;
  autoGenerateLabels: boolean;
  requireSignature: boolean;
  insuranceThreshold: number;
  freeShippingThreshold: number;
  processingTime: number;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  tracking: {
    autoUpdate: boolean;
    customerNotifications: boolean;
  };
}

@Component({
  selector: 'app-shipping-settings-dialog',
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
    MatSlideToggleModule,
    MatDividerModule
  ],
  template: `
    <div class="shipping-settings-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>settings</mat-icon>
          Paramètres de Livraison
        </h2>
        <button mat-icon-button (click)="onCancel()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="settings-sections">
          
          <!-- Configuration générale -->
          <mat-card class="settings-section">
            <mat-card-header>
              <mat-card-title>Configuration Générale</mat-card-title>
              <mat-card-subtitle>Paramètres de base pour les expéditions</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="setting-item">
                <div class="setting-info">
                  <h4>Transporteur par défaut</h4>
                  <p>Transporteur utilisé par défaut pour les nouvelles commandes</p>
                </div>
                <mat-form-field appearance="outline" class="setting-field">
                  <mat-select [(ngModel)]="settings.defaultCarrier">
                    <mat-option value="dhl">DHL Express</mat-option>
                    <mat-option value="fedex">FedEx</mat-option>
                    <mat-option value="ups">UPS</mat-option>
                    <mat-option value="poste">Poste Togolaise</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h4>Génération automatique d'étiquettes</h4>
                  <p>Générer automatiquement les étiquettes lors de la préparation</p>
                </div>
                <mat-slide-toggle [(ngModel)]="settings.autoGenerateLabels"></mat-slide-toggle>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h4>Signature requise par défaut</h4>
                  <p>Exiger une signature pour toutes les livraisons</p>
                </div>
                <mat-slide-toggle [(ngModel)]="settings.requireSignature"></mat-slide-toggle>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Seuils et coûts -->
          <mat-card class="settings-section">
            <mat-card-header>
              <mat-card-title>Seuils et Coûts</mat-card-title>
              <mat-card-subtitle>Configuration des seuils de livraison gratuite et d'assurance</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="setting-item">
                <div class="setting-info">
                  <h4>Seuil d'assurance automatique</h4>
                  <p>Montant à partir duquel l'assurance est automatiquement ajoutée</p>
                </div>
                <mat-form-field appearance="outline" class="setting-field">
                  <input matInput type="number" [(ngModel)]="settings.insuranceThreshold" min="0">
                  <mat-label>Montant (FCFA)</mat-label>
                </mat-form-field>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h4>Seuil de livraison gratuite</h4>
                  <p>Montant à partir duquel la livraison devient gratuite</p>
                </div>
                <mat-form-field appearance="outline" class="setting-field">
                  <input matInput type="number" [(ngModel)]="settings.freeShippingThreshold" min="0">
                  <mat-label>Montant (FCFA)</mat-label>
                </mat-form-field>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h4>Temps de traitement</h4>
                  <p>Délai de traitement des commandes avant expédition</p>
                </div>
                <mat-form-field appearance="outline" class="setting-field">
                  <input matInput type="number" [(ngModel)]="settings.processingTime" min="0" max="7">
                  <mat-label>Jours</mat-label>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Notifications -->
          <mat-card class="settings-section">
            <mat-card-header>
              <mat-card-title>Notifications</mat-card-title>
              <mat-card-subtitle>Configuration des alertes et notifications</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="setting-item">
                <div class="setting-info">
                  <h4>Notifications par email</h4>
                  <p>Recevoir des alertes par email pour les expéditions</p>
                </div>
                <mat-slide-toggle [(ngModel)]="settings.notifications.email"></mat-slide-toggle>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h4>Notifications SMS</h4>
                  <p>Recevoir des alertes par SMS</p>
                </div>
                <mat-slide-toggle [(ngModel)]="settings.notifications.sms"></mat-slide-toggle>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h4>Notifications push</h4>
                  <p>Recevoir des notifications push dans l'application</p>
                </div>
                <mat-slide-toggle [(ngModel)]="settings.notifications.push"></mat-slide-toggle>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Suivi -->
          <mat-card class="settings-section">
            <mat-card-header>
              <mat-card-title>Suivi des Expéditions</mat-card-title>
              <mat-card-subtitle>Configuration du suivi automatique</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="setting-item">
                <div class="setting-info">
                  <h4>Mise à jour automatique</h4>
                  <p>Mettre à jour automatiquement le statut des expéditions</p>
                </div>
                <mat-slide-toggle [(ngModel)]="settings.tracking.autoUpdate"></mat-slide-toggle>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h4>Notifications client</h4>
                  <p>Notifier automatiquement les clients des mises à jour</p>
                </div>
                <mat-slide-toggle [(ngModel)]="settings.tracking.customerNotifications"></mat-slide-toggle>
              </div>
            </mat-card-content>
          </mat-card>

        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">Annuler</button>
        <button mat-button (click)="resetToDefaults()">
          <mat-icon>refresh</mat-icon>
          Réinitialiser
        </button>
        <button mat-raised-button color="primary" (click)="onSave()">
          <mat-icon>save</mat-icon>
          Enregistrer
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .shipping-settings-dialog {
      max-width: 700px;
      max-height: 80vh;
      overflow-y: auto;
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

    .settings-sections {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .settings-section {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .setting-item:last-child {
      border-bottom: none;
    }

    .setting-info h4 {
      margin: 0 0 0.25rem 0;
      color: #1f2937;
      font-size: 1rem;
    }

    .setting-info p {
      margin: 0;
      color: #6b7280;
      font-size: 0.875rem;
      line-height: 1.4;
    }

    .setting-field {
      min-width: 150px;
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
      .setting-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .setting-field {
        width: 100%;
      }
    }
  `]
})
export class ShippingSettingsDialogComponent {
  settings: ShippingSettingsResult;

  constructor(
    public dialogRef: MatDialogRef<ShippingSettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ShippingSettingsData
  ) {
    this.settings = data.settings || {
      defaultCarrier: 'dhl',
      autoGenerateLabels: false,
      requireSignature: true,
      insuranceThreshold: 50000,
      freeShippingThreshold: 100000,
      processingTime: 1,
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      tracking: {
        autoUpdate: true,
        customerNotifications: true
      }
    };
  }

  resetToDefaults(): void {
    this.settings = {
      defaultCarrier: 'dhl',
      autoGenerateLabels: false,
      requireSignature: true,
      insuranceThreshold: 50000,
      freeShippingThreshold: 100000,
      processingTime: 1,
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      tracking: {
        autoUpdate: true,
        customerNotifications: true
      }
    };
  }

  onSave(): void {
    this.dialogRef.close(this.settings);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
































