import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface VendorRequest {
  id: string;
  vendor_name: string;
  email: string;
  phone: string;
  business_name: string;
  business_type: string;
  tax_id: string;
  address: string;
  city: string;
  country: string;
  website?: string;
  description: string;
  documents: {
    business_registration?: string;
    tax_certificate?: string;
    id_card?: string;
    product_samples?: string[];
  };
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'additional_info_required';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
  notes?: string;
}

export interface StoreRequestsResponse {
  success: boolean;
  data: VendorRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StoreStatsResponse {
  success: boolean;
  data: {
    total: number;
    pending: number;
    infoRequired: number;
    active: number;
    rejected: number;
  };
}

export interface ApproveResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    status: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer toutes les demandes de boutiques
   */
  getStoreRequests(params: {
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    country?: string;
    is_verified?: boolean;
    is_featured?: boolean;
  } = {}): Observable<StoreRequestsResponse> {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      const value = (params as any)[key];
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return this.http.get<StoreRequestsResponse>(`${this.apiUrl}/stores/requests`, { params: httpParams });
  }

  /**
   * Récupérer les statistiques des demandes
   */
  getStoreStats(): Observable<StoreStatsResponse> {
    return this.http.get<StoreStatsResponse>(`${this.apiUrl}/stores/stats`);
  }

  /**
   * Approuver une demande de boutique
   */
  approveStore(storeId: string, notes?: string): Observable<ApproveResponse> {
    return this.http.patch<ApproveResponse>(
      `${this.apiUrl}/stores/${storeId}/approve`,
      { notes }
    );
  }

  /**
   * Rejeter une demande de boutique
   */
  rejectStore(storeId: string, reason: string, notes?: string): Observable<ApproveResponse> {
    return this.http.patch<ApproveResponse>(
      `${this.apiUrl}/stores/${storeId}/reject`,
      { reason, notes }
    );
  }

  /**
   * Demander des informations complémentaires
   */
  requestAdditionalInfo(storeId: string, message: string, notes?: string): Observable<ApproveResponse> {
    return this.http.patch<ApproveResponse>(
      `${this.apiUrl}/stores/${storeId}/request-info`,
      { message, notes }
    );
  }

  /**
   * Mettre à jour les notes admin
   */
  updateNotes(storeId: string, notes: string): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(
      `${this.apiUrl}/stores/${storeId}/notes`,
      { notes }
    );
  }


  /**
   * Vendor Requests Management
   */
  getVendorRequests(params: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      const value = (params as any)[key];
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });
    return this.http.get<any>(`${this.apiUrl}/vendor-requests`, { params: httpParams });
  }

  getVendorRequestById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vendor-requests/${id}`);
  }

  approveVendorRequest(id: string, data?: { subscription_plan?: string; message?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/vendor-requests/${id}/approve`, data || {});
  }

  rejectVendorRequest(id: string, reason: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/vendor-requests/${id}/reject`, { reason });
  }

  requestVendorInfo(id: string, message: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/vendor-requests/${id}/request-info`, { message });
  }

  getVendorRequestsStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vendor-requests/stats`);
  }

  /**
   * Récupérer les statistiques utilisateurs
   */
  getUsersStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/stats`);
  }

  /**
   * Récupérer les commandes admin
   */
  getOrders(params: {
    status?: string;
    payment_status?: string;
    store_id?: string;
    user_id?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      const value = (params as any)[key];
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });
    return this.http.get<any>(`${this.apiUrl}/orders`, { params: httpParams });
  }

  /**
   * Exporter les commandes
   */
  exportOrders(params: {
    status?: string;
    payment_status?: string;
    start_date?: string;
    end_date?: string;
    format?: 'csv' | 'json';
  } = {}): Observable<Blob> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      const value = (params as any)[key];
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });
    return this.http.get(`${this.apiUrl}/orders/export`, { 
      params: httpParams,
      responseType: 'blob'
    });
  }

  /**
   * Récupérer les zones de livraison
   */
  getShippingZones(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/shipping/zones`);
  }

  /**
   * Créer une zone de livraison
   */
  createShippingZone(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/shipping/zones`, data);
  }

  /**
   * Mettre à jour une zone de livraison
   */
  updateShippingZone(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/shipping/zones/${id}`, data);
  }

  /**
   * Supprimer une zone de livraison
   */
  deleteShippingZone(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/shipping/zones/${id}`);
  }

  /**
   * Récupérer les tarifs d'une zone
   */
  getShippingRates(zoneId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/shipping/zones/${zoneId}/rates`);
  }

  /**
   * Créer un tarif de livraison
   */
  createShippingRate(zoneId: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/shipping/zones/${zoneId}/rates`, data);
  }

  /**
   * Mettre à jour un tarif de livraison
   */
  updateShippingRate(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/shipping/rates/${id}`, data);
  }

  /**
   * Supprimer un tarif de livraison
   */
  deleteShippingRate(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/shipping/rates/${id}`);
  }

  /**
   * Vue d'ensemble finances
   */
  getFinancesOverview(period?: string): Observable<any> {
    const params = period ? new HttpParams().set('period', period) : undefined;
    return this.http.get<any>(`${this.apiUrl}/finances/overview`, { params });
  }

  /**
   * Graphique revenus
   */
  getFinancesRevenueChart(period?: string, groupBy?: string): Observable<any> {
    let httpParams = new HttpParams();
    if (period) httpParams = httpParams.set('period', period);
    if (groupBy) httpParams = httpParams.set('groupBy', groupBy);
    return this.http.get<any>(`${this.apiUrl}/finances/revenue-chart`, { params: httpParams });
  }

  /**
   * Détails commissions
   */
  getFinancesCommissions(params: {
    page?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
  } = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      const value = (params as any)[key];
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });
    return this.http.get<any>(`${this.apiUrl}/finances/commissions`, { params: httpParams });
  }

  /**
   * Liste versements
   */
  getFinancesPayouts(params: {
    page?: number;
    limit?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
  } = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      const value = (params as any)[key];
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });
    return this.http.get<any>(`${this.apiUrl}/finances/payouts`, { params: httpParams });
  }

  /**
   * Générer une facture
   */
  generateInvoice(data: {
    order_id?: string;
    vendor_id?: string;
    type: 'order' | 'vendor';
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/finances/invoices/generate`, data);
  }

  /**
   * Liste des factures
   */
  getInvoices(params: {
    page?: number;
    limit?: number;
    type?: string;
    start_date?: string;
    end_date?: string;
  } = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      const value = (params as any)[key];
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });
    return this.http.get<any>(`${this.apiUrl}/finances/invoices`, { params: httpParams });
  }

  /**
   * Récupérer l'historique d'une boutique
   */
  getStoreHistory(storeId: string, params?: {
    page?: number;
    limit?: number;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<any>(`${this.apiUrl}/stores/${storeId}/history`, { params: httpParams });
  }

  /**
   * Récupérer les produits d'une boutique
   */
  getStoreProducts(storeId: string, params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    featured?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<any>(`${this.apiUrl}/stores/${storeId}/products`, { params: httpParams });
  }

  /**
   * Récupérer les commandes d'une boutique
   */
  getStoreOrders(storeId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
    payment_status?: string;
    start_date?: string;
    end_date?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<any>(`${this.apiUrl}/stores/${storeId}/orders`, { params: httpParams });
  }

  /**
   * Générer un rapport inventaire
   */
  generateInventoryReport(data: {
    start_date?: string;
    end_date?: string;
    store_id?: string;
    category_id?: string;
    format?: string;
    low_stock_only?: boolean;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reports/inventory`, data);
  }

  /**
   * Récupérer les détails d'un rapport
   */
  getReportDetails(reportId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reports/${reportId}`);
  }

  /**
   * Suspendre une boutique
   */
  suspendStore(storeId: string, reason: string, notes?: string): Observable<ApproveResponse> {
    return this.http.patch<ApproveResponse>(
      `${this.apiUrl}/stores/${storeId}/suspend`,
      { reason, notes }
    );
  }

  /**
   * Réactiver une boutique suspendue
   */
  activateStore(storeId: string, notes?: string): Observable<ApproveResponse> {
    return this.http.patch<ApproveResponse>(
      `${this.apiUrl}/stores/${storeId}/activate`,
      { notes }
    );
  }

  /**
   * Supprimer une boutique
   */
  deleteStore(storeId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/stores/${storeId}`
    );
  }

  /**
   * Mettre/retirer une boutique en vedette
   */
  toggleStoreFeatured(storeId: string, isFeatured: boolean): Observable<ApproveResponse> {
    return this.http.patch<ApproveResponse>(
      `${this.apiUrl}/stores/${storeId}/featured`,
      { is_featured: isFeatured }
    );
  }

  /**
   * Récupérer les stats du dashboard admin
   */
  getDashboardStats(): Observable<{
    success: boolean;
    data: {
      totalUsers: number;
      totalStores: number;
      totalProducts: number;
      totalOrders: number;
      pendingStores: number;
      todayOrders: number;
      totalRevenue: number;
    };
  }> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`);
  }

  /**
   * USERS MANAGEMENT
   */

  /**
   * Récupérer tous les utilisateurs
   */
  getUsers(params: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Observable<{
    success: boolean;
    data: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      const value = (params as any)[key];
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return this.http.get<any>(`${this.apiUrl}/users`, { params: httpParams });
  }

  /**
   * Récupérer un utilisateur par ID
   */
  getUser(userId: string): Observable<{
    success: boolean;
    data: any;
  }> {
    return this.http.get<any>(`${this.apiUrl}/users/${userId}`);
  }

  /**
   * Créer un nouvel utilisateur
   */
  createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    status?: string;
  }): Observable<{
    success: boolean;
    message: string;
    data: any;
  }> {
    return this.http.post<any>(`${this.apiUrl}/users`, userData);
  }

  /**
   * Mettre à jour un utilisateur
   */
  updateUser(userId: string, userData: {
    name?: string;
    email?: string;
    role?: string;
    status?: string;
  }): Observable<{
    success: boolean;
    message: string;
    data: any;
  }> {
    return this.http.put<any>(`${this.apiUrl}/users/${userId}`, userData);
  }

  /**
   * Changer le statut d'un utilisateur (activer/désactiver)
   */
  updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended'): Observable<{
    success: boolean;
    message: string;
    data: any;
  }> {
    return this.http.patch<any>(`${this.apiUrl}/users/${userId}/status`, { status });
  }

  /**
   * Supprimer un utilisateur
   */
  deleteUser(userId: string): Observable<{
    success: boolean;
    message: string;
  }> {
    return this.http.delete<any>(`${this.apiUrl}/users/${userId}`);
  }

  /**
   * Obtenir les statistiques des utilisateurs
   */
  getUserStats(): Observable<{
    success: boolean;
    data: {
      total: number;
      customers: number;
      vendors: number;
      admins: number;
      active: number;
      inactive: number;
      suspended: number;
    };
  }> {
    return this.http.get<any>(`${this.apiUrl}/users/stats`);
  }

  // ============================================
  // APPEARANCE SETTINGS MANAGEMENT
  // ============================================

  /**
   * Récupérer tous les paramètres d'apparence groupés par catégorie
   */
  getAppearanceSettings(): Observable<{
    success: boolean;
    data: {
      branding: any[];
      colors: any[];
      homepage: any[];
      layout: any[];
      footer: any[];
      social: any[];
    };
    message: string;
  }> {
    return this.http.get<any>(`${this.apiUrl}/appearance/settings`);
  }

  /**
   * Mettre à jour un paramètre d'apparence unique
   */
  updateAppearanceSetting(key: string, value: any): Observable<{
    success: boolean;
    data: { key: string; value: any };
    message: string;
  }> {
    return this.http.put<any>(`${this.apiUrl}/appearance/settings/${key}`, { value });
  }

  /**
   * Mettre à jour plusieurs paramètres d'apparence en une seule fois
   */
  bulkUpdateAppearanceSettings(settings: Array<{ key: string; value: any }>): Observable<{
    success: boolean;
    message: string;
  }> {
    return this.http.put<any>(`${this.apiUrl}/appearance/settings`, { settings });
  }

  /**
   * Upload d'un fichier pour l'apparence (logo, favicon, hero image)
   */
  uploadAppearanceFile(type: 'logo' | 'logo_dark' | 'favicon' | 'hero_image', file: File): Observable<{
    success: boolean;
    data: {
      key: string;
      value: string;
      file: {
        filename: string;
        mimetype: string;
        size: number;
      };
    };
    message: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/appearance/upload/${type}`, formData);
  }

  /**
   * Réinitialiser les paramètres d'apparence aux valeurs par défaut
   */
  resetAppearanceToDefaults(): Observable<{
    success: boolean;
    message: string;
  }> {
    return this.http.post<any>(`${this.apiUrl}/appearance/reset`, {});
  }

  // ============================================
  // MEDIA MANAGEMENT
  // ============================================

  /**
   * Récupérer la liste des médias
   */
  getMediaList(params: {
    page?: number;
    limit?: number;
    type?: string;
    search?: string;
  } = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      const value = (params as any)[key];
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });
    return this.http.get<any>(`${environment.apiUrl}/media`, { params: httpParams });
  }

  /**
   * Upload d'un média
   */
  uploadMedia(file: File, metadata?: {
    title?: string;
    alt_text?: string;
    tags?: string[];
  }): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      if (metadata.title) formData.append('title', metadata.title);
      if (metadata.alt_text) formData.append('alt_text', metadata.alt_text);
      if (metadata.tags) formData.append('tags', JSON.stringify(metadata.tags));
    }
    return this.http.post<any>(`${environment.apiUrl}/media/upload`, formData);
  }

  /**
   * Supprimer un média
   */
  deleteMedia(mediaId: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/media/${mediaId}`);
  }

  /**
   * Obtenir les statistiques des médias
   */
  getMediaStats(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/media/admin/dashboard`);
  }
}
