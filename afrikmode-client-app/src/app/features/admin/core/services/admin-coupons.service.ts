// src/app/features/admin/core/services/admin-coupons.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AdminFilters } from '../models/admin-filters.model';

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_count: number;
  user_usage_limit?: number;
  starts_at?: string;
  expires_at?: string;
  status: 'active' | 'inactive' | 'expired';
  applies_to: 'all' | 'products' | 'categories' | 'stores';
  applicable_ids?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CouponListResponse {
  success: boolean;
  data: Coupon[];
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
export class AdminCouponsService {
  private apiUrl = `${environment.apiUrl}/coupons`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste des coupons avec filtres
   * GET /api/coupons
   */
  getCoupons(filters?: AdminFilters): Observable<CouponListResponse> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.type) params = params.set('type', filters.type);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    }

    return this.http.get<CouponListResponse>(this.apiUrl, { params });
  }

  /**
   * Récupère un coupon par ID
   * GET /api/coupons/:id
   */
  getCouponById(id: string): Observable<{ success: boolean; data: Coupon }> {
    return this.http.get<{ success: boolean; data: Coupon }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupère un coupon par code
   * GET /api/coupons/code/:code
   */
  getCouponByCode(code: string): Observable<{ success: boolean; data: Coupon }> {
    return this.http.get<{ success: boolean; data: Coupon }>(`${this.apiUrl}/code/${code}`);
  }

  /**
   * Valide un code coupon
   * POST /api/coupons/validate
   */
  validateCoupon(code: string, orderAmount: number, userId?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/validate`, {
      code,
      order_amount: orderAmount,
      user_id: userId
    });
  }

  /**
   * Crée un nouveau coupon
   * POST /api/coupons
   */
  createCoupon(couponData: Partial<Coupon>): Observable<{ success: boolean; data: Coupon }> {
    return this.http.post<{ success: boolean; data: Coupon }>(this.apiUrl, couponData);
  }

  /**
   * Met à jour un coupon
   * PUT /api/coupons/:id
   */
  updateCoupon(id: string, couponData: Partial<Coupon>): Observable<{ success: boolean; data: Coupon }> {
    return this.http.put<{ success: boolean; data: Coupon }>(`${this.apiUrl}/${id}`, couponData);
  }

  /**
   * Supprime un coupon
   * DELETE /api/coupons/:id
   */
  deleteCoupon(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Active un coupon
   */
  activateCoupon(id: string): Observable<any> {
    return this.updateCoupon(id, { status: 'active' });
  }

  /**
   * Désactive un coupon
   */
  deactivateCoupon(id: string): Observable<any> {
    return this.updateCoupon(id, { status: 'inactive' });
  }

  /**
   * Duplique un coupon
   * POST /api/coupons/:id/duplicate
   */
  duplicateCoupon(id: string): Observable<{ success: boolean; data: Coupon }> {
    return this.http.post<{ success: boolean; data: Coupon }>(`${this.apiUrl}/${id}/duplicate`, {});
  }

  /**
   * Récupère l'historique d'utilisation d'un coupon
   * GET /api/coupons/:id/usage
   */
  getCouponUsageHistory(id: string, page: number = 1, limit: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get(`${this.apiUrl}/${id}/usage`, { params });
  }

  /**
   * Récupère les statistiques des coupons
   * GET /api/coupons/stats
   */
  getCouponStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  /**
   * Exporte la liste des coupons
   * GET /api/coupons/export
   */
  exportCoupons(format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    const params = new HttpParams().set('format', format);
    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Génère un code coupon aléatoire
   */
  generateCouponCode(prefix: string = '', length: number = 8): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  /**
   * Applique un coupon à une commande
   * POST /api/coupons/apply
   */
  applyCoupon(code: string, orderId: string, userId?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/apply`, {
      code,
      order_id: orderId,
      user_id: userId
    });
  }

  /**
   * Révoque l'utilisation d'un coupon
   * POST /api/coupons/revoke
   */
  revokeCouponUsage(couponId: string, orderId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/revoke`, {
      coupon_id: couponId,
      order_id: orderId
    });
  }
}
