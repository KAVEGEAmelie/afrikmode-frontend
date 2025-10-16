// src/app/core/services/user.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import { 
  User, 
  UserProfile, 
  UserPreferences,
  UpdateProfileRequest,
  UserActivity,
  PaginatedResponse,
  Address
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService {

  getProfile(): Observable<User> {
    return this.get<User>('/users/profile');
  }

  updateProfile(data: UpdateProfileRequest): Observable<User> {
    return this.put<User>('/users/profile', data);
  }

  updatePreferences(preferences: Partial<UserPreferences>): Observable<UserPreferences> {
    return this.put<UserPreferences>('/users/preferences', preferences);
  }

  getPreferences(): Observable<UserPreferences> {
    return this.get<UserPreferences>('/users/preferences');
  }

  uploadAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.upload('/users/avatar', formData);
  }

  removeAvatar(): Observable<any> {
    return this.delete('/users/avatar');
  }

  // Statistiques utilisateur
  getStats(): Observable<any> {
    return this.get('/users/stats');
  }

  // Activité utilisateur
  getActivity(params?: any): Observable<PaginatedResponse<UserActivity>> {
    return this.get<PaginatedResponse<UserActivity>>('/users/activity', params);
  }

  // Sessions utilisateur
  getSessions(): Observable<any[]> {
    return this.get<any[]>('/users/sessions');
  }

  revokeSession(sessionId: string): Observable<any> {
    return this.delete(`/users/sessions/${sessionId}`);
  }

  revokeAllSessions(): Observable<any> {
    return this.delete('/users/sessions/all');
  }

  // Notifications
  getNotifications(params?: any): Observable<any> {
    return this.get('/users/notifications', params);
  }

  markNotificationAsRead(notificationId: string): Observable<any> {
    return this.put(`/users/notifications/${notificationId}/read`, {});
  }

  markAllNotificationsAsRead(): Observable<any> {
    return this.put('/users/notifications/mark-all-read', {});
  }

  // Wishlist / Favoris
  getWishlist(params?: any): Observable<any> {
    return this.get('/users/wishlist', params);
  }

  addToWishlist(productId: string): Observable<any> {
    return this.post('/users/wishlist', { product_id: productId });
  }

  removeFromWishlist(productId: string): Observable<any> {
    return this.delete(`/users/wishlist/${productId}`);
  }

  isInWishlist(productId: string): Observable<boolean> {
    return this.get<boolean>(`/users/wishlist/${productId}/check`);
  }

  // Export des données utilisateur (RGPD)
  exportData(): Observable<any> {
    return this.get('/users/export-data');
  }

  // Suppression de compte
  deleteAccount(password: string): Observable<any> {
    return this.post('/users/delete-account', { password });
  }

  requestAccountDeletion(reason?: string): Observable<any> {
    return this.post('/users/request-deletion', { reason });
  }
}