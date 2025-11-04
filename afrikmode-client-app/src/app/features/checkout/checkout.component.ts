import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaymentModalComponent } from '../payment/components/payment-modal/payment-modal.component';
import { PaymentSimulationService, PaymentResponse } from '../../core/services/payment-simulation.service';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AddressService } from '../../core/services/address.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Cart } from '../../core/models';

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
  imports: [CommonModule, RouterModule, FormsModule, NgIf, NgFor, PaymentModalComponent],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  currentStep: number = 1;
  
  // Cart items
  cartItems: CartItem[] = [];
  cart: Cart | null = null;
  userAddresses: any[] = [];
  selectedAddressId: string | null | undefined = null;

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

  constructor(
    private paymentService: PaymentSimulationService,
    private cartService: CartService,
    private orderService: OrderService,
    private addressService: AddressService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Charger le panier depuis le service
    this.loadCart();
    // Charger les adresses de l'utilisateur
    this.loadAddresses();
  }

  loadCart(): void {
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
      if (cart && cart.items) {
        this.cartItems = cart.items.map(item => ({
          id: parseInt(item.id),
          name: item.product.name,
          price: item.unit_price,
          image: item.product.image_url || (item.product.images && item.product.images.length > 0 
            ? item.product.images[0].url 
            : '/assets/images/products/default.jpg'),
          quantity: item.quantity
        }));
        
        // Si le panier est vide, rediriger vers le panier
        if (this.cartItems.length === 0) {
          this.router.navigate(['/cart']);
        }
      } else {
        // Si pas de panier, charger depuis l'API
        this.cartService.loadCartData();
      }
    });

    // Charger le panier si pas déjà chargé
    if (this.authService.isAuthenticated()) {
      this.cartService.loadCartData();
    }
  }

  loadAddresses(): void {
    if (this.authService.isAuthenticated()) {
      this.addressService.getAddresses().subscribe({
        next: (addresses) => {
          this.userAddresses = addresses;
          // Sélectionner l'adresse par défaut si disponible
          const defaultAddress = addresses.find((addr: any) => addr.is_default_shipping);
          if (defaultAddress && defaultAddress.id) {
            this.selectedAddressId = defaultAddress.id || null;
            this.fillAddressFromDefault(defaultAddress);
          }
        },
        error: (error) => {
          console.error('Erreur chargement adresses:', error);
        }
      });
    }
  }

  fillAddressFromDefault(address: any): void {
    this.shippingAddress = {
      firstName: address.first_name || '',
      lastName: address.last_name || '',
      email: this.authService.getCurrentUser()?.email || '',
      phone: address.phone || '',
      address: address.address_line_1 || '',
      city: address.city || '',
      postalCode: address.postal_code || '',
      country: address.country || 'Togo'
    };
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
    return this.cart ? this.cart.subtotal : this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getShippingCost(): number {
    const selected = this.shippingOptions.find(opt => opt.id === this.shippingMethod);
    return selected ? selected.price : 0;
  }

  getDiscount(): number {
    return this.cart ? (this.cart.discount_amount || 0) : 0;
  }

  getTotal(): number {
    if (this.cart) {
      return this.cart.total;
    }
    return this.getSubtotal() + this.getShippingCost() - this.getDiscount();
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

    if (!this.cart || this.cartItems.length === 0) {
      this.toastService.error('Votre panier est vide');
      this.isProcessing = false;
      this.paymentInProgress = false;
      this.showPaymentModal = false;
      return;
    }

    // Préparer les données de commande
    const orderData = {
      items: this.cart.items.map(item => ({
        productId: item.product_id,
        quantity: item.quantity,
        variantName: item.variant?.name,
        customization: item.customization
      })),
      deliveryAddress: {
        first_name: this.shippingAddress.firstName,
        last_name: this.shippingAddress.lastName,
        address_line_1: this.shippingAddress.address,
        city: this.shippingAddress.city,
        postal_code: this.shippingAddress.postalCode,
        country: this.shippingAddress.country,
        phone: this.shippingAddress.phone
      },
      billingAddress: this.selectedAddressId ? { address_id: this.selectedAddressId } : undefined,
      paymentMethod: this.paymentMethod,
      phoneNumber: this.shippingAddress.phone,
      customerNotes: '',
      deliveryMethod: this.shippingMethod,
      couponCode: this.cart.coupon_code || undefined
    };

    // Créer la commande via l'API
    this.orderService.createOrder(orderData).subscribe({
      next: (order) => {
        console.log('✅ Commande créée:', order);
        this.isProcessing = false;
        this.paymentInProgress = false;
        this.showPaymentModal = false;
        
        // Vider le panier
        this.cartService.clearCart().subscribe({
          next: () => {
            console.log('✅ Panier vidé après commande');
          },
          error: (err) => {
            console.error('Erreur vidage panier:', err);
          }
        });

        // Rediriger vers la page de confirmation
        this.router.navigate(['/order-confirmation'], {
          queryParams: { orderId: order.id }
        });

        this.toastService.success(`Commande ${order.order_number} passée avec succès !`);
      },
      error: (error) => {
        console.error('❌ Erreur création commande:', error);
      this.isProcessing = false;
      this.paymentInProgress = false;
      this.showPaymentModal = false;
      
        const errorMessage = error.error?.message || 'Erreur lors de la création de la commande';
        this.toastService.error(errorMessage);
      }
    });
  }
}