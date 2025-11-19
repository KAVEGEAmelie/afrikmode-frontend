import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TokenRefreshService {
  private refreshTimer: any = null;
  private isRefreshing = false;
  private refreshSubject = new BehaviorSubject<boolean>(false);

  constructor(private authService: AuthService) {
    this.startTokenRefreshTimer();
  }

  private startTokenRefreshTimer(): void {
    // Vérifier le token toutes les 10 minutes
    this.refreshTimer = timer(0, 10 * 60 * 1000).subscribe(() => {
      this.checkAndRefreshToken();
    });
  }

  private checkAndRefreshToken(): void {
    const token = localStorage.getItem('auth_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!token || !refreshToken) {
      return;
    }

    // Vérifier si le token est proche de l'expiration (dans les 5 prochaines minutes)
    try {
      const tokenData = this.parseJwt(token);
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = tokenData.exp - now;
      
      // Si le token expire dans moins de 5 minutes, le rafraîchir
      if (timeUntilExpiry < 300) {
        this.refreshToken();
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
    }
  }

  private refreshToken(): void {
    if (this.isRefreshing) {
      return;
    }

    this.isRefreshing = true;
    this.refreshSubject.next(true);

    this.authService.refreshToken().subscribe({
      next: (response) => {
        console.log('✅ Token rafraîchi avec succès');
        this.isRefreshing = false;
        this.refreshSubject.next(false);
      },
      error: (error) => {
        console.error('❌ Erreur lors du rafraîchissement du token:', error);
        this.isRefreshing = false;
        this.refreshSubject.next(false);
        
        // Si le refresh token est invalide, nettoyer et déconnecter
        if (error.status === 401 || error.status === 403) {
          // Ne pas appeler logout() pour éviter les boucles, juste nettoyer
          this.authService.clearAuthData();
        }
      }
    });
  }

  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }

  public getRefreshStatus(): Observable<boolean> {
    return this.refreshSubject.asObservable();
  }

  public forceRefresh(): void {
    this.refreshToken();
  }

  public stopTimer(): void {
    if (this.refreshTimer) {
      this.refreshTimer.unsubscribe();
      this.refreshTimer = null;
    }
  }
}









































