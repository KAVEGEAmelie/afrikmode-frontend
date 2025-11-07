import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-nouveautes',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf, NgFor],
  templateUrl: './nouveautes.component.html',
  styleUrls: ['./nouveautes.component.scss']
})
export class NouveautesComponent implements OnInit {
  featuredProducts = [
    {
      id: 1,
      name: 'Dashiki Royal',
      price: 89.99,
      originalPrice: 120.00,
      image: 'assets/images/nouveautes/dashiki-royal.jpg',
      category: 'Nouveauté',
      isNew: true,
      discount: 25
    },
    {
      id: 2,
      name: 'Robe Ankara Moderne',
      price: 134.99,
      originalPrice: 180.00,
      image: 'assets/images/nouveautes/robe-ankara.jpg',
      category: 'Nouveauté',
      isNew: true,
      discount: 25
    },
    {
      id: 3,
      name: 'Ensemble Kente Premium',
      price: 199.99,
      originalPrice: 280.00,
      image: 'assets/images/nouveautes/kente-ensemble.jpg',
      category: 'Nouveauté',
      isNew: true,
      discount: 30
    },
    {
      id: 4,
      name: 'Caftan Brodé Or',
      price: 159.99,
      originalPrice: 210.00,
      image: 'assets/images/nouveautes/caftan-or.jpg',
      category: 'Nouveauté',
      isNew: true,
      discount: 24
    },
    {
      id: 5,
      name: 'Kimono Wax Élégant',
      price: 79.99,
      originalPrice: 110.00,
      image: 'assets/images/nouveautes/kimono-wax.jpg',
      category: 'Nouveauté',
      isNew: true,
      discount: 27
    },
    {
      id: 6,
      name: 'Tunique Bogolan Chic',
      price: 94.99,
      originalPrice: 130.00,
      image: 'assets/images/nouveautes/tunique-bogolan.jpg',
      category: 'Nouveauté',
      isNew: true,
      discount: 27
    }
  ];

  collections = [
    {
      title: 'Collection Printemps 2025',
      description: 'Découvrez notre nouvelle collection inspirée des couleurs vives du printemps africain.',
      image: 'assets/images/collections/printemps-2025.jpg',
      itemCount: 42
    },
    {
      title: 'Édition Limitée Wax Premium',
      description: 'Des pièces uniques confectionnées avec les plus beaux tissus Wax du continent.',
      image: 'assets/images/collections/wax-premium.jpg',
      itemCount: 18
    },
    {
      title: 'Fusion Moderne',
      description: 'L\'alliance parfaite entre tradition africaine et tendances contemporaines.',
      image: 'assets/images/collections/fusion-moderne.jpg',
      itemCount: 35
    }
  ];

  trends = [
    {
      title: 'Imprimés Géométriques',
      description: 'Les motifs géométriques font leur grand retour cette saison',
      icon: '🔸'
    },
    {
      title: 'Couleurs Terre',
      description: 'Les tons ocre, terracotta et safran sont à l\'honneur',
      icon: '🌍'
    },
    {
      title: 'Coupes Oversize',
      description: 'Le confort rencontre l\'élégance dans des silhouettes amples',
      icon: '👗'
    },
    {
      title: 'Accessoires Dorés',
      description: 'Les bijoux et ceintures dorées subliment chaque tenue',
      icon: '✨'
    }
  ];

  constructor(
    private router: Router,
    private wishlistService: WishlistService,
    private toastService: ToastService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
  }

  addToCart(product: any): void {
    console.log('Produit ajouté au panier:', product);
    // Logique d'ajout au panier
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

  viewProduct(product: any): void {
    console.log('Voir le produit:', product);
    // Navigation vers le détail du produit
  }
}