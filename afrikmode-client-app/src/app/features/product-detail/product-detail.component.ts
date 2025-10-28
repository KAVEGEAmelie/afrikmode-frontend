import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { AuthService } from '../../core/services/auth.service';
import { MessageService } from '../../core/services/message.service';
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
  
  // Avis
  reviews: Review[] = [
    {
      id: 1,
      author: 'Marie K.',
      rating: 5,
      date: '15 Mars 2025',
      comment: 'Magnifique robe, tissu de qualité exceptionnelle. Les motifs sont encore plus beaux en vrai!',
      verified: true
    },
    {
      id: 2,
      author: 'Kofi A.',
      rating: 4,
      date: '10 Mars 2025',
      comment: 'Très satisfait de mon achat. La coupe est parfaite et le tissu respire bien.',
      verified: true
    },
    {
      id: 3,
      author: 'Fatou D.',
      rating: 5,
      date: '5 Mars 2025',
      comment: 'Service impeccable, livraison rapide. Je recommande vivement!',
      verified: true
    }
  ];
  
  // Produits similaires
  relatedProducts = [
    {
      id: 2,
      name: 'Chemise Wax Premium',
      price: 35000,
      image: '/assets/images/products/chemise-1.jpg',
      rating: 4.8
    },
    {
      id: 3,
      name: 'Ensemble Traditionnel',
      price: 85000,
      oldPrice: 95000,
      image: '/assets/images/products/ensemble-1.jpg',
      rating: 4.7
    },
    {
      id: 4,
      name: 'Sac à Main Artisanal',
      price: 25000,
      image: '/assets/images/products/sac-1.jpg',
      rating: 4.3
    },
    {
      id: 5,
      name: 'Boubou Homme Luxe',
      price: 75000,
      image: '/assets/images/products/boubou-1.jpg',
      rating: 4.6
    }
  ];

  // Onglets
  activeTab: 'description' | 'features' | 'reviews' = 'description';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.productId = +params['id'];
      this.loadProduct();
    });
  }

  loadProduct(): void {
    // Données temporaires - à remplacer par un appel API
    this.product = {
      id: 1,
      name: 'Robe Ankara Élégante',
      price: 45000,
      oldPrice: 55000,
      description: `Cette magnifique robe Ankara incarne l'élégance et la sophistication de la mode africaine contemporaine. 
      Confectionnée avec un tissu wax authentique de première qualité, elle marie harmonieusement tradition et modernité.
      
      La coupe ajustée sublime la silhouette tout en offrant un confort optimal grâce à un tissu respirant et léger. 
      Les motifs géométriques vibrants témoignent du savoir-faire artisanal africain et ajoutent une touche d'authenticité à votre garde-robe.`,
      
      images: [
        '/assets/images/products/robe-1.jpg',
        '/assets/images/products/robe-2.jpg',
        '/assets/images/products/robe-3.jpg',
        '/assets/images/products/robe-4.jpg'
      ],
      
      category: 'Robes',
      
      colors: [
        { name: 'Rouge & Or', code: '#e74c3c' },
        { name: 'Bleu Royal', code: '#3498db' },
        { name: 'Vert Émeraude', code: '#27ae60' }
      ],
      
      sizes: ['S', 'M', 'L', 'XL'],
      stock: 15,
      rating: 4.5,
      reviewCount: 28,
      sku: 'RAF-001',
      
      features: [
        'Tissu wax 100% coton authentique',
        'Coupe cintrée avec fermeture éclair invisible',
        'Doublure intérieure en coton',
        'Poches latérales dissimulées',
        'Longueur midi élégante',
        'Résistant et durable'
      ],
      
      materials: 'Tissu wax 100% coton importé d\'Afrique de l\'Ouest. Doublure 100% coton.',
      
      careInstructions: [
        'Lavage à la main ou en machine à 30°C',
        'Ne pas utiliser d\'eau de javel',
        'Repasser à température moyenne',
        'Séchage à l\'air libre recommandé',
        'Ne pas nettoyer à sec'
      ]
    };

    this.selectedImage = this.product.images[0];
    if (this.product.colors.length > 0) {
      this.selectedColor = this.product.colors[0].name;
    }
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
      alert('Veuillez sélectionner une taille');
      return;
    }

    // Vérifier si l'utilisateur est authentifié
    if (!this.authService.isAuthenticated()) {
      alert('Veuillez vous connecter pour ajouter des articles au panier');
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
        alert('Produit ajouté au panier avec succès!');
      },
      error: (error) => {
        console.error('❌ Erreur lors de l\'ajout au panier:', error);
        alert('Erreur lors de l\'ajout au panier. Veuillez réessayer.');
      }
    });
  }

  addToWishlist(): void {
    // Vérifier si l'utilisateur est authentifié
    if (!this.authService.isAuthenticated()) {
      alert('Veuillez vous connecter pour ajouter des articles aux favoris');
      return;
    }

    if (!this.product) return;

    // Ajouter aux favoris via le service
    this.wishlistService.addToWishlist(this.product.id.toString()).subscribe({
      next: (response) => {
        console.log('✅ Produit ajouté aux favoris:', response);
        alert('Produit ajouté aux favoris avec succès!');
      },
      error: (error) => {
        console.error('❌ Erreur lors de l\'ajout aux favoris:', error);
        alert('Erreur lors de l\'ajout aux favoris. Veuillez réessayer.');
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
        alert('Veuillez vous connecter pour contacter le vendeur');
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
          alert('Erreur lors de la création de la conversation. Veuillez réessayer.');
        }
      });
    });
  }
}