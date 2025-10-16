import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-hommes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgIf, NgFor],
  templateUrl: './hommes.component.html',
  styleUrls: ['./hommes.component.scss']
})
export class HommesComponent implements OnInit {
  categories = [
    { name: 'Dashikis', count: 35, icon: '👔', path: '/hommes/dashikis' },
    { name: 'Caftans', count: 28, icon: '🥻', path: '/hommes/caftans' },
    { name: 'Chemises', count: 42, icon: '👕', path: '/hommes/chemises' },
    { name: 'Pantalons', count: 31, icon: '👖', path: '/hommes/pantalons' },
    { name: 'Ensembles', count: 25, icon: '🕺', path: '/hommes/ensembles' },
    { name: 'Accessoires', count: 19, icon: '🎩', path: '/hommes/accessoires' }
  ];

  allProducts = [
    {
      id: 1,
      name: 'Dashiki Kente Élégant',
      price: 119.99,
      originalPrice: 159.99,
      image: 'assets/images/hommes/dashiki-kente.jpg',
      category: 'Dashikis',
      rating: 4.8,
      reviews: 32,
      colors: ['#8B4513', '#DAA520', '#CD853F'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      isPopular: true
    },
    {
      id: 2,
      name: 'Ensemble Bogolan Moderne',
      price: 189.99,
      originalPrice: 249.99,
      image: 'assets/images/hommes/ensemble-bogolan.jpg',
      category: 'Ensembles',
      rating: 4.9,
      reviews: 28,
      colors: ['#8D6E63', '#A1887F', '#D7CCC8'],
      sizes: ['M', 'L', 'XL', 'XXL'],
      isPopular: true
    },
    {
      id: 3,
      name: 'Caftan Royal Brodé',
      price: 159.99,
      originalPrice: 199.99,
      image: 'assets/images/hommes/caftan-royal.jpg',
      category: 'Caftans',
      rating: 4.7,
      reviews: 24,
      colors: ['#1A237E', '#303F9F', '#3F51B5'],
      sizes: ['S', 'M', 'L', 'XL'],
      isPopular: false
    },
    {
      id: 4,
      name: 'Chemise Wax Premium',
      price: 79.99,
      originalPrice: 109.99,
      image: 'assets/images/hommes/chemise-wax.jpg',
      category: 'Chemises',
      rating: 4.6,
      reviews: 38,
      colors: ['#FF9800', '#E65100', '#BF360C'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      isPopular: true
    }
  ];

  featuredProducts = this.allProducts;

  styleGuide = [
    {
      title: 'Élégance Masculine',
      description: 'Comment porter le Dashiki avec sophistication.',
      image: 'assets/images/style/elegance-masculine.jpg',
      tips: ['Associez avec un pantalon sobre', 'Ajoutez une montre en bois', 'Optez pour des chaussures en cuir']
    },
    {
      title: 'Style Décontracté',
      description: 'Le parfait équilibre entre confort et style.',
      image: 'assets/images/style/style-decontracte.jpg',
      tips: ['Mixez les textures', 'Jouez avec les couleurs', 'Accessoirisez avec parcimonie']
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