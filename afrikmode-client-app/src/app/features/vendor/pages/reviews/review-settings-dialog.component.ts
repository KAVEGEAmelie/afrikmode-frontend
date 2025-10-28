import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

export interface ReviewSettings {
  autoApprove: boolean;
  requireVerification: boolean;
  allowImages: boolean;
  maxImages: number;
  moderationLevel: 'strict' | 'moderate' | 'lenient';
  emailNotifications: boolean;
  responseDeadline: number; // en jours
}

@Component({
  selector: 'app-review-settings-dialog',
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
    MatSlideToggleModule,
    MatDividerModule,
    MatCardModule
  ],
  template: `
    <div class="review-settings-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>settings</mat-icon>
          Paramètres des Avis
        </h2>
        <button mat-icon-button (click)="onCancel()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="settings-sections">
          
          <!-- Modération automatique -->
          <mat-card class="settings-section">
            <mat-card-header>
              <mat-card-title>Modération Automatique</mat-card-title>
              <mat-card-subtitle>Configurez l'approbation automatique des avis</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="setting-item">
                <div class="setting-info">
                  <h4>Approbation automatique</h4>
                  <p>Approuver automatiquement les avis positifs (4-5 étoiles)</p>
                </div>
                <mat-slide-toggle [(ngModel)]="settings.autoApprove"></mat-slide-toggle>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h4>Vérification obligatoire</h4>
                  <p>Nécessiter une vérification d'achat pour publier un avis</p>
                </div>
                <mat-slide-toggle [(ngModel)]="settings.requireVerification"></mat-slide-toggle>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h4>Niveau de modération</h4>
                  <p>Définissez le niveau de filtrage des avis</p>
                </div>
                <mat-form-field appearance="outline" class="setting-field">
                  <mat-select [(ngModel)]="settings.moderationLevel">
                    <mat-option value="strict">Strict - Filtre agressif</mat-option>
                    <mat-option value="moderate">Modéré - Équilibre</mat-option>
                    <mat-option value="lenient">Permissif - Minimum de filtrage</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Images et médias -->
          <mat-card class="settings-section">
            <mat-card-header>
              <mat-card-title>Images et Médias</mat-card-title>
              <mat-card-subtitle>Gérez les images dans les avis</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="setting-item">
                <div class="setting-info">
                  <h4>Autoriser les images</h4>
                  <p>Permettre aux clients d'ajouter des photos à leurs avis</p>
                </div>
                <mat-slide-toggle [(ngModel)]="settings.allowImages"></mat-slide-toggle>
              </div>

              @if (settings.allowImages) {
                <div class="setting-item">
                <div class="setting-info">
                  <h4>Nombre maximum d'images</h4>
                  <p>Limite le nombre d'images par avis</p>
                </div>
                <mat-form-field appearance="outline" class="setting-field">
                  <input matInput type="number" [(ngModel)]="settings.maxImages" min="1" max="10">
                  <mat-label>Images max</mat-label>
                </mat-form-field>
                </div>
              }
            </mat-card-content>
          </mat-card>

          <!-- Notifications -->
          <mat-card class="settings-section">
            <mat-card-header>
              <mat-card-title>Notifications</mat-card-title>
              <mat-card-subtitle>Configurez les alertes par email</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="setting-item">
                <div class="setting-info">
                  <h4>Notifications par email</h4>
                  <p>Recevoir des alertes pour les nouveaux avis</p>
                </div>
                <mat-slide-toggle [(ngModel)]="settings.emailNotifications"></mat-slide-toggle>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h4>Délai de réponse</h4>
                  <p>Délai recommandé pour répondre aux avis (en jours)</p>
                </div>
                <mat-form-field appearance="outline" class="setting-field">
                  <input matInput type="number" [(ngModel)]="settings.responseDeadline" min="1" max="30">
                  <mat-label>Jours</mat-label>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">Annuler</button>
        <button mat-button (click)="resetToDefaults()">Réinitialiser</button>
        <button mat-raised-button color="primary" (click)="onSave()">
          <mat-icon>save</mat-icon>
          Enregistrer
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .review-settings-dialog {
      max-width: 600px;
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
      min-width: 120px;
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
export class ReviewSettingsDialogComponent {
  settings: ReviewSettings;

  constructor(
    public dialogRef: MatDialogRef<ReviewSettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReviewSettings
  ) {
    this.settings = { ...data };
  }

  onSave(): void {
    this.dialogRef.close(this.settings);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  resetToDefaults(): void {
    this.settings = {
      autoApprove: false,
      requireVerification: true,
      allowImages: true,
      maxImages: 3,
      moderationLevel: 'moderate',
      emailNotifications: true,
      responseDeadline: 7
    };
  }
}





