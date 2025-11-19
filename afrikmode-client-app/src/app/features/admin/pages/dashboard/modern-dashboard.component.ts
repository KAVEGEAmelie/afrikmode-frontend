import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AdminService } from '../../../../core/services/admin.service';

// Import des composants
import { KPICardComponent, KPIData } from './components/kpi-card/kpi-card.component';
import { DonutChartComponent, DonutData } from './components/donut-chart/donut-chart.component';
import { BarChartComponent, BarChartData } from './components/bar-chart/bar-chart.component';
import { TopProductsComponent, TopProduct } from './components/top-products/top-products.component';
import { DashboardFiltersComponent, FilterOption } from './components/dashboard-filters/dashboard-filters.component';

@Component({
  selector: 'app-modern-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    KPICardComponent,
    DonutChartComponent,
    BarChartComponent,
    TopProductsComponent,
    DashboardFiltersComponent
  ],
  template: `
    <div class="modern-dashboard">
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
        <!-- Header Section -->
        <div class="dashboard-header">
        <div class="header-left">
          <div class="brand">
            <div class="brand-icon">
              <mat-icon>inventory_2</mat-icon>
            </div>
            <div class="brand-info">
              <h1>Marchandises</h1>
              <span class="subtitle">Gestion de stock</span>
            </div>
          </div>
        </div>
        
        <div class="header-right">
          <span class="last-update">
            <mat-icon>update</mat-icon>
            Dernière mise à jour {{ lastUpdate }}
          </span>
        </div>
      </div>

      <!-- Filters -->
      <app-dashboard-filters
        [months]="months"
        [categories]="categories"
        [references]="references"
        (filtersChanged)="onFiltersChanged($event)">
      </app-dashboard-filters>

      <!-- KPI Cards Row -->
      <div class="kpi-cards-row">
        <app-kpi-card *ngFor="let kpi of kpiData" [data]="kpi"></app-kpi-card>
      </div>

      <!-- Donut Charts Row -->
      <div class="donut-charts-row">
        <app-donut-chart
                    title="Utilisateurs par rôle"
          [data]="stockByCategory"
                    [totalValue]="stockByCategoryTotal">
        </app-donut-chart>
        
                  <!-- Les autres graphiques donut sont spécifiques à la gestion de stock -->
                  <!-- Ils peuvent être supprimés ou remplis depuis une API spécifique si nécessaire -->
      </div>

      <!-- Bottom Grid -->
      <div class="bottom-grid">
        <!-- Top Products -->
        <app-top-products
          title="Top 3 des marchandises"
          [products]="topProducts">
        </app-top-products>

        <!-- Commandes par mois -->
        <app-bar-chart
          title="Commandes par mois"
          [data]="monthlyEntries"
          [maxValue]="monthlyEntriesMax">
        </app-bar-chart>

        <!-- Revenus par mois -->
        <app-bar-chart
          title="Revenus par mois"
          [data]="monthlyEntriesValue"
          [maxValue]="monthlyEntriesValueMax"
          [valueFormatter]="formatCurrency">
        </app-bar-chart>

        <!-- Products to Replenish -->
        <app-top-products
          title="Produits en rupture de stock"
          [products]="productsToReplenish">
        </app-top-products>
      </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./modern-dashboard.component.scss']
})
export class ModernDashboardComponent implements OnInit {
  lastUpdate = new Date().toLocaleDateString('fr-FR');
  loading = true;

  // KPI Data - Sera rempli depuis l'API
  kpiData: KPIData[] = [];

  // Filter Data
  months: FilterOption[] = [
    { value: 'jan', label: 'janv', selected: true },
    { value: 'feb', label: 'févr' },
    { value: 'mar', label: 'mars' },
    { value: 'apr', label: 'avr' },
    { value: 'may', label: 'mai', selected: true }
  ];

  categories: FilterOption[] = [
    { value: 'biscuits', label: 'Biscuits' },
    { value: 'consoles', label: 'Consoles' },
    { value: 'electro', label: 'Electro' },
    { value: 'smartphone', label: 'SmartPhone' }
  ];

  references: FilterOption[] = [
    { value: 'B1', label: 'B1' },
    { value: 'B2', label: 'B2' },
    { value: 'B3', label: 'B3' },
    { value: 'C1', label: 'C1' },
    { value: 'C2', label: 'C2' },
    { value: 'E1', label: 'E1' },
    { value: 'E2', label: 'E2' },
    { value: 'E3', label: 'E3' },
    { value: 'E4', label: 'E4' },
    { value: 'S1', label: 'S1' },
    { value: 'S2', label: 'S2' }
  ];

  // Donut Charts Data - Sera rempli depuis l'API
  stockByCategory: DonutData[] = [];
  valueByCategory: DonutData[] = [];
  entriesByCategory: DonutData[] = [];
  entriesValueByCategory: DonutData[] = [];
  exitsByCategory: DonutData[] = [];
  exitsValueByCategory: DonutData[] = [];
  
  // Totaux pour les donut charts
  stockByCategoryTotal: string = '0';
  valueByCategoryTotal: string = '0';
  entriesByCategoryTotal: string = '0';
  entriesValueByCategoryTotal: string = '0';
  exitsByCategoryTotal: string = '0';
  exitsValueByCategoryTotal: string = '0';

  // Bar Charts Data - Sera rempli depuis l'API
  monthlyEntries: BarChartData[] = [];
  monthlyEntriesValue: BarChartData[] = [];
  monthlyExits: BarChartData[] = [];
  monthlyExitsValue: BarChartData[] = [];
  
  // Max values pour les bar charts
  monthlyEntriesMax: number = 100;
  monthlyEntriesValueMax: number = 100000;
  monthlyExitsMax: number = 100;
  monthlyExitsValueMax: number = 100000;

  // Top Products Data - Sera rempli depuis l'API
  topProducts: TopProduct[] = [];
  productsToReplenish: TopProduct[] = [];

  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(
    private http: HttpClient,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;
    
    // Charger les statistiques du dashboard depuis l'API
    this.adminService.getDashboardStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const stats = response.data;
          
          // Mettre à jour les KPIs avec les vraies données
    this.kpiData = [
      {
              title: 'Utilisateurs totaux',
              value: this.formatNumber(stats.totalUsers || 0),
        icon: 'inventory',
        color: '#5B5FED',
              trend: { value: 0, percentage: 0, direction: 'stable' }
      },
      {
              title: 'Revenus totaux',
              value: this.formatCurrency(stats.totalRevenue || 0),
        icon: 'account_balance_wallet',
        color: '#7C3AED',
              trend: { value: 0, percentage: 0, direction: 'stable' }
      },
      {
              title: 'Commandes totales',
              value: this.formatNumber(stats.totalOrders || 0),
        icon: 'shopping_cart',
        color: '#EC4899',
              trend: { value: 0, percentage: 0, direction: 'stable' }
      },
      {
              title: 'Produits actifs',
              value: this.formatNumber(stats.totalProducts || 0),
        icon: 'trending_up',
        color: '#06B6D4',
              trend: { value: 0, percentage: 0, direction: 'stable' }
      },
      {
              title: 'Boutiques actives',
              value: this.formatNumber(stats.totalStores || 0),
        icon: 'exit_to_app',
        color: '#F59E0B',
              trend: { value: 0, percentage: 0, direction: 'stable' }
      },
      {
              title: 'Boutiques en attente',
              value: this.formatNumber(stats.pendingStores || 0),
        icon: 'money_off',
        color: '#10B981',
              trend: { value: 0, percentage: 0, direction: 'stable' }
            }
          ];
          
          // Charger les graphiques
          this.loadChartsData();
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        this.loading = false;
      }
    });
  }
  
  private loadChartsData(): void {
    // Charger les graphiques depuis l'API
    this.http.get(`${this.apiUrl}/dashboard/charts`).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          const chartsData = response.data;
          
          // Top produits
          if (chartsData.topProducts) {
            this.topProducts = chartsData.topProducts.slice(0, 3).map((item: any) => ({
              name: item.name || 'Produit sans nom',
              value: this.formatCurrency(parseFloat(item.total_revenue || 0)),
              trend: 'up' as const
    }));
  }

          // Commandes par mois
          if (chartsData.ordersByMonth) {
            this.monthlyEntries = chartsData.ordersByMonth.map((item: any, index: number) => ({
              label: this.formatMonth(item.month),
              value: parseInt(item.count || 0),
              color: this.getMonthColor(index)
            }));
            const maxEntries = Math.max(...this.monthlyEntries.map(item => item.value), 1);
            this.monthlyEntriesMax = Math.ceil(maxEntries * 1.1);
          }
          
          // Revenus par mois
          if (chartsData.revenueByMonth) {
            this.monthlyEntriesValue = chartsData.revenueByMonth.map((item: any, index: number) => ({
              label: this.formatMonth(item.month),
              value: parseFloat(item.revenue || 0),
              color: this.getMonthColor(index)
            }));
            const maxRevenue = Math.max(...this.monthlyEntriesValue.map(item => item.value), 1);
            this.monthlyEntriesValueMax = Math.ceil(maxRevenue * 1.1);
          }
          
          // Utilisateurs par rôle (pour stockByCategory)
          if (chartsData.usersByRole) {
            this.stockByCategory = chartsData.usersByRole.map((item: any, index: number) => ({
              label: this.getRoleLabel(item.role),
              value: parseInt(item.count || 0),
              color: this.getCategoryColor(index)
            }));
            const total = this.stockByCategory.reduce((sum, item) => sum + item.value, 0);
            this.stockByCategoryTotal = this.formatNumber(total);
          }
        }
        
        // Charger les produits en rupture de stock
        this.loadProductsToReplenish();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des graphiques:', error);
        this.loadProductsToReplenish();
      }
    });
  }
  
  private loadProductsToReplenish(): void {
    this.http.get(`${this.apiUrl}/products/out-of-stock?limit=3`).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.productsToReplenish = response.data.slice(0, 3).map((item: any) => ({
            name: item.name || 'Produit sans nom',
            value: '',
            status: (item.stock || 0) === 0 ? 'out-of-stock' : 'low-stock'
          }));
        } else {
          this.productsToReplenish = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits en rupture:', error);
        this.productsToReplenish = [];
        this.loading = false;
      }
    });
  }
  
  private formatMonth(monthStr: string): string {
    const [year, month] = monthStr.split('-');
    const months = ['janv', 'févr', 'mars', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'];
    return months[parseInt(month) - 1] || monthStr;
  }
  
  private getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'customer': 'Clients',
      'vendor': 'Vendeurs',
      'admin': 'Admins',
      'super_admin': 'Super Admins'
    };
    return labels[role] || role;
  }
  
  private getCategoryColor(index: number): string {
    const colors = ['#5B5FED', '#7C3AED', '#EC4899', '#06B6D4', '#F59E0B', '#10B981'];
    return colors[index % colors.length];
  }
  
  private getMonthColor(index: number): string {
    const colors = ['#5B5FED', '#7C3AED', '#EC4899', '#06B6D4', '#F59E0B', '#10B981'];
    return colors[index % colors.length];
  }
  
  private formatNumber(value: number): string {
    return new Intl.NumberFormat('fr-FR').format(value);
  }


  onFiltersChanged(filters: any): void {
    console.log('Filters changed:', filters);
    // Ici vous pouvez implémenter la logique de filtrage
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(value);
  }
}
