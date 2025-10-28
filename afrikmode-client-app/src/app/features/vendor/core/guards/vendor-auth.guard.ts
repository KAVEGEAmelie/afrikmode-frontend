/**
 * Guard pour vérifier qu'un utilisateur est un vendeur actif
 * Protège les routes du module vendor contre les accès non autorisés
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
import { map, catchError, tap } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class VendorAuthGuard implements CanActivate {
  private router = inject(Router);
  private authService = inject(AuthService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isAuthenticated()) {
      console.warn('❌ VendorAuthGuard: Utilisateur non authentifié');
      return this.router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // Récupérer le profil utilisateur
    const user = this.authService.getCurrentUser();

    if (!user) {
      console.warn('❌ VendorAuthGuard: Profil utilisateur introuvable');
      return this.router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // Vérifier si l'utilisateur a le rôle vendor
    const hasVendorRole = this.checkVendorRole(user);
    
    if (!hasVendorRole) {
      console.warn('❌ VendorAuthGuard: Utilisateur n\'a pas le rôle vendor', user);
      return this.router.createUrlTree(['/'], {
        queryParams: { error: 'vendor_access_denied' }
      });
    }

    // Vérifier si le compte vendor est actif
    const isActive = this.checkVendorStatus(user);

    if (!isActive) {
      const status = (user as any).vendor_status || (user as any).status || 'inactive';
      console.warn('❌ VendorAuthGuard: Compte vendor suspendu ou inactif', user);
      return this.router.createUrlTree(['/vendor/suspended'], {
        queryParams: { reason: status }
      });
    }

    console.log('✅ VendorAuthGuard: Accès autorisé pour', user.email);
    return true;
  }

  /**
   * Vérifie si l'utilisateur a le rôle vendor
   */
  private checkVendorRole(user: any): boolean {
    // Vérifier plusieurs propriétés possibles
    return (
      user.role === 'vendor' ||
      user.roles?.includes('vendor') ||
      user.user_type === 'vendor' ||
      user.is_vendor === true
    );
  }

  /**
   * Vérifie si le statut du vendor est actif
   */
  private checkVendorStatus(user: any): boolean {
    const status = user.vendor_status || user.status;
    
    // Statuts acceptés
    const activeStatuses = ['active', 'approved', 'verified'];
    
    // Si pas de statut défini, considérer comme actif
    if (!status) {
      return true;
    }

    return activeStatuses.includes(status.toLowerCase());
  }

  /**
   * Récupère le message d'erreur selon le statut
   */
  private getStatusMessage(status: string): string {
    const messages: Record<string, string> = {
      'pending': 'Votre compte vendor est en attente d\'approbation',
      'suspended': 'Votre compte vendor a été suspendu',
      'banned': 'Votre compte vendor a été désactivé',
      'rejected': 'Votre demande de compte vendor a été rejetée'
    };

    return messages[status] || 'Votre compte vendor n\'est pas actif';
  }
}
