import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Cart, CartItem } from '../../core/models';

// Interface locale pour l'affichage (différente du modèle API)
interface CartItemDisplay {
  id: number;
  productId: number;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
  maxStock: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  cartItems: CartItemDisplay[] = [
    {
      id: 1,
      productId: 1,
      name: 'Robe Ankara Élégante',
      price: 45000,
      image: '/assets/images/products/robe-1.jpg',
      color: 'Rouge & Or',
      size: 'M',
      quantity: 1,
      maxStock: 5
    },
    {
      id: 2,
      productId: 2,
      name: 'Chemise Wax Premium',
      price: 35000,
      image: '/assets/images/products/chemise-1.jpg',
      color: 'Multicolore',
      size: 'L',
      quantity: 2,
      maxStock: 10
    },
    {
      id: 3,
      productId: 4,
      name: 'Sac à Main Artisanal',
      price: 25000,
      image: '/assets/images/products/sac-1.jpg',
      color: 'Marron',
      size: 'Unique',
      quantity: 1,
      maxStock: 3
    }
  ];

  promoCode: string = '';
  promoApplied: boolean = false;
  promoDiscount: number = 0;
  promoError: string = '';

  shippingCost: number = 2500;
  freeShippingThreshold: number = 50000;

  constructor(
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Charger le panier depuis le service
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
      if (cart) {
        // Convertir les items du panier API vers le format d'affichage
        this.cartItems = cart.items.map(item => ({
          id: parseInt(item.id),
          productId: parseInt(item.product_id),
          name: item.product.name,
          price: item.unit_price,
          image: item.product.image_url || (item.product.images && item.product.images.length > 0 ? item.product.images[0].url : '/assets/images/products/default.jpg'),
          color: item.variant?.attributes?.['color'] || 'Non spécifié',
          size: item.variant?.attributes?.['size'] || 'Non spécifié',
          quantity: item.quantity,
          maxStock: 10 // Valeur par défaut, devrait venir de l'API
        }));
      } else {
        this.cartItems = [];
      }
    });

    // Charger les données du panier si l'utilisateur est authentifié
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.cartService.loadCartData();
      }
    });
  }

  // Calculs
  getSubtotal(): number {
    return this.cart ? this.cart.subtotal : 0;
  }

  getShipping(): number {
    return this.getSubtotal() >= this.freeShippingThreshold ? 0 : this.shippingCost;
  }

  getDiscount(): number {
    if (this.promoApplied) {
      return (this.getSubtotal() * this.promoDiscount) / 100;
    }
    return 0;
  }

  getTotal(): number {
    return this.cart ? this.cart.total : 0;
  }

  getRemainingForFreeShipping(): number {
    const remaining = this.freeShippingThreshold - this.getSubtotal();
    return remaining > 0 ? remaining : 0;
  }

  // Gestion quantité
  updateQuantity(item: CartItemDisplay, newQuantity: number): void {
    if (newQuantity < 1 || newQuantity > item.maxStock) return;
    
    // Mettre à jour via le service
    this.cartService.updateCartItem(item.id.toString(), { quantity: newQuantity }).subscribe({
      next: () => {
        console.log('✅ Quantité mise à jour');
      },
      error: (error) => {
        console.error('❌ Erreur lors de la mise à jour:', error);
        alert('Erreur lors de la mise à jour de la quantité');
      }
    });
  }

  incrementQuantity(item: CartItemDisplay): void {
    if (item.quantity < item.maxStock) {
      this.updateQuantity(item, item.quantity + 1);
    }
  }

  decrementQuantity(item: CartItemDisplay): void {
    if (item.quantity > 1) {
      this.updateQuantity(item, item.quantity - 1);
    }
  }

  // Suppression
  removeItem(itemId: number): void {
    if (confirm('Voulez-vous vraiment supprimer cet article ?')) {
      this.cartService.removeFromCart(itemId.toString()).subscribe({
        next: () => {
          console.log('✅ Article supprimé du panier');
        },
        error: (error) => {
          console.error('❌ Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression de l\'article');
        }
      });
    }
  }

  clearCart(): void {
    if (confirm('Voulez-vous vraiment vider votre panier ?')) {
      this.cartService.clearCart().subscribe({
        next: () => {
          console.log('✅ Panier vidé');
          this.promoApplied = false;
          this.promoCode = '';
        },
        error: (error) => {
          console.error('❌ Erreur lors du vidage:', error);
          alert('Erreur lors du vidage du panier');
        }
      });
    }
  }

  // Code promo
  applyPromoCode(): void {
    this.promoError = '';
    
    if (!this.promoCode.trim()) {
      this.promoError = 'Veuillez entrer un code promo';
      return;
    }

    // Appliquer le code promo via le service
    this.cartService.applyCoupon(this.promoCode).subscribe({
      next: (cart) => {
        console.log('✅ Code promo appliqué');
        this.promoApplied = true;
        this.promoDiscount = cart.discount_amount || 0;
      },
      error: (error) => {
        console.error('❌ Erreur lors de l\'application du code promo:', error);
        this.promoError = 'Code promo invalide ou expiré';
      }
    });
  }

  removePromoCode(): void {
    this.cartService.removeCoupon().subscribe({
      next: () => {
        console.log('✅ Code promo supprimé');
        this.promoApplied = false;
        this.promoCode = '';
        this.promoDiscount = 0;
        this.promoError = '';
      },
      error: (error) => {
        console.error('❌ Erreur lors de la suppression du code promo:', error);
      }
    });
  }

  // Navigation
  continueShopping(): void {
    // Navigation vers la boutique
  }

  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      alert('Votre panier est vide');
      return;
    }
    // Navigation vers checkout
    console.log('Proceeding to checkout');
  }
}