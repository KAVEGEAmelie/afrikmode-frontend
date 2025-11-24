import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
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
  category: string;
  isNew?: boolean;
  discount?: number;
}

@Component({
  selector: 'app-nouveautes',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf, NgFor, SafeImagePipe],
  templateUrl: './nouveautes.component.html',
  styleUrls: ['./nouveautes.component.scss']
})
export class NouveautesComponent implements OnInit {
  featuredProducts: Product[] = [];
  loading = false;
  
  collections = [
    {
      title: 'Collection Printemps 2025',
      description: 'Découvrez notre nouvelle collection inspirée des couleurs vives du printemps africain.',
      image: 'https://via.placeholder.com/400x300?text=Collection+Printemps',
      itemCount: 42
    },
    {
      title: 'Édition Limitée Wax Premium',
      description: 'Des pièces uniques confectionnées avec les plus beaux tissus Wax du continent.',
      image: 'https://via.placeholder.com/400x300?text=Wax+Premium',
      itemCount: 18
    },
    {
      title: 'Fusion Moderne',
      description: 'L\'alliance parfaite entre tradition africaine et tendances contemporaines.',
      image: 'https://via.placeholder.com/400x300?text=Fusion+Moderne',
      itemCount: 35
    }
  ];

  trends = [
    {
      title: 'Imprimés Géométriques',
      description: 'Les motifs géométriques font leur grand retour cette saison',
      icon: '🔸'
    },
    {
      title: 'Couleurs Terre',
      description: 'Les tons ocre, terracotta et safran sont à l\'honneur',
      icon: '🌍'
    },
    {
      title: 'Coupes Oversize',
      description: 'Le confort rencontre l\'élégance dans des silhouettes amples',
      icon: '👗'
    },
    {
      title: 'Accessoires Dorés',
      description: 'Les bijoux et ceintures dorées subliment chaque tenue',
      icon: '✨'
    }
  ];

  constructor(
    private router: Router,
    private wishlistService: WishlistService,
    private toastService: ToastService,
    private authService: AuthService,
    private productService: ProductService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    // Charger les produits les plus récents
    this.productService.getProducts({
      limit: 20,
      sort: 'newest',
      status: 'active'
    }).subscribe({
      next: (response: any) => {
        const products = Array.isArray(response) ? response : response.data || [];
        this.featuredProducts = products.map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          oldPrice: product.compareAtPrice || product.compare_at_price || product.compare_price,
          image: this.normalizeProductImage(product),
          category: product.category?.name || product.category_name || 'Nouveauté',
          isNew: true,
          discount: (product.compareAtPrice || product.compare_at_price || product.compare_price) 
            ? Math.round(((product.compareAtPrice || product.compare_at_price || product.compare_price - product.price) / (product.compareAtPrice || product.compare_at_price || product.compare_price)) * 100) 
            : 0
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement nouveautés:', error);
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

  addToWishlist(product: any): void {
    // Vérifier si l'utilisateur est connecté
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (!isAuth) {
        this.toastService.error('Veuillez vous connecter pour ajouter des produits aux favoris');
        this.router.navigate(['/login'], { 
          queryParams: { returnUrl: this.router.url } 
        });
        return;
      }

      // Ajouter le produit aux favoris
      const productId = product.id?.toString() || product;
      this.wishlistService.addToWishlist(productId).subscribe({
        next: (response) => {
          this.toastService.success('Produit ajouté aux favoris !');
          console.log('✅ Produit ajouté aux favoris:', product);
        },
        error: (error) => {
          console.error('❌ Erreur ajout aux favoris:', error);
          if (error.status === 409) {
            this.toastService.info('Ce produit est déjà dans vos favoris');
          } else {
            this.toastService.error('Erreur lors de l\'ajout aux favoris');
          }
        }
      });
    });
  }

  viewProduct(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }

  encodeURI(text: string): string {
    return encodeURIComponent(text || '');
  }
}