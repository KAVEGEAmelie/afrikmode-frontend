// src/app/features/admin/pages/appearance/theme/theme.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
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
import { AppearanceService, ThemeSettings } from '../../../core/services/appearance.service';
import { ToastService } from '../../../../../core/services/toast.service';

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
export class ThemeComponent implements OnInit {
  theme: ThemeSettings = {
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    accentColor: '#f59e0b',
    successColor: '#10b981',
    warningColor: '#f59e0b',
    errorColor: '#ef4444',
    backgroundColor: '#ffffff',
    textColor: '#1e293b',
    borderRadius: '8px',
    fontFamily: 'Inter, sans-serif',
    darkMode: false
  };

  presetThemes = [
    {
      name: 'Bleu Moderne',
      colors: {
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
        accentColor: '#f59e0b'
      }
    },
    {
      name: 'Vert Nature',
      colors: {
        primaryColor: '#10b981',
        secondaryColor: '#059669',
        accentColor: '#f59e0b'
      }
    },
    {
      name: 'Orange Vibrant',
      colors: {
        primaryColor: '#f97316',
        secondaryColor: '#ea580c',
        accentColor: '#eab308'
      }
    },
    {
      name: 'Rose Élégant',
      colors: {
        primaryColor: '#ec4899',
        secondaryColor: '#d946ef',
        accentColor: '#8b5cf6'
      }
    },
    {
      name: 'Pourpre Royal',
      colors: {
        primaryColor: '#8b5cf6',
        secondaryColor: '#7c3aed',
        accentColor: '#ec4899'
      }
    },
    {
      name: 'Sombre Élégant',
      colors: {
        primaryColor: '#1e293b',
        secondaryColor: '#334155',
        accentColor: '#3b82f6'
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

  loading = false;
  saving = false;
  originalTheme: ThemeSettings | null = null;

  constructor(
    private appearanceService: AppearanceService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadTheme();
  }

  loadTheme(): void {
    this.loading = true;
    this.appearanceService.getThemeSettings().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.originalTheme = response.data;
          this.theme = { ...response.data };
          this.applyTheme();
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur chargement thème:', error);
        this.toastService.error('Erreur lors du chargement du thème');
        this.loading = false;
      }
    });
  }

  applyPreset(preset: any): void {
    this.theme.primaryColor = preset.colors.primaryColor;
    this.theme.secondaryColor = preset.colors.secondaryColor;
    this.theme.accentColor = preset.colors.accentColor;
    this.applyTheme();
  }

  applyTheme(): void {
    // Apply theme to document root
    const root = document.documentElement;
    root.style.setProperty('--primary-color', this.theme.primaryColor);
    root.style.setProperty('--secondary-color', this.theme.secondaryColor);
    root.style.setProperty('--accent-color', this.theme.accentColor);
    root.style.setProperty('--success-color', this.theme.successColor);
    root.style.setProperty('--warning-color', this.theme.warningColor);
    root.style.setProperty('--error-color', this.theme.errorColor);
    root.style.setProperty('--background-color', this.theme.backgroundColor);
    root.style.setProperty('--text-color', this.theme.textColor);
    root.style.setProperty('--border-radius', this.theme.borderRadius);
    root.style.setProperty('--font-family', this.theme.fontFamily);

    console.log('🎨 Theme applied!');
  }

  saveTheme(): void {
    this.saving = true;
    this.appearanceService.updateThemeSettings(this.theme).subscribe({
      next: (response) => {
        if (response.success) {
          this.applyTheme();
          this.originalTheme = { ...this.theme };
          this.toastService.success('Thème enregistré avec succès');
        } else {
          this.toastService.error(response.message || 'Erreur lors de l\'enregistrement');
        }
        this.saving = false;
      },
      error: (error: any) => {
        console.error('Erreur enregistrement thème:', error);
        this.toastService.error('Erreur lors de l\'enregistrement du thème');
        this.saving = false;
      }
    });
  }

  resetTheme(): void {
    this.theme = {
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      accentColor: '#f59e0b',
      successColor: '#10b981',
      warningColor: '#f59e0b',
      errorColor: '#ef4444',
      backgroundColor: '#ffffff',
      textColor: '#1e293b',
      borderRadius: '8px',
      fontFamily: 'Inter, sans-serif',
      darkMode: false
    };
    this.applyTheme();
  }

  toggleDarkMode(): void {
    this.theme.darkMode = !this.theme.darkMode;
    if (this.theme.darkMode) {
      this.theme.backgroundColor = '#0f172a';
      this.theme.textColor = '#f1f5f9';
    } else {
      this.theme.backgroundColor = '#ffffff';
      this.theme.textColor = '#1e293b';
    }
    this.applyTheme();
  }

  exportTheme(): void {
    const themeJson = JSON.stringify(this.theme, null, 2);
    const blob = new Blob([themeJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'theme-afrikmode.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  importTheme(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const importedTheme = JSON.parse(e.target.result);
          this.theme = { ...this.theme, ...importedTheme };
          this.applyTheme();
          console.log('✅ Theme imported!');
        } catch (error) {
          console.error('❌ Error importing theme:', error);
        }
      };
      reader.readAsText(file);
    }
  }
}
