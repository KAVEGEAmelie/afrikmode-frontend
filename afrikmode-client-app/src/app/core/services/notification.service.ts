import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WebsocketService } from './websocket.service';
import { ApiService } from './api.service';

export interface Notification {
  id: string;
  type: 'order' | 'payment' | 'stock' | 'review' | 'message' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  icon?: string;
  time?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(
    private websocketService: WebsocketService,
    private apiService: ApiService
  ) {
    this.initializeWebSocketListeners();
  }

  private initializeWebSocketListeners(): void {
    // Écouter les notifications en temps réel
    this.websocketService.on('notification').pipe(
      catchError(error => {
        console.warn('WebSocket notification error:', error);
        return new Observable(subscriber => subscriber.complete());
      })
    ).subscribe((data: any) => {
      this.addNotification(data);
    });

    // Écouter les mises à jour de commandes
    this.websocketService.on('order_update').pipe(
      catchError(error => {
        console.warn('WebSocket order_update error:', error);
        return new Observable(subscriber => subscriber.complete());
      })
    ).subscribe((data: any) => {
      this.addNotification({
        id: `order_${data.orderId}_${Date.now()}`,
        type: 'order',
        title: 'Commande mise à jour',
        message: `Commande #${data.orderNumber} - ${data.status}`,
        data: data,
        read: false,
        createdAt: new Date().toISOString(),
        priority: 'medium'
      });
    });

    // Écouter les nouveaux paiements
    this.websocketService.on('payment_received').pipe(
      catchError(error => {
        console.warn('WebSocket payment_received error:', error);
        return new Observable(subscriber => subscriber.complete());
      })
    ).subscribe((data: any) => {
      this.addNotification({
        id: `payment_${data.paymentId}_${Date.now()}`,
        type: 'payment',
        title: 'Paiement reçu',
        message: `Paiement de ${data.amount} FCFA confirmé`,
        data: data,
        read: false,
        createdAt: new Date().toISOString(),
        priority: 'high'
      });
    });

    // Écouter les alertes de stock
    this.websocketService.on('stock_alert').pipe(
      catchError(error => {
        console.warn('WebSocket stock_alert error:', error);
        return new Observable(subscriber => subscriber.complete());
      })
    ).subscribe((data: any) => {
      this.addNotification({
        id: `stock_${data.productId}_${Date.now()}`,
        type: 'stock',
        title: 'Stock faible',
        message: `Produit "${data.productName}" - Stock: ${data.stock} unités`,
        data: data,
        read: false,
        createdAt: new Date().toISOString(),
        priority: 'urgent'
      });
    });

    // Écouter les nouveaux avis
    this.websocketService.on('new_review').pipe(
      catchError(error => {
        console.warn('WebSocket new_review error:', error);
        return new Observable(subscriber => subscriber.complete());
      })
    ).subscribe((data: any) => {
      this.addNotification({
        id: `review_${data.reviewId}_${Date.now()}`,
        type: 'review',
        title: 'Nouvel avis client',
        message: `Avis ${data.rating} étoiles pour "${data.productName}"`,
        data: data,
        read: false,
        createdAt: new Date().toISOString(),
        priority: 'medium'
      });
    });

    // Écouter les nouveaux messages
    this.websocketService.on('chat_message').pipe(
      catchError(error => {
        console.warn('WebSocket chat_message error:', error);
        return new Observable(subscriber => subscriber.complete());
      })
    ).subscribe((data: any) => {
      this.addNotification({
        id: `message_${data.messageId}_${Date.now()}`,
        type: 'message',
        title: 'Nouveau message',
        message: `${data.senderName}: ${data.message}`,
        data: data,
        read: false,
        createdAt: new Date().toISOString(),
        priority: 'medium'
      });
    });
  }

  private addNotification(notification: Notification): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = [notification, ...currentNotifications];
    this.notificationsSubject.next(updatedNotifications);
    
    if (!notification.read) {
      this.updateUnreadCount();
    }
  }

  private updateUnreadCount(): void {
    const notifications = this.notificationsSubject.value;
    const unreadCount = notifications.filter(n => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  // Méthodes publiques
  getNotifications(): Observable<Notification[]> {
    return this.notifications$;
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$;
  }

  markAsRead(notificationId: string): void {
    const notifications = this.notificationsSubject.value;
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();
  }

  markAllAsRead(): void {
    const notifications = this.notificationsSubject.value;
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(updatedNotifications);
    this.unreadCountSubject.next(0);
  }

  removeNotification(notificationId: string): void {
    const notifications = this.notificationsSubject.value;
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();
  }

  clearAllNotifications(): void {
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
  }

  // Méthodes pour les notifications persistantes (API)
  getPersistentNotifications(): Observable<Notification[]> {
    return this.apiService.get<Notification[]>('vendor/notifications');
  }

  markPersistentNotificationAsRead(notificationId: string): Observable<any> {
    return this.apiService.put<any>(`vendor/notifications/${notificationId}/read`, {});
  }

  markAllPersistentNotificationsAsRead(): Observable<any> {
    return this.apiService.put<any>('vendor/notifications/read-all', {});
  }

  // Méthodes pour créer des notifications personnalisées
  createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): void {
    const newNotification: Notification = {
      ...notification,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    this.addNotification(newNotification);
  }

  // Méthodes pour les notifications système
  showSuccess(message: string, title: string = 'Succès'): void {
    this.createNotification({
      type: 'system',
      title,
      message,
      read: false,
      priority: 'low'
    });
  }

  showError(message: string, title: string = 'Erreur'): void {
    this.createNotification({
      type: 'system',
      title,
      message,
      read: false,
      priority: 'high'
    });
  }

  showWarning(message: string, title: string = 'Attention'): void {
    this.createNotification({
      type: 'system',
      title,
      message,
      read: false,
      priority: 'medium'
    });
  }

  showInfo(message: string, title: string = 'Information'): void {
    this.createNotification({
      type: 'system',
      title,
      message,
      read: false,
      priority: 'low'
    });
  }
}