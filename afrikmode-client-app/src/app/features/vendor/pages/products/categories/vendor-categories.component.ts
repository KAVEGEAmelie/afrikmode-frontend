import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  level: number;
  productCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  subcategories?: Category[];
}

@Component({
  selector: 'app-vendor-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="vendor-categories">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>
            <i class="fas fa-tags"></i>
            Gestion des Catégories
          </h1>
          <p>Organisez vos produits en catégories et sous-catégories</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="goBack()">
            <i class="fas fa-arrow-left"></i>
            Retour aux produits
          </button>
          <button class="btn btn-primary" (click)="openAddCategoryModal()">
            <i class="fas fa-plus"></i>
            Ajouter une catégorie
          </button>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-tags"></i>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ totalCategories }}</span>
            <span class="stat-label">Catégories</span>
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
            <span class="stat-number">{{ totalProducts }}</span>
            <span class="stat-label">Produits</span>
          </div>
        </div>
      </div>

      <!-- Filtres et recherche -->
      <div class="filters-section">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Rechercher une catégorie..." 
            [(ngModel)]="searchTerm"
            (input)="filterCategories()">
        </div>
        <div class="filter-actions">
          <button class="btn btn-outline" (click)="toggleViewMode()">
            <i class="fas" [class.fa-list]="viewMode === 'list'" [class.fa-th]="viewMode === 'grid'"></i>
            {{ viewMode === 'list' ? 'Vue grille' : 'Vue liste' }}
          </button>
        </div>
      </div>

      <!-- Liste des catégories -->
      <div class="categories-section">
        <div class="section-header">
          <h2>Mes Catégories ({{ filteredCategories.length }})</h2>
          <div class="section-actions">
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

        <div class="categories-list" [class.list-view]="viewMode === 'list'">
          @for (category of filteredCategories; track category.id) {
            <div class="category-item" [class.expanded]="expandedCategories.has(category.id)">
              <div class="category-header" (click)="toggleCategory(category.id)">
                <div class="category-info">
                  <div class="category-icon">
                    <i class="fas fa-folder" [class.fa-folder-open]="expandedCategories.has(category.id)"></i>
                  </div>
                  <div class="category-details">
                    <h3 class="category-name">{{ category.name }}</h3>
                    <p class="category-description">{{ category.description }}</p>
                    <div class="category-meta">
                      <span class="product-count">{{ category.productCount }} produit(s)</span>
                      <span class="category-level">Niveau {{ category.level }}</span>
                      <span class="category-status" [class.active]="category.isActive">
                        {{ category.isActive ? 'Actif' : 'Inactif' }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="category-actions">
                  <button class="action-btn" (click)="editCategory(category, $event)" title="Modifier">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn" (click)="addSubcategory(category, $event)" title="Ajouter sous-catégorie">
                    <i class="fas fa-plus"></i>
                  </button>
                  <button class="action-btn danger" (click)="deleteCategory(category, $event)" title="Supprimer">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>

              <!-- Sous-catégories -->
              @if (expandedCategories.has(category.id) && category.subcategories && category.subcategories.length > 0) {
                <div class="subcategories">
                  @for (subcategory of category.subcategories; track subcategory.id) {
                    <div class="subcategory-item">
                      <div class="subcategory-info">
                        <i class="fas fa-folder"></i>
                        <span class="subcategory-name">{{ subcategory.name }}</span>
                        <span class="subcategory-count">({{ subcategory.productCount }} produit(s))</span>
                      </div>
                      <div class="subcategory-actions">
                        <button class="action-btn" (click)="editCategory(subcategory, $event)" title="Modifier">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn danger" (click)="deleteCategory(subcategory, $event)" title="Supprimer">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- État vide -->
        @if (filteredCategories.length === 0) {
          <div class="empty-state">
            <i class="fas fa-tags"></i>
            <h3>Aucune catégorie trouvée</h3>
            <p>Commencez par créer votre première catégorie</p>
            <button class="btn btn-primary" (click)="openAddCategoryModal()">
              <i class="fas fa-plus"></i>
              Ajouter une catégorie
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .vendor-categories {
      padding: 24px;
      max-width: 1200px;
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
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #8B2E2E 0%, #D9744F 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
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

    .filters-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      flex: 1;
      max-width: 400px;
    }

    .search-box i {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: #9CA3AF;
    }

    .search-box input {
      width: 100%;
      padding: 12px 16px 12px 48px;
      border: 1px solid #D1D5DB;
      border-radius: 8px;
      font-size: 1rem;
    }

    .search-box input:focus {
      outline: none;
      border-color: #8B2E2E;
      box-shadow: 0 0 0 3px rgba(139, 46, 46, 0.1);
    }

    .categories-section {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid #E5E7EB;
    }

    .section-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #2C3E50;
    }

    .section-actions {
      display: flex;
      gap: 8px;
    }

    .categories-list {
      padding: 24px;
    }

    .category-item {
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      margin-bottom: 16px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .category-item:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
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

    .category-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: #F3F4F6;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6B7280;
    }

    .category-details {
      flex: 1;
    }

    .category-name {
      margin: 0 0 4px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #2C3E50;
    }

    .category-description {
      margin: 0 0 8px 0;
      color: #6B7280;
      font-size: 0.9rem;
    }

    .category-meta {
      display: flex;
      gap: 16px;
      font-size: 0.8rem;
    }

    .product-count {
      color: #8B2E2E;
      font-weight: 600;
    }

    .category-level {
      color: #6B7280;
    }

    .category-status {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .category-status.active {
      background: #D1FAE5;
      color: #065F46;
    }

    .category-status:not(.active) {
      background: #FEE2E2;
      color: #991B1B;
    }

    .category-actions {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;
      background: #F3F4F6;
      color: #6B7280;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      background: #E5E7EB;
      color: #374151;
    }

    .action-btn.danger:hover {
      background: #FEE2E2;
      color: #DC2626;
    }

    .subcategories {
      background: #F9FAFB;
      padding: 16px 20px;
      border-top: 1px solid #E5E7EB;
    }

    .subcategory-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #E5E7EB;
    }

    .subcategory-item:last-child {
      border-bottom: none;
    }

    .subcategory-info {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #6B7280;
    }

    .subcategory-name {
      font-weight: 500;
      color: #374151;
    }

    .subcategory-count {
      font-size: 0.8rem;
    }

    .subcategory-actions {
      display: flex;
      gap: 4px;
    }

    .empty-state {
      text-align: center;
      padding: 64px 24px;
      color: #6B7280;
    }

    .empty-state i {
      font-size: 4rem;
      margin-bottom: 16px;
      color: #D1D5DB;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      font-size: 1.5rem;
      color: #374151;
    }

    .empty-state p {
      margin: 0 0 24px 0;
      font-size: 1rem;
    }

    @media (max-width: 768px) {
      .vendor-categories {
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

      .filters-section {
        flex-direction: column;
        align-items: stretch;
      }

      .search-box {
        max-width: none;
      }

      .section-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .category-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .category-info {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }

      .category-actions {
        justify-content: center;
      }
    }
  `]
})
export class VendorCategoriesComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  searchTerm = '';
  viewMode: 'grid' | 'list' = 'list';
  expandedCategories = new Set<string>();
  loading = false;

  // Modal de catégorie
  showCategoryModal = false;
  isEditMode = false;
  categoryForm: FormGroup;
  selectedCategory: Category | null = null;
  selectedParentCategory: Category | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      parentId: [''],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    // Simulation de données
    setTimeout(() => {
      this.categories = [
        {
          id: '1',
          name: 'Vêtements Femmes',
          description: 'Collection complète de vêtements pour femmes',
          level: 1,
          productCount: 15,
          isActive: true,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-10-20'),
          subcategories: [
            {
              id: '1-1',
              name: 'Robes',
              description: 'Robes élégantes et modernes',
              parentId: '1',
              level: 2,
              productCount: 8,
              isActive: true,
              createdAt: new Date('2024-01-20'),
              updatedAt: new Date('2024-10-20')
            },
            {
              id: '1-2',
              name: 'Tops',
              description: 'Tops et blouses tendance',
              parentId: '1',
              level: 2,
              productCount: 7,
              isActive: true,
              createdAt: new Date('2024-01-25'),
              updatedAt: new Date('2024-10-20')
            }
          ]
        },
        {
          id: '2',
          name: 'Vêtements Hommes',
          description: 'Collection masculine moderne',
          level: 1,
          productCount: 12,
          isActive: true,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-10-20'),
          subcategories: [
            {
              id: '2-1',
              name: 'Chemises',
              description: 'Chemises de qualité',
              parentId: '2',
              level: 2,
              productCount: 6,
              isActive: true,
              createdAt: new Date('2024-02-05'),
              updatedAt: new Date('2024-10-20')
            },
            {
              id: '2-2',
              name: 'Pantalons',
              description: 'Pantalons confortables',
              parentId: '2',
              level: 2,
              productCount: 6,
              isActive: true,
              createdAt: new Date('2024-02-10'),
              updatedAt: new Date('2024-10-20')
            }
          ]
        },
        {
          id: '3',
          name: 'Accessoires',
          description: 'Accessoires de mode',
          level: 1,
          productCount: 5,
          isActive: true,
          createdAt: new Date('2024-03-01'),
          updatedAt: new Date('2024-10-20')
        }
      ];
      this.filteredCategories = [...this.categories];
      this.loading = false;
    }, 1000);
  }

  get totalCategories(): number {
    return this.categories.length;
  }

  get totalSubcategories(): number {
    return this.categories.reduce((total, cat) => total + (cat.subcategories?.length || 0), 0);
  }

  get totalProducts(): number {
    return this.categories.reduce((total, cat) => total + cat.productCount, 0);
  }

  filterCategories() {
    if (!this.searchTerm.trim()) {
      this.filteredCategories = [...this.categories];
      return;
    }

    this.filteredCategories = this.categories.filter(category =>
      category.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  toggleCategory(categoryId: string) {
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
    }
  }

  expandAll() {
    this.categories.forEach(category => {
      this.expandedCategories.add(category.id);
    });
  }

  collapseAll() {
    this.expandedCategories.clear();
  }

  openAddCategoryModal() {
    console.log('Ouverture du modal d\'ajout de catégorie');
    const dialogRef = this.dialog.open(CategoryFormDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      disableClose: false,
      hasBackdrop: true,
      backdropClass: 'category-dialog-backdrop',
      panelClass: 'category-dialog-panel',
      autoFocus: true,
      restoreFocus: true,
      data: {
        category: null,
        parentCategory: null,
        categories: this.categories
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addCategory(result);
      }
    });
  }

  addCategory(categoryData: any) {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: categoryData.name,
      description: categoryData.description,
      parentId: categoryData.parentId,
      level: categoryData.parentId ? 2 : 1,
      productCount: 0,
      isActive: categoryData.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
      subcategories: []
    };

    if (categoryData.parentId) {
      // Ajouter comme sous-catégorie
      const parentCategory = this.categories.find(c => c.id === categoryData.parentId);
      if (parentCategory) {
        if (!parentCategory.subcategories) {
          parentCategory.subcategories = [];
        }
        parentCategory.subcategories.push(newCategory);
      }
    } else {
      // Ajouter comme catégorie principale
      this.categories.push(newCategory);
    }

    this.filterCategories();
    this.snackBar.open('Catégorie ajoutée avec succès', 'Fermer', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  editCategory(category: Category, event: Event) {
    event.stopPropagation();
    console.log('Modification de la catégorie:', category);
    
    const dialogRef = this.dialog.open(CategoryFormDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      disableClose: false,
      hasBackdrop: true,
      backdropClass: 'category-dialog-backdrop',
      panelClass: 'category-dialog-panel',
      autoFocus: true,
      restoreFocus: true,
      data: {
        category: category,
        parentCategory: null,
        categories: this.categories
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateCategory(category, result);
      }
    });
  }

  updateCategory(category: Category, categoryData: any) {
    category.name = categoryData.name;
    category.description = categoryData.description;
    category.isActive = categoryData.isActive;
    category.updatedAt = new Date();

    this.filterCategories();
    this.snackBar.open('Catégorie modifiée avec succès', 'Fermer', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  addSubcategory(category: Category, event: Event) {
    event.stopPropagation();
    console.log('Ajout de sous-catégorie pour:', category);
    
    const dialogRef = this.dialog.open(CategoryFormDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      disableClose: false,
      hasBackdrop: true,
      backdropClass: 'category-dialog-backdrop',
      panelClass: 'category-dialog-panel',
      autoFocus: true,
      restoreFocus: true,
      data: {
        category: null,
        parentCategory: category,
        categories: this.categories
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addCategory(result);
      }
    });
  }

  deleteCategory(category: Category, event: Event) {
    event.stopPropagation();
    if (confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`)) {
      console.log('Suppression de la catégorie:', category);
      
      if (category.parentId) {
        // Supprimer une sous-catégorie
        const parentCategory = this.categories.find(c => c.id === category.parentId);
        if (parentCategory && parentCategory.subcategories) {
          const index = parentCategory.subcategories.findIndex(sc => sc.id === category.id);
          if (index > -1) {
            parentCategory.subcategories.splice(index, 1);
          }
        }
      } else {
        // Supprimer une catégorie principale
        const index = this.categories.findIndex(c => c.id === category.id);
        if (index > -1) {
          this.categories.splice(index, 1);
        }
      }

      this.filterCategories();
      this.snackBar.open('Catégorie supprimée avec succès', 'Fermer', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }
  }

  goBack() {
    this.router.navigate(['/vendor/products']);
  }
}

// Composant Dialog pour le formulaire de catégorie
@Component({
  selector: 'app-category-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule
  ],
  template: `
    <div class="category-dialog" (click)="$event.stopPropagation()">
      <h2 mat-dialog-title>
        <i class="fas fa-tag"></i>
        {{ data.category ? 'Modifier la catégorie' : (data.parentCategory ? 'Ajouter une sous-catégorie' : 'Ajouter une catégorie') }}
      </h2>
      
      <mat-dialog-content (click)="$event.stopPropagation()">
        <form [formGroup]="categoryForm" class="category-form" (click)="$event.stopPropagation()">
          @if (data.parentCategory) {
            <div class="parent-category-info">
              <i class="fas fa-folder"></i>
              <span>Catégorie parente: <strong>{{ data.parentCategory.name }}</strong></span>
            </div>
          }

          @if (!data.category && !data.parentCategory) {
            <mat-form-field appearance="outline" (click)="$event.stopPropagation()">
              <mat-label>Catégorie parente (optionnel)</mat-label>
              <mat-select formControlName="parentId">
                <mat-option [value]="null">Aucune (catégorie principale)</mat-option>
                @for (category of data.categories; track category.id) {
                  <mat-option [value]="category.id">{{ category.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          }

          <mat-form-field appearance="outline" (click)="$event.stopPropagation()">
            <mat-label>Nom de la catégorie</mat-label>
            <input matInput formControlName="name" placeholder="Ex: Robes, Chemises, Accessoires...">
            <mat-icon matPrefix>label</mat-icon>
            @if (categoryForm.get('name')?.hasError('required') && categoryForm.get('name')?.touched) {
              <mat-error>Le nom est obligatoire</mat-error>
            }
            @if (categoryForm.get('name')?.hasError('minlength')) {
              <mat-error>Le nom doit contenir au moins 2 caractères</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" (click)="$event.stopPropagation()">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3" 
              placeholder="Description de la catégorie..."></textarea>
            <mat-icon matPrefix>description</mat-icon>
          </mat-form-field>

          <div class="toggle-field" (click)="$event.stopPropagation()">
            <mat-slide-toggle formControlName="isActive" color="primary">
              Catégorie active
            </mat-slide-toggle>
            <span class="toggle-help">Les catégories actives sont visibles sur le site</span>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()" type="button">
          <i class="fas fa-times"></i>
          Annuler
        </button>
        <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!categoryForm.valid" type="button">
          <i class="fas fa-check"></i>
          {{ data.category ? 'Modifier' : 'Ajouter' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .category-dialog {
      min-width: 500px;
      background: white;
      pointer-events: auto;
    }

    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #2C3E50;
      margin: 0;
      padding: 24px 24px 16px;
      border-bottom: 1px solid #E5E7EB;
      background: linear-gradient(135deg, #8B2E2E10 0%, #D9744F10 100%);
    }

    h2 i {
      color: #8B2E2E;
    }

    mat-dialog-content {
      padding: 24px;
      max-height: 70vh;
      overflow-y: auto;
      pointer-events: auto;
    }

    .category-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      pointer-events: auto;
    }

    .parent-category-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #F3F4F6;
      border-radius: 8px;
      color: #6B7280;
      margin-bottom: 8px;
      border-left: 3px solid #8B2E2E;
    }

    .parent-category-info i {
      color: #8B2E2E;
      font-size: 1.1rem;
    }

    .parent-category-info strong {
      color: #2C3E50;
    }

    mat-form-field {
      width: 100%;
    }

    .toggle-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px 0;
    }

    .toggle-help {
      font-size: 0.85rem;
      color: #6B7280;
      margin-left: 4px;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #E5E7EB;
      gap: 12px;
      background: #F9FAFB;
    }

    mat-dialog-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    mat-dialog-actions button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    mat-dialog-actions button[mat-raised-button] {
      background: linear-gradient(135deg, #8B2E2E 0%, #D9744F 100%);
    }

    mat-dialog-actions button[mat-raised-button]:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    ::ng-deep .mat-mdc-dialog-container .mdc-dialog__surface {
      border-radius: 16px;
      overflow: hidden;
    }

    /* Assurer que les champs de formulaire sont cliquables */
    ::ng-deep .mat-mdc-form-field {
      pointer-events: auto !important;
    }

    ::ng-deep .mat-mdc-text-field-wrapper {
      pointer-events: auto !important;
    }

    ::ng-deep .mat-mdc-form-field input,
    ::ng-deep .mat-mdc-form-field textarea,
    ::ng-deep .mat-mdc-form-field select {
      pointer-events: auto !important;
    }

    ::ng-deep .mat-mdc-select {
      pointer-events: auto !important;
    }

    ::ng-deep .mat-mdc-slide-toggle {
      pointer-events: auto !important;
    }

    @media (max-width: 600px) {
      .category-dialog {
        min-width: auto;
        width: 100%;
      }
    }
  `]
})
export class CategoryFormDialogComponent implements OnInit {
  categoryForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CategoryFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      category: Category | null;
      parentCategory: Category | null;
      categories: Category[];
    }
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      parentId: [null],
      isActive: [true]
    });
  }

  ngOnInit() {
    if (this.data.category) {
      // Mode édition
      this.categoryForm.patchValue({
        name: this.data.category.name,
        description: this.data.category.description,
        isActive: this.data.category.isActive
      });
    }

    if (this.data.parentCategory) {
      // Ajout de sous-catégorie
      this.categoryForm.patchValue({
        parentId: this.data.parentCategory.id
      });
    }
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      this.dialogRef.close(this.categoryForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
