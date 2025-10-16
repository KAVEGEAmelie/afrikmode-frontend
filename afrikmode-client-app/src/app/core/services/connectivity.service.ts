// src/app/core/services/connectivity.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, timer } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  message: string;
  timestamp: string;
  version?: string;
  uptime?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConnectivityService {
  private baseUrl = environment.apiUrl;
  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  public isConnected$ = this.isConnectedSubject.asObservable();

  private healthCheckInterval = 30000; // 30 secondes
  private healthCheckTimer = timer(0, this.healthCheckInterval);

  constructor(private http: HttpClient) {
    this.startHealthChecks();
  }

  /**
   * Vérifier la connectivité avec le backend
   */
  checkHealth(): Observable<HealthCheckResponse> {
    return this.http.get<any>(`${this.baseUrl.replace('/api', '')}/health`).pipe(
      map(response => {
        this.isConnectedSubject.next(true);
        return {
          status: (response.status === 'OK' ? 'ok' : 'error') as 'ok' | 'error',
          message: response.message || 'Backend accessible',
          timestamp: new Date().toISOString(),
          version: response.version,
          uptime: response.uptime
        };
      }),
      catchError(error => {
        this.isConnectedSubject.next(false);
        throw error;
      })
    );
  }

  /**
   * Tester la connexion à un endpoint spécifique
   */
  testEndpoint(endpoint: string): Observable<any> {
    return this.http.get(`${this.baseUrl}${endpoint}`).pipe(
      catchError(error => {
        console.error(`Erreur de connexion sur ${endpoint}:`, error);
        throw error;
      })
    );
  }

  /**
   * Obtenir le statut de connexion actuel
   */
  get isConnected(): boolean {
    return this.isConnectedSubject.value;
  }

  /**
   * Démarrer les vérifications automatiques de santé
   */
  private startHealthChecks(): void {
    this.healthCheckTimer.subscribe(() => {
      this.checkHealth().subscribe({
        next: (response) => {
          console.log('Backend health check OK:', response);
        },
        error: (error) => {
          console.warn('Backend health check failed:', error);
        }
      });
    });
  }

  /**
   * Tester tous les endpoints critiques
   */
  testCriticalEndpoints(): Observable<any> {
    const endpoints = [
      '/auth/me',
      '/products',
      '/categories',
      '/stores'
    ];

    const tests = endpoints.map(endpoint => 
      this.testEndpoint(endpoint).pipe(
        map(result => ({ endpoint, status: 'success', result })),
        catchError(error => [{endpoint, status: 'error', error: error.message}])
      )
    );

    return new Observable(observer => {
      Promise.all(tests.map(test => test.toPromise())).then(results => {
        observer.next(results);
        observer.complete();
      });
    });
  }
}