import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { VendorService } from '../../../../core/services/vendor.service';
import { ReplyDialogComponent } from './reply-dialog.component';
import { ImageDialogComponent } from './image-dialog.component';
import { ReviewSettingsDialogComponent, ReviewSettings } from './review-settings-dialog.component';

interface Review {
  id: string;
  customer: {
    name: string;
    avatar?: string;
    email: string;
  };
  product: {
    id: string;
    name: string;
    image: string;
  };
  rating: number;
  title: string;
  content: string;
  images?: string[];
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected' | 'reported';
  vendorReply?: {
    content: string;
    timestamp: Date;
  };
  helpful: number;
  verified: boolean;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  recentReviews: number;
  pendingReviews: number;
  reportedReviews: number;
}

@Component({
  selector: 'app-vendor-reviews',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatBadgeModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressBarModule
  ],
  template: `
    <div class="vendor-reviews">
      <!-- Header -->
      <div class="reviews-header">
        <div class="header-content">
          <h1>
            <mat-icon>star</mat-icon>
            Avis & Commentaires
          </h1>
          <p>Gérez les avis de vos clients et répondez-leur</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="exportReviews()">
            <mat-icon>download</mat-icon>
            Exporter
          </button>
          <button mat-raised-button (click)="openSettings()">
            <mat-icon>settings</mat-icon>
            Paramètres
          </button>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="reviews-stats">
        <mat-card class="stats-card">
          <mat-card-content>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-icon">
                  <mat-icon>star</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ reviewStats.averageRating.toFixed(1) }}/5</h3>
                  <p>Note moyenne</p>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">
                  <mat-icon>rate_review</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ reviewStats.totalReviews }}</h3>
                  <p>Total avis</p>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">
                  <mat-icon>schedule</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ reviewStats.pendingReviews }}</h3>
                  <p>En attente</p>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">
                  <mat-icon>report</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ reviewStats.reportedReviews }}</h3>
                  <p>Signalés</p>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Distribution des notes -->
        <mat-card class="distribution-card">
          <mat-card-header>
            <mat-card-title>Distribution des Notes</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="rating-distribution">
              @for (dist of reviewStats.ratingDistribution; track dist.rating) {
                <div class="rating-item">
                  <div class="rating-label">
                    <span>{{ dist.rating }} étoiles</span>
                    <span class="rating-count">({{ dist.count }})</span>
                  </div>
                  <mat-progress-bar 
                    mode="determinate" 
                    [value]="dist.percentage"
                    [color]="getRatingColor(dist.rating)">
                  </mat-progress-bar>
                  <span class="rating-percentage">{{ dist.percentage }}%</span>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Filtres et recherche -->
      <div class="reviews-filters">
        <mat-card class="filters-card">
          <mat-card-content>
            <div class="filters-container">
              <div class="search-section">
                <mat-form-field appearance="outline" class="search-field">
                  <mat-label>Rechercher dans les avis</mat-label>
                  <input matInput [(ngModel)]="searchQuery" (input)="filterReviews()" placeholder="Nom, produit, contenu...">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>
              </div>
              
              <div class="filters-section">
                <div class="filter-group">
                  <mat-form-field appearance="outline" class="filter-field">
                    <mat-label>Statut</mat-label>
                    <mat-select [(ngModel)]="selectedStatus" (selectionChange)="filterReviews()">
                      <mat-option value="all">Tous les statuts</mat-option>
                      <mat-option value="pending">En attente</mat-option>
                      <mat-option value="approved">Approuvés</mat-option>
                      <mat-option value="rejected">Rejetés</mat-option>
                      <mat-option value="reported">Signalés</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="filter-group">
                  <mat-form-field appearance="outline" class="filter-field">
                    <mat-label>Note</mat-label>
                    <mat-select [(ngModel)]="selectedRating" (selectionChange)="filterReviews()">
                      <mat-option value="all">Toutes les notes</mat-option>
                      <mat-option value="5">5 étoiles</mat-option>
                      <mat-option value="4">4 étoiles</mat-option>
                      <mat-option value="3">3 étoiles</mat-option>
                      <mat-option value="2">2 étoiles</mat-option>
                      <mat-option value="1">1 étoile</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="filter-group">
                  <mat-form-field appearance="outline" class="filter-field">
                    <mat-label>Trier par</mat-label>
                    <mat-select [(ngModel)]="sortBy" (selectionChange)="sortReviews()">
                      <mat-option value="newest">Plus récents</mat-option>
                      <mat-option value="oldest">Plus anciens</mat-option>
                      <mat-option value="highest">Note la plus haute</mat-option>
                      <mat-option value="lowest">Note la plus basse</mat-option>
                      <mat-option value="pending">En attente</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="filter-actions">
                  <button mat-button (click)="clearFilters()" class="clear-filters-btn">
                    <mat-icon>clear</mat-icon>
                    Effacer
                  </button>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Liste des avis -->
      <div class="reviews-content">
        <mat-tab-group>
          <!-- Onglet Tous les avis -->
          <mat-tab label="Tous les avis">
            <div class="reviews-list">
              @for (review of filteredReviews; track review.id) {
                <mat-card class="review-card" [class.pending]="review.status === 'pending'" [class.reported]="review.status === 'reported'">
                  <mat-card-content>
                    <div class="review-header">
                      <div class="customer-info">
                        <div class="customer-avatar">
                          @if (review.customer.avatar) {
                            <img [src]="review.customer.avatar" [alt]="review.customer.name">
                          } @else {
                            <mat-icon>person</mat-icon>
                          }
                        </div>
                        <div class="customer-details">
                          <h4>{{ review.customer.name }}</h4>
                          <p>{{ review.customer.email }}</p>
                          @if (review.verified) {
                            <mat-chip class="verified-chip">
                              <mat-icon>verified</mat-icon>
                              Achat vérifié
                            </mat-chip>
                          }
                        </div>
                      </div>
                      
                      <div class="review-meta">
                        <div class="review-rating">
                          @for (star of [1,2,3,4,5]; track star) {
                            <mat-icon [class.filled]="star <= review.rating" [class.empty]="star > review.rating">
                              {{ star <= review.rating ? 'star' : 'star_border' }}
                            </mat-icon>
                          }
                        </div>
                        <div class="review-date">{{ formatDate(review.timestamp) }}</div>
                        <div class="review-status">
                          <mat-chip [ngClass]="'status-' + review.status">
                            {{ getStatusLabel(review.status) }}
                          </mat-chip>
                        </div>
                      </div>
                    </div>

                    <div class="product-info">
                      <div class="product-image">
                        <img [src]="review.product.image" [alt]="review.product.name">
                      </div>
                      <div class="product-details">
                        <h5>{{ review.product.name }}</h5>
                        <p>Produit #{{ review.product.id }}</p>
                      </div>
                    </div>

                    <div class="review-content">
                      <h5>{{ review.title }}</h5>
                      <p>{{ review.content }}</p>
                      
                      @if (review.images && review.images.length > 0) {
                        <div class="review-images">
                          @for (image of review.images; track image) {
                            <img [src]="image" [alt]="'Image avis'" class="review-image" (click)="openImageDialog(image)">
                          }
                        </div>
                      }
                    </div>

                    <div class="review-actions">
                      <div class="helpful-section">
                        <button mat-icon-button (click)="markAsHelpful(review)">
                          <mat-icon>thumb_up</mat-icon>
                        </button>
                        <span>{{ review.helpful }} personnes ont trouvé cet avis utile</span>
                      </div>
                      
                      <div class="action-buttons">
                        @if (review.status === 'pending') {
                          <button mat-raised-button color="primary" (click)="approveReview(review)">
                            <mat-icon>check</mat-icon>
                            Approuver
                          </button>
                          <button mat-raised-button (click)="rejectReview(review)">
                            <mat-icon>close</mat-icon>
                            Rejeter
                          </button>
                        }
                        
                        @if (!review.vendorReply) {
                          <button mat-raised-button (click)="replyToReview(review)">
                            <mat-icon>reply</mat-icon>
                            Répondre
                          </button>
                        }
                        
                        <button mat-icon-button [matMenuTriggerFor]="reviewMenu">
                          <mat-icon>more_vert</mat-icon>
                        </button>
                        
                        <mat-menu #reviewMenu="matMenu">
                          <button mat-menu-item (click)="reportReview(review)">
                            <mat-icon>report</mat-icon>
                            Signaler
                          </button>
                          <button mat-menu-item (click)="deleteReview(review)">
                            <mat-icon>delete</mat-icon>
                            Supprimer
                          </button>
                        </mat-menu>
                      </div>
                    </div>

                    <!-- Réponse du vendeur -->
                    @if (review.vendorReply) {
                      <div class="vendor-reply">
                        <div class="reply-header">
                          <mat-icon>storefront</mat-icon>
                          <span>Réponse du vendeur</span>
                          <span class="reply-date">{{ formatDate(review.vendorReply.timestamp) }}</span>
                        </div>
                        <div class="reply-content">
                          <p>{{ review.vendorReply.content }}</p>
                        </div>
                        <div class="reply-actions">
                          <button mat-button (click)="editReply(review)">
                            <mat-icon>edit</mat-icon>
                            Modifier
                          </button>
                          <button mat-button (click)="deleteReply(review)">
                            <mat-icon>delete</mat-icon>
                            Supprimer
                          </button>
                        </div>
                      </div>
                    }
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </mat-tab>

          <!-- Onglet En attente -->
          <mat-tab label="En attente">
            <div class="reviews-list">
              @for (review of pendingReviews; track review.id) {
                <mat-card class="review-card pending">
                  <!-- Même structure que l'onglet "Tous les avis" mais filtré pour les avis en attente -->
                  <mat-card-content>
                    <!-- Contenu identique mais adapté pour les avis en attente -->
                    <div class="review-header">
                      <div class="customer-info">
                        <div class="customer-avatar">
                          @if (review.customer.avatar) {
                            <img [src]="review.customer.avatar" [alt]="review.customer.name">
                          } @else {
                            <mat-icon>person</mat-icon>
                          }
                        </div>
                        <div class="customer-details">
                          <h4>{{ review.customer.name }}</h4>
                          <p>{{ review.customer.email }}</p>
                        </div>
                      </div>
                      
                      <div class="review-meta">
                        <div class="review-rating">
                          @for (star of [1,2,3,4,5]; track star) {
                            <mat-icon [class.filled]="star <= review.rating" [class.empty]="star > review.rating">
                              {{ star <= review.rating ? 'star' : 'star_border' }}
                            </mat-icon>
                          }
                        </div>
                        <div class="review-date">{{ formatDate(review.timestamp) }}</div>
                        <div class="review-status">
                          <mat-chip class="status-pending">En attente</mat-chip>
                        </div>
                      </div>
                    </div>

                    <div class="product-info">
                      <div class="product-image">
                        <img [src]="review.product.image" [alt]="review.product.name">
                      </div>
                      <div class="product-details">
                        <h5>{{ review.product.name }}</h5>
                        <p>Produit #{{ review.product.id }}</p>
                      </div>
                    </div>

                    <div class="review-content">
                      <h5>{{ review.title }}</h5>
                      <p>{{ review.content }}</p>
                    </div>

                    <div class="review-actions">
                      <div class="action-buttons">
                        <button mat-raised-button color="primary" (click)="approveReview(review)">
                          <mat-icon>check</mat-icon>
                          Approuver
                        </button>
                        <button mat-raised-button (click)="rejectReview(review)">
                          <mat-icon>close</mat-icon>
                          Rejeter
                        </button>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </mat-tab>

          <!-- Onglet Signalés -->
          <mat-tab label="Signalés">
            <div class="reviews-list">
              @for (review of reportedReviews; track review.id) {
                <mat-card class="review-card reported">
                  <!-- Même structure mais pour les avis signalés -->
                  <mat-card-content>
                    <div class="review-header">
                      <div class="customer-info">
                        <div class="customer-avatar">
                          @if (review.customer.avatar) {
                            <img [src]="review.customer.avatar" [alt]="review.customer.name">
                          } @else {
                            <mat-icon>person</mat-icon>
                          }
                        </div>
                        <div class="customer-details">
                          <h4>{{ review.customer.name }}</h4>
                          <p>{{ review.customer.email }}</p>
                        </div>
                      </div>
                      
                      <div class="review-meta">
                        <div class="review-rating">
                          @for (star of [1,2,3,4,5]; track star) {
                            <mat-icon [class.filled]="star <= review.rating" [class.empty]="star > review.rating">
                              {{ star <= review.rating ? 'star' : 'star_border' }}
                            </mat-icon>
                          }
                        </div>
                        <div class="review-date">{{ formatDate(review.timestamp) }}</div>
                        <div class="review-status">
                          <mat-chip class="status-reported">Signalé</mat-chip>
                        </div>
                      </div>
                    </div>

                    <div class="review-content">
                      <h5>{{ review.title }}</h5>
                      <p>{{ review.content }}</p>
                    </div>

                    <div class="review-actions">
                      <div class="action-buttons">
                        <button mat-raised-button color="primary" (click)="approveReview(review)">
                          <mat-icon>check</mat-icon>
                          Approuver
                        </button>
                        <button mat-raised-button (click)="rejectReview(review)">
                          <mat-icon>close</mat-icon>
                          Rejeter
                        </button>
                        <button mat-raised-button (click)="dismissReport(review)">
                          <mat-icon>dismiss</mat-icon>
                          Ignorer
                        </button>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .vendor-reviews {
      background: #f8fafc;
      min-height: 100vh;
    }

    .reviews-header {
      background: linear-gradient(135deg, #8B2E2E 0%, #6B1F1F 100%);
      color: white;
      padding: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-content h1 {
      font-size: 2rem;
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-content h1 mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .header-content p {
      margin: 0;
      opacity: 0.9;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .reviews-stats {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
      padding: 2rem;
    }

    .stats-card {
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #8B2E2E, #D9744F);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
    }

    .stat-info h3 {
      font-size: 2rem;
      margin: 0 0 0.25rem 0;
      color: #1f2937;
    }

    .stat-info p {
      margin: 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .distribution-card {
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .rating-distribution {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .rating-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .rating-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 120px;
      font-size: 0.9rem;
      color: #374151;
    }

    .rating-count {
      color: #6b7280;
      font-size: 0.8rem;
    }

    .rating-percentage {
      min-width: 40px;
      text-align: right;
      font-size: 0.9rem;
      color: #6b7280;
    }

    .reviews-filters {
      padding: 0 2rem 1rem 2rem;
    }

    .filters-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .filters-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .search-section {
      display: flex;
      justify-content: center;
    }

    .search-field {
      width: 100%;
      max-width: 500px;
    }

    .filters-section {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
      justify-content: center;
    }

    .filter-group {
      display: flex;
      align-items: center;
    }

    .filter-field {
      min-width: 150px;
      width: 180px;
    }

    .filter-actions {
      display: flex;
      align-items: center;
      margin-left: auto;
    }

    .clear-filters-btn {
      color: #6b7280;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .clear-filters-btn:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }

    .reviews-content {
      padding: 0 2rem 2rem 2rem;
    }

    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .review-card {
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .review-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .review-card.pending {
      border-left: 4px solid #ff9800;
    }

    .review-card.reported {
      border-left: 4px solid #f44336;
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .customer-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .customer-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      overflow: hidden;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .customer-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .customer-avatar mat-icon {
      font-size: 1.5rem;
      color: #6b7280;
    }

    .customer-details h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1.1rem;
      color: #1f2937;
    }

    .customer-details p {
      margin: 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .verified-chip {
      background: #d1fae5;
      color: #065f46;
      font-size: 0.75rem;
      height: 24px;
    }

    .review-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .review-rating {
      display: flex;
      gap: 0.25rem;
    }

    .review-rating mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }

    .review-rating mat-icon.filled {
      color: #ffc107;
    }

    .review-rating mat-icon.empty {
      color: #d1d5db;
    }

    .review-date {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .review-status mat-chip {
      font-size: 0.75rem;
      height: 24px;
    }

    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .status-approved {
      background: #d1fae5;
      color: #065f46;
    }

    .status-rejected {
      background: #fee2e2;
      color: #991b1b;
    }

    .status-reported {
      background: #fef2f2;
      color: #dc2626;
    }

    .product-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .product-image {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      background: #e5e7eb;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-details h5 {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
      color: #1f2937;
    }

    .product-details p {
      margin: 0;
      color: #6b7280;
      font-size: 0.85rem;
    }

    .review-content {
      margin-bottom: 1rem;
    }

    .review-content h5 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      color: #1f2937;
    }

    .review-content p {
      margin: 0;
      color: #374151;
      line-height: 1.6;
    }

    .review-images {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .review-image {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      object-fit: cover;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .review-image:hover {
      transform: scale(1.05);
    }

    .review-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .helpful-section {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .vendor-reply {
      margin-top: 1rem;
      padding: 1rem;
      background: #fef3f2;
      border-radius: 8px;
      border-left: 4px solid #8B2E2E;
    }

    .reply-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #8B2E2E;
    }

    .reply-date {
      margin-left: auto;
      font-size: 0.8rem;
      color: #6b7280;
    }

    .reply-content p {
      margin: 0;
      color: #374151;
      line-height: 1.6;
    }

    .reply-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    @media (max-width: 768px) {
      .reviews-stats {
        grid-template-columns: 1fr;
      }

      .filters-container {
        gap: 1rem;
      }

      .filters-section {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .filter-field {
        width: 100%;
        min-width: auto;
      }

      .filter-actions {
        margin-left: 0;
        justify-content: center;
      }

      .search-field {
        max-width: none;
      }

      .review-header {
        flex-direction: column;
        gap: 1rem;
      }

      .review-meta {
        align-items: flex-start;
      }

      .review-actions {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .action-buttons {
        justify-content: center;
      }
    }
  `]
})
export class VendorReviewsComponent implements OnInit {
  searchQuery: string = '';
  selectedStatus: string = 'all';
  selectedRating: string = 'all';
  sortBy: string = 'newest';

  reviews: Review[] = [
    {
      id: '1',
      customer: {
        name: 'Marie Kouassi',
        avatar: '/assets/images/avatars/marie.jpg',
        email: 'marie.kouassi@email.com'
      },
      product: {
        id: 'PROD-001',
        name: 'Robe Ankara Élégante',
        image: '/assets/images/products/robe-1.jpg'
      },
      rating: 5,
      title: 'Magnifique robe !',
      content: 'J\'adore cette robe, la qualité est excellente et elle me va parfaitement. Je recommande vivement !',
      images: ['/assets/images/reviews/review-1.jpg'],
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: 'approved',
      vendorReply: {
        content: 'Merci beaucoup Marie ! Nous sommes ravis que la robe vous plaise. N\'hésitez pas à nous faire confiance pour vos prochains achats.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60)
      },
      helpful: 12,
      verified: true
    },
    {
      id: '2',
      customer: {
        name: 'Jean Dupont',
        email: 'jean.dupont@email.com'
      },
      product: {
        id: 'PROD-002',
        name: 'Chemise Wax Premium',
        image: '/assets/images/products/chemise-1.jpg'
      },
      rating: 4,
      title: 'Très satisfait',
      content: 'Bonne qualité, livraison rapide. Petit bémol sur la taille qui est un peu grande.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      status: 'approved',
      helpful: 8,
      verified: true
    },
    {
      id: '3',
      customer: {
        name: 'Fatou Diallo',
        email: 'fatou.diallo@email.com'
      },
      product: {
        id: 'PROD-003',
        name: 'Ensemble Kente Royal',
        image: '/assets/images/products/ensemble-1.jpg'
      },
      rating: 2,
      title: 'Déçu par la qualité',
      content: 'Le tissu n\'est pas de la qualité attendue et la couture laisse à désirer. Je ne recommande pas.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
      status: 'pending',
      helpful: 3,
      verified: false
    }
  ];

  filteredReviews: Review[] = [];
  pendingReviews: Review[] = [];
  reportedReviews: Review[] = [];

  reviewStats: ReviewStats = {
    averageRating: 4.2,
    totalReviews: 127,
    ratingDistribution: [
      { rating: 5, count: 45, percentage: 35 },
      { rating: 4, count: 38, percentage: 30 },
      { rating: 3, count: 25, percentage: 20 },
      { rating: 2, count: 12, percentage: 9 },
      { rating: 1, count: 7, percentage: 6 }
    ],
    recentReviews: 15,
    pendingReviews: 3,
    reportedReviews: 1
  };

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private vendorService: VendorService
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.vendorService.getReviews().subscribe({
      next: (data: any) => {
        if (data.reviews) {
          this.reviews = data.reviews;
          this.filteredReviews = this.reviews;
          this.pendingReviews = this.reviews.filter(r => r.status === 'pending');
          this.reportedReviews = this.reviews.filter(r => r.status === 'reported');
        }
        if (data.reviewStats) {
          this.reviewStats = { ...this.reviewStats, ...data.reviewStats };
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des avis:', error);
        // Garder les données mockées
        this.filteredReviews = this.reviews;
        this.pendingReviews = this.reviews.filter(r => r.status === 'pending');
        this.reportedReviews = this.reviews.filter(r => r.status === 'reported');
      }
    });
  }

  filterReviews(): void {
    this.filteredReviews = this.reviews.filter(review => {
      const matchesSearch = review.customer.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           review.product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           review.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           review.content.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesStatus = this.selectedStatus === 'all' || review.status === this.selectedStatus;
      const matchesRating = this.selectedRating === 'all' || review.rating.toString() === this.selectedRating;
      
      return matchesSearch && matchesStatus && matchesRating;
    });
  }

  sortReviews(): void {
    this.filteredReviews.sort((a, b) => {
      switch (this.sortBy) {
        case 'newest':
          return b.timestamp.getTime() - a.timestamp.getTime();
        case 'oldest':
          return a.timestamp.getTime() - b.timestamp.getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'pending':
          return a.status === 'pending' ? -1 : 1;
        default:
          return 0;
      }
    });
  }

  approveReview(review: Review): void {
    review.status = 'approved';
    this.snackBar.open('Avis approuvé', 'Fermer', { duration: 3000 });
    this.updateStats();
  }

  rejectReview(review: Review): void {
    review.status = 'rejected';
    this.snackBar.open('Avis rejeté', 'Fermer', { duration: 3000 });
    this.updateStats();
  }

  reportReview(review: Review): void {
    review.status = 'reported';
    this.snackBar.open('Avis signalé', 'Fermer', { duration: 3000 });
    this.updateStats();
  }

  dismissReport(review: Review): void {
    review.status = 'approved';
    this.snackBar.open('Signalement ignoré', 'Fermer', { duration: 3000 });
    this.updateStats();
  }

  deleteReview(review: Review): void {
    const index = this.reviews.indexOf(review);
    if (index > -1) {
      this.reviews.splice(index, 1);
      this.filterReviews();
      this.updateStats();
    }
  }

  replyToReview(review: Review): void {
    const dialogRef = this.dialog.open(ReplyDialogComponent, {
      width: '600px',
      data: { review }
    });

    dialogRef.afterClosed().subscribe(reply => {
      if (reply) {
        this.vendorService.replyToReview(review.id, reply).subscribe({
          next: () => {
            review.vendorReply = {
              content: reply,
              timestamp: new Date()
            };
            this.snackBar.open('✅ Réponse publiée avec succès', 'Fermer', { duration: 3000 });
          },
          error: (error) => {
            console.error('Erreur lors de la publication de la réponse:', error);
            this.snackBar.open('❌ Erreur lors de la publication', 'Fermer', { duration: 3000 });
          }
        });
      }
    });
  }

  editReply(review: Review): void {
    console.log('✏️ Modifier la réponse:', review.id);
    // Logique pour modifier la réponse
  }

  deleteReply(review: Review): void {
    review.vendorReply = undefined;
    this.snackBar.open('Réponse supprimée', 'Fermer', { duration: 3000 });
  }

  markAsHelpful(review: Review): void {
    review.helpful++;
    this.snackBar.open('Merci pour votre retour !', 'Fermer', { duration: 2000 });
  }

  openImageDialog(imageUrl: string): void {
    console.log('🖼️ Ouvrir image:', imageUrl);
    // Logique pour ouvrir l'image en plein écran
  }

  exportReviews(): void {
    console.log('📊 Exporter les avis...');
    // Logique d'export
  }

  openSettings(): void {
    console.log('⚙️ Ouvrir les paramètres des avis...');
    
    const currentSettings: ReviewSettings = {
      autoApprove: false,
      requireVerification: true,
      allowImages: true,
      maxImages: 3,
      moderationLevel: 'moderate',
      emailNotifications: true,
      responseDeadline: 7
    };

    const dialogRef = this.dialog.open(ReviewSettingsDialogComponent, {
      width: '600px',
      maxHeight: '80vh',
      data: currentSettings,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('✅ Paramètres sauvegardés:', result);
        this.snackBar.open('Paramètres sauvegardés avec succès', 'Fermer', { duration: 3000 });
        // TODO: Sauvegarder les paramètres via l'API
      }
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = 'all';
    this.selectedRating = 'all';
    this.sortBy = 'newest';
    this.filterReviews();
    this.snackBar.open('Filtres effacés', 'Fermer', { duration: 2000 });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'En attente',
      'approved': 'Approuvé',
      'rejected': 'Rejeté',
      'reported': 'Signalé'
    };
    return labels[status] || status;
  }

  getRatingColor(rating: number): string {
    if (rating >= 4) return 'primary';
    if (rating >= 3) return 'accent';
    return 'warn';
  }

  formatDate(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Aujourd\'hui';
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    return timestamp.toLocaleDateString('fr-FR');
  }

  updateStats(): void {
    this.reviewStats.pendingReviews = this.reviews.filter(r => r.status === 'pending').length;
    this.reviewStats.reportedReviews = this.reviews.filter(r => r.status === 'reported').length;
    this.reviewStats.totalReviews = this.reviews.length;
    
    const totalRating = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.reviewStats.averageRating = totalRating / this.reviews.length;
  }

}


