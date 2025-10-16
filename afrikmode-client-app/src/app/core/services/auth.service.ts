// src/app/core/services/auth.service.ts
import { Injectable, Inject, forwardRef } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { 
  User, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  TwoFactorVerifyRequest,
  TwoFactorSetupResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkAuthState();
  }

  private checkAuthState(): void {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        this.currentUserSubject.next(userData);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        this.clearAuthData();
      }
    }
  }

  private getHeaders() {
    const token = localStorage.getItem('auth_token');
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': localStorage.getItem('language') || 'fr',
      'X-Currency': localStorage.getItem('currency') || 'EUR'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, credentials, {
      headers: this.getHeaders()
    }).pipe(
      tap((response: any) => {
        if (response.success && response.data && response.data.token) {
          this.setAuthData(response.data);
        }
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, userData, {
      headers: this.getHeaders()
    }).pipe(
      tap((response: any) => {
        if (response.success && response.data && response.data.token) {
          this.setAuthData(response.data);
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/logout`, {}, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => {
        this.clearAuthData();
        this.router.navigate(['/']);
      })
    );
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/forgot-password`, data, {
      headers: this.getHeaders()
    });
  }

  resetPassword(data: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/reset-password`, data, {
      headers: this.getHeaders()
    });
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/verify-email`, { token }, {
      headers: this.getHeaders()
    });
  }

  resendVerification(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/resend-verification`, { email }, {
      headers: this.getHeaders()
    });
  }

  changePassword(data: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/change-password`, data, {
      headers: this.getHeaders()
    });
  }

  // Two-Factor Authentication
  setup2FA(): Observable<TwoFactorSetupResponse> {
    return this.http.post<TwoFactorSetupResponse>(`${this.baseUrl}/auth/2fa/setup`, {}, {
      headers: this.getHeaders()
    });
  }

  verify2FA(data: TwoFactorVerifyRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/2fa/verify`, data, {
      headers: this.getHeaders()
    });
  }

  disable2FA(password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/2fa/disable`, { password }, {
      headers: this.getHeaders()
    });
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/refresh`, 
      { refresh_token: refreshToken }, {
      headers: this.getHeaders()
    }).pipe(
      tap((response: any) => {
        if (response.success && response.data && response.data.token) {
          this.setAuthData(response.data);
        }
      })
    );
  }

  private setAuthData(response: any): void {
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('refresh_token', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  private clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  isAdmin(): boolean {
    return this.hasAnyRole(['admin', 'super_admin']);
  }

  isVendor(): boolean {
    return this.hasRole('vendor');
  }

  isCustomer(): boolean {
    return this.hasRole('customer');
  }
}