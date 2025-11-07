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
}
