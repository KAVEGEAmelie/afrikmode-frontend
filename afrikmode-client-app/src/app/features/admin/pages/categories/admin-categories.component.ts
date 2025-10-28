import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
                  <span class="product-count">{{ category.product_count }} produits</span>
                </div>
              </div>
              <div class="category-actions">
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="category.is_active" (change)="toggleCategoryStatus(category)">
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
                      <span class="product-count">{{ subcat.product_count }} produits</span>
                    </div>
                  </div>
                  <div class="category-actions">
                    <label class="toggle-switch">
                      <input type="checkbox" [(ngModel)]="subcat.is_active" (change)="toggleCategoryStatus(subcat)">
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
  categories: Category[] = [];
  rootCategories: Category[] = [];
  expandedCategoryId: string | null = null;
  
  showCategoryModal = false;
  editingCategory: Category | null = null;
  categoryForm: Partial<Category> = {
    name: '',
    description: '',
    parent_id: undefined,
    icon: '',
    is_active: true
  };

  draggedCategory: Category | null = null;

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    // Données de démonstration
    this.categories = [
      {
        id: '1',
        name: 'Vêtements',
        slug: 'vetements',
        icon: '👕',
        display_order: 1,
        is_active: true,
        product_count: 458,
        created_at: '2024-01-01',
        updated_at: '2025-10-15',
        subcategories: [
          { id: '1-1', name: 'Robes', slug: 'robes', parent_id: '1', display_order: 1, is_active: true, product_count: 120, created_at: '2024-01-01', updated_at: '2025-10-15' },
          { id: '1-2', name: 'Chemises', slug: 'chemises', parent_id: '1', display_order: 2, is_active: true, product_count: 89, created_at: '2024-01-01', updated_at: '2025-10-15' },
          { id: '1-3', name: 'Pantalons', slug: 'pantalons', parent_id: '1', display_order: 3, is_active: true, product_count: 156, created_at: '2024-01-01', updated_at: '2025-10-15' }
        ]
      },
      {
        id: '2',
        name: 'Accessoires',
        slug: 'accessoires',
        icon: '👜',
        display_order: 2,
        is_active: true,
        product_count: 234,
        created_at: '2024-01-01',
        updated_at: '2025-10-15',
        subcategories: [
          { id: '2-1', name: 'Sacs', slug: 'sacs', parent_id: '2', display_order: 1, is_active: true, product_count: 78, created_at: '2024-01-01', updated_at: '2025-10-15' },
          { id: '2-2', name: 'Bijoux', slug: 'bijoux', parent_id: '2', display_order: 2, is_active: true, product_count: 156, created_at: '2024-01-01', updated_at: '2025-10-15' }
        ]
      },
      {
        id: '3',
        name: 'Chaussures',
        slug: 'chaussures',
        icon: '👞',
        display_order: 3,
        is_active: true,
        product_count: 167,
        created_at: '2024-01-01',
        updated_at: '2025-10-15'
      }
    ];
    this.rootCategories = this.categories;
  }

  toggleCategory(categoryId: string) {
    this.expandedCategoryId = this.expandedCategoryId === categoryId ? null : categoryId;
  }

  toggleCategoryStatus(category: Category) {
    // Mise à jour du statut
    const statusText = category.is_active ? 'activée' : 'désactivée';
    console.log(`Catégorie "${category.name}" ${statusText}`);
    
    // TODO: Appel API pour sauvegarder le changement
    // this.categoryService.updateStatus(category.id, category.is_active).subscribe();
    
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

  openEditModal(category: Category) {
    this.editingCategory = category;
    this.categoryForm = { ...category };
    this.showCategoryModal = true;
  }

  openAddSubcategoryModal(parentCategory: Category) {
    this.editingCategory = null;
    const subcategoriesCount = parentCategory.subcategories?.length || 0;
    this.categoryForm = { 
      name: '', 
      description: '', 
      parent_id: parentCategory.id, 
      icon: '', 
      is_active: true,
      display_order: subcategoriesCount + 1
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

    if (this.editingCategory) {
      // Mode édition
      const index = this.findCategoryIndex(this.editingCategory.id);
      if (index !== null) {
        // Mise à jour locale
        Object.assign(this.categories[index.categoryIndex], {
          ...this.categoryForm,
          updated_at: new Date().toISOString()
        });
        
        if (index.subcategoryIndex !== null) {
          // C'est une sous-catégorie
          const parent = this.categories[index.categoryIndex];
          if (parent.subcategories) {
            Object.assign(parent.subcategories[index.subcategoryIndex], {
              ...this.categoryForm,
              updated_at: new Date().toISOString()
            });
          }
        }
        
        this.showNotification('Catégorie modifiée avec succès', 'success');
      }
    } else {
      // Mode création
      const newCategory: Category = {
        id: Date.now().toString(),
        name: this.categoryForm.name!,
        slug: this.generateSlug(this.categoryForm.name!),
        description: this.categoryForm.description,
        parent_id: this.categoryForm.parent_id,
        icon: this.categoryForm.icon,
        display_order: this.categoryForm.display_order || 1,
        is_active: this.categoryForm.is_active !== false,
        product_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (this.categoryForm.parent_id) {
        // Ajouter comme sous-catégorie
        const parent = this.categories.find(c => c.id === this.categoryForm.parent_id);
        if (parent) {
          if (!parent.subcategories) {
            parent.subcategories = [];
          }
          parent.subcategories.push(newCategory);
        }
      } else {
        // Ajouter comme catégorie racine
        this.categories.push(newCategory);
        this.rootCategories = this.categories;
      }
      
      this.showNotification('Catégorie créée avec succès', 'success');
    }

    // TODO: API call
    // const action = this.editingCategory ? 
    //   this.categoryService.update(this.editingCategory.id, this.categoryForm) :
    //   this.categoryService.create(this.categoryForm);
    // 
    // action.subscribe({
    //   next: () => {
    //     this.closeCategoryModal();
    //     this.loadCategories();
    //   },
    //   error: (err) => this.showNotification('Erreur lors de la sauvegarde', 'error')
    // });

    this.closeCategoryModal();
    this.loadCategories();
  }

  deleteCategory(category: Category) {
    const hasProducts = category.product_count > 0;
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
    
    let confirmMessage = `Voulez-vous vraiment supprimer la catégorie "${category.name}" ?`;
    
    if (hasProducts) {
      confirmMessage += `\n\n⚠️ Cette catégorie contient ${category.product_count} produit(s).`;
    }
    
    if (hasSubcategories) {
      confirmMessage += `\n\n⚠️ Cette catégorie contient ${category.subcategories!.length} sous-catégorie(s) qui seront également supprimées.`;
    }
    
    if (confirm(confirmMessage)) {
      // Suppression locale
      if (category.parent_id) {
        // Supprimer une sous-catégorie
        const parent = this.categories.find(c => c.id === category.parent_id);
        if (parent && parent.subcategories) {
          parent.subcategories = parent.subcategories.filter(sub => sub.id !== category.id);
        }
      } else {
        // Supprimer une catégorie racine
        this.categories = this.categories.filter(c => c.id !== category.id);
        this.rootCategories = this.categories;
      }
      
      this.showNotification('Catégorie supprimée avec succès', 'success');
      
      // TODO: API call
      // this.categoryService.delete(category.id).subscribe({
      //   next: () => {
      //     this.loadCategories();
      //     this.showNotification('Catégorie supprimée', 'success');
      //   },
      //   error: (err) => this.showNotification('Erreur lors de la suppression', 'error')
      // });
    }
  }

  // Drag & Drop
  onDragStart(event: DragEvent, category: Category) {
    this.draggedCategory = category;
    event.dataTransfer!.effectAllowed = 'move';
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  onDrop(event: DragEvent, targetIndex: number) {
    event.preventDefault();
    if (this.draggedCategory && !this.draggedCategory.parent_id) {
      const currentIndex = this.rootCategories.findIndex(c => c.id === this.draggedCategory!.id);
      if (currentIndex !== -1 && currentIndex !== targetIndex) {
        // Réorganiser les catégories
        const [movedCategory] = this.rootCategories.splice(currentIndex, 1);
        this.rootCategories.splice(targetIndex, 0, movedCategory);
        
        // Mettre à jour les display_order
        this.rootCategories.forEach((cat, index) => {
          cat.display_order = index + 1;
        });
        
        this.showNotification('Ordre des catégories mis à jour', 'success');
        
        // TODO: API call pour sauvegarder le nouvel ordre
        // this.categoryService.updateOrder(this.rootCategories.map(c => c.id)).subscribe();
      }
      this.draggedCategory = null;
    }
  }

  onDropSubcategory(event: DragEvent, parentCategory: Category, targetIndex: number) {
    event.preventDefault();
    if (this.draggedCategory && parentCategory.subcategories) {
      const currentIndex = parentCategory.subcategories.findIndex(c => c.id === this.draggedCategory!.id);
      if (currentIndex !== -1 && currentIndex !== targetIndex) {
        // Réorganiser les sous-catégories
        const [movedCategory] = parentCategory.subcategories.splice(currentIndex, 1);
        parentCategory.subcategories.splice(targetIndex, 0, movedCategory);
        
        // Mettre à jour les display_order
        parentCategory.subcategories.forEach((cat, index) => {
          cat.display_order = index + 1;
        });
        
        this.showNotification('Ordre des sous-catégories mis à jour', 'success');
        
        // TODO: API call
      }
      this.draggedCategory = null;
    }
  }

  // Méthodes utilitaires
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
        const subIndex = this.categories[i].subcategories!.findIndex(sub => sub.id === categoryId);
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
