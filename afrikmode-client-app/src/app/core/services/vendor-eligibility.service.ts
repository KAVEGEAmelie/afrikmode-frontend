// src/app/core/services/vendor-eligibility.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface EligibilityResponse {
  eligible: boolean;
  message: string;
  reason?: 'existing_application' | 'existing_store' | 'email_not_verified' | 'account_incomplete';
  application?: {
    id: string;
    applicationNumber: string;
    status: string;
    submittedAt: string;
  };
  store?: {
    id: string;
    name: string;
    status: string;
    slug: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class VendorEligibilityService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Vérifier si l'utilisateur peut postuler pour devenir vendeur
   */
  checkEligibility(): Observable<EligibilityResponse> {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      return throwError(() => ({ 
        eligible: false, 
        message: 'Vous devez être connecté',
        reason: 'account_incomplete'
      }));
    }

    return this.http.get<{ success: boolean; data: EligibilityResponse } | EligibilityResponse>(
      `${this.baseUrl}/vendor/eligibility`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    ).pipe(
      map(response => {
        // Normaliser la réponse (peut venir dans data ou directement)
        if ((response as any).success && (response as any).data) {
          return (response as any).data;
        }
        return response as EligibilityResponse;
      }),
      catchError(error => {
        // Si 403, extraire les infos de la réponse
        if (error.status === 403 && error.error) {
          const errorData = error.error.data || error.error;
          return throwError(() => ({
            eligible: false,
            message: errorData.message || 'Vous n\'êtes pas éligible',
            reason: errorData.reason,
            application: errorData.application,
            store: errorData.store
          }));
        }
        
        // Autres erreurs
        return throwError(() => ({
          eligible: false,
          message: error.error?.message || 'Erreur lors de la vérification',
          reason: 'account_incomplete'
        }));
      })
    );
  }

  /**
   * Vérifier si l'utilisateur a une candidature en cours
   */
  hasPendingApplication(): Observable<boolean> {
    return this.checkEligibility().pipe(
      map(response => {
        return !response.eligible && response.reason === 'existing_application';
      }),
      catchError(() => {
        return throwError(() => false);
      })
    );
  }

  /**
   * Vérifier si l'utilisateur a déjà une boutique
   */
  hasExistingStore(): Observable<boolean> {
    return this.checkEligibility().pipe(
      map(response => {
        return !response.eligible && response.reason === 'existing_store';
      }),
      catchError(() => {
        return throwError(() => false);
      })
    );
  }
}












