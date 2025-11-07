import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SettingsService, GeneralSettings } from '../../core/services/settings.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-settings-general',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="settings-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>
            <mat-icon>tune</mat-icon>
            Paramètres Généraux
          </h1>
          <p class="subtitle">Configuration générale de la plateforme</p>
        </div>
      </div>

      <!-- Loading -->
      @if (loading) {
        <div class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Chargement des paramètres...</p>
        </div>
      }

      <!-- Settings Form -->
      @if (!loading) {
        <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
          <!-- Site Information -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>info</mat-icon>
                Informations du site
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Nom du site</mat-label>
                  <input matInput formControlName="siteName" required>
                  <mat-icon matPrefix>language</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>URL du site</mat-label>
                  <input matInput formControlName="siteUrl" type="url" required>
                  <mat-icon matPrefix>link</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="siteDescription" rows="3"></textarea>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Contact Information -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>email</mat-icon>
                Informations de contact
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Email administrateur</mat-label>
                  <input matInput formControlName="adminEmail" type="email" required>
                  <mat-icon matPrefix>admin_panel_settings</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Email support</mat-label>
                  <input matInput formControlName="supportEmail" type="email" required>
                  <mat-icon matPrefix>support_agent</mat-icon>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Localization -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>public</mat-icon>
                Localisation
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Langue par défaut</mat-label>
                  <mat-select formControlName="defaultLanguage">
                    <mat-option value="fr">Français</mat-option>
                    <mat-option value="en">English</mat-option>
                    <mat-option value="es">Español</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Devise par défaut</mat-label>
                  <mat-select formControlName="defaultCurrency">
                    <mat-option value="XOF">XOF (Franc CFA)</mat-option>
                    <mat-option value="EUR">EUR (Euro)</mat-option>
                    <mat-option value="USD">USD (Dollar)</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Fuseau horaire</mat-label>
                  <mat-select formControlName="timezone">
                    <mat-option value="Africa/Abidjan">Africa/Abidjan (GMT+0)</mat-option>
                    <mat-option value="Africa/Dakar">Africa/Dakar (GMT+0)</mat-option>
                    <mat-option value="Africa/Lagos">Africa/Lagos (GMT+1)</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- System Options -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>settings</mat-icon>
                Options système
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="toggle-list">
                <div class="toggle-item">
                  <div class="toggle-info">
                    <h4>Mode maintenance</h4>
                    <p>Désactive l'accès public au site</p>
                  </div>
                  <mat-slide-toggle formControlName="maintenanceMode"></mat-slide-toggle>
                </div>

                <div class="toggle-item">
                  <div class="toggle-info">
                    <h4>Autoriser les inscriptions</h4>
                    <p>Permet aux nouveaux utilisateurs de s'inscrire</p>
                  </div>
                  <mat-slide-toggle formControlName="allowRegistration"></mat-slide-toggle>
                </div>

                <div class="toggle-item">
                  <div class="toggle-info">
                    <h4>Vérification email requise</h4>
                    <p>Les utilisateurs doivent vérifier leur email</p>
                  </div>
                  <mat-slide-toggle formControlName="requireEmailVerification"></mat-slide-toggle>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Actions -->
          <div class="form-actions">
            <button mat-raised-button type="button" (click)="resetForm()" [disabled]="saving">
              <mat-icon>refresh</mat-icon>
              Réinitialiser
            </button>
            <button mat-raised-button color="primary" type="submit" [disabled]="!settingsForm.valid || saving">
              <mat-icon>save</mat-icon>
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .settings-page {
      padding: 24px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .page-header {
      margin-bottom: 24px;
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .page-header h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
    }

    .page-header h1 mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #8B2E2E;
    }

    .subtitle {
      margin: 0;
      color: #64748b;
      font-size: 14px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      gap: 16px;
    }

    .settings-card {
      margin-bottom: 24px;
    }

    .settings-card mat-card-header {
      padding-bottom: 16px;
    }

    .settings-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .toggle-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .toggle-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .toggle-info h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .toggle-info p {
      margin: 0;
      font-size: 14px;
      color: #64748b;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding: 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `]
})
export class SettingsGeneralComponent implements OnInit {
  settingsForm: FormGroup;
  loading = false;
  saving = false;
  originalSettings: GeneralSettings | null = null;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private toastService: ToastService
  ) {
    this.settingsForm = this.fb.group({
      siteName: ['', Validators.required],
      siteDescription: [''],
      siteUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      adminEmail: ['', [Validators.required, Validators.email]],
      supportEmail: ['', [Validators.required, Validators.email]],
      defaultLanguage: ['fr', Validators.required],
      defaultCurrency: ['XOF', Validators.required],
      timezone: ['Africa/Abidjan', Validators.required],
      maintenanceMode: [false],
      allowRegistration: [true],
      requireEmailVerification: [true]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    this.loading = true;
    this.settingsService.getGeneralSettings().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.originalSettings = response.data;
          this.settingsForm.patchValue(response.data);
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur chargement paramètres:', error);
        this.toastService.error('Erreur lors du chargement des paramètres');
        this.loading = false;
      }
    });
  }

  saveSettings(): void {
    if (!this.settingsForm.valid) {
      this.toastService.warning('Veuillez corriger les erreurs du formulaire');
      return;
    }

    this.saving = true;
    this.settingsService.updateGeneralSettings(this.settingsForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Paramètres enregistrés avec succès');
          this.originalSettings = { ...this.settingsForm.value } as GeneralSettings;
        } else {
          this.toastService.error(response.message || 'Erreur lors de l\'enregistrement');
        }
        this.saving = false;
      },
      error: (error: any) => {
        console.error('Erreur enregistrement paramètres:', error);
        this.toastService.error('Erreur lors de l\'enregistrement des paramètres');
        this.saving = false;
      }
    });
  }

  resetForm(): void {
    if (this.originalSettings) {
      this.settingsForm.patchValue(this.originalSettings);
      this.toastService.info('Formulaire réinitialisé');
    }
  }
}




