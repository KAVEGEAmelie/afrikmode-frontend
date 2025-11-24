import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { SafeImagePipe } from '../../core/pipes/safe-image.pipe';
import { environment } from '../../../environments/environment';

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
  imports: [CommonModule, RouterModule, FormsModule, SafeImagePipe],
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
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  displayedProducts: Product[] = [];
  totalProducts = 0;
  isLoading = false;

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
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
      // Charger les produits depuis l'API
      this.loadProducts();
    });

    // Charger les IDs des produits dans la wishlist
    this.loadWishlistIds();
  }

  loadProducts(): void {
    this.isLoading = true;
    
    const params: any = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      status: 'active'
    };

    // Ajouter les filtres
    if (this.selectedCategory !== 'all') {
      // Utiliser category pour filtrer par catégorie (slug ou ID)
      params.category = this.selectedCategory;
    }

    if (this.searchQuery) {
      params.search = this.searchQuery;
    }

    // Ajouter le tri (mapper vers sortBy et sortOrder du backend)
    switch (this.sortBy) {
      case 'price-asc':
        params.sortBy = 'price';
        params.sortOrder = 'asc';
        break;
      case 'price-desc':
        params.sortBy = 'price';
        params.sortOrder = 'desc';
        break;
      case 'name-asc':
        params.sortBy = 'name';
        params.sortOrder = 'asc';
        break;
      case 'rating':
        params.sortBy = 'sales_count';
        params.sortOrder = 'desc';
        break;
      case 'newest':
        params.sortBy = 'created_at';
        params.sortOrder = 'desc';
        break;
      default:
        params.sortBy = 'created_at';
        params.sortOrder = 'desc';
    }

    // Ajouter filtres prix si sélectionnés
    if (this.selectedPriceRange !== 'all') {
      const range = this.filterOptions.priceRanges.find(r => r.label === this.selectedPriceRange);
      if (range) {
        params.min_price = range.min;
        params.max_price = range.max === Infinity ? undefined : range.max;
      }
    }

    this.productService.getProducts(params).subscribe({
      next: (response: any) => {
        const products = Array.isArray(response) ? response : response.data || [];
        this.allProducts = products.map((product: any) => ({
          id: parseInt(product.id) || product.id,
          name: product.name,
          price: product.price,
          oldPrice: product.compareAtPrice || product.compare_at_price || product.compare_price,
          image: this.normalizeProductImage(product),
          category: product.category?.name || product.category_name || '',
          colors: product.variants?.filter((v: any) => v.attributes?.color).map((v: any) => v.attributes.color) || [],
          sizes: product.variants?.filter((v: any) => v.attributes?.size).map((v: any) => v.attributes.size) || [],
          isNew: product.is_featured || false,
          discount: (product.compareAtPrice || product.compare_at_price || product.compare_price) 
            ? Math.round(((product.compareAtPrice || product.compare_at_price || product.compare_price - product.price) / (product.compareAtPrice || product.compare_at_price || product.compare_price)) * 100) 
            : 0,
          rating: product.averageRating || product.average_rating || product.rating || 4.0
        }));

        // Mettre à jour la pagination
        const pagination = (response as any).pagination || {};
        this.totalProducts = pagination.total || this.allProducts.length;
        this.totalPages = pagination.total_pages || Math.ceil(this.totalProducts / this.itemsPerPage);

        // Appliquer les filtres côté client pour couleurs et tailles
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement produits:', error);
        this.isLoading = false;
      }
    });
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

  // Gestion des filtres
  applyFilters(): void {
    // Les filtres principaux (catégorie, prix, recherche) sont gérés par l'API
    // Ici on applique seulement les filtres côté client (couleurs, tailles)
    this.filteredProducts = this.allProducts.filter(product => {
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
      this.loadProducts(); // Recharger depuis l'API
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
    this.loadProducts(); // Recharger depuis l'API
  }

  // Changer la vue
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  // Navigation
  viewProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
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