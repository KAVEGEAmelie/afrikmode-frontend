// src/app/features/admin/admin-routing.module.ts
// Routes configuration for admin section
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
      // 👥 USERS SECTION
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
        path: 'users/clients',
        loadComponent: () => import('./pages/clients/clients.component').then(m => m.ClientsComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Gestion des Clients',
          breadcrumb: 'Clients',
          permission: 'users.view'
        }
      },
      {
        path: 'users/vendors',
        loadComponent: () => import('./pages/vendors/admin-vendors.component').then(m => m.AdminVendorsComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Gestion des Vendeurs',
          breadcrumb: 'Vendeurs',
          permission: 'vendors.manage'
        }
      },
      {
        path: 'users/admins',
        loadComponent: () => import('./pages/admins/admins.component').then(m => m.AdminsComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Gestion des Administrateurs',
          breadcrumb: 'Administrateurs',
          permission: 'admins.manage'
        }
      },
      // 📦 PRODUCTS SECTION
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
        path: 'products/all',
        loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Tous les Produits',
          breadcrumb: 'Tous',
          permission: 'products.view'
        }
      },
      {
        path: 'products/moderation',
        loadComponent: () => import('./pages/products/products-moderation.component').then(m => m.ProductsModerationComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Modération Produits',
          breadcrumb: 'Modération',
          permission: 'products.moderate'
        }
      },
      {
        path: 'products/out-of-stock',
        loadComponent: () => import('./pages/products/products-out-of-stock.component').then(m => m.ProductsOutOfStockComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Produits en Rupture',
          breadcrumb: 'Rupture de Stock',
          permission: 'products.view'
        }
      },
      // 🏪 STORES SECTION
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
        path: 'stores/all',
        loadComponent: () => import('./pages/stores/admin-stores-management.component').then(m => m.AdminStoresManagementComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Toutes les Boutiques',
          breadcrumb: 'Toutes',
          permission: 'stores.view'
        }
      },
      {
        path: 'stores/pending',
        loadComponent: () => import('./pages/stores/stores-pending.component').then(m => m.StoresPendingComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Boutiques en Attente',
          breadcrumb: 'En Attente',
          permission: 'stores.moderate'
        }
      },
      {
        path: 'stores/verified',
        loadComponent: () => import('./pages/stores/stores-verified.component').then(m => m.StoresVerifiedComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Boutiques Vérifiées',
          breadcrumb: 'Vérifiées',
          permission: 'stores.view'
        }
      },
      {
        path: 'stores/suspended',
        loadComponent: () => import('./pages/stores/stores-suspended.component').then(m => m.StoresSuspendedComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Boutiques Suspendues',
          breadcrumb: 'Suspendues',
          permission: 'stores.moderate'
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
        path: 'orders/all',
        loadComponent: () => import('./pages/orders/admin-orders-management.component').then(m => m.AdminOrdersManagementComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Toutes les Commandes',
          breadcrumb: 'Toutes',
          permission: 'orders.view'
        }
      },
      {
        path: 'orders/pending',
        loadComponent: () => import('./pages/orders/orders-pending.component.js').then(m => m.OrdersPendingComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Commandes en Attente',
          breadcrumb: 'En Attente',
          permission: 'orders.view'
        }
      },
      {
        path: 'orders/processing',
        loadComponent: () => import('./pages/orders/orders-processing.component.js').then(m => m.OrdersProcessingComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Commandes en Traitement',
          breadcrumb: 'En Traitement',
          permission: 'orders.view'
        }
      },
      {
        path: 'orders/shipped',
        loadComponent: () => import('./pages/orders/orders-shipped.component.js').then(m => m.OrdersShippedComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Commandes Expédiées',
          breadcrumb: 'Expédiées',
          permission: 'orders.view'
        }
      },
      {
        path: 'orders/delivered',
        loadComponent: () => import('./pages/orders/orders-delivered.component.js').then(m => m.OrdersDeliveredComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Commandes Livrées',
          breadcrumb: 'Livrées',
          permission: 'orders.view'
        }
      },
      {
        path: 'payments/all',
        loadComponent: () => import('./pages/payments/admin-payments-management.component.js').then(m => m.AdminPaymentsManagementComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Tous les Paiements',
          breadcrumb: 'Tous',
          permission: 'payments.view'
        }
      },
      {
        path: 'payments/pending',
        loadComponent: () => import('./pages/payments/payments-pending.component.js').then(m => m.PaymentsPendingComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Paiements en Attente',
          breadcrumb: 'En Attente',
          permission: 'payments.view'
        }
      },
      {
        path: 'payments/completed',
        loadComponent: () => import('./pages/payments/payments-completed.component.js').then(m => m.PaymentsCompletedComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Paiements Complétés',
          breadcrumb: 'Complétés',
          permission: 'payments.view'
        }
      },
      {
        path: 'payments/failed',
        loadComponent: () => import('./pages/payments/payments-failed.component.js').then(m => m.PaymentsFailedComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Paiements Échoués',
          breadcrumb: 'Échoués',
          permission: 'payments.view'
        }
      },
      {
        path: 'finances',
        loadComponent: () => import('./pages/finances/admin-finances-overview.component.js').then(m => m.AdminFinancesOverviewComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Vue d\'ensemble Finances',
          breadcrumb: 'Finances',
          permission: 'finances.view'
        }
      },
      {
        path: 'finances/revenues',
        loadComponent: () => import('./pages/finances/finances-revenues.component.js').then(m => m.FinancesRevenuesComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Revenus',
          breadcrumb: 'Revenus',
          permission: 'finances.view'
        }
      },
      {
        path: 'finances/commissions',
        loadComponent: () => import('./pages/finances/finances-commissions.component.js').then(m => m.FinancesCommissionsComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Commissions',
          breadcrumb: 'Commissions',
          permission: 'finances.view'
        }
      },
      {
        path: 'finances/payouts',
        loadComponent: () => import('./pages/finances/finances-payouts.component.js').then(m => m.FinancesPayoutsComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Versements Vendeurs',
          breadcrumb: 'Versements',
          permission: 'finances.view'
        }
      },
      {
        path: 'finances/invoices',
        loadComponent: () => import('./pages/finances/finances-invoices.component.js').then(m => m.FinancesInvoicesComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Factures',
          breadcrumb: 'Factures',
          permission: 'finances.view'
        }
      },
      // Marketing routes
      {
        path: 'marketing/campaigns',
        loadComponent: () => import('./pages/shared/generic-admin-page.component').then(m => m.GenericAdminPageComponent),
        data: { title: 'Campagnes Marketing', subtitle: 'Gestion des campagnes', icon: 'rocket', message: 'Gérez vos campagnes marketing ici' }
      },
      {
        path: 'marketing/banners',
        loadComponent: () => import('./pages/shared/generic-admin-page.component').then(m => m.GenericAdminPageComponent),
        data: { title: 'Bannières', subtitle: 'Gestion des bannières publicitaires', icon: 'image', message: 'Gérez vos bannières publicitaires ici' }
      },
      {
        path: 'marketing/loyalty',
        loadComponent: () => import('./pages/loyalty/admin-loyalty.component').then(m => m.AdminLoyaltyComponent),
        data: { title: 'Programme Fidélité', breadcrumb: 'Fidélité' }
      },
      // Content routes
      {
        path: 'content/pages',
        loadComponent: () => import('./pages/shared/generic-admin-page.component').then(m => m.GenericAdminPageComponent),
        data: { title: 'Pages', subtitle: 'Gestion des pages statiques', icon: 'description', message: 'Gérez les pages de votre site ici' }
      },
      {
        path: 'content/blog',
        loadComponent: () => import('./pages/shared/generic-admin-page.component').then(m => m.GenericAdminPageComponent),
        data: { title: 'Blog', subtitle: 'Gestion des articles de blog', icon: 'article', message: 'Gérez vos articles de blog ici' }
      },
      {
        path: 'content/faqs',
        loadComponent: () => import('./pages/shared/generic-admin-page.component').then(m => m.GenericAdminPageComponent),
        data: { title: 'FAQ', subtitle: 'Questions fréquemment posées', icon: 'help', message: 'Gérez votre FAQ ici' }
      },
      {
        path: 'content/reviews',
        loadComponent: () => import('./pages/shared/generic-admin-page.component').then(m => m.GenericAdminPageComponent),
        data: { title: 'Avis Clients', subtitle: 'Modération des avis', icon: 'star', message: 'Gérez les avis clients ici' }
      },
      // Analytics routes
      {
        path: 'analytics/traffic',
        loadComponent: () => import('./pages/shared/generic-admin-page.component').then(m => m.GenericAdminPageComponent),
        data: { title: 'Trafic', subtitle: 'Analyse du trafic', icon: 'trending_up', message: 'Analysez le trafic de votre site ici' }
      },
      {
        path: 'analytics/products',
        loadComponent: () => import('./pages/shared/generic-admin-page.component').then(m => m.GenericAdminPageComponent),
        data: { title: 'Analytics Produits', subtitle: 'Performance des produits', icon: 'inventory', message: 'Analysez les performances de vos produits ici' }
      },
      // Reports routes
      {
        path: 'reports/sales',
        loadComponent: () => import('./pages/reports/reports-sales.component').then(m => m.ReportsSalesComponent),
        data: { title: 'Rapport de Ventes', subtitle: 'Rapports détaillés des ventes', icon: 'assessment' }
      },
      {
        path: 'reports/inventory',
        loadComponent: () => import('./pages/reports/reports-inventory.component').then(m => m.ReportsInventoryComponent),
        data: { title: 'Rapport d\'Inventaire', subtitle: 'État des stocks', icon: 'warehouse' }
      },
      {
        path: 'reports/finance',
        loadComponent: () => import('./pages/reports/reports-finance.component').then(m => m.ReportsFinanceComponent),
        data: { title: 'Rapport Financier', subtitle: 'Synthèse financière', icon: 'account_balance' }
      },
      {
        path: 'reports/custom',
        loadComponent: () => import('./pages/reports/reports-custom.component').then(m => m.ReportsCustomComponent),
        data: { title: 'Rapports Personnalisés', subtitle: 'Créez vos rapports', icon: 'tune' }
      },
      // Messages route
      {
        path: 'messages',
        loadComponent: () => import('./pages/shared/generic-admin-page.component').then(m => m.GenericAdminPageComponent),
        data: { title: 'Messages', subtitle: 'Messagerie admin', icon: 'chat', message: 'Gérez vos messages ici' }
      },
      // Support routes
      {
        path: 'support/tickets',
        loadComponent: () => import('./pages/shared/generic-admin-page.component').then(m => m.GenericAdminPageComponent),
        data: { title: 'Tickets Support', subtitle: 'Gestion des tickets', icon: 'confirmation_number', message: 'Gérez les tickets de support ici' }
      },
      {
        path: 'support/chat',
        loadComponent: () => import('./pages/shared/generic-admin-page.component').then(m => m.GenericAdminPageComponent),
        data: { title: 'Chat en Direct', subtitle: 'Support en temps réel', icon: 'chat_bubble', message: 'Chat de support en direct' }
      },
      {
        path: 'support/knowledge',
        loadComponent: () => import('./pages/shared/generic-admin-page.component').then(m => m.GenericAdminPageComponent),
        data: { title: 'Base de Connaissances', subtitle: 'Documentation support', icon: 'menu_book', message: 'Gérez la base de connaissances ici' }
      },
      // Settings routes
      {
        path: 'settings/general',
        loadComponent: () => import('./pages/settings/settings-general.component').then(m => m.SettingsGeneralComponent),
        data: { title: 'Paramètres Généraux', subtitle: 'Configuration générale', icon: 'settings' }
      },
      {
        path: 'settings/security',
        loadComponent: () => import('./pages/settings/settings-security.component').then(m => m.SettingsSecurityComponent),
        data: { title: 'Sécurité', subtitle: 'Configuration sécurité', icon: 'security' }
      },
      {
        path: 'settings/email',
        loadComponent: () => import('./pages/settings/settings-email.component').then(m => m.SettingsEmailComponent),
        data: { title: 'Configuration Email', subtitle: 'Paramètres SMTP', icon: 'email' }
      },
      {
        path: 'settings/payments',
        loadComponent: () => import('./pages/settings/settings-payments.component').then(m => m.SettingsPaymentsComponent),
        data: { title: 'Moyens de Paiement', subtitle: 'Configuration paiements', icon: 'payment' }
      },
      {
        path: 'settings/shipping',
        loadComponent: () => import('./pages/settings/settings-shipping.component').then(m => m.SettingsShippingComponent),
        data: { title: 'Livraison', subtitle: 'Zones et tarifs', icon: 'local_shipping' }
      },
      {
        path: 'settings/taxes',
        loadComponent: () => import('./pages/settings/settings-taxes.component').then(m => m.SettingsTaxesComponent),
        data: { title: 'Taxes & TVA', subtitle: 'Configuration fiscale', icon: 'receipt_long' }
      },
      {
        path: 'settings/integrations',
        loadComponent: () => import('./pages/settings/settings-integrations.component').then(m => m.SettingsIntegrationsComponent),
        data: { title: 'Intégrations', subtitle: 'Services tiers', icon: 'extension' }
      },
      {
        path: 'settings/api',
        loadComponent: () => import('./pages/settings/settings-api.component').then(m => m.SettingsApiComponent),
        data: { title: 'API', subtitle: 'Configuration API', icon: 'api' }
      },
      // Logs route
      {
        path: 'logs',
        loadComponent: () => import('./pages/shared/generic-admin-page.component').then(m => m.GenericAdminPageComponent),
        data: { title: 'Logs & Audit', subtitle: 'Historique système', icon: 'history', message: 'Consultez les logs système ici' }
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
        path: 'appearance',
        canActivate: [PermissionGuard],
        data: { 
          title: 'Apparence',
          breadcrumb: 'Apparence',
          permission: 'appearance.manage'
        },
        children: [
          {
            path: '',
            redirectTo: 'theme',
            pathMatch: 'full'
          },
          {
            path: 'theme',
            loadComponent: () => import('./pages/appearance/theme/theme.component').then(m => m.ThemeComponent),
            data: { 
              title: 'Thème & Couleurs',
              breadcrumb: 'Thème'
            }
          },
          {
            path: 'logo',
            loadComponent: () => import('./pages/appearance/logo/logo.component').then(m => m.LogoComponent),
            data: { 
              title: 'Logo & Favicon',
              breadcrumb: 'Logo'
            }
          },
          {
            path: 'homepage',
            loadComponent: () => import('./pages/appearance/homepage/homepage.component').then(m => m.HomepageComponent),
            data: { 
              title: 'Page d\'Accueil',
              breadcrumb: 'Accueil'
            }
          },
          {
            path: 'menus',
            loadComponent: () => import('./pages/appearance/menus/menus.component').then(m => m.MenusComponent),
            data: { 
              title: 'Menus',
              breadcrumb: 'Menus'
            }
          },
          {
            path: 'widgets',
            loadComponent: () => import('./pages/appearance/widgets/widgets.component').then(m => m.WidgetsComponent),
            data: { 
              title: 'Widgets',
              breadcrumb: 'Widgets'
            }
          }
        ]
      },
      {
        path: 'media',
        loadComponent: () => import('./pages/media/media.component').then(m => m.MediaComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Bibliothèque Media',
          breadcrumb: 'Media',
          permission: 'media.manage'
        }
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/admin-profile.component').then(m => m.AdminProfileComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Mon Profil',
          breadcrumb: 'Profil',
          permission: 'profile.view'
        }
      },
      {
        path: 'notifications',
        loadComponent: () => import('./pages/notifications/admin-notifications.component').then(m => m.AdminNotificationsComponent),
        canActivate: [PermissionGuard],
        data: { 
          title: 'Notifications',
          breadcrumb: 'Notifications',
          permission: 'notifications.view'
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
// Rebuild trigger: 2025-11-02 12:20:37
