// src/app/features/admin/core/services/admin-products.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AdminFilters } from '../models/admin-filters.model';

@Injectable({
  providedIn: 'root'
})
export class AdminProductsService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste des produits
   */
  getProducts(filters?: AdminFilters): Observable<any> {
    let params = new HttpParams().set('admin', 'true');
    
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.category) params = params.set('category', filters.category);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    }

    return this.http.get(this.apiUrl, { params });
  }

  /**
   * Récupère un produit par ID
   */
  getProductById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée un nouveau produit
   */
  createProduct(product: any): Observable<any> {
    return this.http.post(this.apiUrl, product);
  }

  /**
   * Met à jour un produit
   */
  updateProduct(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Supprime un produit
   */
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Change le statut d'un produit
   */
  toggleProductStatus(id: string, status: 'active' | 'inactive' | 'draft'): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
  }

  /**
   * Approuve un produit
   */
  approveProduct(id: string, featured: boolean = false, notes?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/approve`, {
      featured,
      admin_notes: notes
    });
  }

  /**
   * Rejette un produit
   */
  rejectProduct(id: string, reason: string, violations: string[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/reject`, {
      reason,
      violations,
      resubmit_guidelines: 'Veuillez corriger les problèmes mentionnés'
    });
  }

  /**
   * Met en avant un produit
   */
  featureProduct(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/feature`, {});
  }

  /**
   * Retire la mise en avant
   */
  unfeatureProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/feature`);
  }

  /**
   * Signale un produit
   */
  flagProduct(id: string, issueType: string, details: string, severity: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/flag`, {
      issue_type: issueType,
      details,
      severity
    });
  }

  /**
   * Duplique un produit
   */
  duplicateProduct(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/duplicate`, {});
  }

  /**
   * Upload d'images de produit
   */
  uploadProductImages(productId: string, images: FileList): Observable<any> {
    const formData = new FormData();
    for (let i = 0; i < images.length; i++) {
      formData.append('images', images[i]);
    }
    return this.http.post(`${this.apiUrl}/${productId}/images`, formData);
  }

  /**
   * Supprime une image de produit
   */
  deleteProductImage(productId: string, imageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productId}/images/${imageId}`);
  }

  /**
   * Met à jour le stock
   */
  updateStock(productId: string, stock: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${productId}/stock`, { stock });
  }

  /**
   * Récupère l'historique des stocks
   */
  getStockHistory(productId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${productId}/stock-history`);
  }

  /**
   * Récupère les catégories
   */
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/categories`);
  }

  /**
   * Crée une catégorie
   */
  createCategory(category: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/categories`, category);
  }

  /**
   * Met à jour une catégorie
   */
  updateCategory(id: string, category: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/categories/${id}`, category);
  }

  /**
   * Supprime une catégorie
   */
  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/categories/${id}`);
  }

  /**
   * Récupère les statistiques des produits
   */
  getProductStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  /**
   * Exporte les produits
   */
  exportProducts(format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    const params = new HttpParams().set('format', format);
    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Importe des produits
   */
  importProducts(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import`, formData);
  }
}