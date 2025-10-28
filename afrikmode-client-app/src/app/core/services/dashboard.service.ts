import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { VendorService } from './vendor.service';
import { WebsocketService } from './websocket.service';

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  activeCustomers: number;
  averageRating: number;
  revenueGrowth: number;
  ordersGrowth: number;
  productsGrowth: number;
}

export interface RecentActivity {
  id: string;
  type: 'order' | 'payment' | 'review' | 'message' | 'product';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

export interface TopProduct {
  id: string;
  name: string;
  image: string;
  sales: number;
  revenue: number;
  change: number;
  rating: number;
}

export interface RevenueData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }[];
}

export interface OrdersData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private statsSubject = new BehaviorSubject<DashboardStats | null>(null);
  public stats$ = this.statsSubject.asObservable();
  
  private activitiesSubject = new BehaviorSubject<RecentActivity[]>([]);
  public activities$ = this.activitiesSubject.asObservable();
  
  private topProductsSubject = new BehaviorSubject<TopProduct[]>([]);
  public topProducts$ = this.topProductsSubject.asObservable();
  
  private revenueDataSubject = new BehaviorSubject<RevenueData | null>(null);
  public revenueData$ = this.revenueDataSubject.asObservable();
  
  private ordersDataSubject = new BehaviorSubject<OrdersData | null>(null);
  public ordersData$ = this.ordersDataSubject.asObservable();

  constructor(
    private vendorService: VendorService,
    private websocketService: WebsocketService
  ) {
    this.initializeWebSocketListeners();
  }

  private initializeWebSocketListeners(): void {
    // Écouter les mises à jour en temps réel
    this.websocketService.on('dashboard_update').subscribe((data: any) => {
      this.updateDashboardData(data);
    });

    this.websocketService.on('new_order').subscribe((data: any) => {
      this.addActivity({
        id: `order_${data.orderId}_${Date.now()}`,
        type: 'order',
        title: 'Nouvelle commande',
        description: `Commande #${data.orderNumber} - ${data.total} FCFA`,
        timestamp: new Date().toISOString(),
        icon: 'shopping_cart',
        color: '#4caf50'
      });
    });

    this.websocketService.on('payment_received').subscribe((data: any) => {
      this.addActivity({
        id: `payment_${data.paymentId}_${Date.now()}`,
        type: 'payment',
        title: 'Paiement reçu',
        description: `Paiement de ${data.amount} FCFA confirmé`,
        timestamp: new Date().toISOString(),
        icon: 'payment',
        color: '#2196f3'
      });
    });

    this.websocketService.on('new_review').subscribe((data: any) => {
      this.addActivity({
        id: `review_${data.reviewId}_${Date.now()}`,
        type: 'review',
        title: 'Nouvel avis client',
        description: `Avis ${data.rating} étoiles pour "${data.productName}"`,
        timestamp: new Date().toISOString(),
        icon: 'star',
        color: '#ff9800'
      });
    });
  }

  private updateDashboardData(data: any): void {
    if (data.stats) {
      this.statsSubject.next(data.stats);
    }
    if (data.activities) {
      this.activitiesSubject.next(data.activities);
    }
    if (data.topProducts) {
      this.topProductsSubject.next(data.topProducts);
    }
    if (data.revenueData) {
      this.revenueDataSubject.next(data.revenueData);
    }
    if (data.ordersData) {
      this.ordersDataSubject.next(data.ordersData);
    }
  }

  private addActivity(activity: RecentActivity): void {
    const currentActivities = this.activitiesSubject.value;
    const updatedActivities = [activity, ...currentActivities].slice(0, 10); // Garder seulement les 10 dernières
    this.activitiesSubject.next(updatedActivities);
  }

  // Méthodes publiques
  getDashboardData(): Observable<any> {
    return this.vendorService.getDashboard();
  }

  getStats(): Observable<DashboardStats | null> {
    return this.stats$;
  }

  getActivities(): Observable<RecentActivity[]> {
    return this.activities$;
  }

  getTopProducts(): Observable<TopProduct[]> {
    return this.topProducts$;
  }

  getRevenueData(): Observable<RevenueData | null> {
    return this.revenueData$;
  }

  getOrdersData(): Observable<OrdersData | null> {
    return this.ordersData$;
  }

  // Méthodes pour charger les données
  loadDashboardData(): void {
    this.vendorService.getDashboard().subscribe({
      next: (data) => {
        if (data && data.stats) {
          this.statsSubject.next(data.stats);
        }
        if (data.recentActivities) {
          this.activitiesSubject.next(data.recentActivities);
        }
        if (data.topProducts) {
          this.topProductsSubject.next(data.topProducts);
        }
        if (data.revenueChart) {
          this.revenueDataSubject.next(data.revenueChart);
        }
        if (data.ordersChart) {
          this.ordersDataSubject.next(data.ordersChart);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données du dashboard:', error);
      }
    });
  }

  // Méthodes pour les rapports
  getSalesReport(params?: any): Observable<any> {
    return this.vendorService.getSalesReport(params);
  }

  getProductsReport(params?: any): Observable<any> {
    return this.vendorService.getProductsReport(params);
  }

  // Méthodes pour les données en temps réel
  refreshDashboard(): void {
    this.loadDashboardData();
  }

  // Méthodes utilitaires
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatNumber(number: number): string {
    return new Intl.NumberFormat('fr-FR').format(number);
  }

  formatPercentage(value: number): string {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  }

  getChangeColor(change: number): string {
    if (change > 0) return '#4caf50';
    if (change < 0) return '#f44336';
    return '#9e9e9e';
  }

  getChangeIcon(change: number): string {
    if (change > 0) return 'trending_up';
    if (change < 0) return 'trending_down';
    return 'trending_flat';
  }

  // Méthodes pour les filtres
  filterByDateRange(startDate: string, endDate: string): void {
    this.vendorService.getDashboard().subscribe({
      next: (data) => {
        this.updateDashboardData(data);
      },
      error: (error) => {
        console.error('Erreur lors du filtrage par date:', error);
      }
    });
  }

  filterByPeriod(period: 'day' | 'week' | 'month' | 'year'): void {
    this.vendorService.getDashboard().subscribe({
      next: (data) => {
        this.updateDashboardData(data);
      },
      error: (error) => {
        console.error('Erreur lors du filtrage par période:', error);
      }
    });
  }
}

