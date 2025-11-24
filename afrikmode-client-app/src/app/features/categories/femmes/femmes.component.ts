import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { SafeImagePipe } from '../../../core/pipes/safe-image.pipe';
import { environment } from '../../../../environments/environment';

interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  rating?: number;
  reviews?: number;
  isPopular?: boolean;
}

@Component({
  selector: 'app-femmes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgIf, NgFor, SafeImagePipe],
  templateUrl: './femmes.component.html',
  styleUrls: ['./femmes.component.scss']
})
export class FemmesComponent implements OnInit {
  Math = Math;
  categories: any[] = [];
  allProducts: Product[] = [];
  featuredProducts: Product[] = [];
  loading = false;

  styleGuide = [
    {
      title: 'Élégance Africaine',
      description: 'Découvrez comment porter nos pièces avec style et sophistication.',
      image: 'https://via.placeholder.com/400x300?text=Élégance+Africaine',
      tips: ['Associez les couleurs vives', 'Misez sur les accessoires dorés', 'Jouez avec les volumes']
    },
    {
      title: 'Tendances Wax',
      description: 'Les motifs Wax revisités dans un style contemporain.',
      image: 'https://via.placeholder.com/400x300?text=Tendances+Wax',
      tips: ['Mix & match des imprimés', 'Ajoutez une touche moderne', 'Osez les superpositions']
    },
    {
      title: 'Occasion Spéciale',
      description: 'Nos conseils pour briller lors des événements importants.',
      image: 'https://via.placeholder.com/400x300?text=Occasion+Spéciale',
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
    private authService: AuthService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    
    this.route.params.subscribe(params => {
      if (params['category']) {
        this.filters.category = params['category'];
        this.filterProducts();
      }
    });
  }

  loadCategories(): void {
    // Charger toutes les catégories et filtrer celles qui ont "vetements-femmes" comme parent
    this.categoryService.getCategories(true, true).subscribe({
      next: (response: any) => {
        const allCategories = Array.isArray(response) ? response : response.data || [];
        // Filtrer les sous-catégories de "Vêtements Femmes" (slug: vetements-femmes)
        const parentCategory = allCategories.find((cat: any) => cat.slug === 'vetements-femmes');
        if (parentCategory && parentCategory.children) {
          this.categories = parentCategory.children.map((cat: any) => ({
            name: cat.name,
            count: cat.products_count || 0,
            icon: this.getCategoryIcon(cat.slug),
            path: `/shop?category=${cat.slug}`
          }));
        } else {
          // Fallback: utiliser getSubCategories si disponible
          if (parentCategory?.id) {
            this.categoryService.getSubCategories(parentCategory.id).subscribe({
              next: (subCats: any) => {
                this.categories = (Array.isArray(subCats) ? subCats : subCats.data || []).map((cat: any) => ({
                  name: cat.name,
                  count: cat.products_count || 0,
                  icon: this.getCategoryIcon(cat.slug),
                  path: `/shop?category=${cat.slug}`
                }));
              },
              error: (error) => {
                console.error('Erreur chargement sous-catégories:', error);
              }
            });
          }
        }
      },
      error: (error) => {
        console.error('Erreur chargement catégories:', error);
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    // Charger les produits de la catégorie "Vêtements Femmes"
    this.productService.getProducts({
      category: 'vetements-femmes',
      limit: 50,
      status: 'active'
    }).subscribe({
      next: (response: any) => {
        const products = Array.isArray(response) ? response : response.data || [];
        this.allProducts = products.map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          oldPrice: product.compareAtPrice || product.compare_at_price || product.compare_price,
          image: this.normalizeProductImage(product),
          category: product.category?.name || product.category_name || '',
          rating: product.averageRating || product.average_rating || 0,
          reviews: product.reviewsCount || product.reviews_count || 0,
          isPopular: product.featured || false
        }));
        this.featuredProducts = this.allProducts;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement produits femmes:', error);
        this.loading = false;
      }
    });
  }

  filterProducts(): void {
    if (this.filters.category) {
      this.featuredProducts = this.allProducts.filter(product => 
        product.category.toLowerCase().includes(this.filters.category.toLowerCase())
      );
    } else {
      this.featuredProducts = this.allProducts;
    }
  }

  private getCategoryIcon(slug: string): string {
    const icons: { [key: string]: string } = {
      'robes': '👗',
      'ensembles-complets': '👚',
      'jupes-pagnes': '🩱',
      'hauts-blouses': '👔',
      'boubous-caftans': '🥻',
      'kimonos': '🥋'
    };
    return icons[slug] || '👗';
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

  addToWishlist(product: Product): void {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (!isAuth) {
        this.toastService.warning('Veuillez vous connecter pour ajouter des produits aux favoris');
        this.router.navigate(['/login']);
        return;
      }

      this.wishlistService.addToWishlist(product.id.toString()).subscribe({
        next: () => {
          this.toastService.success(`${product.name} ajouté aux favoris !`);
        },
        error: (error) => {
          console.error('Erreur ajout aux favoris:', error);
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

  filterByCategory(category: string): void {
    this.filters.category = category;
    console.log('Filtrer par catégorie:', category);
  }

  navigateToCategory(category: any): void {
    if (category.path) {
      this.router.navigate([category.path]);
    }
  }

  navigateToProduct(product: Product): void {
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

  encodeURI(text: string): string {
    return encodeURIComponent(text || '');
  }
}