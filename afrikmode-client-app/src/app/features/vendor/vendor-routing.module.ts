import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VendorComponent } from './vendor.component';
import { VendorGuard } from '../../core/guards/vendor.guard';
import { VendorAuthGuard, SubscriptionGuard } from './core/guards';

const routes: Routes = [
  {
    path: '',
    component: VendorComponent,
    canActivate: [VendorGuard, VendorAuthGuard], // 🔐 Protection double : role + vendor status
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/vendor-dashboard.component').then(m => m.VendorDashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/products/vendor-products.component').then(m => m.VendorProductsComponent)
      },
      {
        path: 'products/add',
        loadComponent: () => import('./pages/products/vendor-products.component').then(m => m.VendorProductsComponent)
      },
      {
        path: 'products/stock',
        loadComponent: () => import('./pages/products/vendor-products.component').then(m => m.VendorProductsComponent)
      },
      {
        path: 'products/categories',
        loadComponent: () => import('./pages/products/categories/vendor-categories.component').then(m => m.VendorCategoriesComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/orders/vendor-orders.component').then(m => m.VendorOrdersComponent)
      },
      {
        path: 'finances',
        loadComponent: () => import('./pages/finances/vendor-finances.component').then(m => m.VendorFinancesComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./pages/analytics/vendor-analytics.component').then(m => m.VendorAnalyticsComponent)
        // Temporairement sans SubscriptionGuard pour les tests
      },
      {
        path: 'marketing',
        loadComponent: () => import('./pages/marketing/vendor-marketing.component').then(m => m.VendorMarketingComponent)
        // Temporairement sans SubscriptionGuard pour les tests
      },
      {
        path: 'marketing/coupons',
        loadComponent: () => import('./pages/marketing/vendor-marketing.component').then(m => m.VendorMarketingComponent),
        canActivate: [SubscriptionGuard],
        data: { requiredFeature: 'marketing_tools' }
      },
      {
        path: 'marketing/promotions',
        loadComponent: () => import('./pages/marketing/vendor-marketing.component').then(m => m.VendorMarketingComponent),
        canActivate: [SubscriptionGuard],
        data: { requiredFeature: 'marketing_tools' }
      },
      {
        path: 'marketing/ads',
        loadComponent: () => import('./pages/marketing/vendor-marketing.component').then(m => m.VendorMarketingComponent),
        canActivate: [SubscriptionGuard],
        data: { requiredFeature: 'marketing_tools' }
      },
      {
        path: 'messages',
        loadComponent: () => import('./pages/messages/vendor-messages.component').then(m => m.VendorMessagesComponent)
      },
      {
        path: 'reviews',
        loadComponent: () => import('./pages/reviews/vendor-reviews.component').then(m => m.VendorReviewsComponent)
      },
      {
        path: 'inventory',
        loadComponent: () => import('./pages/inventory/vendor-inventory.component').then(m => m.VendorInventoryComponent)
      },
      {
        path: 'shipping',
        loadComponent: () => import('./pages/shipping/vendor-shipping.component').then(m => m.VendorShippingComponent)
      },
      {
        path: 'loyalty',
        loadComponent: () => import('./pages/loyalty/vendor-loyalty.component').then(m => m.VendorLoyaltyComponent)
        // canActivate: [SubscriptionGuard], // 💎 Fonctionnalité premium - Temporairement désactivé
        // data: { requiredFeature: 'loyalty_program' }
      },
      {
        path: 'email-marketing',
        loadComponent: () => import('./pages/email-marketing/vendor-email-marketing.component').then(m => m.VendorEmailMarketingComponent)
        // canActivate: [SubscriptionGuard], // 💎 Fonctionnalité premium - Temporairement désactivé
        // data: { requiredFeature: 'email_marketing' }
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/vendor-settings.component').then(m => m.VendorSettingsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/vendor-profile.component').then(m => m.VendorProfileComponent)
      },
      {
        path: 'store',
        loadComponent: () => import('./pages/store/vendor-store.component').then(m => m.VendorStoreComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VendorRoutingModule { }
