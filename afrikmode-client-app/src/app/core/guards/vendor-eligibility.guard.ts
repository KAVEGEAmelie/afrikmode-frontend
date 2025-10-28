import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class VendorEligibilityGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    // Vérifier si l'utilisateur est déjà vendeur
    if (user.role === 'vendor') {
      this.router.navigate(['/vendor']);
      return false;
    }

    // Vérifier si l'utilisateur est déjà admin
    if (user.role === 'admin') {
      this.router.navigate(['/admin']);
      return false;
    }

    // Seuls les clients peuvent devenir vendeurs
    return user.role === 'customer';
  }
}