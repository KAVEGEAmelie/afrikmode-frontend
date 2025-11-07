import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SettingsService, SecuritySettings } from '../../core/services/settings.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-settings-security',
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
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="settings-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>
            <mat-icon>security</mat-icon>
            Paramètres de Sécurité
          </h1>
          <p class="subtitle">Configuration de la sécurité et des authentifications</p>
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
          <!-- Password Policy -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>lock</mat-icon>
                Politique de mot de passe
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Longueur minimale</mat-label>
                  <input matInput type="number" formControlName="passwordMinLength" min="6" max="20" required>
                  <mat-icon matPrefix>password</mat-icon>
                  <mat-hint>Entre 6 et 20 caractères</mat-hint>
                </mat-form-field>

                <div class="toggle-item">
                  <div class="toggle-info">
                    <h4>Mot de passe fort requis</h4>
                    <p>Exige majuscules, minuscules, chiffres et caractères spéciaux</p>
                  </div>
                  <mat-slide-toggle formControlName="requireStrongPassword"></mat-slide-toggle>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Session Management -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>timer</mat-icon>
                Gestion des sessions
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Délai d'expiration (minutes)</mat-label>
                  <input matInput type="number" formControlName="sessionTimeout" min="5" max="1440" required>
                  <mat-icon matPrefix>schedule</mat-icon>
                  <mat-hint>Durée d'inactivité avant déconnexion</mat-hint>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Nombre max de tentatives</mat-label>
                  <input matInput type="number" formControlName="maxLoginAttempts" min="3" max="10" required>
                  <mat-icon matPrefix>block</mat-icon>
                  <mat-hint>Après ce nombre, le compte est bloqué</mat-hint>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Two-Factor Authentication -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>verified_user</mat-icon>
                Authentification à deux facteurs
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="toggle-list">
                <div class="toggle-item">
                  <div class="toggle-info">
                    <h4>Activer 2FA</h4>
                    <p>Exige une authentification à deux facteurs pour les admins</p>
                  </div>
                  <mat-slide-toggle formControlName="enable2FA"></mat-slide-toggle>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Security Features -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>shield</mat-icon>
                Fonctionnalités de sécurité
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="toggle-list">
                <div class="toggle-item">
                  <div class="toggle-info">
                    <h4>Activer CAPTCHA</h4>
                    <p>Protection contre les robots et spam</p>
                  </div>
                  <mat-slide-toggle formControlName="enableCaptcha"></mat-slide-toggle>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- IP Management -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>router</mat-icon>
                Gestion des adresses IP
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="ip-section">
                <div class="ip-list">
                  <h4>IPs autorisées</h4>
                  <div class="chips-container">
                    <mat-chip *ngFor="let ip of allowedIPs">{{ ip }}</mat-chip>
                    @if (allowedIPs.length === 0) {
                      <span class="empty-text">Aucune restriction</span>
                    }
                  </div>
                </div>

                <div class="ip-list">
                  <h4>IPs bloquées</h4>
                  <div class="chips-container">
                    <mat-chip *ngFor="let ip of blockedIPs" color="warn">{{ ip }}</mat-chip>
                    @if (blockedIPs.length === 0) {
                      <span class="empty-text">Aucune IP bloquée</span>
                    }
                  </div>
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
      color: #ef4444;
    }

    .settings-card {
      margin-bottom: 24px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
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

    .ip-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .ip-list h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .chips-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .empty-text {
      color: #64748b;
      font-size: 14px;
      font-style: italic;
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
export class SettingsSecurityComponent implements OnInit {
  settingsForm: FormGroup;
  loading = false;
  saving = false;
  allowedIPs: string[] = [];
  blockedIPs: string[] = [];
  originalSettings: SecuritySettings | null = null;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private toastService: ToastService
  ) {
    this.settingsForm = this.fb.group({
      passwordMinLength: [8, [Validators.required, Validators.min(6), Validators.max(20)]],
      requireStrongPassword: [true],
      sessionTimeout: [30, [Validators.required, Validators.min(5)]],
      maxLoginAttempts: [5, [Validators.required, Validators.min(3), Validators.max(10)]],
      enable2FA: [false],
      enableCaptcha: [true]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    this.loading = true;
    this.settingsService.getSecuritySettings().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.originalSettings = response.data;
          this.settingsForm.patchValue(response.data);
          this.allowedIPs = response.data.allowedIPs || [];
          this.blockedIPs = response.data.blockedIPs || [];
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
    const settings = {
      ...this.settingsForm.value,
      allowedIPs: this.allowedIPs,
      blockedIPs: this.blockedIPs
    };

    this.settingsService.updateSecuritySettings(settings).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Paramètres de sécurité enregistrés');
          this.originalSettings = { ...settings } as SecuritySettings;
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
      this.settingsForm.patchValue(this.originalSettings);
      this.allowedIPs = [...this.originalSettings.allowedIPs];
      this.blockedIPs = [...this.originalSettings.blockedIPs];
      this.toastService.info('Formulaire réinitialisé');
    }
  }
}




