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
              <div class="card-change positive">
                <mat-icon>trending_up</mat-icon>
                +12.5%
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
              <div class="card-change positive">
                <mat-icon>trending_up</mat-icon>
                +8.3%
              </div>
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
              <div class="card-change positive">
                <mat-icon>trending_up</mat-icon>
                +15.2%
              </div>
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
              <div class="card-change positive">
                <mat-icon>trending_up</mat-icon>
                +5.7%
              </div>
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
              <div class="card-change positive">
                <mat-icon>trending_up</mat-icon>
                +2.1%
              </div>
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

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;
    
    setTimeout(() => {
      this.analyticsData = this.generateMockAnalytics();
      this.loading = false;
    }, 1000);
  }

  private generateMockAnalytics(): AnalyticsData {
    return {
      overview: {
        totalRevenue: 1250000,
        totalOrders: 3456,
        totalCustomers: 1234,
        totalProducts: 567,
        averageOrderValue: 36200,
        conversionRate: 3.2,
        growthRate: 15.7
      },
      sales: {
        daily: this.generateDailySales(),
        monthly: this.generateMonthlySales(),
        byCategory: [
          { category: 'Femmes', revenue: 450000, percentage: 36 },
          { category: 'Hommes', revenue: 320000, percentage: 25.6 },
          { category: 'Enfants', revenue: 280000, percentage: 22.4 },
          { category: 'Accessoires', revenue: 200000, percentage: 16 }
        ],
        byStore: [
          { store: 'Boutique Afrique', revenue: 300000, percentage: 24 },
          { store: 'Mode Ghana', revenue: 250000, percentage: 20 },
          { store: 'Traditions Sénégal', revenue: 200000, percentage: 16 },
          { store: 'Artisanat Togo', revenue: 180000, percentage: 14.4 },
          { store: 'Créations Mali', revenue: 150000, percentage: 12 },
          { store: 'Autres', revenue: 170000, percentage: 13.6 }
        ]
      },
      customers: {
        newCustomers: 234,
        returningCustomers: 1000,
        customerLifetimeValue: 125000,
        retentionRate: 78.5,
        byRegion: [
          { region: 'Lomé', count: 456, percentage: 37 },
          { region: 'Kara', count: 234, percentage: 19 },
          { region: 'Sokodé', count: 189, percentage: 15.3 },
          { region: 'Kpalimé', count: 156, percentage: 12.6 },
          { region: 'Autres', count: 199, percentage: 16.1 }
        ],
        byAge: [
          { ageGroup: '18-25', count: 345, percentage: 28 },
          { ageGroup: '26-35', count: 456, percentage: 37 },
          { ageGroup: '36-45', count: 234, percentage: 19 },
          { ageGroup: '46+', count: 199, percentage: 16 }
        ]
      },
      products: {
        topSelling: [
          { name: 'Robe Wax Africaine', sales: 156, revenue: 14040000 },
          { name: 'Chemise Kente', sales: 134, revenue: 10115000 },
          { name: 'Boubou Brodé', sales: 98, revenue: 14700000 },
          { name: 'Ensemble Enfant', sales: 87, revenue: 3915000 },
          { name: 'Sac à Main Cuir', sales: 76, revenue: 9500000 }
        ],
        lowStock: [
          { name: 'Robe Wax Rouge', stock: 2, category: 'Femmes' },
          { name: 'Chemise Kente Bleue', stock: 1, category: 'Hommes' },
          { name: 'Sac Cuir Noir', stock: 0, category: 'Accessoires' },
          { name: 'Boubou Vert', stock: 3, category: 'Femmes' },
          { name: 'Pantalon Wax', stock: 1, category: 'Hommes' }
        ],
        byCategory: [
          { category: 'Femmes', count: 234, revenue: 450000 },
          { category: 'Hommes', count: 189, revenue: 320000 },
          { category: 'Enfants', count: 98, revenue: 280000 },
          { category: 'Accessoires', count: 46, revenue: 200000 }
        ],
        performance: [
          { name: 'Robe Wax', views: 1234, sales: 156, conversion: 12.6 },
          { name: 'Chemise Kente', views: 987, sales: 134, conversion: 13.6 },
          { name: 'Boubou Brodé', views: 756, sales: 98, conversion: 13.0 },
          { name: 'Ensemble Enfant', views: 543, sales: 87, conversion: 16.0 }
        ]
      },
      trends: {
        revenue: [
          { period: 'Cette semaine', current: 125000, previous: 98000, change: 27.6 },
          { period: 'Ce mois', current: 450000, previous: 380000, change: 18.4 },
          { period: 'Ce trimestre', current: 1250000, previous: 1050000, change: 19.0 }
        ],
        orders: [
          { period: 'Cette semaine', current: 234, previous: 189, change: 23.8 },
          { period: 'Ce mois', current: 1234, previous: 1056, change: 16.9 },
          { period: 'Ce trimestre', current: 3456, previous: 2890, change: 19.6 }
        ],
        customers: [
          { period: 'Cette semaine', current: 45, previous: 38, change: 18.4 },
          { period: 'Ce mois', current: 234, previous: 198, change: 18.2 },
          { period: 'Ce trimestre', current: 567, previous: 456, change: 24.3 }
        ]
      }
    };
  }

  private generateDailySales(): { date: string; revenue: number; orders: number }[] {
    const sales = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      sales.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 50000) + 10000,
        orders: Math.floor(Math.random() * 50) + 10
      });
    }
    return sales;
  }

  private generateMonthlySales(): { month: string; revenue: number; orders: number }[] {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return months.map(month => ({
      month,
      revenue: Math.floor(Math.random() * 200000) + 50000,
      orders: Math.floor(Math.random() * 300) + 100
    }));
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
