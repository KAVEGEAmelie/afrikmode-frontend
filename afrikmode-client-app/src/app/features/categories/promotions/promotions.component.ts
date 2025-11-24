import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { SafeImagePipe } from '../../../core/pipes/safe-image.pipe';
import { environment } from '../../../../environments/environment';

interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  discount: number;
  rating?: number;
  reviews?: number;
}

@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [CommonModule, RouterModule, NgFor, SafeImagePipe],
  templateUrl: './promotions.component.html',
  styleUrls: ['./promotions.component.scss']
})
export class PromotionsComponent implements OnInit {
  promotionalOffers: any[] = [
    {
      title: 'Soldes d\'Été',
      description: 'Jusqu\'à 50% de réduction sur toute la collection été',
      discount: 50,
      endDate: '2025-12-31',
      image: 'https://via.placeholder.com/400x300?text=Soldes+Été',
      category: 'Toutes catégories'
    },
    {
      title: 'Nouvelle Collection',
      description: '20% de réduction sur les nouveautés',
      discount: 20,
      endDate: '2025-12-31',
      image: 'https://via.placeholder.com/400x300?text=Nouvelle+Collection',
      category: 'Nouveautés'
    }
  ];
  saleProducts: Product[] = [];
  loading = false;

  constructor(
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private toastService: ToastService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    // Charger tous les produits actifs
    this.productService.getProducts({
      limit: 100,
      status: 'active'
    }).subscribe({
      next: (response: any) => {
        const products = Array.isArray(response) ? response : response.data || [];
        // Filtrer les produits avec compare_at_price > price (produits en promotion)
        this.saleProducts = products
          .filter((product: any) => {
            const comparePrice = product.compareAtPrice || product.compare_at_price || product.compare_price;
            return comparePrice && comparePrice > product.price;
          })
          .map((product: any) => {
            const comparePrice = product.compareAtPrice || product.compare_at_price || product.compare_price;
            const discount = Math.round(((comparePrice - product.price) / comparePrice) * 100);
            return {
              id: product.id,
              name: product.name,
              price: product.price,
              oldPrice: comparePrice,
              image: this.normalizeProductImage(product),
              discount: discount,
              rating: product.averageRating || product.average_rating || 0,
              reviews: product.reviewsCount || product.reviews_count || 0
            };
          })
          .sort((a, b) => b.discount - a.discount) // Trier par réduction décroissante
          .slice(0, 20); // Limiter à 20 produits
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement promotions:', error);
        this.loading = false;
      }
    });
  }

  private normalizeProductImage(product: any): string {
    const buildImageUrl = (imgPath: string): string => {
      if (!imgPath || imgPath.trim() === '') return '';
      if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath;
      if (imgPath.startsWith('/')) {
        const cleanPath = imgPath.substring(1);
        return `${environment.apiUrl}/${cleanPath}`;
      }
      if (imgPath.includes('uploads/')) return `${environment.apiUrl}/${imgPath}`;
      if (imgPath.startsWith('assets/')) return '/' + imgPath;
      return `${environment.apiUrl}/uploads/products/${imgPath}`;
    };

    if (product.images) {
      if (Array.isArray(product.images) && product.images.length > 0) {
        const firstImage = product.images[0];
        if (typeof firstImage === 'string') return buildImageUrl(firstImage);
        if (typeof firstImage === 'object') {
          const url = firstImage.url || firstImage.path || firstImage.image_url || '';
          return buildImageUrl(url);
        }
      }
      if (typeof product.images === 'string') {
        if (product.images.trim().startsWith('[') || product.images.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(product.images);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const firstImage = parsed[0];
              if (typeof firstImage === 'string') return buildImageUrl(firstImage);
              if (typeof firstImage === 'object') {
                const url = firstImage.url || firstImage.path || firstImage.image_url || '';
                return buildImageUrl(url);
              }
            }
          } catch {
            return buildImageUrl(product.images);
          }
        } else {
          return buildImageUrl(product.images);
        }
      }
    }

    if (product.primaryImage) return buildImageUrl(product.primaryImage);
    if (product.primary_image) return buildImageUrl(product.primary_image);
    if (product.image_url) return buildImageUrl(product.image_url);

    return `https://via.placeholder.com/300x300?text=${encodeURIComponent(product.name || 'Produit')}`;
  }

  addToCart(product: Product): void {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (!isAuth) {
        this.toastService.warning('Veuillez vous connecter pour ajouter des produits au panier');
        this.router.navigate(['/login']);
        return;
      }

      this.cartService.addToCart({
        product_id: product.id.toString(),
        quantity: 1
      }).subscribe({
        next: () => {
          this.toastService.success(`${product.name} ajouté au panier !`);
        },
        error: (error) => {
          console.error('Erreur ajout au panier:', error);
          this.toastService.error('Erreur lors de l\'ajout au panier');
        }
      });
    });
  }

  getRemainingDays(endDate: string): number {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = Math.abs(end.getTime() - now.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  navigateToProduct(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }

  encodeURI(text: string): string {
    return encodeURIComponent(text || '');
  }
}