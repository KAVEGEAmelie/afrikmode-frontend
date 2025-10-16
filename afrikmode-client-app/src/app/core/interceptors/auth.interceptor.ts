import { HttpInterceptorFn, HttpErrorResponse, HttpEvent, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError, BehaviorSubject, Observable } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

// Variable globale pour gérer l'état de rafraîchissement
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  
  // Ajouter le token d'authentification si disponible
  const token = localStorage.getItem('auth_token');
  if (token) {
    req = addTokenHeader(req, token);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/')) {
        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function addTokenHeader(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      'Authorization': `Bearer ${token}`
    }
  });
}

function handle401Error(request: HttpRequest<unknown>, next: HttpHandlerFn, authService: AuthService): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      return authService.refreshToken().pipe(
        switchMap((response: any) => {
          isRefreshing = false;
          
          if (response.success && response.data && response.data.token) {
            refreshTokenSubject.next(response.data.token);
            return next(addTokenHeader(request, response.data.token));
          } else {
            // Refresh token invalide, déconnecter l'utilisateur
            authService.logout().subscribe();
            return throwError(() => new Error('Session expirée'));
          }
        }),
        catchError((error) => {
          isRefreshing = false;
          authService.logout().subscribe();
          return throwError(() => error);
        })
      );
    } else {
      // Pas de refresh token, déconnecter l'utilisateur
      isRefreshing = false;
      authService.logout().subscribe();
      return throwError(() => new Error('Session expirée'));
    }
  }

  return refreshTokenSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap((token) => next(addTokenHeader(request, token)))
  );
}

// Export de la classe pour compatibilité avec l'ancienne syntaxe
export class AuthInterceptor {
  // Cette classe est maintenue pour la compatibilité mais n'est plus utilisée
}