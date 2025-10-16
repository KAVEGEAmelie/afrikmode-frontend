// src/app/features/profile/components/reviews/reviews.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Review {
  id: string;
  productId: number;
  productName: string;
  productImage: string;
  rating: number;
  comment: string;
  date: Date;
  isPublished: boolean;
}

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgIf, NgFor],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {
  
  reviews: Review[] = [];
  isLoading = true;
  selectedFilter = 'all';

  filterOptions = [
    { value: 'all', label: 'Tous les avis' },
    { value: 'published', label: 'Publiés' },
    { value: 'pending', label: 'En attente' }
  ];

  constructor() { }

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.isLoading = true;
    
    // Simuler le chargement des avis
    setTimeout(() => {
      this.reviews = [
        {
          id: 'REV-001',
          productId: 1,
          productName: 'Robe Ankara Elegante',
          productImage: 'assets/images/products/robe-ankara-1.jpg',
          rating: 5,
          comment: 'Magnifique robe, la qualité est au rendez-vous et la coupe est parfaite. Je recommande vivement !',
          date: new Date('2025-09-20'),
          isPublished: true
        },
        {
          id: 'REV-002',
          productId: 2,
          productName: 'Sac Kente Premium',
          productImage: 'assets/images/products/sac-kente-1.jpg',
          rating: 4,
          comment: 'Très beau sac avec de superbes motifs traditionnels. Livraison rapide.',
          date: new Date('2025-09-18'),
          isPublished: true
        },
        {
          id: 'REV-003',
          productId: 3,
          productName: 'Ensemble Bogolan Moderne',
          productImage: 'assets/images/products/ensemble-bogolan-1.jpg',
          rating: 5,
          comment: 'Ensemble de très haute qualité, les couleurs sont magnifiques et correspondent exactement à la description.',
          date: new Date('2025-09-15'),
          isPublished: false
        }
      ];
      
      this.isLoading = false;
    }, 1000);
  }

  get filteredReviews(): Review[] {
    if (this.selectedFilter === 'all') {
      return this.reviews;
    }
    if (this.selectedFilter === 'published') {
      return this.reviews.filter(review => review.isPublished);
    }
    if (this.selectedFilter === 'pending') {
      return this.reviews.filter(review => !review.isPublished);
    }
    return this.reviews;
  }

  get publishedReviewsCount(): number {
    return this.reviews.filter(review => review.isPublished).length;
  }

  getStarArray(rating: number): number[] {
    return Array.from({length: 5}, (_, i) => i + 1);
  }

  editReview(reviewId: string): void {
    console.log('Modifier avis:', reviewId);
    // Logique pour modifier l'avis
  }

  deleteReview(reviewId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      this.reviews = this.reviews.filter(review => review.id !== reviewId);
      console.log('Avis supprimé:', reviewId);
    }
  }

  viewProduct(productId: number): void {
    console.log('Voir produit:', productId);
    // Navigation vers la page produit
  }
}
