import { Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { VendorGuard } from '../guards/vendor.guard';
import { AdminGuard } from '../guards/admin.guard';

export const APP_ROUTES: Routes = [
  // Routes publiques
  {
    path: '',
    loadComponent: () => import('../../features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('../../features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('../../features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('../../features/products/products.component').then(m => m.ProductsComponent)
  },
  {
    path: 'product/:id',
    loadComponent: () => import('../../features/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('../../features/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('../../features/checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('../../features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },

  // Routes vendeur
  {
    path: 'vendor',
    loadComponent: () => import('../../features/vendor/vendor.component').then(m => m.VendorComponent),
    canActivate: [AuthGuard, VendorGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('../../features/vendor/pages/dashboard/vendor-dashboard.component').then(m => m.VendorDashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('../../features/vendor/pages/products/vendor-products.component').then(m => m.VendorProductsComponent)
      },
      {
        path: 'products/add',
        loadComponent: () => import('../../features/vendor/pages/products/add-product/add-product.component').then(m => m.AddProductComponent)
      },
      {
        path: 'products/:id/edit',
        loadComponent: () => import('../../features/vendor/pages/products/edit-product/edit-product.component').then(m => m.EditProductComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('../../features/vendor/pages/orders/vendor-orders.component').then(m => m.VendorOrdersComponent)
      },
      {
        path: 'finances',
        loadComponent: () => import('../../features/vendor/pages/finances/vendor-finances.component').then(m => m.VendorFinancesComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('../../features/vendor/pages/analytics/vendor-analytics.component').then(m => m.VendorAnalyticsComponent)
      },
      {
        path: 'messages',
        loadComponent: () => import('../../features/vendor/pages/messages/vendor-messages.component').then(m => m.VendorMessagesComponent)
      },
      {
        path: 'reviews',
        loadComponent: () => import('../../features/vendor/pages/reviews/vendor-reviews.component').then(m => m.VendorReviewsComponent)
      },
      {
        path: 'inventory',
        loadComponent: () => import('../../features/vendor/pages/inventory/vendor-inventory.component').then(m => m.VendorInventoryComponent)
      },
      {
        path: 'shipping',
        loadComponent: () => import('../../features/vendor/pages/shipping/vendor-shipping.component').then(m => m.VendorShippingComponent)
      },
      {
        path: 'loyalty',
        loadComponent: () => import('../../features/vendor/pages/loyalty/vendor-loyalty.component').then(m => m.VendorLoyaltyComponent)
      },
      {
        path: 'email-marketing',
        loadComponent: () => import('../../features/vendor/pages/email-marketing/vendor-email-marketing.component').then(m => m.VendorEmailMarketingComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('../../features/vendor/pages/settings/vendor-settings.component').then(m => m.VendorSettingsComponent)
      }
    ]
  },

  // Routes admin
  {
    path: 'admin',
    loadComponent: () => import('../../features/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [AuthGuard, AdminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('../../features/admin/pages/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'vendors',
        loadComponent: () => import('../../features/admin/pages/vendors/admin-vendors.component').then(m => m.AdminVendorsComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('../../features/admin/pages/orders/admin-orders.component').then(m => m.AdminOrdersComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('../../features/admin/pages/products/admin-products.component').then(m => m.AdminProductsComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('../../features/admin/pages/users/admin-users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('../../features/admin/pages/analytics/admin-analytics.component').then(m => m.AdminAnalyticsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('../../features/admin/pages/settings/admin-settings.component').then(m => m.AdminSettingsComponent)
      }
    ]
  },

  // Route par défaut
  {
    path: '**',
    redirectTo: ''
  }
];


