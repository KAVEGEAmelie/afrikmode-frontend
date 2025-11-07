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
                    totalValue="1,234">
                  </app-donut-chart>
                  
                  <app-donut-chart
                    title="Boutiques par statut"
                    [data]="storesByStatus"
                    totalValue="89">
                  </app-donut-chart>
                </div>

                <div class="chart-group">
                  <app-bar-chart
                    title="Commandes par mois"
                    [data]="ordersByMonth"
                    [maxValue]="500">
                  </app-bar-chart>
                  
                  <app-bar-chart
                    title="Revenus par mois"
                    [data]="revenueByMonth"
                    [maxValue]="100000"
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

              <!-- System Status -->
              <mat-card class="system-status-card">
                <mat-card-header>
                  <mat-card-title>État du système</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="status-list">
                    <div *ngFor="let status of systemStatus" class="status-item">
                      <div class="status-indicator" [ngClass]="'status-' + status.status">
                        <mat-icon>{{ getStatusIcon(status.status) }}</mat-icon>
                      </div>
                      <div class="status-content">
                        <div class="status-name">{{ status.name }}</div>
                        <div class="status-value">{{ status.value }}</div>
                      </div>
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

  // Charts Data
  usersByRole: DonutData[] = [
    { label: 'Clients', value: 856, color: '#5B5FED' },
    { label: 'Vendeurs', value: 234, color: '#7C3AED' },
    { label: 'Managers', value: 89, color: '#EC4899' },
    { label: 'Admins', value: 55, color: '#06B6D4' }
  ];

  storesByStatus: DonutData[] = [
    { label: 'Actives', value: 67, color: '#10B981' },
    { label: 'En attente', value: 12, color: '#F59E0B' },
    { label: 'Suspendues', value: 8, color: '#EF4444' },
    { label: 'En révision', value: 2, color: '#6B7280' }
  ];

  ordersByMonth: BarChartData[] = [
    { label: 'Jan', value: 234, color: '#5B5FED' },
    { label: 'Fév', value: 189, color: '#7C3AED' },
    { label: 'Mar', value: 267, color: '#EC4899' },
    { label: 'Avr', value: 312, color: '#06B6D4' },
    { label: 'Mai', value: 456, color: '#F59E0B' }
  ];

  revenueByMonth: BarChartData[] = [
    { label: 'Jan', value: 23456, color: '#5B5FED' },
    { label: 'Fév', value: 18923, color: '#7C3AED' },
    { label: 'Mar', value: 26789, color: '#EC4899' },
    { label: 'Avr', value: 31245, color: '#06B6D4' },
    { label: 'Mai', value: 45678, color: '#F59E0B' }
  ];

  // Top Products
  topProducts: TopProduct[] = [
    { name: 'Robe Wax Africaine', value: '2,456 €', trend: 'up' },
    { name: 'Chemise Dashiki', value: '1,890 €', trend: 'up' },
    { name: 'Pantalon Kente', value: '1,567 €', trend: 'stable' },
    { name: 'Sac Bogolan', value: '1,234 €', trend: 'down' },
    { name: 'Chaussures Adinkra', value: '987 €', trend: 'up' }
  ];

  // Recent Activities
  recentActivities = [
    { icon: 'person_add', text: 'Nouvel utilisateur inscrit', time: 'Il y a 2 min', color: '#5B5FED' },
    { icon: 'store', text: 'Nouvelle boutique créée', time: 'Il y a 5 min', color: '#7C3AED' },
    { icon: 'shopping_cart', text: 'Nouvelle commande reçue', time: 'Il y a 8 min', color: '#EC4899' },
    { icon: 'support_agent', text: 'Ticket résolu', time: 'Il y a 12 min', color: '#06B6D4' },
    { icon: 'local_offer', text: 'Coupon créé', time: 'Il y a 15 min', color: '#F59E0B' }
  ];

  // Pending Actions - Sera rempli depuis le backend
  pendingActions: any[] = [];

  // System Status
  systemStatus = [
    { name: 'Serveur API', value: 'Opérationnel', status: 'success' },
    { name: 'Base de données', value: 'Connectée', status: 'success' },
    { name: 'Cache Redis', value: 'Actif', status: 'success' },
    { name: 'Notifications', value: 'En cours', status: 'warning' },
    { name: 'Sauvegarde', value: 'Programmée', status: 'info' }
  ];

  constructor(
    private dashboardDataService: DashboardDataService,
    private adminState: AdminStateService,
    private adminAuth: AdminAuthService,
    private adminService: AdminService,
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
    // Mettre à jour les KPIs avec les vraies données
    this.kpiData = [
      {
        title: 'Utilisateurs totaux',
        value: this.formatNumber(stats.totalUsers || 0),
        icon: 'people',
        color: '#5B5FED',
        trend: { value: 12, percentage: 12.5, direction: 'up' } // TODO: Calculer depuis historique
      },
      {
        title: 'Boutiques actives',
        value: this.formatNumber(stats.totalStores || 0),
        icon: 'store',
        color: '#7C3AED',
        trend: { value: 8, percentage: 8.3, direction: 'up' } // TODO: Calculer depuis historique
      },
      {
        title: 'Produits en vente',
        value: this.formatNumber(stats.totalProducts || 0),
        icon: 'inventory',
        color: '#EC4899',
        trend: { value: -3, percentage: -3.2, direction: 'down' } // TODO: Calculer depuis historique
      },
      {
        title: 'Commandes du mois',
        value: this.formatNumber(stats.totalOrders || 0),
        icon: 'shopping_cart',
        color: '#06B6D4',
        trend: { value: 15, percentage: 15.2, direction: 'up' } // TODO: Calculer depuis historique
      },
      {
        title: 'Revenus totaux',
        value: this.formatCurrency(stats.totalRevenue || 0),
        icon: 'account_balance_wallet',
        color: '#F59E0B',
        trend: { value: 7, percentage: 7.1, direction: 'up' } // TODO: Calculer depuis historique
      },
      {
        title: 'Boutiques en attente',
        value: this.formatNumber(stats.pendingStores || 0),
        icon: 'store',
        color: '#10B981',
        trend: { value: 0, percentage: 0, direction: 'stable' }
      }
    ];

    // Mettre à jour les actions en attente
    this.pendingActions = [
      { icon: 'store', text: 'Boutiques en attente', count: stats.pendingStores || 0, type: 'stores', color: '#7C3AED' },
      { icon: 'inventory', text: 'Produits à modérer', count: 0, type: 'products', color: '#EC4899' }, // TODO: Charger depuis API
      { icon: 'support_agent', text: 'Tickets ouverts', count: 0, type: 'tickets', color: '#06B6D4' }, // TODO: Charger depuis API
      { icon: 'payment', text: 'Paiements en attente', count: 0, type: 'payments', color: '#F59E0B' } // TODO: Charger depuis API
    ];
  }

  private loadAdditionalData(): void {
    // Charger les données supplémentaires (graphiques, activités, etc.)
    // TODO: Implémenter les appels API pour :
    // - Utilisateurs par rôle
    // - Boutiques par statut
    // - Commandes par mois
    // - Revenus par mois
    // - Top produits
    // - Activités récentes
    
    this.loading = false;
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


