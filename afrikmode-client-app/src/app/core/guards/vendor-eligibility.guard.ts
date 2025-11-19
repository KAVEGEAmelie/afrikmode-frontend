import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { VendorEligibilityService, EligibilityResponse } from '../services/vendor-eligibility.service';
import { ToastService } from '../services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class VendorEligibilityGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private eligibilityService: VendorEligibilityService,
    private router: Router,
    private toastService: ToastService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {
    // 1. Vérifier l'authentification
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/vendor/apply' }
      });
      this.toastService.warning('Vous devez être connecté pour postuler');
      return false;
    }

    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/vendor/apply' }
      });
      return false;
    }

    // Si on est en mode édition (query param edit=true), permettre l'accès
    // (même pour les vendeurs, car ils peuvent modifier leur candidature)
    if (route.queryParams['edit'] === 'true' || route.queryParams['edit'] === true) {
      console.log('✅ Mode édition détecté - Accès autorisé');
      return true;
    }

    // 2. Vérifier le rôle (seulement si pas en mode édition)
    if (user.role === 'vendor') {
      this.router.navigate(['/vendor']);
      this.toastService.info('Vous êtes déjà vendeur');
      return false;
    }

    if (user.role === 'admin') {
      this.router.navigate(['/admin']);
      this.toastService.info('Les administrateurs ne peuvent pas devenir vendeurs');
      return false;
    }

    // 3. Seuls les clients peuvent devenir vendeurs (ou utilisateurs sans rôle défini)
    // Si l'utilisateur n'a pas de rôle ou a un rôle invalide, on le considère comme client
    if (user.role && user.role !== 'customer') {
      // Si c'est un admin, on a déjà géré ça plus haut
      if (user.role === 'admin' || user.role === 'super_admin') {
        // Déjà géré plus haut
        return false;
      }
      // Pour les autres rôles, on bloque
      this.router.navigate(['/']);
      this.toastService.error('Seuls les clients peuvent postuler pour devenir vendeurs');
      return false;
    }
    // Si pas de rôle ou rôle null/undefined, on continue (sera traité comme client)

    // 4. Vérifier l'email vérifié
    if (!user.is_verified) {
      this.router.navigate(['/email-verification-required'], {
        queryParams: { returnUrl: '/vendor/apply' }
      });
      this.toastService.warning('Veuillez vérifier votre email avant de postuler');
      return false;
    }

    // 5. Vérifier l'éligibilité via l'API
    return this.eligibilityService.checkEligibility().pipe(
      map((response: EligibilityResponse) => {
        if (response.eligible) {
          return true;
        }

        // Gérer les raisons de non-éligibilité
        switch (response.reason) {
          case 'existing_application':
            // Rediriger vers la page de suivi de candidature
            if (response.application) {
              this.router.navigate(['/vendor/application-status'], {
                queryParams: { 
                  applicationNumber: response.application.applicationNumber,
                  id: response.application.id
                }
              });
              this.toastService.info('Vous avez déjà une candidature en cours');
            } else {
              this.toastService.warning(response.message || 'Candidature déjà en cours');
            }
            return false;

          case 'existing_store':
            // L'utilisateur a déjà une boutique, rediriger vers le dashboard vendeur
            if (response.store) {
              this.router.navigate(['/vendor']);
              this.toastService.info('Vous avez déjà une boutique active');
            } else {
              this.toastService.warning(response.message || 'Boutique déjà existante');
            }
            return false;

          case 'email_not_verified':
            this.router.navigate(['/email-verification-required'], {
              queryParams: { returnUrl: '/vendor/apply' }
            });
            this.toastService.warning(response.message || 'Email non vérifié');
            return false;

          case 'account_incomplete':
            this.toastService.error(response.message || 'Votre compte n\'est pas complet');
            this.router.navigate(['/']);
            return false;

          default:
            // Afficher le message spécifique de l'API ou un message générique
            const errorMessage = response.message || 'Vous n\'êtes pas éligible pour devenir vendeur';
            this.toastService.error(errorMessage);
            console.error('Raison de non-éligibilité:', response.reason, response);
            this.router.navigate(['/']);
            return false;
        }
      }),
      catchError((error) => {
        console.error('Erreur lors de la vérification d\'éligibilité:', error);
        
        // En cas d'erreur API, autoriser quand même si les vérifications de base sont OK
        // ou rediriger avec un message d'erreur
        const errorMessage = error.message || 'Erreur lors de la vérification';
        this.toastService.error(errorMessage);
        
        // Optionnel : permettre l'accès même en cas d'erreur API (pour dev)
        // return of(true);
        
        // Sinon, bloquer l'accès
        this.router.navigate(['/']);
        return of(false);
      })
    );
  }
}