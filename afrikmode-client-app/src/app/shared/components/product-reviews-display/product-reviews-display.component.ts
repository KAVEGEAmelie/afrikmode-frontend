// src/app/shared/components/product-reviews-display/product-reviews-display.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { Review, ReviewStats, User } from '../../../core/models';

@Component({
  selector: 'app-product-reviews-display',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-reviews-display.component.html',
  styleUrls: ['./product-reviews-display.component.scss']
})
export class ProductReviewsDisplayComponent implements OnInit {
  @Input() productId!: string;
  
  reviews: Review[] = [];
  stats: ReviewStats | null = null;
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 10;
  
  // Filtres
  selectedRating: number | null = null;
  sortBy: 'recent' | 'helpful' | 'rating' = 'recent';
  
  // États
  loading = false;
  showReviewForm = false;
  
  // Formulaire d'avis
  newReview = {
    rating: 5,
    title: '',
    comment: '',
    images: [] as File[]
  };
  
  imagePreviews: string[] = [];
  isAuthenticated = false;
  currentUser: any = null;

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAuth();
    this.loadReviews();
    this.loadStats();
  }

  checkAuth(): void {
    const token = localStorage.getItem('auth_token');
    this.isAuthenticated = !!token;
    
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        this.currentUser = JSON.parse(userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }

  loadReviews(): void {
    if (!this.productId) return;
    
    this.loading = true;
    
    const params: any = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      sort: this.sortBy
    };
    
    if (this.selectedRating) {
      params.rating = this.selectedRating;
    }
    
    this.reviewService.getProductReviews(this.productId, params).subscribe({
      next: (response) => {
        this.reviews = response.data || [];
        this.totalPages = response.pagination?.totalPages || 1;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    if (!this.productId) return;
    
    this.reviewService.getProductStats(this.productId).subscribe({
      next: (stats: ReviewStats) => {
        this.stats = stats;
      },
      error: (err: any) => {
        console.error('Error loading stats:', err);
      }
    });
  }

  filterByRating(rating: number | null): void {
    this.selectedRating = rating;
    this.currentPage = 1;
    this.loadReviews();
  }

  changeSortBy(sort: 'recent' | 'helpful' | 'rating'): void {
    this.sortBy = sort;
    this.currentPage = 1;
    this.loadReviews();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadReviews();
      this.scrollToTop();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadReviews();
      this.scrollToTop();
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openReviewForm(): void {
    if (!this.isAuthenticated) {
      if (confirm('Vous devez être connecté pour laisser un avis. Voulez-vous vous connecter maintenant ?')) {
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: this.router.url }
        });
      }
      return;
    }
    
    this.showReviewForm = true;
  }

  closeReviewForm(): void {
    this.showReviewForm = false;
    this.resetReviewForm();
  }

  resetReviewForm(): void {
    this.newReview = {
      rating: 5,
      title: '',
      comment: '',
      images: []
    };
    this.imagePreviews = [];
  }

  onImagesSelected(event: any): void {
    const files = Array.from(event.target.files as FileList);
    
    if (files.length + this.newReview.images.length > 5) {
      alert('Vous ne pouvez ajouter que 5 images maximum.');
      return;
    }
    
    files.forEach((file: any) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`Le fichier ${file.name} est trop volumineux (5 MB maximum).`);
        return;
      }
      
      this.newReview.images.push(file);
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number): void {
    this.newReview.images.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  submitReview(): void {
    if (!this.newReview.comment.trim()) {
      alert('Veuillez rédiger un commentaire.');
      return;
    }
    
    this.loading = true;
    
    const formData = new FormData();
    formData.append('product_id', this.productId);
    formData.append('rating', this.newReview.rating.toString());
    formData.append('comment', this.newReview.comment);
    
    if (this.newReview.title) {
      formData.append('title', this.newReview.title);
    }
    
    this.newReview.images.forEach((image, index) => {
      formData.append('images', image);
    });
    
    this.reviewService.createReview(formData).subscribe({
      next: (response) => {
        console.log('✅ Review created:', response);
        alert('Votre avis a été publié avec succès !');
        this.closeReviewForm();
        this.loadReviews();
        this.loadStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error creating review:', error);
        alert('Erreur lors de la publication de votre avis. Veuillez réessayer.');
        this.loading = false;
      }
    });
  }

  markHelpful(reviewId: string, helpful: boolean): void {
    if (!this.isAuthenticated) {
      alert('Vous devez être connecté pour marquer un avis comme utile.');
      return;
    }
    
    this.reviewService.markReviewHelpful(reviewId, helpful).subscribe({
      next: () => {
        this.loadReviews();
      },
      error: (error) => {
        console.error('Error marking review:', error);
        alert('Erreur lors de l\'action. Veuillez réessayer.');
      }
    });
  }

  getStarsArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Il y a ${months} mois`;
    }
    const years = Math.floor(diffDays / 365);
    return `Il y a ${years} an${years > 1 ? 's' : ''}`;
  }

  getRatingPercentage(rating: number): number {
    if (!this.stats || !this.stats.total_reviews) return 0;
    const distribution: any = this.stats.rating_distribution || {};
    const count = distribution[rating] || 0;
    return (count / this.stats.total_reviews) * 100;
  }

  getUserDisplayName(user?: User): string {
    if (!user) return 'Utilisateur anonyme';
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return fullName || user.email || 'Utilisateur anonyme';
  }
}
