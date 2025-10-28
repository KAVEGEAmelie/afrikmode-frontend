import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin';
  permissions: string[];
  profilePicture?: string;
  lastLoginAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: AdminUser;
    token: string;
    refreshToken: string;
    expiresIn: number;
  };
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private baseUrl = environment.apiUrl || 'http://localhost:3000/api';
  private currentUserSubject = new BehaviorSubject<AdminUser | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        this.currentUserSubject.next(parsedUser);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        this.logout();
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/admin/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success) {
            const { user, token, refreshToken } = response.data;
            
            // Stocker les tokens et les informations utilisateur
            localStorage.setItem('admin_token', token);
            localStorage.setItem('admin_refresh_token', refreshToken);
            localStorage.setItem('admin_user', JSON.stringify(user));
            
            // Mettre à jour les observables
            this.currentUserSubject.next(user);
            this.isAuthenticatedSubject.next(true);
          }
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    // Supprimer les tokens et les informations utilisateur
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
    
    // Mettre à jour les observables
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    // Rediriger vers la page de connexion
    this.router.navigate(['/admin/login']);
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = localStorage.getItem('admin_refresh_token');
    
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<LoginResponse>(`${this.baseUrl}/admin/auth/refresh`, {
      refreshToken
    }).pipe(
      tap(response => {
        if (response.success) {
          const { user, token, refreshToken: newRefreshToken } = response.data;
          
          // Mettre à jour les tokens
          localStorage.setItem('admin_token', token);
          localStorage.setItem('admin_refresh_token', newRefreshToken);
          localStorage.setItem('admin_user', JSON.stringify(user));
          
          // Mettre à jour les observables
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        }
      }),
      catchError(error => {
        console.error('Token refresh error:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  getCurrentUser(): AdminUser | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    return user.permissions.includes(permission) || user.role === 'admin';
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    return user.role === role;
  }

  getToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  // Vérifier si l'utilisateur peut accéder à une route
  canAccess(permission?: string, role?: string): boolean {
    if (!this.isAuthenticated()) return false;
    
    if (permission && !this.hasPermission(permission)) return false;
    if (role && !this.hasRole(role)) return false;
    
    return true;
  }

  // Changer le mot de passe
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/auth/change-password`, {
      currentPassword,
      newPassword
    }, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    }).pipe(
      catchError(error => {
        console.error('Change password error:', error);
        return throwError(() => error);
      })
    );
  }

  // Mettre à jour le profil
  updateProfile(profileData: Partial<AdminUser>): Observable<AdminUser> {
    return this.http.put<{ success: boolean; data: AdminUser }>(`${this.baseUrl}/admin/auth/profile`, profileData, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    }).pipe(
      map(response => response.data),
      tap(user => {
        localStorage.setItem('admin_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('Update profile error:', error);
        return throwError(() => error);
      })
    );
  }

  // Activer/désactiver 2FA
  toggleTwoFactor(): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/auth/toggle-2fa`, {}, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    }).pipe(
      catchError(error => {
        console.error('Toggle 2FA error:', error);
        return throwError(() => error);
      })
    );
  }

  // Vérifier le statut de connexion
  checkAuthStatus(): Observable<boolean> {
    const token = this.getToken();
    if (!token || this.isTokenExpired()) {
      this.logout();
      return new Observable<boolean>(observer => {
        observer.next(false);
        observer.complete();
      });
    }

    return this.http.get<{ success: boolean; data: AdminUser }>(`${this.baseUrl}/admin/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).pipe(
      map(response => {
        if (response.success) {
          this.currentUserSubject.next(response.data);
          this.isAuthenticatedSubject.next(true);
          return true;
        } else {
          this.logout();
          return false;
        }
      }),
      catchError(error => {
        console.error('Auth verification error:', error);
        this.logout();
        return new Observable<boolean>(observer => {
          observer.next(false);
          observer.complete();
        });
      })
    );
  }
}
