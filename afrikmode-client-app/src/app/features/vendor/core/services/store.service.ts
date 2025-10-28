/**
 * Service pour la gestion des boutiques
 * Basé sur l'API backend /api/stores
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

import { 
  Store, 
  StoreStats, 
  StoreAnalytics, 
  StoreFilters, 
  StoreListResponse,
  StoreCreateRequest,
  StoreUpdateRequest
} from '../models/store.model';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private readonly apiUrl = `${environment.apiUrl}/stores`;
  private storesSubject = new BehaviorSubject<Store[]>([]);
  private currentStoreSubject = new BehaviorSubject<Store | null>(null);

  public stores$ = this.storesSubject.asObservable();
  public currentStore$ = this.currentStoreSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Récupérer toutes les boutiques avec filtres
   */
  getStores(filters?: StoreFilters): Observable<StoreListResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof StoreFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<StoreListResponse>(this.apiUrl, { params })
      .pipe(
        tap(response => this.storesSubject.next(response.stores)),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer une boutique par ID
   */
  getStoreById(id: string): Observable<Store> {
    return this.http.get<{ success: boolean; data: Store }>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data),
        tap(store => this.currentStoreSubject.next(store)),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer une boutique par slug
   */
  getStoreBySlug(slug: string): Observable<Store> {
    return this.http.get<{ success: boolean; data: Store }>(`${this.apiUrl}/slug/${slug}`)
      .pipe(
        map(response => response.data),
        tap(store => this.currentStoreSubject.next(store)),
        catchError(this.handleError)
      );
  }

  /**
   * Créer une nouvelle boutique
   */
  createStore(storeData: StoreCreateRequest): Observable<Store> {
    return this.http.post<{ success: boolean; data: Store }>(this.apiUrl, storeData)
      .pipe(
        map(response => response.data),
        tap(store => {
          const currentStores = this.storesSubject.value;
          this.storesSubject.next([store, ...currentStores]);
          this.currentStoreSubject.next(store);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Mettre à jour une boutique
   */
  updateStore(id: string, storeData: StoreUpdateRequest): Observable<Store> {
    return this.http.put<{ success: boolean; data: Store }>(`${this.apiUrl}/${id}`, storeData)
      .pipe(
        map(response => response.data),
        tap(store => {
          const currentStores = this.storesSubject.value;
          const index = currentStores.findIndex(s => s.id === id);
          if (index !== -1) {
            currentStores[index] = store;
            this.storesSubject.next([...currentStores]);
          }
          this.currentStoreSubject.next(store);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Supprimer une boutique
   */
  deleteStore(id: string): Observable<void> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`)
      .pipe(
        map(() => {
          const currentStores = this.storesSubject.value;
          this.storesSubject.next(currentStores.filter(s => s.id !== id));
          if (this.currentStoreSubject.value?.id === id) {
            this.currentStoreSubject.next(null);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les statistiques d'une boutique
   */
  getStoreStats(storeId: string): Observable<StoreStats> {
    return this.http.get<{ success: boolean; data: StoreStats }>(`${this.apiUrl}/${storeId}/stats`)
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
    return this.http.get<{ success: boolean; data: StoreAnalytics }>(`${this.apiUrl}/${storeId}/analytics`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Upload d'images de boutique
   */
  uploadStoreImages(storeId: string, files: File[]): Observable<{ success: boolean; data: { images: string[] } }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    return this.http.post<{ success: boolean; data: { images: string[] } }>(`${this.apiUrl}/${storeId}/images`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Suivre/Ne plus suivre une boutique
   */
  toggleFollowStore(storeId: string): Observable<{ success: boolean; following: boolean }> {
    return this.http.post<{ success: boolean; following: boolean }>(`${this.apiUrl}/${storeId}/follow`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les boutiques suivies
   */
  getFollowedStores(): Observable<Store[]> {
    return this.http.get<{ success: boolean; data: Store[] }>(`${this.apiUrl}/followed`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Rechercher des boutiques
   */
  searchStores(query: string, filters?: Partial<StoreFilters>): Observable<StoreListResponse> {
    let params = new HttpParams().set('search', query);
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof StoreFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<StoreListResponse>(`${this.apiUrl}/search`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les boutiques en vedette
   */
  getFeaturedStores(limit: number = 8): Observable<Store[]> {
    const params = new HttpParams()
      .set('featured', 'true')
      .set('limit', limit.toString());

    return this.http.get<{ success: boolean; data: Store[] }>(`${this.apiUrl}/featured`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les boutiques par localisation
   */
  getStoresByLocation(country: string, city?: string): Observable<Store[]> {
    let params = new HttpParams().set('country', country);
    if (city) {
      params = params.set('city', city);
    }

    return this.http.get<{ success: boolean; data: Store[] }>(`${this.apiUrl}/by-location/${country}`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les boutiques à proximité
   */
  getNearbyStores(latitude: number, longitude: number, radius: number = 50): Observable<Store[]> {
    const params = new HttpParams()
      .set('lat', latitude.toString())
      .set('lng', longitude.toString())
      .set('radius', radius.toString());

    return this.http.get<{ success: boolean; data: Store[] }>(`${this.apiUrl}/nearby`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Vérifier la disponibilité d'un slug
   */
  checkSlugAvailability(slug: string, storeId?: string): Observable<{ available: boolean }> {
    let params = new HttpParams().set('slug', slug);
    if (storeId) {
      params = params.set('exclude', storeId);
    }

    return this.http.get<{ success: boolean; data: { available: boolean } }>(`${this.apiUrl}/check-slug`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Mettre à jour le statut d'une boutique
   */
  updateStoreStatus(storeId: string, status: string, reason?: string): Observable<Store> {
    const body = { status, reason };
    return this.http.patch<{ success: boolean; data: Store }>(`${this.apiUrl}/${storeId}/status`, body)
      .pipe(
        map(response => response.data),
        tap(store => {
          const currentStores = this.storesSubject.value;
          const index = currentStores.findIndex(s => s.id === storeId);
          if (index !== -1) {
            currentStores[index] = store;
            this.storesSubject.next([...currentStores]);
          }
          this.currentStoreSubject.next(store);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Gestion des erreurs
   */
  private handleError(error: any): Observable<never> {
    console.error('StoreService Error:', error);
    return throwError(() => error);
  }

  /**
   * Réinitialiser les données
   */
  reset(): void {
    this.storesSubject.next([]);
    this.currentStoreSubject.next(null);
  }
}
