import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentSimulationService, PaymentMethod, PaymentRequest, PaymentResponse, PaymentStatus } from '../../../../core/services/payment-simulation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-payment-simulation',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor],
  templateUrl: './payment-simulation.component.html',
  styleUrls: ['./payment-simulation.component.scss']
})
export class PaymentSimulationComponent implements OnInit, OnDestroy {
  
  @Input() amount: number = 0;
  @Input() currency: string = 'FCFA';
  @Input() orderId: string = '';
  @Input() customerInfo: any = {};
  
  @Output() paymentSuccess = new EventEmitter<PaymentResponse>();
  @Output() paymentError = new EventEmitter<string>();
  @Output() paymentCancelled = new EventEmitter<void>();

  paymentMethods: PaymentMethod[] = [];
  selectedMethod: string = 'card';
  isProcessing = false;
  currentStep = 0;
  totalSteps = 0;
  paymentStatus: PaymentStatus | null = null;
  
  // Informations de carte
  cardInfo = {
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  };
  
  // Informations Mobile Money
  mobileMoneyInfo = {
    provider: '',
    number: ''
  };
  
  // États de l'interface
  showCardForm = false;
  showMobileForm = false;
  showBankForm = false;
  showCodInfo = false;
  
  private paymentStatusSubscription?: Subscription;

  constructor(private paymentService: PaymentSimulationService) {}

  ngOnInit(): void {
    this.loadPaymentMethods();
    this.updateFormVisibility();
    
    // S'abonner aux mises à jour de statut
    this.paymentStatusSubscription = this.paymentService.paymentStatus$.subscribe(
      status => {
        this.paymentStatus = status;
        if (status) {
          this.currentStep = Math.floor(status.progress / (100 / this.totalSteps));
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.paymentStatusSubscription) {
      this.paymentStatusSubscription.unsubscribe();
    }
  }

  loadPaymentMethods(): void {
    this.paymentService.getAvailablePaymentMethods().subscribe(methods => {
      this.paymentMethods = methods;
    });
  }

  onMethodChange(): void {
    this.updateFormVisibility();
    this.resetForms();
  }

  updateFormVisibility(): void {
    this.showCardForm = this.selectedMethod === 'card';
    this.showMobileForm = this.selectedMethod === 'mobile_money';
    this.showBankForm = this.selectedMethod === 'bank_transfer';
    this.showCodInfo = this.selectedMethod === 'cash_on_delivery';
  }

  resetForms(): void {
    this.cardInfo = { number: '', name: '', expiry: '', cvv: '' };
    this.mobileMoneyInfo = { provider: '', number: '' };
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s/g, '');
    value = value.replace(/(.{4})/g, '$1 ').trim();
    this.cardInfo.number = value;
  }

  formatExpiry(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.cardInfo.expiry = value;
  }

  formatCvv(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    this.cardInfo.cvv = value.substring(0, 4);
  }

  formatPhoneNumber(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.startsWith('228')) {
      value = '+' + value;
    } else if (!value.startsWith('+')) {
      value = '+228' + value;
    }
    this.mobileMoneyInfo.number = value;
  }

  validateForm(): boolean {
    if (this.selectedMethod === 'card') {
      return !!(this.cardInfo.number && this.cardInfo.name && this.cardInfo.expiry && this.cardInfo.cvv);
    } else if (this.selectedMethod === 'mobile_money') {
      return !!(this.mobileMoneyInfo.provider && this.mobileMoneyInfo.number);
    }
    return true;
  }

  processPayment(): void {
    if (!this.validateForm()) {
      this.paymentError.emit('Veuillez remplir tous les champs requis');
      return;
    }

    this.isProcessing = true;
    this.totalSteps = this.getProcessingSteps().length;
    this.currentStep = 0;

    const paymentRequest: PaymentRequest = {
      amount: this.amount,
      currency: this.currency,
      method: this.selectedMethod,
      orderId: this.orderId,
      customerInfo: this.customerInfo,
      cardInfo: this.selectedMethod === 'card' ? this.cardInfo : undefined,
      mobileMoneyInfo: this.selectedMethod === 'mobile_money' ? this.mobileMoneyInfo : undefined
    };

    this.paymentService.processPayment(paymentRequest).subscribe({
      next: (response: PaymentResponse) => {
        this.isProcessing = false;
        if (response.success) {
          this.paymentSuccess.emit(response);
        } else {
          this.paymentError.emit(response.errorMessage || 'Erreur de paiement');
        }
      },
      error: (error) => {
        this.isProcessing = false;
        this.paymentError.emit(error.message || 'Erreur de paiement');
      }
    });
  }

  cancelPayment(): void {
    if (this.paymentStatus?.transactionId) {
      this.paymentService.cancelPayment(this.paymentStatus.transactionId).subscribe(success => {
        if (success) {
          this.isProcessing = false;
          this.paymentCancelled.emit();
        }
      });
    } else {
      this.isProcessing = false;
      this.paymentCancelled.emit();
    }
  }

  getProcessingSteps(): string[] {
    switch (this.selectedMethod) {
      case 'card':
        return [
          'Validation des informations de carte',
          'Vérification des fonds disponibles',
          'Authentification 3D Secure',
          'Traitement de la transaction',
          'Finalisation du paiement'
        ];
      case 'mobile_money':
        return [
          'Validation du numéro de téléphone',
          'Vérification du solde Mobile Money',
          'Envoi de la demande de paiement',
          'Attente de confirmation',
          'Finalisation du paiement'
        ];
      case 'bank_transfer':
        return [
          'Validation des informations bancaires',
          'Initiation du virement',
          'Vérification de la transaction',
          'Traitement par la banque',
          'Confirmation du virement'
        ];
      case 'cash_on_delivery':
        return [
          'Validation de la commande',
          'Préparation pour livraison',
          'Paiement différé confirmé'
        ];
      default:
        return ['Traitement en cours'];
    }
  }

  getSelectedMethod(): PaymentMethod | undefined {
    return this.paymentMethods.find(m => m.id === this.selectedMethod);
  }

  getFees(): number {
    return this.paymentService.calculateFees(this.amount, this.selectedMethod);
  }

  getTotalAmount(): number {
    return this.amount + this.getFees();
  }

  getProgressPercentage(): number {
    if (!this.paymentStatus) return 0;
    return this.paymentStatus.progress;
  }

  getEstimatedTime(): string {
    if (!this.paymentStatus || this.paymentStatus.estimatedTime <= 0) return '';
    
    const minutes = Math.floor(this.paymentStatus.estimatedTime / 60);
    const seconds = Math.floor(this.paymentStatus.estimatedTime % 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }
}











































