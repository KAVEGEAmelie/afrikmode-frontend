import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';

interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  colors?: string[];
  sizes?: string[];
  isNew?: boolean;
  discount?: number;
  rating: number;
}

interface FilterOptions {
  categories: string[];
  priceRanges: { label: string; min: number; max: number }[];
  colors: string[];
  sizes: string[];
}

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {

  // Vue : grille ou liste
  viewMode: 'grid' | 'list' = 'grid';

  // Filtres
  selectedCategory: string = 'all';
  selectedPriceRange: string = 'all';
  selectedColors: string[] = [];
  selectedSizes: string[] = [];
  searchQuery: string = '';

  // Tri
  sortBy: string = 'default';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalPages: number = 1;

  // Produits
  allProducts: Product[] = [
    {
      id: 1,
      name: 'Robe Ankara Élégante',
      price: 45000,
      oldPrice: 55000,
      image: 'assets/images/products/robe-1.jpg',
      category: 'Robes',
      colors: ['rouge', 'bleu', 'jaune'],
      sizes: ['S', 'M', 'L', 'XL'],
      isNew: true,
      discount: 18,
      rating: 4.5
    },
    {
      id: 2,
      name: 'Chemise Wax Premium',
      price: 35000,
      image: 'assets/images/products/chemise-1.jpg',
      category: 'Chemises',
      colors: ['multicolore', 'bleu'],
      sizes: ['M', 'L', 'XL'],
      isNew: true,
      rating: 4.8
    },
    {
      id: 3,
      name: 'Ensemble Traditionnel',
      price: 85000,
      oldPrice: 95000,
      image: 'assets/images/products/ensemble-1.jpg',
      category: 'Ensembles',
      colors: ['bordeaux', 'or'],
      sizes: ['M', 'L', 'XL'],
      discount: 11,
      rating: 4.7
    },
    {
      id: 4,
      name: 'Sac à Main Artisanal',
      price: 25000,
      image: 'assets/images/products/sac-1.jpg',
      category: 'Accessoires',
      colors: ['marron', 'noir'],
      isNew: true,
      rating: 4.3
    },
    {
      id: 5,
      name: 'Boubou Homme Luxe',
      price: 75000,
      image: 'assets/images/products/boubou-1.jpg',
      category: 'Hommes',
      colors: ['blanc', 'bleu', 'noir'],
      sizes: ['L', 'XL', 'XXL'],
      rating: 4.6
    },
    {
      id: 6,
      name: 'Tissus Wax 6 Yards',
      price: 30000,
      oldPrice: 35000,
      image: 'assets/images/products/tissu-1.jpg',
      category: 'Tissus',
      colors: ['multicolore'],
      discount: 14,
      rating: 4.9
    },
    {
      id: 7,
      name: 'Collier Perles Africaines',
      price: 15000,
      image: 'assets/images/products/collier-1.jpg',
      category: 'Accessoires',
      colors: ['multicolore'],
      rating: 4.4
    },
    {
      id: 8,
      name: 'Pantalon Bogolan',
      price: 40000,
      image: 'assets/images/products/pantalon-1.jpg',
      category: 'Pantalons',
      colors: ['beige', 'marron'],
      sizes: ['S', 'M', 'L', 'XL'],
      isNew: true,
      rating: 4.2
    },
    {
      id: 9,
      name: 'Dashiki Homme',
      price: 38000,
      image: 'assets/images/products/dashiki-1.jpg',
      category: 'Hommes',
      colors: ['bleu', 'rouge', 'vert'],
      sizes: ['M', 'L', 'XL'],
      rating: 4.5
    },
    {
      id: 10,
      name: 'Jupe Africaine Midi',
      price: 32000,
      image: 'assets/images/products/jupe-1.jpg',
      category: 'Robes',
      colors: ['multicolore'],
      sizes: ['S', 'M', 'L'],
      rating: 4.6
    },
    {
      id: 11,
      name: 'Boucles d\'Oreilles Ethniques',
      price: 8000,
      image: 'assets/images/products/boucles-1.jpg',
      category: 'Accessoires',
      colors: ['or', 'argent'],
      rating: 4.7
    },
    {
      id: 12,
      name: 'Caftan Brodé',
      price: 95000,
      oldPrice: 110000,
      image: 'assets/images/products/caftan-1.jpg',
      category: 'Robes',
      colors: ['blanc', 'doré'],
      sizes: ['M', 'L', 'XL'],
      discount: 14,
      rating: 4.9
    }
  ];

  filteredProducts: Product[] = [];
  displayedProducts: Product[] = [];

  // Options de filtres
  filterOptions: FilterOptions = {
    categories: ['Robes', 'Chemises', 'Pantalons', 'Accessoires', 'Tissus', 'Hommes', 'Ensembles'],
    priceRanges: [
      { label: 'Moins de 20 000 FCFA', min: 0, max: 20000 },
      { label: '20 000 - 50 000 FCFA', min: 20000, max: 50000 },
      { label: '50 000 - 100 000 FCFA', min: 50000, max: 100000 },
      { label: 'Plus de 100 000 FCFA', min: 100000, max: Infinity }
    ],
    colors: ['rouge', 'bleu', 'jaune', 'vert', 'noir', 'blanc', 'multicolore', 'or', 'marron'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  };

  // Sidebar mobile
  showMobileFilters: boolean = false;

  // État des favoris (pour affichage visuel)
  wishlistProductIds: Set<string> = new Set();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private productService: ProductService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Récupérer le paramètre de recherche de l'URL
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery = params['search'];
      }
      this.applyFilters();
    });

    // Charger les IDs des produits dans la wishlist
    this.loadWishlistIds();
  }

  loadWishlistIds(): void {
    this.wishlistService.getWishlist().subscribe({
      next: (response) => {
        if (response.data && Array.isArray(response.data)) {
          this.wishlistProductIds = new Set(response.data.map((item: any) => item.id || item.product_id));
        }
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement de la wishlist:', error);
      }
    });
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistProductIds.has(productId.toString());
  }

  // Gestion des filtres
  applyFilters(): void {
    this.filteredProducts = this.allProducts.filter(product => {
      // Filtre par catégorie
      if (this.selectedCategory !== 'all' && product.category !== this.selectedCategory) {
        return false;
      }

      // Filtre par prix
      if (this.selectedPriceRange !== 'all') {
        const range = this.filterOptions.priceRanges.find(r => r.label === this.selectedPriceRange);
        if (range && (product.price < range.min || product.price > range.max)) {
          return false;
        }
      }

      // Filtre par couleur
      if (this.selectedColors.length > 0) {
        const hasColor = product.colors?.some(c => this.selectedColors.includes(c));
        if (!hasColor) return false;
      }

      // Filtre par taille
      if (this.selectedSizes.length > 0) {
        const hasSize = product.sizes?.some(s => this.selectedSizes.includes(s));
        if (!hasSize) return false;
      }

      // Filtre par recherche
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        return product.name.toLowerCase().includes(query) || 
               product.category.toLowerCase().includes(query);
      }

      return true;
    });

    this.sortProducts();
    this.updatePagination();
  }

  sortProducts(): void {
    switch (this.sortBy) {
      case 'price-asc':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        this.filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        this.filteredProducts.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
    }
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  // Changement de page
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Toggle couleur
  toggleColor(color: string): void {
    const index = this.selectedColors.indexOf(color);
    if (index > -1) {
      this.selectedColors.splice(index, 1);
    } else {
      this.selectedColors.push(color);
    }
    this.currentPage = 1;
    this.applyFilters();
  }

  // Toggle taille
  toggleSize(size: string): void {
    const index = this.selectedSizes.indexOf(size);
    if (index > -1) {
      this.selectedSizes.splice(index, 1);
    } else {
      this.selectedSizes.push(size);
    }
    this.currentPage = 1;
    this.applyFilters();
  }

  // Réinitialiser les filtres
  resetFilters(): void {
    this.selectedCategory = 'all';
    this.selectedPriceRange = 'all';
    this.selectedColors = [];
    this.selectedSizes = [];
    this.searchQuery = '';
    this.sortBy = 'default';
    this.currentPage = 1;
    this.applyFilters();
  }

  // Changer la vue
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  // Navigation
  viewProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  addToCart(product: Product, event: Event): void {
    event.stopPropagation();
    
    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isAuthenticated()) {
      if (confirm('Vous devez être connecté pour ajouter des produits au panier. Voulez-vous vous connecter maintenant ?')) {
        this.router.navigate(['/auth/login'], {
          queryParams: { returnUrl: this.router.url }
        });
      }
      return;
    }

    // Ajouter au panier via le service
    this.cartService.addToCart({
      product_id: product.id.toString(),
      quantity: 1
    }).subscribe({
      next: (cartItem) => {
        console.log('✅ Produit ajouté au panier:', cartItem);
        // Afficher une notification de succès
        this.showNotification(`${product.name} ajouté au panier !`, 'success');
      },
      error: (error) => {
        console.error('❌ Erreur lors de l\'ajout au panier:', error);
        this.showNotification('Erreur lors de l\'ajout au panier. Veuillez réessayer.', 'error');
      }
    });
  }

  addToWishlist(product: Product, event: Event): void {
    event.stopPropagation();
    
    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isAuthenticated()) {
      if (confirm('Vous devez être connecté pour ajouter des produits aux favoris. Voulez-vous vous connecter maintenant ?')) {
        this.router.navigate(['/auth/login'], {
          queryParams: { returnUrl: this.router.url }
        });
      }
      return;
    }

    const productIdStr = product.id.toString();

    // Si déjà dans la wishlist, retirer
    if (this.isInWishlist(product.id)) {
      this.wishlistService.removeFromWishlist(productIdStr).subscribe({
        next: () => {
          console.log('✅ Produit retiré des favoris');
          this.wishlistProductIds.delete(productIdStr);
          this.showNotification(`${product.name} retiré des favoris`, 'info');
        },
        error: (error) => {
          console.error('❌ Erreur lors du retrait des favoris:', error);
          this.showNotification('Erreur lors du retrait des favoris', 'error');
        }
      });
    } else {
      // Ajouter aux favoris
      this.wishlistService.addToWishlist(productIdStr).subscribe({
        next: () => {
          console.log('✅ Produit ajouté aux favoris');
          this.wishlistProductIds.add(productIdStr);
          this.showNotification(`${product.name} ajouté aux favoris !`, 'success');
        },
        error: (error) => {
          console.error('❌ Erreur lors de l\'ajout aux favoris:', error);
          this.showNotification('Erreur lors de l\'ajout aux favoris', 'error');
        }
      });
    }
  }

  // Afficher une notification temporaire
  private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    // Créer un élément de notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Supprimer après 3 secondes
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // Pagination helper
  getPaginationArray(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}