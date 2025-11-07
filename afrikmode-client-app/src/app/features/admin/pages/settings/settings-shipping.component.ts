import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { SettingsService, ShippingSettings, ShippingZone, ShippingRate } from '../../core/services/settings.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-settings-shipping',
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
    MatProgressSpinnerModule,
    MatTableModule
  ],
  template: `
    <div class="settings-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>
            <mat-icon>local_shipping</mat-icon>
            Paramètres de Livraison
          </h1>
          <p class="subtitle">Configuration des zones et tarifs de livraison</p>
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
          <!-- General Settings -->
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
                  <h4>Activer la livraison</h4>
                  <p>Active le système de livraison sur la plateforme</p>
                </div>
                <mat-slide-toggle formControlName="enabled"></mat-slide-toggle>
              </div>

              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Fournisseur par défaut</mat-label>
                  <mat-select formControlName="defaultProvider">
                    <mat-option value="standard">Livraison standard</mat-option>
                    <mat-option value="express">Livraison express</mat-option>
                    <mat-option value="pickup">Retrait en magasin</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Seuil livraison gratuite (XOF)</mat-label>
                  <input matInput type="number" formControlName="freeShippingThreshold" min="0">
                  <mat-icon matPrefix>local_offer</mat-icon>
                  <mat-hint>Montant minimum pour la livraison gratuite</mat-hint>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Shipping Zones -->
          <mat-card class="settings-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>map</mat-icon>
                Zones de livraison
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="zones-list">
                @for (zone of shippingZones.controls; track $index) {
                  <div class="zone-item">
                    <h4>{{ getZoneName($index) }}</h4>
                    <p>Pays: {{ getZoneCountries($index) }}</p>
                    <p>Tarifs: {{ getZoneRates($index) }}</p>
                  </div>
                }
                @if (shippingZones.length === 0) {
                  <p class="empty-text">Aucune zone configurée</p>
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
      color: #f59e0b;
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

    .zones-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .zone-item {
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #f59e0b;
    }

    .zone-item h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .zone-item p {
      margin: 4px 0;
      font-size: 14px;
      color: #64748b;
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
export class SettingsShippingComponent implements OnInit {
  settingsForm: FormGroup;
  loading = false;
  saving = false;
  originalSettings: ShippingSettings | null = null;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private toastService: ToastService
  ) {
    this.settingsForm = this.fb.group({
      enabled: [true],
      defaultProvider: ['standard', Validators.required],
      freeShippingThreshold: [50000, [Validators.min(0)]],
      shippingZones: this.fb.array([])
    });
  }

  get shippingZones(): FormArray {
    return this.settingsForm.get('shippingZones') as FormArray;
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    this.loading = true;
    this.settingsService.getShippingSettings().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.originalSettings = response.data;
          this.settingsForm.patchValue({
            enabled: response.data.enabled !== false,
            defaultProvider: response.data.defaultProvider || 'standard',
            freeShippingThreshold: response.data.freeShippingThreshold || 0
          });
          // TODO: Charger les zones de livraison
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

  getZoneName(index: number): string {
    // TODO: Implémenter
    return `Zone ${index + 1}`;
  }

  getZoneCountries(index: number): string {
    // TODO: Implémenter
    return 'Tous les pays';
  }

  getZoneRates(index: number): string {
    // TODO: Implémenter
    return '0 XOF';
  }

  saveSettings(): void {
    if (!this.settingsForm.valid) {
      this.toastService.warning('Veuillez corriger les erreurs du formulaire');
      return;
    }

    this.saving = true;
    this.settingsService.updateShippingSettings(this.settingsForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Paramètres de livraison enregistrés');
          this.originalSettings = { ...this.settingsForm.value } as ShippingSettings;
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
      this.toastService.info('Formulaire réinitialisé');
    }
  }
}



