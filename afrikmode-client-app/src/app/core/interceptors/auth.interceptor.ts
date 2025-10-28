import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Ajouter le token d'authentification si disponible
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    req = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': localStorage.getItem('language') || 'fr',
        'X-Currency': localStorage.getItem('currency') || 'XOF'
      }
    });
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Token expiré ou invalide - essayer de rafraîchir
        return authService.refreshToken().pipe(
          switchMap((authResponse) => {
            // Token rafraîchi avec succès, retry la requête
            const newReq = req.clone({
              setHeaders: {
                'Authorization': `Bearer ${authResponse.token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Accept-Language': localStorage.getItem('language') || 'fr',
                'X-Currency': localStorage.getItem('currency') || 'XOF'
              }
            });
            return next(newReq);
          }),
          catchError((refreshError) => {
            // Impossible de rafraîchir le token, rediriger vers la page de connexion
            authService.logout().subscribe();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      } else if (error.status === 403) {
        // Accès refusé
        console.error('Accès refusé - Permissions insuffisantes');
      }
      return throwError(() => error);
    })
  );
};