import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-enfants',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf, NgFor],
  templateUrl: './enfants.component.html',
  styleUrls: ['./enfants.component.scss']
})
export class EnfantsComponent implements OnInit {
  ageGroups = [
    { name: 'Bébés (0-2 ans)', count: 25, icon: '👶', path: '/enfants/bebes' },
    { name: 'Petits (3-6 ans)', count: 35, icon: '👧', path: '/enfants/petits' },
    { name: 'Enfants (7-12 ans)', count: 42, icon: '🧒', path: '/enfants/enfants' },
    { name: 'Ados (13-17 ans)', count: 28, icon: '👦', path: '/enfants/ados' }
  ];

  allProducts = [
    {
      id: 1,
      name: 'Ensemble Bébé Wax Coloré',
      price: 39.99,
      originalPrice: 54.99,
      image: 'assets/images/enfants/ensemble-bebe-wax.jpg',
      category: 'Bébés',
      rating: 4.9,
      reviews: 18,
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      sizes: ['3M', '6M', '12M', '18M', '24M'],
      isPopular: true
    },
    {
      id: 2,
      name: 'Robe Petite Princesse Ankara',
      price: 49.99,
      originalPrice: 69.99,
      image: 'assets/images/enfants/robe-princesse.jpg',
      category: 'Petits',
      rating: 4.8,
      reviews: 24,
      colors: ['#E91E63', '#9C27B0', '#673AB7'],
      sizes: ['3A', '4A', '5A', '6A'],
      isPopular: true
    }
  ];

  featuredProducts = this.allProducts;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private wishlistService: WishlistService,
    private toastService: ToastService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Écouter les changements de paramètres de route
    this.route.params.subscribe(params => {
      if (params['category']) {
        this.filterProducts(params['category']);
      }
    });
  }

  filterProducts(category?: string): void {
    // Filtrer les produits selon la catégorie sélectionnée
    if (category) {
      this.featuredProducts = this.allProducts.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    } else {
      this.featuredProducts = this.allProducts;
    }
  }

  addToCart(product: any): void {
    console.log('Produit ajouté au panier:', product);
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

  navigateToCategory(category: any): void {
    if (category.path) {
      this.router.navigate([category.path]);
    }
  }

  navigateToProduct(product: any): void {
    this.router.navigate(['/products', product.id]);
  }
}