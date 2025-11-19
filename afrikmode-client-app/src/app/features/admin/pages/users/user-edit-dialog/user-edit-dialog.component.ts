import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AdminUser, UserRoleType, UserStatus } from '../../../core/models/admin-user.model';

export interface UserEditDialogData {
  user: AdminUser;
}

@Component({
  selector: 'app-user-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  template: `
    <div class="user-edit-dialog">
      <div class="dialog-header">
        <mat-icon class="header-icon">edit</mat-icon>
        <h2 mat-dialog-title>Modifier l'utilisateur</h2>
        <button mat-icon-button (click)="onClose()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <form [formGroup]="userForm" class="user-form">

          <!-- Informations personnelles -->
          <div class="form-section">
            <h3>Informations personnelles</h3>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Prénom</mat-label>
                <input matInput formControlName="first_name" placeholder="Entrez le prénom">
                <mat-error *ngIf="userForm.get('first_name')?.touched && userForm.get('first_name')?.errors">
                  {{ getErrorMessage('first_name') }}
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Nom de famille</mat-label>
                <input matInput formControlName="last_name" placeholder="Entrez le nom de famille">
                <mat-error *ngIf="userForm.get('last_name')?.touched && userForm.get('last_name')?.errors">
                  {{ getErrorMessage('last_name') }}
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" placeholder="utilisateur@example.com">
                <mat-icon matSuffix>email</mat-icon>
                <mat-error *ngIf="userForm.get('email')?.touched && userForm.get('email')?.errors">
                  {{ getErrorMessage('email') }}
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Téléphone</mat-label>
                <input matInput formControlName="phone" placeholder="+33 1 23 45 67 89">
                <mat-icon matSuffix>phone</mat-icon>
                <mat-error *ngIf="userForm.get('phone')?.touched && userForm.get('phone')?.errors">
                  {{ getErrorMessage('phone') }}
                </mat-error>
              </mat-form-field>
            </div>
          </div>

          <!-- Permissions et statut -->
          <div class="form-section">
            <h3>Permissions et statut</h3>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Rôle</mat-label>
                <mat-select formControlName="role">
                  <mat-option *ngFor="let role of roles" [value]="role.value">
                    {{ role.label }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="userForm.get('role')?.touched && userForm.get('role')?.errors">
                  {{ getErrorMessage('role') }}
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Statut</mat-label>
                <mat-select formControlName="status">
                  <mat-option *ngFor="let status of statuses" [value]="status.value">
                    {{ status.label }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="userForm.get('status')?.touched && userForm.get('status')?.errors">
                  {{ getErrorMessage('status') }}
                </mat-error>
              </mat-form-field>
            </div>

            <div class="checkbox-row">
              <mat-checkbox formControlName="is_verified">
                Email vérifié
              </mat-checkbox>

              <mat-checkbox formControlName="two_factor_enabled">
                Authentification à deux facteurs
              </mat-checkbox>
            </div>
          </div>

          <!-- Notes administrateur -->
          <div class="form-section">
            <h3>Notes administrateur</h3>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Notes (optionnel)</mat-label>
              <textarea matInput
                        formControlName="admin_notes"
                        placeholder="Notes internes sur cet utilisateur..."
                        rows="4">
              </textarea>
            </mat-form-field>
          </div>

        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onClose()">
          Annuler
        </button>
        <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!userForm.valid">
          <mat-icon>save</mat-icon>
          Enregistrer
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .user-edit-dialog {
      min-width: 650px;
      max-width: 800px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e0e0e0;
      position: relative;

      .header-icon {
        color: #1976d2;
        font-size: 28px;
        width: 28px;
        height: 28px;
      }

      h2 {
        margin: 0;
        flex: 1;
        font-size: 22px;
        font-weight: 600;
        color: #333;
      }

      .close-btn {
        position: absolute;
        top: -8px;
        right: -8px;
      }
    }

    .dialog-content {
      max-height: 70vh;
      overflow-y: auto;
      padding: 0;
    }

    .user-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-section {
      h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #555;
        padding-bottom: 8px;
        border-bottom: 2px solid #e0e0e0;
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 8px;
    }

    .form-field {
      width: 100%;
    }

    .full-width {
      width: 100%;
    }

    .checkbox-row {
      display: flex;
      gap: 24px;
      margin-top: 12px;

      mat-checkbox {
        flex: 1;
      }
    }

    mat-dialog-actions {
      padding: 16px 0 0 0;
      margin: 0;
      border-top: 1px solid #e0e0e0;

      button {
        margin-left: 8px;
        min-width: 120px;
      }
    }

    @media (max-width: 768px) {
      .user-edit-dialog {
        min-width: 95vw;
        max-width: 95vw;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .checkbox-row {
        flex-direction: column;
        gap: 12px;
      }

      mat-dialog-actions {
        flex-direction: column-reverse;
        gap: 8px;

        button {
          margin: 0;
          width: 100%;
        }
      }
    }
  `]
})
export class UserEditDialogComponent implements OnInit {
  userForm!: FormGroup;

  roles: {value: UserRoleType, label: string}[] = [
    { value: 'customer', label: 'Client' },
    { value: 'vendor', label: 'Vendeur' },
    { value: 'admin', label: 'Administrateur' }
  ];

  statuses: {value: UserStatus, label: string}[] = [
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
    { value: 'suspended', label: 'Suspendu' },
    { value: 'banned', label: 'Banni' }
  ];

  constructor(
    private dialogRef: MatDialogRef<UserEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserEditDialogData,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    if (this.data.user) {
      this.userForm.patchValue(this.data.user);
    }
  }

  initializeForm() {
    this.userForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9+\-\s()]+$/)]],
      role: ['customer', Validators.required],
      status: ['active', Validators.required],
      is_verified: [false],
      two_factor_enabled: [false],
      admin_notes: ['']
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (control?.hasError('email')) {
      return 'Email invalide';
    }
    if (control?.hasError('minlength')) {
      return 'Minimum 2 caractères requis';
    }
    if (control?.hasError('pattern')) {
      return 'Format invalide';
    }
    return '';
  }

  onSave(): void {
    if (this.userForm.valid) {
      this.dialogRef.close(this.userForm.value);
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
