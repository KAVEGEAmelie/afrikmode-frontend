import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { filter } from 'rxjs/operators';
import { AdminService } from '../../../../../core/services/admin.service';

export interface AdminMenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  children?: AdminMenuItem[];
  expanded?: boolean;
  hidden?: boolean;
  divider?: boolean;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
    MatRippleModule,
    RouterModule
  ],
  animations: [
    trigger('slideDown', [
      state('void', style({ height: '0', opacity: '0' })),
      state('*', style({ height: '*', opacity: '1' })),
      transition('void <=> *', animate('300ms ease-in-out'))
    ]),
    trigger('rotateArrow', [
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      state('expanded', style({ transform: 'rotate(180deg)' })),
      transition('collapsed <=> expanded', animate('300ms ease-in-out'))
    ])
  ],
  template: `
    <aside class="admin-sidebar" [class.collapsed]="collapsed" [class.mobile]="isMobile">
      <!-- Logo & Brand -->
      <div class="sidebar-header">
        <div class="logo-container">
          <div class="logo-icon">
            <i class="fas fa-shield-alt"></i>
          </div>
          @if (!collapsed) {
            <div class="brand-text">
              <h1>AfrikMode</h1>
              <span>Administration</span>
            </div>
          }
        </div>
        
        <button 
          class="collapse-btn" 
          (click)="toggleSidebar()"
          [matTooltip]="collapsed ? 'Développer' : 'Réduire'"
          matTooltipPosition="right">
          <i class="fas" [class.fa-angle-right]="collapsed" [class.fa-angle-left]="!collapsed"></i>
        </button>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav" [class.collapsed]="collapsed">
        @for (item of menuItems; track item.id) {
          @if (!item.hidden) {
            <div class="menu-item-wrapper">
              <!-- Item Principal -->
              <div 
                class="menu-item"
                [class.active]="isActive(item)"
                [class.has-children]="hasChildren(item)"
                [matTooltip]="collapsed ? item.label : ''"
                matTooltipPosition="right"
                matRipple
                (click)="handleItemClick(item)">
                
                <div class="menu-item-content">
                  <i class="menu-icon fas {{ item.icon }}"></i>
                  @if (!collapsed) {
                    <span class="menu-label">{{ item.label }}</span>
                  }
                </div>

                @if (!collapsed) {
                  <div class="menu-item-meta">
                    @if (hasChildren(item)) {
                      <i 
                        class="arrow-icon fas fa-chevron-down"
                        [@rotateArrow]="item.expanded ? 'expanded' : 'collapsed'">
                      </i>
                    }
                  </div>
                }
              </div>

              <!-- Submenu -->
              @if (hasChildren(item) && item.expanded && !collapsed) {
                <div class="submenu" [@slideDown]>
                  @for (child of item.children; track child.id) {
                    <div 
                      class="submenu-item"
                      [class.active]="isActive(child)"
                      matRipple
                      (click)="handleItemClick(child); $event.stopPropagation()">
                      
                      <i class="submenu-icon fas {{ child.icon }}"></i>
                      <span class="submenu-label">{{ child.label }}</span>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Divider -->
            @if (item.divider) {
              <div class="menu-divider"></div>
            }
          }
        }
      </nav>

      <!-- Footer -->
      @if (!collapsed) {
        <div class="sidebar-footer">
          <div class="version-info">
            <i class="fas fa-code-branch"></i>
            <span>Version 1.0.0</span>
          </div>
          <div class="copyright">
            © 2025 AfrikMode
          </div>
        </div>
      }
    </aside>
  `,
  styles: [`
    .admin-sidebar {
      height: 100vh;
      width: 280px;
      background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      overflow: hidden;

      &.collapsed {
        width: 70px;

        .sidebar-header {
          .logo-container {
            justify-content: center;
          }

          .collapse-btn {
            position: absolute;
            right: -12px;
            background: #1e293b;
            border: 2px solid #334155;
          }
        }

        .sidebar-nav {
          .menu-item {
            justify-content: center;
            padding: 12px;

            .menu-item-content {
              .menu-icon {
                margin-right: 0;
              }
            }
          }
        }
      }

      &.mobile {
        transform: translateX(-100%);
        
        &:not(.collapsed) {
          transform: translateX(0);
        }
      }
    }

    // === HEADER ===
    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 80px;

      .logo-container {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;

        .logo-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          flex-shrink: 0;

          i {
            font-size: 22px;
            color: white;
          }
        }

        .brand-text {
          h1 {
            font-size: 20px;
            font-weight: 700;
            margin: 0;
            color: white;
            line-height: 1.2;
          }

          span {
            font-size: 12px;
            color: #94a3b8;
            font-weight: 500;
          }
        }
      }

      .collapse-btn {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }

        i {
          font-size: 16px;
        }
      }
    }

    // === NAVIGATION ===
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 12px 8px;

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;

        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }
    }

    .menu-item-wrapper {
      margin-bottom: 4px;
    }

    .menu-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      margin: 0 4px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 3px;
        height: 100%;
        background: #3b82f6;
        transform: scaleY(0);
        transition: transform 0.2s ease;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.05);

        &::before {
          transform: scaleY(1);
        }
      }

      &.active {
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

        &::before {
          background: white;
          transform: scaleY(1);
        }

        .menu-icon {
          color: white;
        }

        .menu-label {
          color: white;
          font-weight: 600;
        }

        .arrow-icon {
          color: white;
        }
      }

      .menu-item-content {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;

        .menu-icon {
          font-size: 18px;
          width: 20px;
          color: #94a3b8;
          transition: all 0.2s ease;
        }

        .menu-label {
          font-size: 14px;
          font-weight: 500;
          color: #e2e8f0;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
      }

      .menu-item-meta {
        display: flex;
        align-items: center;
        gap: 8px;

        .arrow-icon {
          font-size: 12px;
          color: #94a3b8;
          transition: all 0.3s ease;
        }
      }
    }

    // === SUBMENU ===
    .submenu {
      margin-top: 4px;
      margin-bottom: 8px;
      padding-left: 20px;
      overflow: hidden;

      .submenu-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 16px;
        margin: 2px 4px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;

        &::before {
          content: '';
          position: absolute;
          left: -16px;
          top: 50%;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #475569;
          transform: translateY(-50%);
          transition: all 0.2s ease;
        }

        &:hover {
          background: rgba(255, 255, 255, 0.05);

          &::before {
            background: #3b82f6;
            transform: translateY(-50%) scale(1.3);
          }
        }

        &.active {
          background: rgba(59, 130, 246, 0.2);

          &::before {
            background: #3b82f6;
            box-shadow: 0 0 8px #3b82f6;
          }

          .submenu-icon {
            color: #3b82f6;
          }

          .submenu-label {
            color: white;
            font-weight: 600;
          }
        }

        .submenu-icon {
          font-size: 14px;
          width: 16px;
          color: #64748b;
          transition: all 0.2s ease;
        }

        .submenu-label {
          font-size: 13px;
          color: #cbd5e1;
          flex: 1;
          transition: all 0.2s ease;
        }

      }
    }

    // === DIVIDER ===
    .menu-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: 12px 16px;
    }

    // === FOOTER ===
    .sidebar-footer {
      padding: 16px 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.2);

      .version-info {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #64748b;
        font-size: 12px;
        margin-bottom: 4px;

        i {
          font-size: 12px;
        }
      }

      .copyright {
        font-size: 11px;
        color: #475569;
        text-align: center;
      }
    }

    // === RESPONSIVE ===
    @media (max-width: 768px) {
      .admin-sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;

        &.mobile:not(.collapsed) {
          transform: translateX(0);
        }
      }
    }
  `]
})
export class AdminSidebarComponent implements OnInit {
  @Input() collapsed: boolean = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  currentRoute: string = '';
  isMobile: boolean = false;

  menuItems: AdminMenuItem[] = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: 'fa-chart-line',
      route: '/admin/dashboard'
    },
    
    // === GESTION DES UTILISATEURS ===
    {
      id: 'users',
      label: 'Utilisateurs',
      icon: 'fa-users',
      expanded: false,
      children: [
        {
          id: 'users-all',
          label: 'Tous les utilisateurs',
          icon: 'fa-list',
          route: '/admin/users'
        },
        {
          id: 'users-customers',
          label: 'Clients',
          icon: 'fa-user',
          route: '/admin/users/clients',
         
        },
        {
          id: 'users-vendors',
          label: 'Vendeurs',
          icon: 'fa-store',
          route: '/admin/users/vendors'
        },
        {
          id: 'vendor-requests',
          label: 'Candidatures Vendeur',
          icon: 'fa-user-check',
          route: '/admin/vendor-requests'
        },
        {
          id: 'users-admins',
          label: 'Administrateurs',
          icon: 'fa-user-shield',
          route: '/admin/users/admins'
        }
      ],
      divider: true
    },

    // === GESTION DE LA PLATEFORME ===
    {
      id: 'stores',
      label: 'Boutiques',
      icon: 'fa-store-alt',
      expanded: false,
      children: [
        {
          id: 'stores-all',
          label: 'Toutes les boutiques',
          icon: 'fa-list',
          route: '/admin/stores/all',
         
        },
        {
          id: 'stores-pending',
          label: 'En attente',
          icon: 'fa-clock',
          route: '/admin/stores/pending'
        },
        {
          id: 'stores-verified',
          label: 'Vérifiées',
          icon: 'fa-check-circle',
          route: '/admin/stores/verified'
        },
        {
          id: 'stores-suspended',
          label: 'Suspendues',
          icon: 'fa-ban',
          route: '/admin/stores/suspended'
        }
      ]
    },

    {
      id: 'products',
      label: 'Produits',
      icon: 'fa-boxes',
      expanded: false,
      children: [
        {
          id: 'products-all',
          label: 'Tous les produits',
          icon: 'fa-list',
          route: '/admin/products/all',
        
        },
        {
          id: 'products-categories',
          label: 'Catégories',
          icon: 'fa-tags',
          route: '/admin/categories',
        
        },
        {
          id: 'products-pending',
          label: 'En modération',
          icon: 'fa-clock',
          route: '/admin/products/moderation'
        },
        {
          id: 'products-out-stock',
          label: 'Rupture de stock',
          icon: 'fa-exclamation-triangle',
          route: '/admin/products/out-of-stock'
        }
      ]
    },

    {
      id: 'orders',
      label: 'Commandes',
      icon: 'fa-shopping-cart',
      expanded: false,
      children: [
        {
          id: 'orders-all',
          label: 'Toutes les commandes',
          icon: 'fa-list',
          route: '/admin/orders/all',
       
        },
        {
          id: 'orders-pending',
          label: 'En attente',
          icon: 'fa-hourglass-half',
          route: '/admin/orders/pending'
        },
        {
          id: 'orders-processing',
          label: 'En traitement',
          icon: 'fa-spinner',
          route: '/admin/orders/processing'
        },
        {
          id: 'orders-shipped',
          label: 'Expédiées',
          icon: 'fa-shipping-fast',
          route: '/admin/orders/shipped'
        },
        {
          id: 'orders-delivered',
          label: 'Livrées',
          icon: 'fa-check-circle',
          route: '/admin/orders/delivered'
        }
      ],
      divider: true
    },

    // === FINANCES ===
    {
      id: 'payments',
      label: 'Paiements',
      icon: 'fa-money-bill-wave',
      expanded: false,
      children: [
        {
          id: 'payments-all',
          label: 'Tous les paiements',
          icon: 'fa-list',
          route: '/admin/payments/all'
        },
        {
          id: 'payments-pending',
          label: 'En attente',
          icon: 'fa-clock',
          route: '/admin/payments/pending'
        },
        {
          id: 'payments-completed',
          label: 'Complétés',
          icon: 'fa-check',
          route: '/admin/payments/completed'
        },
        {
          id: 'payments-failed',
          label: 'Échoués',
          icon: 'fa-times-circle',
          route: '/admin/payments/failed'
        }
      ]
    },

    {
      id: 'finances',
      label: 'Finances',
      icon: 'fa-chart-pie',
      expanded: false,
      children: [
        {
          id: 'finances-overview',
          label: 'Vue d\'ensemble',
          icon: 'fa-chart-bar',
          route: '/admin/finances'
        },
        {
          id: 'finances-revenues',
          label: 'Revenus',
          icon: 'fa-dollar-sign',
          route: '/admin/finances/revenues'
        },
        {
          id: 'finances-commissions',
          label: 'Commissions',
          icon: 'fa-percentage',
          route: '/admin/finances/commissions'
        },
        {
          id: 'finances-payouts',
          label: 'Versements vendeurs',
          icon: 'fa-hand-holding-usd',
          route: '/admin/finances/payouts'
        },
        {
          id: 'finances-invoices',
          label: 'Factures',
          icon: 'fa-file-invoice',
          route: '/admin/finances/invoices'
        }
      ],
      divider: true
    },

    // === MARKETING ===
    {
      id: 'marketing',
      label: 'Marketing',
      icon: 'fa-bullhorn',
      expanded: false,
      children: [
        {
          id: 'marketing-campaigns',
          label: 'Campagnes',
          icon: 'fa-rocket',
          route: '/admin/marketing/campaigns'
        },
        {
          id: 'marketing-coupons',
          label: 'Codes promo',
          icon: 'fa-ticket-alt',
          route: '/admin/marketing/coupons',
          
        },
        {
          id: 'marketing-promotions',
          label: 'Promotions',
          icon: 'fa-percent',
          route: '/admin/marketing/promotions',
        
        },
        {
          id: 'marketing-newsletter',
          label: 'Newsletter',
          icon: 'fa-envelope',
          route: '/admin/marketing/newsletter'
        },
        {
          id: 'marketing-loyalty',
          label: 'Programme fidélité',
          icon: 'fa-gift',
          route: '/admin/marketing/loyalty'
        },
        {
          id: 'marketing-banners',
          label: 'Bannières',
          icon: 'fa-image',
          route: '/admin/marketing/banners'
        }
      ]
    },

    // === DESIGN & CONTENU ===
    {
      id: 'appearance',
      label: 'Apparence',
      icon: 'fa-palette',
      expanded: false,
      children: [
        {
          id: 'appearance-theme',
          label: 'Thème & Couleurs',
          icon: 'fa-fill-drip',
          route: '/admin/appearance/theme'
        },
        {
          id: 'appearance-logo',
          label: 'Logo & Favicon',
          icon: 'fa-icons',
          route: '/admin/appearance/logo'
        },
        {
          id: 'appearance-homepage',
          label: 'Page d\'accueil',
          icon: 'fa-home',
          route: '/admin/appearance/homepage'
        },
        {
          id: 'appearance-menu',
          label: 'Menus',
          icon: 'fa-bars',
          route: '/admin/appearance/menus'
        },
        {
          id: 'appearance-widgets',
          label: 'Widgets',
          icon: 'fa-th-large',
          route: '/admin/appearance/widgets'
        }
      ]
    },

    {
      id: 'media',
      label: 'Médiathèque',
      icon: 'fa-photo-video',
      route: '/admin/media'
    },

    {
      id: 'content',
      label: 'Contenu',
      icon: 'fa-file-alt',
      expanded: false,
      children: [
        {
          id: 'content-pages',
          label: 'Pages',
          icon: 'fa-file',
          route: '/admin/content/pages'
        },
        {
          id: 'content-blog',
          label: 'Blog',
          icon: 'fa-blog',
          route: '/admin/content/blog'
        },
        {
          id: 'content-faqs',
          label: 'FAQ',
          icon: 'fa-question-circle',
          route: '/admin/content/faqs'
        },
        {
          id: 'content-reviews',
          label: 'Avis clients',
          icon: 'fa-star',
          route: '/admin/content/reviews'
        }
      ],
      divider: true
    },

    // === ANALYTICS ===
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'fa-chart-area',
      expanded: false,
      children: [
        {
          id: 'analytics-overview',
          label: 'Vue d\'ensemble',
          icon: 'fa-tachometer-alt',
          route: '/admin/analytics'
        },
        {
          id: 'analytics-sales',
          label: 'Ventes',
          icon: 'fa-chart-line',
          route: '/admin/analytics/sales'
        },
        {
          id: 'analytics-traffic',
          label: 'Trafic',
          icon: 'fa-globe',
          route: '/admin/analytics/traffic'
        },
        {
          id: 'analytics-users',
          label: 'Utilisateurs',
          icon: 'fa-users',
          route: '/admin/analytics/users'
        },
        {
          id: 'analytics-products',
          label: 'Produits',
          icon: 'fa-box',
          route: '/admin/analytics/products'
        }
      ]
    },

    {
      id: 'reports',
      label: 'Rapports',
      icon: 'fa-file-export',
      expanded: false,
      children: [
        {
          id: 'reports-sales',
          label: 'Rapport de ventes',
          icon: 'fa-chart-bar',
          route: '/admin/reports/sales'
        },
        {
          id: 'reports-inventory',
          label: 'Rapport d\'inventaire',
          icon: 'fa-warehouse',
          route: '/admin/reports/inventory'
        },
        {
          id: 'reports-finance',
          label: 'Rapport financier',
          icon: 'fa-money-check',
          route: '/admin/reports/finance'
        },
        {
          id: 'reports-custom',
          label: 'Rapports personnalisés',
          icon: 'fa-cogs',
          route: '/admin/reports/custom'
        }
      ],
      divider: true
    },

    // === COMMUNICATION ===
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'fa-bell',
      route: '/admin/notifications'
    },

    {
      id: 'messages',
      label: 'Messages',
      icon: 'fa-comments',
      route: '/admin/messages'
    },

    {
      id: 'support',
      label: 'Support',
      icon: 'fa-headset',
      expanded: false,
      children: [
        {
          id: 'support-tickets',
          label: 'Tickets',
          icon: 'fa-ticket-alt',
          route: '/admin/support/tickets'
        },
        {
          id: 'support-live-chat',
          label: 'Chat en direct',
          icon: 'fa-comment-dots',
          route: '/admin/support/chat'
        },
        {
          id: 'support-knowledge',
          label: 'Base de connaissances',
          icon: 'fa-book',
          route: '/admin/support/knowledge'
        }
      ],
      divider: true
    },

    // === PARAMÈTRES ===
    {
      id: 'settings',
      label: 'Paramètres',
      icon: 'fa-cog',
      expanded: false,
      children: [
        {
          id: 'settings-general',
          label: 'Général',
          icon: 'fa-sliders-h',
          route: '/admin/settings/general'
        },
        {
          id: 'settings-security',
          label: 'Sécurité',
          icon: 'fa-shield-alt',
          route: '/admin/settings/security'
        },
        {
          id: 'settings-email',
          label: 'Email',
          icon: 'fa-envelope',
          route: '/admin/settings/email'
        },
        {
          id: 'settings-payments',
          label: 'Paiements',
          icon: 'fa-credit-card',
          route: '/admin/settings/payments'
        },
        {
          id: 'settings-shipping',
          label: 'Livraison',
          icon: 'fa-truck',
          route: '/admin/settings/shipping'
        },
        {
          id: 'settings-taxes',
          label: 'Taxes & TVA',
          icon: 'fa-calculator',
          route: '/admin/settings/taxes'
        },
        {
          id: 'settings-integrations',
          label: 'Intégrations',
          icon: 'fa-plug',
          route: '/admin/settings/integrations'
        },
        {
          id: 'settings-api',
          label: 'API',
          icon: 'fa-code',
          route: '/admin/settings/api'
        }
      ]
    },

    {
      id: 'logs',
      label: 'Logs & Audit',
      icon: 'fa-history',
      route: '/admin/logs'
    }
  ];

  constructor(
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.currentRoute = this.router.url;
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
      });

    this.checkMobile();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkMobile();
  }

  checkMobile() {
    this.isMobile = window.innerWidth < 768;
  }


  toggleSidebar() {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);

    if (this.collapsed) {
      this.menuItems.forEach(item => item.expanded = false);
    }
  }

  handleItemClick(item: AdminMenuItem) {
    if (this.hasChildren(item)) {
      // Toggle submenu
      this.menuItems.forEach(menuItem => {
        if (menuItem.id !== item.id) {
          menuItem.expanded = false;
        }
      });
      item.expanded = !item.expanded;
    } else if (item.route) {
      // Navigate
      this.router.navigate([item.route]);
      
      if (this.isMobile) {
        this.collapsed = true;
        this.collapsedChange.emit(this.collapsed);
      }
    }
  }

  hasChildren(item: AdminMenuItem): boolean {
    return !!(item.children && item.children.length > 0);
  }

  isActive(item: AdminMenuItem): boolean {
    if (!item.route) return false;
    
    // Pour les items avec des enfants (parents), on ne les met jamais en surbrillance
    if (this.hasChildren(item)) {
      return false;
    }
    
    // Pour les items sans enfants, on compare la route complète (avec query params)
    // Normaliser les routes pour la comparaison
    const normalizeRoute = (route: string) => {
      // Retirer les slashes de fin et normaliser
      return route.replace(/\/$/, '').toLowerCase();
    };
    
    const normalizedItemRoute = normalizeRoute(item.route);
    const normalizedCurrentRoute = normalizeRoute(this.currentRoute);
    
    // Vérifier si c'est exactement la même route (avec ou sans query params)
    return normalizedCurrentRoute === normalizedItemRoute || 
           normalizedCurrentRoute.startsWith(normalizedItemRoute + '?');
  }
}
