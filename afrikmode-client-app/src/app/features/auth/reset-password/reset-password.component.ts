import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  
  token: string = '';
  password: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isTokenValid: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Récupérer le token depuis l'URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (this.token) {
        this.isTokenValid = true;
      } else {
        this.errorMessage = 'Token de réinitialisation manquant ou invalide';
        this.isTokenValid = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.token) {
      this.errorMessage = 'Token de réinitialisation manquant';
      return;
    }

    if (!this.password) {
      this.errorMessage = 'Veuillez entrer un nouveau mot de passe';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 8 caractères';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Appel API pour réinitialiser le mot de passe
    this.authService.resetPassword({
      token: this.token,
      password: this.password
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Mot de passe réinitialisé:', response);
        this.successMessage = 'Votre mot de passe a été réinitialisé avec succès';
        
        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          this.router.navigate(['/login'], { 
            queryParams: { message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.' }
          });
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur lors de la réinitialisation:', error);
        
        if (error.status === 400) {
          if (error.error?.message?.includes('Token')) {
            this.errorMessage = 'Token de réinitialisation invalide ou expiré';
          } else {
            this.errorMessage = error.error?.message || 'Données invalides';
          }
        } else if (error.status === 404) {
          this.errorMessage = 'Token de réinitialisation introuvable';
        } else if (error.status === 429) {
          this.errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer';
        }
      }
    });
  }

  resendResetEmail(): void {
    this.router.navigate(['/forgot-password']);
  }
}
