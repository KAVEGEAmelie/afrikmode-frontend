import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface Vendor {
  id: string;
  businessName: string;
  email: string;
  phone: string;
  avatar?: string;
  subscriptionPlan: 'basic' | 'pro' | 'premium';
  status: 'active' | 'suspended' | 'warning' | 'banned';
  productsCount: number;
  totalSales: number;
  revenue: number;
  rating: number;
  reviewsCount: number;
  joinedAt: Date;
  suspendedUntil?: Date;
  suspensionReason?: string;
  warnings: Warning[];
}

export interface Warning {
  id: string;
  reason: string;
  issuedAt: Date;
  issuedBy: string;
}

export interface VendorsResponse {
  vendors: Vendor[];
  total: number;
  page: number;
  limit: number;
  stats: {
    active: number;
    suspended: number;
    warning: number;
    banned: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class VendorModerationService {
  private apiUrl = `${environment.apiUrl}/admin/vendors`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer tous les vendeurs avec filtres
   */
  getVendors(
    page: number = 1,
    limit: number = 12,
    status?: string,
    plan?: string,
    sortBy?: string,
    search?: string
  ): Observable<VendorsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) params = params.set('status', status);
    if (plan) params = params.set('plan', plan);
    if (sortBy) params = params.set('sortBy', sortBy);
    if (search) params = params.set('search', search);

    return this.http.get<VendorsResponse>(this.apiUrl, { params });
  }

  /**
   * Récupérer un vendeur par ID
   */
  getVendorById(id: string): Observable<Vendor> {
    return this.http.get<Vendor>(`${this.apiUrl}/${id}`);
  }

  /**
   * Envoyer un avertissement
   */
  sendWarning(vendorId: string, data: { 
    reason: string;
  }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/${vendorId}/warning`,
      data
    );
  }

  /**
   * Suspendre un vendeur
   */
  suspendVendor(vendorId: string, data: { 
    duration: number; // en jours
    reason: string;
  }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/${vendorId}/suspend`,
      data
    );
  }

  /**
   * Bannir un vendeur définitivement
   */
  banVendor(vendorId: string, data: { 
    reason: string;
  }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/${vendorId}/ban`,
      data
    );
  }

  /**
   * Réactiver un vendeur suspendu
   */
  reactivateVendor(vendorId: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/${vendorId}/reactivate`,
      {}
    );
  }

  /**
   * Récupérer les statistiques des vendeurs
   */
  getVendorsStats(): Observable<{
    active: number;
    suspended: number;
    warning: number;
    banned: number;
    total: number;
  }> {
    return this.http.get<{
      active: number;
      suspended: number;
      warning: number;
      banned: number;
      total: number;
    }>(`${this.apiUrl}/stats`);
  }

  /**
   * Récupérer l'historique des sanctions d'un vendeur
   */
  getVendorSanctionHistory(vendorId: string): Observable<{
    warnings: Warning[];
    suspensions: any[];
  }> {
    return this.http.get<{
      warnings: Warning[];
      suspensions: any[];
    }>(`${this.apiUrl}/${vendorId}/sanction-history`);
  }
}
