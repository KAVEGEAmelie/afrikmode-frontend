import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  let notificationService: NotificationService | null = null;
  
  try {
    notificationService = inject(NotificationService);
  } catch (error) {
    // Si NotificationService n'est pas disponible, continuer sans afficher de notification
    console.warn('NotificationService non disponible');
  }

  return next(req).pipe(
    catchError((error) => {
      let errorMessage = 'Une erreur est survenue';
      let errorTitle = 'Erreur';

      // Ignorer les erreurs de connexion (backend non disponible)
      if (error.status === 0 || error.status === null || error.status === undefined) {
        // Backend non disponible, ne pas afficher d'erreur pour éviter les spams
        console.warn('Backend non disponible:', req.url);
        return throwError(() => error);
      }

      if (error.error instanceof ErrorEvent) {
        // Erreur côté client
        errorMessage = `Erreur: ${error.error.message}`;
        errorTitle = 'Erreur Client';
      } else {
        // Erreur côté serveur
        switch (error.status) {
          case 400:
            errorTitle = 'Requête invalide';
            errorMessage = error.error?.message || 'Les données fournies sont invalides';
            break;
          case 401:
            errorTitle = 'Non autorisé';
            errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
            break;
          case 403:
            errorTitle = 'Accès refusé';
            errorMessage = 'Vous n\'avez pas les permissions nécessaires pour cette action';
            break;
          case 404:
            errorTitle = 'Non trouvé';
            errorMessage = 'La ressource demandée n\'a pas été trouvée';
            break;
          case 409:
            errorTitle = 'Conflit';
            errorMessage = error.error?.message || 'Un conflit a été détecté';
            break;
          case 422:
            errorTitle = 'Données invalides';
            errorMessage = error.error?.message || 'Les données fournies ne sont pas valides';
            break;
          case 429:
            errorTitle = 'Trop de requêtes';
            errorMessage = 'Vous avez fait trop de requêtes. Veuillez patienter.';
            break;
          case 500:
            errorTitle = 'Erreur serveur';
            errorMessage = 'Une erreur interne du serveur s\'est produite';
            break;
          case 502:
            errorTitle = 'Passerelle invalide';
            errorMessage = 'Le serveur est temporairement indisponible';
            break;
          case 503:
            errorTitle = 'Service indisponible';
            errorMessage = 'Le service est temporairement indisponible';
            break;
          case 504:
            errorTitle = 'Timeout';
            errorMessage = 'Le serveur met trop de temps à répondre';
            break;
          default:
            errorTitle = `Erreur ${error.status}`;
            errorMessage = error.error?.message || error.message || 'Une erreur inattendue s\'est produite';
        }
      }

      // Afficher la notification d'erreur seulement si le service est disponible
      if (notificationService) {
        try {
          notificationService.showError(errorMessage, errorTitle);
        } catch (notifError) {
          console.warn('Erreur lors de l\'affichage de la notification:', notifError);
        }
      }

      // Logger l'erreur pour le debugging
      console.error('HTTP Error:', {
        status: error.status,
        message: errorMessage,
        url: req.url,
        method: req.method,
        error: error.error
      });

      return throwError(() => error);
    })
  );
};