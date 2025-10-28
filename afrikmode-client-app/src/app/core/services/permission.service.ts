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
    { resource: 'dashboard', action: 'view', roles: ['admin'] },
    { resource: 'dashboard', action: 'edit', roles: ['admin'] },
    
    // Gestion des utilisateurs
    { resource: 'users', action: 'view', roles: ['admin'] },
    { resource: 'users', action: 'create', roles: ['admin'] },
    { resource: 'users', action: 'edit', roles: ['admin'] },
    { resource: 'users', action: 'delete', roles: ['admin'] },
    { resource: 'users', action: 'suspend', roles: ['admin'] },
    { resource: 'users', action: 'change_role', roles: ['admin'] },
    
    // Gestion des boutiques
    { resource: 'stores', action: 'view', roles: ['admin', 'vendor'] },
    { resource: 'stores', action: 'create', roles: ['admin', 'vendor'] },
    { resource: 'stores', action: 'edit', roles: ['admin', 'vendor'] },
    { resource: 'stores', action: 'delete', roles: ['admin'] },
    { resource: 'stores', action: 'verify', roles: ['admin'] },
    { resource: 'stores', action: 'suspend', roles: ['admin'] },
    
    // Gestion des produits
    { resource: 'products', action: 'view', roles: ['admin', 'vendor', 'customer'] },
    { resource: 'products', action: 'create', roles: ['admin', 'vendor'] },
    { resource: 'products', action: 'edit', roles: ['admin', 'vendor'] },
    { resource: 'products', action: 'delete', roles: ['admin', 'vendor'] },
    { resource: 'products', action: 'moderate', roles: ['admin'] },
    
    // Gestion des commandes
    { resource: 'orders', action: 'view', roles: ['admin', 'vendor', 'customer'] },
    { resource: 'orders', action: 'edit', roles: ['admin', 'vendor'] },
    { resource: 'orders', action: 'cancel', roles: ['admin', 'vendor'] },
    { resource: 'orders', action: 'refund', roles: ['admin', 'vendor'] },
    
    // Rapports et statistiques
    { resource: 'reports', action: 'view', roles: ['admin'] },
    { resource: 'reports', action: 'export', roles: ['admin'] },
    { resource: 'analytics', action: 'view', roles: ['admin', 'vendor'] },
    
    // Configuration système
    { resource: 'system', action: 'view', roles: ['admin'] },
    { resource: 'system', action: 'edit', roles: ['admin'] },
    { resource: 'admins', action: 'manage', roles: ['admin'] },
    
    // Support client
    { resource: 'support', action: 'view', roles: ['admin', 'vendor', 'customer'] },
    { resource: 'support', action: 'respond', roles: ['admin', 'vendor'] },
    { resource: 'tickets', action: 'manage', roles: ['admin'] }
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
   * Vérifier si l'utilisateur est un administrateur
   */
  isAdmin(): Observable<boolean> {
    return this.hasRole('admin');
  }

  /**
   * Vérifier si l'utilisateur est un vendeur
   */
  isVendor(): Observable<boolean> {
    return this.hasRole('vendor');
  }

  /**
   * Vérifier si l'utilisateur est un client
   */
  isCustomer(): Observable<boolean> {
    return this.hasRole('customer');
  }

  /**
   * Vérifier si l'utilisateur peut gérer les autres administrateurs
   */
  canManageAdmins(): Observable<boolean> {
    return this.hasRole('admin');
  }

  /**
   * Vérifier si l'utilisateur peut accéder aux données financières
   */
  canAccessFinancialData(): Observable<boolean> {
    return this.hasAnyRole(['admin', 'vendor']);
  }

  /**
   * Vérifier si l'utilisateur peut modifier la configuration système
   */
  canModifySystemConfig(): Observable<boolean> {
    return this.hasRole('admin');
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





































