// src/app/features/admin/pages/appearance/logo/logo.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { AdminService } from '../../../../../core/services/admin.service';
import { ToastService } from '../../../../../core/services/toast.service';

/**
 * Interface for logo settings
 */
interface LogoSettings {
  site_logo?: string;
  site_logo_dark?: string;
  site_favicon?: string;
}

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon>image</mat-icon>
          Logo & Favicon
        </h1>
        <p class="page-subtitle">Personnalisez le logo et le favicon de votre plateforme</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Chargement des logos...</p>
      </div>

      <div *ngIf="!isLoading">
        <!-- Site Logo -->
        <mat-card class="upload-card">
          <h3>Logo Principal</h3>
          <p class="description">Logo affiché en mode clair (recommandé: 200x50px, PNG ou SVG)</p>

          <div class="current-logo" *ngIf="logos.site_logo">
            <p class="label">Logo actuel:</p>
            <img [src]="logos.site_logo" alt="Logo actuel" class="logo-preview">
          </div>

          <div class="upload-zone" (click)="logoFileInput.click()">
            <mat-icon>cloud_upload</mat-icon>
            <p>Glissez-déposez votre logo ici ou cliquez pour parcourir</p>
            <button mat-raised-button color="primary" [disabled]="uploading.logo">
              <mat-spinner *ngIf="uploading.logo" diameter="20"></mat-spinner>
              <span *ngIf="!uploading.logo">Choisir un fichier</span>
              <span *ngIf="uploading.logo">Upload en cours...</span>
            </button>
          </div>
          <input
            #logoFileInput
            type="file"
            accept="image/*"
            style="display: none"
            (change)="onLogoFileSelected($event, 'logo')">
        </mat-card>

        <!-- Dark Mode Logo -->
        <mat-card class="upload-card">
          <h3>Logo Mode Sombre</h3>
          <p class="description">Logo affiché en mode sombre (recommandé: 200x50px, PNG ou SVG)</p>

          <div class="current-logo" *ngIf="logos.site_logo_dark">
            <p class="label">Logo actuel:</p>
            <img [src]="logos.site_logo_dark" alt="Logo mode sombre" class="logo-preview">
          </div>

          <div class="upload-zone" (click)="logoDarkFileInput.click()">
            <mat-icon>cloud_upload</mat-icon>
            <p>Glissez-déposez votre logo mode sombre ici</p>
            <button mat-raised-button color="primary" [disabled]="uploading.logo_dark">
              <mat-spinner *ngIf="uploading.logo_dark" diameter="20"></mat-spinner>
              <span *ngIf="!uploading.logo_dark">Choisir un fichier</span>
              <span *ngIf="uploading.logo_dark">Upload en cours...</span>
            </button>
          </div>
          <input
            #logoDarkFileInput
            type="file"
            accept="image/*"
            style="display: none"
            (change)="onLogoFileSelected($event, 'logo_dark')">
        </mat-card>

        <!-- Favicon -->
        <mat-card class="upload-card">
          <h3>Favicon</h3>
          <p class="description">Icône affichée dans l'onglet du navigateur (format: .ico, .png, 32x32 ou 64x64)</p>

          <div class="current-logo" *ngIf="logos.site_favicon">
            <p class="label">Favicon actuel:</p>
            <img [src]="logos.site_favicon" alt="Favicon actuel" class="favicon-preview">
          </div>

          <div class="upload-zone" (click)="faviconFileInput.click()">
            <mat-icon>cloud_upload</mat-icon>
            <p>Format: .ico, .png (32x32 ou 64x64)</p>
            <button mat-raised-button color="primary" [disabled]="uploading.favicon">
              <mat-spinner *ngIf="uploading.favicon" diameter="20"></mat-spinner>
              <span *ngIf="!uploading.favicon">Choisir un fichier</span>
              <span *ngIf="uploading.favicon">Upload en cours...</span>
            </button>
          </div>
          <input
            #faviconFileInput
            type="file"
            accept="image/x-icon,image/png"
            style="display: none"
            (change)="onLogoFileSelected($event, 'favicon')">
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .admin-page { padding: 24px; background: #f8f9fa; min-height: 100%; }
    .page-header { margin-bottom: 32px; }
    .page-title { display: flex; align-items: center; gap: 12px; margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #1e293b; }
    .page-title mat-icon { font-size: 36px; width: 36px; height: 36px; color: #3b82f6; }
    .page-subtitle { margin: 0; color: #64748b; font-size: 16px; }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      gap: 20px;
    }
    .loading-container p { color: #64748b; font-size: 16px; }

    .upload-card { padding: 32px; margin-bottom: 24px; border-radius: 16px; }
    .upload-card h3 { margin: 0 0 8px 0; font-size: 18px; font-weight: 600; }
    .upload-card .description { margin: 0 0 20px 0; color: #64748b; font-size: 14px; }

    .current-logo {
      margin-bottom: 20px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
      text-align: center;
    }
    .current-logo .label {
      margin: 0 0 12px 0;
      color: #64748b;
      font-size: 14px;
      font-weight: 500;
    }
    .logo-preview {
      max-width: 300px;
      max-height: 100px;
      object-fit: contain;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      background: white;
    }
    .favicon-preview {
      width: 64px;
      height: 64px;
      object-fit: contain;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px;
      background: white;
    }

    .upload-zone {
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      padding: 48px;
      text-align: center;
      background: #f8fafc;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .upload-zone:hover {
      border-color: #3b82f6;
      background: #eff6ff;
    }
    .upload-zone mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #94a3b8;
      margin-bottom: 16px;
    }
    .upload-zone p { margin: 0 0 16px 0; color: #64748b; }
    .upload-zone button {
      pointer-events: none;
    }
    .upload-zone button mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }
  `]
})
export class LogoComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isLoading = false;
  logos: LogoSettings = {};

  // Track upload state for each logo type
  uploading = {
    logo: false,
    logo_dark: false,
    favicon: false
  };

  constructor(
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadLogos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load current logo settings from the backend
   */
  loadLogos(): void {
    this.isLoading = true;
    this.adminService.getAppearanceSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            // Extract logo settings from branding category
            const branding = response.data.branding || [];
            this.logos = {
              site_logo: this.findSettingValue(branding, 'site_logo'),
              site_logo_dark: this.findSettingValue(branding, 'site_logo_dark'),
              site_favicon: this.findSettingValue(branding, 'site_favicon')
            };
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading logos:', error);
          this.toastService.error('Erreur lors du chargement des logos');
          this.isLoading = false;
        }
      });
  }

  /**
   * Find setting value by key in settings array
   */
  private findSettingValue(settings: any[], key: string): string | undefined {
    const setting = settings.find(s => s.key === key);
    return setting?.value;
  }

  /**
   * Handle file selection for logo upload
   */
  onLogoFileSelected(event: Event, type: 'logo' | 'logo_dark' | 'favicon'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.toastService.error('Veuillez sélectionner un fichier image valide');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.toastService.error('Le fichier ne doit pas dépasser 5MB');
      return;
    }

    // Map component type to API type
    const apiType = type === 'logo' ? 'logo' : type === 'logo_dark' ? 'logo_dark' : 'favicon';

    this.uploadLogo(file, apiType, type);
  }

  /**
   * Upload logo file to the backend
   */
  private uploadLogo(file: File, apiType: string, componentType: 'logo' | 'logo_dark' | 'favicon'): void {
    this.uploading[componentType] = true;

    this.adminService.uploadAppearanceFile(apiType as any, file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            // Update local logo display
            const settingKey = `site_${apiType}`;
            (this.logos as any)[settingKey] = response.data.value;

            this.toastService.success('Logo uploadé avec succès');
          } else {
            this.toastService.error('Erreur lors de l\'upload du logo');
          }
          this.uploading[componentType] = false;
        },
        error: (error) => {
          console.error('Error uploading logo:', error);
          this.toastService.error(
            error.error?.message || 'Erreur lors de l\'upload du logo'
          );
          this.uploading[componentType] = false;
        }
      });
  }
}
