import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Exclure l'endpoint logout de l'intercepteur pour éviter les boucles
  if (req.url.includes('/auth/logout')) {
    return next(req);
  }

  // Vérifier si c'est un FormData
  const isFormData = req.body instanceof FormData;

  // Ajouter le token d'authentification si disponible
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    const headers: any = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Accept-Language': localStorage.getItem('language') || 'fr',
      'X-Currency': localStorage.getItem('currency') || 'XOF'
    };
    
    // Ne pas définir Content-Type pour FormData
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    req = req.clone({
      setHeaders: headers
    });
  }

  return next(req).pipe(
    catchError((error) => {
      // Ignorer les erreurs de connexion (backend non disponible)
      if (error.status === 0 || error.status === null || error.status === undefined) {
        console.warn('Backend non disponible, requête annulée:', req.url);
        return throwError(() => error);
      }

      if (error.status === 401) {
        // Token expiré ou invalide - essayer de rafraîchir
        try {
          return authService.refreshToken().pipe(
            switchMap((authResponse) => {
              // Token rafraîchi avec succès, retry la requête
              const headers: any = {
                'Authorization': `Bearer ${authResponse.token}`,
                'Accept': 'application/json',
                'Accept-Language': localStorage.getItem('language') || 'fr',
                'X-Currency': localStorage.getItem('currency') || 'XOF'
              };
              
              // Ne pas définir Content-Type pour FormData
              if (!isFormData) {
                headers['Content-Type'] = 'application/json';
              }
              
              const newReq = req.clone({
                setHeaders: headers
              });
              return next(newReq);
            }),
            catchError((refreshError) => {
              // Si le backend n'est pas disponible, ne pas nettoyer les données
              if (refreshError.status === 0 || refreshError.status === null) {
                console.warn('Backend non disponible, impossible de rafraîchir le token');
                return throwError(() => refreshError);
              }
              
              // Impossible de rafraîchir le token, nettoyer et rediriger
              // Ne pas appeler logout() pour éviter les boucles, juste nettoyer
              authService.clearAuthData();
              router.navigate(['/login']);
              return throwError(() => refreshError);
            })
          );
        } catch (refreshError) {
          // Erreur lors de l'appel refreshToken
          console.warn('Erreur lors du rafraîchissement du token:', refreshError);
          return throwError(() => error);
        }
      } else if (error.status === 403) {
        // Accès refusé
        console.error('Accès refusé - Permissions insuffisantes');
      }
      return throwError(() => error);
    })
  );
};