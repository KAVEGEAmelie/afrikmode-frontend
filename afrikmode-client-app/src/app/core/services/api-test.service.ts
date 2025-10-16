// src/app/core/services/api-test.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiTestService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Tester la connexion au backend
   */
  testHealth(): Observable<any> {
    return this.http.get(`${this.baseUrl.replace('/api', '')}/health`);
  }

  /**
   * Tester l'authentification
   */
  testLogin(credentials: {email: string, password: string}): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, credentials);
  }

  /**
   * Tester l'endpoint des produits
   */
  testProducts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/products`);
  }

  /**
   * Tester l'endpoint des catégories
   */
  testCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories`);
  }
}