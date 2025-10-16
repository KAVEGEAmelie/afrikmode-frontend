import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-accessoires',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf, NgFor],
  templateUrl: './accessoires.component.html',
  styleUrls: ['./accessoires.component.scss']
})
export class AccessoiresComponent implements OnInit {
  categories = [
    { name: 'Bijoux', count: 48, icon: '💍', path: '/accessoires/bijoux' },
    { name: 'Sacs', count: 32, icon: '👜', path: '/accessoires/sacs' },
    { name: 'Chaussures', count: 28, icon: '👠', path: '/accessoires/chaussures' },
    { name: 'Foulards', count: 35, icon: '🧣', path: '/accessoires/foulards' },
    { name: 'Ceintures', count: 22, icon: '👔', path: '/accessoires/ceintures' },
    { name: 'Chapeaux', count: 18, icon: '👒', path: '/accessoires/chapeaux' }
  ];

  allProducts = [
    {
      id: 1,
      name: 'Collier Cowrie Premium',
      price: 79.99,
      originalPrice: 99.99,
      image: 'assets/images/accessoires/collier-cowrie.jpg',
      category: 'Bijoux',
      rating: 4.9,
      reviews: 42,
      isPopular: true
    },
    {
      id: 2,
      name: 'Sac Kente Élégant',
      price: 134.99,
      originalPrice: 179.99,
      image: 'assets/images/accessoires/sac-kente.jpg',
      category: 'Sacs',
      rating: 4.8,
      reviews: 31,
      isPopular: true
    }
  ];

  featuredProducts = this.allProducts;

  constructor(private router: Router, private route: ActivatedRoute) { }

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
    console.log('Produit ajouté à la wishlist:', product);
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