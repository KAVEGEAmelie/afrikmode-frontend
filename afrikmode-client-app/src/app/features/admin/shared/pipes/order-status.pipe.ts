import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderStatus'
})
export class OrderStatusPipe implements PipeTransform {

  transform(status: string, format: 'display' | 'badge' | 'icon' | 'progress' = 'display'): any {
    if (!status) return '';
    
    const statusConfig = this.getStatusConfig(status);
    
    switch (format) {
      case 'display':
        return statusConfig.displayName;
      
      case 'badge':
        return {
          text: statusConfig.displayName,
          class: statusConfig.badgeClass,
          color: statusConfig.color,
          backgroundColor: statusConfig.backgroundColor
        };
      
      case 'icon':
        return {
          icon: statusConfig.icon,
          color: statusConfig.color,
          tooltip: statusConfig.displayName
        };
      
      case 'progress':
        return {
          percentage: statusConfig.progressPercentage,
          color: statusConfig.color,
          label: statusConfig.displayName,
          step: statusConfig.step
        };
      
      default:
        return statusConfig.displayName;
    }
  }

  private getStatusConfig(status: string): any {
    const statusConfigs: { [key: string]: any } = {
      pending: {
        displayName: 'En attente',
        badgeClass: 'badge-pending',
        color: '#ff9800',
        backgroundColor: '#fff3e0',
        icon: 'schedule',
        progressPercentage: 10,
        step: 1
      },
      confirmed: {
        displayName: 'Confirmée',
        badgeClass: 'badge-confirmed',
        color: '#2196f3',
        backgroundColor: '#e3f2fd',
        icon: 'check_circle',
        progressPercentage: 25,
        step: 2
      },
      processing: {
        displayName: 'En préparation',
        badgeClass: 'badge-processing',
        color: '#9c27b0',
        backgroundColor: '#f3e5f5',
        icon: 'settings',
        progressPercentage: 40,
        step: 3
      },
      shipped: {
        displayName: 'Expédiée',
        badgeClass: 'badge-shipped',
        color: '#673ab7',
        backgroundColor: '#ede7f6',
        icon: 'local_shipping',
        progressPercentage: 70,
        step: 4
      },
      in_transit: {
        displayName: 'En transit',
        badgeClass: 'badge-transit',
        color: '#03a9f4',
        backgroundColor: '#e1f5fe',
        icon: 'flight_takeoff',
        progressPercentage: 85,
        step: 5
      },
      delivered: {
        displayName: 'Livrée',
        badgeClass: 'badge-delivered',
        color: '#4caf50',
        backgroundColor: '#e8f5e8',
        icon: 'done_all',
        progressPercentage: 100,
        step: 6
      },
      cancelled: {
        displayName: 'Annulée',
        badgeClass: 'badge-cancelled',
        color: '#f44336',
        backgroundColor: '#ffebee',
        icon: 'cancel',
        progressPercentage: 0,
        step: 0
      },
      returned: {
        displayName: 'Retournée',
        badgeClass: 'badge-returned',
        color: '#795548',
        backgroundColor: '#efebe9',
        icon: 'keyboard_return',
        progressPercentage: 0,
        step: 0
      },
      refunded: {
        displayName: 'Remboursée',
        badgeClass: 'badge-refunded',
        color: '#607d8b',
        backgroundColor: '#eceff1',
        icon: 'money_off',
        progressPercentage: 0,
        step: 0
      },
      failed: {
        displayName: 'Échouée',
        badgeClass: 'badge-failed',
        color: '#e91e63',
        backgroundColor: '#fce4ec',
        icon: 'error',
        progressPercentage: 0,
        step: 0
      }
    };

    return statusConfigs[status] || {
      displayName: status,
      badgeClass: 'badge-unknown',
      color: '#9e9e9e',
      backgroundColor: '#fafafa',
      icon: 'help',
      progressPercentage: 0,
      step: 0
    };
  }

  // Méthode helper pour obtenir les étapes de progression
  getOrderSteps(): any[] {
    return [
      { key: 'pending', label: 'En attente', icon: 'schedule' },
      { key: 'confirmed', label: 'Confirmée', icon: 'check_circle' },
      { key: 'processing', label: 'Préparation', icon: 'settings' },
      { key: 'shipped', label: 'Expédiée', icon: 'local_shipping' },
      { key: 'in_transit', label: 'En transit', icon: 'flight_takeoff' },
      { key: 'delivered', label: 'Livrée', icon: 'done_all' }
    ];
  }

  // Méthode pour vérifier si un statut est final
  isFinalStatus(status: string): boolean {
    return ['delivered', 'cancelled', 'returned', 'refunded', 'failed'].includes(status);
  }

  // Méthode pour vérifier si un statut est positif
  isPositiveStatus(status: string): boolean {
    return ['confirmed', 'processing', 'shipped', 'in_transit', 'delivered'].includes(status);
  }
}