/**
 * Service pour la gestion des paiements et commissions
 * Basé sur l'API backend /api/payments
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

import { 
  Payment, 
  PaymentFilters, 
  PaymentListResponse,
  PayoutDetails,
  PayoutFilters,
  PayoutListResponse,
  PaymentMethod,
  CommissionSettings,
  PaymentAnalytics,
  PayoutAnalytics
} from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly apiUrl = `${environment.apiUrl}/payments`;
  private paymentsSubject = new BehaviorSubject<Payment[]>([]);
  private payoutsSubject = new BehaviorSubject<PayoutDetails[]>([]);
  private currentPaymentSubject = new BehaviorSubject<Payment | null>(null);

  public payments$ = this.paymentsSubject.asObservable();
  public payouts$ = this.payoutsSubject.asObservable();
  public currentPayment$ = this.currentPaymentSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Récupérer tous les paiements avec filtres
   */
  getPayments(filters?: PaymentFilters): Observable<PaymentListResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof PaymentFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaymentListResponse>(this.apiUrl, { params })
      .pipe(
        tap(response => this.paymentsSubject.next(response.payments)),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer un paiement par ID
   */
  getPaymentById(id: string): Observable<Payment> {
    return this.http.get<{ success: boolean; data: Payment }>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data),
        tap(payment => this.currentPaymentSubject.next(payment)),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les paiements d'une boutique
   */
  getStorePayments(storeId: string, filters?: Partial<PaymentFilters>): Observable<PaymentListResponse> {
    let params = new HttpParams().set('store_id', storeId);
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof PaymentFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaymentListResponse>(`${this.apiUrl}/store/${storeId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les paiements par statut
   */
  getPaymentsByStatus(status: string, filters?: Partial<PaymentFilters>): Observable<PaymentListResponse> {
    let params = new HttpParams().set('status', status);
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof PaymentFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaymentListResponse>(this.apiUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les paiements en attente
   */
  getPendingPayments(filters?: Partial<PaymentFilters>): Observable<PaymentListResponse> {
    return this.getPaymentsByStatus('pending', filters);
  }

  /**
   * Récupérer les paiements complétés
   */
  getCompletedPayments(filters?: Partial<PaymentFilters>): Observable<PaymentListResponse> {
    return this.getPaymentsByStatus('completed', filters);
  }

  /**
   * Récupérer les paiements échoués
   */
  getFailedPayments(filters?: Partial<PaymentFilters>): Observable<PaymentListResponse> {
    return this.getPaymentsByStatus('failed', filters);
  }

  /**
   * Récupérer les paiements remboursés
   */
  getRefundedPayments(filters?: Partial<PaymentFilters>): Observable<PaymentListResponse> {
    return this.getPaymentsByStatus('refunded', filters);
  }

  /**
   * Rembourser un paiement
   */
  refundPayment(paymentId: string, amount?: number, reason: string = 'Remboursement'): Observable<Payment> {
    const body = { amount, reason };
    return this.http.post<{ success: boolean; data: Payment }>(`${this.apiUrl}/${paymentId}/refund`, body)
      .pipe(
        map(response => response.data),
        tap(payment => {
          const currentPayments = this.paymentsSubject.value;
          const index = currentPayments.findIndex(p => p.id === paymentId);
          if (index !== -1) {
            currentPayments[index] = payment;
            this.paymentsSubject.next([...currentPayments]);
          }
          this.currentPaymentSubject.next(payment);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les paiements sortants (payouts)
   */
  getPayouts(filters?: PayoutFilters): Observable<PayoutListResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof PayoutFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PayoutListResponse>(`${this.apiUrl}/payouts`, { params })
      .pipe(
        tap(response => this.payoutsSubject.next(response.payouts)),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les paiements sortants d'une boutique
   */
  getStorePayouts(storeId: string, filters?: Partial<PayoutFilters>): Observable<PayoutListResponse> {
    let params = new HttpParams().set('store_id', storeId);
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof PayoutFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PayoutListResponse>(`${this.apiUrl}/payouts/store/${storeId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Demander un paiement sortant
   */
  requestPayout(storeId: string, amount: number, method: string, accountDetails: any): Observable<PayoutDetails> {
    const body = { store_id: storeId, amount, method, account_details: accountDetails };
    return this.http.post<{ success: boolean; data: PayoutDetails }>(`${this.apiUrl}/payouts/request`, body)
      .pipe(
        map(response => response.data),
        tap(payout => {
          const currentPayouts = this.payoutsSubject.value;
          this.payoutsSubject.next([payout, ...currentPayouts]);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les méthodes de paiement disponibles
   */
  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<{ success: boolean; data: PaymentMethod[] }>(`${this.apiUrl}/methods`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les paramètres de commission
   */
  getCommissionSettings(storeId: string): Observable<CommissionSettings> {
    return this.http.get<{ success: boolean; data: CommissionSettings }>(`${this.apiUrl}/commission/${storeId}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Mettre à jour les paramètres de commission
   */
  updateCommissionSettings(storeId: string, settings: Partial<CommissionSettings>): Observable<CommissionSettings> {
    return this.http.put<{ success: boolean; data: CommissionSettings }>(`${this.apiUrl}/commission/${storeId}`, settings)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les analytics des paiements
   */
  getPaymentAnalytics(storeId?: string, period: string = '30d'): Observable<PaymentAnalytics> {
    let params = new HttpParams().set('period', period);
    if (storeId) {
      params = params.set('store_id', storeId);
    }

    return this.http.get<{ success: boolean; data: PaymentAnalytics }>(`${this.apiUrl}/analytics`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les analytics des paiements sortants
   */
  getPayoutAnalytics(storeId?: string, period: string = '30d'): Observable<PayoutAnalytics> {
    let params = new HttpParams().set('period', period);
    if (storeId) {
      params = params.set('store_id', storeId);
    }

    return this.http.get<{ success: boolean; data: PayoutAnalytics }>(`${this.apiUrl}/payouts/analytics`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer le résumé des paiements
   */
  getPaymentSummary(storeId?: string, period: string = '30d'): Observable<{
    total_payments: number;
    total_amount: number;
    total_fees: number;
    net_amount: number;
    pending_amount: number;
    completed_payments: number;
    failed_payments: number;
    refunded_payments: number;
  }> {
    let params = new HttpParams().set('period', period);
    if (storeId) {
      params = params.set('store_id', storeId);
    }

    return this.http.get<{ success: boolean; data: any }>(`${this.apiUrl}/summary`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer le résumé des paiements sortants
   */
  getPayoutSummary(storeId?: string, period: string = '30d'): Observable<{
    total_payouts: number;
    total_amount: number;
    pending_payouts: number;
    completed_payouts: number;
    failed_payouts: number;
    average_payout: number;
  }> {
    let params = new HttpParams().set('period', period);
    if (storeId) {
      params = params.set('store_id', storeId);
    }

    return this.http.get<{ success: boolean; data: any }>(`${this.apiUrl}/payouts/summary`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Exporter les paiements
   */
  exportPayments(filters: PaymentFilters, format: 'csv' | 'xlsx' | 'pdf' = 'csv'): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof PaymentFilters];
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get(`${this.apiUrl}/export`, { 
      params, 
      responseType: 'blob' 
    })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Exporter les paiements sortants
   */
  exportPayouts(filters: PayoutFilters, format: 'csv' | 'xlsx' | 'pdf' = 'csv'): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof PayoutFilters];
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get(`${this.apiUrl}/payouts/export`, { 
      params, 
      responseType: 'blob' 
    })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Rechercher des paiements
   */
  searchPayments(query: string, filters?: Partial<PaymentFilters>): Observable<PaymentListResponse> {
    let params = new HttpParams().set('search', query);
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof PaymentFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaymentListResponse>(`${this.apiUrl}/search`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les paiements récents
   */
  getRecentPayments(limit: number = 10): Observable<Payment[]> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('sort', 'created_at')
      .set('order', 'desc');

    return this.http.get<{ success: boolean; data: Payment[] }>(`${this.apiUrl}/recent`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les paiements du jour
   */
  getTodayPayments(): Observable<Payment[]> {
    const today = new Date().toISOString().split('T')[0];
    const params = new HttpParams().set('date_from', today);

    return this.http.get<{ success: boolean; data: Payment[] }>(`${this.apiUrl}/today`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Gestion des erreurs
   */
  private handleError(error: any): Observable<never> {
    console.error('PaymentService Error:', error);
    return throwError(() => error);
  }

  /**
   * Réinitialiser les données
   */
  reset(): void {
    this.paymentsSubject.next([]);
    this.payoutsSubject.next([]);
    this.currentPaymentSubject.next(null);
  }
}


































