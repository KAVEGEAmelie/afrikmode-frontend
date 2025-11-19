import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string;
  subcategories?: Category[];
  productsCount: number;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryTree extends Category {
  subcategories: CategoryTree[];
  expanded?: boolean;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  icon?: string;
  parentId?: string;
  isActive?: boolean;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
  order?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/admin/categories`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer toutes les catégories (arborescence)
   */
  getCategories(): Observable<CategoryTree[]> {
    return this.http.get<{ success: boolean; data: { categories: CategoryTree[] } }>(this.apiUrl).pipe(
      map(response => response.data?.categories || [])
    );
  }

  /**
   * Récupérer une catégorie par ID
   */
  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  /**
   * Créer une nouvelle catégorie
   */
  createCategory(data: CreateCategoryDto): Observable<Category> {
    return this.http.post<{ success: boolean; data: { category: Category } }>(this.apiUrl, data).pipe(
      map(response => response.data?.category || response.data as any)
    );
  }

  /**
   * Mettre à jour une catégorie
   */
  updateCategory(id: string, data: UpdateCategoryDto): Observable<Category> {
    return this.http.put<{ success: boolean; data: { category: Category } }>(`${this.apiUrl}/${id}`, data).pipe(
      map(response => response.data?.category || response.data as any)
    );
  }

  /**
   * Supprimer une catégorie
   */
  deleteCategory(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Activer/désactiver une catégorie
   */
  toggleCategoryStatus(id: string): Observable<{ success: boolean; isActive: boolean }> {
    return this.http.patch<{ success: boolean; isActive: boolean }>(
      `${this.apiUrl}/${id}/toggle-status`,
      {}
    );
  }

  /**
   * Réorganiser les catégories (drag & drop)
   */
  reorderCategories(data: {
    categoryId: string;
    newOrder: number;
    newParentId?: string;
  }[]): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/reorder`,
      data
    );
  }

  /**
   * Récupérer les statistiques des catégories
   */
  getCategoriesStats(): Observable<{
    total: number;
    active: number;
    inactive: number;
    withProducts: number;
  }> {
    return this.http.get<{
      total: number;
      active: number;
      inactive: number;
      withProducts: number;
    }>(`${this.apiUrl}/stats`);
  }

  /**
   * Récupérer les catégories racines uniquement
   */
  getRootCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/root`);
  }

  /**
   * Récupérer les sous-catégories d'une catégorie
   */
  getSubcategories(parentId: string): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/${parentId}/subcategories`);
  }
}
