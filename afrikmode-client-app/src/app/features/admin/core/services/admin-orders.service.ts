// src/app/features/admin/core/services/admin-orders.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AdminFilters } from '../models/admin-filters.model';

@Injectable({
  providedIn: 'root'
})
export class AdminOrdersService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste des commandes avec filtres
   */
  getOrders(filters?: AdminFilters): Observable<any> {
    let params = new HttpParams().set('admin', 'true');
    
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.dateFrom) params = params.set('date_from', filters.dateFrom);
      if (filters.dateTo) params = params.set('date_to', filters.dateTo);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    }

    return this.http.get(this.apiUrl, { params });
  }

  /**
   * Récupère une commande par ID
   */
  getOrderById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  /**
   * Met à jour le statut d'une commande
   */
  updateOrderStatus(id: string, status: string, note?: string, trackingInfo?: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, {
      status,
      admin_notes: note,
      tracking_info: trackingInfo,
      notify_customer: true
    });
  }

  /**
   * Récupère l'historique d'une commande
   */
  getOrderHistory(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/history`);
  }

  /**
   * Récupère les détails de livraison
   */
  getOrderShipping(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/shipping`);
  }

  /**
   * Met à jour les informations de livraison
   */
  updateOrderShipping(id: string, shippingData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/shipping`, shippingData);
  }

  /**
   * Ajoute un numéro de suivi
   */
  addTrackingNumber(id: string, trackingNumber: string, carrier: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/tracking`, { 
      trackingNumber, 
      carrier 
    });
  }

  /**
   * Ajoute des notes admin à une commande
   */
  addOrderNotes(id: string, notes: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/notes`, {
      admin_notes: notes
    });
  }

  /**
   * Annule une commande
   */
  cancelOrder(id: string, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/cancel`, {
      reason,
      notify_customer: true
    });
  }

  /**
   * Rembourse une commande
   */
  refundOrder(id: string, amount?: number, reason?: string): Observable<any> {
    // Note: Utilise l'ID de paiement si disponible, sinon l'ID de commande
    return this.http.post(`${this.apiUrl}/${id}/refund`, {
      amount,
      reason,
      notify_customer: true
    });
  }

  /**
   * Marque une commande comme livrée
   */
  markAsDelivered(id: string, deliveryDate: Date, note?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/delivered`, {
      deliveryDate: deliveryDate.toISOString(),
      note
    });
  }

  /**
   * Envoie un email de confirmation
   */
  sendConfirmationEmail(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/send-confirmation`, {});
  }

  /**
   * Récupère les commandes par utilisateur
   */
  getOrdersByUser(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Récupère les statistiques des commandes
   */
  getOrderStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  /**
   * Récupère les rapports de commandes
   */
  getOrderReports(period: string): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http.get(`${this.apiUrl}/reports`, { params });
  }

  /**
   * Exporte les commandes
   */
  exportOrders(format: 'csv' | 'excel' = 'csv', filters?: AdminFilters): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
    }

    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }
}