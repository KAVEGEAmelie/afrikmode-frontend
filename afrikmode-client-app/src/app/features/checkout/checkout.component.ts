import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaymentModalComponent } from '../payment/components/payment-modal/payment-modal.component';
import { PaymentSimulationService, PaymentResponse } from '../../core/services/payment-simulation.service';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CommonModule, PaymentModalComponent],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  currentStep: number = 1;
  
  // Cart items
  cartItems: CartItem[] = [
    { id: 1, name: 'Robe Ankara Élégante', price: 45000, image: '/assets/images/products/robe-1.jpg', quantity: 1 },
    { id: 2, name: 'Chemise Wax Premium', price: 35000, image: '/assets/images/products/chemise-1.jpg', quantity: 2 }
  ];

  // Shipping info
  shippingAddress: ShippingAddress = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Togo'
  };

  // Shipping method
  shippingMethod: string = 'standard';
  shippingOptions = [
    { id: 'standard', name: 'Livraison Standard', duration: '3-5 jours', price: 2500 },
    { id: 'express', name: 'Livraison Express', duration: '1-2 jours', price: 5000 },
    { id: 'pickup', name: 'Retrait en magasin', duration: 'Immédiat', price: 0 }
  ];

  // Payment method
  paymentMethod: string = 'card';
  
  // Card info
  cardInfo = {
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  };

  // Mobile money
  mobileMoneyProvider: string = '';
  mobileMoneyNumber: string = '';

  // Terms
  acceptTerms: boolean = false;

  isProcessing: boolean = false;

  // Payment modal
  showPaymentModal = false;
  paymentInProgress = false;

  constructor(private paymentService: PaymentSimulationService) {}

  ngOnInit(): void {
    // Vérifier si le panier n'est pas vide
  }

  // Navigation entre étapes
  goToStep(step: number): void {
    if (step > this.currentStep) {
      if (this.validateCurrentStep()) {
        this.currentStep = step;
      }
    } else {
      this.currentStep = step;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextStep(): void {
    if (this.validateCurrentStep()) {
      this.currentStep++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Validation
  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.validateShippingInfo();
      case 2:
        return true; // Shipping method always valid
      case 3:
        return this.validatePaymentInfo();
      default:
        return true;
    }
  }

  validateShippingInfo(): boolean {
    const s = this.shippingAddress;
    if (!s.firstName || !s.lastName || !s.email || !s.phone || !s.address || !s.city) {
      alert('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(s.email)) {
      alert('Adresse email invalide');
      return false;
    }

    return true;
  }

  validatePaymentInfo(): boolean {
    if (this.paymentMethod === 'card') {
      if (!this.cardInfo.number || !this.cardInfo.name || !this.cardInfo.expiry || !this.cardInfo.cvv) {
        alert('Veuillez remplir toutes les informations de carte');
        return false;
      }
    } else if (this.paymentMethod === 'mobile') {
      if (!this.mobileMoneyProvider || !this.mobileMoneyNumber) {
        alert('Veuillez sélectionner un opérateur et entrer votre numéro');
        return false;
      }
    }

    if (!this.acceptTerms) {
      alert('Veuillez accepter les conditions générales');
      return false;
    }

    return true;
  }

  // Calculs
  getSubtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getShippingCost(): number {
    const selected = this.shippingOptions.find(opt => opt.id === this.shippingMethod);
    return selected ? selected.price : 0;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShippingCost();
  }

  // Soumettre la commande
  submitOrder(): void {
    if (!this.validateCurrentStep()) return;

    // Ouvrir le modal de paiement
    this.showPaymentModal = true;
    this.paymentInProgress = true;
  }

  // Gestion des événements de paiement
  onPaymentSuccess(response: PaymentResponse): void {
    console.log('Paiement réussi:', response);
    
    // Créer la commande
    this.createOrder(response);
  }

  onPaymentError(error: string): void {
    console.error('Erreur de paiement:', error);
    this.paymentInProgress = false;
    alert(`Erreur de paiement: ${error}`);
  }

  onPaymentCancelled(): void {
    console.log('Paiement annulé');
    this.paymentInProgress = false;
  }

  onPaymentModalClosed(): void {
    this.showPaymentModal = false;
    this.paymentInProgress = false;
  }

  // Créer la commande après paiement réussi
  private createOrder(paymentResponse: PaymentResponse): void {
    this.isProcessing = true;

    const orderData = {
      items: this.cartItems,
      shipping: this.shippingAddress,
      shippingMethod: this.shippingMethod,
      paymentMethod: this.paymentMethod,
      paymentResponse: paymentResponse,
      total: this.getTotal(),
      orderId: this.generateOrderId()
    };

    console.log('Commande créée:', orderData);

    // Simulation de création de commande
    setTimeout(() => {
      this.isProcessing = false;
      this.paymentInProgress = false;
      this.showPaymentModal = false;
      
      // Rediriger vers page de confirmation
      alert(`Commande ${orderData.orderId} passée avec succès !`);
      // TODO: Rediriger vers page de confirmation
    }, 1500);
  }

  // Générer un ID de commande
  generateOrderId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `AFM-${timestamp}-${random}`.toUpperCase();
  }
}