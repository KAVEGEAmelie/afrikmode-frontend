// src/app/features/profile/components/profile-overview/profile-overview.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-profile-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, NgFor],
  templateUrl: './profile-overview.component.html',
  styleUrls: ['./profile-overview.component.scss']
})
export class ProfileOverviewComponent implements OnInit {
  
  user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+228 90 12 34 56',
    memberSince: 'Janvier 2023',
    totalOrders: 12,
    totalSpent: 450000,
    currency: 'FCFA'
  };

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

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Load user data
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