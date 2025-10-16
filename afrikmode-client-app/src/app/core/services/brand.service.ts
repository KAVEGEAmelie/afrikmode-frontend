// src/app/core/services/brand.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Brand, Product, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private baseUrl = 'http://localhost:5000/api';

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

  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.baseUrl}/brands`, {
      headers: this.getHeaders()
    });
  }

  getBrand(id: string): Observable<Brand> {
    return this.http.get<Brand>(`${this.baseUrl}/brands/${id}`, {
      headers: this.getHeaders()
    });
  }

  createBrand(brand: Partial<Brand>): Observable<Brand> {
    return this.http.post<Brand>(`${this.baseUrl}/brands`, brand, {
      headers: this.getHeaders()
    });
  }

  updateBrand(id: string, brand: Partial<Brand>): Observable<Brand> {
    return this.http.put<Brand>(`${this.baseUrl}/brands/${id}`, brand, {
      headers: this.getHeaders()
    });
  }

  deleteBrand(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/brands/${id}`, {
      headers: this.getHeaders()
    });
  }

  getBrandProducts(brandId: string, params?: any): Observable<PaginatedResponse<Product>> {
    return this.http.get<PaginatedResponse<Product>>(`${this.baseUrl}/brands/${brandId}/products`, {
      headers: this.getHeaders(),
      params: params
    });
  }

  uploadBrandLogo(brandId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('logo', file);
    
    return this.http.post(`${this.baseUrl}/brands/${brandId}/logo`, formData, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
    });
  }
}