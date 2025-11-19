// src/app/features/admin/pages/appearance/theme/theme.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { AdminService } from '../../../../../core/services/admin.service';
import { ToastService } from '../../../../../core/services/toast.service';

/**
 * Interface for color settings
 */
interface ColorSettings {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
}

@Component({
  selector: 'app-theme',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss']
})
export class ThemeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Color settings from backend
  colors: ColorSettings = {
    primary_color: '#3b82f6',
    secondary_color: '#8b5cf6',
    accent_color: '#f59e0b'
  };

  // Original colors for reset functionality
  originalColors: ColorSettings = {};

  // Preset themes for quick application
  presetThemes = [
    {
      name: 'Bleu Moderne',
      colors: {
        primary_color: '#3b82f6',
        secondary_color: '#8b5cf6',
        accent_color: '#f59e0b'
      }
    },
    {
      name: 'Vert Nature',
      colors: {
        primary_color: '#10b981',
        secondary_color: '#059669',
        accent_color: '#f59e0b'
      }
    },
    {
      name: 'Orange Vibrant',
      colors: {
        primary_color: '#f97316',
        secondary_color: '#ea580c',
        accent_color: '#eab308'
      }
    },
    {
      name: 'Rose Élégant',
      colors: {
        primary_color: '#ec4899',
        secondary_color: '#d946ef',
        accent_color: '#8b5cf6'
      }
    },
    {
      name: 'Pourpre Royal',
      colors: {
        primary_color: '#8b5cf6',
        secondary_color: '#7c3aed',
        accent_color: '#ec4899'
      }
    },
    {
      name: 'Sombre Élégant',
      colors: {
        primary_color: '#1e293b',
        secondary_color: '#334155',
        accent_color: '#3b82f6'
      }
    }
  ];

  fontFamilies = [
    { value: 'Inter, sans-serif', label: 'Inter' },
    { value: 'Roboto, sans-serif', label: 'Roboto' },
    { value: 'Open Sans, sans-serif', label: 'Open Sans' },
    { value: 'Montserrat, sans-serif', label: 'Montserrat' },
    { value: 'Poppins, sans-serif', label: 'Poppins' },
    { value: 'Raleway, sans-serif', label: 'Raleway' }
  ];

  borderRadiusOptions = [
    { value: '0px', label: 'Aucun' },
    { value: '4px', label: 'Petit' },
    { value: '8px', label: 'Moyen' },
    { value: '12px', label: 'Grand' },
    { value: '16px', label: 'Très Grand' },
    { value: '24px', label: 'Extra Grand' }
  ];

  isLoading = false;
  isSaving = false;

  constructor(
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadColors();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load color settings from the backend
   */
  loadColors(): void {
    this.isLoading = true;
    this.adminService.getAppearanceSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            // Extract color settings from colors category
            const colors = response.data.colors || [];
            this.colors = {
              primary_color: this.findSettingValue(colors, 'primary_color') || '#3b82f6',
              secondary_color: this.findSettingValue(colors, 'secondary_color') || '#8b5cf6',
              accent_color: this.findSettingValue(colors, 'accent_color') || '#f59e0b'
            };
            this.originalColors = { ...this.colors };
            this.applyTheme();
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading colors:', error);
          this.toastService.error('Erreur lors du chargement des couleurs');
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
   * Apply a preset theme
   */
  applyPreset(preset: any): void {
    this.colors.primary_color = preset.colors.primary_color;
    this.colors.secondary_color = preset.colors.secondary_color;
    this.colors.accent_color = preset.colors.accent_color;
    this.applyTheme();
    this.toastService.info(`Thème "${preset.name}" appliqué`);
  }

  /**
   * Apply theme colors to document root for live preview
   */
  applyTheme(): void {
    const root = document.documentElement;
    if (this.colors.primary_color) {
      root.style.setProperty('--primary-color', this.colors.primary_color);
    }
    if (this.colors.secondary_color) {
      root.style.setProperty('--secondary-color', this.colors.secondary_color);
    }
    if (this.colors.accent_color) {
      root.style.setProperty('--accent-color', this.colors.accent_color);
    }
  }

  /**
   * Save color settings to the backend
   */
  saveTheme(): void {
    this.isSaving = true;

    // Prepare settings array for bulk update
    const settings = [
      { key: 'primary_color', value: this.colors.primary_color },
      { key: 'secondary_color', value: this.colors.secondary_color },
      { key: 'accent_color', value: this.colors.accent_color }
    ];

    this.adminService.bulkUpdateAppearanceSettings(settings)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.originalColors = { ...this.colors };
            this.applyTheme();
            this.toastService.success('Thème enregistré avec succès');
          } else {
            this.toastService.error(response.message || 'Erreur lors de l\'enregistrement');
          }
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error saving theme:', error);
          this.toastService.error(
            error.error?.message || 'Erreur lors de l\'enregistrement du thème'
          );
          this.isSaving = false;
        }
      });
  }

  /**
   * Reset colors to default values
   */
  resetTheme(): void {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser le thème aux valeurs par défaut ?')) {
      this.isLoading = true;
      this.adminService.resetAppearanceToDefaults()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.toastService.success('Thème réinitialisé avec succès');
              // Reload colors after reset
              this.loadColors();
            } else {
              this.toastService.error('Erreur lors de la réinitialisation');
              this.isLoading = false;
            }
          },
          error: (error) => {
            console.error('Error resetting theme:', error);
            this.toastService.error('Erreur lors de la réinitialisation du thème');
            this.isLoading = false;
          }
        });
    }
  }

  /**
   * Update individual color and apply live preview
   */
  onColorChange(): void {
    this.applyTheme();
  }

  /**
   * Export theme as JSON file
   */
  exportTheme(): void {
    const themeJson = JSON.stringify(this.colors, null, 2);
    const blob = new Blob([themeJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'theme-afrikmode.json';
    link.click();
    URL.revokeObjectURL(url);
    this.toastService.success('Thème exporté avec succès');
  }

  /**
   * Import theme from JSON file
   */
  importTheme(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const importedTheme = JSON.parse(e.target.result);

          // Validate imported theme
          if (importedTheme.primary_color) this.colors.primary_color = importedTheme.primary_color;
          if (importedTheme.secondary_color) this.colors.secondary_color = importedTheme.secondary_color;
          if (importedTheme.accent_color) this.colors.accent_color = importedTheme.accent_color;

          this.applyTheme();
          this.toastService.success('Thème importé avec succès');
        } catch (error) {
          console.error('Error importing theme:', error);
          this.toastService.error('Erreur lors de l\'importation du thème');
        }
      };
      reader.readAsText(file);
    }
  }

  /**
   * Check if there are unsaved changes
   */
  hasUnsavedChanges(): boolean {
    return JSON.stringify(this.colors) !== JSON.stringify(this.originalColors);
  }

  /**
   * Toggle dark mode (placeholder for future implementation)
   */
  toggleDarkMode(): void {
    // This would be implemented when dark mode is fully supported
    this.toastService.info('Fonctionnalité bientôt disponible');
  }
}
