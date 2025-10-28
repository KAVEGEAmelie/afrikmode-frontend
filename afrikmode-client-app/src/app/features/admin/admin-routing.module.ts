// src/app/features/admin/admin-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '../../core/guards/permission.guard';
import { AdminAuthGuard } from './core/guards/admin-auth.guard';
import { AdminGuard } from '../../core/guards/admin.guard';

// Layout
import { AdminComponent } from './admin.component';

// Pages
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';

const routes: Routes = [
  // Route de connexion - redirige vers la page de connexion principale
  {
    path: 'login',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  // Route de test sans authentification
  {
    path: 'test',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { 
          title: 'Tableau de bord (Test)',
          breadcrumb: 'Dashboard'
        }
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent),
        data: { 
          title: 'Gestion des Utilisateurs (Test)',
          breadcrumb: 'Utilisateurs'
        }
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent),
        data: { 
          title: 'Gestion des Produits (Test)',
          breadcrumb: 'Produits'
        }
      },
      {
        path: 'stores',
        loadComponent: () => import('./pages/stores/admin-stores-management.component').then(m => m.AdminStoresManagementComponent),
        data: { 
          title: 'Gestion des Boutiques (Test)',
          breadcrumb: 'Boutiques'
        }
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/orders/admin-orders-management.component').then(m => m.AdminOrdersManagementComponent),
        data: { 
          title: 'Gestion des Commandes (Test)',
          breadcrumb: 'Commandes'
        }
      },
      {
        path: 'support',
        loadComponent: () => import('./pages/support/admin-support-management.component').then(m => m.AdminSupportManagementComponent),
        data: { 
          title: 'Support Client (Test)',
          breadcrumb: 'Support'
        }
      },
      {
        path: 'analytics',
        loadComponent: () => import('./pages/analytics/admin-analytics.component').then(m => m.AdminAnalyticsComponent),
        data: { 
          title: 'Analytics (Test)',
          breadcrumb: 'Analytics'
        }
      },
      {
        path: 'coupons',
        loadComponent: () => import('./pages/coupons/admin-coupons-management.component').then(m => m.AdminCouponsManagementComponent),
        data: { 
          title: 'Coupons (Test)',
          breadcrumb: 'Coupons'
        }
      }
    ]
  },
  // Route normale avec authentification
  {
    path: '',
    component: AdminComponent,
    canActivate: [AdminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [PermissionGuard],
        data: { 
          title: 'Tableau de bord',
          breadcrumb: 'Dashboard',
          permission: 'dashboard.view'
        }
      },
      // Routes des pages admin avec permissions
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Gestion des Utilisateurs',
          breadcrumb: 'Utilisateurs',
          permission: 'users.view'
        }
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Gestion des Produits',
          breadcrumb: 'Produits',
          permission: 'products.view'
        }
      },
      {
        path: 'stores',
        loadComponent: () => import('./pages/stores/admin-stores-management.component').then(m => m.AdminStoresManagementComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Gestion des Boutiques',
          breadcrumb: 'Boutiques',
          permission: 'stores.view'
        }
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/orders/admin-orders-management.component').then(m => m.AdminOrdersManagementComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Gestion des Commandes',
          breadcrumb: 'Commandes',
          permission: 'orders.view'
        }
      },
      {
        path: 'support',
        loadComponent: () => import('./pages/support/admin-support-management.component').then(m => m.AdminSupportManagementComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Support Client',
          breadcrumb: 'Support',
          permission: 'support.view'
        }
      },
      {
        path: 'analytics',
        canActivate: [PermissionGuard],
        data: { 
          title: 'Analytics & Rapports',
          breadcrumb: 'Analytics',
          permission: 'analytics.view'
        },
        children: [
          {
            path: '',
            redirectTo: 'overview',
            pathMatch: 'full'
          },
          {
            path: 'overview',
            loadComponent: () => import('./pages/analytics/admin-analytics.component').then(m => m.AdminAnalyticsComponent),
            data: { 
              title: 'Vue d\'ensemble',
              breadcrumb: 'Vue d\'ensemble'
            }
          },
          {
            path: 'sales',
            loadComponent: () => import('./pages/analytics/admin-analytics.component').then(m => m.AdminAnalyticsComponent),
            data: { 
              title: 'Analytics Ventes',
              breadcrumb: 'Ventes'
            }
          },
          {
            path: 'users',
            loadComponent: () => import('./pages/analytics/admin-analytics.component').then(m => m.AdminAnalyticsComponent),
            data: { 
              title: 'Analytics Utilisateurs',
              breadcrumb: 'Utilisateurs'
            }
          },
          {
            path: 'products',
            loadComponent: () => import('./pages/analytics/admin-analytics.component').then(m => m.AdminAnalyticsComponent),
            data: { 
              title: 'Analytics Produits',
              breadcrumb: 'Produits'
            }
          }
        ]
      },
      {
        path: 'marketing',
        canActivate: [PermissionGuard],
        data: { 
          title: 'Marketing & Promotions',
          breadcrumb: 'Marketing',
          permission: 'marketing.view'
        },
        children: [
          {
            path: '',
            redirectTo: 'overview',
            pathMatch: 'full'
          },
          {
            path: 'overview',
            loadComponent: () => import('./pages/marketing/marketing.component').then(m => m.MarketingComponent),
            data: { 
              title: 'Vue d\'ensemble Marketing',
              breadcrumb: 'Vue d\'ensemble'
            }
          },
          {
            path: 'coupons',
            loadComponent: () => import('./pages/coupons/admin-coupons-management.component').then(m => m.AdminCouponsManagementComponent),
            data: { 
              title: 'Gestion des Coupons',
              breadcrumb: 'Coupons'
            }
          },
          {
            path: 'promotions',
            loadComponent: () => import('./pages/coupons/admin-coupons-management.component').then(m => m.AdminCouponsManagementComponent),
            data: { 
              title: 'Promotions',
              breadcrumb: 'Promotions'
            }
          },
          {
            path: 'newsletter',
            loadComponent: () => import('./pages/coupons/admin-coupons-management.component').then(m => m.AdminCouponsManagementComponent),
            data: { 
              title: 'Newsletter',
              breadcrumb: 'Newsletter'
            }
          }
        ]
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Paramètres',
          breadcrumb: 'Paramètres',
          permission: 'system.view'
        }
      },
      {
        path: 'coupons',
        loadComponent: () => import('./pages/coupons/admin-coupons-management.component').then(m => m.AdminCouponsManagementComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Gestion des Coupons',
          breadcrumb: 'Coupons',
          permission: 'coupons.view'
        }
      },
      {
        path: 'loyalty',
        loadComponent: () => import('./pages/loyalty/admin-loyalty.component').then(m => m.AdminLoyaltyComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Programme de Fidélité',
          breadcrumb: 'Fidélité',
          permission: 'loyalty.view'
        }
      },
      {
        path: 'email-marketing',
        loadComponent: () => import('./pages/email-marketing/admin-email-marketing.component').then(m => m.AdminEmailMarketingComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Marketing par E-mail',
          breadcrumb: 'Email Marketing',
          permission: 'marketing.email'
        }
      },
      // 🆕 Nouvelles routes admin
      {
        path: 'vendor-requests',
        loadComponent: () => import('./pages/vendor-requests/admin-vendor-requests.component').then(m => m.AdminVendorRequestsComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Demandes Vendeurs',
          breadcrumb: 'Demandes Vendeurs',
          permission: 'vendors.view'
        }
      },
      {
        path: 'vendors',
        loadComponent: () => import('./pages/vendors/admin-vendors.component').then(m => m.AdminVendorsComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Modération Vendeurs',
          breadcrumb: 'Vendeurs',
          permission: 'vendors.manage'
        }
      },
      {
        path: 'categories',
        loadComponent: () => import('./pages/categories/admin-categories.component').then(m => m.AdminCategoriesComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Gestion des Catégories',
          breadcrumb: 'Catégories',
          permission: 'categories.manage'
        }
      },
      {
        path: 'content-moderation',
        loadComponent: () => import('./pages/content-moderation/admin-content-moderation.component').then(m => m.AdminContentModerationComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Modération Contenu',
          breadcrumb: 'Modération',
          permission: 'content.moderate'
        }
      },
      {
        path: 'transactions',
        loadComponent: () => import('./pages/transactions/admin-transactions.component').then(m => m.AdminTransactionsComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Gestion des Transactions',
          breadcrumb: 'Transactions',
          permission: 'transactions.view'
        }
      },
      {
        path: 'payment-settings',
        loadComponent: () => import('./pages/payment-settings/admin-payment-settings.component').then(m => m.AdminPaymentSettingsComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Configuration Paiements',
          breadcrumb: 'Paiements',
          permission: 'system.manage'
        }
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/reports/admin-reports.component').then(m => m.AdminReportsComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Rapports & Exports',
          breadcrumb: 'Rapports',
          permission: 'reports.view'
        }
      },
      {
        path: 'editorial',
        loadComponent: () => import('./pages/editorial/admin-editorial.component').then(m => m.AdminEditorialComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Contenu Éditorial',
          breadcrumb: 'Éditorial',
          permission: 'content.manage'
        }
      },
      {
        path: 'test',
        loadComponent: () => import('./pages/test-functionality/test-functionality.component').then(m => m.TestFunctionalityComponent),
        data: { 
          title: 'Test des Fonctionnalités',
          breadcrumb: 'Test'
        }
      },
      // Page d'accès non autorisé
      {
        path: 'unauthorized',
        component: UnauthorizedComponent,
        data: { 
          title: 'Accès Non Autorisé',
          breadcrumb: 'Erreur'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }

// Export des routes pour loadChildren
export const adminRoutes: Routes = routes;