import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AdminService } from '../../../../core/services/admin.service';

export interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    averageOrderValue: number;
    conversionRate: number;
    growthRate: number;
  };
  sales: {
    daily: { date: string; revenue: number; orders: number }[];
    monthly: { month: string; revenue: number; orders: number }[];
    byCategory: { category: string; revenue: number; percentage: number }[];
    byStore: { store: string; revenue: number; percentage: number }[];
  };
  customers: {
    newCustomers: number;
    returningCustomers: number;
    customerLifetimeValue: number;
    retentionRate: number;
    byRegion: { region: string; count: number; percentage: number }[];
    byAge: { ageGroup: string; count: number; percentage: number }[];
  };
  products: {
    topSelling: { name: string; sales: number; revenue: number }[];
    lowStock: { name: string; stock: number; category: string }[];
    byCategory: { category: string; count: number; revenue: number }[];
    performance: { name: string; views: number; sales: number; conversion: number }[];
  };
  trends: {
    revenue: { period: string; current: number; previous: number; change: number }[];
    orders: { period: string; current: number; previous: number; change: number }[];
    customers: { period: string; current: number; previous: number; change: number }[];
  };
}

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [
    CommonModule,
    NgFor,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatTableModule,
    MatPaginatorModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="analytics-management">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>Analytics & Rapports</h1>
          <p>Analysez les performances de votre marketplace</p>
        </div>
        <div class="header-right">
          <mat-form-field appearance="outline" class="period-field">
            <mat-label>Période</mat-label>
            <mat-select [(ngModel)]="selectedPeriod" (selectionChange)="loadAnalytics()">
              <mat-option value="7">7 derniers jours</mat-option>
              <mat-option value="30">30 derniers jours</mat-option>
              <mat-option value="90">3 derniers mois</mat-option>
              <mat-option value="365">12 derniers mois</mat-option>
            </mat-select>
          </mat-form-field>
          <button mat-raised-button color="primary" (click)="exportReport()">
            <mat-icon>download</mat-icon>
            Exporter
          </button>
        </div>
      </div>

      <!-- Overview Cards -->
      <div class="overview-cards">
        <mat-card class="overview-card">
          <div class="card-content">
            <div class="card-icon revenue">
              <mat-icon>account_balance_wallet</mat-icon>
            </div>
            <div class="card-info">
              <div class="card-value">{{ formatCurrency(analyticsData.overview.totalRevenue) }}</div>
              <div class="card-label">Chiffre d'affaires</div>
              <div class="card-change positive">
                <mat-icon>trending_up</mat-icon>
                +{{ analyticsData.overview.growthRate }}%
              </div>
            </div>
          </div>
        </mat-card>

        <mat-card class="overview-card">
          <div class="card-content">
            <div class="card-icon orders">
              <mat-icon>shopping_cart</mat-icon>
            </div>
            <div class="card-info">
              <div class="card-value">{{ analyticsData.overview.totalOrders }}</div>
              <div class="card-label">Commandes</div>
              <div class="card-change" [ngClass]="analyticsData.overview.growthRate >= 0 ? 'positive' : 'negative'" *ngIf="analyticsData.overview.growthRate !== 0">
                <mat-icon>{{ analyticsData.overview.growthRate >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
                {{ analyticsData.overview.growthRate >= 0 ? '+' : '' }}{{ analyticsData.overview.growthRate.toFixed(1) }}%
              </div>
            </div>
          </div>
        </mat-card>

        <mat-card class="overview-card">
          <div class="card-content">
            <div class="card-icon customers">
              <mat-icon>people</mat-icon>
            </div>
            <div class="card-info">
              <div class="card-value">{{ analyticsData.overview.totalCustomers }}</div>
              <div class="card-label">Clients</div>
              <!-- Trends calculés depuis les données réelles -->
            </div>
          </div>
        </mat-card>

        <mat-card class="overview-card">
          <div class="card-content">
            <div class="card-icon products">
              <mat-icon>inventory</mat-icon>
            </div>
            <div class="card-info">
              <div class="card-value">{{ analyticsData.overview.totalProducts }}</div>
              <div class="card-label">Produits</div>
              <!-- Trends calculés depuis les données réelles -->
            </div>
          </div>
        </mat-card>

        <mat-card class="overview-card">
          <div class="card-content">
            <div class="card-icon aov">
              <mat-icon>trending_up</mat-icon>
            </div>
            <div class="card-info">
              <div class="card-value">{{ formatCurrency(analyticsData.overview.averageOrderValue) }}</div>
              <div class="card-label">Panier moyen</div>
              <!-- Trends calculés depuis les données réelles -->
            </div>
          </div>
        </mat-card>

        <mat-card class="overview-card">
          <div class="card-content">
            <div class="card-icon conversion">
              <mat-icon>percent</mat-icon>
            </div>
            <div class="card-info">
              <div class="card-value">{{ analyticsData.overview.conversionRate }}%</div>
              <div class="card-label">Taux de conversion</div>
              <!-- Trends calculés depuis les données réelles -->
            </div>
          </div>
        </mat-card>
      </div>

      <!-- Analytics Tabs -->
      <mat-card class="analytics-card">
        <mat-tab-group>
          <!-- Sales Tab -->
          <mat-tab label="Ventes">
            <div class="tab-content">
              <div class="charts-grid">
                <div class="chart-container">
                  <h3>Évolution des ventes</h3>
                  <div class="chart-placeholder">
                    <mat-icon>show_chart</mat-icon>
                    <p>Graphique des ventes quotidiennes</p>
                  </div>
                </div>
                
                <div class="chart-container">
                  <h3>Ventes par catégorie</h3>
                  <div class="chart-placeholder">
                    <mat-icon>pie_chart</mat-icon>
                    <p>Graphique en secteurs</p>
                  </div>
                </div>
              </div>

              <div class="data-tables">
                <div class="table-section">
                  <h3>Top catégories</h3>
                  <table mat-table [dataSource]="analyticsData.sales.byCategory" class="analytics-table">
                    <ng-container matColumnDef="category">
                      <th mat-header-cell *matHeaderCellDef>Catégorie</th>
                      <td mat-cell *matCellDef="let item">{{ item.category }}</td>
                    </ng-container>
                    <ng-container matColumnDef="revenue">
                      <th mat-header-cell *matHeaderCellDef>Chiffre d'affaires</th>
                      <td mat-cell *matCellDef="let item">{{ formatCurrency(item.revenue) }}</td>
                    </ng-container>
                    <ng-container matColumnDef="percentage">
                      <th mat-header-cell *matHeaderCellDef>Pourcentage</th>
                      <td mat-cell *matCellDef="let item">
                        <div class="percentage-bar">
                          <div class="percentage-fill" [style.width.%]="item.percentage"></div>
                          <span class="percentage-text">{{ item.percentage }}%</span>
                        </div>
                      </td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="['category', 'revenue', 'percentage']"></tr>
                    <tr mat-row *matRowDef="let row; columns: ['category', 'revenue', 'percentage']"></tr>
                  </table>
                </div>

                <div class="table-section">
                  <h3>Top boutiques</h3>
                  <table mat-table [dataSource]="analyticsData.sales.byStore" class="analytics-table">
                    <ng-container matColumnDef="store">
                      <th mat-header-cell *matHeaderCellDef>Boutique</th>
                      <td mat-cell *matCellDef="let item">{{ item.store }}</td>
                    </ng-container>
                    <ng-container matColumnDef="revenue">
                      <th mat-header-cell *matHeaderCellDef>Chiffre d'affaires</th>
                      <td mat-cell *matCellDef="let item">{{ formatCurrency(item.revenue) }}</td>
                    </ng-container>
                    <ng-container matColumnDef="percentage">
                      <th mat-header-cell *matHeaderCellDef>Part de marché</th>
                      <td mat-cell *matCellDef="let item">{{ item.percentage }}%</td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="['store', 'revenue', 'percentage']"></tr>
                    <tr mat-row *matRowDef="let row; columns: ['store', 'revenue', 'percentage']"></tr>
                  </table>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Customers Tab -->
          <mat-tab label="Clients">
            <div class="tab-content">
              <div class="customer-stats">
                <div class="stat-card">
                  <div class="stat-icon">
                    <mat-icon>person_add</mat-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ analyticsData.customers.newCustomers }}</div>
                    <div class="stat-label">Nouveaux clients</div>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon">
                    <mat-icon>repeat</mat-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ analyticsData.customers.returningCustomers }}</div>
                    <div class="stat-label">Clients récurrents</div>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon">
                    <mat-icon>monetization_on</mat-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ formatCurrency(analyticsData.customers.customerLifetimeValue) }}</div>
                    <div class="stat-label">Valeur vie client</div>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon">
                    <mat-icon>loyalty</mat-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ analyticsData.customers.retentionRate }}%</div>
                    <div class="stat-label">Taux de rétention</div>
                  </div>
                </div>
              </div>

              <div class="charts-grid">
                <div class="chart-container">
                  <h3>Répartition géographique</h3>
                  <div class="chart-placeholder">
                    <mat-icon>public</mat-icon>
                    <p>Carte des clients par région</p>
                  </div>
                </div>
                
                <div class="chart-container">
                  <h3>Répartition par âge</h3>
                  <div class="chart-placeholder">
                    <mat-icon>bar_chart</mat-icon>
                    <p>Graphique en barres</p>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Products Tab -->
          <mat-tab label="Produits">
            <div class="tab-content">
              <div class="product-tables">
                <div class="table-section">
                  <h3>Produits les plus vendus</h3>
                  <table mat-table [dataSource]="analyticsData.products.topSelling" class="analytics-table">
                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef>Produit</th>
                      <td mat-cell *matCellDef="let item">{{ item.name }}</td>
                    </ng-container>
                    <ng-container matColumnDef="sales">
                      <th mat-header-cell *matHeaderCellDef>Ventes</th>
                      <td mat-cell *matCellDef="let item">{{ item.sales }}</td>
                    </ng-container>
                    <ng-container matColumnDef="revenue">
                      <th mat-header-cell *matHeaderCellDef>Revenus</th>
                      <td mat-cell *matCellDef="let item">{{ formatCurrency(item.revenue) }}</td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="['name', 'sales', 'revenue']"></tr>
                    <tr mat-row *matRowDef="let row; columns: ['name', 'sales', 'revenue']"></tr>
                  </table>
                </div>

                <div class="table-section">
                  <h3>Alertes de stock</h3>
                  <table mat-table [dataSource]="analyticsData.products.lowStock" class="analytics-table">
                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef>Produit</th>
                      <td mat-cell *matCellDef="let item">{{ item.name }}</td>
                    </ng-container>
                    <ng-container matColumnDef="stock">
                      <th mat-header-cell *matHeaderCellDef>Stock</th>
                      <td mat-cell *matCellDef="let item">
                        <mat-chip [ngClass]="getStockClass(item.stock)">
                          {{ item.stock }}
                        </mat-chip>
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="category">
                      <th mat-header-cell *matHeaderCellDef>Catégorie</th>
                      <td mat-cell *matCellDef="let item">{{ item.category }}</td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="['name', 'stock', 'category']"></tr>
                    <tr mat-row *matRowDef="let row; columns: ['name', 'stock', 'category']"></tr>
                  </table>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Trends Tab -->
          <mat-tab label="Tendances">
            <div class="tab-content">
              <div class="trends-grid">
                <div class="trend-card" *ngFor="let trend of analyticsData.trends.revenue">
                  <div class="trend-header">
                    <h4>Revenus - {{ trend.period }}</h4>
                    <mat-chip [ngClass]="trend.change >= 0 ? 'positive' : 'negative'">
                      {{ trend.change >= 0 ? '+' : '' }}{{ trend.change }}%
                    </mat-chip>
                  </div>
                  <div class="trend-content">
                    <div class="trend-current">{{ formatCurrency(trend.current) }}</div>
                    <div class="trend-previous">vs {{ formatCurrency(trend.previous) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styleUrls: ['./admin-analytics.component.scss']
})
export class AdminAnalyticsComponent implements OnInit {
  selectedPeriod: string = '30';
  analyticsData: AnalyticsData = {
    overview: {
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      averageOrderValue: 0,
      conversionRate: 0,
      growthRate: 0
    },
    sales: {
      daily: [],
      monthly: [],
      byCategory: [],
      byStore: []
    },
    customers: {
      newCustomers: 0,
      returningCustomers: 0,
      customerLifetimeValue: 0,
      retentionRate: 0,
      byRegion: [],
      byAge: []
    },
    products: {
      topSelling: [],
      lowStock: [],
      byCategory: [],
      performance: []
    },
    trends: {
      revenue: [],
      orders: [],
      customers: []
    }
  };

  loading = true;
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;
    
    // Charger les données depuis l'API
    this.adminService.getDashboardStats().subscribe({
      next: (dashboardResponse) => {
        if (dashboardResponse.success && dashboardResponse.data) {
          const stats = dashboardResponse.data;
          
          // Charger les graphiques pour avoir plus de détails
          this.http.get(`${this.apiUrl}/dashboard/charts?period=${this.selectedPeriod}days`).subscribe({
            next: (chartsResponse: any) => {
              if (chartsResponse.success && chartsResponse.data) {
                const chartsData = chartsResponse.data;
                this.updateAnalyticsData(stats, chartsData);
              } else {
                this.updateAnalyticsData(stats, null);
              }
              this.loading = false;
            },
            error: (error) => {
              console.error('Erreur lors du chargement des graphiques:', error);
              this.updateAnalyticsData(stats, null);
              this.loading = false;
            }
          });
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

  private updateAnalyticsData(stats: any, chartsData: any): void {
    // Calculer le panier moyen et le taux de conversion
    const avgOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;
    const conversionRate = 0; // À calculer depuis les données de visites si disponible
    
    // Calculer le taux de croissance depuis les données mensuelles
    let growthRate = 0;
    if (chartsData && chartsData.revenueByMonth && chartsData.revenueByMonth.length >= 2) {
      const currentMonth = parseFloat(chartsData.revenueByMonth[chartsData.revenueByMonth.length - 1]?.revenue || 0);
      const previousMonth = parseFloat(chartsData.revenueByMonth[chartsData.revenueByMonth.length - 2]?.revenue || 0);
      if (previousMonth > 0) {
        growthRate = ((currentMonth - previousMonth) / previousMonth) * 100;
      }
    }
    
    // Overview
    this.analyticsData.overview = {
      totalRevenue: stats.totalRevenue || 0,
      totalOrders: stats.totalOrders || 0,
      totalCustomers: stats.totalUsers || 0,
      totalProducts: stats.totalProducts || 0,
      averageOrderValue: avgOrderValue,
      conversionRate: conversionRate,
      growthRate: growthRate
    };

    // Sales data
    if (chartsData) {
      // Ventes par mois depuis revenueByMonth
      if (chartsData.revenueByMonth && chartsData.ordersByMonth) {
        this.analyticsData.sales.monthly = chartsData.revenueByMonth.map((item: any, index: number) => ({
          month: this.formatMonth(item.month),
          revenue: parseFloat(item.revenue || 0),
          orders: parseInt(chartsData.ordersByMonth[index]?.count || 0)
        }));
      }

      // Top produits
      if (chartsData.topProducts) {
        this.analyticsData.products.topSelling = chartsData.topProducts.slice(0, 5).map((item: any) => ({
          name: item.name || 'Produit sans nom',
          sales: parseInt(item.total_sold || 0),
          revenue: parseFloat(item.total_revenue || 0)
        }));
      }
    }

    // Sales by category - À charger depuis l'API si disponible
    this.analyticsData.sales.byCategory = [];
    
    // Sales by store - À charger depuis l'API si disponible
    this.analyticsData.sales.byStore = [];

    // Customers - Utiliser les données du dashboard
    this.analyticsData.customers = {
      newCustomers: 0, // À calculer depuis les nouveaux utilisateurs de la période
      returningCustomers: 0, // À calculer
      customerLifetimeValue: 0, // À calculer
      retentionRate: 0, // À calculer
      byRegion: [], // À charger depuis l'API
      byAge: [] // À charger depuis l'API
    };

    // Products
    this.analyticsData.products.byCategory = [];
    this.analyticsData.products.lowStock = []; // À charger depuis /api/admin/products/out-of-stock
    this.analyticsData.products.performance = [];

    // Trends - Calculer depuis les données mensuelles
    if (chartsData && chartsData.revenueByMonth && chartsData.ordersByMonth) {
      this.calculateTrends(chartsData);
    }
  }

  private calculateTrends(chartsData: any): void {
    const revenueByMonth = chartsData.revenueByMonth || [];
    const ordersByMonth = chartsData.ordersByMonth || [];
    
    if (revenueByMonth.length >= 2) {
      const currentMonth = revenueByMonth[revenueByMonth.length - 1];
      const previousMonth = revenueByMonth[revenueByMonth.length - 2];
      const currentQuarter = revenueByMonth.slice(-3).reduce((sum: number, item: any) => sum + parseFloat(item.revenue || 0), 0);
      const previousQuarter = revenueByMonth.slice(-6, -3).reduce((sum: number, item: any) => sum + parseFloat(item.revenue || 0), 0);
      
      this.analyticsData.trends.revenue = [
        {
          period: 'Ce mois',
          current: parseFloat(currentMonth.revenue || 0),
          previous: parseFloat(previousMonth.revenue || 0),
          change: previousMonth.revenue > 0 ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100 : 0
        },
        {
          period: 'Ce trimestre',
          current: currentQuarter,
          previous: previousQuarter,
          change: previousQuarter > 0 ? ((currentQuarter - previousQuarter) / previousQuarter) * 100 : 0
        }
      ];
    }

    if (ordersByMonth.length >= 2) {
      const currentMonth = ordersByMonth[ordersByMonth.length - 1];
      const previousMonth = ordersByMonth[ordersByMonth.length - 2];
      const currentQuarter = ordersByMonth.slice(-3).reduce((sum: number, item: any) => sum + parseInt(item.count || 0), 0);
      const previousQuarter = ordersByMonth.slice(-6, -3).reduce((sum: number, item: any) => sum + parseInt(item.count || 0), 0);
      
      this.analyticsData.trends.orders = [
        {
          period: 'Ce mois',
          current: parseInt(currentMonth.count || 0),
          previous: parseInt(previousMonth.count || 0),
          change: previousMonth.count > 0 ? ((currentMonth.count - previousMonth.count) / previousMonth.count) * 100 : 0
        },
        {
          period: 'Ce trimestre',
          current: currentQuarter,
          previous: previousQuarter,
          change: previousQuarter > 0 ? ((currentQuarter - previousQuarter) / previousQuarter) * 100 : 0
        }
      ];
    }
  }

  private formatMonth(monthStr: string): string {
    const [year, month] = monthStr.split('-');
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return months[parseInt(month) - 1] || monthStr;
  }


  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(value);
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'stock-empty';
    if (stock < 5) return 'stock-low';
    return 'stock-normal';
  }

  exportReport(): void {
    console.log('Exporter rapport analytics');
  }
}
