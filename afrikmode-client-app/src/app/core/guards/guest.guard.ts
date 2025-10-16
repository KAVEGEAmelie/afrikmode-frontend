// src/app/core/guards/guest.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

/**
 * Guard pour les pages accessibles uniquement aux invités (non-connectés)
 * Exemple: pages de login, register, forgot-password
 * Redirige vers la page d'accueil si l'utilisateur est déjà connecté
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        // L'utilisateur est déjà connecté, rediriger vers l'accueil
        router.navigate(['/']);
        return false;
      }

      // L'utilisateur n'est pas connecté, autoriser l'accès
      return true;
    })
  );
};

/**
 * Guard alternatif plus rapide utilisant directement le token
 */
export const quickGuestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('auth_token');

  if (token) {
    router.navigate(['/']);
    return false;
  }

  return true;
};