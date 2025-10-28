import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { VendorService, VendorDashboard } from '../../../../core/services/vendor.service';
import { Subscription } from 'rxjs';

interface KPICard {
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  icon: string;
  color: string;
  description: string;
}

interface RecentOrder {
  id: string;
  customer: string;
  amount: number;
  status: string;
  date: string;
  statusColor: string;
}

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTableModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    MatTabsModule,
    MatSelectModule,
    MatOptionModule
  ],
  template: `
    <div class="vendor-dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="header-content">
          <h1>Tableau de Bord Vendeur</h1>
          <p class="subtitle">Vue d'ensemble de votre boutique AfrikMode</p>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        @for (kpi of kpiCards; track kpi.title) {
          <mat-card class="kpi-card" [style.border-left-color]="kpi.color">
            <mat-card-content>
              <div class="kpi-header">
                <div class="kpi-icon" [style.background-color]="kpi.color + '20'">
                  <mat-icon [style.color]="kpi.color">{{ kpi.icon }}</mat-icon>
                </div>
                <div class="kpi-info">
                  <h3>{{ kpi.title }}</h3>
                  <p class="kpi-description">{{ kpi.description }}</p>
                </div>
              </div>
              
              <div class="kpi-value">
                <span class="value">{{ kpi.value }}</span>
                <span class="change" [ngClass]="'change-' + kpi.changeType">
                  <mat-icon>
                    @if (kpi.changeType === 'increase') {
                      trending_up
                    } @else if (kpi.changeType === 'decrease') {
                      trending_down
                    } @else {
                      trending_flat
                    }
                  </mat-icon>
                  {{ Math.abs(kpi.change) }}%
                </span>
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>

      <!-- Revenue Charts -->
      <div class="charts-grid-large">
        <!-- Revenue Timeline -->
        <mat-card class="chart-card chart-large">
          <mat-card-header>
            <div class="chart-header">
              <div>
                <mat-card-title>Évolution des Revenus</mat-card-title>
                <mat-card-subtitle>Historique des 30 derniers jours</mat-card-subtitle>
              </div>
              <mat-select [(value)]="revenuePeriod" class="period-select">
                <mat-option value="7">7 jours</mat-option>
                <mat-option value="30">30 jours</mat-option>
                <mat-option value="90">3 mois</mat-option>
              </mat-select>
            </div>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-container">
              <div class="chart-visualization">
                <div class="chart-bars">
                  @for (data of revenueData; track data.day; let i = $index) {
                    <div class="chart-bar-container" [style.height.%]="getBarHeight(data.amount)">
                      <div class="chart-bar" 
                           [style.height.%]="getBarHeight(data.amount)"
                           [style.background]="data.amount >= 50000 ? 'linear-gradient(to top, #4caf50, #8bc34a)' : 'linear-gradient(to top, #2196f3, #64b5f6)'">
                        <mat-icon class="bar-icon">trending_up</mat-icon>
                      </div>
                      <span class="bar-label">{{ data.amount / 1000 }}k</span>
                      <span class="bar-day">{{ data.day }}</span>
                    </div>
                  }
                </div>
              </div>
              <div class="chart-stats">
                <div class="stat-item">
                  <mat-icon>arrow_upward</mat-icon>
                  <span class="stat-label">Maximum</span>
                  <span class="stat-value">{{ getMaxRevenue() | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
                </div>
                <div class="stat-item">
                  <mat-icon>arrow_downward</mat-icon>
                  <span class="stat-label">Minimum</span>
                  <span class="stat-value">{{ getMinRevenue() | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
                </div>
                <div class="stat-item">
                  <mat-icon>calculate</mat-icon>
                  <span class="stat-label">Moyenne</span>
                  <span class="stat-value">{{ getAvgRevenue() | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Orders by Category -->
        <mat-card class="chart-card chart-large">
          <mat-card-header>
            <div>
              <mat-card-title>Ventes par Catégorie</mat-card-title>
              <mat-card-subtitle>Répartition des ventes ce mois</mat-card-subtitle>
            </div>
          </mat-card-header>
          <mat-card-content>
            <div class="category-stats">
              @for (cat of categoryData; track cat.name) {
                <div class="category-item">
                  <div class="category-header">
                    <mat-icon class="category-icon" [style.color]="cat.color">{{ cat.icon }}</mat-icon>
                    <div class="category-info">
                      <span class="category-name">{{ cat.name }}</span>
                      <span class="category-percent">{{ cat.percentage }}%</span>
                    </div>
                    <div class="category-value">{{ cat.amount | currency:'FCFA':'symbol':'1.0-0':'fr' }}</div>
                  </div>
                  <mat-progress-bar mode="determinate" [value]="cat.percentage" [style.--mdc-linear-progress-active-indicator-color]="cat.color"></mat-progress-bar>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Orders Status Chart -->
      <div class="orders-status-section">
        <mat-card class="chart-card">
          <mat-card-header>
            <div>
              <mat-card-title>Statut des Commandes</mat-card-title>
              <mat-card-subtitle>Ce mois</mat-card-subtitle>
            </div>
          </mat-card-header>
          <mat-card-content>
            <div class="orders-status-chart">
              @for (status of ordersStatusData; track status.name) {
                <div class="status-item" [style.background]="status.color + '15'">
                  <div class="status-icon" [style.background-color]="status.color">
                    <mat-icon>{{ status.icon }}</mat-icon>
                  </div>
                  <div class="status-info">
                    <div class="status-name">{{ status.name }}</div>
                    <div class="status-value">{{ status.count }}</div>
                  </div>
                  <mat-progress-bar mode="determinate" [value]="getStatusPercentage(status.count)" 
                                   [style.--mdc-linear-progress-active-indicator-color]="status.color"></mat-progress-bar>
                  <div class="status-percentage">{{ getStatusPercentage(status.count) }}%</div>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Top Customers -->
        <mat-card class="chart-card customers-card">
          <mat-card-header>
            <div>
              <mat-card-title>Top Clients</mat-card-title>
              <mat-card-subtitle>Meilleurs clients ce mois</mat-card-subtitle>
            </div>
          </mat-card-header>
          <mat-card-content>
            <div class="customers-list">
              @for (customer of topCustomers; track customer.name; let i = $index) {
                <div class="customer-item">
                  <div class="customer-rank">{{ i + 1 }}</div>
                  <div class="customer-avatar">
                    <mat-icon>person</mat-icon>
                  </div>
                  <div class="customer-info">
                    <div class="customer-name">{{ customer.name }}</div>
                    <div class="customer-stats">
                      <span>{{ customer.orders }} commandes</span>
                      <span>{{ customer.total | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
                    </div>
                  </div>
                  @if (customer.vip) {
                    <mat-icon class="vip-icon" style="color: #ffd700;">star</mat-icon>
                  }
                </div>
                @if (!$last) {
                  <mat-divider></mat-divider>
                }
              }
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Recent Orders and Top Products -->
      <div class="data-grid">
        <!-- Recent Orders -->
        <mat-card class="data-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>shopping_cart</mat-icon>
              Commandes Récentes
            </mat-card-title>
            <mat-card-subtitle>Dernières commandes reçues</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="orders-list">
              @for (order of recentOrders; track order.id) {
                <div class="order-item">
                  <div class="order-info">
                    <div class="order-id">#{{ order.id }}</div>
                    <div class="order-customer">
                      <mat-icon>person</mat-icon>
                      {{ order.customer }}
                    </div>
                    <div class="order-date">
                      <mat-icon>schedule</mat-icon>
                      {{ order.date }}
                    </div>
                  </div>
                  <div class="order-details">
                    <div class="order-amount">{{ order.amount.toLocaleString('fr-FR') }} FCFA</div>
                    <mat-chip [style.background-color]="order.statusColor" [style.color]="'white'">
                      {{ order.status }}
                    </mat-chip>
                  </div>
                </div>
                @if (!$last) {
                  <mat-divider></mat-divider>
                }
              }
            </div>
            <div class="card-actions">
              <button mat-button color="primary" (click)="viewOrders()">
                Voir toutes les commandes
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Top Products -->
        <mat-card class="data-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>trending_up</mat-icon>
              Top Produits
            </mat-card-title>
            <mat-card-subtitle>Meilleurs vendeurs ce mois</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="products-list">
              @for (product of topProducts; track product.name; let i = $index) {
                <div class="product-item">
                  <div class="product-rank" [class.gold]="i === 0" [class.silver]="i === 1" [class.bronze]="i === 2">
                    {{ i + 1 }}
                  </div>
                  <div class="product-image">
                    <img [src]="product.image" [alt]="product.name" onerror="this.src='assets/images/placeholder-product.jpg'">
                  </div>
                  <div class="product-info">
                    <div class="product-name">{{ product.name }}</div>
                    <div class="product-stats">
                      <span>
                        <mat-icon>shopping_bag</mat-icon>
                        {{ product.sales }} ventes
                      </span>
                      <span>
                        <mat-icon>attach_money</mat-icon>
                        {{ product.revenue.toLocaleString('fr-FR') }} FCFA
                      </span>
                    </div>
                  </div>
                  <div class="product-change" [ngClass]="product.change > 0 ? 'positive' : 'negative'">
                    <mat-icon>{{ product.change > 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
                    {{ Math.abs(product.change) }}%
                  </div>
                </div>
                @if (!$last) {
                  <mat-divider></mat-divider>
                }
              }
            </div>
            <div class="card-actions">
              <button mat-button color="primary" (click)="viewAllProducts()">
                Voir tous les produits
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Performance Metrics -->
      <div class="performance-section">
        <mat-card class="performance-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>speed</mat-icon>
              Métriques de Performance
            </mat-card-title>
            <mat-card-subtitle>Indicateurs clés de votre boutique</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="metrics-grid">
              <div class="metric-card">
                <mat-icon class="metric-icon">shopping_bag</mat-icon>
                <div class="metric-content">
                  <div class="metric-label">Taux de Conversion</div>
                  <div class="metric-value">12.5%</div>
                  <div class="metric-change positive">
                    <mat-icon>arrow_upward</mat-icon>
                    +2.3%
                  </div>
                </div>
              </div>
              <div class="metric-card">
                <mat-icon class="metric-icon">attach_money</mat-icon>
                <div class="metric-content">
                  <div class="metric-label">Panier Moyen</div>
                  <div class="metric-value">45,500 FCFA</div>
                  <div class="metric-change positive">
                    <mat-icon>arrow_upward</mat-icon>
                    +5.2%
                  </div>
                </div>
              </div>
              <div class="metric-card">
                <mat-icon class="metric-icon">local_shipping</mat-icon>
                <div class="metric-content">
                  <div class="metric-label">Taux de Livraison</div>
                  <div class="metric-value">98.2%</div>
                  <div class="metric-change positive">
                    <mat-icon>arrow_upward</mat-icon>
                    +1.1%
                  </div>
                </div>
              </div>
              <div class="metric-card">
                <mat-icon class="metric-icon">star</mat-icon>
                <div class="metric-content">
                  <div class="metric-label">Note Moyenne</div>
                  <div class="metric-value">4.7/5</div>
                  <div class="metric-change positive">
                    <mat-icon>arrow_upward</mat-icon>
                    +0.3
                  </div>
                </div>
              </div>
              <div class="metric-card">
                <mat-icon class="metric-icon">replay</mat-icon>
                <div class="metric-content">
                  <div class="metric-label">Taux de Retour</div>
                  <div class="metric-value">2.1%</div>
                  <div class="metric-change negative">
                    <mat-icon>arrow_downward</mat-icon>
                    -0.5%
                  </div>
                </div>
              </div>
              <div class="metric-card">
                <mat-icon class="metric-icon">schedule</mat-icon>
                <div class="metric-content">
                  <div class="metric-label">Temps de Réponse</div>
                  <div class="metric-value">2.3h</div>
                  <div class="metric-change positive">
                    <mat-icon>arrow_downward</mat-icon>
                    -0.8h
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Quick Actions -->
      <mat-card class="quick-actions-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>flash_on</mat-icon>
            Actions Rapides
          </mat-card-title>
          <mat-card-subtitle>Gérez votre boutique efficacement</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="quick-actions-grid">
            <button mat-raised-button class="action-btn" (click)="addProduct()">
              <mat-icon>add_circle</mat-icon>
              <span>Ajouter Produit</span>
            </button>
            <button mat-raised-button class="action-btn" (click)="viewOrders()">
              <mat-icon>shopping_cart</mat-icon>
              <span>Voir Commandes</span>
            </button>
            <button mat-raised-button class="action-btn" (click)="manageStock()">
              <mat-icon>inventory</mat-icon>
              <span>Gérer Stock</span>
            </button>
            <button mat-raised-button class="action-btn" (click)="createPromotion()">
              <mat-icon>local_offer</mat-icon>
              <span>Créer Promotion</span>
            </button>
            <button mat-raised-button class="action-btn" (click)="viewAnalytics()">
              <mat-icon>analytics</mat-icon>
              <span>Voir Analytics</span>
            </button>
            <button mat-raised-button class="action-btn" (click)="contactSupport()">
              <mat-icon>support_agent</mat-icon>
              <span>Support</span>
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./vendor-dashboard.component.scss']
})
export class VendorDashboardComponent implements OnInit, OnDestroy {
  Math = Math;
  private subscriptions: Subscription[] = [];
  
  dashboardData: VendorDashboard | null = null;
  kpiCards: KPICard[] = [];
  recentOrders: RecentOrder[] = [];
  topProducts: any[] = [];
  revenuePeriod: string = '30';
  isLoading = false;

  // Données pour les graphiques
  revenueData = [
    { day: 'Lun', amount: 45000 },
    { day: 'Mar', amount: 52000 },
    { day: 'Mer', amount: 48000 },
    { day: 'Jeu', amount: 60000 },
    { day: 'Ven', amount: 55000 },
    { day: 'Sam', amount: 72000 },
    { day: 'Dim', amount: 68000 }
  ];

  categoryData = [
    { name: 'Mode Africaine', icon: 'checkroom', color: '#4caf50', amount: 350000, percentage: 45 },
    { name: 'Accessoires', icon: 'watch', color: '#2196f3', amount: 180000, percentage: 23 },
    { name: 'Chaussures', icon: 'hiking', color: '#ff9800', amount: 150000, percentage: 19 },
    { name: 'Bijoux', icon: 'diamond', color: '#9c27b0', amount: 100000, percentage: 13 }
  ];

  ordersStatusData = [
    { name: 'En attente', icon: 'schedule', count: 15, color: '#ff9800' },
    { name: 'Confirmées', icon: 'check_circle', count: 42, color: '#2196f3' },
    { name: 'En préparation', icon: 'inventory', count: 18, color: '#9c27b0' },
    { name: 'Expédiées', icon: 'local_shipping', count: 28, color: '#00bcd4' },
    { name: 'Livrées', icon: 'done_all', count: 95, color: '#4caf50' },
    { name: 'Annulées', icon: 'cancel', count: 3, color: '#f44336' }
  ];

  topCustomers = [
    { name: 'Marie Kouassi', orders: 12, total: 450000, vip: true },
    { name: 'Jean Dupont', orders: 8, total: 320000, vip: false },
    { name: 'Fatou Diallo', orders: 10, total: 380000, vip: true },
    { name: 'Koffi Mensah', orders: 7, total: 280000, vip: false },
    { name: 'Aminata Sy', orders: 9, total: 340000, vip: false }
  ];

  constructor(
    private vendorService: VendorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeDashboard();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeDashboard(): void {
    this.isLoading = true;
    
    // Charger les données du dashboard vendor depuis l'API
    const dashboardSub = this.vendorService.getDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.topProducts = data.topProducts || [];
        this.updateKPICards(data);
        this.updateRecentOrders(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du dashboard:', error);
        this.isLoading = false;
        // Charger des données de démonstration
        this.loadDemoData();
      }
    });

    this.subscriptions.push(dashboardSub);
  }

  private loadDemoData(): void {
    // Données de démonstration si l'API échoue
    this.topProducts = [
      { name: 'Robe Ankara Premium', sales: 45, revenue: 125000, change: 12, image: '/assets/products/robe.jpg' },
      { name: 'Chemise Wax', sales: 38, revenue: 95000, change: 8, image: '/assets/products/chemise.jpg' },
      { name: 'Ensemble Kente', sales: 32, revenue: 150000, change: 15, image: '/assets/products/ensemble.jpg' }
    ];
  }

  private updateKPICards(data: VendorDashboard): void {
    const stats = data.stats;
    this.kpiCards = [
      {
        title: 'Revenus du Mois',
        value: this.formatCurrency(stats.totalSales || 0),
        change: stats.revenueGrowth || 0,
        changeType: (stats.revenueGrowth || 0) > 0 ? 'increase' : (stats.revenueGrowth || 0) < 0 ? 'decrease' : 'stable',
        icon: 'account_balance_wallet',
        color: '#4caf50',
        description: 'Montant reçu après commission'
      },
      {
        title: 'Commandes',
        value: (stats.totalOrders || 0).toString(),
        change: stats.ordersGrowth || 0,
        changeType: (stats.ordersGrowth || 0) > 0 ? 'increase' : (stats.ordersGrowth || 0) < 0 ? 'decrease' : 'stable',
        icon: 'shopping_cart',
        color: '#2196f3',
        description: 'Commandes traitées ce mois'
      },
      {
        title: 'Produits Actifs',
        value: (stats.totalProducts || 0).toString(),
        change: stats.productsGrowth || 0,
        changeType: (stats.productsGrowth || 0) > 0 ? 'increase' : (stats.productsGrowth || 0) < 0 ? 'decrease' : 'stable',
        icon: 'inventory',
        color: '#ff9800',
        description: 'Produits en catalogue'
      },
      {
        title: 'Clients Actifs',
        value: (stats.activeCustomers || 0).toString(),
        change: 0,
        changeType: 'stable',
        icon: 'people',
        color: '#f44336',
        description: 'Clients actifs ce mois'
      },
      {
        title: 'Note Moyenne',
        value: `${(stats.averageRating || 0).toFixed(1)}/5`,
        change: 0,
        changeType: 'stable',
        icon: 'star',
        color: '#ffc107',
        description: 'Satisfaction clients'
      },
      {
        title: 'Commandes en Attente',
        value: (stats.pendingOrders || 0).toString(),
        change: 0,
        changeType: 'stable',
        icon: 'schedule',
        color: '#9c27b0',
        description: 'Commandes à traiter'
      }
    ];
  }

  private updateRecentOrders(data: VendorDashboard): void {
    this.recentOrders = (data.recentActivities || [])
      .filter(activity => activity.type === 'order')
      .slice(0, 5)
      .map(activity => ({
        id: activity.id || '',
        customer: activity.description || 'Client inconnu',
        amount: activity.amount || 0,
        status: activity.status || 'pending',
        date: activity.date || new Date().toISOString(),
        statusColor: this.getStatusColor(activity.status || 'pending')
      }));
  }

  private getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'pending': '#ff9800',
      'confirmed': '#2196f3',
      'preparing': '#9c27b0',
      'shipped': '#00bcd4',
      'delivered': '#4caf50',
      'cancelled': '#f44336',
      'refunded': '#795548'
    };
    return colors[status] || '#9e9e9e';
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  }

  // Méthodes pour les graphiques
  getBarHeight(amount: number): number {
    const maxAmount = Math.max(...this.revenueData.map(d => d.amount));
    return (amount / maxAmount) * 100;
  }

  getMaxRevenue(): number {
    return Math.max(...this.revenueData.map(d => d.amount));
  }

  getMinRevenue(): number {
    return Math.min(...this.revenueData.map(d => d.amount));
  }

  getAvgRevenue(): number {
    const sum = this.revenueData.reduce((acc, d) => acc + d.amount, 0);
    return Math.round(sum / this.revenueData.length);
  }

  getStatusPercentage(count: number): number {
    const total = this.ordersStatusData.reduce((sum, status) => sum + status.count, 0);
    return Math.round((count / total) * 100);
  }

  // Méthodes d'action
  addProduct(): void {
    this.router.navigate(['/vendor/products/add']);
  }

  viewOrders(): void {
    this.router.navigate(['/vendor/orders']);
  }

  viewAllProducts(): void {
    this.router.navigate(['/vendor/products']);
  }

  manageStock(): void {
    this.router.navigate(['/vendor/inventory']);
  }

  createPromotion(): void {
    this.router.navigate(['/vendor/marketing']);
  }

  viewAnalytics(): void {
    this.router.navigate(['/vendor/analytics']);
  }

  contactSupport(): void {
    window.open('https://support.afrikmode.com', '_blank');
  }
}
