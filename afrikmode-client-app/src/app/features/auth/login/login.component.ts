import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  
  // Form data
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  
  // UI states
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router,
    private toastService: ToastService
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    // Validation basique
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Adresse email invalide';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Appel API réel
    this.authService.login({ 
      email: this.email, 
      password: this.password,
      remember_me: this.rememberMe 
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Connexion réussie:', response);
        
        // Toast de succès
        this.toastService.success(`Bienvenue ${response.user?.first_name || 'cher client'} ! 🎉`);
        
        // Charger les données du panier et de la wishlist après connexion
        this.cartService.loadCartData();
        this.wishlistService.loadWishlistData();
        
        // Redirection vers la page d'accueil ou tableau de bord
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur de connexion:', error);
        if (error.status === 401) {
          this.errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.status === 429) {
          this.errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer';
        }
      }
    });
  }

  loginWithGoogle(): void {
    console.log('Login with Google');
    // TODO: Implémenter OAuth Google
  }

  loginWithFacebook(): void {
    console.log('Login with Facebook');
    // TODO: Implémenter OAuth Facebook
  }
}