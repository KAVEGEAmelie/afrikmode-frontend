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

interface Product {
  id: number;
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
  imports: [CommonModule, RouterModule, FormsModule, ProductReviewsDisplayComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {

  productId: number = 0;
  product: Product | null = null;
  
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
      this.productId = +params['id'];
      this.loadProduct();
    });
  }

  loadProduct(): void {
    if (!this.productId) return;

    this.productService.getProduct(this.productId.toString()).subscribe({
      next: (product: any) => {
        // Mapper les données de l'API vers l'interface locale
        this.product = {
          id: parseInt(product.id) || product.id,
          name: product.name,
          price: product.price,
          oldPrice: product.compare_price,
          description: product.description || '',
          images: product.images && product.images.length > 0 
            ? product.images.map((img: any) => img.url || img)
            : [product.image_url || '/assets/images/products/default.jpg'],
          category: product.category?.name || '',
          colors: product.variants?.filter((v: any) => v.attributes?.color)
            .map((v: any) => ({
              name: v.attributes.color,
              code: v.attributes.color_code || '#000000'
            })) || [],
          sizes: product.variants?.filter((v: any) => v.attributes?.size)
            .map((v: any) => v.attributes.size) || [],
          stock: product.stock_quantity || 0,
          rating: product.rating || 0,
          reviewCount: product.reviews_count || 0,
          sku: product.sku || '',
          features: product.specifications ? Object.entries(product.specifications).map(([key, value]) => `${key}: ${value}`) : [],
          materials: product.materials || '',
          careInstructions: product.care_instructions || []
        };

        // Initialiser les sélections
        if (this.product.images.length > 0) {
          this.selectedImage = this.product.images[0];
        }
        if (this.product.colors.length > 0) {
          this.selectedColor = this.product.colors[0].name;
        }
        if (this.product.sizes.length > 0) {
          this.selectedSize = this.product.sizes[0];
        }

        // Charger les avis
        this.loadReviews();
        // Charger les produits similaires
        this.loadRelatedProducts();
      },
      error: (error: any) => {
        console.error('Erreur chargement produit:', error);
        const errorMessage = error.error?.message || 'Erreur lors du chargement du produit. Veuillez réessayer.';
        this.toastService.error(errorMessage);
      }
    });
  }

  loadReviews(): void {
    if (!this.productId) return;

    // Utiliser la méthode getProductReviews du ProductService
    this.productService.getProductReviews(this.productId.toString()).subscribe({
      next: (response: any) => {
        const reviewsData = Array.isArray(response) ? response : response.data || [];
        this.reviews = reviewsData.map((review: any) => ({
          id: review.id,
          author: review.user?.first_name + ' ' + review.user?.last_name || 'Anonyme',
          rating: review.rating || 0,
          date: new Date(review.created_at).toLocaleDateString('fr-FR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          comment: review.comment || '',
          verified: review.is_verified || false
        }));
      },
      error: (error) => {
        console.error('Erreur chargement avis:', error);
      }
    });
  }

  loadRelatedProducts(): void {
    if (!this.product) return;

    // Note: category_id attend un ID, pas un nom. Il faudrait mapper le nom vers l'ID
    // Pour l'instant, on charge simplement les produits récents
    this.productService.getProducts({
      limit: 8,
      status: 'active',
      sort: 'popularity'
    }).subscribe({
      next: (response: any) => {
        const products = Array.isArray(response) ? response : response.data || [];
        this.relatedProducts = products
          .filter((p: any) => p.id !== this.productId)
          .slice(0, 4)
          .map((product: any) => ({
            id: parseInt(product.id) || product.id,
            name: product.name,
            price: product.price,
            oldPrice: product.compare_price,
            image: product.image_url || product.images?.[0]?.url || '/assets/images/products/default.jpg',
            rating: product.rating || 0
          }));
      },
      error: (error) => {
        console.error('Erreur chargement produits similaires:', error);
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
      product_id: this.product.id.toString(),
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
    this.wishlistService.addToWishlist(this.product.id.toString()).subscribe({
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

      // Créer une nouvelle conversation avec le vendeur
      this.messageService.createConversation({
        seller_id: this.product.id, // À remplacer par vendor_id quand disponible
        product_id: this.product.id,
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