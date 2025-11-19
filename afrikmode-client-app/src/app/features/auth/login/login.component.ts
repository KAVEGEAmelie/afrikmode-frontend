import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    // Vérifier s'il y a un message de succès (ex: après vérification email)
    this.route.queryParams.subscribe(params => {
      if (params['verified']) {
        this.successMessage = 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.';
        this.toastService.success('✅ Email vérifié avec succès !');
      } else if (params['message']) {
        this.successMessage = params['message'];
      }
    });
  }

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
        const user = response?.user;
        const firstName = user?.first_name || (user as any)?.firstName || 'cher client';
        
        // Toast de succès
        this.toastService.success(`Bienvenue ${firstName} ! 🎉`);
        
        // Charger les données du panier et de la wishlist après connexion
        this.cartService.loadCartData();
        this.wishlistService.loadWishlistData();
        
        // Gérer le cas 2FA requis (si backend renvoie requires_2fa)
        const requires2FA = (response as any)?.requires_2fa || (response as any)?.two_factor_required;
        if (requires2FA) {
          this.router.navigate(['/profile/security']);
          return;
        }

        // Rediriger selon le rôle de l'utilisateur
        this.redirectBasedOnRole();
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

  private redirectBasedOnRole(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/']);
      return;
    }

    switch (user.role) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'vendor':
        this.router.navigate(['/vendor/dashboard']);
        break;
      case 'customer':
      default:
        this.router.navigate(['/']);
        break;
    }
  }
}