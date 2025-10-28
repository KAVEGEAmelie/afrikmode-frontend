import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface VendorRequest {
  id: string;
  businessName: string;
  email: string;
  phone: string;
  country: string;
  businessType: string;
  description: string;
  documents: {
    businessRegistration?: string;
    taxCertificate?: string;
    idCard?: string;
    productSamples?: string[];
  };
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'additional_info_required';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
  additionalInfoRequested?: string;
}

export interface VendorRequestsResponse {
  requests: VendorRequest[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class VendorRequestsService {
  private apiUrl = `${environment.apiUrl}/admin/vendor-requests`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer toutes les demandes vendeurs avec filtres
   */
  getVendorRequests(
    page: number = 1,
    limit: number = 10,
    status?: string,
    search?: string
  ): Observable<VendorRequestsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<VendorRequestsResponse>(this.apiUrl, { params });
  }

  /**
   * Récupérer une demande par ID
   */
  getVendorRequestById(id: string): Observable<VendorRequest> {
    return this.http.get<VendorRequest>(`${this.apiUrl}/${id}`);
  }

  /**
   * Approuver une demande vendeur
   */
  approveRequest(id: string, data: { 
    subscriptionPlan: string;
    message?: string;
  }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/${id}/approve`,
      data
    );
  }

  /**
   * Rejeter une demande vendeur
   */
  rejectRequest(id: string, data: { 
    reason: string;
  }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/${id}/reject`,
      data
    );
  }

  /**
   * Demander des informations supplémentaires
   */
  requestAdditionalInfo(id: string, data: { 
    message: string;
  }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/${id}/request-info`,
      data
    );
  }

  /**
   * Récupérer les statistiques des demandes
   */
  getRequestsStats(): Observable<{
    pending: number;
    under_review: number;
    approved: number;
    rejected: number;
    total: number;
  }> {
    return this.http.get<{
      pending: number;
      under_review: number;
      approved: number;
      rejected: number;
      total: number;
    }>(`${this.apiUrl}/stats`);
  }

  /**
   * Télécharger un document
   */
  downloadDocument(requestId: string, documentType: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${requestId}/documents/${documentType}`,
      { responseType: 'blob' }
    );
  }
}
