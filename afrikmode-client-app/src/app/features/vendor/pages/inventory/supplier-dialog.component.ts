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

export interface SupplierData {
  supplier?: any;
}

export interface SupplierResult {
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  leadTime: number;
  paymentTerms: string;
}

@Component({
  selector: 'app-supplier-dialog',
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
    MatCardModule
  ],
  template: `
    <div class="supplier-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>business</mat-icon>
          {{ data.supplier ? 'Modifier le Fournisseur' : 'Nouveau Fournisseur' }}
        </h2>
        <button mat-icon-button (click)="onCancel()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <form class="supplier-form">
          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nom de l'entreprise</mat-label>
              <input matInput [(ngModel)]="supplier.name" name="name" placeholder="Ex: Textiles Africains SARL">
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Contact principal</mat-label>
              <input matInput [(ngModel)]="supplier.contact" name="contact" placeholder="Ex: M. Koffi Mensah">
            </mat-form-field>
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" [(ngModel)]="supplier.email" name="email" placeholder="contact@entreprise.com">
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Téléphone</mat-label>
              <input matInput [(ngModel)]="supplier.phone" name="phone" placeholder="+228 90 12 34 56">
            </mat-form-field>
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Délai de livraison (jours)</mat-label>
              <input matInput type="number" [(ngModel)]="supplier.leadTime" name="leadTime" placeholder="7">
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Adresse</mat-label>
              <input matInput [(ngModel)]="supplier.address" name="address" placeholder="Lomé, Togo">
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Conditions de paiement</mat-label>
              <mat-select [(ngModel)]="supplier.paymentTerms" name="paymentTerms">
                <mat-option value="immediate">Paiement immédiat</mat-option>
                <mat-option value="7_days">7 jours</mat-option>
                <mat-option value="15_days">15 jours</mat-option>
                <mat-option value="30_days">30 jours</mat-option>
                <mat-option value="60_days">60 jours</mat-option>
                <mat-option value="90_days">90 jours</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-actions">
            <button mat-button type="button" (click)="resetForm()">
              <mat-icon>refresh</mat-icon>
              Réinitialiser
            </button>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">Annuler</button>
        <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!isValid()">
          <mat-icon>save</mat-icon>
          {{ data.supplier ? 'Modifier' : 'Créer' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .supplier-dialog {
      max-width: 600px;
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
    }

    .supplier-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
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
      .form-row {
        flex-direction: column;
      }

      .half-width {
        width: 100%;
      }
    }
  `]
})
export class SupplierDialogComponent {
  supplier: SupplierResult = {
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    leadTime: 7,
    paymentTerms: '30_days'
  };

  constructor(
    public dialogRef: MatDialogRef<SupplierDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SupplierData
  ) {
    if (data.supplier) {
      this.supplier = { ...data.supplier };
    }
  }

  isValid(): boolean {
    return this.supplier.name.trim() !== '' &&
           this.supplier.contact.trim() !== '' &&
           this.supplier.email.trim() !== '' &&
           this.supplier.phone.trim() !== '' &&
           this.supplier.address.trim() !== '' &&
           this.supplier.leadTime > 0;
  }

  resetForm(): void {
    this.supplier = {
      name: '',
      contact: '',
      email: '',
      phone: '',
      address: '',
      leadTime: 7,
      paymentTerms: '30_days'
    };
  }

  onSave(): void {
    if (this.isValid()) {
      this.dialogRef.close(this.supplier);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}




























