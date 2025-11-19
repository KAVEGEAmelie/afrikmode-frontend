// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
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
  private isLoggingOut = false; // Flag pour éviter les appels multiples
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
    // Adapter la charge utile pour correspondre au backend (rememberMe au lieu de remember_me)
    const payload: any = { ...credentials } as any;
    if ((payload as any).remember_me !== undefined) {
      payload.rememberMe = (payload as any).remember_me;
      delete (payload as any).remember_me;
    }

    return this.http.post<any>(`${this.baseUrl}/auth/login`, payload, {
      headers: this.getHeaders()
    }).pipe(
      // Normaliser la réponse backend -> AuthResponse frontend
      tap((raw) => {
        const normalized = this.normalizeAuthResponse(raw);
        if (normalized.token) {
          this.setAuthData(normalized);
        }
      }),
      // Exposer une réponse normalisée au consommateur
      // Nota: on refait l'appel pour retourner l'objet normalisé
      // sans modifier la signature publique
      // (utilisateurs existants de ce service n'ont pas à changer)
      // eslint-disable-next-line rxjs/no-ignored-observable
      (source => new Observable<AuthResponse>(subscriber => {
        source.subscribe({
          next: (raw) => {
            subscriber.next(this.normalizeAuthResponse(raw));
            subscriber.complete();
          },
          error: (err) => subscriber.error(err)
        });
      }))
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, userData, {
      headers: this.getHeaders()
    }).pipe(
      tap((response: AuthResponse) => {
        if (response.token) {
          this.setAuthData(response);
        }
      })
    );
  }

  logout(): Observable<any> {
    // Éviter les appels multiples
    if (this.isLoggingOut) {
      console.log('⚠️ Logout déjà en cours, nettoyage local uniquement');
      this.clearAuthData();
      this.router.navigate(['/']);
      return new Observable(observer => {
        observer.next({ success: true, message: 'Déconnexion locale' });
        observer.complete();
      });
    }

    this.isLoggingOut = true;
    
    return this.http.post(`${this.baseUrl}/auth/logout`, {}, {
      headers: this.getHeaders()
    }).pipe(
      tap({
        next: () => {
          console.log('✅ Logout réussi côté serveur');
          this.clearAuthData();
          this.isLoggingOut = false;
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.log('⚠️ Erreur logout serveur, déconnexion côté client');
          // Même en cas d'erreur serveur, on nettoie côté client
          this.clearAuthData();
          this.isLoggingOut = false;
          this.router.navigate(['/']);
        }
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
    const storedRefreshToken = localStorage.getItem('refresh_token');
    return this.http.post<any>(`${this.baseUrl}/auth/refresh`, 
      { refreshToken: storedRefreshToken }, {
      headers: this.getHeaders()
    }).pipe(
      tap((raw) => {
        const normalized = this.normalizeAuthResponse(raw);
        if (normalized.token) {
          localStorage.setItem('auth_token', normalized.token);
        }
      }),
      (source => new Observable<AuthResponse>(subscriber => {
        source.subscribe({
          next: (raw) => {
            subscriber.next(this.normalizeAuthResponse(raw));
            subscriber.complete();
          },
          error: (err) => subscriber.error(err)
        });
      }))
    );
  }

  // Normalise la réponse du backend en AuthResponse conforme au frontend
  private normalizeAuthResponse(raw: any): AuthResponse {
    // Backend typique: { success, message, data: { user, token, refreshToken, expiresIn } }
    const data = raw?.data || raw;
    const user = data?.user || raw?.user || null;
    const token = data?.token || raw?.token || null;
    const refreshToken = data?.refreshToken || raw?.refresh_token || null;
    const expiresIn = data?.expiresIn || raw?.expires_in || null;

    // Adapter la structure user -> interface User (snake_case attendu côté front)
    const adaptedUser = user ? {
      id: user.id,
      email: user.email,
      first_name: user.first_name ?? user.firstName ?? '',
      last_name: user.last_name ?? user.lastName ?? '',
      phone: user.phone,
      role: user.role,
      status: user.status ?? (user.active ? 'active' : 'inactive'),
      is_verified: user.emailVerified ?? user.email_verified ?? false,
      two_factor_enabled: user.twoFactorEnabled ?? user.two_factor_enabled ?? false,
      avatar: user.avatar ?? user.avatarUrl ?? user.avatar_url,
      date_of_birth: user.birth_date ?? user.date_of_birth,
      gender: user.gender,
      created_at: user.created_at ?? user.createdAt ?? '',
      updated_at: user.updated_at ?? user.updatedAt ?? '',
      last_login_at: user.last_login ?? user.last_login_at
    } : null;

    return {
      user: adaptedUser as any,
      token: token as any,
      refresh_token: (refreshToken as any) ?? localStorage.getItem('refresh_token') ?? '',
      expires_in: (typeof expiresIn === 'string') ? undefined as any : (expiresIn as any)
    } as AuthResponse;
  }

  private setAuthData(response: AuthResponse): void {
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  clearAuthData(): void {
    console.log('🧹 Nettoyage des données d\'authentification');
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
    return this.hasAnyRole(['admin']);
  }

  isVendor(): boolean {
    return this.hasRole('vendor');
  }

  isCustomer(): boolean {
    return this.hasRole('customer');
  }

  updateUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }
}