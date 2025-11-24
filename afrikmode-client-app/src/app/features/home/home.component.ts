import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ToastService } from '../../core/services/toast.service';
import { SafeImagePipe } from '../../core/pipes/safe-image.pipe';
import { environment } from '../../../environments/environment';

interface Product {
  id: string;  // UUID
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  discount?: number;
}

interface Category {
  id: string;  // UUID
  name: string;
  image: string;
  count: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,   
    RouterModule,
    SafeImagePipe
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  
  // Hero Slider
  currentSlide = 0;
  heroSlides = [
    {
      title: 'Collection Printemps 2025',
      subtitle: 'Nouveautés Mode Africaine',
      description: 'Découvrez les dernières tendances de la mode africaine contemporaine',
      image: 'assets/images/hero/hero-1.jpg',
      buttonText: 'Découvrir',
      buttonLink: '/collections/printemps-2025'
    },
    {
      title: 'Wax & Ankara',
      subtitle: 'Tissus Traditionnels',
      description: 'Une sélection unique de tissus africains authentiques',
      image: 'assets/images/hero/hero-2.jpg',
      buttonText: 'Voir la Collection',
      buttonLink: '/collections/wax-ankara'
    },
    {
      title: 'Prêt-à-Porter',
      subtitle: 'Élégance Africaine',
      description: 'Des créations uniques pour toutes les occasions',
      image: 'assets/images/hero/hero-3.jpg',
      buttonText: 'Shop Now',
      buttonLink: '/shop'
    }
  ];

  // Categories
  categories: Category[] = [
    { id: '1', name: 'Robes', image: 'assets/images/categories/robes.jpg', count: 156 },
    { id: '2', name: 'Chemises', image: 'assets/images/categories/chemises.jpg', count: 89 },
    { id: '3', name: 'Pantalons', image: 'assets/images/categories/pantalons.jpg', count: 124 },
    { id: '4', name: 'Accessoires', image: 'assets/images/categories/accessoires.jpg', count: 67 },
    { id: '5', name: 'Tissus', image: 'assets/images/categories/tissus.jpg', count: 234 },
    { id: '6', name: 'Chaussures', image: 'assets/images/categories/chaussures.jpg', count: 78 }
  ];

  // Produits populaires
  popularProducts: Product[] = [];

  // Produits en vedette
  featuredProducts: Product[] = [];

  // Nouvelles collections
  newArrivals: Product[] = [];

  // Produits en promotion
  saleProducts: Product[] = [];
  isLoading = false;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.initSlider();
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    
    // Charger les catégories depuis le backend
    this.categoryService.getCategories().subscribe({
      next: (response: any) => {
        // Adapter les données du backend aux interfaces locales
        const categories = Array.isArray(response) ? response : response.data || [];
        this.categories = categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          image: cat.image_url || 'assets/images/categories/default.jpg',
          count: cat.product_count || 0
        }));
      },
      error: (error) => {
        console.error('Erreur chargement catégories:', error);
      }
    });

    // Charger les produits populaires
    this.productService.getProducts({ 
      limit: 8, 
      sort: 'popularity',
      status: 'active'
    }).subscribe({
      next: (response: any) => {
        const products = Array.isArray(response) ? response : response.data || [];
        this.popularProducts = products.map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          oldPrice: product.compareAtPrice || product.compare_at_price || product.compare_price,
          image: this.normalizeProductImage(product),
          category: product.category?.name || product.category_name || '',
          isNew: product.is_featured || false,
          discount: (product.compareAtPrice || product.compare_at_price || product.compare_price) 
            ? Math.round(((product.compareAtPrice || product.compare_at_price || product.compare_price - product.price) / (product.compareAtPrice || product.compare_at_price || product.compare_price)) * 100) 
            : 0
        }));
      },
      error: (error) => {
        console.error('Erreur chargement produits populaires:', error);
      }
    });

    // Charger les produits en vedette
    this.productService.getProducts({ 
      limit: 8, 
      is_featured: true,
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
          category: product.category?.name || product.category_name || '',
          isNew: product.is_featured || false,
          discount: (product.compareAtPrice || product.compare_at_price || product.compare_price) 
            ? Math.round(((product.compareAtPrice || product.compare_at_price || product.compare_price - product.price) / (product.compareAtPrice || product.compare_at_price || product.compare_price)) * 100) 
            : 0
        }));
      },
      error: (error) => {
        console.error('Erreur chargement produits vedette:', error);
      }
    });

    // Charger les nouvelles collections (produits récents)
    this.productService.getProducts({ 
      limit: 8, 
      sort: 'newest',
      status: 'active'
    }).subscribe({
      next: (response: any) => {
        const products = Array.isArray(response) ? response : response.data || [];
        this.newArrivals = products.map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          oldPrice: product.compareAtPrice || product.compare_at_price || product.compare_price,
          image: this.normalizeProductImage(product),
          category: product.category?.name || product.category_name || '',
          isNew: true,
          discount: (product.compareAtPrice || product.compare_at_price || product.compare_price) 
            ? Math.round(((product.compareAtPrice || product.compare_at_price || product.compare_price - product.price) / (product.compareAtPrice || product.compare_at_price || product.compare_price)) * 100) 
            : 0
        }));
      },
      error: (error) => {
        console.error('Erreur chargement nouvelles collections:', error);
      }
    });

    // Charger les produits en promotion (avec réduction)
    this.productService.getProducts({ 
      limit: 8, 
      status: 'active'
    }).subscribe({
      next: (response: any) => {
        const products = Array.isArray(response) ? response : response.data || [];
        // Filtrer les produits avec compare_price (réduction)
        this.saleProducts = products
          .filter((product: any) => {
            const comparePrice = product.compareAtPrice || product.compare_at_price || product.compare_price;
            return comparePrice && comparePrice > product.price;
          })
          .map((product: any) => {
            const comparePrice = product.compareAtPrice || product.compare_at_price || product.compare_price;
            return {
              id: product.id,
              name: product.name,
              price: product.price,
              oldPrice: comparePrice,
              image: this.normalizeProductImage(product),
              category: product.category?.name || product.category_name || '',
              discount: Math.round(((comparePrice - product.price) / comparePrice) * 100)
            };
          })
          .slice(0, 8); // Limiter à 8 produits
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement promotions:', error);
        this.isLoading = false;
      }
    });
  }

  // Gestion du slider
  initSlider() {
    setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length;
  }

  previousSlide() {
    this.currentSlide = this.currentSlide === 0 
      ? this.heroSlides.length - 1 
      : this.currentSlide - 1;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }


  // Navigation - Supprimées, on utilise routerLink directement

  addToCart(product: Product, event: Event) {
    event.stopPropagation();
    
    const cartRequest = {
      product_id: product.id,
      quantity: 1,
      selected_size: undefined,
      selected_color: undefined
    };

    this.cartService.addToCart(cartRequest).subscribe({
      next: () => {
        this.toastService.success(`✓ ${product.name} ajouté au panier !`);
      },
      error: (error) => {
        console.error('Erreur ajout au panier:', error);
        this.toastService.error('Erreur lors de l\'ajout au panier. Veuillez réessayer.');
      }
    });
  }

  addToWishlist(product: Product, event: Event) {
    event.stopPropagation();
    
    this.wishlistService.addToWishlist(product.id).subscribe({
      next: () => {
        this.toastService.success(`♥ ${product.name} ajouté aux favoris !`);
      },
      error: (error) => {
        console.error('Erreur ajout aux favoris:', error);
        this.toastService.error('Erreur lors de l\'ajout aux favoris. Veuillez réessayer.');
      }
    });
  }

  /**
   * Normalise l'image d'un produit depuis différentes sources possibles
   */
  private normalizeProductImage(product: any): string {
    // Helper pour construire l'URL complète
    const buildImageUrl = (imgPath: string): string => {
      if (!imgPath || imgPath.trim() === '') return '';
      
      // Si c'est déjà une URL complète, la retourner telle quelle
      if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
        return imgPath;
      }
      
      // Si c'est un chemin absolu (commence par /), construire l'URL avec l'API
      if (imgPath.startsWith('/')) {
        const cleanPath = imgPath.startsWith('/') ? imgPath.substring(1) : imgPath;
        return `${environment.apiUrl}/${cleanPath}`;
      }
      
      // Si c'est un chemin relatif (uploads/products/...), construire l'URL
      if (imgPath.includes('uploads/')) {
        return `${environment.apiUrl}/${imgPath}`;
      }
      
      // Si c'est un chemin assets, le retourner tel quel
      if (imgPath.startsWith('assets/')) {
        return '/' + imgPath;
      }
      
      // Sinon, essayer avec uploads/products/
      return `${environment.apiUrl}/uploads/products/${imgPath}`;
    };

    // 1. Essayer images (peut être tableau, JSON string, ou null)
    if (product.images) {
      if (Array.isArray(product.images) && product.images.length > 0) {
        const firstImage = product.images[0];
        if (typeof firstImage === 'string') {
          return buildImageUrl(firstImage);
        }
        if (typeof firstImage === 'object') {
          const url = firstImage.url || firstImage.path || firstImage.image_url || firstImage.src || '';
          return buildImageUrl(url);
        }
      }
      if (typeof product.images === 'string') {
        // Si c'est une chaîne JSON
        if (product.images.trim().startsWith('[') || product.images.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(product.images);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const firstImage = parsed[0];
              if (typeof firstImage === 'string') {
                return buildImageUrl(firstImage);
              }
              if (typeof firstImage === 'object') {
                const url = firstImage.url || firstImage.path || firstImage.image_url || '';
                return buildImageUrl(url);
              }
            }
          } catch {
            // Si ce n'est pas du JSON valide, traiter comme une URL simple
            return buildImageUrl(product.images);
          }
        } else {
          // C'est probablement une URL simple
          return buildImageUrl(product.images);
        }
      }
    }

    // 2. Essayer primaryImage (camelCase)
    if (product.primaryImage) {
      return buildImageUrl(product.primaryImage);
    }

    // 3. Essayer primary_image (snake_case)
    if (product.primary_image) {
      return buildImageUrl(product.primary_image);
    }

    // 4. Essayer image_url
    if (product.image_url) {
      return buildImageUrl(product.image_url);
    }

    // 5. Fallback vers placeholder en ligne
    return `https://via.placeholder.com/300x300?text=${encodeURIComponent(product.name || 'Produit')}`;
  }
}