// src/app/features/admin/pages/appearance/logo/logo.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon>image</mat-icon>
          Logo & Favicon
        </h1>
        <p class="page-subtitle">Personnalisez le logo et le favicon de votre plateforme</p>
      </div>
      
      <mat-card class="upload-card">
        <h3>Logo Principal</h3>
        <div class="upload-zone">
          <mat-icon>cloud_upload</mat-icon>
          <p>Glissez-déposez votre logo ici ou cliquez pour parcourir</p>
          <button mat-raised-button color="primary">Choisir un fichier</button>
        </div>
      </mat-card>

      <mat-card class="upload-card">
        <h3>Favicon</h3>
        <div class="upload-zone">
          <mat-icon>cloud_upload</mat-icon>
          <p>Format: .ico, .png (32x32 ou 64x64)</p>
          <button mat-raised-button color="primary">Choisir un fichier</button>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-page { padding: 24px; background: #f8f9fa; min-height: 100%; }
    .page-header { margin-bottom: 32px; }
    .page-title { display: flex; align-items: center; gap: 12px; margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #1e293b; }
    .page-title mat-icon { font-size: 36px; width: 36px; height: 36px; color: #3b82f6; }
    .page-subtitle { margin: 0; color: #64748b; font-size: 16px; }
    .upload-card { padding: 32px; margin-bottom: 24px; border-radius: 16px; }
    .upload-card h3 { margin: 0 0 20px 0; font-size: 18px; font-weight: 600; }
    .upload-zone { border: 2px dashed #cbd5e1; border-radius: 12px; padding: 48px; text-align: center; background: #f8fafc; }
    .upload-zone mat-icon { font-size: 64px; width: 64px; height: 64px; color: #94a3b8; margin-bottom: 16px; }
    .upload-zone p { margin: 0 0 16px 0; color: #64748b; }
  `]
})
export class LogoComponent {}
