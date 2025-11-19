import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

// Import des composants existants
import { KPICardComponent, KPIData } from './components/kpi-card/kpi-card.component';
import { DonutChartComponent, DonutData } from './components/donut-chart/donut-chart.component';
import { BarChartComponent, BarChartData } from './components/bar-chart/bar-chart.component';
import { TopProductsComponent, TopProduct } from './components/top-products/top-products.component';

// Import des services
import { DashboardDataService } from '../../core/services/dashboard-data.service';
import { AdminStateService } from '../../core/services/admin-state.service';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { AdminService } from '../../../../core/services/admin.service';
import { ToastService } from '../../../../core/services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

export interface AdminMenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  badge?: number;
  children?: AdminMenuItem[];
  permission?: string;
  roles?: string[];
}

export interface QuickAction {
  label: string;
  icon: string;
  color: string;
  action: string;
  permission?: string;
}

@Component({
  selector: 'app-admin-dashboard-complete',
  standalone: true,
  imports: [
    CommonModule,
    NgFor,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    MatListModule,
    MatTooltipModule,
    KPICardComponent,
    DonutChartComponent,
    BarChartComponent,
    TopProductsComponent
  ],
  providers: [AdminStateService, AdminAuthService, DashboardDataService],
  template: `
    <div class="admin-dashboard-complete">
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="header-left">
          <div class="brand">
            <div class="brand-icon">
              <mat-icon>admin_panel_settings</mat-icon>
            </div>
            <div class="brand-info">
              <h1>AfrikMode Admin</h1>
              <span class="subtitle">Tableau de bord administrateur</span>
            </div>
          </div>
        </div>
        
        <div class="header-right">
          <div class="quick-actions">
            <button mat-icon-button [matMenuTriggerFor]="actionsMenu" matTooltip="Actions rapides">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #actionsMenu="matMenu">
              <button mat-menu-item *ngFor="let action of quickActions" (click)="executeAction(action.action)">
                <mat-icon [style.color]="action.color">{{ action.icon }}</mat-icon>
                <span>{{ action.label }}</span>
              </button>
            </mat-menu>
          </div>
          
          <span class="last-update">
            <mat-icon>update</mat-icon>
            Dernière mise à jour {{ lastUpdate }}
          </span>
        </div>
      </div>

      <!-- Loading Spinner -->
      @if (loading) {
        <div class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Chargement des données...</p>
        </div>
      }

      <!-- Dashboard Content -->
      @if (!loading) {
        <div class="dashboard-content">
          <!-- KPI Cards Row -->
          <div class="kpi-cards-row">
            <app-kpi-card *ngFor="let kpi of kpiData" [data]="kpi"></app-kpi-card>
          </div>

          <!-- Main Content Grid -->
          <div class="main-content-grid">
            <!-- Left Column -->
            <div class="left-column">
              <!-- Analytics Charts -->
              <div class="charts-section">
                <div class="chart-group">
                  <app-donut-chart
                    title="Utilisateurs par rôle"
                    [data]="usersByRole"
                    [totalValue]="usersByRoleTotal">
                  </app-donut-chart>
                  
                  <app-donut-chart
                    title="Boutiques par statut"
                    [data]="storesByStatus"
                    [totalValue]="storesByStatusTotal">
                  </app-donut-chart>
                </div>

                <div class="chart-group">
                  <app-bar-chart
                    title="Commandes par mois"
                    [data]="ordersByMonth"
                    [maxValue]="ordersByMonthMax">
                  </app-bar-chart>
                  
                  <app-bar-chart
                    title="Revenus par mois"
                    [data]="revenueByMonth"
                    [maxValue]="revenueByMonthMax"
                    [valueFormatter]="formatCurrency">
                  </app-bar-chart>
                </div>
              </div>

              <!-- Recent Activity -->
              <mat-card class="activity-card">
                <mat-card-header>
                  <mat-card-title>Activité récente</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="activity-list">
                    <div *ngFor="let activity of recentActivities" class="activity-item">
                      <div class="activity-icon" [style.background-color]="activity.color">
                        <mat-icon>{{ activity.icon }}</mat-icon>
                      </div>
                      <div class="activity-content">
                        <div class="activity-text">{{ activity.text }}</div>
                        <div class="activity-time">{{ activity.time }}</div>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- Right Column -->
            <div class="right-column">
              <!-- Top Products -->
              <app-top-products
                title="Top 5 des produits"
                [products]="topProducts">
              </app-top-products>

              <!-- Pending Actions -->
              <mat-card class="pending-actions-card">
                <mat-card-header>
                  <mat-card-title>Actions en attente</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="pending-list">
                    <div *ngFor="let action of pendingActions" class="pending-item">
                      <div class="pending-icon" [style.background-color]="action.color">
                        <mat-icon>{{ action.icon }}</mat-icon>
                      </div>
                      <div class="pending-content">
                        <div class="pending-text">{{ action.text }}</div>
                        <div class="pending-count">{{ action.count }} éléments</div>
                      </div>
                      <button mat-icon-button (click)="handlePendingAction(action.type)">
                        <mat-icon>arrow_forward</mat-icon>
                      </button>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

            </div>
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./admin-dashboard-complete.component.scss']
})
export class AdminDashboardCompleteComponent implements OnInit {
  lastUpdate = new Date().toLocaleDateString('fr-FR');
  loading = true;
  dashboardStats: any = null;

  // KPI Data - Sera rempli depuis le backend
  kpiData: KPIData[] = [];

  // Quick Actions
  quickActions: QuickAction[] = [
    { label: 'Nouveau produit', icon: 'add_box', color: '#5B5FED', action: 'add-product' },
    { label: 'Nouvelle boutique', icon: 'store', color: '#7C3AED', action: 'add-store' },
    { label: 'Créer coupon', icon: 'local_offer', color: '#EC4899', action: 'add-coupon' },
    { label: 'Envoyer notification', icon: 'notifications', color: '#06B6D4', action: 'send-notification' },
    { label: 'Générer rapport', icon: 'assessment', color: '#F59E0B', action: 'generate-report' }
  ];

  // Charts Data - Initialisés vides, seront remplis depuis l'API
  usersByRole: DonutData[] = [];
  storesByStatus: DonutData[] = [];
  ordersByMonth: BarChartData[] = [];
  revenueByMonth: BarChartData[] = [];
  topProducts: TopProduct[] = [];
  recentActivities: any[] = [];
  
  // Totaux pour les graphiques donut
  usersByRoleTotal: string = '0';
  storesByStatusTotal: string = '0';
  
  // Max values pour les bar charts
  ordersByMonthMax: number = 100;
  revenueByMonthMax: number = 100000;

  // Pending Actions - Sera rempli depuis le backend
  pendingActions: any[] = [];

  // System Status - Supprimé car pas d'API pour ça
  // systemStatus sera supprimé ou rendu optionnel

  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(
    private dashboardDataService: DashboardDataService,
    private adminState: AdminStateService,
    private adminAuth: AdminAuthService,
    private adminService: AdminService,
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;
    
    // Charger les statistiques du dashboard depuis le backend
    this.adminService.getDashboardStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.dashboardStats = response.data;
          this.updateKPIData(response.data);
          this.loadAdditionalData();
        } else {
          this.toastService.error('Erreur lors du chargement des statistiques');
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données:', error);
        this.toastService.error('Erreur lors du chargement du dashboard');
        this.loading = false;
      }
    });
  }

  private updateKPIData(stats: any): void {
    // Les trends seront calculés après avoir chargé les données historiques
    // Pour l'instant, on initialise sans trends
    this.kpiData = [
      {
        title: 'Utilisateurs totaux',
        value: this.formatNumber(stats.totalUsers || 0),
        icon: 'people',
        color: '#5B5FED',
        trend: { value: 0, percentage: 0, direction: 'stable' }
      },
      {
        title: 'Boutiques actives',
        value: this.formatNumber(stats.totalStores || 0),
        icon: 'store',
        color: '#7C3AED',
        trend: { value: 0, percentage: 0, direction: 'stable' }
      },
      {
        title: 'Produits en vente',
        value: this.formatNumber(stats.totalProducts || 0),
        icon: 'inventory',
        color: '#EC4899',
        trend: { value: 0, percentage: 0, direction: 'stable' }
      },
      {
        title: 'Commandes du mois',
        value: this.formatNumber(stats.totalOrders || 0),
        icon: 'shopping_cart',
        color: '#06B6D4',
        trend: { value: 0, percentage: 0, direction: 'stable' }
      },
      {
        title: 'Revenus totaux',
        value: this.formatCurrency(stats.totalRevenue || 0),
        icon: 'account_balance_wallet',
        color: '#F59E0B',
        trend: { value: 0, percentage: 0, direction: 'stable' }
      },
      {
        title: 'Boutiques en attente',
        value: this.formatNumber(stats.pendingStores || 0),
        icon: 'store',
        color: '#10B981',
        trend: { value: 0, percentage: 0, direction: 'stable' }
      }
    ];

    // Charger les actions en attente depuis l'API
    this.loadPendingActions(stats.pendingStores || 0);
  }

  private loadAdditionalData(): void {
    // Charger les graphiques depuis l'API
    this.http.get(`${this.apiUrl}/dashboard/charts`).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          const chartsData = response.data;
          
          // Utilisateurs par rôle
          if (chartsData.usersByRole && Array.isArray(chartsData.usersByRole)) {
            this.usersByRole = chartsData.usersByRole.map((item: any) => ({
              label: this.getRoleLabel(item.role || 'unknown'),
              value: parseInt(item.count || 0),
              color: this.getRoleColor(item.role || 'unknown')
            }));
            // Calculer le total depuis les données réelles
            const totalUsers = this.usersByRole.reduce((sum, item) => sum + item.value, 0);
            this.usersByRoleTotal = this.formatNumber(totalUsers);
          } else {
            this.usersByRole = [];
            this.usersByRoleTotal = '0';
          }
          
          // Boutiques par statut
          if (chartsData.storesByStatus && Array.isArray(chartsData.storesByStatus)) {
            this.storesByStatus = chartsData.storesByStatus.map((item: any) => ({
              label: this.getStoreStatusLabel(item.status || 'unknown'),
              value: parseInt(item.count || 0),
              color: this.getStoreStatusColor(item.status || 'unknown')
            }));
            // Calculer le total depuis les données réelles
            const totalStores = this.storesByStatus.reduce((sum, item) => sum + item.value, 0);
            this.storesByStatusTotal = this.formatNumber(totalStores);
          } else {
            this.storesByStatus = [];
            this.storesByStatusTotal = '0';
          }
          
          // Commandes par mois
          if (chartsData.ordersByMonth && Array.isArray(chartsData.ordersByMonth)) {
            const colors = ['#5B5FED', '#7C3AED', '#EC4899', '#06B6D4', '#F59E0B', '#10B981', '#EF4444'];
            this.ordersByMonth = chartsData.ordersByMonth.map((item: any, index: number) => ({
              label: this.formatMonth(item.month || ''),
              value: parseInt(item.count || 0),
              color: colors[index % colors.length]
            }));
            // Calculer le maxValue dynamiquement depuis les données (avec un peu de marge)
            const maxOrders = Math.max(...this.ordersByMonth.map(item => item.value), 1);
            this.ordersByMonthMax = Math.ceil(maxOrders * 1.1); // 10% de marge
          } else {
            this.ordersByMonth = [];
            this.ordersByMonthMax = 100;
          }
          
          // Revenus par mois
          if (chartsData.revenueByMonth && Array.isArray(chartsData.revenueByMonth)) {
            const colors = ['#5B5FED', '#7C3AED', '#EC4899', '#06B6D4', '#F59E0B', '#10B981', '#EF4444'];
            this.revenueByMonth = chartsData.revenueByMonth.map((item: any, index: number) => ({
              label: this.formatMonth(item.month || ''),
              value: parseFloat(item.revenue || 0),
              color: colors[index % colors.length]
            }));
            // Calculer le maxValue dynamiquement depuis les données (avec un peu de marge)
            const maxRevenue = Math.max(...this.revenueByMonth.map(item => item.value), 1);
            this.revenueByMonthMax = Math.ceil(maxRevenue * 1.1); // 10% de marge
            
            // Calculer les trends pour les KPIs basés sur les revenus
            this.calculateTrendsFromHistory(chartsData.ordersByMonth, chartsData.revenueByMonth);
          } else {
            this.revenueByMonth = [];
            this.revenueByMonthMax = 100000;
          }
          
          // Top produits
          if (chartsData.topProducts && Array.isArray(chartsData.topProducts)) {
            this.topProducts = chartsData.topProducts.slice(0, 5).map((item: any, index: number) => ({
              name: item.name || 'Produit sans nom',
              value: this.formatCurrency(parseFloat(item.total_revenue || 0)),
              trend: index < 2 ? 'up' : index === 2 ? 'stable' : 'down'
            }));
          } else {
            this.topProducts = [];
          }
        } else {
          // Pas de données disponibles
          console.warn('Aucune donnée de graphiques disponible');
          this.usersByRole = [];
          this.storesByStatus = [];
          this.ordersByMonth = [];
          this.revenueByMonth = [];
          this.topProducts = [];
        }
        
        // Charger les activités récentes
        this.loadRecentActivity();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des graphiques:', error);
        this.toastService.error('Erreur lors du chargement des graphiques');
        // Initialiser avec des tableaux vides en cas d'erreur
        this.usersByRole = [];
        this.storesByStatus = [];
        this.ordersByMonth = [];
        this.revenueByMonth = [];
        this.topProducts = [];
        this.loading = false;
      }
    });
  }

  private loadPendingActions(pendingStoresCount: number): void {
    // Charger les produits en attente de modération
    this.http.get(`${this.apiUrl}/products/pending?limit=1`).subscribe({
      next: (response: any) => {
        const pendingProductsCount = response.success && response.pagination ? response.pagination.total : 0;
        
        // Charger les tickets ouverts
        this.http.get(`${environment.apiUrl}/tickets?status=open&limit=1`).subscribe({
          next: (ticketsResponse: any) => {
            const openTicketsCount = ticketsResponse.success && ticketsResponse.pagination ? ticketsResponse.pagination.total : 0;
            
            // Charger les paiements en attente (depuis les finances)
            this.http.get(`${this.apiUrl}/finances/pending-payouts?limit=1`).subscribe({
              next: (paymentsResponse: any) => {
                const pendingPaymentsCount = paymentsResponse.success && paymentsResponse.pagination ? paymentsResponse.pagination.total : 0;
                
                // Mettre à jour les actions en attente avec les vraies données
                this.pendingActions = [
                  { 
                    icon: 'store', 
                    text: 'Boutiques en attente', 
                    count: pendingStoresCount, 
                    type: 'stores', 
                    color: '#7C3AED' 
                  },
                  { 
                    icon: 'inventory', 
                    text: 'Produits à modérer', 
                    count: pendingProductsCount, 
                    type: 'products', 
                    color: '#EC4899' 
                  },
                  { 
                    icon: 'support_agent', 
                    text: 'Tickets ouverts', 
                    count: openTicketsCount, 
                    type: 'tickets', 
                    color: '#06B6D4' 
                  },
                  { 
                    icon: 'payment', 
                    text: 'Paiements en attente', 
                    count: pendingPaymentsCount, 
                    type: 'payments', 
                    color: '#F59E0B' 
                  }
                ];
              },
              error: (error) => {
                console.error('Erreur lors du chargement des paiements en attente:', error);
                // Continuer avec 0 si l'endpoint n'existe pas encore
                this.pendingActions = [
                  { icon: 'store', text: 'Boutiques en attente', count: pendingStoresCount, type: 'stores', color: '#7C3AED' },
                  { icon: 'inventory', text: 'Produits à modérer', count: pendingProductsCount, type: 'products', color: '#EC4899' },
                  { icon: 'support_agent', text: 'Tickets ouverts', count: openTicketsCount, type: 'tickets', color: '#06B6D4' },
                  { icon: 'payment', text: 'Paiements en attente', count: 0, type: 'payments', color: '#F59E0B' }
                ];
              }
            });
          },
          error: (error) => {
            console.error('Erreur lors du chargement des tickets:', error);
            // Continuer avec les données disponibles
            this.pendingActions = [
              { icon: 'store', text: 'Boutiques en attente', count: pendingStoresCount, type: 'stores', color: '#7C3AED' },
              { icon: 'inventory', text: 'Produits à modérer', count: pendingProductsCount, type: 'products', color: '#EC4899' },
              { icon: 'support_agent', text: 'Tickets ouverts', count: 0, type: 'tickets', color: '#06B6D4' },
              { icon: 'payment', text: 'Paiements en attente', count: 0, type: 'payments', color: '#F59E0B' }
            ];
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits en attente:', error);
        // Continuer avec les données disponibles
        this.pendingActions = [
          { icon: 'store', text: 'Boutiques en attente', count: pendingStoresCount, type: 'stores', color: '#7C3AED' },
          { icon: 'inventory', text: 'Produits à modérer', count: 0, type: 'products', color: '#EC4899' },
          { icon: 'support_agent', text: 'Tickets ouverts', count: 0, type: 'tickets', color: '#06B6D4' },
          { icon: 'payment', text: 'Paiements en attente', count: 0, type: 'payments', color: '#F59E0B' }
        ];
      }
    });
  }

  private calculateTrendsFromHistory(ordersByMonth: any[], revenueByMonth: any[]): void {
    // Calculer les trends en comparant le mois actuel avec le mois précédent
    if (ordersByMonth && ordersByMonth.length >= 2) {
      const currentMonthOrders = ordersByMonth[ordersByMonth.length - 1]?.count || 0;
      const previousMonthOrders = ordersByMonth[ordersByMonth.length - 2]?.count || 0;
      
      if (previousMonthOrders > 0) {
        const ordersTrend = this.calculateGrowthRate(currentMonthOrders, previousMonthOrders);
        const ordersDirection = this.getGrowthDirection(currentMonthOrders, previousMonthOrders);
        
        // Mettre à jour le KPI des commandes
        const ordersKPI = this.kpiData.find(kpi => kpi.title === 'Commandes du mois');
        if (ordersKPI) {
          ordersKPI.trend = {
            value: Math.abs(ordersTrend),
            percentage: Math.abs(ordersTrend),
            direction: ordersDirection as 'up' | 'down' | 'stable'
          };
        }
      }
    }
    
    if (revenueByMonth && revenueByMonth.length >= 2) {
      const currentMonthRevenue = parseFloat(revenueByMonth[revenueByMonth.length - 1]?.revenue || 0);
      const previousMonthRevenue = parseFloat(revenueByMonth[revenueByMonth.length - 2]?.revenue || 0);
      
      if (previousMonthRevenue > 0) {
        const revenueTrend = this.calculateGrowthRate(currentMonthRevenue, previousMonthRevenue);
        const revenueDirection = this.getGrowthDirection(currentMonthRevenue, previousMonthRevenue);
        
        // Mettre à jour le KPI des revenus
        const revenueKPI = this.kpiData.find(kpi => kpi.title === 'Revenus totaux');
        if (revenueKPI) {
          revenueKPI.trend = {
            value: Math.abs(revenueTrend),
            percentage: Math.abs(revenueTrend),
            direction: revenueDirection as 'up' | 'down' | 'stable'
          };
        }
      }
    }
  }

  private loadRecentActivity(): void {
    this.http.get(`${this.apiUrl}/dashboard/recent-activity?limit=10`).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          const activities: any[] = [];
          
          // Commandes récentes
          if (response.data.recentOrders && Array.isArray(response.data.recentOrders)) {
            response.data.recentOrders.forEach((order: any) => {
              activities.push({
                icon: 'shopping_cart',
                text: `Nouvelle commande #${order.order_number || order.id}`,
                time: this.getTimeAgo(order.created_at),
                color: '#EC4899'
              });
            });
          }
          
          // Nouveaux utilisateurs
          if (response.data.recentUsers && Array.isArray(response.data.recentUsers)) {
            response.data.recentUsers.forEach((user: any) => {
              const userName = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Utilisateur';
              activities.push({
                icon: 'person_add',
                text: `Nouvel utilisateur: ${userName}`,
                time: this.getTimeAgo(user.created_at),
                color: '#5B5FED'
              });
            });
          }
          
          // Nouvelles boutiques
          if (response.data.recentStores && Array.isArray(response.data.recentStores)) {
            response.data.recentStores.forEach((store: any) => {
              activities.push({
                icon: 'store',
                text: `Nouvelle boutique: ${store.store_name || store.name || 'Sans nom'}`,
                time: this.getTimeAgo(store.created_at),
                color: '#7C3AED'
              });
            });
          }
          
          // Trier par date (plus récent en premier) et prendre les 5 plus récentes
          activities.sort((a, b) => {
            // Les activités sont déjà triées par date décroissante depuis le backend
            // On garde l'ordre d'ajout
            return 0;
          });
          this.recentActivities = activities.slice(0, 5);
        } else {
          this.recentActivities = [];
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des activités:', error);
        this.toastService.error('Erreur lors du chargement des activités récentes');
        this.recentActivities = [];
        this.loading = false;
      }
    });
  }

  private getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'customer': 'Clients',
      'vendor': 'Vendeurs',
      'manager': 'Managers',
      'admin': 'Admins',
      'super_admin': 'Super Admins'
    };
    return labels[role] || role;
  }

  private getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      'customer': '#5B5FED',
      'vendor': '#7C3AED',
      'manager': '#EC4899',
      'admin': '#06B6D4',
      'super_admin': '#F59E0B'
    };
    return colors[role] || '#6B7280';
  }

  private getStoreStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Actives',
      'pending': 'En attente',
      'suspended': 'Suspendues',
      'closed': 'Fermées',
      'inactive': 'Inactives'
    };
    return labels[status] || status;
  }

  private getStoreStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'active': '#10B981',
      'pending': '#F59E0B',
      'suspended': '#EF4444',
      'closed': '#6B7280',
      'inactive': '#9CA3AF'
    };
    return colors[status] || '#6B7280';
  }


  private formatMonth(monthStr: string): string {
    const [year, month] = monthStr.split('-');
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return months[parseInt(month) - 1] || monthStr;
  }

  private getRandomColor(): string {
    const colors = ['#5B5FED', '#7C3AED', '#EC4899', '#06B6D4', '#F59E0B', '#10B981'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private getTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    return date.toLocaleDateString('fr-FR');
  }

  executeAction(action: string): void {
    switch (action) {
      case 'add-user':
        this.router.navigate(['/admin/users']);
        break;
      case 'add-store':
        this.router.navigate(['/admin/stores']);
        break;
      case 'add-product':
        this.router.navigate(['/admin/products']);
        break;
      case 'view-orders':
        this.router.navigate(['/admin/orders']);
        break;
      case 'view-analytics':
        this.router.navigate(['/admin/analytics']);
        break;
      case 'support-tickets':
        this.router.navigate(['/admin/support']);
        break;
      default:
        console.log('Action non reconnue:', action);
    }
  }

  handlePendingAction(type: string): void {
    switch (type) {
      case 'pending-orders':
        this.router.navigate(['/admin/orders'], { queryParams: { status: 'pending' } });
        break;
      case 'pending-stores':
        this.router.navigate(['/admin/stores'], { queryParams: { status: 'pending' } });
        break;
      case 'pending-products':
        this.router.navigate(['/admin/products'], { queryParams: { status: 'pending' } });
        break;
      case 'support-tickets':
        this.router.navigate(['/admin/support']);
        break;
      default:
        console.log('Action en attente non reconnue:', type);
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'help';
    }
  }

  // Méthodes utilitaires
  refreshDashboard(): void {
    this.loadDashboardData();
  }

  exportDashboard(): void {
    console.log('📊 Export du dashboard');
    // Logique d'export des données
  }

  configureAlerts(): void {
    console.log('🔔 Configuration des alertes');
    // Logique de configuration des alertes
  }

  viewDetailedAnalytics(): void {
    this.router.navigate(['/admin/analytics']);
  }

  manageUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  manageStores(): void {
    this.router.navigate(['/admin/stores']);
  }

  manageProducts(): void {
    this.router.navigate(['/admin/products']);
  }

  viewOrders(): void {
    this.router.navigate(['/admin/orders']);
  }

  viewSupport(): void {
    this.router.navigate(['/admin/support']);
  }

  viewReports(): void {
    this.router.navigate(['/admin/reports']);
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      case 'stable': return 'trending_flat';
      default: return 'help';
    }
  }

  getTrendColor(trend: string): string {
    switch (trend) {
      case 'up': return '#10B981';
      case 'down': return '#EF4444';
      case 'stable': return '#6B7280';
      default: return '#6B7280';
    }
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('fr-FR').format(value);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(value);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    return 'À l\'instant';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'success': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'error': return '#EF4444';
      case 'info': return '#3B82F6';
      default: return '#6B7280';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'success': return 'Opérationnel';
      case 'warning': return 'Attention';
      case 'error': return 'Erreur';
      case 'info': return 'Information';
      default: return 'Inconnu';
    }
  }

  calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  getGrowthDirection(current: number, previous: number): string {
    const growth = this.calculateGrowthRate(current, previous);
    if (growth > 0) return 'up';
    if (growth < 0) return 'down';
    return 'stable';
  }

  formatGrowthRate(rate: number): string {
    const sign = rate >= 0 ? '+' : '';
    return `${sign}${rate.toFixed(1)}%`;
  }
}


