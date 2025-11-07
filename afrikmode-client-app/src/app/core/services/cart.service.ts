// src/app/core/services/cart.service.ts
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
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
    return this.http.get<{success: boolean, data: any}>(`${this.baseUrl}/cart`, {
      headers: this.getHeaders()
    }).pipe(
      map((response: any) => {
        // Transformer la réponse backend en format Cart
        const totalAmount = response.data?.total_amount || response.data?.total || 0;
        const cart: Cart = {
          id: '',
          user_id: '',
          items: response.data?.items || [],
          total_items: response.data?.total_items || 0,
          subtotal: totalAmount,
          tax_amount: 0,
          shipping_cost: 0,
          discount_amount: 0,
          total: totalAmount,
          currency: response.data?.currency || 'FCFA',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          coupon_code: response.data?.coupon_code
        };
        this.cartSubject.next(cart);
        return cart;
      })
    );
  }

  addToCart(item: AddToCartRequest): Observable<CartItem> {
    return this.http.post<{success: boolean, message?: string, data?: CartItem}>(`${this.baseUrl}/cart`, item, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => {
        // Recharger le panier pour mettre à jour le compteur
        this.loadCart();
      }),
      map(response => {
        // Retourner un CartItem ou créer un objet par défaut
        return response.data || {
          id: '',
          product_id: item.product_id,
          quantity: item.quantity || 1,
          product: {} as any
        } as CartItem;
      })
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
    return this.http.post<{success: boolean, data: any}>(`${this.baseUrl}/cart/coupon`, { code }, {
      headers: this.getHeaders()
    }).pipe(
      map((response: any) => {
        const totalAmount = response.data?.total_amount || response.data?.total || 0;
        const cart: Cart = {
          id: '',
          user_id: '',
          items: response.data?.items || [],
          total_items: response.data?.total_items || 0,
          subtotal: totalAmount,
          tax_amount: 0,
          shipping_cost: 0,
          discount_amount: 0,
          total: totalAmount,
          currency: response.data?.currency || 'FCFA',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          coupon_code: response.data?.coupon_code || code
        };
        this.cartSubject.next(cart);
        return cart;
      })
    );
  }

  removeCoupon(): Observable<Cart> {
    return this.http.delete<{success: boolean, data: any}>(`${this.baseUrl}/cart/coupon`, {
      headers: this.getHeaders()
    }).pipe(
      map((response: any) => {
        const totalAmount = response.data?.total_amount || response.data?.total || 0;
        const cart: Cart = {
          id: '',
          user_id: '',
          items: response.data?.items || [],
          total_items: response.data?.total_items || 0,
          subtotal: totalAmount,
          tax_amount: 0,
          shipping_cost: 0,
          discount_amount: 0,
          total: totalAmount,
          currency: response.data?.currency || 'FCFA',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          coupon_code: undefined
        };
        this.cartSubject.next(cart);
        return cart;
      })
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

  // Observable pour le compteur d'articles (pour le header)
  getCartCount$(): Observable<number> {
    return this.cart$.pipe(
      map(cart => cart ? cart.total_items : 0)
    );
  }
}