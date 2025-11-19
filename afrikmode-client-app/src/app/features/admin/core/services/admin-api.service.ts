import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'customer' | 'vendor' | 'admin';
  status: 'active' | 'inactive' | 'suspended' | 'banned';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profilePicture?: string;
  address?: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  banner?: string;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  isVerified: boolean;
  isFeatured: boolean;
  rating: number;
  totalReviews: number;
  totalProducts: number;
  totalSales: number;
  revenue: number;
  address: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  settings: {
    currency: string;
    language: string;
    timezone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  store: {
    id: string;
    name: string;
  };
  status: 'active' | 'inactive' | 'draft' | 'out_of_stock';
  stock: number;
  images: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  views: number;
  sales: number;
  rating: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  paymentMethod: 'mobile_money' | 'cash_on_delivery' | 'bank_transfer' | 'card';
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress: Address;
  billingAddress: Address;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    image?: string;
    sku: string;
  };
  store: {
    id: string;
    name: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant?: {
    size?: string;
    color?: string;
    fabric?: string;
  };
}

export interface Address {
  street: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
  phone: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  category: 'technical' | 'billing' | 'order' | 'product' | 'general' | 'complaint';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'pending_customer' | 'resolved' | 'closed';
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  tags: string[];
  attachments: string[];
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  satisfactionRating?: number;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    type: 'customer' | 'agent' | 'system';
  };
  message: string;
  attachments: string[];
  isInternal: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  isPublic: boolean;
  applicableTo: 'all' | 'category' | 'product' | 'store';
  applicableItems: string[];
  validFrom: string;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    new: number;
    byRole: { [key: string]: number };
  };
  stores: {
    total: number;
    active: number;
    pending: number;
    verified: number;
  };
  products: {
    total: number;
    active: number;
    outOfStock: number;
    byCategory: { [key: string]: number };
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    delivered: number;
    revenue: number;
    averageOrderValue: number;
  };
  support: {
    total: number;
    open: number;
    inProgress: number;
    urgent: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private baseUrl = environment.apiUrl || 'http://localhost:3000/api';
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  public getHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  private handleError = (error: any): Observable<never> => {
    console.error('API Error:', error);
    this.loadingSubject.next(false);
    return throwError(() => error);
  }

  // Dashboard
  getDashboardStats(): Observable<DashboardStats> {
    this.loadingSubject.next(true);
    return this.http.get<ApiResponse<DashboardStats>>(`${this.baseUrl}/admin/dashboard`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data),
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  // Users Management
  getUsers(params?: any): Observable<ApiResponse<User[]>> {
    this.loadingSubject.next(true);
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<ApiResponse<User[]>>(`${this.baseUrl}/admin/users`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  getUserById(id: string): Observable<User> {
    this.loadingSubject.next(true);
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/admin/users/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data),
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  updateUser(id: string, userData: Partial<User>): Observable<User> {
    this.loadingSubject.next(true);
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/admin/users/${id}`, userData, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data),
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  deleteUser(id: string): Observable<void> {
    this.loadingSubject.next(true);
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/admin/users/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(() => {}),
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  // Stores Management
  getStores(params?: any): Observable<ApiResponse<Store[]>> {
    this.loadingSubject.next(true);
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<ApiResponse<Store[]>>(`${this.baseUrl}/admin/stores`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  getStoreById(id: string): Observable<Store> {
    this.loadingSubject.next(true);
    return this.http.get<ApiResponse<Store>>(`${this.baseUrl}/admin/stores/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data),
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  updateStore(id: string, storeData: Partial<Store>): Observable<Store> {
    this.loadingSubject.next(true);
    return this.http.put<ApiResponse<Store>>(`${this.baseUrl}/admin/stores/${id}`, storeData, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data),
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  // Products Management
  getProducts(params?: any): Observable<ApiResponse<Product[]>> {
    this.loadingSubject.next(true);
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<ApiResponse<Product[]>>(`${this.baseUrl}/admin/products`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  getProductById(id: string): Observable<Product> {
    this.loadingSubject.next(true);
    return this.http.get<ApiResponse<Product>>(`${this.baseUrl}/admin/products/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data),
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  updateProduct(id: string, productData: Partial<Product>): Observable<Product> {
    this.loadingSubject.next(true);
    return this.http.put<ApiResponse<Product>>(`${this.baseUrl}/admin/products/${id}`, productData, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data),
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  deleteProduct(id: string): Observable<any> {
    this.loadingSubject.next(true);
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/admin/products/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data || response),
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  getPendingProducts(params?: any): Observable<ApiResponse<Product[]>> {
    this.loadingSubject.next(true);
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<ApiResponse<Product[]>>(`${this.baseUrl}/admin/products/pending`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  getOutOfStockProducts(params?: any): Observable<ApiResponse<Product[]>> {
    this.loadingSubject.next(true);
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<ApiResponse<Product[]>>(`${this.baseUrl}/admin/products/out-of-stock`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  updateProductStatus(id: string, status: string): Observable<any> {
    this.loadingSubject.next(true);
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/admin/products/${id}/status`, { status }, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data || response),
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  createProduct(productData: Partial<Product> & { store_id: string }): Observable<Product> {
    this.loadingSubject.next(true);
    return this.http.post<ApiResponse<Product>>(`${this.baseUrl}/admin/products`, productData, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data),
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  // Orders Management
  getOrders(params?: any): Observable<ApiResponse<Order[]>> {
    this.loadingSubject.next(true);
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<ApiResponse<Order[]>>(`${this.baseUrl}/admin/orders`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  getOrderById(id: string): Observable<Order> {
    this.loadingSubject.next(true);
    return this.http.get<ApiResponse<Order>>(`${this.baseUrl}/admin/orders/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data),
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  updateOrderStatus(id: string, status: string): Observable<Order> {
    this.loadingSubject.next(true);
    return this.http.put<ApiResponse<Order>>(`${this.baseUrl}/admin/orders/${id}/status`, 
      { status }, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data),
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  // Support Management
  getTickets(params?: any): Observable<ApiResponse<SupportTicket[]>> {
    this.loadingSubject.next(true);
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<ApiResponse<SupportTicket[]>>(`${this.baseUrl}/admin/support/tickets`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  getTicketById(id: string): Observable<SupportTicket> {
    this.loadingSubject.next(true);
    return this.http.get<ApiResponse<SupportTicket>>(`${this.baseUrl}/admin/support/tickets/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data),
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  updateTicketStatus(id: string, status: string): Observable<SupportTicket> {
    this.loadingSubject.next(true);
    return this.http.put<ApiResponse<SupportTicket>>(`${this.baseUrl}/admin/support/tickets/${id}/status`, 
      { status }, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data),
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  // Coupons Management
  getCoupons(params?: any): Observable<ApiResponse<Coupon[]>> {
    this.loadingSubject.next(true);
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<ApiResponse<Coupon[]>>(`${this.baseUrl}/admin/coupons`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  createCoupon(couponData: Partial<Coupon>): Observable<Coupon> {
    this.loadingSubject.next(true);
    return this.http.post<ApiResponse<Coupon>>(`${this.baseUrl}/admin/coupons`, couponData, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data),
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  updateCoupon(id: string, couponData: Partial<Coupon>): Observable<Coupon> {
    this.loadingSubject.next(true);
    return this.http.put<ApiResponse<Coupon>>(`${this.baseUrl}/admin/coupons/${id}`, couponData, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data),
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  deleteCoupon(id: string): Observable<void> {
    this.loadingSubject.next(true);
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/admin/coupons/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(() => {}),
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }

  // Analytics
  getAnalyticsData(params?: any): Observable<any> {
    this.loadingSubject.next(true);
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/admin/analytics`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      map(response => response.data),
      tap(() => this.loadingSubject.next(false)),
      catchError(this.handleError)
    );
  }
}
