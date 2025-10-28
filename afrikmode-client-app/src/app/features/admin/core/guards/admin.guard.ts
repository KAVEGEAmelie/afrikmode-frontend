// src/app/features/admin/core/guards/admin.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { PermissionsService } from '../services/permissions.service';
import { AdminRoleType, ModuleType, ActionType } from '../models/permissions.model';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private permissionsService: PermissionsService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }

        // Vérifier si l'utilisateur a le rôle admin
        const adminRoles: AdminRoleType[] = ['admin'];

        if (!adminRoles.includes(user.role as AdminRoleType)) {
          this.router.navigate(['/']);
          return false;
        }

        // Définir le rôle dans le service de permissions
        this.permissionsService.setUserRole(user.role as AdminRoleType);

        // Vérifier les permissions spécifiques si définies dans les données de route
        const requiredModule = route.data['module'] as ModuleType;
        const requiredAction = route.data['action'] as ActionType;

        if (requiredModule && requiredAction) {
          if (!this.permissionsService.hasPermission(requiredModule, requiredAction)) {
            this.router.navigate(['/admin/unauthorized']);
            return false;
          }
        }

        return true;
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class ModuleGuard implements CanActivate {

  constructor(
    private permissionsService: PermissionsService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    
    const requiredModule = route.data['module'] as ModuleType;
    
    if (!requiredModule) {
      console.warn('ModuleGuard: Aucun module spécifié dans les données de route');
      return true;
    }

    if (this.permissionsService.canAccessModule(requiredModule)) {
      return true;
    }

    // Rediriger vers une page d'erreur de permissions
    this.router.navigate(['/admin/unauthorized']);
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {

  constructor(
    private permissionsService: PermissionsService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    
    const requiredModule = route.data['module'] as ModuleType;
    const requiredAction = route.data['action'] as ActionType;
    
    if (!requiredModule || !requiredAction) {
      console.warn('PermissionGuard: Module ou action manquant dans les données de route');
      return true;
    }

    if (this.permissionsService.hasPermission(requiredModule, requiredAction)) {
      return true;
    }

    // Vérifier s'il y a des restrictions spécifiques
    const restriction = this.permissionsService.isActionRestricted(requiredModule, requiredAction);
    if (restriction.restricted && restriction.message) {
      console.warn(`Permission refusée: ${restriction.message}`);
    }

    this.router.navigate(['/admin/unauthorized']);
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private permissionsService: PermissionsService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    
    const allowedRoles = route.data['roles'] as AdminRoleType[];
    
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    const currentRole = this.permissionsService.getCurrentRole();
    
    if (currentRole && allowedRoles.includes(currentRole)) {
      return true;
    }

    this.router.navigate(['/admin/unauthorized']);
    return false;
  }
}