import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { AuthService } from '../../core/services/auth.service';
import { Cart, Product } from '../../core/models';

@Component({
  selector: 'app-test-cart-wishlist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="test-container">
      <h2>🧪 Test des fonctionnalités Panier et Favoris</h2>
      
      <!-- État de l'authentification -->
      <div class="auth-status">
        <h3>État de l'authentification</h3>
        <p>Authentifié: {{ isAuthenticated ? 'Oui' : 'Non' }}</p>
        <button (click)="toggleAuth()" class="btn btn-primary">
          {{ isAuthenticated ? 'Se déconnecter' : 'Se connecter' }}
        </button>
      </div>

      <!-- Test des favoris -->
      <div class="wishlist-test">
        <h3>Test des Favoris</h3>
        <div class="test-actions">
          <button (click)="addToWishlist()" class="btn btn-success">Ajouter produit test aux favoris</button>
          <button (click)="removeFromWishlist()" class="btn btn-warning">Retirer des favoris</button>
          <button (click)="getWishlist()" class="btn btn-info">Charger la wishlist</button>
          <button (click)="clearWishlist()" class="btn btn-danger">Vider la wishlist</button>
        </div>
        <div class="wishlist-count">
          <p>Nombre d'articles dans les favoris: {{ wishlistCount }}</p>
        </div>
        <div class="wishlist-items" *ngIf="wishlistItems.length > 0">
          <h4>Articles dans les favoris:</h4>
          <ul>
            <li *ngFor="let item of wishlistItems">
              {{ item.name }} - {{ item.price }}€
            </li>
          </ul>
        </div>
      </div>

      <!-- Test du panier -->
      <div class="cart-test">
        <h3>Test du Panier</h3>
        <div class="test-actions">
          <button (click)="addToCart()" class="btn btn-success">Ajouter produit test au panier</button>
          <button (click)="getCart()" class="btn btn-info">Charger le panier</button>
          <button (click)="clearCart()" class="btn btn-danger">Vider le panier</button>
        </div>
        <div class="cart-info" *ngIf="cart">
          <p>Nombre d'articles: {{ cart.total_items }}</p>
          <p>Sous-total: {{ cart.subtotal }}€</p>
          <p>Total: {{ cart.total }}€</p>
        </div>
        <div class="cart-items" *ngIf="cart && cart.items.length > 0">
          <h4>Articles dans le panier:</h4>
          <ul>
            <li *ngFor="let item of cart.items">
              {{ item.product.name }} - Quantité: {{ item.quantity }} - Prix: {{ item.unit_price }}€
            </li>
          </ul>
        </div>
      </div>

      <!-- Logs -->
      <div class="logs">
        <h3>Logs</h3>
        <div class="log-container">
          <div *ngFor="let log of logs" class="log-item" [class]="log.type">
            {{ log.timestamp }} - {{ log.message }}
          </div>
        </div>
        <button (click)="clearLogs()" class="btn btn-secondary">Effacer les logs</button>
      </div>
    </div>
  `,
  styles: [`
    .test-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .auth-status, .wishlist-test, .cart-test, .logs {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    
    .test-actions {
      display: flex;
      gap: 10px;
      margin: 15px 0;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .btn-primary { background-color: #007bff; color: white; }
    .btn-success { background-color: #28a745; color: white; }
    .btn-warning { background-color: #ffc107; color: black; }
    .btn-info { background-color: #17a2b8; color: white; }
    .btn-danger { background-color: #dc3545; color: white; }
    .btn-secondary { background-color: #6c757d; color: white; }
    
    .log-container {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #ccc;
      padding: 10px;
      background-color: #f8f9fa;
    }
    
    .log-item {
      margin-bottom: 5px;
      padding: 5px;
      border-radius: 3px;
    }
    
    .log-item.success { background-color: #d4edda; color: #155724; }
    .log-item.error { background-color: #f8d7da; color: #721c24; }
    .log-item.info { background-color: #d1ecf1; color: #0c5460; }
  `]
})
export class TestCartWishlistComponent implements OnInit {
  isAuthenticated = false;
  wishlistCount = 0;
  wishlistItems: Product[] = [];
  cart: Cart | null = null;
  logs: Array<{timestamp: string, message: string, type: string}> = [];

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Écouter l'état d'authentification
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      this.addLog(`État d'authentification: ${isAuth ? 'Connecté' : 'Déconnecté'}`, 'info');
      
      if (isAuth) {
        this.cartService.loadCartData();
        this.wishlistService.loadWishlistData();
      }
    });

    // Écouter les changements du panier
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
      this.addLog(`Panier mis à jour: ${cart ? cart.total_items + ' articles' : 'vide'}`, 'info');
    });

    // Écouter les changements des favoris
    this.wishlistService.wishlistCount$.subscribe(count => {
      this.wishlistCount = count;
      this.addLog(`Favoris mis à jour: ${count} articles`, 'info');
    });
  }

  toggleAuth(): void {
    if (this.isAuthenticated) {
      this.authService.logout().subscribe({
        next: () => this.addLog('Déconnexion réussie', 'success'),
        error: (error) => this.addLog(`Erreur de déconnexion: ${error.message}`, 'error')
      });
    } else {
      // Simuler une connexion
      this.authService.login({ email: 'test@example.com', password: 'password' }).subscribe({
        next: () => this.addLog('Connexion réussie', 'success'),
        error: (error) => this.addLog(`Erreur de connexion: ${error.message}`, 'error')
      });
    }
  }

  addToWishlist(): void {
    const testProductId = '1';
    this.wishlistService.addToWishlist(testProductId).subscribe({
      next: (response) => {
        this.addLog(`Produit ${testProductId} ajouté aux favoris`, 'success');
      },
      error: (error) => {
        this.addLog(`Erreur ajout favoris: ${error.message}`, 'error');
      }
    });
  }

  removeFromWishlist(): void {
    const testProductId = '1';
    this.wishlistService.removeFromWishlist(testProductId).subscribe({
      next: (response) => {
        this.addLog(`Produit ${testProductId} retiré des favoris`, 'success');
      },
      error: (error) => {
        this.addLog(`Erreur suppression favoris: ${error.message}`, 'error');
      }
    });
  }

  getWishlist(): void {
    this.wishlistService.getWishlist().subscribe({
      next: (response) => {
        this.wishlistItems = response.data || [];
        this.addLog(`Wishlist chargée: ${this.wishlistItems.length} articles`, 'success');
      },
      error: (error) => {
        this.addLog(`Erreur chargement wishlist: ${error.message}`, 'error');
      }
    });
  }

  clearWishlist(): void {
    this.wishlistService.clearWishlist().subscribe({
      next: (response) => {
        this.wishlistItems = [];
        this.addLog('Wishlist vidée', 'success');
      },
      error: (error) => {
        this.addLog(`Erreur vidage wishlist: ${error.message}`, 'error');
      }
    });
  }

  addToCart(): void {
    const testProduct = {
      product_id: '1',
      quantity: 1
    };
    
    this.cartService.addToCart(testProduct).subscribe({
      next: (response) => {
        this.addLog(`Produit ajouté au panier: ${testProduct.product_id}`, 'success');
      },
      error: (error) => {
        this.addLog(`Erreur ajout panier: ${error.message}`, 'error');
      }
    });
  }

  getCart(): void {
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.addLog(`Panier chargé: ${cart.total_items} articles`, 'success');
      },
      error: (error) => {
        this.addLog(`Erreur chargement panier: ${error.message}`, 'error');
      }
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: (response) => {
        this.cart = null;
        this.addLog('Panier vidé', 'success');
      },
      error: (error) => {
        this.addLog(`Erreur vidage panier: ${error.message}`, 'error');
      }
    });
  }

  clearLogs(): void {
    this.logs = [];
  }

  private addLog(message: string, type: 'success' | 'error' | 'info'): void {
    this.logs.unshift({
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    });
    
    // Limiter à 50 logs
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(0, 50);
    }
  }
}
