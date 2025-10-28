import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface PaymentMethod {
  id: string;
  name: string;
  provider: 'mtn_money' | 'orange_money' | 'moov_money' | 'stripe';
  isActive: boolean;
  apiKey?: string;
  secretKey?: string;
  merchantId?: string;
  icon?: string;
  countries: string[];
  lastUpdated: Date;
}

export interface CommissionRate {
  tier: 'basic' | 'pro' | 'premium';
  rate: number; // pourcentage
  description: string;
}

export interface ServiceFee {
  type: 'transaction' | 'withdrawal' | 'subscription';
  amount: number; // en XOF
  description: string;
}

export interface PaymentConfig {
  paymentMethods: PaymentMethod[];
  commissionRates: CommissionRate[];
  serviceFees: ServiceFee[];
  currency: string;
  minimumWithdrawal: number;
  withdrawalProcessingTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentConfigService {
  private apiUrl = `${environment.apiUrl}/admin/payment-config`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer la configuration complète des paiements
   */
  getPaymentConfig(): Observable<PaymentConfig> {
    return this.http.get<PaymentConfig>(this.apiUrl);
  }

  /**
   * Récupérer tous les moyens de paiement
   */
  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.apiUrl}/payment-methods`);
  }

  /**
   * Activer/désactiver un moyen de paiement
   */
  togglePaymentMethod(methodId: string): Observable<{
    success: boolean;
    isActive: boolean;
    message: string;
  }> {
    return this.http.patch<{
      success: boolean;
      isActive: boolean;
      message: string;
    }>(`${this.apiUrl}/payment-methods/${methodId}/toggle`, {});
  }

  /**
   * Mettre à jour les clés API d'un moyen de paiement
   */
  updatePaymentMethodKeys(methodId: string, data: {
    apiKey?: string;
    secretKey?: string;
    merchantId?: string;
  }): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.apiUrl}/payment-methods/${methodId}/keys`,
      data
    );
  }

  /**
   * Récupérer les taux de commission
   */
  getCommissionRates(): Observable<CommissionRate[]> {
    return this.http.get<CommissionRate[]>(`${this.apiUrl}/commission-rates`);
  }

  /**
   * Mettre à jour un taux de commission
   */
  updateCommissionRate(tier: string, rate: number): Observable<{
    success: boolean;
    message: string;
  }> {
    return this.http.put<{
      success: boolean;
      message: string;
    }>(`${this.apiUrl}/commission-rates/${tier}`, { rate });
  }

  /**
   * Récupérer les frais de service
   */
  getServiceFees(): Observable<ServiceFee[]> {
    return this.http.get<ServiceFee[]>(`${this.apiUrl}/service-fees`);
  }

  /**
   * Mettre à jour un frais de service
   */
  updateServiceFee(type: string, amount: number): Observable<{
    success: boolean;
    message: string;
  }> {
    return this.http.put<{
      success: boolean;
      message: string;
    }>(`${this.apiUrl}/service-fees/${type}`, { amount });
  }

  /**
   * Mettre à jour les paramètres généraux
   */
  updateGeneralSettings(data: {
    currency?: string;
    minimumWithdrawal?: number;
    withdrawalProcessingTime?: string;
  }): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.apiUrl}/general-settings`,
      data
    );
  }

  /**
   * Tester la connexion à un provider de paiement
   */
  testPaymentProvider(provider: string): Observable<{
    success: boolean;
    message: string;
    responseTime?: number;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      responseTime?: number;
    }>(`${this.apiUrl}/test-connection/${provider}`, {});
  }

  /**
   * Récupérer l'historique des modifications de configuration
   */
  getConfigHistory(): Observable<{
    id: string;
    changedBy: string;
    changeType: string;
    oldValue: any;
    newValue: any;
    timestamp: Date;
  }[]> {
    return this.http.get<{
      id: string;
      changedBy: string;
      changeType: string;
      oldValue: any;
      newValue: any;
      timestamp: Date;
    }[]>(`${this.apiUrl}/history`);
  }
}
