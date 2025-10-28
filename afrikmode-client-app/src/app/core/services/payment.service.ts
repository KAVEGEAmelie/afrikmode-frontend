// src/app/core/services/payment.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Payment, PaymentMethod, PaymentIntent } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
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

  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.baseUrl}/payments/methods`, {
      headers: this.getHeaders()
    });
  }

  addPaymentMethod(method: Partial<PaymentMethod>): Observable<PaymentMethod> {
    return this.http.post<PaymentMethod>(`${this.baseUrl}/payments/methods`, method, {
      headers: this.getHeaders()
    });
  }

  removePaymentMethod(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/payments/methods/${id}`, {
      headers: this.getHeaders()
    });
  }

  setDefaultPaymentMethod(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/payments/methods/${id}/default`, {}, {
      headers: this.getHeaders()
    });
  }

  createPaymentIntent(data: any): Observable<PaymentIntent> {
    return this.http.post<PaymentIntent>(`${this.baseUrl}/payments/intent`, data, {
      headers: this.getHeaders()
    });
  }

  confirmPayment(intentId: string, paymentMethodId: string): Observable<Payment> {
    return this.http.post<Payment>(`${this.baseUrl}/payments/confirm`, {
      intent_id: intentId,
      payment_method_id: paymentMethodId
    }, {
      headers: this.getHeaders()
    });
  }

  getPaymentHistory(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/payments/history`, {
      headers: this.getHeaders(),
      params: params
    });
  }

  refundPayment(paymentId: string, amount?: number, reason?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/payments/${paymentId}/refund`, {
      amount,
      reason
    }, {
      headers: this.getHeaders()
    });
  }
}