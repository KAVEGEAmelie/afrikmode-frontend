// src/app/core/services/vendor-application.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface VendorApplication {
  id: string;
  applicationNumber: string;
  shopName: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'info_required';
  submittedAt: string;
  lastUpdatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  additionalInfoRequested?: string;
  adminMessages?: AdminMessage[];
  storeId?: string;
}

export interface AdminMessage {
  id: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface ApplicationStatusResponse {
  success: boolean;
  data: VendorApplication;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VendorApplicationService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': localStorage.getItem('language') || 'fr'
    });

    if (token) {
      return headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  /**
   * Récupérer le statut de la candidature de l'utilisateur connecté
   */
  getApplicationStatus(applicationId?: string): Observable<VendorApplication> {
    // Utiliser la nouvelle API vendor-application
    const url = `${this.baseUrl}/vendor-application/application/status`;

    return this.http.get<ApplicationStatusResponse>(url, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('📥 Réponse API getApplicationStatus:', response);
        
        if (response.success && response.data) {
          // Adapter le format de l'API au format attendu par le frontend
          const data = response.data as any;
          const mapped = {
            id: data.id?.toString() || '',
            applicationNumber: this.generateApplicationNumber(data.id, data.submitted_at),
            shopName: data.store_name || '',
            status: this.mapBackendStatus(data.status),
            submittedAt: data.submitted_at,
            lastUpdatedAt: data.submitted_at,
            reviewedBy: data.approved_by || data.rejected_by,
            reviewedAt: data.approved_at || data.rejected_at,
            rejectionReason: data.rejection_reason,
            adminMessages: [],
            storeId: undefined
          };
          console.log('✅ Données mappées:', mapped);
          return mapped;
        }
        
        // Si pas de data, lancer une erreur 404
        if (response.success && !response.data) {
          console.log('ℹ️ Aucune candidature trouvée');
          throw { status: 404, message: 'Aucune candidature trouvée' };
        }
        
        return response as any;
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la récupération du statut:', error);
        return throwError(() => ({
          message: error.error?.message || error.message || 'Erreur lors de la récupération du statut',
          status: error.status || 500
        }));
      })
    );
  }

  /**
   * Mapper le statut backend vers le statut frontend
   */
  private mapBackendStatus(status: string): 'pending' | 'under_review' | 'approved' | 'rejected' | 'info_required' {
    switch (status) {
      case 'pending':
        return 'under_review'; // En attente = en cours d'examen côté UI
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      default:
        return 'pending';
    }
  }

  /**
   * Générer un numéro de candidature au format VA-YYYYMMDD-NNNN
   */
  private generateApplicationNumber(id: number, submittedAt: string): string {
    const date = new Date(submittedAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const idStr = String(id).padStart(4, '0');
    return `VA-${year}${month}${day}-${idStr}`;
  }

  /**
   * Soumettre une nouvelle demande vendeur
   */
  submitApplication(data: {
    business_name: string;
    business_type: 'individual' | 'company' | 'cooperative' | 'association';
    contact_email: string;
    contact_phone: string;
    tax_id?: string;
    registration_number?: string;
    business_address?: any;
    website?: string;
    description?: string;
    documents?: any;
  }): Observable<{ success: boolean; data: any; message: string }> {
    return this.http.post<{ success: boolean; data: any; message: string }>(
      `${this.baseUrl}/vendor-requests`,
      data,
      {
        headers: this.getHeaders()
      }
    ).pipe(
      catchError(error => {
        console.error('Erreur lors de la soumission:', error);
        return throwError(() => ({
          message: error.error?.message || 'Erreur lors de la soumission de la demande',
          status: error.status || 500
        }));
      })
    );
  }

  /**
   * Récupérer le statut par numéro de candidature
   */
  getApplicationByNumber(applicationNumber: string): Observable<VendorApplication> {
    return this.http.get<ApplicationStatusResponse>(
      `${this.baseUrl}/vendor/applications/number/${applicationNumber}`,
      {
        headers: this.getHeaders()
      }
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        return response as any;
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération par numéro:', error);
        return throwError(() => ({
          message: error.error?.message || 'Candidature non trouvée',
          status: error.status || 404
        }));
      })
    );
  }

  /**
   * Marquer un message admin comme lu
   */
  markMessageAsRead(applicationId: string, messageId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.baseUrl}/vendor/applications/${applicationId}/messages/${messageId}/read`,
      {},
      {
        headers: this.getHeaders()
      }
    ).pipe(
      catchError(error => {
        console.error('Erreur lors du marquage du message:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Soumettre des informations supplémentaires demandées
   */
  submitAdditionalInfo(applicationId: string, data: {
    message?: string;
    documents?: File[];
    [key: string]: any;
  }): Observable<{ success: boolean; message: string }> {
    const formData = new FormData();

    // Ajouter les données textuelles
    Object.keys(data).forEach(key => {
      if (key !== 'documents' && data[key] !== null && data[key] !== undefined) {
        if (data[key] instanceof File) {
          formData.append(key, data[key]);
        } else {
          formData.append(key, data[key].toString());
        }
      }
    });

    // Ajouter les documents
    if (data.documents && Array.isArray(data.documents)) {
      data.documents.forEach((file, index) => {
        formData.append(`documents[${index}]`, file);
      });
    }

    // Headers sans Content-Type pour FormData (le navigateur l'ajoute automatiquement)
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Accept-Language': localStorage.getItem('language') || 'fr'
    });

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.put<{ success: boolean; message: string }>(
      `${this.baseUrl}/vendor-requests/${applicationId}/update`,
      formData,
      {
        headers: headers.has('Authorization') ? headers : undefined
      }
    ).pipe(
      catchError(error => {
        console.error('Erreur lors de la soumission:', error);
        return throwError(() => ({
          message: error.error?.message || 'Erreur lors de la soumission',
          status: error.status || 500
        }));
      })
    );
  }

  /**
   * Récupérer toutes les candidatures de l'utilisateur
   */
  getUserApplications(): Observable<VendorApplication[]> {
    return this.http.get<{ success: boolean; data: VendorApplication[] }>(
      `${this.baseUrl}/vendor/applications`,
      {
        headers: this.getHeaders()
      }
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        return [];
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des candidatures:', error);
        return throwError(() => error);
      })
    );
  }
}












