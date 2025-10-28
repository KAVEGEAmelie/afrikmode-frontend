// src/app/core/services/store.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Store, PaginatedResponse, Product } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('auth_token');
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': localStorage.getItem('language') || 'fr',
      'X-Currency': localStorage.getItem('currency') || 'XOF'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Créer une boutique (devenir vendeur)
  createStore(payload: {
    name: string;
    description: string;
    shortDescription?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    website?: string;
    country?: string;
    region?: string;
    city: string;
    address: string;
    postalCode?: string;
    businessType?: string;
    returnPolicy?: string;
    shippingPolicy?: string;
    defaultLanguage?: string;
    defaultCurrency?: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/stores`, payload, {
      headers: this.getHeaders()
    });
  }

  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return httpParams;
  }

  getStores(params?: {
    page?: number;
    limit?: number;
    category_id?: string;
    status?: string;
    is_verified?: boolean;
    featured?: boolean;
    search?: string;
  }): Observable<PaginatedResponse<Store>> {
    return this.http.get<PaginatedResponse<Store>>(`${this.baseUrl}/stores`, {
      headers: this.getHeaders(),
      params: params ? this.buildParams(params) : undefined
    });
  }

  getStore(id: string): Observable<Store> {
    return this.http.get<Store>(`${this.baseUrl}/stores/${id}`, {
      headers: this.getHeaders()
    });
  }

  getStoreBySlug(slug: string): Observable<Store> {
    return this.http.get<Store>(`${this.baseUrl}/stores/slug/${slug}`, {
      headers: this.getHeaders()
    });
  }

  getFeaturedStores(limit: number = 10): Observable<Store[]> {
    return this.http.get<Store[]>(`${this.baseUrl}/stores/featured`, {
      headers: this.getHeaders(),
      params: this.buildParams({ limit })
    });
  }

  getStoreProducts(storeId: string, params?: any): Observable<PaginatedResponse<Product>> {
    return this.http.get<PaginatedResponse<Product>>(`${this.baseUrl}/stores/${storeId}/products`, {
      headers: this.getHeaders(),
      params: params ? this.buildParams(params) : undefined
    });
  }

  followStore(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/stores/${id}/follow`, {}, {
      headers: this.getHeaders()
    });
  }

  unfollowStore(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/stores/${id}/follow`, {
      headers: this.getHeaders()
    });
  }

  isFollowing(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/stores/${id}/is-following`, {
      headers: this.getHeaders()
    });
  }

  getFollowedStores(): Observable<Store[]> {
    return this.http.get<Store[]>(`${this.baseUrl}/stores/followed`, {
      headers: this.getHeaders()
    });
  }

  getStoreStats(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/stores/${id}/stats`, {
      headers: this.getHeaders()
    });
  }

  searchStores(query: string, params?: any): Observable<PaginatedResponse<Store>> {
    const searchParams = { search: query, q: query, ...params };
    return this.http.get<PaginatedResponse<Store>>(`${this.baseUrl}/stores/search`, {
      headers: this.getHeaders(),
      params: this.buildParams(searchParams)
    });
  }
}