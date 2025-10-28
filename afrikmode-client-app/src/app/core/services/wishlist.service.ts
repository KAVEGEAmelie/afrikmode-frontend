// src/app/core/services/wishlist.service.ts
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Product, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private baseUrl = environment.apiUrl;
  private wishlistCountSubject = new BehaviorSubject<number>(0);
  public wishlistCount$ = this.wishlistCountSubject.asObservable();

  constructor(private http: HttpClient) {
    // Ne pas charger la wishlist au démarrage - sera chargée après authentification
  }

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

  private loadWishlistCount(): void {
    this.getWishlistCount().subscribe({
      next: (response: any) => {
        const count = response.count || response.data?.count || 0;
        this.wishlistCountSubject.next(count);
      },
      error: () => this.wishlistCountSubject.next(0)
    });
  }

  // Méthode publique pour charger la wishlist après authentification
  loadWishlistData(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('⚠️ Aucun token, abandon du chargement de la wishlist');
      this.wishlistCountSubject.next(0);
      return;
    }
    this.loadWishlistCount();
  }

  getWishlist(params?: {
    page?: number;
    limit?: number;
    sort?: string;
  }): Observable<PaginatedResponse<Product>> {
    return this.http.get<PaginatedResponse<Product>>(`${this.baseUrl}/wishlist`, {
      headers: this.getHeaders(),
      params: params ? this.buildParams(params) : undefined
    });
  }

  addToWishlist(productId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/wishlist`, { product_id: productId }, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.loadWishlistCount())
    );
  }

  removeFromWishlist(productId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/wishlist/${productId}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.loadWishlistCount())
    );
  }

  isInWishlist(productId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/wishlist/${productId}/check`, {
      headers: this.getHeaders()
    });
  }

  clearWishlist(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/wishlist/all`, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.wishlistCountSubject.next(0))
    );
  }

  moveToCart(productId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/wishlist/${productId}/move-to-cart`, {}, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.loadWishlistCount())
    );
  }

  moveAllToCart(): Observable<any> {
    return this.http.post(`${this.baseUrl}/wishlist/move-all-to-cart`, {}, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.wishlistCountSubject.next(0))
    );
  }

  getWishlistCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/wishlist/count`, {
      headers: this.getHeaders()
    });
  }

  shareWishlist(): Observable<any> {
    return this.http.post(`${this.baseUrl}/wishlist/share`, {}, {
      headers: this.getHeaders()
    });
  }

  getCurrentCount(): number {
    return this.wishlistCountSubject.value;
  }
}