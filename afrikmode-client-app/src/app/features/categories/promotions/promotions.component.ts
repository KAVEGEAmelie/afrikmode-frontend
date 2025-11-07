import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [CommonModule, RouterModule, NgFor],
  templateUrl: './promotions.component.html',
  styleUrls: ['./promotions.component.scss']
})
export class PromotionsComponent implements OnInit {
  promotionalOffers = [
    {
      title: 'Soldes d\'Été',
      description: 'Jusqu\'à 50% de réduction sur toute la collection été',
      discount: 50,
      endDate: '2025-10-15',
      image: 'assets/images/promotions/soldes-ete.jpg',
      category: 'Toutes catégories'
    },
    {
      title: 'Nouvelle Collection',
      description: '20% de réduction sur les nouveautés',
      discount: 20,
      endDate: '2025-10-30',
      image: 'assets/images/promotions/nouvelle-collection.jpg',
      category: 'Nouveautés'
    }
  ];

  saleProducts = [
    {
      id: 1,
      name: 'Robe Ankara Soldes',
      price: 74.99,
      originalPrice: 149.99,
      image: 'assets/images/promotions/robe-soldes.jpg',
      discount: 50,
      rating: 4.7,
      reviews: 28
    },
    {
      id: 2,
      name: 'Ensemble Kente Promo',
      price: 149.99,
      originalPrice: 249.99,
      image: 'assets/images/promotions/ensemble-promo.jpg',
      discount: 40,
      rating: 4.8,
      reviews: 35
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  addToCart(product: any): void {
    console.log('Produit ajouté au panier:', product);
  }

  getRemainingDays(endDate: string): number {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = Math.abs(end.getTime() - now.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}