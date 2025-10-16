// src/app/features/admin/core/guards/role.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';
import { UserRoleType } from '../models/admin-user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    // Récupérer les rôles autorisés depuis la route
    const allowedRoles = route.data['roles'] as UserRoleType[];

    if (!allowedRoles || allowedRoles.length === 0) {
      // Pas de restriction de rôle définie
      return true;
    }

    return this.authService.isAuthenticated$.pipe(
      take(1),
      switchMap(isAuthenticated => {
        if (!isAuthenticated) {
          return [this.router.createUrlTree(['/login'], {
            queryParams: { returnUrl: state.url }
          })];
        }

        // Récupérer l'utilisateur depuis l'Observable
        return this.authService.currentUser$.pipe(
          take(1),
          map(user => {
            if (!user) {
              return this.router.createUrlTree(['/login']);
            }

            // Vérifier si le rôle de l'utilisateur est dans la liste autorisée
            if (allowedRoles.includes(user.role as UserRoleType)) {
              return true;
            }

            // Rôle insuffisant
            console.warn(`Accès refusé. Rôle requis: ${allowedRoles.join(', ')}, Rôle actuel: ${user.role}`);
            return this.router.createUrlTree(['/admin/dashboard']);
          })
        );
      })
    );
  }
}