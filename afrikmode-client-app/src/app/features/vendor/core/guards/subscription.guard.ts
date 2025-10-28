/**
 * Guard pour vérifier qu'un vendeur a un abonnement actif et valide
 * Protège les fonctionnalités premium réservées aux abonnés
 */

import { Injectable, inject } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router,
  UrlTree 
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

export interface VendorSubscription {
  id: string;
  vendor_id: string;
  plan_id: string;
  plan_name: string;
  status: 'active' | 'expired' | 'cancelled' | 'suspended' | 'trial';
  start_date: string;
  end_date: string;
  trial_end_date?: string;
  features: string[];
  limits: {
    max_products?: number;
    max_stores?: number;
    max_monthly_orders?: number;
    commission_rate?: number;
  };
  auto_renew: boolean;
  payment_method?: string;
  next_billing_date?: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionGuard implements CanActivate {
  private router = inject(Router);
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    // Récupérer l'utilisateur courant
    const user = this.authService.getCurrentUser();

    if (!user) {
      console.warn('❌ SubscriptionGuard: Utilisateur non connecté');
      return this.router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // Vérifier si l'utilisateur est super admin (bypass)
    if (this.isSuperAdmin(user)) {
      console.log('✅ SubscriptionGuard: Super admin, accès autorisé');
      return true;
    }

    // Récupérer la fonctionnalité requise depuis les données de route
    const requiredFeature = route.data['requiredFeature'];
    const requiresSubscription = route.data['requiresSubscription'] !== false; // true par défaut

    // Si la route ne requiert pas d'abonnement, laisser passer
    if (!requiresSubscription) {
      console.log('ℹ️ SubscriptionGuard: Abonnement non requis, accès autorisé');
      return true;
    }

    // Vérifier l'abonnement
    return this.checkSubscription(user.id).pipe(
      map(subscription => {
        // Vérifier si l'abonnement existe
        if (!subscription) {
          console.warn('❌ SubscriptionGuard: Aucun abonnement trouvé');
          return this.router.createUrlTree(['/vendor/subscription/plans'], {
            queryParams: { error: 'no_subscription', returnUrl: state.url }
          });
        }

        // Vérifier le statut de l'abonnement
        const isActive = this.isSubscriptionActive(subscription);

        if (!isActive) {
          console.warn('❌ SubscriptionGuard: Abonnement inactif', subscription.status);
          return this.router.createUrlTree(['/vendor/subscription/renew'], {
            queryParams: { 
              status: subscription.status, 
              returnUrl: state.url 
            }
          });
        }

        // Vérifier si la fonctionnalité est incluse dans le plan
        if (requiredFeature && !this.hasFeature(subscription, requiredFeature)) {
          console.warn('❌ SubscriptionGuard: Fonctionnalité non incluse', requiredFeature);
          return this.router.createUrlTree(['/vendor/subscription/upgrade'], {
            queryParams: { 
              feature: requiredFeature, 
              returnUrl: state.url 
            }
          });
        }

        console.log('✅ SubscriptionGuard: Abonnement valide', subscription.plan_name);
        return true;
      }),
      catchError(error => {
        console.error('❌ SubscriptionGuard: Erreur lors de la vérification', error);
        
        // En cas d'erreur, rediriger vers la page d'abonnement
        return of(this.router.createUrlTree(['/vendor/subscription/error'], {
          queryParams: { error: 'check_failed' }
        }));
      })
    );
  }

  /**
   * Récupère l'abonnement du vendeur depuis l'API
   */
  private checkSubscription(vendorId: string): Observable<VendorSubscription | null> {
    const apiUrl = `${environment.apiUrl}/subscriptions/vendor/${vendorId}`;
    
    return this.http.get<{ success: boolean; data: VendorSubscription }>(apiUrl).pipe(
      map(response => response.data),
      catchError(error => {
        // Si erreur 404, pas d'abonnement
        if (error.status === 404) {
          return of(null);
        }
        throw error;
      })
    );
  }

  /**
   * Vérifie si l'utilisateur est super admin
   */
  private isSuperAdmin(user: any): boolean {
    return (
      user.role === 'super_admin' ||
      user.role === 'admin' ||
      user.roles?.includes('super_admin') ||
      user.roles?.includes('admin')
    );
  }

  /**
   * Vérifie si l'abonnement est actif
   */
  private isSubscriptionActive(subscription: VendorSubscription): boolean {
    const activeStatuses: Array<VendorSubscription['status']> = ['active', 'trial'];
    
    // Vérifier le statut
    if (!activeStatuses.includes(subscription.status)) {
      return false;
    }

    // Vérifier la date d'expiration
    const now = new Date();
    const endDate = new Date(subscription.end_date);

    if (endDate < now) {
      return false;
    }

    // Si en période d'essai, vérifier la date de fin d'essai
    if (subscription.status === 'trial' && subscription.trial_end_date) {
      const trialEndDate = new Date(subscription.trial_end_date);
      if (trialEndDate < now) {
        return false;
      }
    }

    return true;
  }

  /**
   * Vérifie si une fonctionnalité est incluse dans le plan
   */
  private hasFeature(subscription: VendorSubscription, feature: string): boolean {
    if (!subscription.features || subscription.features.length === 0) {
      // Si pas de liste de features, considérer que tout est accessible
      return true;
    }

    return subscription.features.includes(feature);
  }

  /**
   * Récupère les jours restants avant l'expiration
   */
  private getDaysUntilExpiration(subscription: VendorSubscription): number {
    const now = new Date();
    const endDate = new Date(subscription.end_date);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
