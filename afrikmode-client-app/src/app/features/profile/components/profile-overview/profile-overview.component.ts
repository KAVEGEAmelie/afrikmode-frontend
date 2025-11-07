// src/app/features/profile/components/profile-overview/profile-overview.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { OrderService } from '../../../../core/services/order.service';
import { WishlistService } from '../../../../core/services/wishlist.service';

@Component({
  selector: 'app-profile-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-overview.component.html',
  styleUrls: ['./profile-overview.component.scss']
})
export class ProfileOverviewComponent implements OnInit {
  
  user: any = null;
  loading = true;
  errorMessage = '';

  recentOrders: any[] = [];
  wishlistCount = 0;
  notificationsCount = 0;

  quickLinks = [
    {
      title: 'Mes Commandes',
      description: 'Voir toutes mes commandes',
      icon: 'fa-shopping-bag',
      path: '/profile/order-history',
      color: '#e74c3c',
      badge: 0
    },
    {
      title: 'Mes Adresses',
      description: 'Gérer mes adresses de livraison',
      icon: 'fa-map-marker-alt',
      path: '/profile/addresses',
      color: '#3498db'
    },
    {
      title: 'Liste de Souhaits',
      description: 'Articles dans ma liste',
      icon: 'fa-heart',
      path: '/profile/wishlist',
      color: '#e91e63',
      badge: 0
    },
    {
      title: 'Mes Avis',
      description: 'Voir mes avis et notes',
      icon: 'fa-star',
      path: '/profile/reviews',
      color: '#ffc107'
    }
  ];

  constructor(
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private orderService: OrderService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadRecentOrders();
    this.loadWishlistCount();
    this.loadNotificationsCount();
  }

  loadRecentOrders(): void {
    this.orderService.getOrders({ page: 1, limit: 3 }).subscribe({
      next: (response: any) => {
        const ordersData = Array.isArray(response) ? response : response.data || [];
        this.recentOrders = ordersData.slice(0, 3).map((order: any) => ({
          id: order.id,
          order_number: order.order_number,
          date: new Date(order.created_at).toLocaleDateString('fr-FR'),
          total: order.total,
          status: order.status,
          items_count: order.items?.length || 0
        }));
        
        // Mettre à jour le badge dans quickLinks
        const ordersLink = this.quickLinks.find(link => link.path === '/profile/order-history');
        if (ordersLink) {
          ordersLink.badge = ordersData.length;
        }
      },
      error: (error) => {
        console.error('Erreur chargement commandes récentes:', error);
      }
    });
  }

  loadWishlistCount(): void {
    this.wishlistService.getWishlist().subscribe({
      next: (response: any) => {
        const items = response.data || [];
        this.wishlistCount = items.length;
        
        // Mettre à jour le badge et la description
        const wishlistLink = this.quickLinks.find(link => link.path === '/profile/wishlist');
        if (wishlistLink) {
          wishlistLink.badge = this.wishlistCount;
          wishlistLink.description = `${this.wishlistCount} article${this.wishlistCount > 1 ? 's' : ''} dans ma liste`;
        }
      },
      error: (error) => {
        console.error('Erreur chargement wishlist:', error);
      }
    });
  }

  loadNotificationsCount(): void {
    // Charger les notifications depuis l'API via UserService
    this.userService.getNotifications({ unread_only: true }).subscribe({
      next: (response: any) => {
        const notifications: any[] = response.data || response || [];
        // Mettre à jour le count avec les notifications non lues
        this.notificationsCount = notifications.filter((n: any) => !n.read || n.read === false).length;
      },
      error: (error: any) => {
        console.error('Erreur chargement notifications:', error);
      }
    });
  }

  loadUserData(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.userService.getProfile().subscribe({
      next: (response) => {
        console.log('🔍 Données utilisateur reçues:', JSON.stringify(response, null, 2));
        
        // L'API retourne les données dans response.data
        const user = response.data || response;
        
        this.user = {
          name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur',
          email: user.email || '',
          phone: user.phone || '',
          memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { 
            year: 'numeric', 
            month: 'long' 
          }) : 'Date inconnue',
          totalOrders: user.stats?.totalOrders || 0,
          totalSpent: user.stats?.totalSpent || 0,
          currency: user.preferences?.currency || 'FCFA'
        };
        console.log('✅ Utilisateur formaté:', JSON.stringify(this.user, null, 2));
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement du profil:', error);
        this.loading = false;
        this.errorMessage = 'Impossible de charger les données du profil';
        
        // Si erreur d'authentification, rediriger vers la connexion
        if (error.status === 401 || error.status === 403) {
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        }
      }
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  viewAllOrders(): void {
    this.router.navigate(['/profile/order-history']);
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'pending': 'En attente',
      'processing': 'En préparation',
      'shipped': 'Expédiée',
      'delivered': 'Livrée',
      'cancelled': 'Annulée'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: any = {
      'pending': '#ffc107',
      'processing': '#17a2b8',
      'shipped': '#007bff',
      'delivered': '#28a745',
      'cancelled': '#dc3545'
    };
    return colors[status] || '#6c757d';
  }
}