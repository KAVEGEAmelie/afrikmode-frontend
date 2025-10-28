import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface AdminMenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  badge?: number;
  badgeColor?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  children?: AdminMenuItem[];
  permission?: string;
  roles?: string[];
  expanded?: boolean;
  hidden?: boolean;
}

@Component({
  selector: 'app-admin-sidebar-complete',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatListModule,
    MatToolbarModule,
    MatBadgeModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
    RouterModule
  ],
  template: `
    <div class="admin-sidebar-complete" [class.collapsed]="collapsed" [class.mobile]="isMobile">
      <!-- Header -->
      <div class="sidebar-header">
        <div class="brand" [class.collapsed]="collapsed">
          <div class="brand-icon">
            <mat-icon>admin_panel_settings</mat-icon>
          </div>
          @if (!collapsed) {
            <div class="brand-info">
              <h2>AfrikMode</h2>
              <span class="subtitle">Administration</span>
            </div>
          }
        </div>

        <!-- Toggle Button -->
        <button 
          mat-icon-button 
          class="toggle-btn"
          (click)="toggleCollapsed()"
          [matTooltip]="collapsed ? 'Agrandir' : 'Réduire'"
          matTooltipPosition="right">
          <mat-icon>{{ collapsed ? 'chevron_right' : 'chevron_left' }}</mat-icon>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <mat-list>
          @for (item of menuItems; track item.id) {
            @if (!item.hidden) {
              <!-- Menu Item -->
              <mat-list-item 
                [class.active]="isActive(item)"
                [class.has-children]="item.children && item.children.length > 0"
                [matTooltip]="collapsed ? item.label : ''"
                matTooltipPosition="right"
                (click)="toggleSubmenu(item, $event)">
              
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              
              @if (!collapsed) {
                <span matListItemTitle>{{ item.label }}</span>
              }
              
              @if (!collapsed) {
                <ng-container matListItemMeta>
                  <!-- Badge -->
                  @if (item.badge && !item.children) {
                    <span 
                      class="badge"
                      [ngClass]="getBadgeClass(item.badgeColor)">
                      {{ item.badge }}
                    </span>
                  }
                  
                  <!-- Arrow for submenu -->
                  @if (item.children && item.children.length > 0) {
                    <mat-icon 
                      class="submenu-arrow"
                      [class.expanded]="item.expanded">
                      keyboard_arrow_down
                    </mat-icon>
                  }
                </ng-container>
              }
              </mat-list-item>
            }

            <!-- Submenu - CORRECTION ICI -->
            @if (item.children && item.children.length > 0 && item.expanded && !collapsed) {
              <div class="submenu">
                @for (child of item.children; track child.id) {
                  <mat-list-item 
                    [class.active]="isActive(child)"
                    (click)="navigateTo(child); $event.stopPropagation()">
                    
                    <mat-icon matListItemIcon>{{ child.icon }}</mat-icon>
                    <span matListItemTitle>{{ child.label }}</span>
                    
                    @if (child.badge) {
                      <span 
                        matListItemMeta
                        class="badge"
                        [ngClass]="getBadgeClass(child.badgeColor)">
                        {{ child.badge }}
                      </span>
                    }
                  </mat-list-item>
                }
              </div>
            }

            <!-- Divider -->
            @if (item.id === 'support' || item.id === 'notifications' || item.id === 'users') {
              <mat-divider></mat-divider>
            }
          }
        </mat-list>
      </nav>

      <!-- Footer (Optional) -->
      @if (!collapsed) {
        <div class="sidebar-footer">
          <div class="footer-info">
            <small>Version 1.0.0</small>
            <small>© 2025 AfrikMode</small>
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./admin-sidebar-complete.component.scss']
})
export class AdminSidebarCompleteComponent implements OnInit {
  @Input() collapsed: boolean = false;
  @Input() menuItems: AdminMenuItem[] = [];
  @Output() collapsedChange = new EventEmitter<boolean>();
  @Output() menuItemClick = new EventEmitter<AdminMenuItem>();

  currentRoute: string = '';
  isMobile: boolean = false;

  // Menu par défaut
  defaultMenuItems: AdminMenuItem[] = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: 'dashboard',
      route: '/admin/dashboard'
    },
    {
      id: 'users',
      label: 'Utilisateurs',
      icon: 'people',
      badge: 1234,
      badgeColor: 'primary',
      expanded: false,
      children: [
        {
          id: 'users-all',
          label: 'Tous les utilisateurs',
          icon: 'list',
          route: '/admin/users',
          badge: 1234
        },
        {
          id: 'users-customers',
          label: 'Clients',
          icon: 'person',
          route: '/admin/users',
          badge: 856
        },
        {
          id: 'users-vendors',
          label: 'Vendeurs',
          icon: 'store',
          route: '/admin/users',
          badge: 234
        },
        {
          id: 'users-managers',
          label: 'Managers',
          icon: 'admin_panel_settings',
          route: '/admin/users',
          badge: 89
        },
        {
          id: 'users-admins',
          label: 'Administrateurs',
          icon: 'security',
          route: '/admin/users',
          badge: 55
        }
      ]
    },
    {
      id: 'stores',
      label: 'Boutiques',
      icon: 'store',
      badge: 89,
      badgeColor: 'success',
      expanded: false,
      children: [
        {
          id: 'stores-all',
          label: 'Toutes les boutiques',
          icon: 'list',
          route: '/admin/stores',
          badge: 89
        },
        {
          id: 'stores-pending',
          label: 'En attente',
          icon: 'pending',
          route: '/admin/stores',
          badge: 12,
          badgeColor: 'warning'
        },
        {
          id: 'stores-verified',
          label: 'Vérifiées',
          icon: 'verified',
          route: '/admin/stores',
          badge: 67,
          badgeColor: 'success'
        },
        {
          id: 'stores-suspended',
          label: 'Suspendues',
          icon: 'block',
          route: '/admin/stores',
          badge: 8,
          badgeColor: 'error'
        }
      ]
    },
    {
      id: 'products',
      label: 'Produits',
      icon: 'inventory_2',
      badge: 2456,
      badgeColor: 'info',
      expanded: false,
      children: [
        {
          id: 'products-all',
          label: 'Tous les produits',
          icon: 'list',
          route: '/admin/products',
          badge: 2456
        },
        {
          id: 'products-categories',
          label: 'Catégories',
          icon: 'category',
          route: '/admin/products',
          badge: 45
        },
        {
          id: 'products-pending',
          label: 'En modération',
          icon: 'pending',
          route: '/admin/products',
          badge: 8,
          badgeColor: 'warning'
        },
        {
          id: 'products-out-of-stock',
          label: 'Rupture de stock',
          icon: 'warning',
          route: '/admin/products',
          badge: 23,
          badgeColor: 'error'
        }
      ]
    },
    {
      id: 'orders',
      label: 'Commandes',
      icon: 'shopping_cart',
      badge: 456,
      badgeColor: 'warning',
      expanded: false,
      children: [
        {
          id: 'orders-all',
          label: 'Toutes les commandes',
          icon: 'list',
          route: '/admin/orders',
          badge: 456
        },
        {
          id: 'orders-pending',
          label: 'En attente',
          icon: 'pending',
          route: '/admin/orders?status=pending',
          badge: 34,
          badgeColor: 'warning'
        },
        {
          id: 'orders-processing',
          label: 'En cours',
          icon: 'local_shipping',
          route: '/admin/orders?status=processing',
          badge: 67,
          badgeColor: 'info'
        },
        {
          id: 'orders-delivered',
          label: 'Livrées',
          icon: 'check_circle',
          route: '/admin/orders?status=delivered',
          badge: 345,
          badgeColor: 'success'
        }
      ]
    },
    {
      id: 'payments',
      label: 'Paiements',
      icon: 'payment',
      route: '/admin/payments',
      badge: 5,
      badgeColor: 'warning'
    },
    {
      id: 'support',
      label: 'Support Client',
      icon: 'support_agent',
      route: '/admin/support',
      badge: 23,
      badgeColor: 'error'
    },
    {
      id: 'marketing',
      label: 'Marketing',
      icon: 'campaign',
      expanded: false,
      children: [
        {
          id: 'marketing-coupons',
          label: 'Coupons',
          icon: 'local_offer',
          route: '/admin/marketing/coupons',
          badge: 45
        },
        {
          id: 'marketing-promotions',
          label: 'Promotions',
          icon: 'percent',
          route: '/admin/marketing/promotions',
          badge: 12
        },
        {
          id: 'marketing-newsletter',
          label: 'Newsletter',
          icon: 'email',
          route: '/admin/marketing/newsletter',
          badge: 1234
        },
        {
          id: 'marketing-loyalty',
          label: 'Programme de Fidélité',
          icon: 'loyalty',
          route: '/admin/loyalty',
          badge: 89
        },
        {
          id: 'marketing-email',
          label: 'Marketing par E-mail',
          icon: 'campaign',
          route: '/admin/email-marketing',
          badge: 45
        }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'analytics',
      expanded: false,
      children: [
        {
          id: 'analytics-overview',
          label: "Vue d'ensemble",
          icon: 'pie_chart',
          route: '/admin/analytics/overview'
        },
        {
          id: 'analytics-sales',
          label: 'Ventes',
          icon: 'trending_up',
          route: '/admin/analytics/sales'
        },
        {
          id: 'analytics-users',
          label: 'Utilisateurs',
          icon: 'people',
          route: '/admin/analytics/users'
        },
        {
          id: 'analytics-products',
          label: 'Produits',
          icon: 'inventory',
          route: '/admin/analytics/products'
        }
      ]
    },
    {
      id: 'media',
      label: 'Médias',
      icon: 'photo_library',
      route: '/admin/media',
      badge: 1567
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'notifications',
      route: '/admin/notifications',
      badge: 89
    },
    {
      id: 'settings',
      label: 'Configuration',
      icon: 'settings',
      expanded: false,
      children: [
        {
          id: 'settings-general',
          label: 'Général',
          icon: 'tune',
          route: '/admin/settings/general'
        },
        {
          id: 'settings-security',
          label: 'Sécurité',
          icon: 'security',
          route: '/admin/settings/security'
        },
        {
          id: 'settings-email',
          label: 'Email',
          icon: 'email',
          route: '/admin/settings/email'
        },
        {
          id: 'settings-payments',
          label: 'Paiements',
          icon: 'payment',
          route: '/admin/settings/payments'
        }
      ]
    },
    {
      id: 'logs',
      label: 'Logs & Audit',
      icon: 'history',
      route: '/admin/logs'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Utiliser les items fournis ou les items par défaut
    if (this.menuItems.length === 0) {
      this.menuItems = this.defaultMenuItems;
    }

    // Écouter les changements de route
    this.currentRoute = this.router.url;
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
      });

    // Détecter mobile
    this.checkMobile();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkMobile();
  }

  checkMobile() {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile && !this.collapsed) {
      this.collapsed = true;
      this.collapsedChange.emit(this.collapsed);
    }
  }

  toggleCollapsed() {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
    
    // Fermer tous les submenus quand on collapse
    if (this.collapsed) {
      this.menuItems.forEach(item => {
        if (item.children) {
          item.expanded = false;
        }
      });
    }
  }

  toggleSubmenu(item: AdminMenuItem, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Si l'item a des enfants, toggle le submenu
    if (item.children && item.children.length > 0) {
      // Fermer tous les autres submenus
      this.menuItems.forEach(menuItem => {
        if (menuItem.id !== item.id && menuItem.children) {
          menuItem.expanded = false;
        }
      });

      // Toggle le submenu cliqué
      item.expanded = !item.expanded;
      
      console.log(`Toggle ${item.label}: ${item.expanded ? 'OUVERT' : 'FERMÉ'}`);
    } 
    // Sinon, naviguer vers la route
    else if (item.route) {
      this.navigateTo(item);
    }
  }

  navigateTo(item: AdminMenuItem) {
    if (item.route) {
      this.router.navigate([item.route]);
      this.menuItemClick.emit(item);
      
      // Sur mobile, fermer la sidebar après navigation
      if (this.isMobile) {
        this.collapsed = true;
        this.collapsedChange.emit(this.collapsed);
      }
    }
  }

  isActive(item: AdminMenuItem): boolean {
    if (!item.route) return false;
    
    // Extraire la route de base sans les paramètres de requête
    const baseRoute = item.route.split('?')[0];
    const currentBaseRoute = this.currentRoute.split('?')[0];
    
    // Correspondance exacte de la route de base
    return currentBaseRoute === baseRoute;
  }


  getBadgeClass(color?: string): string {
    switch (color) {
      case 'success': return 'badge-success';
      case 'warning': return 'badge-warning';
      case 'error': return 'badge-error';
      case 'info': return 'badge-info';
      default: return 'badge-primary';
    }
  }
}