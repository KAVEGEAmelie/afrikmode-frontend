import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { PaymentModalComponent } from '../components/payment-modal/payment-modal.component';
import { PaymentSimulationService, PaymentResponse } from '../../../core/services/payment-simulation.service';

@Component({
  selector: 'app-payment-demo',
  standalone: true,
  imports: [CommonModule, NgIf, PaymentModalComponent],
  templateUrl: './payment-demo.component.html',
  styleUrls: ['./payment-demo.component.scss']
})
export class PaymentDemoComponent implements OnInit {
  
  showPaymentModal = false;
  paymentAmount = 50000; // 50,000 FCFA
  currency = 'FCFA';
  orderId = 'AFM-DEMO-' + Date.now();
  
  customerInfo = {
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    phone: '+228 XX XX XX XX'
  };

  // Résultats de paiement
  lastPaymentResult: PaymentResponse | null = null;
  paymentHistory: PaymentResponse[] = [];

  constructor(private paymentService: PaymentSimulationService) {}

  ngOnInit(): void {
    // Charger l'historique des paiements depuis le localStorage
    this.loadPaymentHistory();
  }

  openPaymentModal(): void {
    this.showPaymentModal = true;
  }

  onPaymentSuccess(response: PaymentResponse): void {
    console.log('Paiement réussi:', response);
    this.lastPaymentResult = response;
    this.paymentHistory.unshift(response);
    this.savePaymentHistory();
    
    // Afficher une notification de succès
    this.showNotification('Paiement traité avec succès !', 'success');
  }

  onPaymentError(error: string): void {
    console.error('Erreur de paiement:', error);
    this.showNotification(`Erreur de paiement: ${error}`, 'error');
  }

  onPaymentCancelled(): void {
    console.log('Paiement annulé');
    this.showNotification('Paiement annulé', 'warning');
  }

  onPaymentModalClosed(): void {
    this.showPaymentModal = false;
  }

  // Simuler différents montants
  setAmount(amount: number): void {
    this.paymentAmount = amount;
  }

  // Simuler différents clients
  setCustomer(customer: any): void {
    this.customerInfo = customer;
  }

  // Charger l'historique des paiements
  private loadPaymentHistory(): void {
    const history = localStorage.getItem('paymentHistory');
    if (history) {
      this.paymentHistory = JSON.parse(history);
    }
  }

  // Sauvegarder l'historique des paiements
  private savePaymentHistory(): void {
    localStorage.setItem('paymentHistory', JSON.stringify(this.paymentHistory));
  }

  // Afficher une notification
  private showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    // Simulation d'une notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 2rem;
      border-radius: 10px;
      color: white;
      font-weight: 600;
      z-index: 10000;
      animation: slideInRight 0.3s ease;
    `;
    
    if (type === 'success') {
      notification.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
    } else if (type === 'error') {
      notification.style.background = 'linear-gradient(135deg, #dc3545, #e74c3c)';
    } else if (type === 'warning') {
      notification.style.background = 'linear-gradient(135deg, #ffc107, #fd7e14)';
    } else if (type === 'info') {
      notification.style.background = 'linear-gradient(135deg, #17a2b8, #6f42c1)';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // Vider l'historique
  clearHistory(): void {
    this.paymentHistory = [];
    localStorage.removeItem('paymentHistory');
  }

  // Obtenir le statut d'un paiement
  getPaymentStatus(transactionId: string): void {
    this.paymentService.checkPaymentStatus(transactionId).subscribe(status => {
      console.log('Statut du paiement:', status);
      this.showNotification(`Statut: ${status.status}`, 'info');
    });
  }
}
