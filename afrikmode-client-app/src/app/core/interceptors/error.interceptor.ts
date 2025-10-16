// src/app/core/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Erreur: ${error.error.message}`;
        console.error('Erreur client:', error.error.message);
      } else {
        errorMessage = getServerErrorMessage(error);
        console.error(`Erreur ${error.status}:`, errorMessage);
        handleSpecificErrors(error, router);
      }

      showErrorNotification(errorMessage);

      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        originalError: error
      }));
    })
  );
};

function getServerErrorMessage(error: HttpErrorResponse): string {
  if (error.error?.message) {
    return error.error.message;
  }

  const errorMessages: Record<number, string> = {
    400: 'Requête invalide. Veuillez vérifier les données saisies.',
    401: 'Session expirée. Veuillez vous reconnecter.',
    403: 'Vous n\'avez pas les permissions nécessaires.',
    404: 'La ressource demandée n\'a pas été trouvée.',
    409: 'Conflit avec les données existantes.',
    422: 'Les données fournies ne sont pas valides.',
    429: 'Trop de requêtes. Veuillez patienter.',
    500: 'Erreur serveur. Veuillez réessayer plus tard.',
    502: 'Service temporairement indisponible.',
    503: 'Service en maintenance. Veuillez réessayer plus tard.',
    504: 'Délai d\'attente dépassé. Veuillez réessayer.'
  };

  return errorMessages[error.status] || `Erreur ${error.status}: ${error.statusText}`;
}

function handleSpecificErrors(error: HttpErrorResponse, router: Router): void {
  switch (error.status) {
    case 401:
      if (!router.url.includes('/login')) {
        router.navigate(['/login'], {
          queryParams: { returnUrl: router.url }
        });
      }
      break;
    case 403:
      router.navigate(['/unauthorized']);
      break;
  }
}

function showErrorNotification(message: string): void {
  console.error('Notification:', message);
}