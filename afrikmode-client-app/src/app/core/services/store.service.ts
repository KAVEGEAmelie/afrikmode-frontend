// src/app/core/services/store.service.ts
import { Injectable } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Store, PaginatedResponse, Product } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private baseUrl = environment.apiUrl;
  // Subject pour notifier quand une boutique est créée
  private storeCreatedSubject = new Subject<void>();
  public storeCreated$ = this.storeCreatedSubject.asObservable();

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
  // Peut accepter soit un objet simple, soit FormData (pour les fichiers)
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
  } | FormData): Observable<any> {
    // Si c'est FormData, ne pas utiliser getHeaders() qui définit Content-Type
    // Le navigateur le définit automatiquement avec le boundary
    if (payload instanceof FormData) {
      const token = localStorage.getItem('auth_token');
      const headers: any = {
        'Accept': 'application/json',
        'Accept-Language': localStorage.getItem('language') || 'fr'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      return this.http.post(`${this.baseUrl}/stores`, payload, {
        headers
      }).pipe(
        tap(() => {
          // Notifier qu'une boutique a été créée
          this.storeCreatedSubject.next();
        })
      );
    }

    // Sinon, utiliser les headers normaux
    return this.http.post(`${this.baseUrl}/stores`, payload, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => {
        // Notifier qu'une boutique a été créée
        this.storeCreatedSubject.next();
      })
    );
  }

  // Mettre à jour une boutique
  updateStore(storeId: string, payload: {
    name?: string;
    description?: string;
    shortDescription?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    website?: string;
    country?: string;
    region?: string;
    city?: string;
    address?: string;
    postalCode?: string;
    businessType?: string;
    returnPolicy?: string;
    shippingPolicy?: string;
    defaultLanguage?: string;
    defaultCurrency?: string;
  } | FormData): Observable<any> {
    // Si c'est FormData, ne pas utiliser getHeaders() qui définit Content-Type
    if (payload instanceof FormData) {
      const token = localStorage.getItem('auth_token');
      const headers: any = {
        'Accept': 'application/json',
        'Accept-Language': localStorage.getItem('language') || 'fr'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      return this.http.put(`${this.baseUrl}/stores/${storeId}`, payload, {
        headers
      });
    }

    // Sinon, utiliser les headers normaux
    return this.http.put(`${this.baseUrl}/stores/${storeId}`, payload, {
      headers: this.getHeaders()
    });
  }

  // Uploader les documents d'une candidature
  uploadStoreDocuments(storeId: string, documents: {
    idCard?: File;
    proofOfAddress?: File;
    businessCertificate?: File;
  }): Observable<any> {
    const formData = new FormData();
    
    if (documents.idCard) {
      formData.append('idCard', documents.idCard);
    }
    if (documents.proofOfAddress) {
      formData.append('proofOfAddress', documents.proofOfAddress);
    }
    if (documents.businessCertificate) {
      formData.append('businessCertificate', documents.businessCertificate);
    }

    const token = localStorage.getItem('auth_token');
    const headers: any = {
      'Accept': 'application/json',
      'Accept-Language': localStorage.getItem('language') || 'fr'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return this.http.post(`${this.baseUrl}/stores/${storeId}/documents`, formData, {
      headers
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

  /**
   * Récupérer la boutique de l'utilisateur connecté
   */
  getMyStore(): Observable<Store | null> {
    return this.http.get<{ success: boolean; data: Store | null }>(`${this.baseUrl}/stores/my-store`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (response.data) {
          console.log('✅ Ma boutique chargée:', response.data);
        }
        return response.data;
      }),
      catchError((error: any) => {
        console.log('ℹ️ Pas de boutique active:', error);
        return of(null);
      })
    );
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

  /**
   * Récupérer le statut des boutiques de l'utilisateur connecté
   * Utilisé pour déterminer le texte et la route du bouton vendeur dans le header
   */
  getMyStoresStatus(): Observable<{
    success: boolean;
    data: {
      buttonStatus: 'none' | 'pending' | 'active';
      buttonText: string;
      buttonRoute: string;
      storesCount: number;
      stores: any[];
      latestStore: any | null;
    };
  }> {
    return this.http.get<{
      success: boolean;
      data: {
        buttonStatus: 'none' | 'pending' | 'active';
        buttonText: string;
        buttonRoute: string;
        storesCount: number;
        stores: any[];
        latestStore: any | null;
      };
    }>(`${this.baseUrl}/stores/my/status`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Récupérer une candidature boutique par son numéro
   * @param applicationNumber - Numéro de candidature (ex: VA-20251114-1142)
   */
  getStoreApplicationByNumber(applicationNumber: string): Observable<{
    success: boolean;
    data: {
      id: string;
      name: string;
      status: string;
      applicationNumber: string;
      documents?: any;
      createdAt?: string;
      updatedAt: string;
      submittedAt?: string; // Le backend peut retourner submittedAt
    };
  }> {
    return this.http.get<{
      success: boolean;
      data: {
        id: string;
        name: string;
        status: string;
        applicationNumber: string;
        documents?: any;
        createdAt?: string;
        updatedAt: string;
        submittedAt?: string; // Le backend peut retourner submittedAt
      };
    }>(`${this.baseUrl}/stores/application/${applicationNumber}`, {
      headers: this.getHeaders()
    });
  }
}