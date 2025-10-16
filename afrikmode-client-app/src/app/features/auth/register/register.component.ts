import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgIf],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  
  // Form data
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  acceptTerms: boolean = false;
  
  // UI states
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Password strength
  passwordStrength: 'weak' | 'medium' | 'strong' | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  checkPasswordStrength(): void {
    const password = this.password;
    
    if (password.length === 0) {
      this.passwordStrength = null;
      return;
    }

    if (password.length < 6) {
      this.passwordStrength = 'weak';
    } else if (password.length < 10) {
      this.passwordStrength = 'medium';
    } else {
      this.passwordStrength = 'strong';
    }
  }

  onSubmit(): void {
    // Validation
    if (!this.firstName || !this.lastName || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Adresse email invalide';
      return;
    }

    // Validation password
    if (this.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }

    // Validation password match
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    // Validation terms
    if (!this.acceptTerms) {
      this.errorMessage = 'Veuillez accepter les conditions d\'utilisation';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Appel API réel
    this.authService.register({
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      password: this.password,
      password_confirmation: this.confirmPassword,
      terms_accepted: this.acceptTerms
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Inscription réussie:', response);
        // Redirection vers la page de connexion ou confirmation
        this.router.navigate(['/login'], { 
          queryParams: { message: 'Inscription réussie. Vous pouvez maintenant vous connecter.' }
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur d\'inscription:', error);
        if (error.status === 422) {
          // Erreurs de validation
          this.errorMessage = error.error.message || 'Données invalides';
        } else if (error.status === 409) {
          this.errorMessage = 'Cette adresse email est déjà utilisée';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer';
        }
      }
    });
  }

  registerWithGoogle(): void {
    console.log('Register with Google');
    // TODO: Implémenter OAuth Google
  }

  registerWithFacebook(): void {
    console.log('Register with Facebook');
    // TODO: Implémenter OAuth Facebook
  }
}