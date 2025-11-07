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
import { SettingsService, EmailSettings } from '../../core/services/settings.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-settings-email',
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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="settings-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>
            <mat-icon>email</mat-icon>
            Configuration Email
          </h1>
          <p class="subtitle">Paramètres SMTP pour l'envoi d'emails</p>
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
          <!-- SMTP Configuration -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>settings</mat-icon>
                Configuration SMTP
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Serveur SMTP</mat-label>
                  <input matInput formControlName="smtpHost" required>
                  <mat-icon matPrefix>dns</mat-icon>
                  <mat-hint>Ex: smtp.gmail.com</mat-hint>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Port SMTP</mat-label>
                  <input matInput type="number" formControlName="smtpPort" required>
                  <mat-icon matPrefix>pin</mat-icon>
                  <mat-hint>Généralement 587 ou 465</mat-hint>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Utilisateur SMTP</mat-label>
                  <input matInput formControlName="smtpUser" required>
                  <mat-icon matPrefix>person</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Mot de passe SMTP</mat-label>
                  <input matInput type="password" formControlName="smtpPassword" required>
                  <mat-icon matPrefix>lock</mat-icon>
                </mat-form-field>

                <div class="toggle-item">
                  <div class="toggle-info">
                    <h4>Connexion sécurisée (TLS/SSL)</h4>
                    <p>Activez pour les ports 465 ou 587 avec TLS</p>
                  </div>
                  <mat-slide-toggle formControlName="smtpSecure"></mat-slide-toggle>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Email Settings -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>send</mat-icon>
                Paramètres d'envoi
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Email expéditeur</mat-label>
                  <input matInput type="email" formControlName="fromEmail" required>
                  <mat-icon matPrefix>email</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Nom expéditeur</mat-label>
                  <input matInput formControlName="fromName" required>
                  <mat-icon matPrefix>badge</mat-icon>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Test Email -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>mark_email_read</mat-icon>
                Test d'envoi
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email de test</mat-label>
                  <input matInput type="email" [(ngModel)]="testEmail" [ngModelOptions]="{standalone: true}" placeholder="email@example.com">
                  <mat-icon matPrefix>mail</mat-icon>
                </mat-form-field>
              </div>
              <button mat-stroked-button type="button" (click)="sendTestEmail()" [disabled]="testing || !testEmail">
                <mat-icon>send</mat-icon>
                {{ testing ? 'Envoi en cours...' : 'Envoyer un email de test' }}
              </button>
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
      color: #3b82f6;
    }

    .settings-card {
      margin-bottom: 24px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .toggle-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
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
export class SettingsEmailComponent implements OnInit {
  settingsForm: FormGroup;
  loading = false;
  saving = false;
  testing = false;
  testEmail = '';
  originalSettings: EmailSettings | null = null;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private toastService: ToastService
  ) {
    this.settingsForm = this.fb.group({
      smtpHost: ['', Validators.required],
      smtpPort: [587, [Validators.required, Validators.min(1), Validators.max(65535)]],
      smtpUser: ['', Validators.required],
      smtpPassword: ['', Validators.required],
      smtpSecure: [true],
      fromEmail: ['', [Validators.required, Validators.email]],
      fromName: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    this.loading = true;
    this.settingsService.getEmailSettings().subscribe({
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
    this.settingsService.updateEmailSettings(this.settingsForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Paramètres email enregistrés');
          this.originalSettings = { ...this.settingsForm.value } as EmailSettings;
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

  sendTestEmail(): void {
    if (!this.testEmail || !this.settingsForm.valid) {
      this.toastService.warning('Veuillez remplir tous les champs et un email de test');
      return;
    }

    this.testing = true;
    const settings = { ...this.settingsForm.value, testEmail: this.testEmail };
    this.settingsService.testEmailSettings(settings).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Email de test envoyé avec succès');
        } else {
          this.toastService.error(response.message || 'Erreur lors de l\'envoi');
        }
        this.testing = false;
      },
      error: (error: any) => {
        console.error('Erreur test email:', error);
        this.toastService.error('Erreur lors de l\'envoi de l\'email de test');
        this.testing = false;
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


