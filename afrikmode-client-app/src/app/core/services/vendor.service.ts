import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
  getProducts(params?: any): Observable<{ products: VendorProduct[], total: number }> {
    return this.apiService.get<{ products: VendorProduct[], total: number }>('vendor/products', params);
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

  // Finances
  getFinances(params?: any): Observable<any> {
    return this.apiService.get<any>('vendor/finances', params);
  }

  getTransactions(params?: any): Observable<any> {
    return this.apiService.get<any>('vendor/transactions', params);
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

