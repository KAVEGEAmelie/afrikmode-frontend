import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, CategoryTree } from '../../core/services/category.service';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  icon?: string;
  image?: string;
  display_order: number;
  is_active: boolean;
  product_count: number;
  subcategories?: Category[];
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="categories-page">
      <div class="page-header">
        <div class="header-content">
          <h1>Gestion des Catégories</h1>
          <p class="subtitle">Organisez la structure des catégories de produits</p>
        </div>
        <button class="btn-primary" (click)="openCreateModal()">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nouvelle catégorie
        </button>
      </div>

      <div class="categories-container">
        <div class="categories-tree">
          <div *ngFor="let category of rootCategories; let i = index" 
               class="category-item"
               draggable="true"
               (dragstart)="onDragStart($event, category)"
               (dragover)="onDragOver($event)"
               (drop)="onDrop($event, i)">
            <div class="category-header" [class.expanded]="category.id === expandedCategoryId">
              <div class="category-info">
                <button class="expand-btn" *ngIf="category.subcategories && category.subcategories.length > 0"
                        (click)="toggleCategory(category.id)">
                  <svg *ngIf="category.id !== expandedCategoryId" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                  <svg *ngIf="category.id === expandedCategoryId" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                <div class="drag-handle">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"/>
                  </svg>
                </div>
                <div class="category-icon" *ngIf="category.icon">{{ category.icon }}</div>
                <div class="category-details">
                  <h3>{{ category.name }}</h3>
                  <span class="product-count">{{ getProductCount(category) }} produits</span>
                </div>
              </div>
              <div class="category-actions">
                <label class="toggle-switch">
                  <input type="checkbox" [ngModel]="getIsActive(category)" (ngModelChange)="setIsActive(category, $event); toggleCategoryStatus(category)">
                  <span class="slider"></span>
                </label>
                <button class="btn-icon" (click)="openEditModal(category)">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button class="btn-icon btn-add" (click)="openAddSubcategoryModal(category)" title="Ajouter sous-catégorie">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                </button>
                <button class="btn-icon btn-delete" (click)="deleteCategory(category)">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Sous-catégories -->
            <div *ngIf="category.id === expandedCategoryId && category.subcategories" class="subcategories">
              <div *ngFor="let subcat of category.subcategories; let j = index"
                   class="category-item subcategory"
                   draggable="true"
                   (dragstart)="onDragStart($event, subcat)"
                   (dragover)="onDragOver($event)"
                   (drop)="onDropSubcategory($event, category, j)">
                <div class="category-header">
                  <div class="category-info">
                    <div class="drag-handle">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"/>
                      </svg>
                    </div>
                    <div class="category-details">
                      <h4>{{ subcat.name }}</h4>
                      <span class="product-count">{{ getProductCount(subcat) }} produits</span>
                    </div>
                  </div>
                  <div class="category-actions">
                    <label class="toggle-switch">
                      <input type="checkbox" [ngModel]="getIsActive(subcat)" (ngModelChange)="setIsActive(subcat, $event); toggleCategoryStatus(subcat)">
                      <span class="slider"></span>
                    </label>
                    <button class="btn-icon" (click)="openEditModal(subcat)">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button class="btn-icon btn-delete" (click)="deleteCategory(subcat)">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Créer/Éditer -->
      <div *ngIf="showCategoryModal" class="modal-overlay" (click)="closeCategoryModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingCategory ? 'Modifier' : 'Nouvelle' }} catégorie</h3>
            <button class="btn-close" (click)="closeCategoryModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nom <span class="required">*</span></label>
              <input type="text" [(ngModel)]="categoryForm.name" class="form-input" placeholder="Ex: Vêtements">
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea [(ngModel)]="categoryForm.description" class="form-textarea" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>Catégorie parent</label>
              <select [(ngModel)]="categoryForm.parent_id" class="form-select">
                <option [value]="null">Catégorie racine</option>
                <option *ngFor="let cat of rootCategories" [value]="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Icône (emoji)</label>
              <input type="text" [(ngModel)]="categoryForm.icon" class="form-input" placeholder="👕">
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="categoryForm.is_active">
                <span>Catégorie active</span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-cancel" (click)="closeCategoryModal()">Annuler</button>
            <button class="btn btn-primary" (click)="saveCategory()">{{ editingCategory ? 'Modifier' : 'Créer' }}</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./admin-categories.component.scss']
})
export class AdminCategoriesComponent implements OnInit {
  categories: CategoryTree[] = [];
  rootCategories: CategoryTree[] = [];
  expandedCategoryId: string | null = null;
  
  showCategoryModal = false;
  editingCategory: CategoryTree | null = null;
  categoryForm: any = {
    name: '',
    description: '',
    parent_id: undefined,
    parentId: undefined,
    icon: '',
    is_active: true,
    isActive: true
  };

  draggedCategory: CategoryTree | null = null;
  loading = false;

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.rootCategories = categories.filter(c => !c.parentId);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des catégories:', error);
        this.showNotification('Erreur lors du chargement des catégories', 'error');
        this.loading = false;
        // Fallback sur données de démonstration en cas d'erreur
        this.loadDemoCategories();
      }
    });
  }

  loadDemoCategories() {
    // Données de démonstration (fallback) - utiliser any pour éviter les erreurs de type
    this.categories = [
      {
        id: '1',
        name: 'Vêtements',
        slug: 'vetements',
        icon: '👕',
        order: 1,
        display_order: 1,
        is_active: true,
        isActive: true,
        product_count: 458,
        productsCount: 458,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2025-10-15'),
        created_at: '2024-01-01',
        updated_at: '2025-10-15',
        subcategories: [
          { id: '1-1', name: 'Robes', slug: 'robes', parentId: '1', parent_id: '1', order: 1, display_order: 1, is_active: true, isActive: true, product_count: 120, productsCount: 120, createdAt: new Date('2024-01-01'), updatedAt: new Date('2025-10-15'), created_at: '2024-01-01', updated_at: '2025-10-15' },
          { id: '1-2', name: 'Chemises', slug: 'chemises', parentId: '1', parent_id: '1', order: 2, display_order: 2, is_active: true, isActive: true, product_count: 89, productsCount: 89, createdAt: new Date('2024-01-01'), updatedAt: new Date('2025-10-15'), created_at: '2024-01-01', updated_at: '2025-10-15' },
          { id: '1-3', name: 'Pantalons', slug: 'pantalons', parentId: '1', parent_id: '1', order: 3, display_order: 3, is_active: true, isActive: true, product_count: 156, productsCount: 156, createdAt: new Date('2024-01-01'), updatedAt: new Date('2025-10-15'), created_at: '2024-01-01', updated_at: '2025-10-15' }
        ]
      },
      {
        id: '2',
        name: 'Accessoires',
        slug: 'accessoires',
        icon: '👜',
        order: 2,
        display_order: 2,
        is_active: true,
        isActive: true,
        product_count: 234,
        productsCount: 234,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2025-10-15'),
        created_at: '2024-01-01',
        updated_at: '2025-10-15',
        subcategories: [
          { id: '2-1', name: 'Sacs', slug: 'sacs', parentId: '2', parent_id: '2', order: 1, display_order: 1, is_active: true, isActive: true, product_count: 78, productsCount: 78, createdAt: new Date('2024-01-01'), updatedAt: new Date('2025-10-15'), created_at: '2024-01-01', updated_at: '2025-10-15' },
          { id: '2-2', name: 'Bijoux', slug: 'bijoux', parentId: '2', parent_id: '2', order: 2, display_order: 2, is_active: true, isActive: true, product_count: 156, productsCount: 156, createdAt: new Date('2024-01-01'), updatedAt: new Date('2025-10-15'), created_at: '2024-01-01', updated_at: '2025-10-15' }
        ]
      },
      {
        id: '3',
        name: 'Chaussures',
        slug: 'chaussures',
        icon: '👞',
        order: 3,
        display_order: 3,
        is_active: true,
        isActive: true,
        product_count: 167,
        productsCount: 167,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2025-10-15'),
        created_at: '2024-01-01',
        updated_at: '2025-10-15'
      }
    ] as any;
    this.rootCategories = this.categories;
  }

  toggleCategory(categoryId: string) {
    this.expandedCategoryId = this.expandedCategoryId === categoryId ? null : categoryId;
  }

  toggleCategoryStatus(category: CategoryTree) {
    // Mise à jour du statut
    const isActive = category.isActive !== false && (category as any).is_active !== false;
    const statusText = isActive ? 'activée' : 'désactivée';
    console.log(`Catégorie "${category.name}" ${statusText}`);
    
    // TODO: Appel API pour sauvegarder le changement
    // this.categoryService.toggleCategoryStatus(category.id).subscribe();
    
    // Notification visuelle
    this.showNotification(`Catégorie ${statusText} avec succès`, 'success');
  }

  openCreateModal() {
    this.editingCategory = null;
    this.categoryForm = { 
      name: '', 
      description: '', 
      parent_id: undefined, 
      icon: '', 
      is_active: true,
      display_order: this.rootCategories.length + 1
    };
    this.showCategoryModal = true;
  }

  openEditModal(category: CategoryTree) {
    this.editingCategory = category;
    this.categoryForm = {
      name: category.name,
      description: category.description,
      parent_id: (category as any).parent_id,
      parentId: category.parentId,
      icon: category.icon,
      is_active: (category as any).is_active !== false,
      isActive: category.isActive !== false
    };
    this.showCategoryModal = true;
  }

  openAddSubcategoryModal(parentCategory: CategoryTree) {
    this.editingCategory = null;
    const subcategoriesCount = parentCategory.subcategories?.length || 0;
    this.categoryForm = { 
      name: '', 
      description: '', 
      parent_id: parentCategory.id,
      parentId: parentCategory.id,
      icon: '', 
      is_active: true,
      isActive: true
    };
    this.showCategoryModal = true;
  }

  closeCategoryModal() {
    this.showCategoryModal = false;
    this.editingCategory = null;
    this.categoryForm = {};
  }

  saveCategory() {
    // Validation
    if (!this.categoryForm.name || this.categoryForm.name.trim() === '') {
      this.showNotification('Le nom de la catégorie est obligatoire', 'error');
      return;
    }

    this.loading = true;

    if (this.editingCategory) {
      // Mode édition
      const updateData: any = {
        name: this.categoryForm.name,
        description: this.categoryForm.description,
        icon: this.categoryForm.icon,
        isActive: this.categoryForm.isActive !== false && this.categoryForm.is_active !== false
      };

      const parentId = this.categoryForm.parentId || this.categoryForm.parent_id;
      if (parentId) {
        updateData.parentId = parentId;
      }

      this.categoryService.updateCategory(this.editingCategory.id, updateData).subscribe({
        next: (updatedCategory) => {
          this.showNotification('Catégorie modifiée avec succès', 'success');
          this.closeCategoryModal();
          this.loadCategories();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
          this.showNotification('Erreur lors de la mise à jour de la catégorie', 'error');
          this.loading = false;
        }
      });
    } else {
      // Mode création
      const createData: any = {
        name: this.categoryForm.name,
        description: this.categoryForm.description,
        icon: this.categoryForm.icon,
        isActive: this.categoryForm.isActive !== false && this.categoryForm.is_active !== false
      };

      const parentId = this.categoryForm.parentId || this.categoryForm.parent_id;
      if (parentId) {
        createData.parentId = parentId;
      }

      this.categoryService.createCategory(createData).subscribe({
        next: (newCategory) => {
          this.showNotification('Catégorie créée avec succès', 'success');
          this.closeCategoryModal();
          this.loadCategories();
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          const errorMessage = error.error?.message || error.message || 'Erreur lors de la création de la catégorie';
          this.showNotification(errorMessage, 'error');
          this.loading = false;
        }
      });
    }
  }

  deleteCategory(category: CategoryTree) {
    const productCount = category.productsCount || (category as any).product_count || 0;
    const hasProducts = productCount > 0;
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
    
    let confirmMessage = `Voulez-vous vraiment supprimer la catégorie "${category.name}" ?`;
    
    if (hasProducts) {
      confirmMessage += `\n\n⚠️ Cette catégorie contient ${productCount} produit(s).`;
    }
    
    if (hasSubcategories) {
      confirmMessage += `\n\n⚠️ Cette catégorie contient ${category.subcategories!.length} sous-catégorie(s) qui seront également supprimées.`;
    }
    
    if (confirm(confirmMessage)) {
      this.categoryService.deleteCategory(category.id).subscribe({
        next: () => {
          this.loadCategories();
          this.showNotification('Catégorie supprimée avec succès', 'success');
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          this.showNotification('Erreur lors de la suppression de la catégorie', 'error');
        }
      });
    }
  }

  // Drag & Drop
  onDragStart(event: DragEvent, category: CategoryTree) {
    this.draggedCategory = category;
    event.dataTransfer!.effectAllowed = 'move';
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  onDrop(event: DragEvent, targetIndex: number) {
    event.preventDefault();
    if (this.draggedCategory && !this.draggedCategory.parentId) {
      const currentIndex = this.rootCategories.findIndex(c => c.id === this.draggedCategory!.id);
      if (currentIndex !== -1 && currentIndex !== targetIndex) {
        // Réorganiser les catégories
        const [movedCategory] = this.rootCategories.splice(currentIndex, 1);
        this.rootCategories.splice(targetIndex, 0, movedCategory);
        
        this.showNotification('Ordre des catégories mis à jour', 'success');
        
        // TODO: API call pour sauvegarder le nouvel ordre
        // this.categoryService.reorderCategories(...).subscribe();
      }
      this.draggedCategory = null;
    }
  }

  onDropSubcategory(event: DragEvent, parentCategory: CategoryTree, targetIndex: number) {
    event.preventDefault();
    if (this.draggedCategory && parentCategory.subcategories) {
      const currentIndex = parentCategory.subcategories.findIndex((c: any) => c.id === this.draggedCategory!.id);
      if (currentIndex !== -1 && currentIndex !== targetIndex) {
        // Réorganiser les sous-catégories
        const [movedCategory] = parentCategory.subcategories.splice(currentIndex, 1);
        parentCategory.subcategories.splice(targetIndex, 0, movedCategory);
        
        this.showNotification('Ordre des sous-catégories mis à jour', 'success');
        
        // TODO: API call
      }
      this.draggedCategory = null;
    }
  }

  // Méthodes utilitaires pour le template (publiques pour être utilisées dans le template)
  getProductCount(category: CategoryTree | any): number {
    return category?.product_count || category?.productsCount || 0;
  }

  getIsActive(category: CategoryTree | any): boolean {
    return category?.is_active !== false && category?.isActive !== false;
  }

  setIsActive(category: CategoryTree | any, value: boolean): void {
    if (category) {
      (category as any).is_active = value;
      category.isActive = value;
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private findCategoryIndex(categoryId: string): { categoryIndex: number; subcategoryIndex: number | null } | null {
    for (let i = 0; i < this.categories.length; i++) {
      if (this.categories[i].id === categoryId) {
        return { categoryIndex: i, subcategoryIndex: null };
      }
      
      if (this.categories[i].subcategories) {
        const subIndex = this.categories[i].subcategories!.findIndex((sub: any) => sub.id === categoryId);
        if (subIndex !== -1) {
          return { categoryIndex: i, subcategoryIndex: subIndex };
        }
      }
    }
    return null;
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
    // Notification simple avec alert pour le moment
    // TODO: Remplacer par un vrai système de notifications (toast)
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Vous pouvez intégrer un service de notification ici
    // this.notificationService.show(message, type);
  }
}
