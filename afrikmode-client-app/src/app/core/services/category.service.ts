// src/app/core/services/category.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`, {
      headers: this.getHeaders()
    });
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