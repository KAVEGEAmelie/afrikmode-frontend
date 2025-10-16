// src/app/core/services/review.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Review, ReviewStats, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
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

  getProductReviews(productId: string, params?: any): Observable<PaginatedResponse<Review>> {
    return this.http.get<PaginatedResponse<Review>>(`${this.baseUrl}/products/${productId}/reviews`, {
      headers: this.getHeaders(),
      params: params ? this.buildParams(params) : undefined
    });
  }

  getReview(id: string): Observable<Review> {
    return this.http.get<Review>(`${this.baseUrl}/reviews/${id}`, {
      headers: this.getHeaders()
    });
  }

  createReview(review: Partial<Review>): Observable<Review> {
    return this.http.post<Review>(`${this.baseUrl}/reviews`, review, {
      headers: this.getHeaders()
    });
  }

  updateReview(id: string, review: Partial<Review>): Observable<Review> {
    return this.http.put<Review>(`${this.baseUrl}/reviews/${id}`, review, {
      headers: this.getHeaders()
    });
  }

  deleteReview(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/reviews/${id}`, {
      headers: this.getHeaders()
    });
  }

  getReviewStats(productId: string): Observable<ReviewStats> {
    return this.http.get<ReviewStats>(`${this.baseUrl}/products/${productId}/reviews/stats`, {
      headers: this.getHeaders()
    });
  }

  markReviewHelpful(reviewId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reviews/${reviewId}/helpful`, {}, {
      headers: this.getHeaders()
    });
  }

  reportReview(reviewId: string, reason: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reviews/${reviewId}/report`, { reason }, {
      headers: this.getHeaders()
    });
  }

  getUserReviews(params?: any): Observable<PaginatedResponse<Review>> {
    return this.http.get<PaginatedResponse<Review>>(`${this.baseUrl}/users/reviews`, {
      headers: this.getHeaders(),
      params: params ? this.buildParams(params) : undefined
    });
  }
}