/**
 * Service pour la gestion des produits
 * Basé sur l'API backend /api/products
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

import { 
  Product, 
  ProductFilters, 
  ProductListResponse,
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductAnalytics,
  ProductCategory
} from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/products`;
  private productsSubject = new BehaviorSubject<Product[]>([]);
  private currentProductSubject = new BehaviorSubject<Product | null>(null);
  private categoriesSubject = new BehaviorSubject<ProductCategory[]>([]);

  public products$ = this.productsSubject.asObservable();
  public currentProduct$ = this.currentProductSubject.asObservable();
  public categories$ = this.categoriesSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Récupérer tous les produits avec filtres
   */
  getProducts(filters?: ProductFilters): Observable<ProductListResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof ProductFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ProductListResponse>(this.apiUrl, { params })
      .pipe(
        tap(response => this.productsSubject.next(response.products)),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer un produit par ID
   */
  getProductById(id: string): Observable<Product> {
    return this.http.get<{ success: boolean; data: Product }>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data),
        tap(product => this.currentProductSubject.next(product)),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer un produit par slug
   */
  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<{ success: boolean; data: Product }>(`${this.apiUrl}/slug/${slug}`)
      .pipe(
        map(response => response.data),
        tap(product => this.currentProductSubject.next(product)),
        catchError(this.handleError)
      );
  }

  /**
   * Créer un nouveau produit
   */
  createProduct(productData: ProductCreateRequest): Observable<Product> {
    return this.http.post<{ success: boolean; data: Product }>(this.apiUrl, productData)
      .pipe(
        map(response => response.data),
        tap(product => {
          const currentProducts = this.productsSubject.value;
          this.productsSubject.next([product, ...currentProducts]);
          this.currentProductSubject.next(product);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Mettre à jour un produit
   */
  updateProduct(id: string, productData: ProductUpdateRequest): Observable<Product> {
    return this.http.put<{ success: boolean; data: Product }>(`${this.apiUrl}/${id}`, productData)
      .pipe(
        map(response => response.data),
        tap(product => {
          const currentProducts = this.productsSubject.value;
          const index = currentProducts.findIndex(p => p.id === id);
          if (index !== -1) {
            currentProducts[index] = product;
            this.productsSubject.next([...currentProducts]);
          }
          this.currentProductSubject.next(product);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Supprimer un produit
   */
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`)
      .pipe(
        map(() => {
          const currentProducts = this.productsSubject.value;
          this.productsSubject.next(currentProducts.filter(p => p.id !== id));
          if (this.currentProductSubject.value?.id === id) {
            this.currentProductSubject.next(null);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Rechercher des produits
   */
  searchProducts(query: string, filters?: Partial<ProductFilters>): Observable<ProductListResponse> {
    let params = new HttpParams().set('q', query);
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof ProductFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ProductListResponse>(`${this.apiUrl}/search`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les produits en vedette
   */
  getFeaturedProducts(limit: number = 12): Observable<Product[]> {
    const params = new HttpParams()
      .set('featured', 'true')
      .set('limit', limit.toString());

    return this.http.get<{ success: boolean; data: Product[] }>(`${this.apiUrl}/featured`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les produits tendances
   */
  getTrendingProducts(limit: number = 12): Observable<Product[]> {
    const params = new HttpParams()
      .set('trending', 'true')
      .set('limit', limit.toString());

    return this.http.get<{ success: boolean; data: Product[] }>(`${this.apiUrl}/trending`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les nouveaux produits
   */
  getNewProducts(limit: number = 12): Observable<Product[]> {
    const params = new HttpParams()
      .set('new', 'true')
      .set('limit', limit.toString());

    return this.http.get<{ success: boolean; data: Product[] }>(`${this.apiUrl}/new`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les produits d'une boutique
   */
  getStoreProducts(storeId: string, filters?: Partial<ProductFilters>): Observable<ProductListResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof ProductFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ProductListResponse>(`${this.apiUrl}/store/${storeId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les produits d'une catégorie
   */
  getCategoryProducts(categoryId: string, filters?: Partial<ProductFilters>): Observable<ProductListResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof ProductFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ProductListResponse>(`${this.apiUrl}/category/${categoryId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les catégories
   */
  getCategories(): Observable<ProductCategory[]> {
    return this.http.get<{ success: boolean; data: ProductCategory[] }>(`${this.apiUrl}/categories`)
      .pipe(
        map(response => response.data),
        tap(categories => this.categoriesSubject.next(categories)),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les analytics d'un produit
   */
  getProductAnalytics(productId: string, period: string = '30d'): Observable<ProductAnalytics> {
    const params = new HttpParams().set('period', period);
    return this.http.get<{ success: boolean; data: ProductAnalytics }>(`${this.apiUrl}/${productId}/analytics`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Upload d'images de produit
   */
  uploadProductImages(productId: string, files: File[]): Observable<{ success: boolean; data: { images: string[] } }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    return this.http.post<{ success: boolean; data: { images: string[] } }>(`${this.apiUrl}/${productId}/images`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Mettre à jour le stock d'un produit
   */
  updateProductStock(productId: string, variantId: string | null, quantity: number, operation: 'set' | 'add' | 'subtract' = 'set'): Observable<Product> {
    const body = { variant_id: variantId, quantity, operation };
    return this.http.patch<{ success: boolean; data: Product }>(`${this.apiUrl}/${productId}/stock`, body)
      .pipe(
        map(response => response.data),
        tap(product => {
          const currentProducts = this.productsSubject.value;
          const index = currentProducts.findIndex(p => p.id === productId);
          if (index !== -1) {
            currentProducts[index] = product;
            this.productsSubject.next([...currentProducts]);
          }
          this.currentProductSubject.next(product);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Mettre à jour le statut d'un produit
   */
  updateProductStatus(productId: string, status: string): Observable<Product> {
    const body = { status };
    return this.http.patch<{ success: boolean; data: Product }>(`${this.apiUrl}/${productId}/status`, body)
      .pipe(
        map(response => response.data),
        tap(product => {
          const currentProducts = this.productsSubject.value;
          const index = currentProducts.findIndex(p => p.id === productId);
          if (index !== -1) {
            currentProducts[index] = product;
            this.productsSubject.next([...currentProducts]);
          }
          this.currentProductSubject.next(product);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Dupliquer un produit
   */
  duplicateProduct(productId: string): Observable<Product> {
    return this.http.post<{ success: boolean; data: Product }>(`${this.apiUrl}/${productId}/duplicate`, {})
      .pipe(
        map(response => response.data),
        tap(product => {
          const currentProducts = this.productsSubject.value;
          this.productsSubject.next([product, ...currentProducts]);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Actions en lot sur les produits
   */
  bulkAction(action: string, productIds: string[], data?: any): Observable<{ success: boolean; results: any[] }> {
    const body = { action, product_ids: productIds, data };
    return this.http.post<{ success: boolean; results: any[] }>(`${this.apiUrl}/bulk-action`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Exporter des produits
   */
  exportProducts(filters: ProductFilters, format: 'csv' | 'xlsx' | 'json' = 'csv'): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof ProductFilters];
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
   * Importer des produits
   */
  importProducts(file: File): Observable<{ success: boolean; data: { imported: number; errors: any[] } }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ success: boolean; data: { imported: number; errors: any[] } }>(`${this.apiUrl}/import`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les alertes de stock
   */
  getStockAlerts(): Observable<Product[]> {
    return this.http.get<{ success: boolean; data: Product[] }>(`${this.apiUrl}/stock-alerts`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Gestion des erreurs
   */
  private handleError(error: any): Observable<never> {
    console.error('ProductService Error:', error);
    return throwError(() => error);
  }

  /**
   * Réinitialiser les données
   */
  reset(): void {
    this.productsSubject.next([]);
    this.currentProductSubject.next(null);
    this.categoriesSubject.next([]);
  }
}
