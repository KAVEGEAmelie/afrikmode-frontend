// src/app/features/profile/components/profile-overview/profile-overview.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';

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

  recentOrders = [
    {
      id: '1',
      order_number: 'ORD-2025-001',
      date: '2025-09-25',
      total: 45000,
      status: 'delivered',
      items_count: 2
    },
    {
      id: '2',
      order_number: 'ORD-2025-002',
      date: '2025-09-20',
      total: 75000,
      status: 'shipped',
      items_count: 3
    },
    {
      id: '3',
      order_number: 'ORD-2025-003',
      date: '2025-09-15',
      total: 35000,
      status: 'delivered',
      items_count: 1
    }
  ];

  quickLinks = [
    {
      title: 'Mes Commandes',
      description: 'Voir toutes mes commandes',
      icon: 'fa-shopping-bag',
      path: '/profile/order-history',
      color: '#e74c3c'
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
      description: '5 articles dans ma liste',
      icon: 'fa-heart',
      path: '/profile/wishlist',
      color: '#e91e63'
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
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
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