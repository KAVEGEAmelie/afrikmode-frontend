// src/app/core/services/order.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Order, PaginatedResponse, TrackingInfo } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = environment.apiUrl;

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

  getOrders(params?: any): Observable<PaginatedResponse<Order>> {
    return this.http.get<PaginatedResponse<Order>>(`${this.baseUrl}/orders`, {
      headers: this.getHeaders(),
      params: params ? this.buildParams(params) : undefined
    });
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/orders/${id}`, {
      headers: this.getHeaders()
    });
  }

  createOrder(orderData: any): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders`, orderData, {
      headers: this.getHeaders()
    });
  }

  cancelOrder(id: string, reason?: string): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/orders/${id}/cancel`, { reason }, {
      headers: this.getHeaders()
    });
  }

  confirmDelivery(id: string): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/orders/${id}/confirm-delivery`, {}, {
      headers: this.getHeaders()
    });
  }

  requestReturn(id: string, items: any[], reason: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/orders/${id}/return`, { items, reason }, {
      headers: this.getHeaders()
    });
  }

  getTrackingInfo(id: string): Observable<TrackingInfo> {
    return this.http.get<TrackingInfo>(`${this.baseUrl}/orders/${id}/tracking`, {
      headers: this.getHeaders()
    });
  }

  downloadInvoice(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/orders/${id}/invoice`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  reorder(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/orders/${id}/reorder`, {}, {
      headers: this.getHeaders()
    });
  }
}