import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { CartService } from '../../../../core/services/cart.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Product } from '../../../../core/models';

interface WishlistItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  rating: number;
  inStock: boolean;
  addedDate: Date;
}

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgIf, NgFor],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {
  wishlistItems: Product[] = [];
  loading = false;

  viewMode: 'grid' | 'list' = 'grid';

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Charger la wishlist depuis le service
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.loading = true;
    this.wishlistService.getWishlist().subscribe({
      next: (response) => {
        this.wishlistItems = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement de la wishlist:', error);
        this.loading = false;
      }
    });
  }

  removeFromWishlist(productId: string): void {
    if (confirm('Voulez-vous vraiment retirer cet article de vos favoris ?')) {
      this.wishlistService.removeFromWishlist(productId).subscribe({
        next: () => {
          console.log('✅ Article retiré des favoris');
          this.wishlistItems = this.wishlistItems.filter(item => item.id !== productId);
        },
        error: (error) => {
          console.error('❌ Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression de l\'article');
        }
      });
    }
  }

  addToCart(product: Product, event: Event): void {
    event.stopPropagation();
    
    this.cartService.addToCart({
      product_id: product.id.toString(),
      quantity: 1
    }).subscribe({
      next: (cartItem) => {
        console.log('✅ Produit ajouté au panier:', cartItem);
        alert('Produit ajouté au panier avec succès!');
      },
      error: (error) => {
        console.error('❌ Erreur lors de l\'ajout au panier:', error);
        alert('Erreur lors de l\'ajout au panier. Veuillez réessayer.');
      }
    });
  }

  clearWishlist(): void {
    if (confirm('Voulez-vous vraiment vider votre liste de favoris ?')) {
      this.wishlistService.clearWishlist().subscribe({
        next: () => {
          console.log('✅ Wishlist vidée');
          this.wishlistItems = [];
        },
        error: (error) => {
          console.error('❌ Erreur lors du vidage:', error);
          alert('Erreur lors du vidage de la wishlist');
        }
      });
    }
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  getDiscount(product: Product): number {
    if (product.compare_price && product.price) {
      return Math.round(((product.compare_price - product.price) / product.compare_price) * 100);
    }
    return 0;
  }

  getStarArray(rating: number): string[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push('full');
      } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
        stars.push('half');
      } else {
        stars.push('empty');
      }
    }
    return stars;
  }

  shareWishlist(): void {
    console.log('Partager la wishlist');
    // TODO: Implémenter le partage
  }
}