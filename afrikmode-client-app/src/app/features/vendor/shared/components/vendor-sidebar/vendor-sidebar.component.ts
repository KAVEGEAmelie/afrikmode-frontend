import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  badge?: number;
  badgeColor?: 'primary' | 'accent' | 'warn' | 'error' | 'success' | 'info' | 'warning';
  expanded?: boolean;
  children?: MenuItem[];
  hidden?: boolean;
  disabled?: boolean;
  highlighted?: boolean;
}

@Component({
  selector: 'app-vendor-sidebar',
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
    MatRippleModule,
    RouterModule
  ],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({
          height: 0,
          opacity: 0,
          overflow: 'hidden'
        }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({
          height: '*',
          opacity: 1
        }))
      ]),
      transition(':leave', [
        style({
          height: '*',
          opacity: 1,
          overflow: 'hidden'
        }),
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({
          height: 0,
          opacity: 0
        }))
      ])
    ])
  ],
  template: `
    <div class="vendor-sidebar" [class.collapsed]="collapsed" [class.mobile]="isMobile">
      <!-- Header -->
      <div class="sidebar-header">
        <div class="brand" [class.collapsed]="collapsed">
          <div class="brand-icon">
            <mat-icon>storefront</mat-icon>
          </div>
          @if (!collapsed) {
            <div class="brand-info">
              <h2>AfrikMode</h2>
              <span class="subtitle">Espace Vendeur</span>
            </div>
          }
        </div>

        @if (!isMobile) {
          <button 
            mat-icon-button 
            class="toggle-btn"
            (click)="toggleCollapsed()"
            [matTooltip]="collapsed ? 'Agrandir le menu' : 'Réduire le menu'"
            matTooltipPosition="right">
            <mat-icon>{{ collapsed ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          </button>
        }
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <mat-list>
          @for (item of menuItems; track item.id) {
            @if (!item.hidden) {
              <mat-list-item 
                matRipple
                [matRippleColor]="'rgba(139, 46, 46, 0.2)'"
                [class.active]="isActive(item)"
                [class.disabled]="item.disabled"
                [class.highlighted]="item.highlighted"
                [matTooltip]="collapsed ? item.label : ''"
                matTooltipPosition="right"
                (click)="handleMenuClick(item, $event)">
              
                <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
                
                <span matListItemTitle class="menu-label" [class.hidden]="collapsed">{{ item.label }}</span>
                
                <span matListItemMeta class="menu-meta" [class.hidden]="collapsed">
                  <!-- Badge -->
                  @if (item.badge) {
                    <span 
                      class="badge"
                      [ngClass]="getBadgeClass(item.badgeColor)">
                      {{ item.badge }}
                    </span>
                  }
                </span>
              </mat-list-item>

              <!-- Dividers -->
              @if (shouldShowDivider(item)) {
                <mat-divider></mat-divider>
              }
            }
          }
        </mat-list>
      </nav>

      <!-- Footer -->
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
  styleUrls: ['./vendor-sidebar.component.scss']
})
export class VendorSidebarComponent implements OnInit {
  @Input() collapsed: boolean = false;
  @Input() isMobile: boolean | null = false;
  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() itemClicked = new EventEmitter<MenuItem>();

  menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: 'dashboard',
      route: '/vendor/dashboard'
    },
    {
      id: 'products',
      label: 'Produits',
      icon: 'inventory_2',
      badge: 24,
      badgeColor: 'info',
      route: '/vendor/products'
    },
    {
      id: 'orders',
      label: 'Commandes',
      icon: 'shopping_cart',
      badge: 12,
      badgeColor: 'error',
      route: '/vendor/orders'
    },
    {
      id: 'finances',
      label: 'Finances',
      icon: 'account_balance_wallet',
      route: '/vendor/finances'
    },
    {
      id: 'analytics',
      label: 'Analytique',
      icon: 'analytics',
      route: '/vendor/analytics'
    },
    {
      id: 'marketing',
      label: 'Commercialisation',
      icon: 'campaign',
      route: '/vendor/marketing'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: 'chat',
      badge: 5,
      badgeColor: 'warn',
      route: '/vendor/messages'
    },
    {
      id: 'reviews',
      label: 'Avis',
      icon: 'star',
      badge: 3,
      badgeColor: 'info',
      route: '/vendor/reviews'
    },
    {
      id: 'inventory',
      label: 'Stock',
      icon: 'warehouse',
      route: '/vendor/inventory'
    },
    {
      id: 'shipping',
      label: 'Livraison',
      icon: 'local_shipping',
      route: '/vendor/shipping'
    },
    {
      id: 'loyalty',
      label: 'Fidélité',
      icon: 'loyalty',
      route: '/vendor/loyalty'
    },
    {
      id: 'email-marketing',
      label: 'Email Marketing',
      icon: 'email',
      route: '/vendor/email-marketing'
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: 'settings',
      route: '/vendor/settings'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Écouter les changements de route pour mettre à jour l'état actif
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Les états actifs sont gérés automatiquement par isActive()
      });
  }

  toggleCollapsed(): void {
    this.toggleCollapse.emit();
  }

  handleMenuClick(item: MenuItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (item.disabled) {
      return;
    }

    if (item.route) {
      this.navigateTo(item);
      this.itemClicked.emit(item);
    }
  }


  navigateTo(item: MenuItem): void {
    if (item.route) {
      console.log('🚀 Navigation vers:', item.route);
      this.router.navigate([item.route]).then(success => {
        if (success) {
          console.log('✅ Navigation réussie vers:', item.route);
        } else {
          console.error('❌ Échec de navigation vers:', item.route);
        }
      }).catch(error => {
        console.error('❌ Erreur de navigation:', error);
      });
    }
  }

  isActive(item: MenuItem): boolean {
    if (!item.route) return false;
    
    const currentUrl = this.router.url;
    
    // Correspondance exacte pour les routes principales
    if (currentUrl === item.route) {
      return true;
    }
    
    // Vérifier les paramètres de requête
    if (item.route.includes('?')) {
      const [baseRoute, queryParams] = item.route.split('?');
      if (currentUrl.startsWith(baseRoute) && currentUrl.includes(queryParams)) {
        return true;
      }
    }
    
    // Vérifier les sous-routes
    if (currentUrl.startsWith(item.route + '/')) {
      return true;
    }
    
    return false;
  }


  shouldShowDivider(item: MenuItem): boolean {
    return item.id === 'analytics' || item.id === 'marketing';
  }

  getBadgeClass(color?: string): string {
    if (!color) return 'badge-primary';
    return `badge-${color}`;
  }

  // Méthode pour mettre à jour les badges dynamiquement
  updateBadge(itemId: string, count: number): void {
    const findAndUpdate = (items: MenuItem[]): boolean => {
      for (const item of items) {
        if (item.id === itemId) {
          item.badge = count;
          return true;
        }
        if (item.children) {
          if (findAndUpdate(item.children)) {
            return true;
          }
        }
      }
      return false;
    };
    
    findAndUpdate(this.menuItems);
  }

  // Méthode pour activer/désactiver un élément
  toggleItemState(itemId: string, disabled: boolean): void {
    const findAndToggle = (items: MenuItem[]): boolean => {
      for (const item of items) {
        if (item.id === itemId) {
          item.disabled = disabled;
          return true;
        }
        if (item.children) {
          if (findAndToggle(item.children)) {
            return true;
          }
        }
      }
      return false;
    };
    
    findAndToggle(this.menuItems);
  }
}