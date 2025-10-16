// src/app/features/admin/shared/components/confirm-dialog/confirm-dialog.component.ts

import { Component, Input, Output, EventEmitter, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger' | 'error' | 'success';
  icon?: string;
  html?: boolean;
  showCancel?: boolean;
}

export type DialogType = 'info' | 'warning' | 'danger' | 'error' | 'success';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  // Pour utilisation standalone (sans Material Dialog)
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Confirmation';
  @Input() message: string = 'Êtes-vous sûr de vouloir continuer ?';
  @Input() type: DialogType = 'info';
  @Input() confirmText: string = 'Confirmer';
  @Input() cancelText: string = 'Annuler';
  @Input() showCancel: boolean = true;
  @Input() loading: boolean = false;
  @Input() html: boolean = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  // Pour utilisation avec Material Dialog
  data: ConfirmDialogData;

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: ConfirmDialogData | null,
    @Optional() public dialogRef: MatDialogRef<ConfirmDialogComponent> | null
  ) {
    // Si utilisé avec Material Dialog
    if (dialogData) {
      this.data = {
        confirmText: 'Confirmer',
        cancelText: 'Annuler',
        type: 'info',
        html: false,
        showCancel: true,
        ...dialogData
      };
      
      this.title = this.data.title;
      this.message = this.data.message;
      this.type = this.data.type as DialogType;
      this.confirmText = this.data.confirmText!;
      this.cancelText = this.data.cancelText!;
      this.html = this.data.html!;
      this.showCancel = this.data.showCancel!;
      this.isOpen = true;
    } else {
      this.data = {} as ConfirmDialogData;
    }
  }

  onConfirm(): void {
    if (!this.loading) {
      // Si utilisé avec Material Dialog
      if (this.dialogRef) {
        this.dialogRef.close(true);
      } else {
        // Si utilisé en standalone
        this.confirm.emit();
      }
    }
  }

  onCancel(): void {
    if (!this.loading) {
      // Si utilisé avec Material Dialog
      if (this.dialogRef) {
        this.dialogRef.close(false);
      } else {
        // Si utilisé en standalone
        this.cancel.emit();
        this.onClose();
      }
    }
  }

  onClose(): void {
    if (!this.loading) {
      if (this.dialogRef) {
        this.dialogRef.close(false);
      } else {
        this.close.emit();
      }
    }
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget && !this.loading) {
      this.onClose();
    }
  }

  getIcon(): string {
    if (this.data?.icon) {
      return this.data.icon;
    }

    const icons: { [key in DialogType]: string } = {
      info: 'info',
      warning: 'warning',
      danger: 'error',
      error: 'error',
      success: 'check_circle'
    };
    return icons[this.type];
  }

  getIconClass(): string {
    const normalizedType = this.type === 'error' ? 'danger' : this.type;
    return `dialog-icon-${normalizedType}`;
  }

  get dialogClass(): string {
    const normalizedType = this.type === 'error' ? 'danger' : this.type;
    return `dialog-${normalizedType}`;
  }

  // Méthodes statiques utilitaires pour Material Dialog
  static openDeleteConfirmation(dialog: any, itemName?: string) {
    return dialog.open(ConfirmDialogComponent, {
      width: '450px',
      disableClose: false,
      data: {
        title: 'Confirmer la suppression',
        message: itemName 
          ? `Êtes-vous sûr de vouloir supprimer "${itemName}" ? Cette action est irréversible.`
          : 'Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.',
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        type: 'danger',
        icon: 'delete'
      }
    });
  }

  static openSaveConfirmation(dialog: any) {
    return dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Sauvegarder les modifications',
        message: 'Voulez-vous sauvegarder les modifications apportées ?',
        confirmText: 'Sauvegarder',
        cancelText: 'Annuler',
        type: 'info',
        icon: 'save'
      }
    });
  }

  static openLogoutConfirmation(dialog: any) {
    return dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Déconnexion',
        message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
        confirmText: 'Se déconnecter',
        cancelText: 'Rester connecté',
        type: 'warning',
        icon: 'logout'
      }
    });
  }
}