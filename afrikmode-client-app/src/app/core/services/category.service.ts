// src/app/core/services/category.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Category, Product, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('auth_token');
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  getCategories(tree: boolean = false, active: boolean = true): Observable<any> {
    const params: any = {};
    if (tree) {
      params.tree = 'true';
    }
    if (active) {
      params.active = 'true';
    }
    console.log('🔍 CategoryService.getCategories - URL:', `${this.baseUrl}/categories`, 'Params:', params);
    return this.http.get<any>(`${this.baseUrl}/categories`, {
      headers: this.getHeaders(),
      params: params
    }).pipe(
      map((response: any) => {
        console.log('🔍 CategoryService.getCategories - Réponse brute:', response);
        console.log('🔍 CategoryService.getCategories - Type:', typeof response);
        console.log('🔍 CategoryService.getCategories - IsArray:', Array.isArray(response));
        
        // Normaliser la réponse pour gérer différents formats
        // Format attendu: { success: true, data: [...] }
        if (response && response.success && response.data) {
          console.log('✅ CategoryService - Format normalisé détecté: { success: true, data: [...] }');
          return response;
        }
        // Si la réponse est directement un tableau
        if (Array.isArray(response)) {
          console.log('✅ CategoryService - Format tableau détecté, normalisation en cours...');
          return { success: true, data: response };
        }
        // Si la réponse a une structure différente
        if (response && response.data) {
          console.log('✅ CategoryService - Format { data: [...] } détecté, normalisation en cours...');
          return { success: true, data: response.data };
        }
        // Retourner tel quel
        console.log('⚠️ CategoryService - Format non reconnu, retour tel quel');
        return response;
      })
    );
  }

  getCategory(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/categories/${id}`, {
      headers: this.getHeaders()
    });
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/categories`, category, {
      headers: this.getHeaders()
    });
  }

  updateCategory(id: string, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/categories/${id}`, category, {
      headers: this.getHeaders()
    });
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/categories/${id}`, {
      headers: this.getHeaders()
    });
  }

  getCategoryProducts(categoryId: string, params?: any): Observable<PaginatedResponse<Product>> {
    return this.http.get<PaginatedResponse<Product>>(`${this.baseUrl}/categories/${categoryId}/products`, {
      headers: this.getHeaders(),
      params: params
    });
  }

  getSubCategories(parentId: string): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories/${parentId}/children`, {
      headers: this.getHeaders()
    });
  }

  getFeaturedCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories/featured`, {
      headers: this.getHeaders()
    });
  }
}