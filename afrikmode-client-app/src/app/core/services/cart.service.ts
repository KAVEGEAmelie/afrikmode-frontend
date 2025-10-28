// src/app/core/services/cart.service.ts
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private baseUrl = environment.apiUrl;
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {
    // Ne pas charger le panier au démarrage - sera chargé après authentification
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

  private loadCart(): void {
    this.getCart().subscribe({
      next: cart => this.cartSubject.next(cart),
      error: () => this.cartSubject.next(null)
    });
  }

  // Méthode publique pour charger le panier après authentification
  loadCartData(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('⚠️ Aucun token, abandon du chargement du panier');
      this.cartSubject.next(null);
      return;
    }
    this.loadCart();
  }

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(`${this.baseUrl}/cart`, {
      headers: this.getHeaders()
    }).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  addToCart(item: AddToCartRequest): Observable<CartItem> {
    return this.http.post<CartItem>(`${this.baseUrl}/cart`, item, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.loadCart())
    );
  }

  updateCartItem(itemId: string, data: UpdateCartItemRequest): Observable<CartItem> {
    return this.http.put<CartItem>(`${this.baseUrl}/cart/${itemId}`, data, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.loadCart())
    );
  }

  removeFromCart(itemId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/cart/${itemId}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.loadCart())
    );
  }

  clearCart(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/cart`, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.cartSubject.next(null))
    );
  }

  applyCoupon(code: string): Observable<Cart> {
    return this.http.post<Cart>(`${this.baseUrl}/cart/coupon`, { code }, {
      headers: this.getHeaders()
    }).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  removeCoupon(): Observable<Cart> {
    return this.http.delete<Cart>(`${this.baseUrl}/cart/coupon`, {
      headers: this.getHeaders()
    }).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  calculateShipping(addressId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/cart/shipping`, { address_id: addressId }, {
      headers: this.getHeaders()
    });
  }

  getCurrentCart(): Cart | null {
    return this.cartSubject.value;
  }

  getCartItemsCount(): number {
    const cart = this.getCurrentCart();
    return cart ? cart.total_items : 0;
  }

  getCartTotal(): number {
    const cart = this.getCurrentCart();
    return cart ? cart.total : 0;
  }
}