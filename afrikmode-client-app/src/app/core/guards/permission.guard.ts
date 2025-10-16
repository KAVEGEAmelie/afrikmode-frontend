import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
// import { PermissionService } from '../services/permission.service';
// import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  
  constructor(
    // private permissionService: PermissionService,
    // private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // TEMPORAIRE : Autoriser l'accès à toutes les routes admin pour les tests
    // TODO: Réactiver la vérification d'authentification en production
    console.log('🔓 Accès admin autorisé (mode test)');
    return of(true);
  }
}
