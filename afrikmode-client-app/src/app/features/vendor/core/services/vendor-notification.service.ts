import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../../../environments/environment';
import {
  VendorNotification,
  NotificationResponse,
  NotificationStats,
  NotificationFilter
} from '../models/notification.interface';

@Injectable({
  providedIn: 'root'
})
export class VendorNotificationService {
  private apiUrl = `${environment.apiUrl}/vendor/dashboard`;
  private socketUrl = environment.wsUrl || environment.apiUrl.replace('/api', '');

  private socket?: Socket;
  private notificationsSubject = new BehaviorSubject<VendorNotification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private connectedSubject = new BehaviorSubject<boolean>(false);

  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();
  public connected$ = this.connectedSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Initialiser la connexion WebSocket
   */
  initWebSocket(token: string): void {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    this.socket = io(`${this.socketUrl}/vendor-notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected to vendor notifications');
      this.connectedSubject.next(true);
      this.requestUnreadCount();
    });

    this.socket.on('connected', (data: any) => {
      console.log('WebSocket connection confirmed:', data);
    });

    this.socket.on('new_notification', (notification: VendorNotification) => {
      console.log('📬 New notification received:', notification);

      // Ajouter en haut de la liste
      const currentNotifications = this.notificationsSubject.value;
      this.notificationsSubject.next([notification, ...currentNotifications]);

      // Incrémenter le compteur si non lue
      if (notification.status === 'unread') {
        this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
      }
    });

    this.socket.on('unread_count', (data: { count: number }) => {
      console.log('📊 Unread count updated:', data.count);
      this.unreadCountSubject.next(data.count);
    });

    this.socket.on('notification_read', (data: { notificationId: string }) => {
      const notifications = this.notificationsSubject.value;
      const updated = notifications.map(n =>
        n.id === data.notificationId ? { ...n, status: 'read' as const } : n
      );
      this.notificationsSubject.next(updated);
      this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
    });

    this.socket.on('notification_deleted', (data: { notificationId: string }) => {
      const notifications = this.notificationsSubject.value;
      this.notificationsSubject.next(notifications.filter(n => n.id !== data.notificationId));
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      this.connectedSubject.next(false);
    });

    this.socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('WebSocket connection error:', error.message);
    });
  }

  /**
   * Déconnecter le WebSocket
   */
  disconnectWebSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
      this.connectedSubject.next(false);
    }
  }

  /**
   * Demander le compteur de notifications non lues
   */
  requestUnreadCount(): void {
    if (this.socket?.connected) {
      this.socket.emit('request_unread_count');
    }
  }

  /**
   * Marquer comme lue via WebSocket (sans appel API)
   */
  markAsReadViaSocket(notificationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('mark_as_read', notificationId);
    }
  }

  /**
   * Supprimer via WebSocket (sans appel API)
   */
  deleteViaSocket(notificationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('delete_notification', notificationId);
    }
  }

  /**
   * Récupérer les notifications (API REST)
   */
  getNotifications(filter?: NotificationFilter): Observable<NotificationResponse> {
    let params = new HttpParams();

    if (filter) {
      if (filter.limit) params = params.set('limit', filter.limit.toString());
      if (filter.offset) params = params.set('offset', filter.offset.toString());
      if (filter.unread_only) params = params.set('unread_only', 'true');
      if (filter.type) params = params.set('type', filter.type);
      if (filter.priority) params = params.set('priority', filter.priority);
      if (filter.store_id) params = params.set('store_id', filter.store_id);
    }

    return this.http.get<NotificationResponse>(`${this.apiUrl}/notifications`, { params })
      .pipe(
        tap(response => {
          if (response.success) {
            this.notificationsSubject.next(response.data);
            this.unreadCountSubject.next(response.pagination.unread);
          }
        })
      );
  }

  /**
   * Récupérer les statistiques
   */
  getStats(): Observable<{ success: boolean; data: NotificationStats }> {
    return this.http.get<{ success: boolean; data: NotificationStats }>(
      `${this.apiUrl}/notifications/stats`
    );
  }

  /**
   * Récupérer le compteur de non lues (API REST)
   */
  getUnreadCount(): Observable<{ success: boolean; data: { count: number } }> {
    return this.http.get<{ success: boolean; data: { count: number } }>(
      `${this.apiUrl}/notifications/unread-count`
    ).pipe(
      tap(response => {
        if (response.success) {
          this.unreadCountSubject.next(response.data.count);
        }
      })
    );
  }

  /**
   * Marquer une notification comme lue (API REST)
   */
  markAsRead(notificationId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/${notificationId}/read`, {})
      .pipe(
        tap(() => {
          const notifications = this.notificationsSubject.value;
          const updated = notifications.map(n =>
            n.id === notificationId ? { ...n, status: 'read' as const, read_at: new Date().toISOString() } : n
          );
          this.notificationsSubject.next(updated);
          this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
        })
      );
  }

  /**
   * Marquer toutes comme lues (API REST)
   */
  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/read-all`, {})
      .pipe(
        tap(() => {
          const notifications = this.notificationsSubject.value;
          const updated = notifications.map(n => ({ ...n, status: 'read' as const, read_at: new Date().toISOString() }));
          this.notificationsSubject.next(updated);
          this.unreadCountSubject.next(0);
        })
      );
  }

  /**
   * Archiver une notification
   */
  archive(notificationId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/${notificationId}/archive`, {})
      .pipe(
        tap(() => {
          const notifications = this.notificationsSubject.value;
          const updated = notifications.map(n =>
            n.id === notificationId ? { ...n, status: 'archived' as const, archived_at: new Date().toISOString() } : n
          );
          this.notificationsSubject.next(updated);
        })
      );
  }

  /**
   * Supprimer une notification (API REST)
   */
  delete(notificationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/notifications/${notificationId}`)
      .pipe(
        tap(() => {
          const notifications = this.notificationsSubject.value;
          const notification = notifications.find(n => n.id === notificationId);

          this.notificationsSubject.next(notifications.filter(n => n.id !== notificationId));

          if (notification?.status === 'unread') {
            this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
          }
        })
      );
  }

  /**
   * Reset du service
   */
  reset(): void {
    this.disconnectWebSocket();
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
    this.connectedSubject.next(false);
  }

  /**
   * Obtenir le statut de connexion
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}
