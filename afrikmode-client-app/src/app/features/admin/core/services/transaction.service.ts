import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface Transaction {
  id: string;
  orderId: string;
  vendorName: string;
  vendorId: string;
  customerName: string;
  customerId: string;
  amount: number;
  paymentMethod: 'mtn_money' | 'orange_money' | 'moov_money' | 'card';
  status: 'completed' | 'pending' | 'disputed' | 'refunded' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  disputeReason?: string;
  refundAmount?: number;
  refundedAt?: Date;
}

export interface TransactionStats {
  total: number;
  completed: number;
  pending: number;
  disputed: number;
  refunded: number;
  totalAmount: number;
  completedAmount: number;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  stats: TransactionStats;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/admin/transactions`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer toutes les transactions avec filtres
   */
  getTransactions(
    page: number = 1,
    limit: number = 20,
    status?: string,
    paymentMethod?: string,
    search?: string,
    dateFrom?: string,
    dateTo?: string
  ): Observable<TransactionsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) params = params.set('status', status);
    if (paymentMethod) params = params.set('paymentMethod', paymentMethod);
    if (search) params = params.set('search', search);
    if (dateFrom) params = params.set('dateFrom', dateFrom);
    if (dateTo) params = params.set('dateTo', dateTo);

    return this.http.get<TransactionsResponse>(this.apiUrl, { params });
  }

  /**
   * Récupérer une transaction par ID
   */
  getTransactionById(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer les statistiques des transactions
   */
  getTransactionStats(
    dateFrom?: string,
    dateTo?: string
  ): Observable<TransactionStats> {
    let params = new HttpParams();

    if (dateFrom) params = params.set('dateFrom', dateFrom);
    if (dateTo) params = params.set('dateTo', dateTo);

    return this.http.get<TransactionStats>(`${this.apiUrl}/stats`, { params });
  }

  /**
   * Traiter un litige
   */
  resolveDispute(transactionId: string, data: {
    resolution: 'refund' | 'reject';
    amount?: number;
    note?: string;
  }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/${transactionId}/resolve-dispute`,
      data
    );
  }

  /**
   * Effectuer un remboursement
   */
  refundTransaction(transactionId: string, data: {
    amount: number;
    reason: string;
  }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/${transactionId}/refund`,
      data
    );
  }

  /**
   * Exporter les transactions (CSV/Excel)
   */
  exportTransactions(
    format: 'csv' | 'excel',
    filters?: {
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Observable<Blob> {
    let params = new HttpParams().set('format', format);

    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params = params.set('dateTo', filters.dateTo);

    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Récupérer les transactions par méthode de paiement
   */
  getTransactionsByPaymentMethod(): Observable<{
    mtn_money: number;
    orange_money: number;
    moov_money: number;
    card: number;
  }> {
    return this.http.get<{
      mtn_money: number;
      orange_money: number;
      moov_money: number;
      card: number;
    }>(`${this.apiUrl}/by-payment-method`);
  }

  /**
   * Récupérer l'historique des transactions d'un utilisateur
   */
  getUserTransactions(userId: string, page: number = 1): Observable<TransactionsResponse> {
    return this.http.get<TransactionsResponse>(`${this.apiUrl}/user/${userId}`, {
      params: new HttpParams().set('page', page.toString())
    });
  }

  /**
   * Récupérer l'historique des transactions d'un vendeur
   */
  getVendorTransactions(vendorId: string, page: number = 1): Observable<TransactionsResponse> {
    return this.http.get<TransactionsResponse>(`${this.apiUrl}/vendor/${vendorId}`, {
      params: new HttpParams().set('page', page.toString())
    });
  }
}
