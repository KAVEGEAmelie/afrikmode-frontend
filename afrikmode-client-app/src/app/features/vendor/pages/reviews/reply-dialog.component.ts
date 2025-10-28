import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

interface DialogData {
  review: any;
  existingReply?: string;
}

@Component({
  selector: 'app-reply-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatCardModule
  ],
  template: `
    <div class="reply-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>reply</mat-icon>
          {{ data.existingReply ? 'Modifier la réponse' : 'Répondre à l\'avis' }}
        </h2>
        <button mat-icon-button (click)="onCancel()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <div class="review-preview">
          <div class="customer-info">
            <div class="customer-avatar">
              @if (data.review.customer.avatar) {
                <img [src]="data.review.customer.avatar" [alt]="data.review.customer.name">
              } @else {
                <mat-icon>person</mat-icon>
              }
            </div>
            <div class="customer-details">
              <h4>{{ data.review.customer.name }}</h4>
              <div class="review-rating">
                @for (star of [1,2,3,4,5]; track star) {
                  <mat-icon [class.filled]="star <= data.review.rating" [class.empty]="star > data.review.rating">
                    {{ star <= data.review.rating ? 'star' : 'star_border' }}
                  </mat-icon>
                }
              </div>
            </div>
          </div>
          
          <div class="review-content">
            <h5>{{ data.review.title }}</h5>
            <p>{{ data.review.content }}</p>
          </div>
        </div>

        <div class="reply-form">
          <mat-form-field appearance="outline" class="reply-input">
            <mat-label>Votre réponse</mat-label>
            <textarea 
              matInput 
              [(ngModel)]="replyContent"
              rows="4"
              maxlength="500"
              placeholder="Écrivez votre réponse professionnelle...">
            </textarea>
            <mat-hint align="end">{{ replyContent.length }}/500</mat-hint>
          </mat-form-field>

          <div class="reply-tips">
            <h4>💡 Conseils pour une bonne réponse :</h4>
            <ul>
              <li>Soyez professionnel et courtois</li>
              <li>Remerciez le client pour son retour</li>
              <li>Adressez les préoccupations spécifiques</li>
              <li>Proposez une solution si nécessaire</li>
            </ul>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-button (click)="onCancel()">
          Annuler
        </button>
        <button 
          mat-raised-button 
          color="primary" 
          (click)="onSave()"
          [disabled]="!replyContent.trim()">
          <mat-icon>send</mat-icon>
          {{ data.existingReply ? 'Modifier' : 'Envoyer' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .reply-dialog {
      max-width: 600px;
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

    .review-preview {
      background: #f9fafb;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }

    .customer-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .customer-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .customer-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .customer-avatar mat-icon {
      font-size: 1.2rem;
      color: #6b7280;
    }

    .customer-details h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
      color: #1f2937;
    }

    .review-rating {
      display: flex;
      gap: 0.25rem;
    }

    .review-rating mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .review-rating mat-icon.filled {
      color: #ffc107;
    }

    .review-rating mat-icon.empty {
      color: #d1d5db;
    }

    .review-content h5 {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
      color: #1f2937;
    }

    .review-content p {
      margin: 0;
      color: #374151;
      line-height: 1.5;
    }

    .reply-form {
      margin-bottom: 1rem;
    }

    .reply-input {
      width: 100%;
    }

    .reply-tips {
      background: #fef3f2;
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1rem;
    }

    .reply-tips h4 {
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
      color: #8B2E2E;
    }

    .reply-tips ul {
      margin: 0;
      padding-left: 1.5rem;
      color: #6b7280;
      font-size: 0.85rem;
    }

    .reply-tips li {
      margin-bottom: 0.25rem;
    }

    mat-dialog-actions {
      justify-content: flex-end;
      gap: 0.5rem;
    }
  `]
})
export class ReplyDialogComponent {
  replyContent: string = '';

  constructor(
    public dialogRef: MatDialogRef<ReplyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    if (data.existingReply) {
      this.replyContent = data.existingReply;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.replyContent.trim()) {
      this.dialogRef.close(this.replyContent.trim());
    }
  }
}











