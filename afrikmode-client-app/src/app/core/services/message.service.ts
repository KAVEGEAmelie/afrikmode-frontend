import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WebsocketService } from './websocket.service';
import { ApiService } from './api.service';

export interface Message {
  id: number | string;
  conversation_id: number;
  sender_id: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  recipientId?: string;
  content?: string;
  message: string;
  type?: 'text' | 'image' | 'file' | 'system';
  read?: boolean;
  is_read: boolean;
  attachments?: string[];
  createdAt?: string;
  created_at: string;
  updatedAt?: string;
}

export interface Conversation {
  id: number;
  subject: string;
  buyer_id: string;
  seller_id: string;
  product_id?: number;
  product_name?: string;
  product_image?: string;
  status: 'active' | 'closed' | 'archived';
  buyer_name?: string;
  seller_name?: string;
  buyer_avatar?: string;
  seller_avatar?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  participantId?: string;
  participantName?: string;
  participantAvatar?: string;
  lastMessage?: Message;
  unreadCount?: number;
  isOnline?: boolean;
  lastSeen?: string;
  read?: boolean;
  sender?: string;
  preview?: string;
  time?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  public conversations$ = this.conversationsSubject.asObservable();
  
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(
    private websocketService: WebsocketService,
    private apiService: ApiService
  ) {
    this.initializeWebSocketListeners();
  }

  private initializeWebSocketListeners(): void {
    // Écouter les nouveaux messages
    this.websocketService.on('chat_message').pipe(
      catchError(error => {
        console.warn('WebSocket chat_message error:', error);
        return new Observable(subscriber => subscriber.complete());
      })
    ).subscribe((data: any) => {
      this.handleNewMessage(data);
    });

    // Écouter les mises à jour de statut de lecture
    this.websocketService.on('message_read').pipe(
      catchError(error => {
        console.warn('WebSocket message_read error:', error);
        return new Observable(subscriber => subscriber.complete());
      })
    ).subscribe((data: any) => {
      this.handleMessageRead(data);
    });

    // Écouter les statuts en ligne
    this.websocketService.on('user_online').pipe(
      catchError(error => {
        console.warn('WebSocket user_online error:', error);
        return new Observable(subscriber => subscriber.complete());
      })
    ).subscribe((data: any) => {
      this.handleUserOnline(data);
    });

    this.websocketService.on('user_offline').pipe(
      catchError(error => {
        console.warn('WebSocket user_offline error:', error);
        return new Observable(subscriber => subscriber.complete());
      })
    ).subscribe((data: any) => {
      this.handleUserOffline(data);
    });
  }

  private handleNewMessage(data: any): void {
    const message: Message = {
      id: data.messageId || data.id,
      conversation_id: data.conversation_id || data.conversationId,
      sender_id: data.senderId || data.sender_id,
      senderId: data.senderId,
      senderName: data.senderName,
      senderAvatar: data.senderAvatar,
      recipientId: data.recipientId,
      content: data.content || data.message,
      message: data.message || data.content,
      type: data.type || 'text',
      read: data.read || false,
      is_read: data.is_read || data.read || false,
      attachments: data.attachments || [],
      createdAt: data.createdAt || new Date().toISOString(),
      created_at: data.created_at || data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString()
    };

    // Ajouter le message à la liste
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, message]);

    // Mettre à jour la conversation
    this.updateConversation(message);
  }

  private handleMessageRead(data: any): void {
    const messages = this.messagesSubject.value;
    const updatedMessages = messages.map(msg => 
      msg.id === data.messageId ? { ...msg, read: true } : msg
    );
    this.messagesSubject.next(updatedMessages);
  }

  private handleUserOnline(data: any): void {
    const conversations = this.conversationsSubject.value;
    const updatedConversations = conversations.map(conv => 
      conv.participantId === data.userId ? { ...conv, isOnline: true } : conv
    );
    this.conversationsSubject.next(updatedConversations);
  }

  private handleUserOffline(data: any): void {
    const conversations = this.conversationsSubject.value;
    const updatedConversations = conversations.map(conv => 
      conv.participantId === data.userId ? { ...conv, isOnline: false, lastSeen: data.lastSeen } : conv
    );
    this.conversationsSubject.next(updatedConversations);
  }

  private updateConversation(message: Message): void {
    const conversations = this.conversationsSubject.value;
    const existingConvIndex = conversations.findIndex(conv => 
      conv.participantId === message.senderId
    );

    if (existingConvIndex >= 0) {
      // Mettre à jour la conversation existante
      const updatedConversations = [...conversations];
      const existingConv = updatedConversations[existingConvIndex];
      if (existingConv) {
        updatedConversations[existingConvIndex] = {
          ...existingConv,
          lastMessage: message,
          unreadCount: message.recipientId === this.getCurrentUserId() ? 
            (existingConv.unreadCount || 0) + 1 : 
            (existingConv.unreadCount || 0)
        };
      }
      this.conversationsSubject.next(updatedConversations);
    } else {
      // Créer une nouvelle conversation
      const newConversation: Conversation = {
        id: 0, // Sera remplacé par le backend
        subject: '',
        buyer_id: message.senderId || '',
        seller_id: message.recipientId || '',
        status: 'active',
        participantId: message.senderId,
        participantName: message.senderName,
        participantAvatar: message.senderAvatar,
        lastMessage: message,
        unreadCount: message.recipientId === this.getCurrentUserId() ? 1 : 0,
        unread_count: message.recipientId === this.getCurrentUserId() ? 1 : 0,
        isOnline: false
      };
      this.conversationsSubject.next([newConversation, ...conversations]);
    }

    this.updateUnreadCount();
  }

  private updateUnreadCount(): void {
    const conversations = this.conversationsSubject.value;
    const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || conv.unread_count || 0), 0);
    this.unreadCountSubject.next(totalUnread);
  }

  private getCurrentUserId(): string {
    // Récupérer l'ID de l'utilisateur actuel depuis le localStorage ou le service d'auth
    const user = localStorage.getItem('user');
    if (user) {
      try {
        return JSON.parse(user).id;
      } catch {
        return '';
      }
    }
    return '';
  }

  // Méthodes publiques
  getConversations(params?: any): Observable<any> {
    return this.apiService.get<any>('messages/conversations', params);
  }

  getConversation(conversationId: string): Observable<any> {
    return this.apiService.get<any>(`messages/conversations/${conversationId}`);
  }

  getMessages(conversationId: string): Observable<Message[]> {
    return this.apiService.get<Message[]>(`vendor/messages/conversations/${conversationId}`);
  }

  sendMessage(conversationId: string, content: string, attachments?: File[]): Observable<any> {
    const formData = new FormData();
    formData.append('message', content);
    
    if (attachments && attachments.length > 0) {
      attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });
    }

    return this.apiService.post<any>(`messages/conversations/${conversationId}/messages`, formData);
  }

  createConversation(data: { seller_id: number; product_id: number; subject: string; initial_message: string }): Observable<any> {
    return this.apiService.post<any>('messages/conversations', data);
  }

  closeConversation(conversationId: number): Observable<any> {
    return this.apiService.put<any>(`messages/conversations/${conversationId}/close`, {});
  }

  archiveConversation(conversationId: number): Observable<any> {
    return this.apiService.put<any>(`messages/conversations/${conversationId}/archive`, {});
  }

  markAsRead(messageId: string): Observable<any> {
    this.websocketService.send('mark_message_read', { messageId });
    return this.apiService.put<any>(`messages/${messageId}/read`, {});
  }

  markConversationAsRead(conversationId: number): Observable<any> {
    const conversations = this.conversationsSubject.value;
    const updatedConversations = conversations.map(conv => 
      conv.id === conversationId ? { ...conv, unreadCount: 0, unread_count: 0 } : conv
    );
    this.conversationsSubject.next(updatedConversations);
    this.updateUnreadCount();
    
    return this.apiService.put<any>(`messages/conversations/${conversationId}/read`, {});
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$;
  }

  // Méthodes API pour les messages persistants
  getPersistentConversations(): Observable<Conversation[]> {
    return this.apiService.get<Conversation[]>('vendor/messages/conversations');
  }

  getPersistentMessages(conversationId: string, page: number = 1, limit: number = 50): Observable<{ messages: Message[], total: number }> {
    return this.apiService.get<{ messages: Message[], total: number }>(`vendor/messages/conversations/${conversationId}`, {
      page,
      limit
    });
  }

  sendPersistentMessage(recipientId: string, content: string, type: 'text' | 'image' | 'file' = 'text'): Observable<Message> {
    return this.apiService.post<Message>('vendor/messages', {
      recipientId,
      content,
      type
    });
  }

  markPersistentMessageAsRead(messageId: string): Observable<any> {
    return this.apiService.put<any>(`vendor/messages/${messageId}/read`, {});
  }

  // Méthodes pour les conversations
  startConversation(participantId: string): Observable<Conversation> {
    return this.apiService.post<Conversation>('vendor/messages/conversations', {
      participantId
    });
  }

  deleteConversation(conversationId: string): Observable<any> {
    return this.apiService.delete<any>(`vendor/messages/conversations/${conversationId}`);
  }

  // Méthodes pour les fichiers
  uploadFile(file: File, conversationId: string): Observable<any> {
    return this.apiService.upload<any>(`vendor/messages/upload`, file, {
      conversationId
    });
  }

  // Méthodes pour les statuts
  setOnlineStatus(): void {
    this.websocketService.send('set_online_status', {});
  }

  setOfflineStatus(): void {
    this.websocketService.send('set_offline_status', {});
  }

  // Méthodes utilitaires
  formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) { // Moins d'une minute
      return 'À l\'instant';
    } else if (diff < 3600000) { // Moins d'une heure
      const minutes = Math.floor(diff / 60000);
      return `Il y a ${minutes} min`;
    } else if (diff < 86400000) { // Moins d'un jour
      const hours = Math.floor(diff / 3600000);
      return `Il y a ${hours}h`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  }

  isMessageFromCurrentUser(message: Message): boolean {
    return message.senderId === this.getCurrentUserId();
  }
}

