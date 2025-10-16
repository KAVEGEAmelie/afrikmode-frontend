// src/app/features/admin/admin-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '../../core/guards/permission.guard';
import { AdminAuthGuard } from './core/guards/admin-auth.guard';

// Layout
import { AdminComponent } from './admin.component';

// Pages
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { AdminLoginComponent } from './pages/login/admin-login.component';

const routes: Routes = [
  // Route de connexion
  {
    path: 'login',
    component: AdminLoginComponent,
    data: { 
      title: 'Connexion Admin',
      breadcrumb: 'Connexion'
    }
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
  // Route normale avec authentification (temporairement désactivée pour test)
  {
    path: '',
    component: AdminComponent,
    // canActivate: [AdminAuthGuard],
    data: { roles: ['admin', 'super_admin', 'manager'] },
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
        loadComponent: () => import('./pages/analytics/admin-analytics.component').then(m => m.AdminAnalyticsComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Analytics & Rapports',
          breadcrumb: 'Analytics',
          permission: 'analytics.view'
        }
      },
      {
        path: 'marketing',
        loadComponent: () => import('./pages/marketing/marketing.component').then(m => m.MarketingComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Marketing & Promotions',
          breadcrumb: 'Marketing',
          permission: 'marketing.view'
        }
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