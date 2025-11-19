// src/app/core/services/websocket.service.ts
import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private baseUrl = 'http://localhost:3001';
  private socket: Socket | null = null;
  private messageSubject = new Subject<WebSocketMessage>();
  public messages$ = this.messageSubject.asObservable();
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  constructor() {}

  /**
   * Se connecter au WebSocket
   */
  connect(): void {
    if (this.socket?.connected) {
      console.log('WebSocket déjà connecté');
      return;
    }

    const token = localStorage.getItem('auth_token');
    
    // Ne pas se connecter si pas de token
    if (!token) {
      console.warn('⚠️ Pas de token d\'authentification, WebSocket non connecté');
      return;
    }
    
    this.socket = io(this.baseUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    });

    this.setupListeners();
  }

  /**
   * Configurer les écouteurs d'événements
   */
  private setupListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connecté', this.socket?.id);
      this.connectionStatusSubject.next(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket déconnecté:', reason);
      this.connectionStatusSubject.next(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erreur de connexion WebSocket:', error);
      this.connectionStatusSubject.next(false);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 WebSocket reconnecté après', attemptNumber, 'tentatives');
      this.connectionStatusSubject.next(true);
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Tentative de reconnexion', attemptNumber);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Échec de reconnexion WebSocket');
      this.connectionStatusSubject.next(false);
    });

    // Événements métier
    this.socket.on('message', (data: any) => {
      this.messageSubject.next({
        type: 'message',
        data: data,
        timestamp: new Date()
      });
    });

    this.socket.on('notification', (data: any) => {
      this.messageSubject.next({
        type: 'notification',
        data: data,
        timestamp: new Date()
      });
    });

    this.socket.on('order_update', (data: any) => {
      this.messageSubject.next({
        type: 'order_update',
        data: data,
        timestamp: new Date()
      });
    });

    this.socket.on('chat_message', (data: any) => {
      this.messageSubject.next({
        type: 'chat_message',
        data: data,
        timestamp: new Date()
      });
    });

    this.socket.on('cart_updated', (data: any) => {
      this.messageSubject.next({
        type: 'cart_updated',
        data: data,
        timestamp: new Date()
      });
    });

    this.socket.on('price_update', (data: any) => {
      this.messageSubject.next({
        type: 'price_update',
        data: data,
        timestamp: new Date()
      });
    });

    this.socket.on('stock_update', (data: any) => {
      this.messageSubject.next({
        type: 'stock_update',
        data: data,
        timestamp: new Date()
      });
    });
  }

  /**
   * Se déconnecter
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatusSubject.next(false);
      console.log('WebSocket déconnecté manuellement');
    }
  }

  /**
   * Envoyer un message
   */
  send(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket non connecté. Impossible d\'envoyer le message.');
    }
  }

  /**
   * S'abonner à un événement spécifique
   */
  on(event: string): Observable<any> {
    return new Observable(observer => {
      // Si le socket n'est pas encore initialisé, essayer de se connecter
      if (!this.socket) {
        this.connect();
      }

      let cleanup: (() => void) | null = null;
      let connectionSub: any = null;
      let timeout: any = null;

      // Fonction pour configurer l'écouteur
      const setupListener = (): (() => void) => {
        if (this.socket) {
          const handler = (data: any) => {
            observer.next(data);
          };
          
          this.socket.on(event, handler);

          return () => {
            if (this.socket) {
              this.socket.off(event, handler);
            }
          };
        }
        return () => {};
      };

      // Si le socket est déjà connecté, configurer immédiatement
      if (this.socket?.connected) {
        cleanup = setupListener();
      } else {
        // Sinon, attendre la connexion
        connectionSub = this.connectionStatus$.subscribe(connected => {
          if (connected && this.socket) {
            cleanup = setupListener();
            if (connectionSub) {
              connectionSub.unsubscribe();
              connectionSub = null;
            }
            if (timeout) {
              clearTimeout(timeout);
              timeout = null;
            }
          }
        });

        // Timeout pour éviter une attente infinie
        timeout = setTimeout(() => {
          if (connectionSub) {
            connectionSub.unsubscribe();
            connectionSub = null;
          }
          if (!this.socket?.connected) {
            console.warn(`WebSocket non connecté pour l'événement ${event}. L'écouteur sera configuré lors de la connexion.`);
          }
        }, 5000);
      }

      // Fonction de cleanup
      return () => {
        if (cleanup) {
          cleanup();
        }
        if (connectionSub) {
          connectionSub.unsubscribe();
        }
        if (timeout) {
          clearTimeout(timeout);
        }
      };
    });
  }

  /**
   * Se désabonner d'un événement
   */
  off(event: string): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  /**
   * Rejoindre un salon (room)
   */
  joinRoom(room: string): void {
    this.send('join_room', { room });
  }

  /**
   * Quitter un salon
   */
  leaveRoom(room: string): void {
    this.send('leave_room', { room });
  }

  /**
   * Envoyer un message de chat
   */
  sendChatMessage(message: string, recipientId: string): void {
    this.send('chat_message', {
      message,
      recipient_id: recipientId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Vérifier si le socket est connecté
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Obtenir le statut de connexion
   */
  getConnectionStatus(): boolean {
    return this.connectionStatusSubject.value;
  }

  /**
   * Forcer une reconnexion
   */
  reconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket.connect();
    } else {
      this.connect();
    }
  }
}