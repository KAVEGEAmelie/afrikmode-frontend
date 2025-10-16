import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AdminAuthService, LoginRequest } from '../../core/services/admin-auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatCheckboxModule
  ],
  template: `
    <div class="admin-login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <mat-icon>admin_panel_settings</mat-icon>
            <h1>AfrikMode</h1>
          </div>
          <p class="subtitle">Administration</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-fields">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput 
                     type="email" 
                     formControlName="email" 
                     placeholder="admin@afrikmode.com"
                     autocomplete="email">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                L'email est requis
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Veuillez entrer un email valide
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mot de passe</mat-label>
              <input matInput 
                     [type]="hidePassword ? 'password' : 'text'" 
                     formControlName="password" 
                     placeholder="••••••••"
                     autocomplete="current-password">
              <button mat-icon-button 
                      matSuffix 
                      type="button"
                      (click)="hidePassword = !hidePassword"
                      [attr.aria-label]="'Cacher le mot de passe'"
                      [attr.aria-pressed]="hidePassword">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Le mot de passe est requis
              </mat-error>
              <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
                Le mot de passe doit contenir au moins 6 caractères
              </mat-error>
            </mat-form-field>

            <div class="form-options">
              <mat-checkbox formControlName="rememberMe">
                Se souvenir de moi
              </mat-checkbox>
              <a href="#" class="forgot-password" (click)="onForgotPassword($event)">
                Mot de passe oublié ?
              </a>
            </div>

            <div *ngIf="showTwoFactor" class="two-factor-section">
              <mat-divider></mat-divider>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Code de vérification</mat-label>
                <input matInput 
                       type="text" 
                       formControlName="twoFactorCode" 
                       placeholder="123456"
                       maxlength="6">
                <mat-icon matSuffix>security</mat-icon>
                <mat-hint>Entrez le code à 6 chiffres de votre authentificateur</mat-hint>
              </mat-form-field>
            </div>
          </div>

          <div class="form-actions">
            <button mat-raised-button 
                    color="primary" 
                    type="submit" 
                    class="login-button"
                    [disabled]="loginForm.invalid || loading">
              <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
              <span *ngIf="!loading">
                <mat-icon>login</mat-icon>
                {{ showTwoFactor ? 'Vérifier' : 'Se connecter' }}
              </span>
            </button>
          </div>

          <div *ngIf="errorMessage" class="error-message">
            <mat-icon>error</mat-icon>
            {{ errorMessage }}
          </div>
        </form>

        <div class="login-footer">
          <p>© 2024 AfrikMode. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  loading = false;
  errorMessage = '';
  showTwoFactor = false;
  returnUrl = '';

  constructor(
    private fb: FormBuilder,
    private adminAuth: AdminAuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
      twoFactorCode: ['']
    });
  }

  ngOnInit(): void {
    // Récupérer l'URL de retour depuis les paramètres de requête
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
    
    // Vérifier si l'utilisateur est déjà connecté
    if (this.adminAuth.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const loginData: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    // Ajouter le code 2FA si nécessaire
    if (this.showTwoFactor && this.loginForm.value.twoFactorCode) {
      loginData.twoFactorCode = this.loginForm.value.twoFactorCode;
    }

    this.adminAuth.login(loginData).subscribe({
      next: (response) => {
        this.loading = false;
        
        if (response.success) {
          // Connexion réussie
          this.snackBar.open('Connexion réussie !', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          
          // Rediriger vers l'URL de retour ou le dashboard
          this.router.navigate([this.returnUrl]);
        } else {
          this.errorMessage = response.message || 'Erreur de connexion';
        }
      },
      error: (error) => {
        this.loading = false;
        
        if (error.status === 401) {
          if (error.error?.message?.includes('2FA')) {
            // Demander le code 2FA
            this.showTwoFactor = true;
            this.snackBar.open('Veuillez entrer votre code de vérification', 'Fermer', {
              duration: 5000,
              panelClass: ['info-snackbar']
            });
          } else {
            this.errorMessage = 'Email ou mot de passe incorrect';
          }
        } else if (error.status === 403) {
          this.errorMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
        } else if (error.status === 429) {
          this.errorMessage = 'Trop de tentatives de connexion. Veuillez réessayer plus tard.';
        } else {
          this.errorMessage = error.error?.message || 'Une erreur est survenue lors de la connexion';
        }
      }
    });
  }

  onForgotPassword(event: Event): void {
    event.preventDefault();
    // TODO: Implémenter la réinitialisation du mot de passe
    this.snackBar.open('Fonctionnalité de réinitialisation bientôt disponible', 'Fermer', {
      duration: 3000
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}














