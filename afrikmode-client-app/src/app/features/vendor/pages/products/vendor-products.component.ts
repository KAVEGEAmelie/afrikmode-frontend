import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { VendorService, VendorProduct } from '../../../../core/services/vendor.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ProductFormComponent } from './product-form/product-form.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-vendor-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProductFormComponent],
  template: `
    <div class="vendor-products">
      <!-- Header avec actions -->
      <div class="page-header">
        <div class="header-content">
          <h1>
            <i class="fas fa-box"></i>
            Gestion des Produits
          </h1>
          <p>Gérez votre catalogue de produits et suivez leurs performances</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="openAddProductModal()">
            <i class="fas fa-plus"></i>
            Nouveau Produit
          </button>
          <button class="btn btn-secondary" (click)="manageCategories()">
            <i class="fas fa-tags"></i>
            Catégories
          </button>
          <div class="export-dropdown" [class.active]="showExportMenu">
            <button class="btn btn-outline" (click)="toggleExportMenu()">
              <i class="fas fa-download"></i>
              Exporter
              <i class="fas fa-chevron-down"></i>
            </button>
            @if (showExportMenu) {
              <div class="export-menu">
              <button class="export-item" (click)="exportProducts('csv')">
                <i class="fas fa-file-csv"></i>
                Export CSV
              </button>
              <button class="export-item" (click)="exportProducts('excel')">
                <i class="fas fa-file-excel"></i>
                Export Excel
              </button>
              <button class="export-item" (click)="exportProducts('json')">
                <i class="fas fa-file-code"></i>
                Export JSON
              </button>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-box"></i>
          </div>
          <div class="stat-content">
            <h3>{{ totalProducts }}</h3>
            <p>Produits Total</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-eye"></i>
          </div>
          <div class="stat-content">
            <h3>{{ totalViews }}</h3>
            <p>Vues Total</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-shopping-cart"></i>
          </div>
          <div class="stat-content">
            <h3>{{ totalSales }}</h3>
            <p>Ventes Total</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="stat-content">
            <h3>{{ averageRating }}</h3>
            <p>Note Moyenne</p>
          </div>
        </div>
      </div>

      <!-- Filtres et recherche -->
      <div class="filters-section">
        <div class="search-bar">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Rechercher un produit..." 
            [(ngModel)]="searchTerm"
            (input)="filterProducts()"
          >
        </div>
        <div class="filters">
          <select [(ngModel)]="statusFilter" (change)="filterProducts()">
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="draft">Brouillon</option>
            <option value="out_of_stock">Rupture</option>
          </select>
          <select [(ngModel)]="categoryFilter" (change)="filterProducts()">
            <option value="">Toutes les catégories</option>
            <option value="femmes">Femmes</option>
            <option value="hommes">Hommes</option>
            <option value="enfants">Enfants</option>
            <option value="accessoires">Accessoires</option>
          </select>
          <select [(ngModel)]="sortBy" (change)="sortProducts()">
            <option value="name">Nom</option>
            <option value="price">Prix</option>
            <option value="created_at">Date de création</option>
            <option value="sales">Ventes</option>
            <option value="views">Vues</option>
          </select>
        </div>
        <div class="view-controls">
          <button 
            class="view-btn" 
            [class.active]="viewMode === 'grid'"
            (click)="viewMode = 'grid'"
          >
            <i class="fas fa-th"></i>
          </button>
          <button 
            class="view-btn" 
            [class.active]="viewMode === 'list'"
            (click)="viewMode = 'list'"
          >
            <i class="fas fa-list"></i>
          </button>
        </div>
      </div>

      <!-- Liste des produits -->
      <div class="products-section">
        @if (loading) {
          <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Chargement des produits...</p>
          </div>
        }

        @if (!loading && filteredProducts.length === 0) {
          <div class="empty-state">
          <i class="fas fa-box-open"></i>
          <h3>Aucun produit trouvé</h3>
          <p>Commencez par ajouter votre premier produit</p>
          <button class="btn btn-primary" (click)="openAddProductModal()">
            <i class="fas fa-plus"></i>
            Ajouter un produit
          </button>
          </div>
        }

        <!-- Vue grille -->
        @if (!loading && filteredProducts.length > 0 && isGridView) {
          <div class="products-grid">
          @for (product of filteredProducts; track product.id) {
            <div class="product-card">
            <div class="product-image">
              <img [src]="(product.images && product.images.length > 0 ? product.images[0] : null) || 'https://via.placeholder.com/300x300?text=Produit'" [alt]="product.name">
              <div class="product-status" [class]="'status-' + product.status">
                {{ getStatusLabel(product.status) }}
              </div>
            </div>
            <div class="product-info">
              <h3>{{ product.name }}</h3>
              <p class="product-description">{{ product.description }}</p>
              <div class="product-meta">
                <span class="price">{{ product.price | currency:'XOF':'symbol':'1.0-0':'fr' }}</span>
                <span class="stock">Stock: {{ product.stock }}</span>
              </div>
              <div class="product-stats">
                <span><i class="fas fa-eye"></i> {{ getProductViews(product) }}</span>
                <span><i class="fas fa-shopping-cart"></i> {{ getProductSales(product) }}</span>
                <span><i class="fas fa-star"></i> {{ getProductRating(product) }}</span>
              </div>
            </div>
            <div class="product-actions">
              <button class="btn btn-sm btn-primary" (click)="editProduct(product)">
                <i class="fas fa-edit"></i>
                Modifier
              </button>
              <button class="btn btn-sm btn-secondary" (click)="duplicateProduct(product)">
                <i class="fas fa-copy"></i>
                Dupliquer
              </button>
              <button class="btn btn-sm btn-danger" (click)="deleteProduct(product)">
                <i class="fas fa-trash"></i>
                Supprimer
              </button>
            </div>
          </div>
          }
          </div>
        }

        <!-- Vue liste -->
        @if (!loading && filteredProducts.length > 0 && isListView) {
          <div class="products-list">
          <div class="list-header">
            <div class="col-name">Produit</div>
            <div class="col-price">Prix</div>
            <div class="col-stock">Stock</div>
            <div class="col-status">Statut</div>
            <div class="col-views">Vues</div>
            <div class="col-sales">Ventes</div>
            <div class="col-actions">Actions</div>
          </div>
          @for (product of filteredProducts; track product.id) {
            <div class="list-item">
            <div class="col-name">
              <img [src]="(product.images && product.images.length > 0 ? product.images[0] : null) || 'https://via.placeholder.com/300x300?text=Produit'" [alt]="product.name">
              <div>
                <h4>{{ product.name }}</h4>
                <p>{{ product.description }}</p>
              </div>
            </div>
            <div class="col-price">{{ product.price | currency:'XOF':'symbol':'1.0-0':'fr' }}</div>
            <div class="col-stock">{{ product.stock }}</div>
            <div class="col-status">
              <span class="status-badge" [class]="'status-' + product.status">
                {{ getStatusLabel(product.status) }}
              </span>
            </div>
            <div class="col-views">{{ getProductViews(product) }}</div>
            <div class="col-sales">{{ getProductSales(product) }}</div>
            <div class="col-actions">
              <button class="btn btn-sm btn-icon" (click)="editProduct(product)" title="Modifier">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-icon" (click)="duplicateProduct(product)" title="Dupliquer">
                <i class="fas fa-copy"></i>
              </button>
              <button class="btn btn-sm btn-icon btn-danger" (click)="deleteProduct(product)" title="Supprimer">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          }
          </div>
        }
      </div>

      <!-- Modal de formulaire de produit -->
      @if (showProductForm) {
        <app-product-form 
          [productData]="selectedProduct"
          [isEditMode]="isEditMode"
          [isVisible]="showProductForm"
          (close)="closeProductForm()"
          (save)="saveProduct($event)">
        </app-product-form>
      }
    </div>
  `,
  styles: [`
    .vendor-products {
      padding: 2rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      gap: 2rem;
    }

    .header-content h1 {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 2rem;
      margin: 0 0 0.5rem 0;
      color: #1a1a1a;
    }

    .header-content p {
      color: #666;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .export-dropdown {
      position: relative;
    }

    .export-menu {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      min-width: 200px;
      z-index: 100;
    }

    .export-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.75rem 1rem;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .export-item:hover {
      background-color: #f5f5f5;
    }

    .export-item:first-child {
      border-radius: 8px 8px 0 0;
    }

    .export-item:last-child {
      border-radius: 0 0 8px 8px;
    }

    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .stat-content h3 {
      font-size: 1.75rem;
      margin: 0 0 0.25rem 0;
      color: #1a1a1a;
    }

    .stat-content p {
      margin: 0;
      color: #666;
      font-size: 0.875rem;
    }

    .filters-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .search-bar {
      flex: 1;
      min-width: 250px;
      position: relative;
    }

    .search-bar i {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #999;
    }

    .search-bar input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.75rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      font-size: 0.875rem;
    }

    .filters {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filters select {
      padding: 0.75rem 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      font-size: 0.875rem;
      background: white;
      cursor: pointer;
    }

    .view-controls {
      display: flex;
      gap: 0.5rem;
    }

    .view-btn {
      padding: 0.75rem 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
    }

    .view-btn.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .products-section {
      min-height: 400px;
    }

    .loading {
      text-align: center;
      padding: 4rem;
      color: #666;
    }

    .loading i {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state {
      text-align: center;
      padding: 4rem;
      background: white;
      border-radius: 12px;
    }

    .empty-state i {
      font-size: 4rem;
      color: #e0e0e0;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: #1a1a1a;
    }

    .empty-state p {
      color: #666;
      margin: 0 0 1.5rem 0;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .product-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    }

    .product-image {
      position: relative;
      padding-top: 100%;
      overflow: hidden;
      background: #f5f5f5;
    }

    .product-image img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-status {
      position: absolute;
      top: 1rem;
      right: 1rem;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      background: white;
    }

    .status-active {
      color: #10b981;
      background: #d1fae5;
    }

    .status-inactive {
      color: #6b7280;
      background: #f3f4f6;
    }

    .status-draft {
      color: #f59e0b;
      background: #fef3c7;
    }

    .status-out_of_stock {
      color: #ef4444;
      background: #fee2e2;
    }

    .product-info {
      padding: 1.25rem;
    }

    .product-info h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.125rem;
      color: #1a1a1a;
    }

    .product-description {
      color: #666;
      font-size: 0.875rem;
      margin: 0 0 1rem 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #f0f0f0;
    }

    .product-meta .price {
      font-size: 1.25rem;
      font-weight: 600;
      color: #667eea;
    }

    .product-meta .stock {
      color: #666;
      font-size: 0.875rem;
    }

    .product-stats {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
      color: #666;
    }

    .product-stats span {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .product-actions {
      padding: 1rem 1.25rem;
      background: #f9fafb;
      display: flex;
      gap: 0.5rem;
      border-top: 1px solid #f0f0f0;
    }

    .products-list {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .list-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 150px;
      gap: 1rem;
      padding: 1rem 1.5rem;
      background: #f9fafb;
      font-weight: 600;
      font-size: 0.875rem;
      color: #666;
      border-bottom: 1px solid #e0e0e0;
    }

    .list-item {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 150px;
      gap: 1rem;
      padding: 1rem 1.5rem;
      align-items: center;
      border-bottom: 1px solid #f0f0f0;
      transition: background-color 0.2s;
    }

    .list-item:hover {
      background: #f9fafb;
    }

    .col-name {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .col-name img {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      object-fit: cover;
    }

    .col-name h4 {
      margin: 0 0 0.25rem 0;
      font-size: 0.9375rem;
      color: #1a1a1a;
    }

    .col-name p {
      margin: 0;
      font-size: 0.8125rem;
      color: #666;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .col-price {
      font-weight: 600;
      color: #667eea;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .col-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #1a1a1a;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .btn-outline {
      background: white;
      color: #1a1a1a;
      border: 1px solid #e0e0e0;
    }

    .btn-outline:hover {
      background: #f9fafb;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-danger:hover {
      background: #dc2626;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.8125rem;
    }

    .btn-icon {
      padding: 0.5rem;
      width: 36px;
      height: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 2rem;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #1a1a1a;
    }

    .close-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: #f3f4f6;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
    }

    .close-btn:hover {
      background: #e5e7eb;
    }

    .modal-body {
      padding: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #1a1a1a;
      font-size: 0.875rem;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      font-size: 0.875rem;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e0e0e0;
    }

    @media (max-width: 768px) {
      .vendor-products {
        padding: 1rem;
      }

      .page-header {
        flex-direction: column;
      }

      .header-actions {
        width: 100%;
        flex-wrap: wrap;
      }

      .stats-section {
        grid-template-columns: 1fr;
      }

      .filters-section {
        flex-direction: column;
        align-items: stretch;
      }

      .search-bar {
        min-width: 100%;
      }

      .filters {
        flex-direction: column;
      }

      .filters select {
        width: 100%;
      }

      .products-grid {
        grid-template-columns: 1fr;
      }

      .list-header {
        display: none;
      }

      .list-item {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .col-name {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class VendorProductsComponent implements OnInit {
  products: VendorProduct[] = [];
  filteredProducts: VendorProduct[] = [];
  searchTerm: string = '';
  statusFilter: string = '';
  categoryFilter: string = '';
  sortBy: string = 'name';
  viewMode: 'grid' | 'list' = 'grid';
  
  get isGridView(): boolean {
    return this.viewMode === 'grid';
  }
  
  get isListView(): boolean {
    return this.viewMode === 'list';
  }
  showExportMenu = false;
  loading = false;

  constructor(
    private router: Router,
    private vendorService: VendorService,
    private toastService: ToastService
  ) {}
  
  // Modal de formulaire
  showProductForm: boolean = false;
  isEditMode: boolean = false;
  selectedProduct?: VendorProduct;

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.vendorService.getProducts().subscribe({
      next: (response) => {
        // Normaliser les produits pour s'assurer que tous les champs sont correctement formatés
        this.products = (response.products || []).map((product: any) => {
          // Normaliser les images en vérifiant plusieurs champs possibles
          let normalizedImages = this.normalizeImages(product.images);
          
          // Si pas d'images normalisées, essayer d'autres champs
          if (normalizedImages.length === 0) {
            if (product.primary_image) {
              normalizedImages = [product.primary_image];
            } else if (product.image_url) {
              normalizedImages = [product.image_url];
            } else if (product.image) {
              normalizedImages = Array.isArray(product.image) ? product.image : [product.image];
            }
          }
          
          return {
            ...product,
            images: normalizedImages,
            stock: product.stock || product.stock_quantity || 0,
            price: product.price || 0,
            description: product.description || '',
            category: product.category || product.category_id || '',
            status: product.status || 'draft',
            createdAt: product.createdAt || product.created_at || new Date().toISOString(),
            updatedAt: product.updatedAt || product.updated_at || new Date().toISOString()
          };
        });
        this.filteredProducts = [...this.products];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des produits:', error);
        this.loading = false;
        const errorMessage = error.error?.message || 'Erreur lors du chargement des produits. Veuillez réessayer.';
        this.toastService.error(errorMessage);
        this.products = [];
        this.filteredProducts = [];
      }
    });
  }

  /**
   * Normalise le champ images pour s'assurer qu'il est toujours un tableau
   */
  private normalizeImages(images: any): string[] {
    if (!images) return [];
    
    // Si c'est déjà un tableau
    if (Array.isArray(images)) {
      return images.map((img: any) => {
        if (typeof img === 'string') return img;
        if (img && typeof img === 'object') {
          // Extraire l'URL depuis différents formats d'objets
          return img.url || img.path || img.image_url || img.src || img.primary_image || '';
        }
        return '';
      }).filter((url: string) => url && url.trim() !== '');
    }
    
    // Si c'est une chaîne JSON
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) {
          return parsed.map((img: any) => {
            if (typeof img === 'string') return img;
            if (img && typeof img === 'object') {
              return img.url || img.path || img.image_url || img.src || '';
            }
            return '';
          }).filter((url: string) => url && url.trim() !== '');
        }
        return [images];
      } catch {
        // Si ce n'est pas du JSON, c'est probablement une URL simple
        return [images];
      }
    }
    
    // Si c'est un objet unique (pas un tableau)
    if (typeof images === 'object') {
      const url = images.url || images.path || images.image_url || images.src || images.primary_image || '';
      return url ? [url] : [];
    }
    
    return [];
  }

  filterProducts() {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !this.searchTerm || 
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || product.status === this.statusFilter;
      const matchesCategory = !this.categoryFilter || product.category === this.categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
    
    this.sortProducts();
  }

  sortProducts() {
    this.filteredProducts.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'created_at':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'draft': 'Brouillon',
      'active': 'Actif',
      'inactive': 'Inactif',
      'out_of_stock': 'Rupture'
    };
    return labels[status] || status;
  }

  get totalProducts(): number {
    return this.products.length;
  }

  get totalViews(): number {
    return this.products.reduce((sum, product) => sum + ((product as any).views || 0), 0);
  }

  get totalSales(): number {
    return this.products.reduce((sum, product) => sum + ((product as any).sales || 0), 0);
  }

  get averageRating(): number {
    // Simulation - à remplacer par des vraies données
    return 4.2;
  }

  openAddProductModal() {
    this.isEditMode = false;
    this.selectedProduct = undefined;
    this.showProductForm = true;
  }

  editProduct(product: VendorProduct) {
    this.isEditMode = true;
    this.selectedProduct = { ...product };
    this.showProductForm = true;
  }

  duplicateProduct(product: VendorProduct) {
    this.isEditMode = false;
    this.selectedProduct = {
      ...product,
      id: '',
      name: `${product.name} (Copie)`,
      status: 'draft' as const
    };
    this.showProductForm = true;
  }

  deleteProduct(product: VendorProduct) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`)) {
      this.vendorService.deleteProduct(product.id).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== product.id);
          this.filterProducts();
          this.toastService.success(`Produit "${product.name}" supprimé avec succès !`);
        },
        error: (error: any) => {
          console.error('Erreur lors de la suppression:', error);
          const errorMessage = error.error?.message || 'Erreur lors de la suppression du produit. Veuillez réessayer.';
          this.toastService.error(errorMessage);
        }
      });
    }
  }

  closeProductForm() {
    this.showProductForm = false;
    this.isEditMode = false;
    this.selectedProduct = undefined;
  }

  saveProduct(productData: any) {
    if (this.isEditMode && this.selectedProduct) {
      // Mise à jour du produit existant
      this.vendorService.updateProduct(this.selectedProduct.id, productData).subscribe({
        next: (updatedProduct) => {
          const index = this.products.findIndex(p => p.id === this.selectedProduct!.id);
          if (index !== -1) {
          // Normaliser le produit mis à jour
          const updatedProductAny = updatedProduct as any;
          
          // Normaliser les images
          let normalizedImages = this.normalizeImages(updatedProduct.images);
          if (normalizedImages.length === 0) {
            if (updatedProductAny.primary_image) {
              normalizedImages = [updatedProductAny.primary_image];
            } else if (updatedProductAny.image_url) {
              normalizedImages = [updatedProductAny.image_url];
            }
          }
          
          this.products[index] = {
            ...updatedProduct,
            images: normalizedImages,
            stock: updatedProduct.stock || updatedProductAny.stock_quantity || 0,
            price: updatedProduct.price || 0,
            description: updatedProduct.description || '',
            category: updatedProduct.category || updatedProductAny.category_id || '',
            status: updatedProduct.status || 'draft',
            createdAt: updatedProduct.createdAt || updatedProductAny.created_at || this.products[index].createdAt,
            updatedAt: updatedProduct.updatedAt || updatedProductAny.updated_at || new Date().toISOString()
          };
          }
          this.filterProducts();
          this.closeProductForm();
          this.toastService.success('Produit mis à jour avec succès !');
        },
        error: (error: any) => {
          console.error('Erreur lors de la mise à jour:', error);
          const errorMessage = error.error?.message || 'Erreur lors de la mise à jour du produit. Veuillez réessayer.';
          this.toastService.error(errorMessage);
        }
      });
    } else {
      // Création d'un nouveau produit
      this.vendorService.createProduct(productData).subscribe({
        next: (newProduct) => {
          // Normaliser le nouveau produit
          const productAny = newProduct as any;
          
          // Normaliser les images
          let normalizedImages = this.normalizeImages(newProduct.images);
          if (normalizedImages.length === 0) {
            if (productAny.primary_image) {
              normalizedImages = [productAny.primary_image];
            } else if (productAny.image_url) {
              normalizedImages = [productAny.image_url];
            }
          }
          
          const normalizedProduct: VendorProduct = {
            ...newProduct,
            images: normalizedImages,
            stock: newProduct.stock || productAny.stock_quantity || 0,
            price: newProduct.price || 0,
            description: newProduct.description || '',
            category: newProduct.category || productAny.category_id || '',
            status: newProduct.status || 'draft',
            createdAt: newProduct.createdAt || productAny.created_at || new Date().toISOString(),
            updatedAt: newProduct.updatedAt || productAny.updated_at || new Date().toISOString()
          };
          this.products.unshift(normalizedProduct);
          this.filterProducts();
          this.closeProductForm();
          this.toastService.success('Produit créé avec succès !');
        },
        error: (error: any) => {
          console.error('Erreur lors de la création:', error);
          const errorMessage = error.error?.message || 'Erreur lors de la création du produit. Veuillez réessayer.';
          this.toastService.error(errorMessage);
        }
      });
    }
  }

  manageCategories(): void {
    console.log('🏷️ Navigation vers la gestion des catégories...');
    this.router.navigate(['/vendor/products/categories']);
  }

  toggleExportMenu(): void {
    this.showExportMenu = !this.showExportMenu;
  }

  exportProducts(format: string): void {
    console.log(`📊 Export des produits en format ${format.toUpperCase()}...`);
    this.showExportMenu = false;
    
    if (this.products.length === 0) {
      this.toastService.warning('Aucun produit à exporter');
      return;
    }

    try {
      switch (format.toLowerCase()) {
        case 'csv':
          this.exportToCSV();
          break;
        case 'excel':
          this.exportToExcel();
          break;
        case 'json':
          this.exportToJSON();
          break;
        default:
          this.toastService.error('Format d\'export non supporté');
      }
      this.toastService.success(`Export ${format.toUpperCase()} généré avec succès !`);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      this.toastService.error('Erreur lors de l\'export des produits');
    }
  }

  private exportToCSV(): void {
    const headers = ['Nom', 'SKU', 'Description', 'Prix', 'Stock', 'Statut', 'Catégorie', 'Vues', 'Ventes', 'Note'];
    const rows = this.products.map(product => [
      product.name || '',
      (product as any).sku || '',
      (product.description || '').replace(/"/g, '""'), // Échapper les guillemets
      product.price?.toString() || '0',
      product.stock?.toString() || '0',
      this.getStatusLabel(product.status),
      product.category || '',
      this.getProductViews(product).toString(),
      this.getProductSales(product).toString(),
      this.getProductRating(product).toString()
    ]);

    // Créer le contenu CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Ajouter BOM pour Excel (UTF-8)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadFile(blob, `produits_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  }

  private exportToExcel(): void {
    // Préparer les données pour Excel
    const headers = ['Nom', 'SKU', 'Description', 'Prix', 'Stock', 'Statut', 'Catégorie', 'Vues', 'Ventes', 'Note'];
    const data = this.products.map(product => [
      product.name || '',
      (product as any).sku || '',
      product.description || '',
      product.price || 0,
      product.stock || 0,
      this.getStatusLabel(product.status),
      product.category || '',
      this.getProductViews(product),
      this.getProductSales(product),
      this.getProductRating(product)
    ]);

    // Créer un workbook
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produits');

    // Générer le fichier Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    this.downloadFile(blob, `produits_${new Date().toISOString().split('T')[0]}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }

  private exportToJSON(): void {
    const data = this.products.map(product => ({
      id: product.id,
      name: product.name,
      sku: (product as any).sku || '',
      description: product.description,
      price: product.price,
      stock: product.stock,
      status: product.status,
      statusLabel: this.getStatusLabel(product.status),
      category: product.category,
      images: product.images,
      views: this.getProductViews(product),
      sales: this.getProductSales(product),
      rating: this.getProductRating(product),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    this.downloadFile(blob, `produits_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  }

  private downloadFile(blob: Blob, filename: string, contentType: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Méthodes pour accéder aux propriétés des produits
  getProductViews(product: any): number {
    return (product as any).views || 0;
  }

  getProductSales(product: any): number {
    return (product as any).sales || 0;
  }

  getProductRating(product: any): number {
    return (product as any).averageRating || 0;
  }
}