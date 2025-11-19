import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';

export interface VendorDashboard {
  stats: {
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    pendingOrders: number;
    activeCustomers: number;
    averageRating: number;
    revenueGrowth: number;
    ordersGrowth: number;
    productsGrowth: number;
  };
  recentActivities: any[];
  topProducts: any[];
  revenueChart: any;
  ordersChart: any;
}

export interface VendorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  storeName: string;
  description: string;
  address: string;
  city: string;
  country: string;
  status: string;
  isVerified: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  views?: number;
  sales?: number;
  averageRating?: number;
}

export interface VendorOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  items: any[];
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) {}

  // Dashboard
  getDashboard(): Observable<VendorDashboard> {
    return this.apiService.get<VendorDashboard>('vendor/dashboard');
  }

  // Profil vendeur
  getProfile(): Observable<VendorProfile> {
    return this.apiService.get<VendorProfile>('vendor/profile');
  }

  updateProfile(profile: Partial<VendorProfile>): Observable<VendorProfile> {
    return this.apiService.put<VendorProfile>('vendor/profile', profile);
  }

  // Produits
  getProducts(params?: { page?: number; limit?: number; status?: string; category?: string; search?: string }): Observable<{ products: VendorProduct[], total: number }> {
    // Par défaut, charger 50 produits par page pour de meilleures performances
    const queryParams = {
      page: params?.page || 1,
      limit: params?.limit || 50,
      ...(params?.status && { status: params.status }),
      ...(params?.category && { category: params.category }),
      ...(params?.search && { search: params.search })
    };
    
    return this.apiService.get<any>('vendor/products', queryParams).pipe(
      map((response: any) => {
        // Adapter la réponse du backend à la structure attendue par le frontend
        if (response.success && response.data) {
          return {
            products: response.data.products || [],
            total: response.data.pagination?.total || 0
          };
        }
        return { products: [], total: 0 };
      })
    );
  }

  getProduct(id: string): Observable<VendorProduct> {
    return this.apiService.get<VendorProduct>(`vendor/products/${id}`);
  }

  createProduct(product: Partial<VendorProduct>): Observable<VendorProduct> {
    return this.apiService.post<VendorProduct>('vendor/products', product);
  }

  updateProduct(id: string, product: Partial<VendorProduct>): Observable<VendorProduct> {
    return this.apiService.put<VendorProduct>(`vendor/products/${id}`, product);
  }

  deleteProduct(id: string): Observable<any> {
    return this.apiService.delete<any>(`vendor/products/${id}`);
  }

  uploadProductImages(productId: string, files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('product_images', file);
    });

    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });

    return this.http.post<any>(`${environment.apiUrl}/vendor/products/${productId}/images`, formData, {
      headers
    });
  }

  exportProducts(params?: any): Observable<Blob> {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });

    return this.http.get(`${environment.apiUrl}/vendor/products/export`, {
      headers,
      params: { ...params, format: 'csv' },
      responseType: 'blob'
    });
  }

  // Commandes
  getOrders(params?: any): Observable<{ orders: VendorOrder[], total: number }> {
    return this.apiService.get<{ orders: VendorOrder[], total: number }>('vendor/orders', params);
  }

  getOrder(id: string): Observable<VendorOrder> {
    return this.apiService.get<VendorOrder>(`vendor/orders/${id}`);
  }

  updateOrderStatus(id: string, status: string): Observable<VendorOrder> {
    return this.apiService.put<VendorOrder>(`vendor/orders/${id}/status`, { status });
  }

  exportOrders(params?: any): Observable<Blob> {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });

    return this.http.get(`${environment.apiUrl}/vendor/orders/export`, {
      headers,
      params: { ...params, format: params?.format || 'csv' },
      responseType: 'blob'
    });
  }

  // Finances
  getFinances(params?: any): Observable<any> {
    return this.apiService.get<any>('vendor/finances/revenue', params);
  }

  getBalance(): Observable<any> {
    return this.apiService.get<any>('vendor/finances/balance');
  }

  getTransactions(params?: any): Observable<any> {
    return this.apiService.get<any>('vendor/finances/transactions', params);
  }

  getPayouts(params?: any): Observable<any> {
    return this.apiService.get<any>('vendor/finances/payouts', params);
  }

  requestPayout(data: any): Observable<any> {
    return this.apiService.post<any>('vendor/finances/payouts/request', data);
  }

  exportFinancialData(params?: any): Observable<Blob> {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });

    return this.http.get(`${environment.apiUrl}/vendor/finances/export`, {
      headers,
      params: { ...params, format: 'csv' },
      responseType: 'blob'
    });
  }

  getRevenueChart(params?: any): Observable<any> {
    return this.apiService.get<any>('vendor/finances/revenue-chart', params);
  }

  // Analytics
  getAnalytics(params?: any): Observable<any> {
    return this.apiService.get<any>('vendor/analytics', params);
  }

  getSalesReport(params?: any): Observable<any> {
    return this.apiService.get<any>('vendor/analytics/sales', params);
  }

  getProductsReport(params?: any): Observable<any> {
    return this.apiService.get<any>('vendor/analytics/products', params);
  }

  // Messages
  getMessages(params?: any): Observable<any> {
    return this.apiService.get<any>('vendor/messages', params);
  }

  sendMessage(message: any): Observable<any> {
    return this.apiService.post<any>('vendor/messages', message);
  }

  // Notifications
  getNotifications(params?: any): Observable<any> {
    return this.apiService.get<any>('vendor/notifications', params);
  }

  markNotificationAsRead(id: string): Observable<any> {
    return this.apiService.put<any>(`vendor/notifications/${id}/read`, {});
  }

  markAllNotificationsAsRead(): Observable<any> {
    return this.apiService.put<any>('vendor/notifications/read-all', {});
  }

  // Avis
  getReviews(params?: any): Observable<any> {
    return this.apiService.get<any>('vendor/reviews', params);
  }

  replyToReview(reviewId: string, reply: string): Observable<any> {
    return this.apiService.post<any>(`vendor/reviews/${reviewId}/reply`, { reply });
  }

  // Stock
  getInventory(params?: any): Observable<any> {
    return this.apiService.get<any>('vendor/inventory', params);
  }

  updateStock(productId: string, stock: number): Observable<any> {
    return this.apiService.put<any>(`vendor/products/${productId}/stock`, { stock });
  }

  // Livraison
  getShippingMethods(): Observable<any> {
    return this.apiService.get<any>('vendor/shipping/methods');
  }

  updateShippingMethod(methodId: string, data: any): Observable<any> {
    return this.apiService.put<any>(`vendor/shipping/methods/${methodId}`, data);
  }

  // Fidélité
  getLoyaltyProgram(): Observable<any> {
    return this.apiService.get<any>('vendor/loyalty');
  }

  updateLoyaltyProgram(data: any): Observable<any> {
    return this.apiService.put<any>('vendor/loyalty', data);
  }

  // Marketing Campaigns
  getMarketingCampaigns(params?: any): Observable<any> {
    return this.apiService.get<any>('vendor/marketing/campaigns', params);
  }

  createMarketingCampaign(campaign: any): Observable<any> {
    return this.apiService.post<any>('vendor/marketing/campaigns', campaign);
  }

  updateMarketingCampaign(id: string, campaign: any): Observable<any> {
    return this.apiService.put<any>(`vendor/marketing/campaigns/${id}`, campaign);
  }

  deleteMarketingCampaign(id: string): Observable<any> {
    return this.apiService.delete<any>(`vendor/marketing/campaigns/${id}`);
  }

  // Coupons
  getCoupons(params?: any): Observable<any> {
    return this.apiService.get<any>('vendor/marketing/coupons', params);
  }

  createCoupon(coupon: any): Observable<any> {
    return this.apiService.post<any>('vendor/marketing/coupons', coupon);
  }

  toggleCouponStatus(id: string): Observable<any> {
    return this.apiService.patch<any>(`vendor/marketing/coupons/${id}/toggle`, {});
  }

  getMarketingStats(): Observable<any> {
    return this.apiService.get<any>('vendor/marketing/stats');
  }

  // Email Marketing
  getEmailCampaigns(): Observable<any> {
    return this.apiService.get<any>('vendor/email-marketing/campaigns');
  }

  createEmailCampaign(campaign: any): Observable<any> {
    return this.apiService.post<any>('vendor/email-marketing/campaigns', campaign);
  }

  getSubscribers(): Observable<any> {
    return this.apiService.get<any>('vendor/email-marketing/subscribers');
  }

  // Paramètres
  getSettings(): Observable<any> {
    return this.apiService.get<any>('vendor/settings');
  }

  updateSettings(settings: any): Observable<any> {
    return this.apiService.put<any>('vendor/settings', settings);
  }

  // Upload de pièces jointes pour les messages
  uploadMessageAttachment(formData: FormData): Observable<any> {
    // Utiliser directement HttpClient pour FormData (pas besoin de Content-Type header)
    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
      // Ne pas définir Content-Type, le navigateur le fera automatiquement pour FormData
    });
    
    return this.http.post<any>(`${environment.apiUrl}/vendor/messages/attachments`, formData, {
      headers
    });
  }
}

