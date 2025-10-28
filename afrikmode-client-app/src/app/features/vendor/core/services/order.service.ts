/**
 * Service pour la gestion des commandes
 * Basé sur l'API backend /api/orders
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

import { 
  Order, 
  OrderFilters, 
  OrderListResponse,
  OrderStatusUpdate,
  OrderTracking,
  OrderAnalytics
} from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = `${environment.apiUrl}/orders`;
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private currentOrderSubject = new BehaviorSubject<Order | null>(null);

  public orders$ = this.ordersSubject.asObservable();
  public currentOrder$ = this.currentOrderSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Récupérer toutes les commandes avec filtres
   */
  getOrders(filters?: OrderFilters): Observable<OrderListResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof OrderFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<OrderListResponse>(this.apiUrl, { params })
      .pipe(
        tap(response => this.ordersSubject.next(response.orders)),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer une commande par ID
   */
  getOrderById(id: string): Observable<Order> {
    return this.http.get<{ success: boolean; data: Order }>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data),
        tap(order => this.currentOrderSubject.next(order)),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer une commande par numéro
   */
  getOrderByNumber(orderNumber: string): Observable<Order> {
    return this.http.get<{ success: boolean; data: Order }>(`${this.apiUrl}/number/${orderNumber}`)
      .pipe(
        map(response => response.data),
        tap(order => this.currentOrderSubject.next(order)),
        catchError(this.handleError)
      );
  }

  /**
   * Mettre à jour le statut d'une commande
   */
  updateOrderStatus(orderId: string, statusUpdate: OrderStatusUpdate): Observable<Order> {
    return this.http.patch<{ success: boolean; data: Order }>(`${this.apiUrl}/${orderId}/status`, statusUpdate)
      .pipe(
        map(response => response.data),
        tap(order => {
          const currentOrders = this.ordersSubject.value;
          const index = currentOrders.findIndex(o => o.id === orderId);
          if (index !== -1) {
            currentOrders[index] = order;
            this.ordersSubject.next([...currentOrders]);
          }
          this.currentOrderSubject.next(order);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Annuler une commande
   */
  cancelOrder(orderId: string, reason: string): Observable<Order> {
    const body = { reason };
    return this.http.post<{ success: boolean; data: Order }>(`${this.apiUrl}/${orderId}/cancel`, body)
      .pipe(
        map(response => response.data),
        tap(order => {
          const currentOrders = this.ordersSubject.value;
          const index = currentOrders.findIndex(o => o.id === orderId);
          if (index !== -1) {
            currentOrders[index] = order;
            this.ordersSubject.next([...currentOrders]);
          }
          this.currentOrderSubject.next(order);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer le suivi d'une commande
   */
  getOrderTracking(orderId: string): Observable<OrderTracking> {
    return this.http.get<{ success: boolean; data: OrderTracking }>(`${this.apiUrl}/${orderId}/tracking`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Mettre à jour les informations de suivi
   */
  updateOrderTracking(orderId: string, trackingData: Partial<OrderTracking>): Observable<OrderTracking> {
    return this.http.patch<{ success: boolean; data: OrderTracking }>(`${this.apiUrl}/${orderId}/tracking`, trackingData)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les commandes d'une boutique
   */
  getStoreOrders(storeId: string, filters?: Partial<OrderFilters>): Observable<OrderListResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof OrderFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<OrderListResponse>(`${this.apiUrl}/store/${storeId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les commandes par statut
   */
  getOrdersByStatus(status: string, filters?: Partial<OrderFilters>): Observable<OrderListResponse> {
    let params = new HttpParams().set('status', status);
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof OrderFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<OrderListResponse>(this.apiUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les commandes en attente
   */
  getPendingOrders(filters?: Partial<OrderFilters>): Observable<OrderListResponse> {
    return this.getOrdersByStatus('pending', filters);
  }

  /**
   * Récupérer les commandes en cours de traitement
   */
  getProcessingOrders(filters?: Partial<OrderFilters>): Observable<OrderListResponse> {
    return this.getOrdersByStatus('processing', filters);
  }

  /**
   * Récupérer les commandes expédiées
   */
  getShippedOrders(filters?: Partial<OrderFilters>): Observable<OrderListResponse> {
    return this.getOrdersByStatus('shipped', filters);
  }

  /**
   * Récupérer les commandes livrées
   */
  getDeliveredOrders(filters?: Partial<OrderFilters>): Observable<OrderListResponse> {
    return this.getOrdersByStatus('delivered', filters);
  }

  /**
   * Récupérer les commandes annulées
   */
  getCancelledOrders(filters?: Partial<OrderFilters>): Observable<OrderListResponse> {
    return this.getOrdersByStatus('cancelled', filters);
  }

  /**
   * Récupérer les analytics des commandes
   */
  getOrderAnalytics(storeId?: string, period: string = '30d'): Observable<OrderAnalytics> {
    let params = new HttpParams().set('period', period);
    if (storeId) {
      params = params.set('store_id', storeId);
    }

    return this.http.get<{ success: boolean; data: OrderAnalytics }>(`${this.apiUrl}/analytics`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer le résumé des commandes
   */
  getOrderSummary(storeId?: string, period: string = '30d'): Observable<{
    total_orders: number;
    total_revenue: number;
    average_order_value: number;
    pending_orders: number;
    processing_orders: number;
    shipped_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
  }> {
    let params = new HttpParams().set('period', period);
    if (storeId) {
      params = params.set('store_id', storeId);
    }

    return this.http.get<{ success: boolean; data: any }>(`${this.apiUrl}/summary`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Actions en lot sur les commandes
   */
  bulkAction(action: string, orderIds: string[], data?: any): Observable<{ success: boolean; results: any[] }> {
    const body = { action, order_ids: orderIds, data };
    return this.http.post<{ success: boolean; results: any[] }>(`${this.apiUrl}/bulk-action`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Mettre à jour le statut de plusieurs commandes
   */
  bulkUpdateStatus(orderIds: string[], status: string, reason?: string): Observable<{ success: boolean; results: any[] }> {
    return this.bulkAction('update_status', orderIds, { status, reason });
  }

  /**
   * Imprimer les étiquettes d'expédition
   */
  printShippingLabels(orderIds: string[]): Observable<Blob> {
    const params = new HttpParams().set('order_ids', orderIds.join(','));
    return this.http.get(`${this.apiUrl}/print-labels`, { 
      params, 
      responseType: 'blob' 
    })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Exporter des commandes
   */
  exportOrders(filters: OrderFilters, format: 'csv' | 'xlsx' | 'pdf' = 'csv'): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof OrderFilters];
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get(`${this.apiUrl}/export`, { 
      params, 
      responseType: 'blob' 
    })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Rechercher des commandes
   */
  searchOrders(query: string, filters?: Partial<OrderFilters>): Observable<OrderListResponse> {
    let params = new HttpParams().set('search', query);
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof OrderFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<OrderListResponse>(`${this.apiUrl}/search`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les commandes récentes
   */
  getRecentOrders(limit: number = 10): Observable<Order[]> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('sort', 'created_at')
      .set('order', 'desc');

    return this.http.get<{ success: boolean; data: Order[] }>(`${this.apiUrl}/recent`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les commandes du jour
   */
  getTodayOrders(): Observable<Order[]> {
    const today = new Date().toISOString().split('T')[0];
    const params = new HttpParams().set('date_from', today);

    return this.http.get<{ success: boolean; data: Order[] }>(`${this.apiUrl}/today`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les commandes en retard
   */
  getOverdueOrders(): Observable<Order[]> {
    return this.http.get<{ success: boolean; data: Order[] }>(`${this.apiUrl}/overdue`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Gestion des erreurs
   */
  private handleError(error: any): Observable<never> {
    console.error('OrderService Error:', error);
    return throwError(() => error);
  }

  /**
   * Réinitialiser les données
   */
  reset(): void {
    this.ordersSubject.next([]);
    this.currentOrderSubject.next(null);
  }
}
