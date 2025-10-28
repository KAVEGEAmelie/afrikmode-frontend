import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['roles'] as string[];
    
    if (!expectedRoles || expectedRoles.length === 0) {
      return true;
    }

    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    const hasRequiredRole = expectedRoles.includes(user.role);
    if (!hasRequiredRole) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}