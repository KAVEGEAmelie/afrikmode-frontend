import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable, map } from 'rxjs';

export interface Permission {
  resource: string;
  action: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  
  // Définition des permissions par ressource et action
  private permissions: Permission[] = [
    // Dashboard
    { resource: 'dashboard', action: 'view', roles: ['admin', 'super_admin', 'manager'] },
    { resource: 'dashboard', action: 'edit', roles: ['admin', 'super_admin'] },
    
    // Gestion des utilisateurs
    { resource: 'users', action: 'view', roles: ['admin', 'super_admin', 'manager'] },
    { resource: 'users', action: 'create', roles: ['admin', 'super_admin'] },
    { resource: 'users', action: 'edit', roles: ['admin', 'super_admin', 'manager'] },
    { resource: 'users', action: 'delete', roles: ['super_admin'] },
    { resource: 'users', action: 'suspend', roles: ['admin', 'super_admin'] },
    { resource: 'users', action: 'change_role', roles: ['super_admin'] },
    
    // Gestion des boutiques
    { resource: 'stores', action: 'view', roles: ['admin', 'super_admin', 'manager'] },
    { resource: 'stores', action: 'create', roles: ['admin', 'super_admin'] },
    { resource: 'stores', action: 'edit', roles: ['admin', 'super_admin', 'manager'] },
    { resource: 'stores', action: 'delete', roles: ['super_admin'] },
    { resource: 'stores', action: 'verify', roles: ['admin', 'super_admin'] },
    { resource: 'stores', action: 'suspend', roles: ['admin', 'super_admin'] },
    
    // Gestion des produits
    { resource: 'products', action: 'view', roles: ['admin', 'super_admin', 'manager'] },
    { resource: 'products', action: 'create', roles: ['admin', 'super_admin'] },
    { resource: 'products', action: 'edit', roles: ['admin', 'super_admin', 'manager'] },
    { resource: 'products', action: 'delete', roles: ['admin', 'super_admin'] },
    { resource: 'products', action: 'moderate', roles: ['admin', 'super_admin', 'manager'] },
    
    // Gestion des commandes
    { resource: 'orders', action: 'view', roles: ['admin', 'super_admin', 'manager'] },
    { resource: 'orders', action: 'edit', roles: ['admin', 'super_admin', 'manager'] },
    { resource: 'orders', action: 'cancel', roles: ['admin', 'super_admin'] },
    { resource: 'orders', action: 'refund', roles: ['admin', 'super_admin'] },
    
    // Rapports et statistiques
    { resource: 'reports', action: 'view', roles: ['admin', 'super_admin'] },
    { resource: 'reports', action: 'export', roles: ['admin', 'super_admin'] },
    { resource: 'analytics', action: 'view', roles: ['admin', 'super_admin'] },
    
    // Configuration système
    { resource: 'system', action: 'view', roles: ['super_admin'] },
    { resource: 'system', action: 'edit', roles: ['super_admin'] },
    { resource: 'admins', action: 'manage', roles: ['super_admin'] },
    
    // Support client
    { resource: 'support', action: 'view', roles: ['admin', 'super_admin', 'manager'] },
    { resource: 'support', action: 'respond', roles: ['admin', 'super_admin', 'manager'] },
    { resource: 'tickets', action: 'manage', roles: ['admin', 'super_admin', 'manager'] }
  ];

  constructor(private authService: AuthService) {}

  /**
   * Vérifier si l'utilisateur actuel a une permission spécifique
   */
  hasPermission(resource: string, action: string): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      map(user => {
        if (!user) return false;
        
        const permission = this.permissions.find(p => 
          p.resource === resource && p.action === action
        );
        
        if (!permission) return false;
        
        return permission.roles.includes(user.role);
      })
    );
  }

  /**
   * Vérifier si l'utilisateur actuel a un rôle spécifique
   */
  hasRole(role: string): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      map(user => user?.role === role)
    );
  }

  /**
   * Vérifier si l'utilisateur actuel a l'un des rôles spécifiés
   */
  hasAnyRole(roles: string[]): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      map(user => user ? roles.includes(user.role) : false)
    );
  }

  /**
   * Vérifier si l'utilisateur est un administrateur (admin ou super_admin)
   */
  isAdmin(): Observable<boolean> {
    return this.hasAnyRole(['admin', 'super_admin']);
  }

  /**
   * Vérifier si l'utilisateur est un super administrateur
   */
  isSuperAdmin(): Observable<boolean> {
    return this.hasRole('super_admin');
  }

  /**
   * Vérifier si l'utilisateur est un manager
   */
  isManager(): Observable<boolean> {
    return this.hasRole('manager');
  }

  /**
   * Vérifier si l'utilisateur peut gérer les autres administrateurs
   */
  canManageAdmins(): Observable<boolean> {
    return this.hasRole('super_admin');
  }

  /**
   * Vérifier si l'utilisateur peut accéder aux données financières
   */
  canAccessFinancialData(): Observable<boolean> {
    return this.hasAnyRole(['admin', 'super_admin']);
  }

  /**
   * Vérifier si l'utilisateur peut modifier la configuration système
   */
  canModifySystemConfig(): Observable<boolean> {
    return this.hasRole('super_admin');
  }

  /**
   * Obtenir les permissions de l'utilisateur actuel
   */
  getUserPermissions(): Observable<Permission[]> {
    return this.authService.currentUser$.pipe(
      map(user => {
        if (!user) return [];
        
        return this.permissions.filter(permission => 
          permission.roles.includes(user.role)
        );
      })
    );
  }

  /**
   * Vérifier si l'utilisateur peut accéder à une route spécifique
   */
  canAccessRoute(route: string): Observable<boolean> {
    const routePermissions: { [key: string]: { resource: string, action: string } } = {
      'admin/dashboard': { resource: 'dashboard', action: 'view' },
      'admin/users': { resource: 'users', action: 'view' },
      'admin/stores': { resource: 'stores', action: 'view' },
      'admin/products': { resource: 'products', action: 'view' },
      'admin/orders': { resource: 'orders', action: 'view' },
      'admin/reports': { resource: 'reports', action: 'view' },
      'admin/analytics': { resource: 'analytics', action: 'view' },
      'admin/system': { resource: 'system', action: 'view' },
      'admin/support': { resource: 'support', action: 'view' }
    };

    const permission = routePermissions[route];
    if (!permission) return new Observable(observer => observer.next(false));

    return this.hasPermission(permission.resource, permission.action);
  }
}





















