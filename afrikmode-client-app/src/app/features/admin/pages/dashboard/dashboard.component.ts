// src/app/features/admin/pages/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Interfaces
interface DashboardStats {
  totalOrders: number;
  ordersChange: number;
  totalRevenue: number;
  revenueChange: number;
  newCustomers: number;
  customersChange: number;
  averageOrderValue: number;
  aovChange: number;
  pendingOrders: number;
  shippingOrders: number;
  deliveredOrders: number;
  activeProducts: number;
  activeShops: number;
  averageRating: number;
}

interface Period {
  value: string;
  label: string;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  createdAt: Date;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

interface Activity {
  id: string;
  type: 'order' | 'product' | 'user' | 'review' | 'payment';
  message: string;
  timestamp: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Propriétés
  isLoading = true;
  hasError = false;
  selectedPeriod = 'month';
  chartType: 'line' | 'bar' = 'line';

  // Données
  stats: DashboardStats = {
    totalOrders: 0,
    ordersChange: 0,
    totalRevenue: 0,
    revenueChange: 0,
    newCustomers: 0,
    customersChange: 0,
    averageOrderValue: 0,
    aovChange: 0,
    pendingOrders: 0,
    shippingOrders: 0,
    deliveredOrders: 0,
    activeProducts: 0,
    activeShops: 0,
    averageRating: 0
  };
  topProducts: TopProduct[] = [];
  recentOrders: RecentOrder[] = [];
  recentActivities: Activity[] = [];
  salesChartData: any = null;

  // Périodes disponibles
  periods: Period[] = [
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'quarter', label: 'Ce trimestre' },
    { value: 'year', label: 'Cette année' }
  ];

  // Subject pour la gestion des subscriptions
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router
    // Injectez ici vos services : DashboardService, etc.
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge toutes les données du dashboard
   */
  async loadDashboardData(): Promise<void> {
    this.isLoading = true;
    this.hasError = false;

    try {
      // Simule un appel API - Remplacez par vos vrais appels
      await Promise.all([
        this.loadStats(),
        this.loadTopProducts(),
        this.loadRecentOrders(),
        this.loadRecentActivities()
      ]);

      this.isLoading = false;
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
      this.hasError = true;
      this.isLoading = false;
    }
  }

  /**
   * Charge les statistiques principales
   */
  private async loadStats(): Promise<void> {
    // TODO: Remplacer par un vrai appel API
    // const stats = await this.dashboardService.getStats(this.selectedPeriod);
    
    // Données mockées pour l'exemple
    return new Promise((resolve) => {
      setTimeout(() => {
        this.stats = {
          totalOrders: 1245,
          ordersChange: 12.5,
          totalRevenue: 15750000,
          revenueChange: 8.3,
          newCustomers: 156,
          customersChange: 15.2,
          averageOrderValue: 12650,
          aovChange: -2.1,
          pendingOrders: 23,
          shippingOrders: 45,
          deliveredOrders: 892,
          activeProducts: 342,
          activeShops: 78,
          averageRating: 4.6
        };
        resolve();
      }, 1000);
    });
  }

  /**
   * Charge les produits les plus vendus
   */
  private async loadTopProducts(): Promise<void> {
    // TODO: Remplacer par un vrai appel API
    return new Promise((resolve) => {
      setTimeout(() => {
        this.topProducts = [
          { id: '1', name: 'Robe Wax Africaine', sales: 145, revenue: 2900000 },
          { id: '2', name: 'Boubou Brodé', sales: 132, revenue: 2640000 },
          { id: '3', name: 'Dashiki Coloré', sales: 98, revenue: 1470000 },
          { id: '4', name: 'Chemise Kente', sales: 87, revenue: 1305000 },
          { id: '5', name: 'Pantalon Bogolan', sales: 76, revenue: 1140000 }
        ];
        resolve();
      }, 800);
    });
  }

  /**
   * Charge les commandes récentes
   */
  private async loadRecentOrders(): Promise<void> {
    // TODO: Remplacer par un vrai appel API
    return new Promise((resolve) => {
      setTimeout(() => {
        this.recentOrders = [
          {
            id: '1',
            orderNumber: 'ORD-2024-001',
            customerName: 'Kouassi Yao',
            createdAt: new Date('2024-10-02T10:30:00'),
            totalAmount: 45000,
            status: 'processing'
          },
          {
            id: '2',
            orderNumber: 'ORD-2024-002',
            customerName: 'Aminata Diallo',
            createdAt: new Date('2024-10-02T09:15:00'),
            totalAmount: 78000,
            status: 'shipped'
          },
          {
            id: '3',
            orderNumber: 'ORD-2024-003',
            customerName: 'Jean-Marc Kouadio',
            createdAt: new Date('2024-10-01T16:45:00'),
            totalAmount: 32000,
            status: 'delivered'
          },
          {
            id: '4',
            orderNumber: 'ORD-2024-004',
            customerName: 'Fatou Bamba',
            createdAt: new Date('2024-10-01T14:20:00'),
            totalAmount: 56000,
            status: 'pending'
          },
          {
            id: '5',
            orderNumber: 'ORD-2024-005',
            customerName: 'Ibrahim Touré',
            createdAt: new Date('2024-10-01T11:00:00'),
            totalAmount: 91000,
            status: 'processing'
          }
        ];
        resolve();
      }, 600);
    });
  }

  /**
   * Charge les activités récentes
   */
  private async loadRecentActivities(): Promise<void> {
    // TODO: Remplacer par un vrai appel API
    return new Promise((resolve) => {
      setTimeout(() => {
        this.recentActivities = [
          {
            id: '1',
            type: 'order',
            message: 'Nouvelle commande #ORD-2024-001 reçue',
            timestamp: new Date('2024-10-02T10:30:00')
          },
          {
            id: '2',
            type: 'product',
            message: 'Le produit "Robe Wax" a été mis à jour',
            timestamp: new Date('2024-10-02T09:45:00')
          },
          {
            id: '3',
            type: 'user',
            message: 'Nouvel utilisateur inscrit: Aminata Diallo',
            timestamp: new Date('2024-10-02T08:20:00')
          },
          {
            id: '4',
            type: 'review',
            message: 'Nouvel avis 5★ sur "Boubou Brodé"',
            timestamp: new Date('2024-10-01T18:15:00')
          },
          {
            id: '5',
            type: 'payment',
            message: 'Paiement confirmé pour la commande #ORD-2024-003',
            timestamp: new Date('2024-10-01T16:50:00')
          }
        ];
        resolve();
      }, 500);
    });
  }

  /**
   * Gère le changement de période
   */
  onPeriodChange(): void {
    console.log('Période changée:', this.selectedPeriod);
    this.loadDashboardData();
  }

  /**
   * Actualise les statistiques
   */
  refreshStats(): void {
    console.log('Actualisation des statistiques...');
    this.loadDashboardData();
  }

  /**
   * Change le type de graphique
   */
  setChartType(type: 'line' | 'bar'): void {
    this.chartType = type;
    console.log('Type de graphique changé:', type);
  }

  /**
   * Affiche les détails d'une commande
   */
  viewOrderDetails(orderId: string): void {
    console.log('Voir détails commande:', orderId);
    this.router.navigate(['/admin/orders', orderId]);
  }

  /**
   * Retourne le libellé du statut de commande
   */
  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      pending: 'En attente',
      processing: 'En cours',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return statusLabels[status] || status;
  }

  /**
   * Retourne l'icône appropriée pour un type d'activité
   */
  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      order: '🛒',
      product: '📦',
      user: '👤',
      review: '⭐',
      payment: '💳'
    };
    return icons[type] || '🔔';
  }

  /**
   * Navigue vers une page spécifique
   */
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}