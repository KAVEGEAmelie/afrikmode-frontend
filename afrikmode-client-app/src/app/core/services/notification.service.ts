// src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Notification, NotificationPreferences, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = 'http://localhost:5000/api';
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUnreadCount();
  }

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

  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return httpParams;
  }

  private loadUnreadCount(): void {
    this.getUnreadCount().subscribe({
      next: (response: any) => {
        const count = response.count || response.data?.count || 0;
        this.unreadCountSubject.next(count);
      },
      error: () => this.unreadCountSubject.next(0)
    });
  }

  getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
    is_read?: boolean;
  }): Observable<PaginatedResponse<Notification>> {
    return this.http.get<PaginatedResponse<Notification>>(`${this.baseUrl}/notifications`, {
      headers: this.getHeaders(),
      params: params ? this.buildParams(params) : undefined
    });
  }

  getNotification(id: string): Observable<Notification> {
    return this.http.get<Notification>(`${this.baseUrl}/notifications/${id}`, {
      headers: this.getHeaders()
    });
  }

  markAsRead(id: string): Observable<Notification> {
    return this.http.put<Notification>(`${this.baseUrl}/notifications/${id}/read`, {}, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.loadUnreadCount())
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.baseUrl}/notifications/mark-all-read`, {}, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.unreadCountSubject.next(0))
    );
  }

  deleteNotification(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/notifications/${id}`, {
      headers: this.getHeaders()
    });
  }

  deleteAllNotifications(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/notifications/all`, {
      headers: this.getHeaders()
    });
  }

  getUnreadCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/notifications/unread-count`, {
      headers: this.getHeaders()
    });
  }

  getPreferences(): Observable<NotificationPreferences> {
    return this.http.get<NotificationPreferences>(`${this.baseUrl}/notifications/preferences`, {
      headers: this.getHeaders()
    });
  }

  updatePreferences(preferences: Partial<NotificationPreferences>): Observable<NotificationPreferences> {
    return this.http.put<NotificationPreferences>(`${this.baseUrl}/notifications/preferences`, preferences, {
      headers: this.getHeaders()
    });
  }

  subscribeToPush(subscription: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/notifications/push/subscribe`, subscription, {
      headers: this.getHeaders()
    });
  }

  unsubscribeFromPush(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/notifications/push/unsubscribe`, {
      headers: this.getHeaders()
    });
  }

  registerFCMToken(token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/notifications/fcm/register`, { token }, {
      headers: this.getHeaders()
    });
  }

  unregisterFCMToken(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/notifications/fcm/unregister`, {
      headers: this.getHeaders()
    });
  }

  getCurrentUnreadCount(): number {
    return this.unreadCountSubject.value;
  }

  refreshUnreadCount(): void {
    this.loadUnreadCount();
  }
}