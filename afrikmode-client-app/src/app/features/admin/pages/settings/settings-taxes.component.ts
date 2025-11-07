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
import { MatTableModule } from '@angular/material/table';
import { SettingsService, TaxSettings } from '../../core/services/settings.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-settings-taxes',
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
    MatTableModule
  ],
  template: `
    <div class="settings-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>
            <mat-icon>receipt_long</mat-icon>
            Paramètres de Taxes & TVA
          </h1>
          <p class="subtitle">Configuration fiscale et règles de taxation</p>
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
          <!-- General Tax Settings -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>settings</mat-icon>
                Configuration générale
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="toggle-item">
                <div class="toggle-info">
                  <h4>Activer les taxes</h4>
                  <p>Active le calcul automatique des taxes</p>
                </div>
                <mat-slide-toggle formControlName="enabled"></mat-slide-toggle>
              </div>

              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Taux de taxe par défaut (%)</mat-label>
                  <input matInput type="number" formControlName="defaultTaxRate" min="0" max="100" step="0.1">
                  <mat-icon matPrefix>percent</mat-icon>
                  <mat-hint>Taux appliqué par défaut</mat-hint>
                </mat-form-field>

                <div class="toggle-item">
                  <div class="toggle-info">
                    <h4>Taxes incluses dans le prix</h4>
                    <p>Les prix affichés incluent déjà les taxes</p>
                  </div>
                  <mat-slide-toggle formControlName="taxIncluded"></mat-slide-toggle>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Tax Rules -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>rule</mat-icon>
                Règles de taxation
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="rules-list">
                @if (taxRules.length > 0) {
                  <table mat-table [dataSource]="taxRules" class="mat-elevation-z0">
                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef>Nom</th>
                      <td mat-cell *matCellDef="let rule">{{ rule.name }}</td>
                    </ng-container>
                    <ng-container matColumnDef="rate">
                      <th mat-header-cell *matHeaderCellDef>Taux (%)</th>
                      <td mat-cell *matCellDef="let rule">{{ rule.rate }}%</td>
                    </ng-container>
                    <ng-container matColumnDef="countries">
                      <th mat-header-cell *matHeaderCellDef>Pays</th>
                      <td mat-cell *matCellDef="let rule">{{ rule.countries.join(', ') || 'Tous' }}</td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="taxColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: taxColumns;"></tr>
                  </table>
                } @else {
                  <p class="empty-text">Aucune règle de taxation configurée</p>
                }
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
      color: #8b5cf6;
    }

    .settings-card {
      margin-bottom: 24px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
      margin-top: 24px;
    }

    .toggle-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .rules-list {
      margin-top: 16px;
    }

    table {
      width: 100%;
    }

    .empty-text {
      color: #64748b;
      font-size: 14px;
      font-style: italic;
      text-align: center;
      padding: 24px;
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
export class SettingsTaxesComponent implements OnInit {
  settingsForm: FormGroup;
  loading = false;
  saving = false;
  taxRules: any[] = [];
  taxColumns = ['name', 'rate', 'countries'];
  originalSettings: TaxSettings | null = null;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private toastService: ToastService
  ) {
    this.settingsForm = this.fb.group({
      enabled: [true],
      defaultTaxRate: [18, [Validators.required, Validators.min(0), Validators.max(100)]],
      taxIncluded: [false]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    this.loading = true;
    this.settingsService.getTaxSettings().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.originalSettings = response.data;
          this.settingsForm.patchValue({
            enabled: response.data.enabled !== false,
            defaultTaxRate: response.data.defaultTaxRate || 18,
            taxIncluded: response.data.taxIncluded || false
          });
          this.taxRules = response.data.taxRules || [];
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
      taxRules: this.taxRules
    };

    this.settingsService.updateTaxSettings(settings).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Paramètres de taxes enregistrés');
          this.originalSettings = { ...settings } as TaxSettings;
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
      this.taxRules = [...this.originalSettings.taxRules];
      this.toastService.info('Formulaire réinitialisé');
    }
  }
}



