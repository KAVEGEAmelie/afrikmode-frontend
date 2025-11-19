import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  ProductVariant,
  VariantFormData,
  VariantStockUpdate,
  VariantAnalytics
} from '../models/variant.interface';

@Injectable({
  providedIn: 'root'
})
export class VariantService {
  private apiUrl = `${environment.apiUrl}/vendor`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer toutes les variantes d'un produit
   */
  getProductVariants(productId: string): Observable<{ success: boolean; data: ProductVariant[] }> {
    return this.http.get<{ success: boolean; data: ProductVariant[] }>(
      `${this.apiUrl}/products/${productId}/variants`
    );
  }

  /**
   * Récupérer une variante spécifique
   */
  getVariant(variantId: string): Observable<{ success: boolean; data: ProductVariant }> {
    return this.http.get<{ success: boolean; data: ProductVariant }>(
      `${this.apiUrl}/variants/${variantId}`
    );
  }

  /**
   * Créer une nouvelle variante
   */
  createVariant(productId: string, data: VariantFormData): Observable<{ success: boolean; data: ProductVariant; message: string }> {
    return this.http.post<{ success: boolean; data: ProductVariant; message: string }>(
      `${this.apiUrl}/products/${productId}/variants`,
      data
    );
  }

  /**
   * Mettre à jour une variante
   */
  updateVariant(variantId: string, data: Partial<VariantFormData>): Observable<{ success: boolean; data: ProductVariant; message: string }> {
    return this.http.put<{ success: boolean; data: ProductVariant; message: string }>(
      `${this.apiUrl}/variants/${variantId}`,
      data
    );
  }

  /**
   * Supprimer une variante
   */
  deleteVariant(variantId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/variants/${variantId}`
    );
  }

  /**
   * Mettre à jour le stock d'une variante
   */
  updateVariantStock(variantId: string, update: VariantStockUpdate): Observable<{ success: boolean; data: ProductVariant; message: string }> {
    return this.http.patch<{ success: boolean; data: ProductVariant; message: string }>(
      `${this.apiUrl}/variants/${variantId}/stock`,
      update
    );
  }

  /**
   * Upload des images pour une variante
   */
  uploadVariantImages(variantId: string, files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('variant_images', file);
    });

    return this.http.post(
      `${this.apiUrl}/variants/${variantId}/images`,
      formData
    );
  }

  /**
   * Récupérer les analytics d'une variante
   */
  getVariantAnalytics(variantId: string): Observable<{ success: boolean; data: VariantAnalytics }> {
    return this.http.get<{ success: boolean; data: VariantAnalytics }>(
      `${this.apiUrl}/variants/${variantId}/analytics`
    );
  }

  /**
   * Créer FormData pour la création de variante avec images
   */
  createVariantFormData(data: VariantFormData, images?: File[]): FormData {
    const formData = new FormData();

    // Ajouter tous les champs
    Object.keys(data).forEach(key => {
      const value = (data as any)[key];
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Ajouter les images si présentes
    if (images && images.length > 0) {
      images.forEach(file => {
        formData.append('variant_images', file);
      });
    }

    return formData;
  }
}
