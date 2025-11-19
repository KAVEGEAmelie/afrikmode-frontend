// src/app/features/admin/core/services/admin-dashboard.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { DashboardStats } from '../models/dashboard-stats.model';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private apiUrl = `${environment.apiUrl}/analytics`;
  private statsSubject = new BehaviorSubject<DashboardStats | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Récupère les statistiques du dashboard
   */
  getDashboardData(period: '7d' | '30d' | '90d' | '1y' = '30d'): Observable<DashboardStats> {
    const params = new HttpParams().set('period', period);
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`, { params }).pipe(
      map(stats => {
        this.statsSubject.next(stats);
        return stats;
      })
    );
  }

  /**
   * Récupère les statistiques en temps réel
   */
  getRealtimeStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/real-time`);
  }

  /**
   * Récupère les ventes récentes
   */
  getRecentSales(limit: number = 10): Observable<any[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<any[]>(`${this.apiUrl}/recent-sales`, { params });
  }

  /**
   * Récupère les commandes récentes
   */
  getRecentOrders(limit: number = 10): Observable<any[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<any[]>(`${this.apiUrl}/recent-orders`, { params });
  }

  /**
   * Récupère les produits les plus populaires
   */
  getTopProducts(limit: number = 5): Observable<any[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<any[]>(`${this.apiUrl}/top-products`, { params });
  }

  /**
   * Récupère les données pour graphique des ventes
   */
  getSalesChartData(period: string = '7d'): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http.get(`${this.apiUrl}/sales-chart`, { params });
  }

  /**
   * Récupère l'activité récente
   */
  getRecentActivity(limit: number = 20): Observable<any[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<any[]>(`${this.apiUrl}/recent-activity`, { params });
  }

  /**
   * Observer les changements de stats (pour reactive updates)
   */
  getStatsObservable(): Observable<DashboardStats | null> {
    return this.statsSubject.asObservable();
  }

  /**
   * Récupère les métriques de performance
   */
  getPerformanceMetrics(dateRange: { start: Date; end: Date }): Observable<any> {
    const params = new HttpParams()
      .set('startDate', dateRange.start.toISOString())
      .set('endDate', dateRange.end.toISOString());
    return this.http.get(`${this.apiUrl}/performance`, { params });
  }

  /**
   * Récupère les commissions de la plateforme
   */
  getCommissionsData(period: string = '30d'): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http.get(`${this.apiUrl}/commissions`, { params });
  }

  /**
   * Récupère les paiements en attente pour les vendeurs
   */
  getPendingPayouts(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/admin/finances/pending-payouts`);
  }

  /**
   * Approuve un paiement vendeur
   */
  approvePayout(payoutId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/admin/finances/payouts/${payoutId}/approve`, {});
  }

  /**
   * Rejette un paiement vendeur
   */
  rejectPayout(payoutId: string, reason: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/admin/finances/payouts/${payoutId}/reject`, { reason });
  }

  /**
   * Exporte les données du dashboard
   */
  exportDashboardData(format: 'pdf' | 'excel' = 'pdf'): Observable<Blob> {
    const params = new HttpParams().set('format', format);
    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }
}