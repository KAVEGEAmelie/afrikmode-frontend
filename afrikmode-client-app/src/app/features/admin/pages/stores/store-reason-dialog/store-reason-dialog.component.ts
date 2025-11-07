import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface StoreReasonDialogData {
  title: string;
  message: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
  icon?: string;
  required?: boolean;
}

@Component({
  selector: 'app-store-reason-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="reason-dialog">
      <div class="dialog-header">
        <div class="icon-container" [ngClass]="iconClass">
          <mat-icon>{{ dialogIcon }}</mat-icon>
        </div>
        <h2 mat-dialog-title>{{ data.title }}</h2>
      </div>

      <mat-dialog-content class="dialog-content">
        <p>{{ data.message }}</p>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ data.placeholder || 'Raison' }}</mat-label>
          <textarea 
            matInput 
            [formControl]="reasonControl"
            rows="4"
            placeholder="Entrez la raison..."></textarea>
          <mat-hint *ngIf="data.required !== false">Ce champ est obligatoire</mat-hint>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          {{ data.cancelText || 'Annuler' }}
        </button>
        <button 
          mat-raised-button 
          [color]="buttonColor" 
          [disabled]="data.required !== false && reasonControl.invalid"
          (click)="onConfirm()">
          <mat-icon>{{ confirmIcon }}</mat-icon>
          {{ data.confirmText || 'Confirmer' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .reason-dialog {
      min-width: 450px;
      max-width: 600px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e0e0e0;

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #333;
      }
    }

    .icon-container {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        color: white;
      }

      &.warning {
        background-color: #ff9800;
      }

      &.danger {
        background-color: #f44336;
      }

      &.info {
        background-color: #2196f3;
      }
    }

    .dialog-content {
      padding: 0 0 24px 0;

      p {
        margin: 0 0 16px 0;
        font-size: 16px;
        line-height: 1.5;
        color: #666;
      }

      .full-width {
        width: 100%;
      }
    }

    mat-dialog-actions {
      padding: 16px 0 0 0;
      margin: 0;
      border-top: 1px solid #e0e0e0;

      button {
        margin-left: 8px;
        min-width: 100px;
      }
    }

    @media (max-width: 768px) {
      .reason-dialog {
        min-width: 90vw;
        max-width: 95vw;
      }

      .dialog-header {
        flex-direction: column;
        text-align: center;
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
export class StoreReasonDialogComponent {
  reasonControl!: FormControl;

  constructor(
    private dialogRef: MatDialogRef<StoreReasonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StoreReasonDialogData,
    private fb: FormBuilder
  ) {
    this.reasonControl = this.fb.control('', this.data.required !== false ? [Validators.required] : []);
  }

  get dialogIcon(): string {
    return this.data.icon || this.getDefaultIcon();
  }

  get iconClass(): string {
    return this.data.type || 'info';
  }

  get buttonColor(): string {
    switch (this.data.type) {
      case 'danger': return 'warn';
      case 'warning': return 'accent';
      default: return 'primary';
    }
  }

  get confirmIcon(): string {
    switch (this.data.type) {
      case 'danger': return 'delete';
      case 'warning': return 'warning';
      default: return 'check';
    }
  }

  private getDefaultIcon(): string {
    switch (this.data.type) {
      case 'danger': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  }

  onConfirm(): void {
    if (this.data.required === false || this.reasonControl.valid) {
      this.dialogRef.close(this.reasonControl.value?.trim() || '');
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}

