import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AdminAuthService } from '../services/admin-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private adminAuth: AdminAuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAuth(route, state);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAuth(route, state);
  }

  private checkAuth(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Vérifier si l'utilisateur est connecté
    if (!this.adminAuth.isAuthenticated()) {
      this.redirectToLogin(state.url);
      return of(false);
    }

    // Vérifier si le token est expiré
    if (this.adminAuth.isTokenExpired()) {
      // Essayer de rafraîchir le token
      return this.adminAuth.refreshToken().pipe(
        map(() => {
          // Vérifier les permissions après le refresh
          return this.checkPermissions(route);
        }),
        catchError(() => {
          this.redirectToLogin(state.url);
          return of(false);
        })
      );
    }

    // Vérifier les permissions
    return of(this.checkPermissions(route));
  }

  private checkPermissions(route: ActivatedRouteSnapshot): boolean {
    const requiredPermission = route.data['permission'];
    const requiredRole = route.data['role'];
    const requiredRoles = route.data['roles'];

    // Si aucune permission ou rôle requis, autoriser l'accès
    if (!requiredPermission && !requiredRole && !requiredRoles) {
      return true;
    }

    // Vérifier les permissions
    if (requiredPermission && !this.adminAuth.hasPermission(requiredPermission)) {
      this.redirectToUnauthorized();
      return false;
    }

    // Vérifier le rôle unique
    if (requiredRole && !this.adminAuth.hasRole(requiredRole)) {
      this.redirectToUnauthorized();
      return false;
    }

    // Vérifier les rôles multiples
    if (requiredRoles && Array.isArray(requiredRoles)) {
      const hasRequiredRole = requiredRoles.some(role => this.adminAuth.hasRole(role));
      if (!hasRequiredRole) {
        this.redirectToUnauthorized();
        return false;
      }
    }

    return true;
  }

  private redirectToLogin(returnUrl: string): void {
    this.router.navigate(['/admin/login'], { 
      queryParams: { returnUrl } 
    });
  }

  private redirectToUnauthorized(): void {
    this.router.navigate(['/admin/unauthorized']);
  }
}