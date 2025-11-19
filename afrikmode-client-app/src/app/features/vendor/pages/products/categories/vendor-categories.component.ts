import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CategoryService } from '../../../../../core/services/category.service';
import { VendorService } from '../../../core/services/vendor.service';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  parent_id?: string;
  icon?: string;
  image?: string;
  level?: number;
  is_active: boolean;
  product_count?: number;
  vendor_product_count?: number; // Nombre de produits du vendeur dans cette catégorie
  subcategories?: Category[];
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-vendor-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="vendor-categories-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>
            <i class="fas fa-tags"></i>
            Catégories Disponibles
          </h1>
          <p>Découvrez les catégories pour classer vos produits</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="goBack()">
            <i class="fas fa-arrow-left"></i>
            Retour aux produits
          </button>
          <button class="btn btn-primary" (click)="addNewProduct()">
            <i class="fas fa-plus"></i>
            Ajouter un produit
          </button>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-folder"></i>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ totalCategories }}</span>
            <span class="stat-label">Catégories disponibles</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-layer-group"></i>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ totalSubcategories }}</span>
            <span class="stat-label">Sous-catégories</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-box"></i>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ totalVendorProducts }}</span>
            <span class="stat-label">Vos produits</span>
          </div>
        </div>
      </div>

      <!-- Info Banner -->
      <div class="info-banner">
        <i class="fas fa-info-circle"></i>
        <div class="info-content">
          <strong>Comment ça marche ?</strong>
          <p>Choisissez la catégorie qui correspond le mieux à votre produit. Cela aide les clients à trouver facilement vos articles. Les catégories sont gérées par l'équipe AfrikMode.</p>
        </div>
      </div>

      <!-- Barre de recherche -->
      <div class="search-section">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            type="text"
            placeholder="Rechercher une catégorie..."
            [(ngModel)]="searchTerm"
            (input)="filterCategories()">
        </div>
        <div class="filter-actions">
          <button class="btn btn-outline" (click)="expandAll()">
            <i class="fas fa-expand-arrows-alt"></i>
            Tout développer
          </button>
          <button class="btn btn-outline" (click)="collapseAll()">
            <i class="fas fa-compress-arrows-alt"></i>
            Tout réduire
          </button>
        </div>
      </div>

      <!-- Loading -->
      @if (loading) {
        <div class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Chargement des catégories...</p>
        </div>
      }

      <!-- Catégories List -->
      @if (!loading && filteredCategories.length > 0) {
        <div class="categories-container">
          @for (category of filteredCategories; track category.id) {
            <div class="category-card" [class.expanded]="isExpanded(category.id)">
              <!-- En-tête de catégorie -->
              <div class="category-header" (click)="toggleCategory(category.id)">
                <div class="category-info">
                  <div class="category-icon-wrapper">
                    @if (category.subcategories && category.subcategories.length > 0) {
                      <i class="fas expand-icon"
                         [class.fa-chevron-right]="!isExpanded(category.id)"
                         [class.fa-chevron-down]="isExpanded(category.id)"></i>
                    }
                    @if (category.icon) {
                      <span class="category-emoji">{{ category.icon }}</span>
                    } @else {
                      <i class="fas fa-folder"></i>
                    }
                  </div>
                  <div class="category-details">
                    <h3 class="category-name">{{ category.name }}</h3>
                    @if (category.description) {
                      <p class="category-description">{{ category.description }}</p>
                    }
                    <div class="category-meta">
                      <span class="meta-item">
                        <i class="fas fa-box"></i>
                        <strong>{{ category.vendor_product_count || 0 }}</strong> de vos produits
                      </span>
                      @if (category.product_count) {
                        <span class="meta-item secondary">
                          <i class="fas fa-store"></i>
                          {{ category.product_count }} produits au total
                        </span>
                      }
                      @if (category.subcategories && category.subcategories.length > 0) {
                        <span class="meta-item secondary">
                          <i class="fas fa-layer-group"></i>
                          {{ category.subcategories.length }} sous-catégories
                        </span>
                      }
                    </div>
                  </div>
                </div>
                <div class="category-actions" (click)="$event.stopPropagation()">
                  @if (category.is_active) {
                    <button
                      class="btn btn-sm btn-primary"
                      (click)="addProductToCategory(category)"
                      matTooltip="Ajouter un produit dans cette catégorie">
                      <i class="fas fa-plus"></i>
                      Ajouter produit
                    </button>
                  } @else {
                    <span class="badge badge-inactive">Inactive</span>
                  }
                </div>
              </div>

              <!-- Sous-catégories -->
              @if (isExpanded(category.id) && category.subcategories && category.subcategories.length > 0) {
                <div class="subcategories">
                  @for (subcat of category.subcategories; track subcat.id) {
                    <div class="subcategory-item">
                      <div class="subcategory-info">
                        <div class="subcategory-icon">
                          @if (subcat.icon) {
                            <span>{{ subcat.icon }}</span>
                          } @else {
                            <i class="fas fa-folder"></i>
                          }
                        </div>
                        <div class="subcategory-details">
                          <h4 class="subcategory-name">{{ subcat.name }}</h4>
                          @if (subcat.description) {
                            <p class="subcategory-description">{{ subcat.description }}</p>
                          }
                          <div class="subcategory-meta">
                            <span class="meta-item">
                              <i class="fas fa-box"></i>
                              <strong>{{ subcat.vendor_product_count || 0 }}</strong> de vos produits
                            </span>
                            @if (subcat.product_count) {
                              <span class="meta-item secondary">
                                {{ subcat.product_count }} au total
                              </span>
                            }
                          </div>
                        </div>
                      </div>
                      <div class="subcategory-actions">
                        @if (subcat.is_active) {
                          <button
                            class="btn btn-sm btn-primary"
                            (click)="addProductToCategory(subcat)"
                            matTooltip="Ajouter un produit">
                            <i class="fas fa-plus"></i>
                            Ajouter
                          </button>
                        } @else {
                          <span class="badge badge-inactive">Inactive</span>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Empty State -->
      @if (!loading && filteredCategories.length === 0) {
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <h3>Aucune catégorie trouvée</h3>
          <p>Essayez de modifier votre recherche</p>
          <button class="btn btn-primary" (click)="clearSearch()">
            <i class="fas fa-times"></i>
            Effacer la recherche
          </button>
        </div>
      }

      <!-- Guide d'aide -->
      <div class="help-section">
        <h2>
          <i class="fas fa-question-circle"></i>
          Besoin d'aide pour choisir ?
        </h2>
        <div class="help-cards">
          <div class="help-card">
            <i class="fas fa-lightbulb"></i>
            <h3>Choisissez la bonne catégorie</h3>
            <p>Sélectionnez la catégorie qui décrit le mieux votre produit. Utilisez les sous-catégories pour être plus précis.</p>
          </div>
          <div class="help-card">
            <i class="fas fa-tags"></i>
            <h3>Plusieurs catégories ?</h3>
            <p>Si votre produit correspond à plusieurs catégories, choisissez la plus spécifique. Vous pouvez utiliser les tags pour ajouter des détails.</p>
          </div>
          <div class="help-card">
            <i class="fas fa-headset"></i>
            <h3>Besoin d'assistance ?</h3>
            <p>Contactez notre support si vous avez besoin d'aide pour classer vos produits ou pour suggérer une nouvelle catégorie.</p>
            <button class="btn btn-outline btn-sm" (click)="contactSupport()">
              <i class="fas fa-comment"></i>
              Contacter le support
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vendor-categories-page {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header-content h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #2C3E50;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-content h1 i {
      color: #8B2E2E;
    }

    .header-content p {
      color: #6B7280;
      margin: 0;
      font-size: 1.1rem;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      font-size: 0.95rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #8B2E2E 0%, #D9744F 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(139, 46, 46, 0.3);
    }

    .btn-secondary {
      background: #F3F4F6;
      color: #374151;
      border: 1px solid #D1D5DB;
    }

    .btn-secondary:hover {
      background: #E5E7EB;
    }

    .btn-outline {
      background: transparent;
      color: #6B7280;
      border: 1px solid #D1D5DB;
    }

    .btn-outline:hover {
      background: #F9FAFB;
      color: #374151;
    }

    .btn-sm {
      padding: 8px 16px;
      font-size: 0.875rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background: linear-gradient(135deg, #8B2E2E 0%, #D9744F 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #2C3E50;
      line-height: 1;
    }

    .stat-label {
      color: #6B7280;
      font-size: 0.9rem;
      margin-top: 4px;
    }

    .info-banner {
      background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
      border-left: 4px solid #6366F1;
      padding: 20px 24px;
      border-radius: 12px;
      margin-bottom: 32px;
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .info-banner i {
      font-size: 1.5rem;
      color: #6366F1;
      margin-top: 2px;
    }

    .info-content strong {
      display: block;
      color: #312E81;
      margin-bottom: 4px;
      font-size: 1.05rem;
    }

    .info-content p {
      color: #4338CA;
      margin: 0;
      line-height: 1.6;
    }

    .search-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 32px;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      flex: 1;
      max-width: 500px;
    }

    .search-box i {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: #9CA3AF;
      font-size: 1.1rem;
    }

    .search-box input {
      width: 100%;
      padding: 14px 16px 14px 48px;
      border: 2px solid #E5E7EB;
      border-radius: 10px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .search-box input:focus {
      outline: none;
      border-color: #8B2E2E;
      box-shadow: 0 0 0 3px rgba(139, 46, 46, 0.1);
    }

    .filter-actions {
      display: flex;
      gap: 8px;
    }

    .loading-container {
      text-align: center;
      padding: 80px 24px;
      color: #6B7280;
    }

    .loading-container p {
      margin-top: 16px;
      font-size: 1.1rem;
    }

    .categories-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 48px;
    }

    .category-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .category-card:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }

    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .category-header:hover {
      background-color: #F9FAFB;
    }

    .category-info {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
    }

    .category-icon-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .expand-icon {
      color: #6B7280;
      font-size: 0.875rem;
      transition: transform 0.3s ease;
    }

    .category-emoji {
      font-size: 2rem;
    }

    .category-icon-wrapper i:not(.expand-icon) {
      font-size: 1.5rem;
      color: #8B2E2E;
    }

    .category-details {
      flex: 1;
    }

    .category-name {
      font-size: 1.25rem;
      font-weight: 700;
      color: #2C3E50;
      margin: 0 0 4px 0;
    }

    .category-description {
      color: #6B7280;
      font-size: 0.9rem;
      margin: 0 0 8px 0;
      line-height: 1.5;
    }

    .category-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 0.875rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #374151;
    }

    .meta-item i {
      color: #8B2E2E;
    }

    .meta-item.secondary {
      color: #6B7280;
    }

    .meta-item.secondary i {
      color: #9CA3AF;
    }

    .category-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge-inactive {
      background: #FEE2E2;
      color: #991B1B;
    }

    .subcategories {
      background: #F9FAFB;
      border-top: 1px solid #E5E7EB;
      padding: 16px 24px 24px;
    }

    .subcategory-item {
      background: white;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s ease;
      border: 1px solid #E5E7EB;
    }

    .subcategory-item:last-child {
      margin-bottom: 0;
    }

    .subcategory-item:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border-color: #D1D5DB;
    }

    .subcategory-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .subcategory-icon {
      font-size: 1.5rem;
      color: #6B7280;
    }

    .subcategory-details {
      flex: 1;
    }

    .subcategory-name {
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
      margin: 0 0 4px 0;
    }

    .subcategory-description {
      font-size: 0.85rem;
      color: #6B7280;
      margin: 0 0 6px 0;
    }

    .subcategory-meta {
      display: flex;
      gap: 12px;
      font-size: 0.8rem;
    }

    .empty-state {
      text-align: center;
      padding: 80px 24px;
      background: white;
      border-radius: 12px;
    }

    .empty-state i {
      font-size: 4rem;
      color: #D1D5DB;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      color: #374151;
      margin: 0 0 8px 0;
    }

    .empty-state p {
      color: #6B7280;
      margin: 0 0 24px 0;
    }

    .help-section {
      margin-top: 48px;
      padding: 32px;
      background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
      border-radius: 16px;
    }

    .help-section h2 {
      font-size: 1.5rem;
      color: #2C3E50;
      margin: 0 0 24px 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .help-section h2 i {
      color: #8B2E2E;
    }

    .help-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .help-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .help-card i {
      font-size: 2rem;
      color: #8B2E2E;
      margin-bottom: 12px;
    }

    .help-card h3 {
      font-size: 1.1rem;
      color: #2C3E50;
      margin: 0 0 8px 0;
    }

    .help-card p {
      color: #6B7280;
      line-height: 1.6;
      margin: 0 0 16px 0;
    }

    @media (max-width: 768px) {
      .vendor-categories-page {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        align-items: stretch;
      }

      .header-actions {
        justify-content: stretch;
      }

      .btn {
        flex: 1;
        justify-content: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .search-section {
        flex-direction: column;
        align-items: stretch;
      }

      .search-box {
        max-width: none;
      }

      .category-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .category-info {
        flex-direction: column;
        align-items: flex-start;
      }

      .category-actions {
        justify-content: stretch;
      }

      .category-actions .btn {
        flex: 1;
      }

      .subcategory-item {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }

      .help-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class VendorCategoriesComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  searchTerm = '';
  expandedCategories = new Set<string>();
  loading = false;

  constructor(
    private router: Router,
    private categoryService: CategoryService,
    private vendorService: VendorService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    console.log('🔄 Chargement des catégories pour le vendeur...');

    // Charger les catégories depuis l'API
    this.categoryService.getCategories(true, true).subscribe({
      next: (response: any) => {
        console.log('📦 Réponse API catégories (type):', typeof response);
        console.log('📦 Réponse API catégories (keys):', response ? Object.keys(response) : 'null');
        console.log('📦 Réponse API catégories (complète):', JSON.stringify(response, null, 2));

        // Extraire les catégories de la réponse normalisée
        // Le service normalise déjà la réponse en { success: true, data: [...] }
        let categoriesData = [];
        
        // Le service retourne toujours { success: true, data: [...] }
        if (response && response.success && response.data && Array.isArray(response.data)) {
          categoriesData = response.data;
          console.log('✅ Format détecté: { success: true, data: [...] } -', categoriesData.length, 'catégories');
        }
        // Fallback: si response est directement un tableau (ne devrait pas arriver)
        else if (Array.isArray(response)) {
          categoriesData = response;
          console.log('✅ Format détecté: Tableau direct -', categoriesData.length, 'catégories');
        }
        // Fallback: format alternatif { data: [...] }
        else if (response && response.data && Array.isArray(response.data)) {
          categoriesData = response.data;
          console.log('✅ Format détecté: { data: [...] } -', categoriesData.length, 'catégories');
        }
        // Fallback: format alternatif { categories: [...] }
        else if (response && response.categories && Array.isArray(response.categories)) {
          categoriesData = response.categories;
          console.log('✅ Format détecté: { categories: [...] } -', categoriesData.length, 'catégories');
        }
        else {
          console.error('❌ Format de réponse non reconnu:', response);
          console.error('❌ Type de response:', typeof response);
          console.error('❌ response.success:', response?.success);
          console.error('❌ response.data:', response?.data);
          console.error('❌ response.data type:', typeof response?.data);
          console.error('❌ response.data isArray:', Array.isArray(response?.data));
        }

        console.log('📋 Catégories extraites:', categoriesData.length, categoriesData);

        if (categoriesData.length > 0) {
          // Enrichir avec le nombre de produits du vendeur
          this.categories = this.enrichCategoriesWithVendorCounts(categoriesData);
          this.filteredCategories = [...this.categories];
          console.log('✅ Catégories enrichies et chargées:', this.categories.length);
        } else {
          console.warn('⚠️ Aucune catégorie trouvée dans la réponse');
          console.warn('⚠️ Structure complète de la réponse:', response);
          this.categories = [];
          this.filteredCategories = [];
          this.snackBar.open('Aucune catégorie disponible. Créez-en une depuis le dashboard admin.', 'Fermer', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur chargement catégories:', error);
        console.error('Détails:', error.error || error.message);
        this.loading = false;
        this.categories = [];
        this.filteredCategories = [];
        this.snackBar.open(
          error.error?.message || 'Erreur lors du chargement des catégories. Veuillez réessayer.', 
          'Fermer', 
          {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          }
        );
      }
    });
  }

  private enrichCategoriesWithVendorCounts(categories: any[]): Category[] {
    // Mapper les children de l'API vers subcategories pour le frontend
    // et calculer le nombre de produits du vendeur
    if (!Array.isArray(categories)) {
      console.warn('⚠️ enrichCategoriesWithVendorCounts: categories n\'est pas un tableau', categories);
      return [];
    }

    return categories.map(cat => {
      // L'API retourne 'children', mais on veut 'subcategories' dans le frontend
      const children = cat.children || cat.subcategories || [];
      
      const enrichedCategory: Category = {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        parent_id: cat.parent_id || cat.parentId,
        icon: cat.icon,
        image: cat.image || cat.imageUrl || cat.image_url,
        level: cat.level,
        is_active: cat.is_active !== undefined ? cat.is_active : (cat.isActive !== undefined ? cat.isActive : true),
        product_count: cat.product_count || cat.productsCount || cat.products_count || 0,
        vendor_product_count: 0, // TODO: Calculer depuis les produits du vendeur
        subcategories: Array.isArray(children) && children.length > 0 
          ? this.enrichCategoriesWithVendorCounts(children) 
          : undefined,
        created_at: cat.created_at || cat.createdAt,
        updated_at: cat.updated_at || cat.updatedAt
      };
      
      return enrichedCategory;
    });
  }

  get totalCategories(): number {
    return this.categories.length;
  }

  get totalSubcategories(): number {
    return this.categories.reduce((total, cat) => total + (cat.subcategories?.length || 0), 0);
  }

  get totalVendorProducts(): number {
    const countProducts = (cats: Category[]): number => {
      return cats.reduce((total, cat) => {
        const catCount = cat.vendor_product_count || 0;
        const subCount = cat.subcategories ? countProducts(cat.subcategories) : 0;
        return total + catCount + subCount;
      }, 0);
    };
    return countProducts(this.categories);
  }

  filterCategories() {
    if (!this.searchTerm.trim()) {
      this.filteredCategories = [...this.categories];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredCategories = this.categories.filter(category => {
      // Recherche dans la catégorie principale
      const matchesMain = category.name.toLowerCase().includes(term) ||
                         (category.description?.toLowerCase().includes(term) || false);

      // Recherche dans les sous-catégories
      const hasMatchingSubcategory = category.subcategories?.some(sub =>
        sub.name.toLowerCase().includes(term) ||
        (sub.description?.toLowerCase().includes(term) || false)
      );

      return matchesMain || hasMatchingSubcategory;
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterCategories();
  }

  isExpanded(categoryId: string): boolean {
    return this.expandedCategories.has(categoryId);
  }

  toggleCategory(categoryId: string) {
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
    }
  }

  expandAll() {
    this.filteredCategories.forEach(category => {
      if (category.subcategories && category.subcategories.length > 0) {
        this.expandedCategories.add(category.id);
      }
    });
  }

  collapseAll() {
    this.expandedCategories.clear();
  }

  addProductToCategory(category: Category) {
    console.log('➕ Ajout produit dans catégorie:', category.name);
    // Naviguer vers le formulaire d'ajout avec la catégorie pré-sélectionnée
    this.router.navigate(['/vendor/products/add'], {
      queryParams: { category: category.id }
    });
  }

  addNewProduct() {
    this.router.navigate(['/vendor/products/add']);
  }

  goBack() {
    this.router.navigate(['/vendor/products']);
  }

  contactSupport() {
    // Ouvrir le chat support ou rediriger vers la page de contact
    this.snackBar.open('Fonction de contact en cours de développement', 'Fermer', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
