// src/app/features/admin/core/services/admin-analytics.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminAnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère les analytics de ventes
   */
  getSalesAnalytics(period: string = '30d', groupBy: string = 'day'): Observable<any> {
    const params = new HttpParams()
      .set('period', period)
      .set('groupBy', groupBy);
    
    return this.http.get(`${this.apiUrl}/sales`, { params });
  }

  /**
   * Récupère les analytics de revenus
   */
  getRevenueAnalytics(period: string = '30d'): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http.get(`${this.apiUrl}/revenue`, { params });
  }

  /**
   * Récupère les analytics produits
   */
  getProductAnalytics(limit: number = 20): Observable<any> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get(`${this.apiUrl}/products`, { params });
  }

  /**
   * Récupère les analytics par catégorie
   */
  getCategoryAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories`);
  }

  /**
   * Récupère les données de trafic
   */
  getTrafficAnalytics(period: string = '30d'): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http.get(`${this.apiUrl}/traffic`, { params });
  }

  /**
   * Récupère les analytics clients/utilisateurs
   */
  getCustomerAnalytics(period: string = '30d'): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http.get(`${this.apiUrl}/customers`, { params });
  }

  /**
   * Alias pour getUserAnalytics (compatibilité)
   */
  getUserAnalytics(period: string = '30d'): Observable<any> {
    return this.getCustomerAnalytics(period);
  }

  /**
   * Récupère les données géographiques
   */
  getGeographicAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/geographic`);
  }

  /**
   * Récupère les statistiques des commandes
   */
  getOrderAnalytics(period: string = '30d'): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http.get(`${this.apiUrl}/orders`, { params });
  }

  /**
   * Récupère les données de conversion
   */
  getConversionAnalytics(period: string = '30d'): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http.get(`${this.apiUrl}/conversion`, { params });
  }

  /**
   * Récupère les données de paniers abandonnés
   */
  getAbandonedCartAnalytics(period: string = '30d'): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http.get(`${this.apiUrl}/abandoned-carts`, { params });
  }

  /**
   * Récupère les top pages
   */
  getTopPagesAnalytics(limit: number = 20): Observable<any> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get(`${this.apiUrl}/top-pages`, { params });
  }

  /**
   * Récupère les données de rétention client
   */
  getCustomerRetentionAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/customer-retention`);
  }

  /**
   * Récupère les métriques de performance
   */
  getPerformanceMetrics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/performance`);
  }

  /**
   * Récupère les données en temps réel
   */
  getRealTimeAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/realtime`);
  }

  /**
   * Génère un rapport personnalisé
   */
  generateCustomReport(config: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/custom-report`, config);
  }

  /**
   * Alias pour generateReport (compatibilité)
   */
  generateReport(reportConfig: any): Observable<any> {
    return this.generateCustomReport(reportConfig);
  }

  /**
   * Exporte les données analytics
   */
  exportAnalytics(
    type: string, 
    period: string, 
    format: 'csv' | 'excel' | 'pdf' = 'csv'
  ): Observable<Blob> {
    const params = new HttpParams()
      .set('type', type)
      .set('period', period)
      .set('format', format);

    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }
}