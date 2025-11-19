import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { AuthService } from '../../core/services/auth.service';
import { MessageService } from '../../core/services/message.service';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { ProductReviewsDisplayComponent } from '../../shared/components/product-reviews-display/product-reviews-display.component';
import { SafeImagePipe } from '../../core/pipes/safe-image.pipe';

interface Product {
  id: string | number;
  name: string;
  price: number;
  oldPrice?: number;
  description: string;
  images: string[];
  category: string;
  colors: { name: string; code: string }[];
  sizes: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  sku: string;
  features: string[];
  materials: string;
  careInstructions: string[];
}

interface Review {
  id: number;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductReviewsDisplayComponent, SafeImagePipe],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {

  productId: string = '';
  product: Product | null = null;
  loading: boolean = false;
  vendorId: string | number | null = null; // Stocker le vendor_id du produit
  
  // Images
  selectedImage: string = '';
  selectedImageIndex: number = 0;
  showImageZoom: boolean = false;
  
  // Sélections
  selectedColor: string = '';
  selectedSize: string = '';
  quantity: number = 1;
  
  // Avis - Chargés depuis l'API
  reviews: Review[] = [];
  
  // Produits similaires - Chargés depuis l'API
  relatedProducts: any[] = [];

  // Onglets
  activeTab: 'description' | 'features' | 'reviews' = 'description';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private messageService: MessageService,
    private productService: ProductService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      // Garder l'ID comme string (peut être UUID ou slug)
      this.productId = params['id'] || '';
      if (this.productId) {
        this.loadProduct();
      }
    });
  }

  loadProduct(): void {
    if (!this.productId) return;

    this.loading = true;
    this.productService.getProduct(this.productId).subscribe({
      next: (response: any) => {
        // Gérer différentes structures de réponse
        const product = response.data || response;
        
        // Normaliser les images
        const normalizedImages = this.normalizeImages(product.images || product.image_url);
        
        // Stocker le vendor_id pour les conversations
        this.vendorId = product.vendor_id || product.store?.vendor_id || product.store_id || null;
        
        // Mapper les données de l'API vers l'interface locale
        this.product = {
          id: product.id || this.productId,
          name: product.name || 'Produit sans nom',
          price: parseFloat(product.price) || 0,
          oldPrice: product.compare_price ? parseFloat(product.compare_price) : undefined,
          description: product.description || '',
          images: normalizedImages.length > 0 
            ? normalizedImages
            : ['/assets/images/products/default.jpg'],
          category: this.extractCategoryName(product),
          colors: this.normalizeColors(product),
          sizes: this.normalizeSizes(product),
          stock: parseInt(product.stock_quantity || product.stock || '0') || 0,
          rating: parseFloat(product.rating || product.average_rating || '0') || 0,
          reviewCount: parseInt(product.reviews_count || product.review_count || '0') || 0,
          sku: product.sku || product.sku_code || '',
          features: this.normalizeFeatures(product),
          materials: this.normalizeMaterials(product),
          careInstructions: this.normalizeCareInstructions(product)
        };

        // Initialiser les sélections
        if (this.product.images.length > 0) {
          this.selectedImage = this.product.images[0];
          this.selectedImageIndex = 0;
        }
        if (this.product.colors.length > 0) {
          this.selectedColor = this.product.colors[0].name;
        }
        if (this.product.sizes.length > 0) {
          this.selectedSize = this.product.sizes[0];
        }

        this.loading = false;

        // Charger les avis
        this.loadReviews();
        // Charger les produits similaires
        this.loadRelatedProducts();
      },
      error: (error: any) => {
        console.error('Erreur chargement produit:', error);
        this.loading = false;
        const errorMessage = error.error?.message || 'Erreur lors du chargement du produit. Veuillez réessayer.';
        this.toastService.error(errorMessage);
      }
    });
  }

  /**
   * Normalise le champ images pour s'assurer qu'il est toujours un tableau
   */
  private normalizeImages(images: any): string[] {
    if (!images) return [];
    if (Array.isArray(images)) {
      return images.map((img: any) => {
        if (typeof img === 'string') return img;
        if (img && typeof img === 'object') {
          return img.url || img.path || img.image_url || img.src || '';
        }
        return '';
      }).filter((url: string) => url && url.trim() !== '');
    }
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) {
          return parsed.map((img: any) => {
            if (typeof img === 'string') return img;
            return img?.url || img?.path || img?.image_url || '';
          }).filter((url: string) => url && url.trim() !== '');
        }
        return [images];
      } catch {
        return [images];
      }
    }
    return [];
  }

  /**
   * Extrait le nom de la catégorie
   */
  private extractCategoryName(product: any): string {
    if (product.category) {
      if (typeof product.category === 'string') return product.category;
      if (product.category.name) return product.category.name;
      if (product.category.title) return product.category.title;
    }
    if (product.category_name) return product.category_name;
    if (product.category_id) return product.category_id;
    return '';
  }

  /**
   * Normalise les couleurs
   */
  private normalizeColors(product: any): { name: string; code: string }[] {
    if (product.variants && Array.isArray(product.variants)) {
      const colors = product.variants
        .filter((v: any) => v.attributes?.color || v.color)
        .map((v: any) => ({
          name: v.attributes?.color || v.color || 'Non spécifié',
          code: v.attributes?.color_code || v.color_code || '#000000'
        }));
      if (colors.length > 0) return colors;
    }
    if (product.colors && Array.isArray(product.colors)) {
      return product.colors.map((c: any) => ({
        name: typeof c === 'string' ? c : (c.name || c.color || 'Non spécifié'),
        code: typeof c === 'string' ? '#000000' : (c.code || c.color_code || '#000000')
      }));
    }
    if (product.colors_available) {
      try {
        const colors = typeof product.colors_available === 'string' 
          ? JSON.parse(product.colors_available)
          : product.colors_available;
        if (Array.isArray(colors)) {
          return colors.map((c: any) => ({
            name: typeof c === 'string' ? c : (c.name || 'Non spécifié'),
            code: typeof c === 'string' ? '#000000' : (c.code || '#000000')
          }));
        }
      } catch (e) {
        console.warn('Erreur parsing colors_available:', e);
      }
    }
    return [];
  }

  /**
   * Normalise les tailles
   */
  private normalizeSizes(product: any): string[] {
    if (product.variants && Array.isArray(product.variants)) {
      const sizes = product.variants
        .filter((v: any) => v.attributes?.size || v.size)
        .map((v: any) => String(v.attributes?.size || v.size || ''));
      if (sizes.length > 0) return [...new Set(sizes)] as string[];
    }
    if (product.sizes && Array.isArray(product.sizes)) {
      return product.sizes.map((s: any) => typeof s === 'string' ? s : (s.size || s.name || s));
    }
    if (product.sizes_available) {
      try {
        const sizes = typeof product.sizes_available === 'string'
          ? JSON.parse(product.sizes_available)
          : product.sizes_available;
        if (Array.isArray(sizes)) {
          return sizes.map((s: any) => typeof s === 'string' ? s : (s.size || s.name || s));
        }
      } catch (e) {
        console.warn('Erreur parsing sizes_available:', e);
      }
    }
    return [];
  }

  /**
   * Normalise les caractéristiques
   */
  private normalizeFeatures(product: any): string[] {
    if (product.specifications) {
      if (typeof product.specifications === 'string') {
        try {
          const specs = JSON.parse(product.specifications);
          if (typeof specs === 'object' && !Array.isArray(specs)) {
            return Object.entries(specs).map(([key, value]) => `${key}: ${value}`);
          }
        } catch (e) {
          return [product.specifications];
        }
      }
      if (typeof product.specifications === 'object' && !Array.isArray(product.specifications)) {
        return Object.entries(product.specifications).map(([key, value]) => `${key}: ${value}`);
      }
      if (Array.isArray(product.specifications)) {
        return product.specifications;
      }
    }
    if (product.features && Array.isArray(product.features)) {
      return product.features;
    }
    return [];
  }

  /**
   * Normalise les matériaux
   */
  private normalizeMaterials(product: any): string {
    if (product.materials) {
      if (typeof product.materials === 'string') {
        try {
          const materials = JSON.parse(product.materials);
          if (typeof materials === 'object') {
            return materials.text || materials.name || JSON.stringify(materials);
          }
          return materials;
        } catch {
          return product.materials;
        }
      }
      if (typeof product.materials === 'object') {
        return product.materials.text || product.materials.name || JSON.stringify(product.materials);
      }
    }
    return '';
  }

  /**
   * Normalise les instructions d'entretien
   */
  private normalizeCareInstructions(product: any): string[] {
    if (product.care_instructions) {
      if (typeof product.care_instructions === 'string') {
        try {
          const instructions = JSON.parse(product.care_instructions);
          if (Array.isArray(instructions)) {
            return instructions.map((i: any) => typeof i === 'string' ? i : (i.text || i.instruction || JSON.stringify(i)));
          }
          if (typeof instructions === 'object') {
            return instructions.text ? [instructions.text] : [JSON.stringify(instructions)];
          }
        } catch {
          return [product.care_instructions];
        }
      }
      if (Array.isArray(product.care_instructions)) {
        return product.care_instructions.map((i: any) => typeof i === 'string' ? i : (i.text || i.instruction || JSON.stringify(i)));
      }
    }
    return [];
  }

  loadReviews(): void {
    if (!this.productId) return;

    // Utiliser la méthode getProductReviews du ProductService
    this.productService.getProductReviews(this.productId).subscribe({
      next: (response: any) => {
        const reviewsData = Array.isArray(response) 
          ? response 
          : (response.data?.data || response.data || []);
        this.reviews = reviewsData.map((review: any) => ({
          id: review.id,
          author: (review.user?.first_name || '') + ' ' + (review.user?.last_name || '') || review.user?.name || review.author || 'Anonyme',
          rating: parseFloat(review.rating || '0') || 0,
          date: review.created_at 
            ? new Date(review.created_at).toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })
            : 'Date inconnue',
          comment: review.comment || review.text || '',
          verified: review.is_verified || review.verified || false
        }));
      },
      error: (error) => {
        console.error('Erreur chargement avis:', error);
        // Ne pas afficher d'erreur si c'est juste qu'il n'y a pas d'avis
        if (error.status !== 404) {
          console.warn('Impossible de charger les avis');
        }
      }
    });
  }

  loadRelatedProducts(): void {
    if (!this.product) return;

    // Essayer d'abord de charger les produits similaires via l'endpoint dédié
    this.productService.getRelatedProducts(this.productId, 4).subscribe({
      next: (response: any) => {
        const products = Array.isArray(response) 
          ? response 
          : (response.data?.data || response.data || []);
        this.relatedProducts = products
          .filter((p: any) => p.id !== this.productId && p.id !== this.product?.id)
          .slice(0, 4)
          .map((product: any) => {
            const images = this.normalizeImages(product.images || product.image_url);
            return {
              id: product.id || product.id,
              name: product.name || 'Produit sans nom',
              price: parseFloat(product.price || '0') || 0,
              oldPrice: product.compare_price ? parseFloat(product.compare_price) : undefined,
              image: images.length > 0 ? images[0] : '/assets/images/products/default.jpg',
              rating: parseFloat(product.rating || product.average_rating || '0') || 0
            };
          });
      },
      error: (error) => {
        // Si l'endpoint des produits similaires échoue, charger des produits récents
        console.warn('Erreur chargement produits similaires, chargement de produits récents:', error);
        this.productService.getProducts({
          limit: 8,
          status: 'active',
          sort: 'newest'
        }).subscribe({
          next: (response: any) => {
            const products = Array.isArray(response) 
              ? response 
              : (response.data?.data || response.data || []);
            this.relatedProducts = products
              .filter((p: any) => p.id !== this.productId && p.id !== this.product?.id)
              .slice(0, 4)
              .map((product: any) => {
                const images = this.normalizeImages(product.images || product.image_url);
                return {
                  id: product.id || product.id,
                  name: product.name || 'Produit sans nom',
                  price: parseFloat(product.price || '0') || 0,
                  oldPrice: product.compare_price ? parseFloat(product.compare_price) : undefined,
                  image: images.length > 0 ? images[0] : '/assets/images/products/default.jpg',
                  rating: parseFloat(product.rating || product.average_rating || '0') || 0
                };
              });
          },
          error: (err) => {
            console.error('Erreur chargement produits récents:', err);
          }
        });
      }
    });
  }

  selectImage(index: number): void {
    if (this.product) {
      this.selectedImageIndex = index;
      this.selectedImage = this.product.images[index];
    }
  }

  nextImage(): void {
    if (this.product) {
      this.selectedImageIndex = (this.selectedImageIndex + 1) % this.product.images.length;
      this.selectedImage = this.product.images[this.selectedImageIndex];
    }
  }

  previousImage(): void {
    if (this.product) {
      this.selectedImageIndex = this.selectedImageIndex === 0 
        ? this.product.images.length - 1 
        : this.selectedImageIndex - 1;
      this.selectedImage = this.product.images[this.selectedImageIndex];
    }
  }

  selectColor(color: string): void {
    this.selectedColor = color;
  }

  selectSize(size: string): void {
    this.selectedSize = size;
  }

  incrementQuantity(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (!this.selectedSize) {
      this.toastService.error('Veuillez sélectionner une taille');
      return;
    }

    // Vérifier si l'utilisateur est authentifié
    if (!this.authService.isAuthenticated()) {
      this.toastService.warning('Veuillez vous connecter pour ajouter des articles au panier');
      return;
    }

    if (!this.product) return;

    // Ajouter au panier via le service
    this.cartService.addToCart({
      product_id: this.product.id?.toString() || this.productId,
      quantity: this.quantity
    }).subscribe({
      next: (cartItem) => {
        console.log('✅ Produit ajouté au panier:', cartItem);
        this.toastService.success(`${this.product!.name} ajouté au panier avec succès!`);
      },
      error: (error) => {
        console.error('❌ Erreur lors de l\'ajout au panier:', error);
        const errorMessage = error.error?.message || 'Erreur lors de l\'ajout au panier. Veuillez réessayer.';
        this.toastService.error(errorMessage);
      }
    });
  }

  addToWishlist(): void {
    // Vérifier si l'utilisateur est authentifié
    if (!this.authService.isAuthenticated()) {
      this.toastService.warning('Veuillez vous connecter pour ajouter des articles aux favoris');
      return;
    }

    if (!this.product) return;

    // Ajouter aux favoris via le service
    this.wishlistService.addToWishlist(this.product.id?.toString() || this.productId).subscribe({
      next: (response) => {
        console.log('✅ Produit ajouté aux favoris:', response);
        this.toastService.success(`${this.product!.name} ajouté aux favoris avec succès!`);
      },
      error: (error) => {
        console.error('❌ Erreur lors de l\'ajout aux favoris:', error);
        const errorMessage = error.error?.message || 'Erreur lors de l\'ajout aux favoris. Veuillez réessayer.';
        this.toastService.error(errorMessage);
      }
    });
  }

  setActiveTab(tab: 'description' | 'features' | 'reviews'): void {
    this.activeTab = tab;
  }

  getStarArray(rating: number): string[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push('full');
      } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
        stars.push('half');
      } else {
        stars.push('empty');
      }
    }
    return stars;
  }

  getDiscountPercentage(): number {
    if (this.product && this.product.oldPrice) {
      return Math.round(((this.product.oldPrice - this.product.price) / this.product.oldPrice) * 100);
    }
    return 0;
  }

  contactVendor(): void {
    // Vérifier si l'utilisateur est authentifié
      this.authService.isAuthenticated$.subscribe(isAuth => {
      if (!isAuth) {
        this.toastService.warning('Veuillez vous connecter pour contacter le vendeur');
        this.router.navigate(['/auth/login']);
        return;
      }

      if (!this.product) return;

      // Convertir les IDs en nombres si nécessaire
      const sellerId = this.vendorId 
        ? (typeof this.vendorId === 'string' ? parseInt(this.vendorId) || 0 : this.vendorId)
        : (typeof this.product.id === 'string' ? parseInt(this.product.id) || 0 : this.product.id);
      
      const productId = typeof this.product.id === 'string' 
        ? parseInt(this.product.id) || 0 
        : this.product.id;

      if (!sellerId || !productId) {
        this.toastService.error('Impossible de contacter le vendeur. Informations manquantes.');
        return;
      }

      // Créer une nouvelle conversation avec le vendeur
      this.messageService.createConversation({
        seller_id: sellerId as number,
        product_id: productId as number,
        subject: `Question sur ${this.product.name}`,
        initial_message: `Bonjour, j'ai une question concernant ce produit : ${this.product.name}`
      }).subscribe({
        next: (conversation: any) => {
          console.log('✅ Conversation créée:', conversation);
          // Naviguer vers la conversation
          this.router.navigate(['/messages', conversation.id || conversation.data?.id]);
        },
        error: (error: any) => {
          console.error('❌ Erreur lors de la création de la conversation:', error);
          const errorMessage = error.error?.message || 'Erreur lors de la création de la conversation. Veuillez réessayer.';
          this.toastService.error(errorMessage);
        }
      });
    });
  }
}