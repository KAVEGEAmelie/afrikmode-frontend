// src/app/features/admin/pages/products/products.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { AdminApiService, Store } from '../../core/services/admin-api.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ProductFormComponent } from '../../../vendor/pages/products/product-form/product-form.component';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { StoreSelectionDialogComponent } from './store-selection-dialog.component';

// Angular Material Modules
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  store: string;
  status: 'active' | 'inactive' | 'draft' | 'out_of_stock';
  stock: number;
  images: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  views: number;
  sales: number;
  rating: number;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatDividerModule,
    ProductFormComponent
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<Product>([]);
  displayedColumns: string[] = ['image', 'name', 'category', 'price', 'stock', 'status', 'sales', 'rating', 'actions'];
  
  loading = false;
  searchForm: FormGroup;
  
  // Product form
  showProductForm = false;
  selectedStore: Store | null = null;
  stores: Store[] = [];
  loadingStores = false;
  
  categories = [
    { value: 'femmes', label: 'Femmes' },
    { value: 'hommes', label: 'Hommes' },
    { value: 'enfants', label: 'Enfants' },
    { value: 'accessoires', label: 'Accessoires' }
  ];

  statuses = [
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
    { value: 'draft', label: 'Brouillon' },
    { value: 'out_of_stock', label: 'Rupture de stock' }
  ];

  constructor(
    private fb: FormBuilder,
    private adminApi: AdminApiService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {
    this.searchForm = this.fb.group({
      search: [''],
      category: [''],
      status: [''],
      priceMin: [''],
      priceMax: ['']
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.setupSearch();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private setupSearch(): void {
    this.searchForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  private applyFilters(): void {
    const filters = this.searchForm.value;
    
    this.dataSource.filterPredicate = (data: Product, filter: string) => {
      const searchMatch = !filters.search || 
        data.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        data.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        data.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));
      
      const categoryMatch = !filters.category || data.category === filters.category;
      const statusMatch = !filters.status || data.status === filters.status;
      
      const priceMinMatch = !filters.priceMin || data.price >= parseFloat(filters.priceMin);
      const priceMaxMatch = !filters.priceMax || data.price <= parseFloat(filters.priceMax);
      
      return searchMatch && categoryMatch && statusMatch && priceMinMatch && priceMaxMatch;
    };
    
    this.dataSource.filter = Math.random().toString();
  }

  loadProducts(): void {
    this.loading = true;
    
    // Récupérer les paramètres de filtrage depuis le formulaire
    const formValue = this.searchForm.value;
    const params: any = {
      page: 1,
      limit: 1000, // Charger tous les produits pour le filtrage côté client
      sortBy: 'created_at',
      sortOrder: 'desc'
    };

    if (formValue.search) {
      params.search = formValue.search;
    }
    if (formValue.category) {
      params.category = formValue.category;
    }
    if (formValue.status) {
      params.status = formValue.status;
    }
    if (formValue.priceMin) {
      params.priceMin = formValue.priceMin;
    }
    if (formValue.priceMax) {
      params.priceMax = formValue.priceMax;
    }

    this.adminApi.getProducts(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Parser les dates
          const parseDate = (dateValue: any): Date => {
            if (!dateValue) return new Date();
            if (dateValue instanceof Date) return dateValue;
            if (typeof dateValue === 'string') {
              const date = new Date(dateValue);
              return isNaN(date.getTime()) ? new Date() : date;
            }
            return new Date();
          };

          const products: Product[] = (Array.isArray(response.data) ? response.data : []).map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            price: p.price || 0,
            originalPrice: p.originalPrice,
            category: p.category || '',
            store: p.store || '',
            status: p.status || 'draft',
            stock: p.stock || 0,
            images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : ['placeholder.jpg']),
            tags: Array.isArray(p.tags) ? p.tags : [],
            createdAt: parseDate(p.createdAt),
            updatedAt: parseDate(p.updatedAt),
            views: p.views || 0,
            sales: p.sales || 0,
            rating: p.rating || 0
          }));

          this.dataSource.data = products;
        } else {
          this.dataSource.data = [];
          this.toastService.error(response.message || 'Erreur lors du chargement des produits');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement produits:', error);
        this.dataSource.data = [];
        this.loading = false;
        const errorMessage = error.error?.message || error.message || 'Erreur lors du chargement des produits';
        this.toastService.error(errorMessage);
      }
    });
  }

  getCategoryLabel(category: string): string {
    const categoryObj = this.categories.find(c => c.value === category);
    return categoryObj ? categoryObj.label : category;
  }

  getStatusLabel(status: string): string {
    const statusObj = this.statuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'primary';
      case 'inactive':
        return 'accent';
      case 'draft':
        return 'warn';
      case 'out_of_stock':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getDiscountPercentage(product: Product): number | null {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return null;
  }

  editProduct(product: Product): void {
    console.log('Edit product:', product);
    // TODO: Ouvrir dialog d'édition
  }

  deleteProduct(product: Product): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ?`)) {
      return;
    }

    this.adminApi.deleteProduct(product.id).subscribe({
      next: () => {
        this.toastService.success('Produit supprimé avec succès');
        this.loadProducts(); // Recharger la liste
      },
      error: (error) => {
        console.error('Erreur suppression produit:', error);
        const errorMessage = error.error?.message || error.message || 'Erreur lors de la suppression';
        this.toastService.error(errorMessage);
      }
    });
  }

  toggleStatus(product: Product): void {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    
    this.adminApi.updateProductStatus(product.id, newStatus).subscribe({
      next: () => {
        product.status = newStatus;
        this.toastService.success('Statut du produit mis à jour');
        this.loadProducts(); // Recharger pour avoir les données à jour
      },
      error: (error) => {
        console.error('Erreur mise à jour statut:', error);
        const errorMessage = error.error?.message || error.message || 'Erreur lors de la mise à jour du statut';
        this.toastService.error(errorMessage);
      }
    });
  }

  viewProduct(product: Product): void {
    console.log('View product:', product);
    // TODO: Naviguer vers détails produit
  }

  duplicateProduct(product: Product): void {
    console.log('Duplicate product:', product);
    // TODO: Dupliquer le produit
  }

  exportProducts(): void {
    console.log('Export products');
    // TODO: Exporter les produits
  }

  addProduct(): void {
    // Charger les boutiques si pas déjà chargées
    if (this.stores.length === 0) {
      this.loadStores();
    } else {
      this.openStoreSelectionDialog();
    }
  }

  loadStores(): void {
    this.loadingStores = true;
    this.adminApi.getStores({ limit: 100, status: 'active' }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stores = Array.isArray(response.data) ? response.data : [];
          this.loadingStores = false;
          this.openStoreSelectionDialog();
        } else {
          this.loadingStores = false;
          this.toastService.error('Erreur lors du chargement des boutiques');
        }
      },
      error: (error) => {
        console.error('Erreur chargement boutiques:', error);
        this.loadingStores = false;
        const errorMessage = error.error?.message || error.message || 'Erreur lors du chargement des boutiques';
        this.toastService.error(errorMessage);
      }
    });
  }

  openStoreSelectionDialog(): void {
    if (this.stores.length === 0) {
      this.toastService.warning('Aucune boutique active disponible');
      return;
    }

    // Si une seule boutique, l'utiliser directement
    if (this.stores.length === 1) {
      this.selectedStore = this.stores[0];
      this.showProductForm = true;
      return;
    }

    // Sinon, ouvrir un dialog de sélection
    const dialogRef = this.dialog.open(StoreSelectionDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      disableClose: false,
      hasBackdrop: true,
      panelClass: 'store-selection-dialog-panel',
      data: { stores: this.stores }
    });

    dialogRef.afterClosed().subscribe((selectedStore: Store | null) => {
      if (selectedStore) {
        this.selectedStore = selectedStore;
        // Petit délai pour s'assurer que le dialog est fermé avant d'ouvrir le formulaire
        setTimeout(() => {
          this.showProductForm = true;
        }, 100);
      }
    });
  }

  closeProductForm(): void {
    this.showProductForm = false;
    this.selectedStore = null;
  }

  saveProduct(productData: any): void {
    if (!this.selectedStore) {
      this.toastService.error('Boutique non sélectionnée');
      return;
    }

    // Ajouter le store_id aux données du produit
    const productDataWithStore = {
      ...productData,
      store_id: this.selectedStore.id
    };

    this.adminApi.createProduct(productDataWithStore).subscribe({
      next: (newProduct) => {
        this.toastService.success('Produit créé avec succès !');
        this.closeProductForm();
        this.loadProducts(); // Recharger la liste
      },
      error: (error) => {
        console.error('Erreur lors de la création:', error);
        const errorMessage = error.error?.message || error.message || 'Erreur lors de la création du produit';
        this.toastService.error(errorMessage);
      }
    });
  }

  clearFilters(): void {
    this.searchForm.reset();
  }

  getCategoryColor(category: string): string {
    switch (category) {
      case 'femmes':
        return 'primary';
      case 'hommes':
        return 'accent';
      case 'enfants':
        return 'warn';
      case 'accessoires':
        return 'primary';
      default:
        return 'primary';
    }
  }

  getStockColor(stock: number): string {
    if (stock === 0) return 'warn';
    if (stock < 5) return 'accent';
    return 'primary';
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'stock-empty';
    if (stock < 5) return 'stock-low';
    if (stock < 20) return 'stock-medium';
    return 'stock-high';
  }

  getActiveProductsCount(): number {
    return this.dataSource.data.filter(p => p.status === 'active').length;
  }

  getOutOfStockCount(): number {
    return this.dataSource.data.filter(p => p.status === 'out_of_stock').length;
  }

  getDraftCount(): number {
    return this.dataSource.data.filter(p => p.status === 'draft').length;
  }

  getTotalSales(): number {
    return this.dataSource.data.reduce((sum, p) => sum + p.sales, 0);
  }

  getTotalRevenue(): number {
    return this.dataSource.data.reduce((sum, p) => sum + (p.price * p.sales), 0);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(value);
  }

  getStars(rating: number): { filled: boolean }[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push({ filled: i <= Math.floor(rating) });
    }
    return stars;
  }
}