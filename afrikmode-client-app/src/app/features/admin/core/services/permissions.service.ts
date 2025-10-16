// src/app/features/admin/core/services/permissions.service.ts

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { 
  AdminRoleType, 
  ModuleType, 
  ActionType, 
  Permission, 
  RolePermissions, 
  ROLE_PERMISSIONS_CONFIG,
  MODULE_PERMISSIONS 
} from '../models/permissions.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private currentUserRole = new BehaviorSubject<AdminRoleType | null>(null);
  private currentUserPermissions = new BehaviorSubject<Permission[]>([]);

  constructor() {
    // Récupérer le rôle depuis le service d'authentification
    this.loadUserRole();
  }

  /**
   * Charger le rôle de l'utilisateur connecté
   */
  private loadUserRole(): void {
    // TODO: Intégrer avec le service d'authentification
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.setUserRole(user.role as AdminRoleType);
      } catch (error) {
        console.error('Erreur lors du chargement du rôle utilisateur:', error);
      }
    }
  }

  /**
   * Définir le rôle de l'utilisateur
   */
  setUserRole(role: AdminRoleType): void {
    this.currentUserRole.next(role);
    const permissions = this.getPermissionsForRole(role);
    this.currentUserPermissions.next(permissions);
  }

  /**
   * Obtenir le rôle actuel
   */
  getCurrentRole(): AdminRoleType | null {
    return this.currentUserRole.value;
  }

  /**
   * Observable du rôle actuel
   */
  getCurrentRole$(): Observable<AdminRoleType | null> {
    return this.currentUserRole.asObservable();
  }

  /**
   * Observable des permissions actuelles
   */
  getCurrentPermissions$(): Observable<Permission[]> {
    return this.currentUserPermissions.asObservable();
  }

  /**
   * Obtenir les permissions pour un rôle donné
   */
  getPermissionsForRole(role: AdminRoleType): Permission[] {
    const roleConfig = ROLE_PERMISSIONS_CONFIG[role];
    return roleConfig ? roleConfig.permissions : [];
  }

  /**
   * Vérifier si l'utilisateur a une permission spécifique
   */
  hasPermission(module: ModuleType, action: ActionType): boolean {
    const permissions = this.currentUserPermissions.value;
    return permissions.some(permission => 
      permission.module === module && 
      permission.actions.includes(action)
    );
  }

  /**
   * Vérifier si l'utilisateur peut accéder à un module
   */
  canAccessModule(module: ModuleType): boolean {
    const permissions = this.currentUserPermissions.value;
    return permissions.some(permission => permission.module === module);
  }

  /**
   * Obtenir toutes les permissions d'un module
   */
  getModulePermissions(module: ModuleType): Permission[] {
    return MODULE_PERMISSIONS[module] || [];
  }

  /**
   * Obtenir les actions autorisées pour un module
   */
  getAllowedActions(module: ModuleType): ActionType[] {
    const permissions = this.currentUserPermissions.value;
    const modulePermissions = permissions.filter(p => p.module === module);
    return modulePermissions.flatMap(p => p.actions);
  }

  /**
   * Vérifier les restrictions pour un rôle
   */
  getRestrictions(role: AdminRoleType): string[] {
    const roleConfig = ROLE_PERMISSIONS_CONFIG[role];
    if (!roleConfig?.restrictions) return [];

    return roleConfig.restrictions.map(restriction => restriction.message);
  }

  /**
   * Vérifier si une action est restreinte
   */
  isActionRestricted(module: ModuleType, action: ActionType): { restricted: boolean; message?: string } {
    const currentRole = this.getCurrentRole();
    if (!currentRole) return { restricted: true, message: 'Aucun rôle défini' };

    const roleConfig = ROLE_PERMISSIONS_CONFIG[currentRole];
    if (!roleConfig?.restrictions) return { restricted: false };

    const restriction = roleConfig.restrictions.find(r => 
      r.module === module && r.action === action
    );

    return restriction 
      ? { restricted: true, message: restriction.message }
      : { restricted: false };
  }

  /**
   * Obtenir le niveau de permission (pour l'UI)
   */
  getPermissionLevel(): 'full' | 'limited' | 'read_only' | 'none' {
    const role = this.getCurrentRole();
    if (!role) return 'none';

    switch (role) {
      case 'super_admin':
        return 'full';
      case 'admin':
      case 'manager':
        return 'limited';
      case 'support':
      case 'analyst':
      case 'content_manager':
      case 'moderator':
      case 'vendor_admin':
        return 'read_only';
      default:
        return 'none';
    }
  }

  /**
   * Obtenir les modules accessibles
   */
  getAccessibleModules(): ModuleType[] {
    const permissions = this.currentUserPermissions.value;
    const modules = [...new Set(permissions.map(p => p.module))];
    return modules;
  }

  /**
   * Formater le nom du rôle pour l'affichage
   */
  getRoleDisplayName(role: AdminRoleType): string {
    const roleNames: Record<AdminRoleType, string> = {
      super_admin: 'Super Administrateur',
      admin: 'Administrateur',
      manager: 'Gestionnaire',
      vendor_admin: 'Administrateur Vendeur',
      support: 'Support Client',
      analyst: 'Analyste',
      content_manager: 'Gestionnaire de Contenu',
      moderator: 'Modérateur'
    };

    return roleNames[role] || role;
  }

  /**
   * Obtenir la couleur du badge de rôle
   */
  getRoleColor(role: AdminRoleType): string {
    const roleColors: Record<AdminRoleType, string> = {
      super_admin: '#dc3545',      // Rouge
      admin: '#fd7e14',            // Orange
      manager: '#0d6efd',          // Bleu
      vendor_admin: '#198754',     // Vert
      support: '#6610f2',          // Violet
      analyst: '#0dcaf0',          // Cyan
      content_manager: '#ffc107',  // Jaune
      moderator: '#6c757d'         // Gris
    };

    return roleColors[role] || '#6c757d';
  }

  /**
   * Vérifier si l'utilisateur peut gérer un autre utilisateur
   */
  canManageUser(targetUserRole: AdminRoleType): boolean {
    const currentRole = this.getCurrentRole();
    if (!currentRole) return false;

    // Super admin peut tout gérer
    if (currentRole === 'super_admin') return true;

    // Admin peut gérer tous sauf super admin
    if (currentRole === 'admin') {
      return targetUserRole !== 'super_admin';
    }

    // Manager peut gérer les rôles inférieurs
    if (currentRole === 'manager') {
      return ['vendor_admin', 'support', 'analyst', 'content_manager', 'moderator'].includes(targetUserRole);
    }

    // Autres rôles ne peuvent pas gérer d'autres utilisateurs
    return false;
  }
}