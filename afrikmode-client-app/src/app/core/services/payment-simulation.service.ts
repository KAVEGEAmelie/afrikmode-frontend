import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';

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

  // Traitement du paiement
  processPayment(request: PaymentRequest): Observable<PaymentResponse> {
    const method = this.paymentMethods.find(m => m.id === request.method);
    if (!method) {
      return throwError(() => new Error('Méthode de paiement non supportée'));
    }

    // Validation selon la méthode
    let validation: { valid: boolean; error?: string } = { valid: true };
    
    if (request.method === 'card' && request.cardInfo) {
      validation = this.validateCard(request.cardInfo);
    } else if (request.method === 'mobile_money' && request.mobileMoneyInfo) {
      validation = this.validateMobileMoney(request.mobileMoneyInfo);
    }

    if (!validation.valid) {
      return throwError(() => new Error(validation.error));
    }

    // Générer un ID de transaction
    const transactionId = this.generateTransactionId();
    
    // Simuler le traitement
    return this.simulatePaymentProcessing(transactionId, request, method);
  }

  private simulatePaymentProcessing(
    transactionId: string, 
    request: PaymentRequest, 
    method: PaymentMethod
  ): Observable<PaymentResponse> {
    
    // Déterminer si le paiement va réussir
    const willSucceed = Math.random() * 100 < method.successRate;
    
    // Simuler les étapes de traitement
    const steps = this.getProcessingSteps(request.method);
    let currentStepIndex = 0;
    
    const updateStatus = (step: string, progress: number) => {
      this.paymentStatusSubject.next({
        transactionId,
        status: 'processing',
        progress,
        currentStep: step,
        estimatedTime: Math.max(0, method.processingTime - (progress * method.processingTime / 100)) / 1000,
        message: step
      });
    };

    return new Observable(observer => {
      const interval = setInterval(() => {
        if (currentStepIndex < steps.length) {
          const step = steps[currentStepIndex];
          const progress = ((currentStepIndex + 1) / steps.length) * 100;
          
          updateStatus(step, progress);
          currentStepIndex++;
        } else {
          clearInterval(interval);
          
          // Finaliser le paiement
          if (willSucceed) {
            this.paymentStatusSubject.next({
              transactionId,
              status: 'completed',
              progress: 100,
              currentStep: 'Paiement réussi',
              estimatedTime: 0,
              message: 'Paiement traité avec succès'
            });
            
            observer.next({
              success: true,
              transactionId,
              status: 'completed',
              message: 'Paiement traité avec succès',
              processingTime: method.processingTime,
              fees: method.fees,
              receiptUrl: `/receipts/${transactionId}.pdf`
            });
          } else {
            this.paymentStatusSubject.next({
              transactionId,
              status: 'failed',
              progress: 100,
              currentStep: 'Paiement échoué',
              estimatedTime: 0,
              message: 'Paiement refusé'
            });
            
            observer.next({
              success: false,
              transactionId,
              status: 'failed',
              message: 'Paiement refusé par la banque',
              processingTime: method.processingTime,
              fees: 0,
              errorCode: 'PAYMENT_DECLINED',
              errorMessage: 'Fonds insuffisants ou carte bloquée'
            });
          }
          
          observer.complete();
        }
      }, method.processingTime / steps.length);

      // Nettoyer l'intervalle si l'observable est annulé
      return () => clearInterval(interval);
    });
  }

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

  // Vérifier le statut d'un paiement
  checkPaymentStatus(transactionId: string): Observable<PaymentStatus> {
    // Simulation - en réalité, on interrogerait l'API
    const status = this.paymentStatusSubject.value;
    if (status && status.transactionId === transactionId) {
      return of(status);
    }
    
    return of({
      transactionId,
      status: 'completed',
      progress: 100,
      currentStep: 'Paiement terminé',
      estimatedTime: 0,
      message: 'Paiement traité avec succès'
    });
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











































