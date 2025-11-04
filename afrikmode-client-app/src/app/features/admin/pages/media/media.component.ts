// src/app/features/admin/pages/media/media.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">
            <mat-icon>perm_media</mat-icon>
            Bibliothèque Media
          </h1>
          <p class="page-subtitle">Gérez vos images et fichiers</p>
          <mat-chip-set>
            <mat-chip highlighted>1567 fichiers</mat-chip>
            <mat-chip>245 MB utilisés</mat-chip>
          </mat-chip-set>
        </div>
        <button mat-raised-button color="primary">
          <mat-icon>cloud_upload</mat-icon>
          Téléverser
        </button>
      </div>

      <div class="media-grid">
        <mat-card class="media-item" *ngFor="let i of [1,2,3,4,5,6,7,8,9,10,11,12]">
          <div class="media-thumbnail">
            <mat-icon>image</mat-icon>
          </div>
          <div class="media-info">
            <p class="media-name">image-{{i}}.jpg</p>
            <p class="media-size">256 KB</p>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .admin-page { padding: 24px; background: #f8f9fa; min-height: 100%; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .page-title { display: flex; align-items: center; gap: 12px; margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #1e293b; }
    .page-title mat-icon { font-size: 36px; width: 36px; height: 36px; color: #3b82f6; }
    .page-subtitle { margin: 0 0 12px 0; color: #64748b; font-size: 16px; }
    .media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .media-item { padding: 16px; border-radius: 12px; cursor: pointer; transition: transform 0.2s; }
    .media-item:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    .media-thumbnail { width: 100%; height: 150px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
    .media-thumbnail mat-icon { font-size: 48px; width: 48px; height: 48px; color: #94a3b8; }
    .media-info p { margin: 0; }
    .media-name { font-size: 14px; font-weight: 600; color: #1e293b; }
    .media-size { font-size: 12px; color: #64748b; }
  `]
})
export class MediaComponent {}
