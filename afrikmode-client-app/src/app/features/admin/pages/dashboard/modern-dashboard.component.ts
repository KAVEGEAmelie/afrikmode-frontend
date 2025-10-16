import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Import des composants
import { KPICardComponent, KPIData } from './components/kpi-card/kpi-card.component';
import { DonutChartComponent, DonutData } from './components/donut-chart/donut-chart.component';
import { BarChartComponent, BarChartData } from './components/bar-chart/bar-chart.component';
import { TopProductsComponent, TopProduct } from './components/top-products/top-products.component';
import { DashboardFiltersComponent, FilterOption } from './components/dashboard-filters/dashboard-filters.component';

// Import du service
import { DashboardDataService, CategoryData, MonthlyData } from '../../core/services/dashboard-data.service';

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
          title="Stock par catégorie"
          [data]="stockByCategory"
          totalValue="366">
        </app-donut-chart>
        
        <app-donut-chart
          title="Valeur par catégorie"
          [data]="valueByCategory"
          totalValue="54 852€">
        </app-donut-chart>
        
        <app-donut-chart
          title="Total des entrées par catégorie"
          [data]="entriesByCategory"
          totalValue="992">
        </app-donut-chart>
        
        <app-donut-chart
          title="Valeur des entrées par catégorie"
          [data]="entriesValueByCategory"
          totalValue="291 429€">
        </app-donut-chart>
        
        <app-donut-chart
          title="Total des sorties par catégorie"
          [data]="exitsByCategory"
          totalValue="702">
        </app-donut-chart>
        
        <app-donut-chart
          title="Valeur des sorties par catégorie"
          [data]="exitsValueByCategory"
          totalValue="297 931€">
        </app-donut-chart>
      </div>

      <!-- Bottom Grid -->
      <div class="bottom-grid">
        <!-- Top Products -->
        <app-top-products
          title="Top 3 des marchandises"
          [products]="topProducts">
        </app-top-products>

        <!-- Monthly Entries Chart -->
        <app-bar-chart
          title="Total des entrées par mois"
          [data]="monthlyEntries"
          [maxValue]="450">
        </app-bar-chart>

        <!-- Monthly Entries Value Chart -->
        <app-bar-chart
          title="Valeur des entrées par mois"
          [data]="monthlyEntriesValue"
          [maxValue]="80000"
          [valueFormatter]="formatCurrency">
        </app-bar-chart>

        <!-- Products to Replenish -->
        <app-top-products
          title="Marchandises à approvisionner"
          [products]="productsToReplenish">
        </app-top-products>

        <!-- Monthly Exits Chart -->
        <app-bar-chart
          title="Total des sorties par mois"
          [data]="monthlyExits"
          [maxValue]="300">
        </app-bar-chart>

        <!-- Monthly Exits Value Chart -->
        <app-bar-chart
          title="Valeur des sorties par mois"
          [data]="monthlyExitsValue"
          [maxValue]="80000"
          [valueFormatter]="formatCurrency">
        </app-bar-chart>
      </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./modern-dashboard.component.scss']
})
export class ModernDashboardComponent implements OnInit {
  lastUpdate = '29/05/2022';
  loading = true;

  // KPI Data
  kpiData: KPIData[] = [
    {
      title: 'Stock total',
      value: '366',
      icon: 'inventory',
      color: '#5B5FED',
      trend: { value: 12, percentage: 12.5, direction: 'up' }
    },
    {
      title: 'Valeur de stock',
      value: '54 852,09 €',
      icon: 'account_balance_wallet',
      color: '#7C3AED',
      trend: { value: 8, percentage: 8.3, direction: 'up' }
    },
    {
      title: 'Total des entrées',
      value: '992',
      icon: 'shopping_cart',
      color: '#EC4899',
      trend: { value: -3, percentage: -3.2, direction: 'down' }
    },
    {
      title: 'Valeur des entrées',
      value: '291 428,95 €',
      icon: 'trending_up',
      color: '#06B6D4',
      trend: { value: 5, percentage: 5.7, direction: 'up' }
    },
    {
      title: 'Total des sorties',
      value: '702',
      icon: 'exit_to_app',
      color: '#F59E0B',
      trend: { value: 15, percentage: 15.2, direction: 'up' }
    },
    {
      title: 'Valeur des sorties',
      value: '297 931,00 €',
      icon: 'money_off',
      color: '#10B981',
      trend: { value: 7, percentage: 7.1, direction: 'up' }
    }
  ];

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

  // Donut Charts Data
  stockByCategory: DonutData[] = [
    { label: 'Biscuits', value: 254, color: '#5B5FED' },
    { label: 'Consoles', value: 70, color: '#7C3AED' },
    { label: 'Electro', value: 27, color: '#EC4899' },
    { label: 'SmartPhone', value: 15, color: '#06B6D4' }
  ];

  valueByCategory: DonutData[] = [
    { label: 'Biscuits', value: 17750, color: '#5B5FED' },
    { label: 'Consoles', value: 25792, color: '#7C3AED' },
    { label: 'Electro', value: 10589, color: '#EC4899' },
    { label: 'SmartPhone', value: 721, color: '#06B6D4' }
  ];

  entriesByCategory: DonutData[] = [
    { label: 'Biscuits', value: 562, color: '#5B5FED' },
    { label: 'Consoles', value: 189, color: '#7C3AED' },
    { label: 'Electro', value: 151, color: '#EC4899' },
    { label: 'SmartPhone', value: 90, color: '#06B6D4' }
  ];

  entriesValueByCategory: DonutData[] = [
    { label: 'Biscuits', value: 167360, color: '#5B5FED' },
    { label: 'Consoles', value: 68550, color: '#7C3AED' },
    { label: 'Electro', value: 53925, color: '#EC4899' },
    { label: 'SmartPhone', value: 1594, color: '#06B6D4' }
  ];

  exitsByCategory: DonutData[] = [
    { label: 'Biscuits', value: 338, color: '#5B5FED' },
    { label: 'Consoles', value: 147, color: '#7C3AED' },
    { label: 'Electro', value: 133, color: '#EC4899' },
    { label: 'SmartPhone', value: 84, color: '#06B6D4' }
  ];

  exitsValueByCategory: DonutData[] = [
    { label: 'Biscuits', value: 171550, color: '#5B5FED' },
    { label: 'Consoles', value: 67960, color: '#7C3AED' },
    { label: 'Electro', value: 57320, color: '#EC4899' },
    { label: 'SmartPhone', value: 1141, color: '#06B6D4' }
  ];

  // Bar Charts Data
  monthlyEntries: BarChartData[] = [
    { label: 'janv', value: 137, color: '#5B5FED' },
    { label: 'févr', value: 184, color: '#7C3AED' },
    { label: 'mars', value: 142, color: '#EC4899' },
    { label: 'avr', value: 106, color: '#06B6D4' },
    { label: 'mai', value: 423, color: '#F59E0B' }
  ];

  monthlyEntriesValue: BarChartData[] = [
    { label: 'janv', value: 51548, color: '#5B5FED' },
    { label: 'févr', value: 76664, color: '#7C3AED' },
    { label: 'mars', value: 38248, color: '#EC4899' },
    { label: 'avr', value: 48081, color: '#06B6D4' },
    { label: 'mai', value: 76047, color: '#F59E0B' }
  ];

  monthlyExits: BarChartData[] = [
    { label: 'janv', value: 71, color: '#5B5FED' },
    { label: 'févr', value: 100, color: '#7C3AED' },
    { label: 'mars', value: 187, color: '#EC4899' },
    { label: 'avr', value: 253, color: '#06B6D4' },
    { label: 'mai', value: 91, color: '#F59E0B' }
  ];

  monthlyExitsValue: BarChartData[] = [
    { label: 'janv', value: 38305, color: '#5B5FED' },
    { label: 'févr', value: 60320, color: '#7C3AED' },
    { label: 'mars', value: 69065, color: '#EC4899' },
    { label: 'avr', value: 74985, color: '#06B6D4' },
    { label: 'mai', value: 55176, color: '#F59E0B' }
  ];

  // Top Products Data
  topProducts: TopProduct[] = [
    { name: 'IPHONE 13 PRO', value: '129 500€', trend: 'up' },
    { name: 'GOOGLE PIXEL S', value: '42 010€', trend: 'up' },
    { name: 'Cuisinière CANDY', value: '35 400€', trend: 'stable' }
  ];

  productsToReplenish: TopProduct[] = [
    { name: 'Cuisinière CANDY', value: '', status: 'out-of-stock' },
    { name: 'NINTENDO SWITCH', value: '', status: 'low-stock' },
    { name: 'Réfrigérateur WHIRLPOOL', value: '', status: 'low-stock' }
  ];

  constructor(private dashboardDataService: DashboardDataService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;
    
    // Charger les données KPI
    this.dashboardDataService.getKPIData().subscribe(data => {
      this.updateKPIData(data);
    });

    // Charger les données par catégorie
    this.dashboardDataService.getCategoryData().subscribe(data => {
      this.updateCategoryData(data);
    });

    // Charger les données mensuelles
    this.dashboardDataService.getMonthlyData().subscribe(data => {
      this.updateMonthlyData(data);
    });

    // Charger les top produits
    this.dashboardDataService.getTopProducts().subscribe(data => {
      this.updateTopProducts(data);
    });

    // Charger les produits à réapprovisionner
    this.dashboardDataService.getProductsToReplenish().subscribe(data => {
      this.updateProductsToReplenish(data);
      this.loading = false;
    });
  }

  private updateKPIData(data: any): void {
    this.kpiData = [
      {
        title: 'Stock total',
        value: data.stockTotal.toString(),
        icon: 'inventory',
        color: '#5B5FED',
        trend: { value: 12, percentage: 12.5, direction: 'up' }
      },
      {
        title: 'Valeur de stock',
        value: this.formatCurrency(data.stockValue),
        icon: 'account_balance_wallet',
        color: '#7C3AED',
        trend: { value: 8, percentage: 8.3, direction: 'up' }
      },
      {
        title: 'Total des entrées',
        value: data.totalEntries.toString(),
        icon: 'shopping_cart',
        color: '#EC4899',
        trend: { value: -3, percentage: -3.2, direction: 'down' }
      },
      {
        title: 'Valeur des entrées',
        value: this.formatCurrency(data.entriesValue),
        icon: 'trending_up',
        color: '#06B6D4',
        trend: { value: 5, percentage: 5.7, direction: 'up' }
      },
      {
        title: 'Total des sorties',
        value: data.totalExits.toString(),
        icon: 'exit_to_app',
        color: '#F59E0B',
        trend: { value: 15, percentage: 15.2, direction: 'up' }
      },
      {
        title: 'Valeur des sorties',
        value: this.formatCurrency(data.exitsValue),
        icon: 'money_off',
        color: '#10B981',
        trend: { value: 7, percentage: 7.1, direction: 'up' }
      }
    ];
  }

  private updateCategoryData(data: CategoryData[]): void {
    this.stockByCategory = data.map(item => ({
      label: item.name,
      value: item.stock,
      color: this.getCategoryColor(item.name)
    }));

    this.valueByCategory = data.map(item => ({
      label: item.name,
      value: item.value,
      color: this.getCategoryColor(item.name)
    }));

    this.entriesByCategory = data.map(item => ({
      label: item.name,
      value: item.entries,
      color: this.getCategoryColor(item.name)
    }));

    this.entriesValueByCategory = data.map(item => ({
      label: item.name,
      value: item.entriesValue,
      color: this.getCategoryColor(item.name)
    }));

    this.exitsByCategory = data.map(item => ({
      label: item.name,
      value: item.exits,
      color: this.getCategoryColor(item.name)
    }));

    this.exitsValueByCategory = data.map(item => ({
      label: item.name,
      value: item.exitsValue,
      color: this.getCategoryColor(item.name)
    }));
  }

  private updateMonthlyData(data: MonthlyData[]): void {
    this.monthlyEntries = data.map(item => ({
      label: item.month,
      value: item.entries,
      color: this.getMonthColor(item.month)
    }));

    this.monthlyEntriesValue = data.map(item => ({
      label: item.month,
      value: item.entriesValue,
      color: this.getMonthColor(item.month)
    }));

    this.monthlyExits = data.map(item => ({
      label: item.month,
      value: item.exits,
      color: this.getMonthColor(item.month)
    }));

    this.monthlyExitsValue = data.map(item => ({
      label: item.month,
      value: item.exitsValue,
      color: this.getMonthColor(item.month)
    }));
  }

  private updateTopProducts(data: TopProduct[]): void {
    this.topProducts = data.map(item => ({
      name: item.name,
      value: typeof item.value === 'number' ? this.formatCurrency(item.value) : item.value.toString(),
      trend: 'up' as const
    }));
  }

  private updateProductsToReplenish(data: TopProduct[]): void {
    this.productsToReplenish = data.map(item => ({
      name: item.name,
      value: '',
      status: item.status
    }));
  }

  private getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Biscuits': '#5B5FED',
      'Consoles': '#7C3AED',
      'Electro': '#EC4899',
      'SmartPhone': '#06B6D4'
    };
    return colors[category] || '#6b7280';
  }

  private getMonthColor(month: string): string {
    const colors: { [key: string]: string } = {
      'janv': '#5B5FED',
      'févr': '#7C3AED',
      'mars': '#EC4899',
      'avr': '#06B6D4',
      'mai': '#F59E0B'
    };
    return colors[month] || '#6b7280';
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
