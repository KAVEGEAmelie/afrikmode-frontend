// src/app/features/admin/core/services/admin-stores.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AdminFilters } from '../models/admin-filters.model';

export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  owner_id: string;
  owner_name?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  verified: boolean;
  featured: boolean;
  country: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  banner_url?: string;
  average_rating?: number;
  total_reviews?: number;
  total_products?: number;
  total_sales?: number;
  follower_count?: number;
  created_at: string;
  updated_at: string;
}

export interface StoreListResponse {
  success: boolean;
  data: Store[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StoreStats {
  totalStores: number;
  activeStores: number;
  pendingStores: number;
  suspendedStores: number;
  verifiedStores: number;
  featuredStores: number;
  totalRevenue: number;
  averageRating: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminStoresService {
  private apiUrl = `${environment.apiUrl}/stores`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste des boutiques avec filtres
   * GET /api/stores
   */
  getStores(filters?: AdminFilters): Observable<StoreListResponse> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
      if (filters.country) params = params.set('country', filters.country);
      if (filters.verified !== undefined) params = params.set('verified', filters.verified.toString());
      if (filters.featured !== undefined) params = params.set('featured', filters.featured.toString());
    }

    return this.http.get<StoreListResponse>(this.apiUrl, { params });
  }

  /**
   * Récupère les boutiques en vedette
   * GET /api/stores/featured
   */
  getFeaturedStores(limit: number = 8): Observable<StoreListResponse> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<StoreListResponse>(`${this.apiUrl}/featured`, { params });
  }

  /**
   * Récupère les boutiques par pays
   * GET /api/stores/by-location/:country
   */
  getStoresByCountry(country: string): Observable<StoreListResponse> {
    return this.http.get<StoreListResponse>(`${this.apiUrl}/by-location/${country}`);
  }

  /**
   * Recherche des boutiques
   * GET /api/stores/search?q=query
   */
  searchStores(query: string, page: number = 1, limit: number = 20): Observable<StoreListResponse> {
    const params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<StoreListResponse>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Récupère une boutique par ID
   * GET /api/stores/:id
   */
  getStoreById(id: string): Observable<{ success: boolean; data: Store }> {
    return this.http.get<{ success: boolean; data: Store }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée une nouvelle boutique
   * POST /api/stores
   */
  createStore(storeData: Partial<Store>): Observable<{ success: boolean; data: Store }> {
    return this.http.post<{ success: boolean; data: Store }>(this.apiUrl, storeData);
  }

  /**
   * Met à jour une boutique
   * PUT /api/stores/:id
   */
  updateStore(id: string, storeData: Partial<Store>): Observable<{ success: boolean; data: Store }> {
    return this.http.put<{ success: boolean; data: Store }>(`${this.apiUrl}/${id}`, storeData);
  }

  /**
   * Supprime une boutique (soft delete)
   * DELETE /api/stores/:id
   */
  deleteStore(id: string, reason?: string): Observable<{ success: boolean; message: string }> {
    const body = reason ? { reason } : {};
    return this.http.request<{ success: boolean; message: string }>('delete', `${this.apiUrl}/${id}`, { body });
  }

  /**
   * Récupère les produits d'une boutique
   * GET /api/stores/:id/products
   */
  getStoreProducts(id: string, page: number = 1, limit: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get(`${this.apiUrl}/${id}/products`, { params });
  }

  /**
   * Récupère les analytics d'une boutique
   * GET /api/stores/:id/analytics
   */
  getStoreAnalytics(id: string, period?: string): Observable<any> {
    let params = new HttpParams();
    if (period) params = params.set('period', period);
    return this.http.get(`${this.apiUrl}/${id}/analytics`, { params });
  }

  /**
   * Récupère les commandes d'une boutique
   * GET /api/stores/:id/orders
   */
  getStoreOrders(id: string, page: number = 1, limit: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get(`${this.apiUrl}/${id}/orders`, { params });
  }

  /**
   * Récupère les statistiques globales des boutiques
   * GET /api/stores/stats/global
   */
  getGlobalStats(): Observable<{ success: boolean; data: StoreStats }> {
    return this.http.get<{ success: boolean; data: StoreStats }>(`${this.apiUrl}/stats/global`);
  }

  /**
   * Upload d'images pour une boutique
   * POST /api/stores/:id/images
   */
  uploadStoreImages(id: string, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/images`, formData);
  }

  /**
   * Suivre/Ne plus suivre une boutique
   * POST /api/stores/:id/follow
   */
  toggleFollowStore(id: string): Observable<{ success: boolean; following: boolean }> {
    return this.http.post<{ success: boolean; following: boolean }>(`${this.apiUrl}/${id}/follow`, {});
  }

  /**
   * Change le statut d'une boutique (Admin)
   * Note: Utilise updateStore pour changer le statut
   */
  updateStoreStatus(id: string, status: 'active' | 'inactive' | 'suspended' | 'pending', reason?: string): Observable<any> {
    return this.updateStore(id, { status });
  }

  /**
   * Vérifie une boutique (Admin)
   * Note: Utilise updateStore pour vérifier
   */
  verifyStore(id: string): Observable<any> {
    return this.updateStore(id, { verified: true });
  }

  /**
   * Rend une boutique vedette (Admin)
   * Note: Utilise updateStore pour mettre en vedette
   */
  featureStore(id: string, featured: boolean = true): Observable<any> {
    return this.updateStore(id, { featured });
  }

  /**
   * Suspend une boutique (Admin)
   */
  suspendStore(id: string, reason: string): Observable<any> {
    return this.updateStoreStatus(id, 'suspended', reason);
  }

  /**
   * Active une boutique (Admin)
   */
  activateStore(id: string): Observable<any> {
    return this.updateStoreStatus(id, 'active');
  }
}
