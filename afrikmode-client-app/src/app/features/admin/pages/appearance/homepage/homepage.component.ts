// src/app/features/admin/pages/appearance/homepage/homepage.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { AdminService } from '../../../../../core/services/admin.service';
import { ToastService } from '../../../../../core/services/toast.service';

/**
 * Interface for homepage settings
 */
interface HomepageSettings {
  hero_title?: string;
  hero_subtitle?: string;
  hero_image?: string;
}

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon>home</mat-icon>
          Page d'Accueil
        </h1>
        <p class="page-subtitle">Configurez le contenu de la page d'accueil</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Chargement des paramètres...</p>
      </div>

      <div *ngIf="!isLoading">
        <form [formGroup]="homepageForm" (ngSubmit)="saveSettings()">
          <!-- Hero Section -->
          <mat-card class="section-card">
            <h3>
              <mat-icon>image</mat-icon>
              Section Hero (Bannière Principale)
            </h3>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Titre Principal</mat-label>
              <input matInput formControlName="hero_title" placeholder="Ex: Bienvenue sur AfrikMode">
              <mat-hint>Le titre affiché en grand sur la bannière</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Sous-titre</mat-label>
              <textarea
                matInput
                formControlName="hero_subtitle"
                placeholder="Ex: Découvrez la mode africaine authentique"
                rows="3"></textarea>
              <mat-hint>Description affichée sous le titre</mat-hint>
            </mat-form-field>

            <!-- Hero Image Upload -->
            <div class="image-upload-section">
              <label class="section-label">Image de la bannière</label>
              <p class="description">Image d'arrière-plan de la section hero (recommandé: 1920x600px)</p>

              <div class="current-image" *ngIf="currentHeroImage">
                <p class="label">Image actuelle:</p>
                <img [src]="currentHeroImage" alt="Hero image" class="hero-preview">
              </div>

              <div class="upload-zone" (click)="heroImageInput.click()">
                <mat-icon>cloud_upload</mat-icon>
                <p>Cliquez pour choisir une image</p>
                <button mat-raised-button color="primary" type="button" [disabled]="isUploadingHeroImage">
                  <mat-spinner *ngIf="isUploadingHeroImage" diameter="20"></mat-spinner>
                  <span *ngIf="!isUploadingHeroImage">Choisir une image</span>
                  <span *ngIf="isUploadingHeroImage">Upload en cours...</span>
                </button>
              </div>
              <input
                #heroImageInput
                type="file"
                accept="image/*"
                style="display: none"
                (change)="onHeroImageSelected($event)">
            </div>
          </mat-card>

          <!-- Preview Section -->
          <mat-card class="section-card preview-card">
            <h3>
              <mat-icon>visibility</mat-icon>
              Aperçu de la bannière
            </h3>

            <div class="hero-preview-container">
              <div
                class="hero-preview-content"
                [style.background-image]="currentHeroImage ? 'url(' + currentHeroImage + ')' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'">
                <div class="hero-overlay">
                  <h1>{{ homepageForm.get('hero_title')?.value || 'Titre de la bannière' }}</h1>
                  <p>{{ homepageForm.get('hero_subtitle')?.value || 'Sous-titre de la bannière' }}</p>
                  <button class="hero-cta">Explorer</button>
                </div>
              </div>
            </div>
          </mat-card>

          <!-- Save Button -->
          <div class="actions-row">
            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="isSaving || homepageForm.invalid || !homepageForm.dirty">
              <mat-spinner *ngIf="isSaving" diameter="20"></mat-spinner>
              <mat-icon *ngIf="!isSaving">save</mat-icon>
              <span *ngIf="!isSaving">Enregistrer les modifications</span>
              <span *ngIf="isSaving">Enregistrement...</span>
            </button>
          </div>
        </form>
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

    .section-card { padding: 32px; margin-bottom: 24px; border-radius: 16px; }
    .section-card h3 { display: flex; align-items: center; gap: 12px; margin: 0 0 24px 0; font-size: 18px; font-weight: 600; }
    .section-card h3 mat-icon { color: #3b82f6; }

    .full-width { width: 100%; margin-bottom: 20px; }

    .image-upload-section { margin-top: 24px; }
    .section-label { display: block; margin-bottom: 8px; font-size: 16px; font-weight: 600; color: #1e293b; }
    .description { margin: 0 0 16px 0; color: #64748b; font-size: 14px; }

    .current-image {
      margin-bottom: 20px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
      text-align: center;
    }
    .current-image .label {
      margin: 0 0 12px 0;
      color: #64748b;
      font-size: 14px;
      font-weight: 500;
    }
    .hero-preview {
      max-width: 100%;
      max-height: 300px;
      object-fit: cover;
      border-radius: 8px;
      border: 2px solid #e2e8f0;
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

    .preview-card { background: #f8fafc; }
    .hero-preview-container { margin-top: 20px; }
    .hero-preview-content {
      position: relative;
      width: 100%;
      height: 400px;
      background-size: cover;
      background-position: center;
      border-radius: 12px;
      overflow: hidden;
    }
    .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      padding: 40px;
      text-align: center;
    }
    .hero-overlay h1 {
      margin: 0 0 16px 0;
      font-size: 48px;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .hero-overlay p {
      margin: 0 0 32px 0;
      font-size: 20px;
      max-width: 600px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
    .hero-cta {
      padding: 16px 48px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .hero-cta:hover {
      background: #2563eb;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }

    .actions-row {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
    }
    .actions-row button {
      height: 48px;
      padding: 0 32px;
      font-weight: 600;
    }
    .actions-row button mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }
    .actions-row button mat-icon {
      margin-right: 8px;
    }
  `]
})
export class HomepageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  homepageForm!: FormGroup;
  isLoading = false;
  isSaving = false;
  isUploadingHeroImage = false;
  currentHeroImage?: string;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private toastService: ToastService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadHomepageSettings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize the form with default values
   */
  private initForm(): void {
    this.homepageForm = this.fb.group({
      hero_title: ['', [Validators.required, Validators.maxLength(200)]],
      hero_subtitle: ['', [Validators.maxLength(500)]],
      hero_image: ['']
    });
  }

  /**
   * Load homepage settings from the backend
   */
  loadHomepageSettings(): void {
    this.isLoading = true;
    this.adminService.getAppearanceSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            // Extract homepage settings
            const homepage = response.data.homepage || [];
            const settings: HomepageSettings = {
              hero_title: this.findSettingValue(homepage, 'hero_title') || '',
              hero_subtitle: this.findSettingValue(homepage, 'hero_subtitle') || '',
              hero_image: this.findSettingValue(homepage, 'hero_image') || ''
            };

            // Update form values
            this.homepageForm.patchValue({
              hero_title: settings.hero_title,
              hero_subtitle: settings.hero_subtitle,
              hero_image: settings.hero_image
            });

            this.currentHeroImage = settings.hero_image;

            // Mark form as pristine after loading
            this.homepageForm.markAsPristine();
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading homepage settings:', error);
          this.toastService.error('Erreur lors du chargement des paramètres');
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
   * Handle hero image file selection
   */
  onHeroImageSelected(event: Event): void {
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

    // Validate file size (max 10MB for hero images)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      this.toastService.error('Le fichier ne doit pas dépasser 10MB');
      return;
    }

    this.uploadHeroImage(file);
  }

  /**
   * Upload hero image to the backend
   */
  private uploadHeroImage(file: File): void {
    this.isUploadingHeroImage = true;

    this.adminService.uploadAppearanceFile('hero_image', file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.currentHeroImage = response.data.value;
            this.homepageForm.patchValue({ hero_image: response.data.value });
            this.homepageForm.markAsDirty();
            this.toastService.success('Image uploadée avec succès');
          } else {
            this.toastService.error('Erreur lors de l\'upload de l\'image');
          }
          this.isUploadingHeroImage = false;
        },
        error: (error) => {
          console.error('Error uploading hero image:', error);
          this.toastService.error(
            error.error?.message || 'Erreur lors de l\'upload de l\'image'
          );
          this.isUploadingHeroImage = false;
        }
      });
  }

  /**
   * Save homepage settings to the backend
   */
  saveSettings(): void {
    if (this.homepageForm.invalid) {
      this.toastService.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isSaving = true;

    const formValue = this.homepageForm.value;

    // Prepare settings array for bulk update
    const settings = [
      { key: 'hero_title', value: formValue.hero_title },
      { key: 'hero_subtitle', value: formValue.hero_subtitle },
      { key: 'hero_image', value: formValue.hero_image || this.currentHeroImage || '' }
    ];

    this.adminService.bulkUpdateAppearanceSettings(settings)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.homepageForm.markAsPristine();
            this.toastService.success('Paramètres enregistrés avec succès');
          } else {
            this.toastService.error(response.message || 'Erreur lors de l\'enregistrement');
          }
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error saving homepage settings:', error);
          this.toastService.error(
            error.error?.message || 'Erreur lors de l\'enregistrement des paramètres'
          );
          this.isSaving = false;
        }
      });
  }
}
