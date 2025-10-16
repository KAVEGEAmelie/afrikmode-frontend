import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { PaymentSimulationService, PaymentResponse } from '../../../../core/services/payment-simulation.service';
import { PaymentSimulationComponent } from '../payment-simulation/payment-simulation.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, PaymentSimulationComponent],
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss']
})
export class PaymentModalComponent implements OnInit, OnDestroy {
  
  @Input() isOpen = false;
  @Input() amount: number = 0;
  @Input() currency: string = 'FCFA';
  @Input() orderId: string = '';
  @Input() customerInfo: any = {};
  
  @Output() paymentSuccess = new EventEmitter<PaymentResponse>();
  @Output() paymentError = new EventEmitter<string>();
  @Output() paymentCancelled = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();

  showSuccess = false;
  showError = false;
  successMessage = '';
  errorMessage = '';
  
  private paymentStatusSubscription?: Subscription;

  constructor(private paymentService: PaymentSimulationService) {}

  ngOnInit(): void {
    // S'abonner aux changements de statut de paiement
    this.paymentStatusSubscription = this.paymentService.paymentStatus$.subscribe(
      status => {
        if (status?.status === 'completed') {
          this.showSuccess = true;
          this.successMessage = 'Paiement traité avec succès !';
        } else if (status?.status === 'failed') {
          this.showError = true;
          this.errorMessage = 'Le paiement a échoué. Veuillez réessayer.';
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.paymentStatusSubscription) {
      this.paymentStatusSubscription.unsubscribe();
    }
  }

  onPaymentSuccess(response: PaymentResponse): void {
    this.showSuccess = true;
    this.successMessage = 'Paiement traité avec succès !';
    
    // Fermer automatiquement après 3 secondes
    setTimeout(() => {
      this.closeModal();
      this.paymentSuccess.emit(response);
    }, 3000);
  }

  onPaymentError(error: string): void {
    this.showError = true;
    this.errorMessage = error;
    this.paymentError.emit(error);
  }

  onPaymentCancelled(): void {
    this.closeModal();
    this.paymentCancelled.emit();
  }

  closeModal(): void {
    this.isOpen = false;
    this.showSuccess = false;
    this.showError = false;
    this.successMessage = '';
    this.errorMessage = '';
    this.paymentService.resetPaymentStatus();
    this.modalClosed.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  onEscapeKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Escape') {
      this.closeModal();
    }
  }
}
