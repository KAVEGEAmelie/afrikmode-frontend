// src/app/features/admin/core/services/admin-users.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AdminUser, UserListResponse, UserUpdateData, UserRoleType } from '../models/admin-user.model';
import { AdminFilters } from '../models/admin-filters.model';

@Injectable({
  providedIn: 'root'
})
export class AdminUsersService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste des utilisateurs avec filtres
   */
  getUsers(filters?: AdminFilters): Observable<UserListResponse> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.role) params = params.set('role', filters.role);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.sortBy) params = params.set('sort_by', filters.sortBy);
      if (filters.sortOrder) params = params.set('sort_order', filters.sortOrder);
    }

    return this.http.get<UserListResponse>(this.apiUrl, { params });
  }

  /**
   * Récupère un utilisateur par ID
   */
  getUserById(id: string): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée un nouvel utilisateur
   */
  createUser(user: Partial<AdminUser>): Observable<AdminUser> {
    return this.http.post<AdminUser>(this.apiUrl, user);
  }

  /**
   * Met à jour un utilisateur
   */
  updateUser(id: string, data: UserUpdateData): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Supprime un utilisateur
   */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Change le statut d'un utilisateur (actif/suspendu/banni)
   * Correspond à PUT /api/users/:id/status
   */
  updateUserStatus(id: string, status: 'active' | 'suspended' | 'banned', reason?: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, { status, reason });
  }

  /**
   * Suspend un utilisateur
   * Utilise updateUserStatus avec status='suspended'
   */
  suspendUser(id: string, reason: string): Observable<any> {
    return this.updateUserStatus(id, 'suspended', reason);
  }

  /**
   * Bannit un utilisateur
   * Utilise updateUserStatus avec status='banned'
   */
  banUser(id: string, reason: string): Observable<any> {
    return this.updateUserStatus(id, 'banned', reason);
  }

  /**
   * Réactive un utilisateur
   * Utilise updateUserStatus avec status='active'
   */
  activateUser(id: string, reason?: string): Observable<any> {
    return this.updateUserStatus(id, 'active', reason);
  }

  /**
   * Change le rôle d'un utilisateur
   * Note: Endpoint backend non implémenté, utilise updateUser
   */
  updateUserRole(id: string, role: UserRoleType): Observable<AdminUser> {
    return this.updateUser(id, { role });
  }

  /**
   * Récupère l'historique d'activité d'un utilisateur
   */
  getUserActivity(id: string, limit: number = 50): Observable<any[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<any[]>(`${this.apiUrl}/${id}/activity`, { params });
  }

  /**
   * Récupère les commandes d'un utilisateur
   */
  getUserOrders(id: string, page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get(`${this.apiUrl}/${id}/orders`, { params });
  }

  /**
   * Récupère les statistiques des utilisateurs
   */
  getUserStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  /**
   * Envoie un email à un utilisateur
   */
  sendEmailToUser(id: string, emailData: { subject: string; message: string }): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/send-email`, emailData);
  }

  /**
   * Réinitialise le mot de passe d'un utilisateur
   */
  resetUserPassword(id: string): Observable<{ temporaryPassword: string }> {
    return this.http.post<{ temporaryPassword: string }>(`${this.apiUrl}/${id}/reset-password`, {});
  }

  /**
   * Exporte la liste des utilisateurs
   */
  exportUsers(format: 'csv' | 'excel' = 'csv', filters?: AdminFilters): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.role) params = params.set('role', filters.role);
      if (filters.status) params = params.set('status', filters.status);
    }

    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }
}