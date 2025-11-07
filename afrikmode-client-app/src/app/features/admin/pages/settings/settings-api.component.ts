import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { SettingsService, ApiSettings } from '../../core/services/settings.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-settings-api',
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
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  template: `
    <div class="settings-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>
            <mat-icon>api</mat-icon>
            Configuration API
          </h1>
          <p class="subtitle">Gestion de l'API et des clés d'accès</p>
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
          <!-- API Status -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>power_settings_new</mat-icon>
                État de l'API
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="toggle-item">
                <div class="toggle-info">
                  <h4>Activer l'API</h4>
                  <p>Permet l'accès à l'API REST de la plateforme</p>
                </div>
                <mat-slide-toggle formControlName="enableApi"></mat-slide-toggle>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- API Key -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>vpn_key</mat-icon>
                Clé API
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="api-key-section">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Clé API actuelle</mat-label>
                  <input matInput [value]="apiKey" readonly>
                  <mat-icon matPrefix>key</mat-icon>
                  <button mat-icon-button matSuffix (click)="copyApiKey()" type="button">
                    <mat-icon>content_copy</mat-icon>
                  </button>
                </mat-form-field>
                <button mat-stroked-button type="button" (click)="generateNewKey()" [disabled]="generating">
                  <mat-icon>refresh</mat-icon>
                  {{ generating ? 'Génération...' : 'Générer une nouvelle clé' }}
                </button>
                <p class="warning-text">
                  <mat-icon>warning</mat-icon>
                  Attention: La génération d'une nouvelle clé invalidera l'ancienne
                </p>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- API Configuration -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>settings</mat-icon>
                Configuration
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Limite de taux (requêtes/minute)</mat-label>
                  <input matInput type="number" formControlName="rateLimit" min="10" max="10000">
                  <mat-icon matPrefix>speed</mat-icon>
                  <mat-hint>Nombre maximum de requêtes par minute</mat-hint>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>URL Webhook</mat-label>
                  <input matInput formControlName="webhookUrl" type="url" placeholder="https://example.com/webhook">
                  <mat-icon matPrefix>webhook</mat-icon>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Allowed Origins -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>public</mat-icon>
                Origines autorisées (CORS)
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="origins-section">
                <div class="chips-container">
                  <mat-chip *ngFor="let origin of allowedOrigins">{{ origin }}</mat-chip>
                  @if (allowedOrigins.length === 0) {
                    <span class="empty-text">Toutes les origines autorisées</span>
                  }
                </div>
                <p class="info-text">Les origines autorisées contrôlent quels domaines peuvent accéder à l'API</p>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Actions -->
          <div class="form-actions">
            <button mat-raised-button type="button" (click)="resetForm()" [disabled]="saving">
              <mat-icon>refresh</mat-icon>
              Réinitialiser
            </button>
            <button mat-raised-button color="primary" type="submit" [disabled]="saving">
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
      color: #06b6d4;
    }

    .settings-card {
      margin-bottom: 24px;
    }

    .toggle-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .api-key-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .warning-text {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f59e0b;
      font-size: 14px;
      margin: 0;
    }

    .warning-text mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .origins-section {
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .chips-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }

    .empty-text {
      color: #64748b;
      font-size: 14px;
      font-style: italic;
    }

    .info-text {
      margin: 0;
      color: #64748b;
      font-size: 14px;
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
export class SettingsApiComponent implements OnInit {
  settingsForm: FormGroup;
  loading = false;
  saving = false;
  generating = false;
  apiKey = '';
  allowedOrigins: string[] = [];
  originalSettings: ApiSettings | null = null;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private toastService: ToastService
  ) {
    this.settingsForm = this.fb.group({
      enableApi: [false],
      rateLimit: [100, [Validators.required, Validators.min(10), Validators.max(10000)]],
      webhookUrl: ['']
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    this.loading = true;
    this.settingsService.getApiSettings().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.originalSettings = response.data;
          this.apiKey = response.data.apiKey || '';
          this.allowedOrigins = response.data.allowedOrigins || [];
          this.settingsForm.patchValue({
            enableApi: response.data.enableApi || false,
            rateLimit: response.data.rateLimit || 100,
            webhookUrl: response.data.webhookUrl || ''
          });
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

  generateNewKey(): void {
    this.generating = true;
    this.settingsService.generateApiKey().subscribe({
      next: (response) => {
        if (response.success) {
          this.apiKey = response.apiKey;
          this.toastService.success('Nouvelle clé API générée avec succès');
        } else {
          this.toastService.error(response.message || 'Erreur lors de la génération');
        }
        this.generating = false;
      },
      error: (error: any) => {
        console.error('Erreur génération clé:', error);
        this.toastService.error('Erreur lors de la génération de la clé');
        this.generating = false;
      }
    });
  }

  copyApiKey(): void {
    navigator.clipboard.writeText(this.apiKey).then(() => {
      this.toastService.success('Clé API copiée dans le presse-papiers');
    }).catch(() => {
      this.toastService.error('Erreur lors de la copie');
    });
  }

  saveSettings(): void {
    if (!this.settingsForm.valid) {
      this.toastService.warning('Veuillez corriger les erreurs du formulaire');
      return;
    }

    this.saving = true;
    const settings = {
      ...this.settingsForm.value,
      apiKey: this.apiKey,
      allowedOrigins: this.allowedOrigins
    };

    this.settingsService.updateApiSettings(settings).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Paramètres API enregistrés');
          this.originalSettings = { ...settings } as ApiSettings;
        } else {
          this.toastService.error(response.message || 'Erreur lors de l\'enregistrement');
        }
        this.saving = false;
      },
      error: (error: any) => {
        console.error('Erreur enregistrement:', error);
        this.toastService.error('Erreur lors de l\'enregistrement');
        this.saving = false;
      }
    });
  }

  resetForm(): void {
    if (this.originalSettings) {
      this.apiKey = this.originalSettings.apiKey;
      this.allowedOrigins = [...this.originalSettings.allowedOrigins];
      this.settingsForm.patchValue(this.originalSettings);
      this.toastService.info('Formulaire réinitialisé');
    }
  }
}



