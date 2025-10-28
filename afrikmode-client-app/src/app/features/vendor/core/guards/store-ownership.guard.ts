/**
 * Guard pour vérifier qu'un vendeur possède bien la boutique qu'il essaie d'accéder
 * Protège contre l'accès aux boutiques d'autres vendeurs
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
import { StoreService } from '../services/store.service';

@Injectable({
  providedIn: 'root'
})
export class StoreOwnershipGuard implements CanActivate {
  private router = inject(Router);
  private authService = inject(AuthService);
  private storeService = inject(StoreService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    // Récupérer le storeId depuis les paramètres de route
    const storeId = route.paramMap.get('storeId') || route.queryParamMap.get('storeId');

    // Si pas de storeId dans l'URL, laisser passer (peut-être une route de création)
    if (!storeId) {
      console.log('ℹ️ StoreOwnershipGuard: Pas de storeId, accès autorisé');
      return true;
    }

    // Récupérer l'utilisateur courant
    const user = this.authService.getCurrentUser();

    if (!user) {
      console.warn('❌ StoreOwnershipGuard: Utilisateur non connecté');
      return this.router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // Vérifier si l'utilisateur est super admin (accès total)
    if (this.isSuperAdmin(user)) {
      console.log('✅ StoreOwnershipGuard: Super admin, accès autorisé');
      return true;
    }

    // Vérifier la propriété de la boutique
    return this.storeService.getStoreById(storeId).pipe(
      map(store => {
        // Vérifier si l'utilisateur est propriétaire
        const isOwner = this.checkOwnership(user, store);

        if (!isOwner) {
          console.warn('❌ StoreOwnershipGuard: Utilisateur ne possède pas cette boutique', {
            userId: user.id,
            storeId: store.id,
            ownerId: store.owner_id
          });

          return this.router.createUrlTree(['/vendor/dashboard'], {
            queryParams: { error: 'store_access_denied' }
          });
        }

        console.log('✅ StoreOwnershipGuard: Propriétaire vérifié', store.name);
        return true;
      }),
      catchError(error => {
        console.error('❌ StoreOwnershipGuard: Erreur lors de la vérification', error);
        
        // Si la boutique n'existe pas ou erreur serveur
        return of(this.router.createUrlTree(['/vendor/dashboard'], {
          queryParams: { error: 'store_not_found' }
        }));
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
   * Vérifie si l'utilisateur possède la boutique
   */
  private checkOwnership(user: any, store: any): boolean {
    // Vérifier différentes propriétés possibles
    const userId = user.id || user.user_id || user._id;
    const ownerId = store.owner_id;

    if (!userId || !ownerId) {
      console.warn('⚠️ StoreOwnershipGuard: IDs manquants', { userId, ownerId });
      return false;
    }

    return userId.toString() === ownerId.toString();
  }
}
