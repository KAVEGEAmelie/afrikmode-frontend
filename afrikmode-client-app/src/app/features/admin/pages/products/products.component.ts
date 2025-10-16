// src/app/features/admin/pages/products/products.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

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
import { MatDialogModule } from '@angular/material/dialog';
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
    MatDividerModule
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

  constructor(private fb: FormBuilder) {
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
    
    // Simuler des données pour l'instant
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Robe Wax Africaine',
        description: 'Magnifique robe en wax traditionnel',
        price: 89.99,
        originalPrice: 120.00,
        category: 'femmes',
        store: 'Boutique Afrique',
        status: 'active',
        stock: 15,
        images: ['robe1.jpg', 'robe2.jpg'],
        tags: ['wax', 'traditionnel', 'coloré'],
        createdAt: new Date('2024-09-15'),
        updatedAt: new Date('2024-10-01'),
        views: 245,
        sales: 12,
        rating: 4.5
      },
      {
        id: '2',
        name: 'Chemise Kente',
        description: 'Chemise élégante en tissu Kente',
        price: 75.50,
        category: 'hommes',
        store: 'Mode Ghana',
        status: 'active',
        stock: 8,
        images: ['chemise1.jpg'],
        tags: ['kente', 'élégant', 'cérémonie'],
        createdAt: new Date('2024-09-20'),
        updatedAt: new Date('2024-09-28'),
        views: 180,
        sales: 5,
        rating: 4.2
      },
      {
        id: '3',
        name: 'Ensemble Enfant Bogolan',
        description: 'Ensemble traditionnel pour enfant',
        price: 45.00,
        category: 'enfants',
        store: 'Petits Africains',
        status: 'out_of_stock',
        stock: 0,
        images: ['enfant1.jpg', 'enfant2.jpg'],
        tags: ['bogolan', 'enfant', 'traditionnel'],
        createdAt: new Date('2024-09-10'),
        updatedAt: new Date('2024-09-25'),
        views: 95,
        sales: 8,
        rating: 4.8
      },
      {
        id: '4',
        name: 'Sac à Main Cuir',
        description: 'Sac en cuir authentique',
        price: 125.00,
        category: 'accessoires',
        store: 'Artisanat Africain',
        status: 'draft',
        stock: 3,
        images: ['sac1.jpg'],
        tags: ['cuir', 'artisanal', 'luxe'],
        createdAt: new Date('2024-09-05'),
        updatedAt: new Date('2024-09-30'),
        views: 67,
        sales: 0,
        rating: 0
      },
      {
        id: '5',
        name: 'Boubou Brodé',
        description: 'Boubou traditionnel brodé à la main',
        price: 150.00,
        originalPrice: 200.00,
        category: 'femmes',
        store: 'Traditions Sénégal',
        status: 'active',
        stock: 5,
        images: ['boubou1.jpg', 'boubou2.jpg', 'boubou3.jpg'],
        tags: ['boubou', 'broderie', 'traditionnel', 'cérémonie'],
        createdAt: new Date('2024-08-28'),
        updatedAt: new Date('2024-10-02'),
        views: 320,
        sales: 18,
        rating: 4.7
      }
    ];

    setTimeout(() => {
      this.dataSource.data = mockProducts;
      this.loading = false;
    }, 1000);
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
    console.log('Delete product:', product);
    // TODO: Confirmer suppression
  }

  toggleStatus(product: Product): void {
    console.log('Toggle status:', product);
    // TODO: Changer le statut
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
    console.log('Add new product');
    // TODO: Ouvrir dialog d'ajout
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