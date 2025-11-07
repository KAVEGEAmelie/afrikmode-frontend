import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { SettingsService, PaymentSettings } from '../../core/services/settings.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-settings-payments',
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
    MatCheckboxModule,
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
            <mat-icon>payment</mat-icon>
            Paramètres de Paiement
          </h1>
          <p class="subtitle">Configuration des moyens de paiement</p>
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
          <!-- Payment Methods -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>credit_card</mat-icon>
                Moyens de paiement
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="methods-grid">
                <div class="method-item" *ngFor="let method of availableMethods">
                  <mat-checkbox 
                    [checked]="isMethodEnabled(method.value)"
                    (change)="toggleMethod(method.value, $event.checked)">
                    {{ method.label }}
                  </mat-checkbox>
                  <mat-icon>{{ method.icon }}</mat-icon>
                </div>
              </div>

              <div class="selected-methods">
                <h4>Méthodes activées:</h4>
                <div class="chips-container">
                  <mat-chip *ngFor="let method of enabledMethods">{{ getMethodLabel(method) }}</mat-chip>
                  @if (enabledMethods.length === 0) {
                    <span class="empty-text">Aucune méthode activée</span>
                  }
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Payment Configuration -->
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
                  <mat-label>Méthode par défaut</mat-label>
                  <mat-select formControlName="defaultMethod">
                    <mat-option *ngFor="let method of enabledMethods" [value]="method">
                      {{ getMethodLabel(method) }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Devise</mat-label>
                  <mat-select formControlName="currency">
                    <mat-option value="XOF">XOF (Franc CFA)</mat-option>
                    <mat-option value="EUR">EUR (Euro)</mat-option>
                    <mat-option value="USD">USD (Dollar)</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Taux de commission (%)</mat-label>
                  <input matInput type="number" formControlName="commissionRate" min="0" max="100" step="0.1">
                  <mat-icon matPrefix>percent</mat-icon>
                  <mat-hint>Taux appliqué sur chaque transaction</mat-hint>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Délai d'expiration (minutes)</mat-label>
                  <input matInput type="number" formControlName="paymentTimeout" min="5" max="60">
                  <mat-icon matPrefix>timer</mat-icon>
                </mat-form-field>
              </div>

              <div class="toggle-item">
                <div class="toggle-info">
                  <h4>Autoriser les remboursements</h4>
                  <p>Permet aux administrateurs de rembourser les commandes</p>
                </div>
                <mat-slide-toggle formControlName="enableRefunds"></mat-slide-toggle>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Actions -->
          <div class="form-actions">
            <button mat-raised-button type="button" (click)="resetForm()" [disabled]="saving">
              <mat-icon>refresh</mat-icon>
              Réinitialiser
            </button>
            <button mat-raised-button color="primary" type="submit" [disabled]="saving || enabledMethods.length === 0">
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
      color: #10b981;
    }

    .settings-card {
      margin-bottom: 24px;
    }

    .methods-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .method-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .method-item mat-icon {
      color: #64748b;
    }

    .selected-methods {
      padding: 16px;
      background: #f0fdf4;
      border-radius: 8px;
      border: 1px solid #86efac;
    }

    .selected-methods h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #166534;
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

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
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
export class SettingsPaymentsComponent implements OnInit {
  settingsForm: FormGroup;
  loading = false;
  saving = false;
  enabledMethods: string[] = [];
  availableMethods = [
    { value: 'stripe', label: 'Stripe', icon: 'credit_card' },
    { value: 'paypal', label: 'PayPal', icon: 'account_balance_wallet' },
    { value: 'mobile_money', label: 'Mobile Money', icon: 'phone_android' },
    { value: 'bank_transfer', label: 'Virement bancaire', icon: 'account_balance' },
    { value: 'cash_on_delivery', label: 'Paiement à la livraison', icon: 'local_shipping' }
  ];
  originalSettings: PaymentSettings | null = null;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private toastService: ToastService
  ) {
    this.settingsForm = this.fb.group({
      defaultMethod: ['', Validators.required],
      currency: ['XOF', Validators.required],
      commissionRate: [5, [Validators.required, Validators.min(0), Validators.max(100)]],
      paymentTimeout: [15, [Validators.required, Validators.min(5), Validators.max(60)]],
      enableRefunds: [true]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    this.loading = true;
    this.settingsService.getPaymentSettings().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.originalSettings = response.data;
          this.enabledMethods = response.data.enabledMethods || [];
          this.settingsForm.patchValue({
            defaultMethod: response.data.defaultMethod || '',
            currency: response.data.currency || 'XOF',
            commissionRate: response.data.commissionRate || 5,
            paymentTimeout: response.data.paymentTimeout || 15,
            enableRefunds: response.data.enableRefunds !== false
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

  isMethodEnabled(method: string): boolean {
    return this.enabledMethods.includes(method);
  }

  toggleMethod(method: string, enabled: boolean): void {
    if (enabled) {
      if (!this.enabledMethods.includes(method)) {
        this.enabledMethods.push(method);
      }
    } else {
      this.enabledMethods = this.enabledMethods.filter(m => m !== method);
      if (this.settingsForm.value.defaultMethod === method) {
        this.settingsForm.patchValue({ defaultMethod: '' });
      }
    }
  }

  getMethodLabel(method: string): string {
    const found = this.availableMethods.find(m => m.value === method);
    return found ? found.label : method;
  }

  saveSettings(): void {
    if (!this.settingsForm.valid || this.enabledMethods.length === 0) {
      this.toastService.warning('Veuillez activer au moins une méthode de paiement');
      return;
    }

    this.saving = true;
    const settings = {
      ...this.settingsForm.value,
      enabledMethods: this.enabledMethods
    };

    this.settingsService.updatePaymentSettings(settings).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Paramètres de paiement enregistrés');
          this.originalSettings = { ...settings } as PaymentSettings;
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
      this.enabledMethods = [...this.originalSettings.enabledMethods];
      this.settingsForm.patchValue(this.originalSettings);
      this.toastService.info('Formulaire réinitialisé');
    }
  }
}
