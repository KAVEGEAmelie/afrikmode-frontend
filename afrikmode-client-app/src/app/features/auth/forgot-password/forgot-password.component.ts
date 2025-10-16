import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  
  email: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.email) {
      this.errorMessage = 'Veuillez entrer votre adresse email';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Adresse email invalide';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Appel API réel
    this.authService.forgotPassword({ email: this.email }).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Demande de réinitialisation envoyée:', response);
        this.successMessage = 'Un email de réinitialisation a été envoyé à votre adresse email';
        // Optionnel: rediriger vers une page de confirmation
        // this.router.navigate(['/login'], { 
        //   queryParams: { message: 'Vérifiez votre email pour réinitialiser votre mot de passe' }
        // });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur lors de la réinitialisation:', error);
        if (error.status === 404) {
          this.errorMessage = 'Aucun compte trouvé avec cette adresse email';
        } else if (error.status === 429) {
          this.errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer';
        }
      }
    });
  }
}