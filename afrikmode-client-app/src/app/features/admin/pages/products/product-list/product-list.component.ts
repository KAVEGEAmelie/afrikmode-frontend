// src/app/features/admin/pages/products/product-list/product-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AdminDataTableComponent, TableColumn, TableAction } from '../../../shared/components/admin-data-table/admin-data-table.component';
import { AdminProductsService } from '../../../core/services/admin-products.service';
import { Product, ProductStatus } from '../../../core/models/product.model';

@Component({
  standalone: true,
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    AdminDataTableComponent
  ]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = false;

  columns: TableColumn[] = [
    {
      key: 'images',
      label: 'Image',
      type: 'text',
      sortable: false,
      width: '80px',
      align: 'center'
    },
    {
      key: 'name',
      label: 'Nom du Produit',
      sortable: true
    },
    {
      key: 'sku',
      label: 'SKU',
      sortable: true
    },
    {
      key: 'price',
      label: 'Prix',
      type: 'number',
      sortable: true,
      format: (value: number) => `${value}€`
    },
    {
      key: 'stock_quantity',
      label: 'Stock',
      type: 'number',
      sortable: true
    },
    {
      key: 'category_name',
      label: 'Catégorie',
      sortable: true,
      format: (value: any) => value || 'Non définie'
    },
    {
      key: 'status',
      label: 'Statut',
      type: 'badge',
      sortable: true
    },
    {
      key: 'created_at',
      label: 'Date Création',
      type: 'date',
      sortable: true
    }
  ];

  actions: TableAction[] = [
    {
      label: 'Voir',
      icon: 'visibility',
      color: 'primary',
      action: (product) => this.viewProduct(product)
    },
    {
      label: 'Modifier',
      icon: 'edit',
      color: 'accent',
      action: (product) => this.editProduct(product)
    },
    {
      label: 'Supprimer',
      icon: 'delete',
      color: 'warn',
      action: (product) => this.deleteProduct(product)
    }
  ];

  constructor(
    private productsService: AdminProductsService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.productsService.getProducts().subscribe({
      next: (response) => {
        this.products = response.products;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits:', error);
        this.loading = false;
      }
    });
  }

  viewProduct(product: Product) {
    console.log('Voir produit:', product);
  }

  editProduct(product: Product) {
    console.log('Modifier produit:', product);
  }

  deleteProduct(product: Product) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ?`)) {
      this.productsService.deleteProduct(product.id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }

  onSelectionChange(selectedProducts: Product[]) {
    console.log('Produits sélectionnés:', selectedProducts);
  }

  onSortChange(sort: {column: string, direction: 'asc' | 'desc'}) {
    console.log('Tri changé:', sort);
  }

  exportProducts() {
    console.log('Export des produits');
  }

  getStatusColor(status: ProductStatus): string {
    const colors: {[key: string]: string} = {
      'active': 'rgb(76, 175, 80)',
      'inactive': 'rgb(255, 152, 0)',
      'draft': 'rgb(96, 125, 139)',
      'archived': 'rgb(244, 67, 54)'
    };
    return colors[status] || colors['draft'];
  }

  getStatusLabel(status: ProductStatus): string {
    const labels: {[key: string]: string} = {
      'active': 'Actif',
      'inactive': 'Inactif',
      'draft': 'Brouillon',
      'archived': 'Archivé'
    };
    return labels[status] || status;
  }
}