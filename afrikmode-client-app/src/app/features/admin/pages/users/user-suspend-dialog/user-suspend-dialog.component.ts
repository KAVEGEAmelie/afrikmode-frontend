import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AdminUser } from '../../../core/models/admin-user.model';

export interface UserSuspendDialogData {
  user: AdminUser;
  action: 'suspend' | 'ban';
}

@Component({
  selector: 'app-user-suspend-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <div class="user-suspend-dialog">
      <div class="dialog-header" [ngClass]="headerClass">
        <div class="icon-container">
          <mat-icon>{{ actionIcon }}</mat-icon>
        </div>
        <div class="header-content">
          <h2 mat-dialog-title>{{ actionTitle }}</h2>
          <p class="user-info">
            {{ data.user.first_name }} {{ data.user.last_name }} ({{ data.user.email }})
          </p>
        </div>
        <button mat-icon-button (click)="onClose()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <form [formGroup]="suspendForm" class="suspend-form">

          <div class="warning-message" *ngIf="data.action === 'ban'">
            <mat-icon>warning</mat-icon>
            <p>
              <strong>Attention :</strong> Le bannissement est une action grave.
              L'utilisateur ne pourra plus accéder à la plateforme.
            </p>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Motif de {{ data.action === 'suspend' ? 'suspension' : 'bannissement' }}</mat-label>
            <mat-select formControlName="reason_template">
              <mat-option value="">Choisir un motif prédéfini</mat-option>
              <mat-option *ngFor="let reason of reasonTemplates" [value]="reason.value">
                {{ reason.label }}
              </mat-option>
              <mat-option value="custom">Autre (spécifier ci-dessous)</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Raison détaillée *</mat-label>
            <textarea matInput
                      formControlName="reason"
                      placeholder="Expliquez pourquoi vous {{ data.action === 'suspend' ? 'suspendez' : 'bannissez' }} cet utilisateur..."
                      rows="5"
                      required>
            </textarea>
            <mat-hint>Cette raison sera enregistrée dans les logs et peut être communiquée à l'utilisateur</mat-hint>
            <mat-error *ngIf="suspendForm.get('reason')?.touched && suspendForm.get('reason')?.errors">
              {{ getErrorMessage('reason') }}
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width" *ngIf="data.action === 'suspend'">
            <mat-label>Durée de suspension</mat-label>
            <mat-select formControlName="duration">
              <mat-option value="permanent">Permanente (jusqu'à réactivation manuelle)</mat-option>
              <mat-option value="7">7 jours</mat-option>
              <mat-option value="14">14 jours</mat-option>
              <mat-option value="30">30 jours</mat-option>
              <mat-option value="90">90 jours</mat-option>
            </mat-select>
          </mat-form-field>

        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onClose()">
          Annuler
        </button>
        <button mat-raised-button
                [color]="data.action === 'ban' ? 'warn' : 'accent'"
                (click)="onConfirm()"
                [disabled]="!suspendForm.valid">
          <mat-icon>{{ actionIcon }}</mat-icon>
          {{ actionButtonText }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .user-suspend-dialog {
      min-width: 550px;
      max-width: 650px;
    }

    .dialog-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 24px;
      padding: 16px;
      border-radius: 8px;
      position: relative;

      &.suspend {
        background-color: #fff3e0;
        border-left: 4px solid #ff9800;
      }

      &.ban {
        background-color: #ffebee;
        border-left: 4px solid #f44336;
      }

      .icon-container {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        mat-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
          color: white;
        }
      }

      &.suspend .icon-container {
        background-color: #ff9800;
      }

      &.ban .icon-container {
        background-color: #f44336;
      }

      .header-content {
        flex: 1;

        h2 {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 600;
          color: #333;
        }

        .user-info {
          margin: 0;
          font-size: 14px;
          color: #666;
        }
      }

      .close-btn {
        position: absolute;
        top: 8px;
        right: 8px;
      }
    }

    .dialog-content {
      max-height: 60vh;
      overflow-y: auto;
      padding: 0;
    }

    .suspend-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .warning-message {
      display: flex;
      gap: 12px;
      padding: 12px;
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      color: #856404;

      mat-icon {
        color: #ff9800;
        flex-shrink: 0;
      }

      p {
        margin: 0;
        font-size: 14px;
        line-height: 1.5;

        strong {
          font-weight: 600;
        }
      }
    }

    .full-width {
      width: 100%;
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
      .user-suspend-dialog {
        min-width: 95vw;
        max-width: 95vw;
      }

      .dialog-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 12px;

        .close-btn {
          position: static;
          align-self: flex-end;
        }
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
export class UserSuspendDialogComponent implements OnInit {
  suspendForm!: FormGroup;

  reasonTemplates = [
    { value: 'spam', label: 'Envoi de spam ou contenu non sollicité' },
    { value: 'harassment', label: 'Harcèlement ou comportement abusif' },
    { value: 'fraud', label: 'Activité frauduleuse ou suspecte' },
    { value: 'violation', label: 'Violation des conditions d\'utilisation' },
    { value: 'payment', label: 'Problèmes de paiement récurrents' },
    { value: 'fake', label: 'Fausses informations ou identité' },
    { value: 'copyright', label: 'Violation de droits d\'auteur' }
  ];

  constructor(
    private dialogRef: MatDialogRef<UserSuspendDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserSuspendDialogData,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    // Écouter les changements de template de raison
    this.suspendForm.get('reason_template')?.valueChanges.subscribe(template => {
      if (template && template !== 'custom') {
        const selectedReason = this.reasonTemplates.find(r => r.value === template);
        if (selectedReason) {
          this.suspendForm.patchValue({
            reason: selectedReason.label
          });
        }
      }
    });
  }

  initializeForm() {
    this.suspendForm = this.fb.group({
      reason_template: [''],
      reason: ['', [Validators.required, Validators.minLength(10)]],
      duration: ['permanent']
    });
  }

  get actionTitle(): string {
    return this.data.action === 'suspend'
      ? 'Suspendre l\'utilisateur'
      : 'Bannir l\'utilisateur';
  }

  get actionIcon(): string {
    return this.data.action === 'suspend' ? 'block' : 'do_not_disturb';
  }

  get actionButtonText(): string {
    return this.data.action === 'suspend' ? 'Suspendre' : 'Bannir';
  }

  get headerClass(): string {
    return this.data.action === 'suspend' ? 'suspend' : 'ban';
  }

  getErrorMessage(fieldName: string): string {
    const control = this.suspendForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (control?.hasError('minlength')) {
      return 'Minimum 10 caractères requis';
    }
    return '';
  }

  onConfirm(): void {
    if (this.suspendForm.valid) {
      const result = {
        action: this.data.action,
        reason: this.suspendForm.value.reason,
        duration: this.suspendForm.value.duration
      };
      this.dialogRef.close(result);
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
