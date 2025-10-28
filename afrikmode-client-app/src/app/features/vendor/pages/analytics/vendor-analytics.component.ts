import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { VendorService } from '../../../../core/services/vendor.service';
// import { NgChartsModule } from 'ng2-charts';
// import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';

interface AnalyticsKPI {
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  icon: string;
  color: string;
  description: string;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
  views: number;
  conversion: number;
  image: string;
}

interface TopCustomer {
  name: string;
  orders: number;
  totalSpent: number;
  lastOrder: string;
  avatar?: string;
}

interface GeographicData {
  region: string;
  sales: number;
  orders: number;
  percentage: number;
}

@Component({
  selector: 'app-vendor-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTabsModule,
    MatChipsModule,
    MatTableModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatMenuModule,
    // NgChartsModule
  ],
  template: `
    <div class="vendor-analytics">
      <!-- Header avec filtres -->
      <div class="analytics-header">
        <div class="header-content">
          <h1>
            <mat-icon>analytics</mat-icon>
            Analytics & Rapports
          </h1>
          <p>Analysez les performances de votre boutique en détail</p>
        </div>
        <div class="header-filters">
          <mat-select [(ngModel)]="selectedPeriod" (selectionChange)="updateAnalytics()">
            <mat-option value="today">Aujourd'hui</mat-option>
            <mat-option value="7d">7 derniers jours</mat-option>
            <mat-option value="30d">30 derniers jours</mat-option>
            <mat-option value="3m">3 derniers mois</mat-option>
            <mat-option value="1y">1 an</mat-option>
            <mat-option value="custom">Période personnalisée</mat-option>
          </mat-select>
          <button mat-raised-button color="primary" (click)="exportReport()">
            <mat-icon>download</mat-icon>
            Exporter
          </button>
        </div>
      </div>

      <!-- KPI Analytics -->
      <div class="kpi-grid">
        @for (kpi of analyticsKPIs; track kpi.title) {
          <mat-card class="kpi-card" [style.border-left-color]="kpi.color">
            <mat-card-content>
              <div class="kpi-header">
                <div class="kpi-icon" [style.background-color]="kpi.color">
                  <mat-icon>{{ kpi.icon }}</mat-icon>
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

      <!-- Graphiques et Analyses -->
      <div class="analytics-content">
        <mat-tab-group>
          <!-- Onglet Ventes -->
          <mat-tab label="Ventes & Revenus">
            <div class="tab-content">
              <div class="charts-grid">
                <!-- Graphique Revenus -->
                <mat-card class="chart-card">
                  <mat-card-header>
                    <mat-card-title>Évolution des Revenus</mat-card-title>
                    <mat-card-subtitle>{{ selectedPeriodLabel }}</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="chart-container">
                      <div class="simple-chart">
                        <div class="chart-title">Évolution des Revenus</div>
                        <div class="chart-bars">
                          @for (data of revenueChartData.datasets[0].data; track $index) {
                            <div class="bar-container">
                              <div class="bar" [style.height.%]="(data / getMaxValue(revenueChartData.datasets[0].data)) * 100">
                                <span class="bar-value">{{ data | currency:'XOF':'symbol':'1.0-0':'fr' }}</span>
                              </div>
                              <span class="bar-label">{{ revenueChartData.labels[$index] }}</span>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- Graphique Commandes -->
                <mat-card class="chart-card">
                  <mat-card-header>
                    <mat-card-title>Commandes par Jour</mat-card-title>
                    <mat-card-subtitle>{{ selectedPeriodLabel }}</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="chart-container">
                      <div class="simple-chart">
                        <div class="chart-title">Commandes par Jour</div>
                        <div class="chart-bars">
                          @for (data of ordersChartData.datasets[0].data; track $index) {
                            <div class="bar-container">
                              <div class="bar" [style.height.%]="(data / getMaxValue(ordersChartData.datasets[0].data)) * 100">
                                <span class="bar-value">{{ data }}</span>
                              </div>
                              <span class="bar-label">{{ ordersChartData.labels[$index] }}</span>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>

              <!-- Top Produits -->
              <mat-card class="top-products-card">
                <mat-card-header>
                  <mat-card-title>Top 10 Produits</mat-card-title>
                  <mat-card-subtitle>Meilleurs vendeurs</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="top-products-list">
                    @for (product of topProducts; track product.name; let i = $index) {
                      <div class="product-item">
                        <div class="product-rank">{{ i + 1 }}</div>
                        <div class="product-image">
                          <img [src]="product.image" [alt]="product.name">
                        </div>
                        <div class="product-info">
                          <div class="product-name">{{ product.name }}</div>
                          <div class="product-stats">
                            <span>{{ product.sales }} ventes</span>
                            <span>{{ product.revenue | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
                            <span>{{ product.views }} vues</span>
                          </div>
                        </div>
                        <div class="product-conversion">
                          <mat-progress-bar 
                            mode="determinate" 
                            [value]="product.conversion"
                            [color]="product.conversion > 5 ? 'primary' : 'accent'">
                          </mat-progress-bar>
                          <span class="conversion-text">{{ product.conversion }}% conversion</span>
                        </div>
                      </div>
                    }
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Onglet Clients -->
          <mat-tab label="Clients & Comportement">
            <div class="tab-content">
              <!-- Top Clients -->
              <mat-card class="top-customers-card">
                <mat-card-header>
                  <mat-card-title>Top 10 Clients</mat-card-title>
                  <mat-card-subtitle>Clients les plus actifs</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="customers-list">
                    @for (customer of topCustomers; track customer.name; let i = $index) {
                      <div class="customer-item">
                        <div class="customer-rank">{{ i + 1 }}</div>
                        <div class="customer-avatar">
                          @if (customer.avatar) {
                            <img [src]="customer.avatar" [alt]="customer.name">
                          } @else {
                            <mat-icon>person</mat-icon>
                          }
                        </div>
                        <div class="customer-info">
                          <div class="customer-name">{{ customer.name }}</div>
                          <div class="customer-stats">
                            <span>{{ customer.orders }} commandes</span>
                            <span>{{ customer.totalSpent | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
                          </div>
                        </div>
                        <div class="customer-last-order">
                          <small>Dernière commande: {{ customer.lastOrder }}</small>
                        </div>
                      </div>
                    }
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Analyse Géographique -->
              <mat-card class="geographic-card">
                <mat-card-header>
                  <mat-card-title>Ventes par Région</mat-card-title>
                  <mat-card-subtitle>Répartition géographique</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="geographic-list">
                    @for (region of geographicData; track region.region) {
                      <div class="region-item">
                        <div class="region-info">
                          <span class="region-name">{{ region.region }}</span>
                          <span class="region-stats">{{ region.orders }} commandes</span>
                        </div>
                        <div class="region-sales">
                          <span class="sales-amount">{{ region.sales | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
                          <span class="sales-percentage">{{ region.percentage }}%</span>
                        </div>
                        <mat-progress-bar 
                          mode="determinate" 
                          [value]="region.percentage"
                          color="primary">
                        </mat-progress-bar>
                      </div>
                    }
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Onglet Rapports -->
          <mat-tab label="Rapports & Export">
            <div class="tab-content">
              <div class="reports-grid">
                <!-- Rapport Mensuel -->
                <mat-card class="report-card">
                  <mat-card-header>
                    <mat-card-title>Rapport Mensuel</mat-card-title>
                    <mat-card-subtitle>Synthèse du mois</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="report-summary">
                      <div class="summary-item">
                        <span class="label">Revenus totaux:</span>
                        <span class="value">2,450,000 FCFA</span>
                      </div>
                      <div class="summary-item">
                        <span class="label">Commandes traitées:</span>
                        <span class="value">127</span>
                      </div>
                      <div class="summary-item">
                        <span class="label">Nouveaux clients:</span>
                        <span class="value">89</span>
                      </div>
                      <div class="summary-item">
                        <span class="label">Produits vendus:</span>
                        <span class="value">342</span>
                      </div>
                    </div>
                    <div class="report-actions">
                      <button mat-raised-button color="primary" (click)="generateReport('monthly')">
                        <mat-icon>description</mat-icon>
                        Générer PDF
                      </button>
                      <button mat-raised-button (click)="exportReport('monthly', 'csv')">
                        <mat-icon>table_chart</mat-icon>
                        Exporter CSV
                      </button>
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- Rapport Hebdomadaire -->
                <mat-card class="report-card">
                  <mat-card-header>
                    <mat-card-title>Rapport Hebdomadaire</mat-card-title>
                    <mat-card-subtitle>Synthèse de la semaine</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="report-summary">
                      <div class="summary-item">
                        <span class="label">Revenus cette semaine:</span>
                        <span class="value">580,000 FCFA</span>
                      </div>
                      <div class="summary-item">
                        <span class="label">Commandes cette semaine:</span>
                        <span class="value">28</span>
                      </div>
                      <div class="summary-item">
                        <span class="label">Nouveaux clients:</span>
                        <span class="value">15</span>
                      </div>
                      <div class="summary-item">
                        <span class="label">Produits vendus:</span>
                        <span class="value">78</span>
                      </div>
                    </div>
                    <div class="report-actions">
                      <button mat-raised-button color="primary" (click)="generateReport('weekly')">
                        <mat-icon>description</mat-icon>
                        Générer PDF
                      </button>
                      <button mat-raised-button (click)="exportReport('weekly', 'excel')">
                        <mat-icon>table_chart</mat-icon>
                        Exporter Excel
                      </button>
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- Rapport Personnalisé -->
                <mat-card class="report-card">
                  <mat-card-header>
                    <mat-card-title>Rapport Personnalisé</mat-card-title>
                    <mat-card-subtitle>Créez votre propre rapport</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="custom-report-form">
                      <div class="form-group">
                        <label>Période:</label>
                        <mat-select [(ngModel)]="customReportPeriod">
                          <mat-option value="7d">7 derniers jours</mat-option>
                          <mat-option value="30d">30 derniers jours</mat-option>
                          <mat-option value="3m">3 derniers mois</mat-option>
                          <mat-option value="6m">6 derniers mois</mat-option>
                          <mat-option value="1y">1 an</mat-option>
                        </mat-select>
                      </div>
                      <div class="form-group">
                        <label>Format:</label>
                        <mat-select [(ngModel)]="customReportFormat">
                          <mat-option value="pdf">PDF</mat-option>
                          <mat-option value="csv">CSV</mat-option>
                          <mat-option value="excel">Excel</mat-option>
                        </mat-select>
                      </div>
                      <div class="form-group">
                        <label>Inclure:</label>
                        <div class="checkbox-group">
                          <label><input type="checkbox" [(ngModel)]="includeSales"> Ventes</label>
                          <label><input type="checkbox" [(ngModel)]="includeCustomers"> Clients</label>
                          <label><input type="checkbox" [(ngModel)]="includeProducts"> Produits</label>
                          <label><input type="checkbox" [(ngModel)]="includeGeographic"> Géographie</label>
                        </div>
                      </div>
                    </div>
                    <div class="report-actions">
                      <button mat-raised-button color="primary" (click)="generateCustomReport()">
                        <mat-icon>auto_awesome</mat-icon>
                        Générer Rapport
                      </button>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .vendor-analytics {
      background: #f8fafc;
      min-height: 100vh;
    }

    .analytics-header {
      background: linear-gradient(135deg, #8B2E2E 0%, #6B1F1F 100%);
      color: white;
      padding: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-content h1 {
      font-size: 2rem;
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-content h1 mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .header-content p {
      margin: 0;
      opacity: 0.9;
    }

    .header-filters {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .header-filters mat-select {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      min-width: 200px;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      padding: 2rem;
    }

    .kpi-card {
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .kpi-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .kpi-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .kpi-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
    }

    .kpi-info h3 {
      font-size: 1.1rem;
      margin: 0 0 0.25rem 0;
      color: #1f2937;
    }

    .kpi-description {
      font-size: 0.85rem;
      color: #6b7280;
      margin: 0;
    }

    .kpi-value {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .value {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
    }

    .change {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.9rem;
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
    }

    .change-increase {
      background: #d1fae5;
      color: #065f46;
    }

    .change-decrease {
      background: #fee2e2;
      color: #991b1b;
    }

    .change-stable {
      background: #f3f4f6;
      color: #374151;
    }

    .analytics-content {
      padding: 0 2rem 2rem 2rem;
    }

    .tab-content {
      padding: 1.5rem 0;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .chart-card {
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .chart-container {
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f9fafb;
      border-radius: 8px;
    }

    .simple-chart {
      width: 100%;
      height: 100%;
      padding: 1rem;
    }

    .chart-title {
      text-align: center;
      font-weight: 600;
      color: #374151;
      margin-bottom: 1rem;
    }

    .chart-bars {
      display: flex;
      align-items: end;
      justify-content: space-around;
      height: 200px;
      gap: 0.5rem;
    }

    .bar-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      height: 100%;
    }

    .bar {
      background: linear-gradient(135deg, #8B2E2E, #D9744F);
      border-radius: 4px 4px 0 0;
      width: 100%;
      min-height: 20px;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      position: relative;
      transition: all 0.3s ease;
    }

    .bar:hover {
      background: linear-gradient(135deg, #6B1F1F, #B85A3A);
      transform: scale(1.05);
    }

    .bar-value {
      position: absolute;
      top: -25px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #374151;
      background: white;
      padding: 2px 6px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      white-space: nowrap;
    }

    .bar-label {
      margin-top: 0.5rem;
      font-size: 0.8rem;
      color: #6b7280;
      text-align: center;
    }

    .chart-placeholder {
      text-align: center;
      color: #6b7280;
    }

    .chart-placeholder mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .top-products-card,
    .top-customers-card,
    .geographic-card {
      margin-bottom: 2rem;
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .top-products-list,
    .customers-list,
    .geographic-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .product-item,
    .customer-item,
    .region-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .product-item:hover,
    .customer-item:hover,
    .region-item:hover {
      background: #f3f4f6;
      transform: translateX(4px);
    }

    .product-rank,
    .customer-rank {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #8B2E2E, #D9744F);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
    }

    .product-image,
    .customer-avatar {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .product-image img,
    .customer-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .customer-avatar mat-icon {
      font-size: 2rem;
      color: #6b7280;
    }

    .product-info,
    .customer-info {
      flex: 1;
    }

    .product-name,
    .customer-name {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.25rem;
    }

    .product-stats,
    .customer-stats {
      display: flex;
      gap: 1rem;
      font-size: 0.85rem;
      color: #6b7280;
    }

    .product-conversion {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 150px;
    }

    .conversion-text {
      font-size: 0.8rem;
      color: #6b7280;
      text-align: center;
    }

    .customer-last-order {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .region-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .region-name {
      font-weight: 600;
      color: #1f2937;
    }

    .region-stats {
      font-size: 0.85rem;
      color: #6b7280;
    }

    .region-sales {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
      min-width: 120px;
    }

    .sales-amount {
      font-weight: 700;
      color: #8B2E2E;
    }

    .sales-percentage {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .report-card {
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .report-summary {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .summary-item .label {
      color: #6b7280;
      font-size: 0.9rem;
    }

    .summary-item .value {
      font-weight: 700;
      color: #1f2937;
    }

    .report-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .custom-report-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      color: #374151;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: normal;
      cursor: pointer;
    }

    @media (max-width: 768px) {
      .analytics-header {
        flex-direction: column;
        text-align: center;
      }

      .header-filters {
        flex-direction: column;
        width: 100%;
      }

      .kpi-grid {
        grid-template-columns: 1fr;
      }

      .charts-grid {
        grid-template-columns: 1fr;
      }

      .reports-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class VendorAnalyticsComponent implements OnInit {
  Math = Math;
  isLoading = false;
  
  selectedPeriod: string = '30d';
  selectedPeriodLabel: string = '30 derniers jours';
  customReportPeriod: string = '30d';
  customReportFormat: string = 'pdf';
  includeSales: boolean = true;
  includeCustomers: boolean = true;
  includeProducts: boolean = true;
  includeGeographic: boolean = false;

  constructor(private vendorService: VendorService) {}

  // Configuration des graphiques
  revenueChartData: any = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      {
        data: [120000, 150000, 180000, 220000, 190000, 250000, 280000, 320000, 290000, 350000, 380000, 420000],
        label: 'Revenus (FCFA)',
        borderColor: '#8B2E2E',
        backgroundColor: 'rgba(139, 46, 46, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }
    ]
  };

  ordersChartData: any = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      {
        data: [12, 19, 15, 25, 22, 18, 8],
        label: 'Commandes',
        backgroundColor: 'rgba(139, 46, 46, 0.8)',
        borderColor: '#8B2E2E',
        borderWidth: 1
      }
    ]
  };


  analyticsKPIs: AnalyticsKPI[] = [
    {
      title: 'Visiteurs Uniques',
      value: '2,847',
      change: 12.5,
      changeType: 'increase',
      icon: 'people',
      color: '#4caf50',
      description: 'Visiteurs uniques ce mois'
    },
    {
      title: 'Pages Vues',
      value: '8,234',
      change: 8.3,
      changeType: 'increase',
      icon: 'visibility',
      color: '#2196f3',
      description: 'Total des pages vues'
    },
    {
      title: 'Taux de Rebond',
      value: '42.3%',
      change: -5.2,
      changeType: 'decrease',
      icon: 'trending_down',
      color: '#ff9800',
      description: 'Pourcentage de rebond'
    },
    {
      title: 'Durée Session',
      value: '3m 24s',
      change: 15.8,
      changeType: 'increase',
      icon: 'schedule',
      color: '#9c27b0',
      description: 'Durée moyenne de session'
    },
    {
      title: 'Taux Conversion',
      value: '4.7%',
      change: 2.1,
      changeType: 'increase',
      icon: 'trending_up',
      color: '#f44336',
      description: 'Taux de conversion global'
    },
    {
      title: 'Valeur Moyenne',
      value: '18,500 FCFA',
      change: 7.3,
      changeType: 'increase',
      icon: 'account_balance_wallet',
      color: '#ffc107',
      description: 'Valeur moyenne par commande'
    },
    {
      title: 'Ajout au Panier',
      value: '23.1%',
      change: 3.2,
      changeType: 'increase',
      icon: 'shopping_cart',
      color: '#795548',
      description: 'Taux d\'ajout au panier'
    },
    {
      title: 'Abandon Panier',
      value: '68.4%',
      change: -2.5,
      changeType: 'decrease',
      icon: 'remove_shopping_cart',
      color: '#607d8b',
      description: 'Taux d\'abandon du panier'
    }
  ];

  topProducts: TopProduct[] = [
    {
      name: 'Robe Ankara Élégante',
      sales: 45,
      revenue: 225000,
      views: 234,
      conversion: 19.2,
      image: '/assets/images/products/robe-1.jpg'
    },
    {
      name: 'Chemise Wax Premium',
      sales: 32,
      revenue: 192000,
      views: 189,
      conversion: 16.9,
      image: '/assets/images/products/chemise-1.jpg'
    },
    {
      name: 'Ensemble Kente Royal',
      sales: 28,
      revenue: 168000,
      views: 156,
      conversion: 17.9,
      image: '/assets/images/products/ensemble-1.jpg'
    },
    {
      name: 'Accessoires Perles',
      sales: 25,
      revenue: 125000,
      views: 198,
      conversion: 12.6,
      image: '/assets/images/products/accessoires-1.jpg'
    },
    {
      name: 'Pantalon Ankara',
      sales: 22,
      revenue: 132000,
      views: 167,
      conversion: 13.2,
      image: '/assets/images/products/pantalon-1.jpg'
    }
  ];

  topCustomers: TopCustomer[] = [
    {
      name: 'Marie Kouassi',
      orders: 8,
      totalSpent: 245000,
      lastOrder: 'Il y a 2 jours',
      avatar: '/assets/images/avatars/marie.jpg'
    },
    {
      name: 'Jean Dupont',
      orders: 6,
      totalSpent: 189000,
      lastOrder: 'Il y a 5 jours'
    },
    {
      name: 'Fatou Diallo',
      orders: 5,
      totalSpent: 156000,
      lastOrder: 'Il y a 1 semaine'
    },
    {
      name: 'Koffi Mensah',
      orders: 4,
      totalSpent: 134000,
      lastOrder: 'Il y a 3 jours'
    },
    {
      name: 'Aminata Traoré',
      orders: 3,
      totalSpent: 98000,
      lastOrder: 'Il y a 2 semaines'
    }
  ];

  geographicData: GeographicData[] = [
    {
      region: 'Lomé',
      sales: 1250000,
      orders: 67,
      percentage: 45
    },
    {
      region: 'Kara',
      sales: 680000,
      orders: 34,
      percentage: 24
    },
    {
      region: 'Sokodé',
      sales: 420000,
      orders: 21,
      percentage: 15
    },
    {
      region: 'Kpalimé',
      sales: 280000,
      orders: 14,
      percentage: 10
    },
    {
      region: 'Autres',
      sales: 170000,
      orders: 8,
      percentage: 6
    }
  ];

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.isLoading = true;
    
    // Charger les analytics depuis l'API
    this.vendorService.getAnalytics({ period: this.selectedPeriod }).subscribe({
      next: (data) => {
        // Mettre à jour les KPIs et graphiques avec les données de l'API
        console.log('📊 Analytics chargées:', data);
        this.updateAnalytics();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des analytics:', error);
        this.updateAnalytics(); // Utiliser les données mockées
        this.isLoading = false;
      }
    });
  }

  updateAnalytics(): void {
    // Mise à jour des labels selon la période sélectionnée
    const periodLabels: { [key: string]: string } = {
      'today': 'Aujourd\'hui',
      '7d': '7 derniers jours',
      '30d': '30 derniers jours',
      '3m': '3 derniers mois',
      '1y': '1 an',
      'custom': 'Période personnalisée'
    };
    
    this.selectedPeriodLabel = periodLabels[this.selectedPeriod] || '30 derniers jours';
    
    // Mise à jour des données des graphiques selon la période
    this.updateChartData();
    
    console.log('🔄 Mise à jour des analytics pour la période:', this.selectedPeriod);
    // Ici on ferait l'appel API pour récupérer les vraies données
  }

  updateChartData(): void {
    // Simulation de données différentes selon la période
    switch (this.selectedPeriod) {
      case 'today':
        this.updateTodayData();
        break;
      case '7d':
        this.updateWeeklyData();
        break;
      case '30d':
        this.updateMonthlyData();
        break;
      case '3m':
        this.updateQuarterlyData();
        break;
      case '1y':
        this.updateYearlyData();
        break;
      default:
        this.updateMonthlyData();
    }
  }

  updateTodayData(): void {
    // Données pour aujourd'hui (par heure)
    this.revenueChartData = {
      labels: ['00h', '02h', '04h', '06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'],
      datasets: [{
        data: [0, 0, 0, 0, 5000, 15000, 25000, 35000, 45000, 55000, 40000, 20000],
        label: 'Revenus (FCFA)',
        borderColor: '#8B2E2E',
        backgroundColor: 'rgba(139, 46, 46, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    };

    this.ordersChartData = {
      labels: ['00h', '02h', '04h', '06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'],
      datasets: [{
        data: [0, 0, 0, 0, 1, 3, 5, 7, 9, 11, 8, 4],
        label: 'Commandes',
        backgroundColor: 'rgba(139, 46, 46, 0.8)',
        borderColor: '#8B2E2E',
        borderWidth: 1
      }]
    };
  }

  updateWeeklyData(): void {
    // Données pour 7 derniers jours
    this.revenueChartData = {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [{
        data: [45000, 52000, 38000, 61000, 55000, 42000, 28000],
        label: 'Revenus (FCFA)',
        borderColor: '#8B2E2E',
        backgroundColor: 'rgba(139, 46, 46, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    };

    this.ordersChartData = {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [{
        data: [12, 19, 15, 25, 22, 18, 8],
        label: 'Commandes',
        backgroundColor: 'rgba(139, 46, 46, 0.8)',
        borderColor: '#8B2E2E',
        borderWidth: 1
      }]
    };
  }

  updateMonthlyData(): void {
    // Données pour 30 derniers jours (données par défaut)
    this.revenueChartData = {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
      datasets: [{
        data: [120000, 150000, 180000, 220000, 190000, 250000, 280000, 320000, 290000, 350000, 380000, 420000],
        label: 'Revenus (FCFA)',
        borderColor: '#8B2E2E',
        backgroundColor: 'rgba(139, 46, 46, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    };

    this.ordersChartData = {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [{
        data: [12, 19, 15, 25, 22, 18, 8],
        label: 'Commandes',
        backgroundColor: 'rgba(139, 46, 46, 0.8)',
        borderColor: '#8B2E2E',
        borderWidth: 1
      }]
    };
  }

  updateQuarterlyData(): void {
    // Données pour 3 derniers mois
    this.revenueChartData = {
      labels: ['Mois 1', 'Mois 2', 'Mois 3'],
      datasets: [{
        data: [850000, 920000, 1100000],
        label: 'Revenus (FCFA)',
        borderColor: '#8B2E2E',
        backgroundColor: 'rgba(139, 46, 46, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    };

    this.ordersChartData = {
      labels: ['Mois 1', 'Mois 2', 'Mois 3'],
      datasets: [{
        data: [45, 52, 68],
        label: 'Commandes',
        backgroundColor: 'rgba(139, 46, 46, 0.8)',
        borderColor: '#8B2E2E',
        borderWidth: 1
      }]
    };
  }

  updateYearlyData(): void {
    // Données pour 1 an
    this.revenueChartData = {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
      datasets: [{
        data: [120000, 150000, 180000, 220000, 190000, 250000, 280000, 320000, 290000, 350000, 380000, 420000],
        label: 'Revenus (FCFA)',
        borderColor: '#8B2E2E',
        backgroundColor: 'rgba(139, 46, 46, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    };

    this.ordersChartData = {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [{
        data: [165, 198, 234, 267],
        label: 'Commandes',
        backgroundColor: 'rgba(139, 46, 46, 0.8)',
        borderColor: '#8B2E2E',
        borderWidth: 1
      }]
    };
  }

  exportReport(type?: string, format?: string): void {
    if (type && format) {
      console.log(`📥 Export du rapport ${type} en format ${format}...`);
      // Logique d'export spécifique à implémenter
    } else {
      console.log('📊 Export du rapport analytics...');
      // Logique d'export à implémenter
    }
  }

  generateReport(type: string): void {
    console.log(`📄 Génération du rapport ${type}...`);
    // Logique de génération de rapport à implémenter
  }

  generateCustomReport(): void {
    console.log('🎯 Génération du rapport personnalisé...', {
      period: this.customReportPeriod,
      format: this.customReportFormat,
      includes: {
        sales: this.includeSales,
        customers: this.includeCustomers,
        products: this.includeProducts,
        geographic: this.includeGeographic
      }
    });
    // Logique de génération de rapport personnalisé à implémenter
  }

  getMaxValue(dataArray: number[]): number {
    if (!dataArray || dataArray.length === 0) return 1;
    return Math.max(...dataArray);
  }
}
