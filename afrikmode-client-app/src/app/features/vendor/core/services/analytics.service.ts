/**
 * Service pour la gestion des analytics et rapports
 * Basé sur l'API backend /api/analytics
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

import { 
  VendorDashboard,
  SalesAnalytics,
  ProductAnalytics,
  CustomerAnalytics,
  FinancialAnalytics,
  StoreAnalytics,
  RealTimeMetrics,
  AnalyticsFilters,
  AnalyticsExport
} from '../models/analytics.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly apiUrl = `${environment.apiUrl}/analytics`;
  private dashboardSubject = new BehaviorSubject<VendorDashboard | null>(null);
  private realTimeMetricsSubject = new BehaviorSubject<RealTimeMetrics | null>(null);

  public dashboard$ = this.dashboardSubject.asObservable();
  public realTimeMetrics$ = this.realTimeMetricsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Récupérer le dashboard principal
   */
  getDashboard(storeId?: string, period: string = '30d'): Observable<VendorDashboard> {
    let params = new HttpParams().set('period', period);
    if (storeId) {
      params = params.set('store_id', storeId);
    }

    return this.http.get<{ success: boolean; data: VendorDashboard }>(`${this.apiUrl}/dashboard`, { params })
      .pipe(
        map(response => response.data),
        tap(dashboard => this.dashboardSubject.next(dashboard)),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les analytics de ventes
   */
  getSalesAnalytics(storeId?: string, filters?: AnalyticsFilters): Observable<SalesAnalytics> {
    let params = new HttpParams();
    
    if (storeId) {
      params = params.set('store_id', storeId);
    }
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof AnalyticsFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<{ success: boolean; data: SalesAnalytics }>(`${this.apiUrl}/sales`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les analytics des produits
   */
  getProductAnalytics(storeId?: string, filters?: AnalyticsFilters): Observable<ProductAnalytics> {
    let params = new HttpParams();
    
    if (storeId) {
      params = params.set('store_id', storeId);
    }
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof AnalyticsFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<{ success: boolean; data: ProductAnalytics }>(`${this.apiUrl}/products`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les analytics des clients
   */
  getCustomerAnalytics(storeId?: string, filters?: AnalyticsFilters): Observable<CustomerAnalytics> {
    let params = new HttpParams();
    
    if (storeId) {
      params = params.set('store_id', storeId);
    }
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof AnalyticsFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<{ success: boolean; data: CustomerAnalytics }>(`${this.apiUrl}/customers`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les analytics financiers
   */
  getFinancialAnalytics(storeId?: string, filters?: AnalyticsFilters): Observable<FinancialAnalytics> {
    let params = new HttpParams();
    
    if (storeId) {
      params = params.set('store_id', storeId);
    }
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof AnalyticsFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<{ success: boolean; data: FinancialAnalytics }>(`${this.apiUrl}/financial`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les analytics d'une boutique
   */
  getStoreAnalytics(storeId: string, period: string = '30d'): Observable<StoreAnalytics> {
    const params = new HttpParams().set('period', period);
    
    return this.http.get<{ success: boolean; data: StoreAnalytics }>(`${this.apiUrl}/store/${storeId}`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les métriques en temps réel
   */
  getRealTimeMetrics(storeId?: string): Observable<RealTimeMetrics> {
    let params = new HttpParams();
    if (storeId) {
      params = params.set('store_id', storeId);
    }

    return this.http.get<{ success: boolean; data: RealTimeMetrics }>(`${this.apiUrl}/real-time`, { params })
      .pipe(
        map(response => response.data),
        tap(metrics => this.realTimeMetricsSubject.next(metrics)),
        catchError(this.handleError)
      );
  }

  /**
   * Exporter les données analytics
   */
  exportAnalytics(type: 'dashboard' | 'sales' | 'products' | 'customers' | 'financial', 
                  format: 'csv' | 'xlsx' | 'pdf' = 'csv', 
                  filters?: AnalyticsFilters): Observable<AnalyticsExport> {
    let params = new HttpParams()
      .set('type', type)
      .set('format', format);
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof AnalyticsFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<{ success: boolean; data: AnalyticsExport }>(`${this.apiUrl}/export`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Télécharger un rapport exporté
   */
  downloadReport(exportId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/${exportId}/download`, { 
      responseType: 'blob' 
    })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les KPIs principaux
   */
  getKPIs(storeId?: string, period: string = '30d'): Observable<{
    revenue: { current: number; previous: number; growth: number; trend: 'up' | 'down' | 'stable' };
    orders: { current: number; previous: number; growth: number; trend: 'up' | 'down' | 'stable' };
    products: { total: number; active: number; low_stock: number; out_of_stock: number };
    customers: { total: number; new: number; returning: number; growth: number };
  }> {
    let params = new HttpParams().set('period', period);
    if (storeId) {
      params = params.set('store_id', storeId);
    }

    return this.http.get<{ success: boolean; data: any }>(`${this.apiUrl}/kpis`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les données de graphique de ventes
   */
  getSalesChart(storeId?: string, period: string = '30d', groupBy: 'day' | 'week' | 'month' = 'day'): Observable<Array<{
    date: string;
    revenue: number;
    orders: number;
    customers: number;
  }>> {
    let params = new HttpParams()
      .set('period', period)
      .set('group_by', groupBy);
    
    if (storeId) {
      params = params.set('store_id', storeId);
    }

    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/sales-chart`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les données de graphique de revenus
   */
  getRevenueChart(storeId?: string, period: string = '30d', groupBy: 'day' | 'week' | 'month' = 'day'): Observable<Array<{
    date: string;
    gross_revenue: number;
    net_revenue: number;
    commission: number;
    fees: number;
  }>> {
    let params = new HttpParams()
      .set('period', period)
      .set('group_by', groupBy);
    
    if (storeId) {
      params = params.set('store_id', storeId);
    }

    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/revenue-chart`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les données de graphique de commandes
   */
  getOrdersChart(storeId?: string, period: string = '30d', groupBy: 'day' | 'week' | 'month' = 'day'): Observable<Array<{
    date: string;
    total_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    pending_orders: number;
  }>> {
    let params = new HttpParams()
      .set('period', period)
      .set('group_by', groupBy);
    
    if (storeId) {
      params = params.set('store_id', storeId);
    }

    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/orders-chart`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les données de graphique de clients
   */
  getCustomersChart(storeId?: string, period: string = '30d', groupBy: 'day' | 'week' | 'month' = 'day'): Observable<Array<{
    date: string;
    new_customers: number;
    returning_customers: number;
    total_customers: number;
  }>> {
    let params = new HttpParams()
      .set('period', period)
      .set('group_by', groupBy);
    
    if (storeId) {
      params = params.set('store_id', storeId);
    }

    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/customers-chart`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les données de graphique de produits
   */
  getProductsChart(storeId?: string, period: string = '30d', groupBy: 'day' | 'week' | 'month' = 'day'): Observable<Array<{
    date: string;
    views: number;
    sales: number;
    revenue: number;
  }>> {
    let params = new HttpParams()
      .set('period', period)
      .set('group_by', groupBy);
    
    if (storeId) {
      params = params.set('store_id', storeId);
    }

    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/products-chart`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les rapports prédéfinis
   */
  getPredefinedReports(): Observable<Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    parameters: any;
    created_at: string;
  }>> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/reports`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Créer un rapport personnalisé
   */
  createCustomReport(name: string, description: string, type: string, parameters: any): Observable<{
    id: string;
    name: string;
    description: string;
    type: string;
    parameters: any;
    created_at: string;
  }> {
    const body = { name, description, type, parameters };
    return this.http.post<{ success: boolean; data: any }>(`${this.apiUrl}/reports`, body)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Gestion des erreurs
   */
  private handleError(error: any): Observable<never> {
    console.error('AnalyticsService Error:', error);
    return throwError(() => error);
  }

  /**
   * Réinitialiser les données
   */
  reset(): void {
    this.dashboardSubject.next(null);
    this.realTimeMetricsSubject.next(null);
  }
}
