import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError, interval, timer } from 'rxjs';
import { delay, map, switchMap, take, tap, catchError, filter, takeWhile } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  processingTime: number; // en millisecondes
  successRate: number; // pourcentage de succès
  fees: number; // frais en FCFA
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  method: string;
  cardInfo?: {
    number: string;
    name: string;
    expiry: string;
    cvv: string;
  };
  mobileMoneyInfo?: {
    provider: string;
    number: string;
  };
  orderId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  message: string;
  processingTime: number;
  fees: number;
  receiptUrl?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface PaymentStatus {
  transactionId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  currentStep: string;
  estimatedTime: number; // secondes restantes
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentSimulationService {

  private paymentStatusSubject = new BehaviorSubject<PaymentStatus | null>(null);
  public paymentStatus$ = this.paymentStatusSubject.asObservable();

  private readonly apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  // Méthodes de paiement disponibles
  public readonly paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Carte Bancaire',
      icon: 'fas fa-credit-card',
      description: 'Visa, Mastercard, American Express',
      processingTime: 3000,
      successRate: 95,
      fees: 0
    },
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      icon: 'fas fa-mobile-alt',
      description: 'T-Money, Flooz, MTN Mobile Money',
      processingTime: 5000,
      successRate: 98,
      fees: 100
    },
    {
      id: 'bank_transfer',
      name: 'Virement Bancaire',
      icon: 'fas fa-university',
      description: 'Transfert direct depuis votre banque',
      processingTime: 10000,
      successRate: 99,
      fees: 0
    },
    {
      id: 'cash_on_delivery',
      name: 'Paiement à la Livraison',
      icon: 'fas fa-money-bill-wave',
      description: 'Payez en espèces à la réception',
      processingTime: 0,
      successRate: 100,
      fees: 500
    }
  ];

  // Simulation de validation de carte
  private validateCard(cardInfo: any): { valid: boolean; error?: string } {
    const { number, name, expiry, cvv } = cardInfo;
    
    // Validation du numéro de carte (algorithme de Luhn simplifié)
    if (!this.isValidCardNumber(number)) {
      return { valid: false, error: 'Numéro de carte invalide' };
    }
    
    // Validation du nom
    if (!name || name.trim().length < 2) {
      return { valid: false, error: 'Nom sur la carte requis' };
    }
    
    // Validation de la date d'expiration
    if (!this.isValidExpiry(expiry)) {
      return { valid: false, error: 'Date d\'expiration invalide' };
    }
    
    // Validation du CVV
    if (!cvv || !/^\d{3,4}$/.test(cvv)) {
      return { valid: false, error: 'CVV invalide' };
    }
    
    return { valid: true };
  }

  private isValidCardNumber(number: string): boolean {
    // Supprimer les espaces et tirets
    const cleanNumber = number.replace(/[\s-]/g, '');
    
    // Vérifier que c'est un nombre
    if (!/^\d+$/.test(cleanNumber)) return false;
    
    // Vérifier la longueur (13-19 chiffres)
    if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;
    
    // Algorithme de Luhn
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  private isValidExpiry(expiry: string): boolean {
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!regex.test(expiry)) return false;
    
    const [month, year] = expiry.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const expYear = parseInt(year);
    const expMonth = parseInt(month);
    
    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    
    return true;
  }

  // Simulation de validation Mobile Money
  private validateMobileMoney(mobileInfo: any): { valid: boolean; error?: string } {
    const { provider, number } = mobileInfo;
    
    if (!provider) {
      return { valid: false, error: 'Opérateur requis' };
    }
    
    if (!number || !/^(\+228|228)?\d{8}$/.test(number.replace(/\s/g, ''))) {
      return { valid: false, error: 'Numéro de téléphone invalide' };
    }
    
    return { valid: true };
  }

  // Traitement du paiement (nouvelle version connectée au backend)
  processPayment(request: PaymentRequest): Observable<PaymentResponse> {
    const method = this.paymentMethods.find(m => m.id === request.method);
    if (!method) {
      return throwError(() => new Error('Méthode de paiement non supportée'));
    }

    // Validation locale selon la méthode
    let validation: { valid: boolean; error?: string } = { valid: true };

    if (request.method === 'card' && request.cardInfo) {
      validation = this.validateCard(request.cardInfo);
    } else if (request.method === 'mobile_money' && request.mobileMoneyInfo) {
      validation = this.validateMobileMoney(request.mobileMoneyInfo);
    }

    if (!validation.valid) {
      return throwError(() => new Error(validation.error));
    }

    // Déterminer le scénario selon le taux de succès
    const scenario = this.getScenarioFromSuccessRate(method.successRate);

    // Mapper la méthode au format backend
    const paymentMethod = this.mapPaymentMethod(request.method, request.mobileMoneyInfo?.provider);

    // Appeler le backend pour initier le paiement
    return this.http.post<any>(`${this.apiUrl}/test/process`, {
      orderId: request.orderId,
      amount: request.amount,
      paymentMethod: paymentMethod,
      phoneNumber: request.mobileMoneyInfo?.number || request.customerInfo.phone,
      scenario: scenario,
      delay: 3000,
      currency: request.currency || 'FCFA'
    }).pipe(
      switchMap(response => {
        if (!response.success) {
          throw new Error(response.error || 'Erreur lors du paiement');
        }

        const transactionId = response.data.transactionId;
        const steps = response.data.steps;
        const estimatedTime = response.data.estimatedTime;

        // Initialiser le statut
        this.paymentStatusSubject.next({
          transactionId: transactionId,
          status: 'processing',
          progress: 0,
          currentStep: steps[0]?.message || 'Initialisation...',
          estimatedTime: estimatedTime / 1000,
          message: 'Traitement en cours...'
        });

        // Démarrer le polling du statut
        return this.pollPaymentStatus(transactionId, steps);
      }),
      map(finalStatus => {
        // Convertir le résultat backend en PaymentResponse
        return {
          success: finalStatus.status === 'completed',
          transactionId: finalStatus.transactionId,
          status: finalStatus.status,
          message: finalStatus.status === 'completed'
            ? 'Paiement traité avec succès'
            : finalStatus.error?.message || 'Paiement échoué',
          processingTime: method.processingTime,
          fees: method.fees,
          receiptUrl: finalStatus.status === 'completed' ? `/receipts/${finalStatus.transactionId}.pdf` : undefined,
          errorCode: finalStatus.error?.code,
          errorMessage: finalStatus.error?.details
        } as PaymentResponse;
      }),
      catchError(error => {
        console.error('Erreur traitement paiement:', error);
        this.paymentStatusSubject.next({
          transactionId: '',
          status: 'failed',
          progress: 100,
          currentStep: 'Erreur',
          estimatedTime: 0,
          message: error.error?.message || error.message || 'Erreur de paiement'
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * Déterminer le scénario de test basé sur le taux de succès
   */
  private getScenarioFromSuccessRate(successRate: number): string {
    const random = Math.random() * 100;

    if (random < successRate) {
      return 'success';
    } else {
      // Choisir un scénario d'échec au hasard
      const failureScenarios = [
        'insufficient_funds',
        'card_declined',
        'timeout',
        'network_error'
      ];
      return failureScenarios[Math.floor(Math.random() * failureScenarios.length)];
    }
  }

  /**
   * Mapper la méthode de paiement frontend au format backend
   */
  private mapPaymentMethod(method: string, provider?: string): string {
    if (method === 'mobile_money' && provider) {
      // Mapper les providers spécifiques
      const providerMap: { [key: string]: string } = {
        'tmoney': 'tmoney',
        't-money': 'tmoney',
        'flooz': 'flooz',
        'orange': 'orange_money',
        'orange money': 'orange_money',
        'mtn': 'mtn_money',
        'mtn money': 'mtn_money',
        'moov': 'moov_money'
      };
      return providerMap[provider.toLowerCase()] || 'tmoney';
    }

    if (method === 'card') {
      return 'card';
    }

    if (method === 'cash_on_delivery') {
      return 'cash_on_delivery';
    }

    if (method === 'bank_transfer') {
      return 'bank_transfer';
    }

    return method;
  }

  /**
   * Polling du statut de paiement auprès du backend
   */
  private pollPaymentStatus(transactionId: string, steps: any[]): Observable<any> {
    let currentStep = 0;
    const totalSteps = steps.length;
    let pollCount = 0;
    const maxPolls = 30; // Maximum 30 secondes

    return interval(1000).pipe( // Vérifier toutes les secondes
      take(maxPolls),
      switchMap(() =>
        this.http.get<any>(`${this.apiUrl}/test/status/${transactionId}`).pipe(
          catchError(err => {
            console.error('Erreur polling:', err);
            return of({ success: false, error: err });
          })
        )
      ),
      tap(response => {
        pollCount++;

        if (response.success && response.data) {
          const status = response.data.status;
          const providerStatus = response.data.providerStatus;

          // Mettre à jour la progression basée sur le provider status
          if (providerStatus && providerStatus.startsWith('STEP_')) {
            currentStep = parseInt(providerStatus.split('_')[1]) - 1;
          } else {
            currentStep = Math.min(currentStep + 1, totalSteps - 1);
          }

          const progress = Math.min(((currentStep + 1) / totalSteps) * 100, 100);

          this.paymentStatusSubject.next({
            transactionId: transactionId,
            status: status === 'pending' ? 'processing' : status as any,
            progress: progress,
            currentStep: steps[currentStep]?.message || 'Traitement...',
            estimatedTime: Math.max(0, (totalSteps - currentStep - 1)),
            message: status === 'pending' ? 'Traitement en cours...' :
                     status === 'completed' ? 'Paiement réussi !' :
                     status === 'failed' ? 'Paiement échoué' : 'En cours...'
          });
        }
      }),
      filter(response => {
        // Continuer jusqu'à ce que le statut soit final ou timeout
        if (!response.success) return pollCount >= maxPolls;
        const status = response.data?.status;
        return status === 'completed' || status === 'failed' || pollCount >= maxPolls;
      }),
      take(1), // Prendre seulement le premier résultat final
      map(response => {
        if (!response.success || !response.data) {
          throw new Error('Timeout ou erreur lors du paiement');
        }
        return response.data;
      })
    );
  }

  // Note: simulatePaymentProcessing supprimée - on utilise maintenant le backend

  private getProcessingSteps(method: string): string[] {
    switch (method) {
      case 'card':
        return [
          'Validation des informations de carte...',
          'Vérification des fonds disponibles...',
          'Authentification 3D Secure...',
          'Traitement de la transaction...',
          'Finalisation du paiement...'
        ];
      case 'mobile_money':
        return [
          'Validation du numéro de téléphone...',
          'Vérification du solde Mobile Money...',
          'Envoi de la demande de paiement...',
          'Attente de confirmation...',
          'Finalisation du paiement...'
        ];
      case 'bank_transfer':
        return [
          'Validation des informations bancaires...',
          'Initiation du virement...',
          'Vérification de la transaction...',
          'Traitement par la banque...',
          'Confirmation du virement...'
        ];
      case 'cash_on_delivery':
        return [
          'Validation de la commande...',
          'Préparation pour livraison...',
          'Paiement différé confirmé...'
        ];
      default:
        return ['Traitement en cours...'];
    }
  }

  private generateTransactionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `AFM-${timestamp}-${random}`.toUpperCase();
  }

  // Vérifier le statut d'un paiement (depuis le backend)
  checkPaymentStatus(transactionId: string): Observable<PaymentStatus> {
    return this.http.get<any>(`${this.apiUrl}/test/status/${transactionId}`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error('Impossible de récupérer le statut du paiement');
        }

        const data = response.data;

        return {
          transactionId: data.transactionId,
          status: data.status === 'pending' ? 'processing' : data.status as any,
          progress: data.status === 'completed' ? 100 :
                   data.status === 'failed' ? 100 :
                   data.status === 'pending' ? 50 : 0,
          currentStep: data.status === 'completed' ? 'Paiement terminé' :
                      data.status === 'failed' ? 'Paiement échoué' :
                      'Traitement en cours',
          estimatedTime: data.status === 'pending' ? 5 : 0,
          message: data.status === 'completed' ? 'Paiement traité avec succès' :
                  data.error?.message || 'En cours...'
        } as PaymentStatus;
      }),
      catchError(error => {
        console.error('Erreur vérification statut:', error);
        return of({
          transactionId,
          status: 'failed',
          progress: 100,
          currentStep: 'Erreur',
          estimatedTime: 0,
          message: 'Impossible de vérifier le statut'
        } as PaymentStatus);
      })
    );
  }

  // Annuler un paiement
  cancelPayment(transactionId: string): Observable<boolean> {
    const status = this.paymentStatusSubject.value;
    if (status && status.transactionId === transactionId && status.status === 'processing') {
      this.paymentStatusSubject.next({
        ...status,
        status: 'cancelled',
        message: 'Paiement annulé par l\'utilisateur'
      });
      return of(true);
    }
    return of(false);
  }

  // Obtenir les méthodes de paiement disponibles
  getAvailablePaymentMethods(): Observable<PaymentMethod[]> {
    return of(this.paymentMethods);
  }

  // Calculer les frais de paiement
  calculateFees(amount: number, method: string): number {
    const methodInfo = this.paymentMethods.find(m => m.id === method);
    return methodInfo ? methodInfo.fees : 0;
  }

  // Réinitialiser le statut de paiement
  resetPaymentStatus(): void {
    this.paymentStatusSubject.next(null);
  }
}











































