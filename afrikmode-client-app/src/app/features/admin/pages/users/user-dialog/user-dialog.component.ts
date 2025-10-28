import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

export interface UserDialogData {
  user?: any;
  mode: 'add' | 'edit' | 'view';
}

@Component({
  selector: 'app-user-dialog',
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
    MatNativeDateModule
  ],
  template: `
    <div class="user-dialog">
      <h2 mat-dialog-title>
        <mat-icon>{{ dialogIcon }}</mat-icon>
        {{ dialogTitle }}
      </h2>

      <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content class="dialog-content">
          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Prénom</mat-label>
              <input matInput formControlName="firstName" [readonly]="isViewMode">
              <mat-error *ngIf="userForm.get('firstName')?.hasError('required')">
                Le prénom est requis
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Nom</mat-label>
              <input matInput formControlName="lastName" [readonly]="isViewMode">
              <mat-error *ngIf="userForm.get('lastName')?.hasError('required')">
                Le nom est requis
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" [readonly]="isViewMode">
              <mat-error *ngIf="userForm.get('email')?.hasError('required')">
                L'email est requis
              </mat-error>
              <mat-error *ngIf="userForm.get('email')?.hasError('email')">
                Format d'email invalide
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Téléphone</mat-label>
              <input matInput formControlName="phone" [readonly]="isViewMode">
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Rôle</mat-label>
              <mat-select formControlName="role" [disabled]="isViewMode">
                <mat-option value="customer">Client</mat-option>
                <mat-option value="vendor">Vendeur</mat-option>
                <mat-option value="admin">Admin</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Statut</mat-label>
              <mat-select formControlName="status" [disabled]="isViewMode">
                <mat-option value="active">Actif</mat-option>
                <mat-option value="inactive">Inactif</mat-option>
                <mat-option value="suspended">Suspendu</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row" *ngIf="!isViewMode">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Mot de passe</mat-label>
              <input matInput type="password" formControlName="password" [placeholder]="isEditMode ? 'Laisser vide pour ne pas changer' : ''">
              <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">
                Le mot de passe doit contenir au moins 6 caractères
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Confirmer le mot de passe</mat-label>
              <input matInput type="password" formControlName="confirmPassword">
              <mat-error *ngIf="userForm.get('confirmPassword')?.hasError('mismatch')">
                Les mots de passe ne correspondent pas
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Adresse</mat-label>
              <textarea matInput formControlName="address" rows="3" [readonly]="isViewMode"></textarea>
            </mat-form-field>
          </div>

          <div class="form-row" *ngIf="isViewMode">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Date d'inscription</mat-label>
              <input matInput [value]="userForm.get('createdAt')?.value | date:'dd/MM/yyyy'" readonly>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Dernière connexion</mat-label>
              <input matInput [value]="userForm.get('lastLogin')?.value | date:'dd/MM/yyyy HH:mm'" readonly>
            </mat-form-field>
          </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
          <button mat-button type="button" (click)="onCancel()">
            {{ isViewMode ? 'Fermer' : 'Annuler' }}
          </button>
          <button mat-raised-button color="primary" type="submit" 
                  [disabled]="!userForm.valid || isViewMode" 
                  *ngIf="!isViewMode">
            <mat-icon>{{ isEditMode ? 'save' : 'person_add' }}</mat-icon>
            {{ isEditMode ? 'Modifier' : 'Ajouter' }}
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    .user-dialog {
      min-width: 600px;
      max-width: 800px;
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 24px 0;
      font-size: 24px;
      font-weight: 600;
      color: #1976d2;

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }

    .dialog-content {
      max-height: 70vh;
      overflow-y: auto;
      padding: 0 24px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;

      .form-field {
        flex: 1;
      }
    }

    .form-field {
      width: 100%;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      margin: 0;
      border-top: 1px solid #e0e0e0;

      button {
        margin-left: 8px;
      }
    }

    .mat-mdc-form-field {
      width: 100%;
    }

    textarea {
      resize: vertical;
      min-height: 60px;
    }

    @media (max-width: 768px) {
      .user-dialog {
        min-width: 90vw;
        max-width: 95vw;
      }

      .form-row {
        flex-direction: column;
        gap: 8px;
      }

      .dialog-content {
        padding: 0 16px;
      }

      mat-dialog-actions {
        padding: 16px;
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
export class UserDialogComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  isViewMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData
  ) {
    this.isEditMode = data.mode === 'edit';
    this.isViewMode = data.mode === 'view';
    
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      role: ['customer', Validators.required],
      status: ['active', Validators.required],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      confirmPassword: [''],
      address: [''],
      createdAt: [new Date()],
      lastLogin: [null]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    if (this.data.user) {
      this.userForm.patchValue({
        ...this.data.user,
        password: '',
        confirmPassword: ''
      });
    }
  }

  get dialogTitle(): string {
    switch (this.data.mode) {
      case 'add': return 'Ajouter un utilisateur';
      case 'edit': return 'Modifier l\'utilisateur';
      case 'view': return 'Détails de l\'utilisateur';
      default: return 'Utilisateur';
    }
  }

  get dialogIcon(): string {
    switch (this.data.mode) {
      case 'add': return 'person_add';
      case 'edit': return 'edit';
      case 'view': return 'visibility';
      default: return 'person';
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formValue = { ...this.userForm.value };
      
      // Supprimer les champs vides pour l'édition
      if (this.isEditMode && !formValue.password) {
        delete formValue.password;
        delete formValue.confirmPassword;
      }
      
      this.dialogRef.close({
        action: this.data.mode,
        user: formValue
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
