import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ToastService } from '../../core/services/toast.service';

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
    RouterModule    
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
  featuredProducts: Product[] = [
    {
      id: '1',
      name: 'Robe Ankara Élégante',
      price: 45000,
      oldPrice: 55000,
      image: 'assets/images/products/robe-1.jpg',
      category: 'Robes',
      isNew: true,
      discount: 18
    },
    {
      id: '2',
      name: 'Chemise Wax Premium',
      price: 35000,
      image: 'assets/images/products/chemise-1.jpg',
      category: 'Chemises',
      isNew: true
    },
    {
      id: '3',
      name: 'Ensemble Traditionnel',
      price: 85000,
      oldPrice: 95000,
      image: 'assets/images/products/ensemble-1.jpg',
      category: 'Ensembles',
      discount: 11
    },
    {
      id: '4',
      name: 'Sac à Main Artisanal',
      price: 25000,
      image: 'assets/images/products/sac-1.jpg',
      category: 'Accessoires',
      isNew: true
    },
    {
      id: '5',
      name: 'Boubou Homme Luxe',
      price: 75000,
      image: 'assets/images/products/boubou-1.jpg',
      category: 'Hommes'
    },
    {
      id: '6',
      name: 'Tissus Wax 6 Yards',
      price: 30000,
      oldPrice: 35000,
      image: 'assets/images/products/tissu-1.jpg',
      category: 'Tissus',
      discount: 14
    },
    {
      id: '7',
      name: 'Collier Perles Africaines',
      price: 15000,
      image: 'assets/images/products/collier-1.jpg',
      category: 'Accessoires'
    },
    {
      id: '8',
      name: 'Pantalon Bogolan',
      price: 40000,
      image: 'assets/images/products/pantalon-1.jpg',
      category: 'Pantalons',
      isNew: true
    }
  ];

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
        // Garder les données mockées en cas d'erreur
        this.filterProducts();
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
          oldPrice: product.compare_price,
          image: product.image_url || product.images?.[0]?.url || 'assets/images/products/default.jpg',
          category: product.category?.name || '',
          isNew: product.is_featured || false,
          discount: product.compare_price ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100) : 0
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement produits:', error);
        this.filterProducts();
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

  // Filtrer les produits
  filterProducts() {
    this.newArrivals = this.featuredProducts.filter(p => p.isNew);
    this.saleProducts = this.featuredProducts.filter(p => p.discount);
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
}