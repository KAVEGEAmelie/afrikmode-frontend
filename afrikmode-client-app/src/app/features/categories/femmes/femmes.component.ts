import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-femmes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgIf, NgFor],
  templateUrl: './femmes.component.html',
  styleUrls: ['./femmes.component.scss']
})
export class FemmesComponent implements OnInit {
  Math = Math;
  categories = [
    { name: 'Robes', count: 45, icon: '👗', path: '/femmes/robes' },
    { name: 'Ensembles', count: 32, icon: '👚', path: '/femmes/ensembles' },
    { name: 'Jupes', count: 28, icon: '🩱', path: '/femmes/jupes' },
    { name: 'Blouses', count: 38, icon: '👔', path: '/femmes/blouses' },
    { name: 'Caftans', count: 22, icon: '🥻', path: '/femmes/caftans' },
    { name: 'Kimonos', count: 18, icon: '🥋', path: '/femmes/kimonos' }
  ];

  allProducts = [
    {
      id: 1,
      name: 'Robe Ankara Élégante',
      price: 149.99,
      originalPrice: 199.99,
      image: 'assets/images/femmes/robe-ankara-elegante.jpg',
      category: 'Robes',
      rating: 4.8,
      reviews: 24,
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      sizes: ['S', 'M', 'L', 'XL'],
      isPopular: true
    },
    {
      id: 2,
      name: 'Ensemble Kente Royal',
      price: 234.99,
      originalPrice: 299.99,
      image: 'assets/images/femmes/ensemble-kente.jpg',
      category: 'Ensembles',
      rating: 4.9,
      reviews: 18,
      colors: ['#FFD93D', '#FF6B6B', '#6BCF7F'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      isPopular: true
    },
    {
      id: 3,
      name: 'Caftan Brodé Premium',
      price: 189.99,
      originalPrice: 249.99,
      image: 'assets/images/femmes/caftan-brode.jpg',
      category: 'Caftans',
      rating: 4.7,
      reviews: 31,
      colors: ['#8B4513', '#DAA520', '#CD853F'],
      sizes: ['S', 'M', 'L', 'XL'],
      isPopular: false
    },
    {
      id: 4,
      name: 'Jupe Wax Moderne',
      price: 79.99,
      originalPrice: 109.99,
      image: 'assets/images/femmes/jupe-wax.jpg',
      category: 'Jupes',
      rating: 4.6,
      reviews: 42,
      colors: ['#FF9800', '#E91E63', '#9C27B0'],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      isPopular: true
    },
    {
      id: 5,
      name: 'Blouse Dashiki Chic',
      price: 94.99,
      originalPrice: 129.99,
      image: 'assets/images/femmes/blouse-dashiki.jpg',
      category: 'Blouses',
      rating: 4.8,
      reviews: 26,
      colors: ['#FF5722', '#795548', '#FFC107'],
      sizes: ['S', 'M', 'L', 'XL'],
      isPopular: false
    },
    {
      id: 6,
      name: 'Kimono Bogolan Luxe',
      price: 119.99,
      originalPrice: 159.99,
      image: 'assets/images/femmes/kimono-bogolan.jpg',
      category: 'Kimonos',
      rating: 4.9,
      reviews: 15,
      colors: ['#8D6E63', '#A1887F', '#D7CCC8'],
      sizes: ['S', 'M', 'L', 'XL'],
      isPopular: true
    }
  ];

  featuredProducts = this.allProducts;

  styleGuide = [
    {
      title: 'Élégance Africaine',
      description: 'Découvrez comment porter nos pièces avec style et sophistication.',
      image: 'assets/images/style/elegance-africaine.jpg',
      tips: ['Associez les couleurs vives', 'Misez sur les accessoires dorés', 'Jouez avec les volumes']
    },
    {
      title: 'Tendances Wax',
      description: 'Les motifs Wax revisités dans un style contemporain.',
      image: 'assets/images/style/tendances-wax.jpg',
      tips: ['Mix & match des imprimés', 'Ajoutez une touche moderne', 'Osez les superpositions']
    },
    {
      title: 'Occasion Spéciale',
      description: 'Nos conseils pour briller lors des événements importants.',
      image: 'assets/images/style/occasion-speciale.jpg',
      tips: ['Choisissez des pièces statement', 'Harmonisez votre coiffure', 'Complétez avec des bijoux']
    }
  ];

  filters = {
    category: '',
    priceRange: [0, 500],
    sizes: [],
    colors: [],
    rating: 0
  };

  sortBy = 'popularity';

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Écouter les changements de paramètres de route
    this.route.params.subscribe(params => {
      if (params['category']) {
        this.filters.category = params['category'];
        this.filterProducts();
      }
    });
  }

  filterProducts(): void {
    // Filtrer les produits selon la catégorie sélectionnée
    if (this.filters.category) {
      this.featuredProducts = this.allProducts.filter(product => 
        product.category.toLowerCase() === this.filters.category.toLowerCase()
      );
    } else {
      this.featuredProducts = this.allProducts;
    }
  }

  addToCart(product: any): void {
    // Vérifier si l'utilisateur est authentifié
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (!isAuth) {
        alert('Veuillez vous connecter pour ajouter des articles au panier');
        this.router.navigate(['/login']);
        return;
      }

      // Ajouter au panier via le service
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
    });
  }

  addToWishlist(product: any): void {
    // Vérifier si l'utilisateur est authentifié
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (!isAuth) {
        alert('Veuillez vous connecter pour ajouter des articles aux favoris');
        this.router.navigate(['/login']);
        return;
      }

      // Ajouter aux favoris via le service
      this.wishlistService.addToWishlist(product.id.toString()).subscribe({
        next: (response) => {
          console.log('✅ Produit ajouté aux favoris:', response);
          alert('Produit ajouté aux favoris avec succès!');
        },
        error: (error) => {
          console.error('❌ Erreur lors de l\'ajout aux favoris:', error);
          alert('Erreur lors de l\'ajout aux favoris. Veuillez réessayer.');
        }
      });
    });
  }

  viewProduct(product: any): void {
    console.log('Voir le produit:', product);
  }

  filterByCategory(category: string): void {
    this.filters.category = category;
    console.log('Filtrer par catégorie:', category);
  }

  navigateToCategory(category: any): void {
    if (category.path) {
      this.router.navigate([category.path]);
    }
  }

  navigateToProduct(product: any): void {
    this.router.navigate(['/products', product.id]);
  }

  applyFilters(): void {
    console.log('Appliquer les filtres:', this.filters);
  }

  sortProducts(sortType: string): void {
    this.sortBy = sortType;
    console.log('Trier par:', sortType);
  }

  getDiscountPercentage(originalPrice: number, currentPrice: number): number {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }
}