// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

/**
 * Guard pour protéger les routes nécessitant une authentification
 * Redirige vers /login si l'utilisateur n'est pas connecté
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      }

      // Sauvegarder l'URL demandée pour rediriger après connexion
      const returnUrl = state.url;
      
      // Rediriger vers la page de connexion
      router.navigate(['/login'], {
        queryParams: { returnUrl }
      });
      
      return false;
    })
  );
};

/**
 * Guard alternatif utilisant directement le token (plus rapide)
 */
export const quickAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('auth_token');

  if (token) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};