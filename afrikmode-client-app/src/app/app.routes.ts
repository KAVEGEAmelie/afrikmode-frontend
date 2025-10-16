// src/app/app.routes.ts
// Configuration des routes avec guards
import { Routes } from '@angular/router';
import { authGuard, roleGuard, guestGuard } from './core/guards';

export const routes: Routes = [
  // Routes publiques
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },

  // Route de test API (développement)
  {
    path: 'api-test',
    loadComponent: () => import('./pages/api-test/api-test.component').then(m => m.ApiTestComponent)
  },
  // Route de test panier et favoris
  {
    path: 'test-cart-wishlist',
    loadComponent: () => import('./features/test-cart-wishlist/test-cart-wishlist.component').then(m => m.TestCartWishlistComponent)
  },

  {
    path: 'shop',
    loadComponent: () => import('./features/shop/shop.component').then(m => m.ShopComponent)
  },
  
  // Routes authentification (accessibles uniquement aux invités)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./features/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    canActivate: [guestGuard]
  },
  
  // Routes produits (publiques)
//   {
//     path: 'products',
//     loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent)
//   },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  
  // Routes des catégories (publiques)
  {
    path: 'nouveautes',
    loadComponent: () => import('./features/categories/nouveautes/nouveautes.component').then(m => m.NouveautesComponent)
  },
  {
    path: 'femmes',
    loadComponent: () => import('./features/categories/femmes/femmes.component').then(m => m.FemmesComponent)
  },
  {
    path: 'femmes/:category',
    loadComponent: () => import('./features/categories/femmes/femmes.component').then(m => m.FemmesComponent)
  },
  {
    path: 'hommes',
    loadComponent: () => import('./features/categories/hommes/hommes.component').then(m => m.HommesComponent)
  },
  {
    path: 'hommes/:category',
    loadComponent: () => import('./features/categories/hommes/hommes.component').then(m => m.HommesComponent)
  },
  {
    path: 'enfants',
    loadComponent: () => import('./features/categories/enfants/enfants.component').then(m => m.EnfantsComponent)
  },
  {
    path: 'enfants/:category',
    loadComponent: () => import('./features/categories/enfants/enfants.component').then(m => m.EnfantsComponent)
  },
  {
    path: 'accessoires',
    loadComponent: () => import('./features/categories/accessoires/accessoires.component').then(m => m.AccessoiresComponent)
  },
  {
    path: 'accessoires/:category',
    loadComponent: () => import('./features/categories/accessoires/accessoires.component').then(m => m.AccessoiresComponent)
  },
  {
    path: 'promotions',
    loadComponent: () => import('./features/categories/promotions/promotions.component').then(m => m.PromotionsComponent)
  },
  
  // Routes protégées (nécessitent authentification)
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
    canActivate: [authGuard]
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [authGuard]
  },
  {
    path: 'payment-demo',
    loadComponent: () => import('./features/payment/demo/payment-demo.component').then(m => m.PaymentDemoComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/components/profile-layout/profile-layout.component').then(m => m.ProfileLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/profile/components/profile-overview/profile-overview.component').then(m => m.ProfileOverviewComponent)
      },
      {
        path: 'personal-info',
        loadComponent: () => import('./features/profile/components/personal-info/personal-info.component').then(m => m.PersonalInfoComponent)
      },
      {
        path: 'addresses',
        loadComponent: () => import('./features/profile/components/addresses/addresses.component').then(m => m.AddressesComponent)
      },
      {
        path: 'security',
        loadComponent: () => import('./features/profile/components/security/security.component').then(m => m.SecurityComponent)
      },
      {
        path: 'order-history',
        loadComponent: () => import('./features/profile/components/order-history/order-history.component').then(m => m.OrderHistoryComponent)
      },
      {
        path: 'wishlist',
        loadComponent: () => import('./features/profile/components/wishlist/wishlist.component').then(m => m.WishlistComponent)
      },
      {
        path: 'reviews',
        loadComponent: () => import('./features/profile/components/reviews/reviews.component').then(m => m.ReviewsComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/profile/components/notifications/notifications.component').then(m => m.NotificationsComponent)
      },
      {
        path: 'delete-account',
        loadComponent: () => import('./features/profile/components/delete-account/delete-account.component').then(m => m.DeleteAccountComponent)
      }
    ]
  },
  {
    path: 'orders',
    loadComponent: () => import('./features/orders/components/orders-list/orders-list.component').then(m => m.OrdersListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'orders/:id',
    loadComponent: () => import('./features/orders/components/order-detail/order-detail.component').then(m => m.OrderDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'orders/:id/tracking',
    loadComponent: () => import('./features/orders/components/order-tracking/order-tracking.component').then(m => m.OrderTrackingComponent),
    canActivate: [authGuard]
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./features/profile/components/wishlist/wishlist.component').then(m => m.WishlistComponent),
    canActivate: [authGuard]
  },
  
  // Routes avec contrôle de rôle
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin-routing.module').then(m => m.adminRoutes)
  },
  // Route de test admin sans authentification
  {
    path: 'admin-test',
    loadComponent: () => import('./features/admin/pages/test-admin/test-admin.component').then(m => m.TestAdminComponent)
  },
  // Route directe pour le dashboard admin moderne (sans layout principal)
  // {
  //   path: 'admin-dashboard',
  //   loadComponent: () => import('./features/admin/pages/admin-dashboard-wrapper/admin-dashboard-wrapper.component').then(m => m.AdminDashboardWrapperComponent)
  // },
  
  // Page non autorisé
//   {
//     path: 'unauthorized',
//     loadComponent: () => import('./features/error/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
//   },
  
  // Pages du Footer - Entreprise
  {
    path: 'about',
    loadComponent: () => import('./pages/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'careers',
    loadComponent: () => import('./pages/careers.component').then(m => m.CareersComponent)
  },
  {
    path: 'blog',
    loadComponent: () => import('./pages/blog.component').then(m => m.BlogComponent)
  },
  
  // Pages du Footer - Aide
  {
    path: 'support',
    loadComponent: () => import('./pages/support.component').then(m => m.SupportComponent)
  },
  {
    path: 'order-tracking',
    loadComponent: () => import('./pages/tracking.component').then(m => m.TrackingComponent)
  },
  {
    path: 'returns',
    loadComponent: () => import('./pages/returns.component').then(m => m.ReturnsComponent)
  },
  {
    path: 'faq',
    loadComponent: () => import('./pages/faq.component').then(m => m.FaqComponent)
  },
  
  // Pages du Footer - Légal
  {
    path: 'terms',
    loadComponent: () => import('./pages/terms.component').then(m => m.TermsComponent)
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/privacy.component').then(m => m.PrivacyComponent)
  },
  {
    path: 'legal',
    loadComponent: () => import('./pages/legal.component').then(m => m.LegalComponent)
  },
  {
    path: 'cookies',
    loadComponent: () => import('./pages/cookies.component').then(m => m.CookiesComponent)
  },
  
  // Redirect et 404
  {
    path: '**',
    redirectTo: ''
  }
];