// src/app/features/admin/pages/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AdminService } from '../../../../core/services/admin.service';

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
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(
    private router: Router,
    private http: HttpClient,
    private adminService: AdminService
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
   * Charge les statistiques principales depuis l'API
   */
  private async loadStats(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.adminService.getDashboardStats()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success && response.data) {
              const data = response.data;
              
              // Calculer le panier moyen
              const avgOrderValue = data.totalOrders > 0 ? data.totalRevenue / data.totalOrders : 0;
              
              // Charger les graphiques pour calculer les trends
              this.http.get(`${this.apiUrl}/dashboard/charts?period=${this.selectedPeriod}`)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  next: (chartsResponse: any) => {
                    let ordersChange = 0;
                    let revenueChange = 0;
                    let customersChange = 0;
                    let aovChange = 0;
                    
                    if (chartsResponse.success && chartsResponse.data) {
                      const chartsData = chartsResponse.data;
                      
                      // Calculer les trends depuis les données mensuelles
                      if (chartsData.ordersByMonth && chartsData.ordersByMonth.length >= 2) {
                        const current = parseInt(chartsData.ordersByMonth[chartsData.ordersByMonth.length - 1]?.count || 0);
                        const previous = parseInt(chartsData.ordersByMonth[chartsData.ordersByMonth.length - 2]?.count || 0);
                        if (previous > 0) {
                          ordersChange = ((current - previous) / previous) * 100;
                        }
                      }
                      
                      if (chartsData.revenueByMonth && chartsData.revenueByMonth.length >= 2) {
                        const current = parseFloat(chartsData.revenueByMonth[chartsData.revenueByMonth.length - 1]?.revenue || 0);
                        const previous = parseFloat(chartsData.revenueByMonth[chartsData.revenueByMonth.length - 2]?.revenue || 0);
                        if (previous > 0) {
                          revenueChange = ((current - previous) / previous) * 100;
                        }
                      }
                    }
                    
                    // Charger les stats des commandes par statut
                    this.http.get(`${this.apiUrl}/orders?limit=1`)
                      .pipe(takeUntil(this.destroy$))
                      .subscribe({
                        next: (ordersResponse: any) => {
                          let pendingOrders = 0;
                          let shippingOrders = 0;
                          let deliveredOrders = 0;
                          
                          if (ordersResponse.success && ordersResponse.data) {
                            // Compter les commandes par statut
                            ordersResponse.data.forEach((order: any) => {
                              if (order.status === 'pending') pendingOrders++;
                              else if (order.status === 'shipped' || order.status === 'processing') shippingOrders++;
                              else if (order.status === 'delivered' || order.status === 'completed') deliveredOrders++;
                            });
                          }
                          
                          // Charger les stats des utilisateurs pour calculer les nouveaux clients
                          this.http.get(`${this.apiUrl}/users/stats`)
                            .pipe(takeUntil(this.destroy$))
                            .subscribe({
                              next: (usersResponse: any) => {
                                let newCustomers = 0;
                                let customersChange = 0;
                                
                                if (usersResponse.success && usersResponse.data) {
                                  newCustomers = usersResponse.data.customers || 0;
                                  // TODO: Calculer le changement depuis l'historique
                                }
                                
                                this.stats = {
                                  totalOrders: data.totalOrders || 0,
                                  ordersChange: ordersChange,
                                  totalRevenue: data.totalRevenue || 0,
                                  revenueChange: revenueChange,
                                  newCustomers: newCustomers,
                                  customersChange: customersChange,
                                  averageOrderValue: avgOrderValue,
                                  aovChange: aovChange,
                                  pendingOrders: pendingOrders,
                                  shippingOrders: shippingOrders,
                                  deliveredOrders: deliveredOrders,
                                  activeProducts: data.totalProducts || 0,
                                  activeShops: data.totalStores || 0,
                                  averageRating: 0 // À charger depuis l'API si disponible
                                };
                                resolve();
                              },
                              error: (error) => {
                                console.error('Erreur lors du chargement des stats utilisateurs:', error);
                                this.stats = {
                                  totalOrders: data.totalOrders || 0,
                                  ordersChange: ordersChange,
                                  totalRevenue: data.totalRevenue || 0,
                                  revenueChange: revenueChange,
                                  newCustomers: 0,
                                  customersChange: 0,
                                  averageOrderValue: avgOrderValue,
                                  aovChange: 0,
                                  pendingOrders: pendingOrders,
                                  shippingOrders: shippingOrders,
                                  deliveredOrders: deliveredOrders,
                                  activeProducts: data.totalProducts || 0,
                                  activeShops: data.totalStores || 0,
                                  averageRating: 0
                                };
                                resolve();
                              }
                            });
                        },
                        error: (error) => {
                          console.error('Erreur lors du chargement des commandes:', error);
                          this.stats = {
                            totalOrders: data.totalOrders || 0,
                            ordersChange: ordersChange,
                            totalRevenue: data.totalRevenue || 0,
                            revenueChange: revenueChange,
                            newCustomers: 0,
                            customersChange: 0,
                            averageOrderValue: avgOrderValue,
                            aovChange: 0,
                            pendingOrders: 0,
                            shippingOrders: 0,
                            deliveredOrders: 0,
                            activeProducts: data.totalProducts || 0,
                            activeShops: data.totalStores || 0,
                            averageRating: 0
                          };
                          resolve();
                        }
                      });
                  },
                  error: (error) => {
                    console.error('Erreur lors du chargement des graphiques:', error);
        this.stats = {
                      totalOrders: data.totalOrders || 0,
                      ordersChange: 0,
                      totalRevenue: data.totalRevenue || 0,
                      revenueChange: 0,
                      newCustomers: 0,
                      customersChange: 0,
                      averageOrderValue: avgOrderValue,
                      aovChange: 0,
                      pendingOrders: 0,
                      shippingOrders: 0,
                      deliveredOrders: 0,
                      activeProducts: data.totalProducts || 0,
                      activeShops: data.totalStores || 0,
                      averageRating: 0
        };
        resolve();
                  }
                });
            } else {
              reject(new Error('Données invalides'));
            }
          },
          error: (error) => {
            console.error('Erreur lors du chargement des statistiques:', error);
            reject(error);
          }
        });
    });
  }

  /**
   * Charge les produits les plus vendus depuis l'API
   */
  private async loadTopProducts(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.apiUrl}/dashboard/charts`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (response.success && response.data && response.data.topProducts) {
              this.topProducts = response.data.topProducts.slice(0, 5).map((item: any, index: number) => ({
                id: item.id || String(index + 1),
                name: item.name || 'Produit sans nom',
                sales: parseInt(item.total_sold || 0),
                revenue: parseFloat(item.total_revenue || 0)
              }));
            } else {
              this.topProducts = [];
            }
        resolve();
          },
          error: (error) => {
            console.error('Erreur lors du chargement des top produits:', error);
            this.topProducts = [];
            resolve(); // Ne pas rejeter pour ne pas bloquer le chargement
          }
        });
    });
  }

  /**
   * Charge les commandes récentes depuis l'API
   */
  private async loadRecentOrders(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.apiUrl}/dashboard/recent-activity?limit=5`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (response.success && response.data && response.data.recentOrders) {
              this.recentOrders = response.data.recentOrders.map((order: any) => ({
                id: order.id || '',
                orderNumber: order.order_number || order.id || '',
                customerName: order.customer_name || order.customer_email || 'Client',
                createdAt: new Date(order.created_at),
                totalAmount: parseFloat(order.total_amount || 0),
                status: this.mapOrderStatus(order.status)
              }));
            } else {
              this.recentOrders = [];
            }
            resolve();
          },
          error: (error) => {
            console.error('Erreur lors du chargement des commandes récentes:', error);
            this.recentOrders = [];
            resolve(); // Ne pas rejeter pour ne pas bloquer le chargement
          }
        });
    });
  }
  
  private mapOrderStatus(status: string): 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' {
    const statusMap: { [key: string]: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' } = {
      'pending': 'pending',
      'processing': 'processing',
      'confirmed': 'processing',
      'shipped': 'shipped',
      'delivered': 'delivered',
      'completed': 'delivered',
      'cancelled': 'cancelled',
      'refunded': 'cancelled'
    };
    return statusMap[status] || 'pending';
  }

  /**
   * Charge les activités récentes depuis l'API
   */
  private async loadRecentActivities(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.apiUrl}/dashboard/recent-activity?limit=10`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (response.success && response.data) {
              const activities: Activity[] = [];
              
              // Commandes récentes
              if (response.data.recentOrders && Array.isArray(response.data.recentOrders)) {
                response.data.recentOrders.forEach((order: any) => {
                  activities.push({
                    id: order.id || '',
            type: 'order',
                    message: `Nouvelle commande #${order.order_number || order.id} reçue`,
                    timestamp: new Date(order.created_at)
                  });
                });
              }
              
              // Nouveaux utilisateurs
              if (response.data.recentUsers && Array.isArray(response.data.recentUsers)) {
                response.data.recentUsers.forEach((user: any) => {
                  const userName = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Utilisateur';
                  activities.push({
                    id: user.id || '',
            type: 'user',
                    message: `Nouvel utilisateur inscrit: ${userName}`,
                    timestamp: new Date(user.created_at)
                  });
                });
              }
              
              // Nouvelles boutiques
              if (response.data.recentStores && Array.isArray(response.data.recentStores)) {
                response.data.recentStores.forEach((store: any) => {
                  activities.push({
                    id: store.id || '',
                    type: 'product', // Utiliser 'product' comme type générique pour les boutiques
                    message: `Nouvelle boutique créée: ${store.store_name || store.name || 'Sans nom'}`,
                    timestamp: new Date(store.created_at)
                  });
                });
              }
              
              // Trier par date (plus récent en premier) et prendre les 5 plus récentes
              activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
              this.recentActivities = activities.slice(0, 5);
            } else {
              this.recentActivities = [];
            }
            resolve();
          },
          error: (error) => {
            console.error('Erreur lors du chargement des activités récentes:', error);
            this.recentActivities = [];
            resolve(); // Ne pas rejeter pour ne pas bloquer le chargement
          }
        });
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