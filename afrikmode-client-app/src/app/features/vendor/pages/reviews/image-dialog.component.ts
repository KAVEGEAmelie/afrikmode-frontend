import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface DialogData {
  imageUrl: string;
}

@Component({
  selector: 'app-image-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="image-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>image</mat-icon>
          Image de l'avis
        </h2>
        <button mat-icon-button (click)="onClose()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <div class="image-container">
          <img [src]="data.imageUrl" [alt]="imageAlt" class="review-image">
        </div>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-button (click)="downloadImage()">
          <mat-icon>download</mat-icon>
          Télécharger
        </button>
        <button mat-button (click)="onClose()">
          Fermer
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .image-dialog {
      max-width: 90vw;
      max-height: 90vh;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .dialog-header h2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      color: #8B2E2E;
    }

    .image-container {
      display: flex;
      justify-content: center;
      align-items: center;
      max-height: 70vh;
      overflow: hidden;
    }

    .review-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    mat-dialog-actions {
      justify-content: flex-end;
      gap: 0.5rem;
    }
  `]
})
export class ImageDialogComponent {
  imageAlt = "Image de l'avis";

  constructor(
    public dialogRef: MatDialogRef<ImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  downloadImage(): void {
    const link = document.createElement('a');
    link.href = this.data.imageUrl;
    link.download = `avis-image-${Date.now()}.jpg`;
    link.click();
  }
}
