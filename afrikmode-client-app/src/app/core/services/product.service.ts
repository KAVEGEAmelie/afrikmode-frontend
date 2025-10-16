// src/app/core/services/product.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { 
  Product, 
  PaginatedResponse, 
  Category, 
  Brand,
  Review,
  ReviewStats,
  ApiResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtenir les headers avec authentification
   */
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

  /**
   * Construire les paramètres HTTP
   */
  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          if (Array.isArray(params[key])) {
            params[key].forEach((item: any) => {
              httpParams = httpParams.append(key, item.toString());
            });
          } else {
            httpParams = httpParams.set(key, params[key].toString());
          }
        }
      });
    }
    
    return httpParams;
  }

  /**
   * Obtenir tous les produits avec pagination et filtres
   */
  getProducts(params?: {
    page?: number;
    limit?: number;
    category_id?: string;
    brand_id?: string;
    store_id?: string;
    min_price?: number;
    max_price?: number;
    search?: string;
    sort?: string; // 'price_asc', 'price_desc', 'name_asc', 'name_desc', 'newest', 'popular'
    status?: 'active' | 'inactive' | 'out_of_stock';
    is_featured?: boolean;
    in_stock?: boolean;
    tags?: string[];
  }): Observable<PaginatedResponse<Product>> {
    return this.http.get<PaginatedResponse<Product>>(`${this.baseUrl}/products`, {
      headers: this.getHeaders(),
      params: this.buildParams(params)
    });
  }

  /**
   * Obtenir un produit par ID
   */
  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtenir un produit par slug
   */
  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/slug/${slug}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Rechercher des produits
   */
  searchProducts(query: string, filters?: {
    category_id?: string;
    brand_id?: string;
    min_price?: number;
    max_price?: number;
    in_stock?: boolean;
    page?: number;
    limit?: number;
    sort?: string;
  }): Observable<PaginatedResponse<Product>> {
    const params = { 
      search: query,
      q: query,
      ...filters 
    };
    
    return this.http.get<PaginatedResponse<Product>>(`${this.baseUrl}/products/search`, {
      headers: this.getHeaders(),
      params: this.buildParams(params)
    });
  }

  /**
   * Obtenir les produits en vedette / Featured
   */
  getFeaturedProducts(limit: number = 12): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products/featured`, {
      headers: this.getHeaders(),
      params: this.buildParams({ limit })
    });
  }

  /**
   * Obtenir les nouveaux produits / New Arrivals
   */
  getNewArrivals(limit: number = 12): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products/new-arrivals`, {
      headers: this.getHeaders(),
      params: this.buildParams({ limit })
    });
  }

  /**
   * Obtenir les produits les plus vendus / Best Sellers
   */
  getBestSellers(limit: number = 12): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products/best-sellers`, {
      headers: this.getHeaders(),
      params: this.buildParams({ limit })
    });
  }

  /**
   * Obtenir les produits en promotion / Deals
   */
  getDeals(limit: number = 12): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products/deals`, {
      headers: this.getHeaders(),
      params: this.buildParams({ limit })
    });
  }

  /**
   * Obtenir les produits similaires / Related Products
   */
  getRelatedProducts(productId: string, limit: number = 6): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products/${productId}/related`, {
      headers: this.getHeaders(),
      params: this.buildParams({ limit })
    });
  }

  /**
   * Obtenir les produits recommandés pour l'utilisateur
   */
  getRecommendedProducts(limit: number = 12): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products/recommended`, {
      headers: this.getHeaders(),
      params: this.buildParams({ limit })
    });
  }

  /**
   * Obtenir les produits récemment vus
   */
  getRecentlyViewed(limit: number = 6): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products/recently-viewed`, {
      headers: this.getHeaders(),
      params: this.buildParams({ limit })
    });
  }

  /**
   * Enregistrer une vue de produit
   */
  recordView(productId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/products/${productId}/view`, {}, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtenir les produits d'une catégorie
   */
  getCategoryProducts(categoryId: string, params?: {
    page?: number;
    limit?: number;
    sort?: string;
    min_price?: number;
    max_price?: number;
  }): Observable<PaginatedResponse<Product>> {
    return this.http.get<PaginatedResponse<Product>>(
      `${this.baseUrl}/categories/${categoryId}/products`,
      {
        headers: this.getHeaders(),
        params: this.buildParams(params)
      }
    );
  }

  /**
   * Obtenir les produits d'une boutique
   */
  getStoreProducts(storeId: string, params?: {
    page?: number;
    limit?: number;
    sort?: string;
    category_id?: string;
  }): Observable<PaginatedResponse<Product>> {
    return this.http.get<PaginatedResponse<Product>>(
      `${this.baseUrl}/stores/${storeId}/products`,
      {
        headers: this.getHeaders(),
        params: this.buildParams(params)
      }
    );
  }

  /**
   * Obtenir les produits d'une marque
   */
  getBrandProducts(brandId: string, params?: {
    page?: number;
    limit?: number;
    sort?: string;
  }): Observable<PaginatedResponse<Product>> {
    return this.http.get<PaginatedResponse<Product>>(
      `${this.baseUrl}/brands/${brandId}/products`,
      {
        headers: this.getHeaders(),
        params: this.buildParams(params)
      }
    );
  }

  /**
   * Obtenir toutes les catégories
   */
  getCategories(params?: {
    parent_id?: string;
    is_active?: boolean;
    is_featured?: boolean;
  }): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`, {
      headers: this.getHeaders(),
      params: this.buildParams(params)
    });
  }

  /**
   * Obtenir une catégorie par ID
   */
  getCategory(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/categories/${id}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtenir toutes les marques
   */
  getBrands(params?: { is_active?: boolean }): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.baseUrl}/brands`, {
      headers: this.getHeaders(),
      params: this.buildParams(params)
    });
  }

  /**
   * Obtenir une marque par ID
   */
  getBrand(id: string): Observable<Brand> {
    return this.http.get<Brand>(`${this.baseUrl}/brands/${id}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtenir les filtres disponibles pour la recherche
   */
  getProductFilters(categoryId?: string): Observable<any> {
    const params = categoryId ? { category_id: categoryId } : {};
    return this.http.get<any>(`${this.baseUrl}/products/filters`, {
      headers: this.getHeaders(),
      params: this.buildParams(params)
    });
  }

  /**
   * Obtenir les avis d'un produit
   */
  getProductReviews(productId: string, params?: {
    page?: number;
    limit?: number;
    rating?: number;
    sort?: string;
  }): Observable<PaginatedResponse<Review>> {
    return this.http.get<PaginatedResponse<Review>>(
      `${this.baseUrl}/products/${productId}/reviews`,
      {
        headers: this.getHeaders(),
        params: this.buildParams(params)
      }
    );
  }

  /**
   * Obtenir les statistiques d'avis d'un produit
   */
  getProductReviewStats(productId: string): Observable<ReviewStats> {
    return this.http.get<ReviewStats>(
      `${this.baseUrl}/products/${productId}/reviews/stats`,
      {
        headers: this.getHeaders()
      }
    );
  }

  /**
   * Ajouter un avis sur un produit
   */
  addReview(productId: string, review: {
    rating: number;
    title?: string;
    comment?: string;
    order_id?: string;
    images?: File[];
  }): Observable<Review> {
    if (review.images && review.images.length > 0) {
      // Upload avec images
      const formData = new FormData();
      formData.append('rating', review.rating.toString());
      if (review.title) formData.append('title', review.title);
      if (review.comment) formData.append('comment', review.comment);
      if (review.order_id) formData.append('order_id', review.order_id);
      
      review.images.forEach((image, index) => {
        formData.append('images', image);
      });

      const token = localStorage.getItem('auth_token');
      let headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      return this.http.post<Review>(
        `${this.baseUrl}/products/${productId}/reviews`,
        formData,
        { headers }
      );
    } else {
      // Sans images
      return this.http.post<Review>(
        `${this.baseUrl}/products/${productId}/reviews`,
        review,
        { headers: this.getHeaders() }
      );
    }
  }

  /**
   * Vérifier la disponibilité d'un produit
   */
  checkAvailability(productId: string, variantId?: string, quantity: number = 1): Observable<any> {
    return this.http.post(`${this.baseUrl}/products/${productId}/check-availability`, {
      variant_id: variantId,
      quantity
    }, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtenir les variantes d'un produit
   */
  getProductVariants(productId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/products/${productId}/variants`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Comparer des produits
   */
  compareProducts(productIds: string[]): Observable<Product[]> {
    return this.http.post<Product[]>(`${this.baseUrl}/products/compare`, {
      product_ids: productIds
    }, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtenir les tags/étiquettes disponibles
   */
  getTags(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/products/tags`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtenir les produits par tag
   */
  getProductsByTag(tag: string, params?: any): Observable<PaginatedResponse<Product>> {
    return this.http.get<PaginatedResponse<Product>>(`${this.baseUrl}/products/tag/${tag}`, {
      headers: this.getHeaders(),
      params: this.buildParams(params)
    });
  }
}