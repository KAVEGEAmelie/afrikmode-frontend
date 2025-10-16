// src/app/core/services/analytics.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

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

  // Dashboard Analytics
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics/dashboard`, {
      headers: this.getHeaders()
    });
  }

  // Sales Analytics
  getSalesAnalytics(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics/sales`, {
      headers: this.getHeaders(),
      params: params
    });
  }

  // Product Analytics
  getProductAnalytics(productId?: string): Observable<any> {
    const url = productId ? 
      `${this.baseUrl}/analytics/products/${productId}` : 
      `${this.baseUrl}/analytics/products`;
    
    return this.http.get(url, {
      headers: this.getHeaders()
    });
  }

  // User Analytics
  getUserAnalytics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics/users`, {
      headers: this.getHeaders()
    });
  }

  // Store Analytics
  getStoreAnalytics(storeId?: string): Observable<any> {
    const url = storeId ? 
      `${this.baseUrl}/analytics/stores/${storeId}` : 
      `${this.baseUrl}/analytics/stores`;
    
    return this.http.get(url, {
      headers: this.getHeaders()
    });
  }

  // Traffic Analytics
  getTrafficAnalytics(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics/traffic`, {
      headers: this.getHeaders(),
      params: params
    });
  }
}