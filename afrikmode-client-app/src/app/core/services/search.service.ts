// src/app/core/services/search.service.ts
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Product, Store, Category, Brand, PaginatedResponse } from '../models';

export interface SearchFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  location?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'popularity' | 'newest';
}

export interface SearchSuggestion {
  type: 'product' | 'category' | 'brand' | 'store';
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
}

export interface SearchResult {
  products: PaginatedResponse<Product>;
  stores: Store[];
  categories: Category[];
  brands: Brand[];
  total: number;
  query: string;
  filters: SearchFilters;
  executionTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private baseUrl = 'http://localhost:5000/api';
  private searchHistorySubject = new BehaviorSubject<string[]>([]);
  public searchHistory$ = this.searchHistorySubject.asObservable();
  private recentSearches: string[] = [];

  constructor(private http: HttpClient) {
    this.loadSearchHistory();
  }

  private getHeaders() {
    const token = localStorage.getItem('auth_token');
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((item: any) => {
              httpParams = httpParams.append(key, item.toString());
            });
          } else {
            httpParams = httpParams.set(key, value.toString());
          }
        }
      });
    }
    return httpParams;
  }

  // Recherche globale
  search(query: string, filters?: SearchFilters, page: number = 1): Observable<SearchResult> {
    const searchParams = {
      q: query,
      page: page,
      ...filters
    };

    this.addToHistory(query);

    return this.http.get<SearchResult>(`${this.baseUrl}/search`, {
      headers: this.getHeaders(),
      params: this.buildParams(searchParams)
    });
  }

  // Recherche de produits uniquement
  searchProducts(query: string, filters?: SearchFilters, page: number = 1): Observable<PaginatedResponse<Product>> {
    const searchParams = {
      q: query,
      page: page,
      ...filters
    };

    return this.http.get<PaginatedResponse<Product>>(`${this.baseUrl}/search/products`, {
      headers: this.getHeaders(),
      params: this.buildParams(searchParams)
    });
  }

  // Recherche de magasins
  searchStores(query: string, page: number = 1): Observable<PaginatedResponse<Store>> {
    return this.http.get<PaginatedResponse<Store>>(`${this.baseUrl}/search/stores`, {
      headers: this.getHeaders(),
      params: this.buildParams({ q: query, page })
    });
  }

  // Suggestions de recherche en temps réel
  getSuggestions(query: string): Observable<SearchSuggestion[]> {
    if (!query || query.trim().length < 2) {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    return this.http.get<SearchSuggestion[]>(`${this.baseUrl}/search/suggestions`, {
      headers: this.getHeaders(),
      params: this.buildParams({ q: query })
    });
  }

  // Recherche avec autocomplétion (avec debounce)
  getAutocompleteSuggestions(query: string): Observable<SearchSuggestion[]> {
    return new Observable(observer => {
      observer.next(query);
    }).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((q: any) => this.getSuggestions(q))
    );
  }

  // Recherche par code-barres
  searchByBarcode(barcode: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/search/barcode`, {
      headers: this.getHeaders(),
      params: this.buildParams({ barcode })
    });
  }

  // Recherche par image
  searchByImage(imageFile: File): Observable<Product[]> {
    const formData = new FormData();
    formData.append('image', imageFile);

    return this.http.post<Product[]>(`${this.baseUrl}/search/image`, formData, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
    });
  }

  // Recherche vocale
  searchByVoice(audioBlob: Blob): Observable<SearchResult> {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    return this.http.post<SearchResult>(`${this.baseUrl}/search/voice`, formData, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
    });
  }

  // Filtres de recherche
  getSearchFilters(): Observable<any> {
    return this.http.get(`${this.baseUrl}/search/filters`, {
      headers: this.getHeaders()
    });
  }

  // Recherches populaires
  getPopularSearches(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/search/popular`, {
      headers: this.getHeaders()
    });
  }

  // Recherches récentes de l'utilisateur
  getRecentSearches(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/search/recent`, {
      headers: this.getHeaders()
    });
  }

  // Sauvegarder une recherche
  saveSearch(query: string, filters?: SearchFilters): Observable<any> {
    return this.http.post(`${this.baseUrl}/search/save`, {
      query,
      filters
    }, { headers: this.getHeaders() });
  }

  // Supprimer une recherche sauvegardée
  deleteSavedSearch(searchId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/search/saved/${searchId}`, {
      headers: this.getHeaders()
    });
  }

  // Obtenir les recherches sauvegardées
  getSavedSearches(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/search/saved`, {
      headers: this.getHeaders()
    });
  }

  // Gestion de l'historique local
  private addToHistory(query: string): void {
    if (!query || query.trim().length < 2) return;

    const trimmedQuery = query.trim().toLowerCase();
    
    // Supprimer si déjà présent
    this.recentSearches = this.recentSearches.filter(q => q !== trimmedQuery);
    
    // Ajouter au début
    this.recentSearches.unshift(trimmedQuery);
    
    // Limiter à 10 recherches
    if (this.recentSearches.length > 10) {
      this.recentSearches = this.recentSearches.slice(0, 10);
    }
    
    this.saveSearchHistory();
    this.searchHistorySubject.next(this.recentSearches);
  }

  private saveSearchHistory(): void {
    localStorage.setItem('search_history', JSON.stringify(this.recentSearches));
  }

  private loadSearchHistory(): void {
    const saved = localStorage.getItem('search_history');
    if (saved) {
      try {
        this.recentSearches = JSON.parse(saved);
        this.searchHistorySubject.next(this.recentSearches);
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
  }

  // Effacer l'historique de recherche
  clearSearchHistory(): void {
    this.recentSearches = [];
    localStorage.removeItem('search_history');
    this.searchHistorySubject.next(this.recentSearches);
  }

  // Supprimer un élément de l'historique
  removeFromHistory(query: string): void {
    this.recentSearches = this.recentSearches.filter(q => q !== query);
    this.saveSearchHistory();
    this.searchHistorySubject.next(this.recentSearches);
  }

  // Obtenir l'historique actuel
  getSearchHistory(): string[] {
    return this.recentSearches;
  }
}