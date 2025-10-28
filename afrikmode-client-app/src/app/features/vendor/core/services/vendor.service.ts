/**
 * Service principal pour la gestion du module Vendor
 * Centralise tous les appels API spécifiques aux vendeurs
 * Basé sur l'API backend /api/vendor/*
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, forkJoin } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

// Import des autres services
import { ProductService } from './product.service';
import { OrderService } from './order.service';
import { StoreService } from './store.service';
import { AnalyticsService } from './analytics.service';
import { PaymentService } from './payment.service';

// Import des interfaces
import { VendorProfile, VendorDashboardData, VendorQuickStats, VendorNotification } from '../interfaces/vendor.interface';
import { Product } from '../models/product.model';
import { Order } from '../models/order.model';
import { Store } from '../models/store.model';

/**
 * Interface pour le Dashboard Vendor
 */
export interface VendorDashboard {
  stats: {
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    activeCustomers: number;
    pendingOrders: number;
    revenueGrowth: number;
    ordersGrowth: number;
    productsGrowth: number;
    averageRating: number;
  };
  recentActivities: Array<{
    id: string;
    type: 'order' | 'product' | 'payment' | 'review';
    description: string;
    date: string;
    amount?: number;
    status?: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    image: string;
    sales: number;
    revenue: number;
    change: number;
  }>;
  salesChart: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

/**
 * Interface pour les Produits Vendor
 */
export interface VendorProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  status: 'draft' | 'active' | 'inactive' | 'out_of_stock';
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

/**
 * Interface pour la réponse de la liste de produits
 */
export interface VendorProductsResponse {
  products: VendorProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private readonly apiUrl = `${environment.apiUrl}/vendor`;
  
  // BehaviorSubjects pour le state management
  private dashboardSubject = new BehaviorSubject<VendorDashboard | null>(null);
  private profileSubject = new BehaviorSubject<VendorProfile | null>(null);
  private notificationsSubject = new BehaviorSubject<VendorNotification[]>([]);
  
  // Observables publics
  public dashboard$ = this.dashboardSubject.asObservable();
  public profile$ = this.profileSubject.asObservable();
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private productService: ProductService,
    private orderService: OrderService,
    private storeService: StoreService,
    private analyticsService: AnalyticsService,
    private paymentService: PaymentService
  ) {}

  // ==================== DASHBOARD ====================

  /**
   * Récupérer le dashboard principal du vendeur
   */
  getDashboard(): Observable<VendorDashboard> {
    return this.http.get<{ success: boolean; data: VendorDashboard }>(`${this.apiUrl}/dashboard`)
      .pipe(
        map(response => response.data),
        tap(dashboard => this.dashboardSubject.next(dashboard)),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les stats rapides
   */
  getQuickStats(): Observable<VendorQuickStats> {
    return this.http.get<{ success: boolean; data: VendorQuickStats }>(`${this.apiUrl}/quick-stats`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // ==================== PRODUITS ====================

  /**
   * Récupérer tous les produits du vendeur
   */
  getProducts(filters?: any): Observable<VendorProductsResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params = params.set(key, filters[key].toString());
        }
      });
    }

    return this.http.get<VendorProductsResponse>(`${this.apiUrl}/products`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Créer un nouveau produit
   */
  createProduct(productData: any): Observable<VendorProduct> {
    // Créer un FormData pour gérer les images
    const formData = this.createProductFormData(productData);

    return this.http.post<{ success: boolean; data: VendorProduct }>(`${this.apiUrl}/products`, formData)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Mettre à jour un produit
   */
  updateProduct(productId: string, productData: any): Observable<VendorProduct> {
    const formData = this.createProductFormData(productData);

    return this.http.put<{ success: boolean; data: VendorProduct }>(`${this.apiUrl}/products/${productId}`, formData)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Supprimer un produit
   */
  deleteProduct(productId: string): Observable<void> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/products/${productId}`)
      .pipe(
        map(() => undefined),
        catchError(this.handleError)
      );
  }

  /**
   * Upload d'images de produit
   */
  uploadProductImages(productId: string, files: File[]): Observable<{ images: string[] }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    return this.http.post<{ success: boolean; data: { images: string[] } }>(`${this.apiUrl}/products/${productId}/images`, formData)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // ==================== COMMANDES ====================

  /**
   * Récupérer les commandes du vendeur
   */
  getOrders(filters?: any): Observable<any> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params = params.set(key, filters[key].toString());
        }
      });
    }

    return this.http.get<any>(`${this.apiUrl}/orders`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Mettre à jour le statut d'une commande
   */
  updateOrderStatus(orderId: string, status: string, notes?: string): Observable<Order> {
    const body = { status, notes };
    return this.http.patch<{ success: boolean; data: Order }>(`${this.apiUrl}/orders/${orderId}/status`, body)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // ==================== FINANCES ====================

  /**
   * Récupérer les données financières
   */
  getFinances(period: string = '30d'): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http.get<{ success: boolean; data: any }>(`${this.apiUrl}/finances`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Demander un paiement (payout)
   */
  requestPayout(amount: number, method: string, accountDetails: any): Observable<any> {
    const body = { amount, method, account_details: accountDetails };
    return this.http.post<{ success: boolean; data: any }>(`${this.apiUrl}/finances/payout`, body)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // ==================== PROFIL ====================

  /**
   * Récupérer le profil du vendeur
   */
  getProfile(): Observable<VendorProfile> {
    return this.http.get<{ success: boolean; data: VendorProfile }>(`${this.apiUrl}/profile`)
      .pipe(
        map(response => response.data),
        tap(profile => this.profileSubject.next(profile)),
        catchError(this.handleError)
      );
  }

  /**
   * Mettre à jour le profil
   */
  updateProfile(profileData: Partial<VendorProfile>): Observable<VendorProfile> {
    return this.http.put<{ success: boolean; data: VendorProfile }>(`${this.apiUrl}/profile`, profileData)
      .pipe(
        map(response => response.data),
        tap(profile => this.profileSubject.next(profile)),
        catchError(this.handleError)
      );
  }

  // ==================== NOTIFICATIONS ====================

  /**
   * Récupérer les notifications
   */
  getNotifications(): Observable<VendorNotification[]> {
    return this.http.get<{ success: boolean; data: VendorNotification[] }>(`${this.apiUrl}/notifications`)
      .pipe(
        map(response => response.data),
        tap(notifications => this.notificationsSubject.next(notifications)),
        catchError(this.handleError)
      );
  }

  /**
   * Marquer une notification comme lue
   */
  markNotificationAsRead(notificationId: string): Observable<void> {
    return this.http.patch<{ success: boolean }>(`${this.apiUrl}/notifications/${notificationId}/read`, {})
      .pipe(
        map(() => undefined),
        catchError(this.handleError)
      );
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  markAllNotificationsAsRead(): Observable<void> {
    return this.http.patch<{ success: boolean }>(`${this.apiUrl}/notifications/read-all`, {})
      .pipe(
        map(() => undefined),
        catchError(this.handleError)
      );
  }

  // ==================== ANALYTICS ====================

  /**
   * Récupérer les analytics du vendeur
   */
  getAnalytics(period: string = '30d'): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http.get<{ success: boolean; data: any }>(`${this.apiUrl}/analytics`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // ==================== UTILITAIRES ====================

  /**
   * Créer un FormData à partir des données du produit
   */
  private createProductFormData(productData: any): FormData {
    const formData = new FormData();

    // Données de base
    if (productData.name) formData.append('name', productData.name);
    if (productData.description) formData.append('description', productData.description);
    if (productData.shortDescription) formData.append('short_description', productData.shortDescription);
    if (productData.price) formData.append('price', productData.price.toString());
    if (productData.compareAtPrice) formData.append('compare_at_price', productData.compareAtPrice.toString());
    if (productData.sku) formData.append('sku', productData.sku);
    if (productData.status) formData.append('status', productData.status);
    if (productData.category) formData.append('category', productData.category);
    if (productData.stockQuantity !== undefined) formData.append('stock_quantity', productData.stockQuantity.toString());

    // Propriétés africaines
    if (productData.fabricType) formData.append('fabric_type', productData.fabricType);
    if (productData.genderTarget) formData.append('gender_target', productData.genderTarget);
    if (productData.ageGroup) formData.append('age_group', productData.ageGroup);
    if (productData.season) formData.append('season', productData.season);
    if (productData.occasion) formData.append('occasion', productData.occasion);
    if (productData.culturalSignificance) formData.append('cultural_significance', productData.culturalSignificance);
    
    // Artisan
    if (productData.artisanName) formData.append('artisan_name', productData.artisanName);
    if (productData.artisanStory) formData.append('artisan_story', productData.artisanStory);
    if (productData.artisanLocation) formData.append('artisan_location', productData.artisanLocation);
    
    // Booleans
    if (productData.handmade !== undefined) formData.append('handmade', productData.handmade.toString());
    if (productData.customizable !== undefined) formData.append('customizable', productData.customizable.toString());
    if (productData.featured !== undefined) formData.append('featured', productData.featured.toString());

    // Arrays
    if (productData.colorsAvailable && Array.isArray(productData.colorsAvailable)) {
      formData.append('colors_available', JSON.stringify(productData.colorsAvailable));
    }
    if (productData.sizesAvailable && Array.isArray(productData.sizesAvailable)) {
      formData.append('sizes_available', JSON.stringify(productData.sizesAvailable));
    }
    if (productData.materials && Array.isArray(productData.materials)) {
      formData.append('materials', JSON.stringify(productData.materials));
    }
    if (productData.tags && Array.isArray(productData.tags)) {
      formData.append('tags', JSON.stringify(productData.tags));
    }

    // Dimensions
    if (productData.weight) formData.append('weight', productData.weight.toString());
    if (productData.dimensions) {
      formData.append('dimensions', JSON.stringify(productData.dimensions));
    }

    // Instructions
    if (productData.careInstructions) formData.append('care_instructions', productData.careInstructions);

    // SEO
    if (productData.metaTitle) formData.append('meta_title', productData.metaTitle);
    if (productData.metaDescription) formData.append('meta_description', productData.metaDescription);

    // Images
    if (productData.imageFiles && Array.isArray(productData.imageFiles)) {
      productData.imageFiles.forEach((file: File) => {
        formData.append('images', file);
      });
    }
    
    // Images existantes
    if (productData.existingImages && Array.isArray(productData.existingImages)) {
      formData.append('existing_images', JSON.stringify(productData.existingImages));
    }

    return formData;
  }

  /**
   * Gestion des erreurs
   */
  private handleError(error: any): Observable<never> {
    console.error('VendorService Error:', error);
    
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => ({ message: errorMessage, error }));
  }

  /**
   * Réinitialiser les données
   */
  reset(): void {
    this.dashboardSubject.next(null);
    this.profileSubject.next(null);
    this.notificationsSubject.next([]);
  }
}