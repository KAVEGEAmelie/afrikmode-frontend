import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface PromotionData {
  id?: string;
  name: string;
  type: 'percentage' | 'fixed' | 'shipping' | 'bundle' | 'flash';
  value?: number;
  discount?: number; // Alias pour value (pour compatibilité)
  code?: string;
  description?: string;
  status: 'active' | 'scheduled' | 'expired' | 'paused';
  start_date: string;
  end_date: string;
  usage_limit?: number;
  min_purchase?: number;
  products?: string[];
  categories?: string[];
}

@Component({
  selector: 'app-promotion-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="promotion-dialog">
      <h2 mat-dialog-title>
        <mat-icon>{{ getDialogIcon() }}</mat-icon>
        {{ data.promotion ? 'Modifier la promotion' : getDialogTitle() }}
      </h2>

      <mat-dialog-content>
        <form [formGroup]="promotionForm" class="promotion-form">
          <mat-form-field appearance="outline">
            <mat-label>Nom de la promotion</mat-label>
            <input matInput formControlName="name" placeholder="Ex: Soldes de Janvier">
            <mat-icon matPrefix>label</mat-icon>
            @if (promotionForm.get('name')?.hasError('required') && promotionForm.get('name')?.touched) {
              <mat-error>Le nom est obligatoire</mat-error>
            }
          </mat-form-field>

          @if (data.type !== 'bundle' && data.type !== 'flash') {
            <mat-form-field appearance="outline">
              <mat-label>Code promo (optionnel)</mat-label>
              <input matInput formControlName="code" placeholder="Ex: SOLDE20">
              <mat-icon matPrefix>confirmation_number</mat-icon>
              <button mat-icon-button matSuffix (click)="generateCode()" type="button" matTooltip="Générer un code">
                <mat-icon>refresh</mat-icon>
              </button>
            </mat-form-field>
          }

          @if (data.type === 'percentage' || data.type === 'fixed') {
            <mat-form-field appearance="outline">
              <mat-label>{{ data.type === 'percentage' ? 'Pourcentage de réduction' : 'Montant de réduction (FCFA)' }}</mat-label>
              <input matInput type="number" formControlName="value" 
                     [placeholder]="data.type === 'percentage' ? 'Ex: 20' : 'Ex: 5000'"
                     [min]="data.type === 'percentage' ? 1 : 0"
                     [attr.max]="data.type === 'percentage' ? 100 : null">
              <mat-icon matPrefix>{{ data.type === 'percentage' ? 'percent' : 'money_off' }}</mat-icon>
              @if (promotionForm.get('value')?.hasError('required') && promotionForm.get('value')?.touched) {
                <mat-error>La valeur est obligatoire</mat-error>
              }
              @if (promotionForm.get('value')?.hasError('min') || promotionForm.get('value')?.hasError('max')) {
                <mat-error>
                  @if (data.type === 'percentage') {
                    Le pourcentage doit être entre 1% et 100%
                  } @else {
                    Le montant doit être supérieur à 0
                  }
                </mat-error>
              }
            </mat-form-field>
          }

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Date de début</mat-label>
              <input matInput [matDatepicker]="startPicker" formControlName="start_date">
              <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
              <mat-icon matPrefix>calendar_today</mat-icon>
              @if (promotionForm.get('start_date')?.hasError('required') && promotionForm.get('start_date')?.touched) {
                <mat-error>La date de début est obligatoire</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date de fin</mat-label>
              <input matInput [matDatepicker]="endPicker" formControlName="end_date">
              <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
              <mat-icon matPrefix>event</mat-icon>
              @if (promotionForm.get('end_date')?.hasError('required') && promotionForm.get('end_date')?.touched) {
                <mat-error>La date de fin est obligatoire</mat-error>
              }
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Limite d'utilisation (optionnel)</mat-label>
            <input matInput type="number" formControlName="usage_limit" placeholder="Ex: 100" min="1">
            <mat-icon matPrefix>people</mat-icon>
            <mat-hint>Laissez vide pour une utilisation illimitée</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Montant minimum d'achat (FCFA)</mat-label>
            <input matInput type="number" formControlName="min_purchase" placeholder="Ex: 10000" min="0">
            <mat-icon matPrefix>shopping_cart</mat-icon>
            <mat-hint>Montant minimum pour appliquer la promotion</mat-hint>
          </mat-form-field>

          @if (data.type === 'flash') {
            <div class="alert-info">
              <mat-icon>info</mat-icon>
              <span>La vente flash sera activée immédiatement après la création</span>
            </div>
          }

          @if (data.type === 'bundle') {
            <div class="alert-info">
              <mat-icon>info</mat-icon>
              <span>Sélectionnez les produits à inclure dans le pack après la création</span>
            </div>
          }
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()" type="button">
          <mat-icon>close</mat-icon>
          Annuler
        </button>
        <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!promotionForm.valid" type="button">
          <mat-icon>check</mat-icon>
          {{ data.promotion ? 'Modifier' : 'Créer' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      z-index: 10000 !important;
      position: relative;
    }

    .promotion-dialog {
      min-width: 500px;
      max-width: 600px;
      background: white;
      z-index: 10000 !important;
      position: relative;
    }

    ::ng-deep .promotion-dialog-backdrop {
      background-color: rgba(0, 0, 0, 0.5) !important;
      z-index: 10002 !important; /* Au-dessus du product-form (10001) */
    }

    ::ng-deep .promotion-dialog-panel {
      z-index: 10003 !important; /* Au-dessus du backdrop */
      position: relative;
      background: white !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      transform: translateZ(0); /* Force GPU acceleration */
      will-change: transform;
    }

    .promotion-dialog * {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #2C3E50;
      margin: 0;
      padding: 24px 24px 16px;
    }

    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
      padding: 24px;
    }

    .promotion-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    mat-form-field {
      width: 100%;
    }

    input, textarea, select {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      filter: none !important;
      backdrop-filter: none !important;
      transform: none !important;
    }

    mat-form-field, mat-input, input, textarea {
      filter: none !important;
      backdrop-filter: none !important;
    }

    .alert-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #E3F2FD;
      border-radius: 8px;
      color: #1976D2;
      border-left: 4px solid #1976D2;
    }

    .alert-info mat-icon {
      color: #1976D2;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #E5E7EB;
      gap: 12px;
    }

    mat-dialog-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    @media (max-width: 600px) {
      .promotion-dialog {
        min-width: auto;
        width: 100%;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PromotionDialogComponent implements OnInit {
  promotionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PromotionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      promotion?: PromotionData;
      type: 'percentage' | 'fixed' | 'shipping' | 'bundle' | 'flash';
    }
  ) {
    this.promotionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      code: [''],
      value: [null, this.data.type !== 'shipping' && this.data.type !== 'bundle' ? [Validators.required] : []],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      usage_limit: [null],
      min_purchase: [0]
    });
  }

  ngOnInit() {
    if (this.data.promotion) {
      this.promotionForm.patchValue(this.data.promotion);
    }

    if (this.data.type === 'shipping') {
      this.promotionForm.patchValue({ value: 0 });
    }

    if (this.data.type === 'flash') {
      // Pour les ventes flash, commencer maintenant
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      this.promotionForm.patchValue({
        start_date: now,
        end_date: tomorrow
      });
    }
  }

  getDialogTitle(): string {
    const titles: { [key: string]: string } = {
      'percentage': 'Créer un code de réduction',
      'fixed': 'Créer une réduction fixe',
      'shipping': 'Créer une livraison gratuite',
      'bundle': 'Créer un pack de produits',
      'flash': 'Créer une vente flash'
    };
    return titles[this.data.type] || 'Créer une promotion';
  }

  getDialogIcon(): string {
    const icons: { [key: string]: string } = {
      'percentage': 'percent',
      'fixed': 'money_off',
      'shipping': 'local_shipping',
      'bundle': 'inventory_2',
      'flash': 'flash_on'
    };
    return icons[this.data.type] || 'local_offer';
  }

  generateCode(): void {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.promotionForm.patchValue({ code });
  }

  onSubmit(): void {
    if (this.promotionForm.valid) {
      const formValue = this.promotionForm.value;
      const promotion: PromotionData = {
        ...formValue,
        type: this.data.type,
        status: this.data.type === 'flash' ? 'active' : 'scheduled',
        start_date: formValue.start_date.toISOString(),
        end_date: formValue.end_date.toISOString()
      };
      
      if (this.data.promotion) {
        promotion.id = this.data.promotion.id;
      }
      
      this.dialogRef.close(promotion);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

