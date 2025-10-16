import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'userRole'
})
export class UserRolePipe implements PipeTransform {

  transform(role: string | string[], format: 'display' | 'badge' | 'icon' = 'display'): any {
    if (!role) return '';
    
    // Si c'est un tableau, prendre le premier rôle ou le plus important
    const currentRole = Array.isArray(role) ? this.getPrimaryRole(role) : role;
    
    const roleConfig = this.getRoleConfig(currentRole);
    
    switch (format) {
      case 'display':
        return roleConfig.displayName;
      
      case 'badge':
        return {
          text: roleConfig.displayName,
          class: roleConfig.badgeClass,
          color: roleConfig.color
        };
      
      case 'icon':
        return {
          icon: roleConfig.icon,
          color: roleConfig.color,
          tooltip: roleConfig.displayName
        };
      
      default:
        return roleConfig.displayName;
    }
  }

  private getPrimaryRole(roles: string[]): string {
    // Hiérarchie des rôles (du plus important au moins important)
    const roleHierarchy = ['super_admin', 'admin', 'moderator', 'seller', 'customer', 'guest'];
    
    for (const hierarchyRole of roleHierarchy) {
      if (roles.includes(hierarchyRole)) {
        return hierarchyRole;
      }
    }
    
    return roles[0] || 'guest';
  }

  private getRoleConfig(role: string): any {
    const roleConfigs: { [key: string]: any } = {
      super_admin: {
        displayName: 'Super Administrateur',
        badgeClass: 'badge-super-admin',
        color: '#9c27b0',
        icon: 'admin_panel_settings'
      },
      admin: {
        displayName: 'Administrateur',
        badgeClass: 'badge-admin',
        color: '#f44336',
        icon: 'shield'
      },
      moderator: {
        displayName: 'Modérateur',
        badgeClass: 'badge-moderator',
        color: '#ff9800',
        icon: 'verified_user'
      },
      seller: {
        displayName: 'Vendeur',
        badgeClass: 'badge-seller',
        color: '#2196f3',
        icon: 'store'
      },
      customer: {
        displayName: 'Client',
        badgeClass: 'badge-customer',
        color: '#4caf50',
        icon: 'person'
      },
      guest: {
        displayName: 'Invité',
        badgeClass: 'badge-guest',
        color: '#9e9e9e',
        icon: 'person_outline'
      },
      blocked: {
        displayName: 'Bloqué',
        badgeClass: 'badge-blocked',
        color: '#795548',
        icon: 'block'
      }
    };

    return roleConfigs[role] || roleConfigs['guest'];
  }
}