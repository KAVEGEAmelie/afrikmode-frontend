// src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

/**
 * Guard pour vérifier si l'utilisateur a le rôle requis
 * Utilisation dans les routes : canActivate: [roleGuard], data: { roles: ['admin', 'manager'] }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Récupérer les rôles autorisés depuis la configuration de la route
  const requiredRoles = route.data['roles'] as string[];
  
  if (!requiredRoles || requiredRoles.length === 0) {
    console.warn('No roles specified in route data');
    return true;
  }

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (!user) {
        router.navigate(['/login']);
        return false;
      }

      const hasRole = requiredRoles.includes(user.role);
      
      if (!hasRole) {
        // L'utilisateur n'a pas le bon rôle
        router.navigate(['/unauthorized']);
        return false;
      }

      return true;
    })
  );
};

/**
 * Guard spécifique pour les administrateurs
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (!user) {
        router.navigate(['/login']);
        return false;
      }

      const isAdmin = user.role === 'admin' || user.role === 'super_admin';
      
      if (!isAdmin) {
        router.navigate(['/']);
        return false;
      }

      return true;
    })
  );
};

/**
 * Guard spécifique pour les vendeurs
 */
export const vendorGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (!user) {
        router.navigate(['/login']);
        return false;
      }

      const isVendor = user.role === 'vendor' || user.role === 'admin' || user.role === 'super_admin';
      
      if (!isVendor) {
        router.navigate(['/']);
        return false;
      }

      return true;
    })
  );
};