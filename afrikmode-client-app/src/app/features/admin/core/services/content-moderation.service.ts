import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface FlaggedProduct {
  id: string;
  productId: string;
  productTitle: string;
  vendorName: string;
  vendorId: string;
  reason: string;
  reportedBy: string;
  reporterEmail: string;
  reportedAt: Date;
  status: 'pending' | 'approved' | 'removed';
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface FlaggedReview {
  id: string;
  reviewId: string;
  reviewText: string;
  productName: string;
  reviewerName: string;
  reason: string;
  reportedBy: string;
  reporterEmail: string;
  reportedAt: Date;
  status: 'pending' | 'approved' | 'removed';
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface ContentModerationStats {
  pendingProducts: number;
  pendingReviews: number;
  approvedProducts: number;
  approvedReviews: number;
  removedProducts: number;
  removedReviews: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContentModerationService {
  private apiUrl = `${environment.apiUrl}/admin/content-moderation`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer les produits signalés
   */
  getFlaggedProducts(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Observable<{
    items: FlaggedProduct[];
    total: number;
    page: number;
    limit: number;
  }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<{
      items: FlaggedProduct[];
      total: number;
      page: number;
      limit: number;
    }>(`${this.apiUrl}/products`, { params });
  }

  /**
   * Récupérer les avis signalés
   */
  getFlaggedReviews(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Observable<{
    items: FlaggedReview[];
    total: number;
    page: number;
    limit: number;
  }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<{
      items: FlaggedReview[];
      total: number;
      page: number;
      limit: number;
    }>(`${this.apiUrl}/reviews`, { params });
  }

  /**
   * Approuver un produit signalé (laisser en ligne)
   */
  approveProduct(flagId: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/products/${flagId}/approve`,
      {}
    );
  }

  /**
   * Retirer un produit signalé
   */
  removeProduct(flagId: string, data: {
    reason: string;
  }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/products/${flagId}/remove`,
      data
    );
  }

  /**
   * Approuver un avis signalé (laisser en ligne)
   */
  approveReview(flagId: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/reviews/${flagId}/approve`,
      {}
    );
  }

  /**
   * Retirer un avis signalé
   */
  removeReview(flagId: string, data: {
    reason: string;
  }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/reviews/${flagId}/remove`,
      data
    );
  }

  /**
   * Récupérer les statistiques de modération
   */
  getModerationStats(): Observable<ContentModerationStats> {
    return this.http.get<ContentModerationStats>(`${this.apiUrl}/stats`);
  }

  /**
   * Récupérer les raisons de signalement les plus fréquentes
   */
  getCommonReportReasons(): Observable<{
    products: { reason: string; count: number }[];
    reviews: { reason: string; count: number }[];
  }> {
    return this.http.get<{
      products: { reason: string; count: number }[];
      reviews: { reason: string; count: number }[];
    }>(`${this.apiUrl}/common-reasons`);
  }
}
