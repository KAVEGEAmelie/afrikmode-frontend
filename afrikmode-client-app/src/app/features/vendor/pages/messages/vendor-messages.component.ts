import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { io, Socket } from 'socket.io-client';
import { VendorService } from '../../../../core/services/vendor.service';

interface Conversation {
  id: string;
  customer: {
    name: string;
    avatar?: string;
    email: string;
    phone?: string;
  };
  lastMessage: {
    content: string;
    timestamp: Date;
    isFromCustomer: boolean;
    isRead: boolean;
  };
  unreadCount: number;
  status: 'active' | 'archived' | 'spam';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isFromCustomer: boolean;
  isRead: boolean;
  conversationId?: string;
  attachments?: {
    name: string;
    type: string;
    url: string;
  }[];
}

interface QuickReply {
  id: string;
  title: string;
  content: string;
  category: string;
}

@Component({
  selector: 'app-vendor-messages',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatChipsModule,
    MatBadgeModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="vendor-messages">
      <!-- Header -->
      <div class="messages-header">
        <div class="header-content">
          <h1>
            <mat-icon>chat</mat-icon>
            Messages Clients
          </h1>
          <p>Gérez vos conversations avec vos clients</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="markAllAsRead()">
            <mat-icon>mark_email_read</mat-icon>
            Tout marquer comme lu
          </button>
          <button mat-raised-button (click)="openSettings()">
            <mat-icon>settings</mat-icon>
            Paramètres
          </button>
        </div>
      </div>

      <div class="messages-content">
        <!-- Sidebar des conversations -->
        <div class="conversations-sidebar">
          <div class="sidebar-header">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Rechercher une conversation</mat-label>
              <input matInput [(ngModel)]="searchQuery" (input)="filterConversations()">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>

          <div class="conversation-filters">
            <mat-chip-listbox>
              <mat-chip-option 
                [selected]="selectedFilter === 'all'"
                (click)="setFilter('all')">
                Toutes ({{ totalConversations }})
              </mat-chip-option>
              <mat-chip-option 
                [selected]="selectedFilter === 'unread'"
                (click)="setFilter('unread')">
                Non lues ({{ unreadCount }})
              </mat-chip-option>
              <mat-chip-option 
                [selected]="selectedFilter === 'high'"
                (click)="setFilter('high')">
                Priorité haute ({{ highPriorityCount }})
              </mat-chip-option>
              <mat-chip-option 
                [selected]="selectedFilter === 'archived'"
                (click)="setFilter('archived')">
                Archivées ({{ archivedCount }})
              </mat-chip-option>
            </mat-chip-listbox>
          </div>

          <div class="conversations-list">
            @for (conversation of filteredConversations; track conversation.id) {
              <div 
                class="conversation-item"
                [class.active]="selectedConversation?.id === conversation.id"
                [class.unread]="conversation.unreadCount > 0"
                (click)="selectConversation(conversation)">
                
                <div class="conversation-avatar">
                  @if (conversation.customer.avatar) {
                    <img [src]="conversation.customer.avatar" [alt]="conversation.customer.name">
                  } @else {
                    <mat-icon>person</mat-icon>
                  }
                  @if (conversation.unreadCount > 0) {
                    <div class="unread-badge">
                      <span class="badge-count">{{ conversation.unreadCount }}</span>
                    </div>
                  }
                </div>

                <div class="conversation-info">
                  <div class="conversation-header">
                    <span class="customer-name">{{ conversation.customer.name }}</span>
                    <span class="conversation-time">{{ formatTime(conversation.lastMessage.timestamp) }}</span>
                  </div>
                  
                  <div class="conversation-preview">
                    <span class="message-preview" [class.unread]="!conversation.lastMessage.isRead">
                      {{ conversation.lastMessage.content }}
                    </span>
                    @if (conversation.priority === 'high') {
                      <mat-icon class="priority-icon" color="warn">priority_high</mat-icon>
                    }
                  </div>

                  <div class="conversation-tags">
                    @for (tag of conversation.tags; track tag) {
                      <mat-chip class="tag-chip">{{ tag }}</mat-chip>
                    }
                  </div>
                </div>

                <div class="conversation-actions">
                  <button 
                    mat-icon-button 
                    [matMenuTriggerFor]="conversationMenu"
                    (click)="$event.stopPropagation()">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  
                  <mat-menu #conversationMenu="matMenu">
                    <button mat-menu-item (click)="archiveConversation(conversation)">
                      <mat-icon>archive</mat-icon>
                      Archiver
                    </button>
                    <button mat-menu-item (click)="markAsSpam(conversation)">
                      <mat-icon>report</mat-icon>
                      Marquer comme spam
                    </button>
                    <button mat-menu-item (click)="deleteConversation(conversation)">
                      <mat-icon>delete</mat-icon>
                      Supprimer
                    </button>
                  </mat-menu>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Zone de chat -->
        <div class="chat-area">
          @if (selectedConversation) {
            <!-- Header de la conversation -->
            <div class="chat-header">
              <div class="chat-customer-info">
                <div class="customer-avatar">
                  @if (selectedConversation.customer.avatar) {
                    <img [src]="selectedConversation.customer.avatar" [alt]="selectedConversation.customer.name">
                  } @else {
                    <mat-icon>person</mat-icon>
                  }
                </div>
                <div class="customer-details">
                  <h3>{{ selectedConversation.customer.name }}</h3>
                  <p>{{ selectedConversation.customer.email }}</p>
                  @if (selectedConversation.customer.phone) {
                    <p>{{ selectedConversation.customer.phone }}</p>
                  }
                </div>
              </div>
              <div class="chat-actions">
                <button mat-icon-button [matTooltip]="'Appeler le client'">
                  <mat-icon>phone</mat-icon>
                </button>
                <button mat-icon-button [matTooltip]="'Voir le profil'">
                  <mat-icon>person</mat-icon>
                </button>
                <button mat-icon-button [matMenuTriggerFor]="chatMenu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                
                <mat-menu #chatMenu="matMenu">
                  <button mat-menu-item (click)="archiveConversation(selectedConversation)">
                    <mat-icon>archive</mat-icon>
                    Archiver
                  </button>
                  <button mat-menu-item (click)="markAsSpam(selectedConversation)">
                    <mat-icon>report</mat-icon>
                    Marquer comme spam
                  </button>
                </mat-menu>
              </div>
            </div>

            <!-- Messages -->
            <div class="messages-container" #messagesContainer>
              @for (message of selectedConversationMessages; track message.id) {
                <div class="message-item" [class.from-customer]="message.isFromCustomer" [class.from-vendor]="!message.isFromCustomer">
                  <div class="message-avatar">
                    @if (message.isFromCustomer) {
                      @if (selectedConversation.customer.avatar) {
                        <img [src]="selectedConversation.customer.avatar" [alt]="selectedConversation.customer.name">
                      } @else {
                        <mat-icon>person</mat-icon>
                      }
                    } @else {
                      <mat-icon>storefront</mat-icon>
                    }
                  </div>
                  
                  <div class="message-content">
                    <div class="message-bubble">
                      <p>{{ message.content }}</p>
                      @if (message.attachments && message.attachments.length > 0) {
                        <div class="message-attachments">
                          @for (attachment of message.attachments; track attachment.name) {
                            <div class="attachment-item">
                              <mat-icon>{{ getAttachmentIcon(attachment.type) }}</mat-icon>
                              <span>{{ attachment.name }}</span>
                              <button mat-icon-button (click)="downloadAttachment(attachment)">
                                <mat-icon>download</mat-icon>
                              </button>
                            </div>
                          }
                        </div>
                      }
                    </div>
                    <div class="message-meta">
                      <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                      @if (!message.isFromCustomer) {
                        <span class="message-status">
                          @if (message.isRead) {
                            <mat-icon>done_all</mat-icon>
                          } @else {
                            <mat-icon>done</mat-icon>
                          }
                        </span>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Zone de saisie -->
            <div class="message-input-area">
              <div class="quick-replies">
                <button 
                  mat-stroked-button 
                  *ngFor="let reply of quickReplies" 
                  (click)="useQuickReply(reply)"
                  class="quick-reply-btn">
                  {{ reply.title }}
                </button>
              </div>
              
              <div class="input-container">
                <mat-form-field appearance="outline" class="message-input">
                  <mat-label>Tapez votre message...</mat-label>
                  <textarea 
                    matInput 
                    [(ngModel)]="newMessage"
                    (keydown.enter)="onKeyPress($event)"
                    rows="3"
                    maxlength="1000">
                  </textarea>
                  <mat-hint align="end">{{ newMessage.length }}/1000</mat-hint>
                </mat-form-field>
                
                <div class="input-actions">
                  <button mat-icon-button (click)="attachFile()" [matTooltip]="'Joindre un fichier'">
                    <mat-icon>attach_file</mat-icon>
                  </button>
                  <button mat-icon-button (click)="attachImage()" [matTooltip]="'Joindre une image'">
                    <mat-icon>image</mat-icon>
                  </button>
                  <button 
                    mat-raised-button 
                    color="primary" 
                    (click)="sendMessage()"
                    [disabled]="!newMessage.trim()">
                    <mat-icon>send</mat-icon>
                    Envoyer
                  </button>
                </div>
              </div>
            </div>
          } @else {
            <!-- État vide -->
            <div class="empty-state">
              <mat-icon>chat_bubble_outline</mat-icon>
              <h2>Sélectionnez une conversation</h2>
              <p>Choisissez une conversation dans la liste pour commencer à échanger avec vos clients</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vendor-messages {
      background: #f8fafc;
      min-height: 100vh;
    }

    .messages-header {
      background: linear-gradient(135deg, #8B2E2E 0%, #6B1F1F 100%);
      color: white;
      padding: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-content h1 {
      font-size: 2rem;
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-content h1 mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .header-content p {
      margin: 0;
      opacity: 0.9;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .messages-content {
      display: flex;
      height: calc(100vh - 200px);
    }

    .conversations-sidebar {
      width: 400px;
      background: white;
      border-right: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
    }

    .sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .search-field {
      width: 100%;
    }

    .conversation-filters {
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .conversations-list {
      flex: 1;
      overflow-y: auto;
    }

    .conversation-item {
      display: flex;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #f3f4f6;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    }

    .conversation-item:hover {
      background: #f9fafb;
    }

    .conversation-item.active {
      background: #fef3f2;
      border-left: 4px solid #8B2E2E;
    }

    .conversation-item.unread {
      background: #fef3f2;
      font-weight: 600;
    }

    .conversation-avatar {
      position: relative;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      overflow: hidden;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
    }

    .conversation-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .conversation-avatar mat-icon {
      font-size: 1.5rem;
      color: #6b7280;
    }

    .conversation-info {
      flex: 1;
      min-width: 0;
    }

    .conversation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.25rem;
    }

    .customer-name {
      font-weight: 600;
      color: #1f2937;
      font-size: 0.9rem;
    }

    .conversation-time {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .conversation-preview {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .message-preview {
      font-size: 0.85rem;
      color: #6b7280;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    .message-preview.unread {
      color: #1f2937;
      font-weight: 600;
    }

    .priority-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .conversation-tags {
      display: flex;
      gap: 0.25rem;
      flex-wrap: wrap;
    }

    .tag-chip {
      font-size: 0.7rem;
      height: 20px;
      background: #f3f4f6;
      color: #6b7280;
    }

    .conversation-actions {
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .conversation-item:hover .conversation-actions {
      opacity: 1;
    }

    .chat-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: white;
    }

    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .chat-customer-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .customer-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      overflow: hidden;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .customer-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .customer-avatar mat-icon {
      font-size: 1.5rem;
      color: #6b7280;
    }

    .customer-details h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1.1rem;
      color: #1f2937;
    }

    .customer-details p {
      margin: 0;
      font-size: 0.85rem;
      color: #6b7280;
    }

    .chat-actions {
      display: flex;
      gap: 0.5rem;
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .message-item {
      display: flex;
      gap: 0.75rem;
      max-width: 70%;
    }

    .message-item.from-customer {
      align-self: flex-start;
    }

    .message-item.from-vendor {
      align-self: flex-end;
      flex-direction: row-reverse;
    }

    .message-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .message-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .message-avatar mat-icon {
      font-size: 1.2rem;
      color: #6b7280;
    }

    .message-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .message-bubble {
      background: #f3f4f6;
      padding: 0.75rem 1rem;
      border-radius: 18px;
      max-width: 100%;
    }

    .message-item.from-vendor .message-bubble {
      background: linear-gradient(135deg, #8B2E2E, #D9744F);
      color: white;
    }

    .message-bubble p {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .message-attachments {
      margin-top: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .attachment-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      font-size: 0.8rem;
    }

    .message-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: #6b7280;
      margin-left: 0.5rem;
    }

    .message-item.from-vendor .message-meta {
      justify-content: flex-end;
    }

    .message-status mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .message-input-area {
      border-top: 1px solid #e5e7eb;
      padding: 1rem;
      background: #f9fafb;
    }

    .quick-replies {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .quick-reply-btn {
      font-size: 0.8rem;
      height: 32px;
    }

    .input-container {
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .message-input {
      flex: 1;
    }

    .unread-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #f44336;
      color: white;
      border-radius: 50%;
      min-width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      z-index: 1;
    }

    .badge-count {
      padding: 0 6px;
    }

    .input-actions {
      display: flex;
      gap: 0.25rem;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #6b7280;
      text-align: center;
    }

    .empty-state mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h2 {
      margin: 0 0 0.5rem 0;
      color: #374151;
    }

    .empty-state p {
      margin: 0;
      max-width: 400px;
    }

    @media (max-width: 768px) {
      .messages-content {
        flex-direction: column;
        height: auto;
      }

      .conversations-sidebar {
        width: 100%;
        height: 300px;
      }

      .message-item {
        max-width: 85%;
      }
    }
  `]
})
export class VendorMessagesComponent implements OnInit, OnDestroy {
  searchQuery: string = '';
  selectedFilter: string = 'all';
  selectedConversation: Conversation | null = null;
  selectedConversationMessages: Message[] = [];
  errorMessage: string | null = null;
  newMessage: string = '';
  private socket: Socket | null = null;

  conversations: Conversation[] = [
    {
      id: '1',
      customer: {
        name: 'Marie Kouassi',
        avatar: '/assets/images/avatars/marie.jpg',
        email: 'marie.kouassi@email.com',
        phone: '+228 90 12 34 56'
      },
      lastMessage: {
        content: 'Bonjour, j\'aimerais savoir si vous avez cette robe en taille M',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        isFromCustomer: true,
        isRead: false
      },
      unreadCount: 2,
      status: 'active',
      priority: 'high',
      tags: ['nouveau client', 'commande']
    },
    {
      id: '2',
      customer: {
        name: 'Jean Dupont',
        email: 'jean.dupont@email.com'
      },
      lastMessage: {
        content: 'Merci pour votre aide, la commande est parfaite !',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        isFromCustomer: true,
        isRead: true
      },
      unreadCount: 0,
      status: 'active',
      priority: 'medium',
      tags: ['client fidèle']
    },
    {
      id: '3',
      customer: {
        name: 'Fatou Diallo',
        email: 'fatou.diallo@email.com',
        phone: '+228 91 23 45 67'
      },
      lastMessage: {
        content: 'Quand sera disponible la livraison ?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
        isFromCustomer: true,
        isRead: false
      },
      unreadCount: 1,
      status: 'active',
      priority: 'medium',
      tags: ['livraison']
    }
  ];

  filteredConversations: Conversation[] = [];

  quickReplies: QuickReply[] = [
    {
      id: '1',
      title: 'Salutation',
      content: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
      category: 'général'
    },
    {
      id: '2',
      title: 'Disponibilité',
      content: 'Ce produit est actuellement en stock et sera expédié sous 24h.',
      category: 'stock'
    },
    {
      id: '3',
      title: 'Livraison',
      content: 'La livraison se fait sous 2-3 jours ouvrés dans toute la région.',
      category: 'livraison'
    },
    {
      id: '4',
      title: 'Retour',
      content: 'Vous avez 14 jours pour retourner un article non conforme.',
      category: 'retour'
    }
  ];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private vendorService: VendorService
  ) {}

  ngOnInit(): void {
    this.filteredConversations = this.conversations;
    this.loadMessagesFromAPI(); // Charger depuis le backend
    this.initializeSocket();
  }

  loadMessagesFromAPI(): void {
    // Charger les conversations depuis l'API
    this.vendorService.getMessages().subscribe({
      next: (response) => {
        if (response && response.conversations) {
          this.conversations = response.conversations;
          this.filteredConversations = this.conversations;
          console.log('✅ Messages chargés depuis l\'API:', this.conversations.length);
        }
      },
      error: (error: any) => {
        console.error('❌ Erreur chargement messages:', error);
        this.errorMessage = 'Erreur lors du chargement des conversations. Veuillez réessayer.';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  initializeSocket(): void {
    // Connexion Socket.io pour les messages temps réel
    this.socket = io('http://localhost:3000', {
      auth: {
        token: localStorage.getItem('token'), // Token d'authentification
        userType: 'vendor'
      }
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connecté au serveur de messagerie');
    });

    this.socket.on('newMessage', (message: Message) => {
      console.log('💬 Nouveau message reçu:', message);
      this.handleNewMessage(message);
    });

    this.socket.on('messageRead', (data: { conversationId: string, messageId: string }) => {
      console.log('✅ Message lu:', data);
      this.handleMessageRead(data);
    });

    this.socket.on('typing', (data: { conversationId: string, isTyping: boolean, customerName: string }) => {
      console.log('⌨️ Client en train de taper:', data);
      this.handleTyping(data);
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Déconnecté du serveur de messagerie');
    });
  }

  handleNewMessage(message: Message): void {
    // Trouver la conversation correspondante
    const conversation = this.conversations.find(c => c.id === message.conversationId);
    if (conversation) {
      // Ajouter le message à la conversation
      conversation.lastMessage = {
        content: message.content,
        timestamp: message.timestamp,
        isFromCustomer: message.isFromCustomer,
        isRead: false
      };
      
      // Si c'est la conversation sélectionnée, ajouter le message
      if (this.selectedConversation?.id === conversation.id) {
        this.selectedConversationMessages.push(message);
        this.scrollToBottom();
      } else {
        // Incrémenter le compteur de messages non lus
        conversation.unreadCount++;
      }
      
      // Mettre à jour la liste filtrée
      this.filterConversations();
      
      // Notification
      this.snackBar.open(`Nouveau message de ${conversation.customer.name}`, 'Voir', {
        duration: 5000
      });
    }
  }

  handleMessageRead(data: { conversationId: string, messageId: string }): void {
    // Marquer le message comme lu
    const message = this.selectedConversationMessages.find(m => m.id === data.messageId);
    if (message) {
      message.isRead = true;
    }
  }

  handleTyping(data: { conversationId: string, isTyping: boolean, customerName: string }): void {
    // Afficher l'indicateur de frappe
    if (data.conversationId === this.selectedConversation?.id) {
      // Logique pour afficher "Client en train de taper..."
      console.log(`${data.customerName} ${data.isTyping ? 'est en train de taper' : 'a arrêté de taper'}`);
    }
  }

  get totalConversations(): number {
    return this.conversations.length;
  }

  get unreadCount(): number {
    return this.conversations.filter(c => c.unreadCount > 0).length;
  }

  get highPriorityCount(): number {
    return this.conversations.filter(c => c.priority === 'high').length;
  }

  get archivedCount(): number {
    return this.conversations.filter(c => c.status === 'archived').length;
  }

  filterConversations(): void {
    this.filteredConversations = this.conversations.filter(conversation => {
      const matchesSearch = conversation.customer.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           conversation.customer.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           conversation.lastMessage.content.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesFilter = this.selectedFilter === 'all' ||
                           (this.selectedFilter === 'unread' && conversation.unreadCount > 0) ||
                           (this.selectedFilter === 'high' && conversation.priority === 'high') ||
                           (this.selectedFilter === 'archived' && conversation.status === 'archived');
      
      return matchesSearch && matchesFilter;
    });
  }

  setFilter(filter: string): void {
    this.selectedFilter = filter;
    this.filterConversations();
  }

  selectConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;
    this.loadMessages();
    this.markAsRead(conversation);
  }

  loadMessages(): void {
    if (!this.selectedConversation) return;

    // Charger les messages depuis l'API
    this.vendorService.getMessages(this.selectedConversation.id).subscribe({
      next: (response: any) => {
        if (response && response.messages) {
          this.selectedConversationMessages = response.messages.map((msg: any) => ({
            id: msg.id,
            content: msg.content || msg.message,
            timestamp: new Date(msg.created_at || msg.timestamp),
            isFromCustomer: msg.sender_role === 'customer' || msg.is_from_customer || false,
            isRead: msg.read || msg.is_read || false,
            conversationId: msg.conversation_id || this.selectedConversation?.id,
            attachments: msg.attachments || []
          }));
          this.scrollToBottom();
        } else {
          this.selectedConversationMessages = [];
        }
      },
      error: (error: any) => {
        console.error('Erreur chargement messages:', error);
        this.selectedConversationMessages = [];
        this.errorMessage = 'Erreur lors du chargement des messages. Veuillez réessayer.';
      }
    });
  }

  onKeyPress(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      content: this.newMessage.trim(),
      timestamp: new Date(),
      isFromCustomer: false,
      isRead: true,
      conversationId: this.selectedConversation.id
    };

    // Envoyer via Socket.io
    if (this.socket) {
      this.socket.emit('sendMessage', {
        conversationId: this.selectedConversation.id,
        content: message.content,
        timestamp: message.timestamp,
        isFromCustomer: false
      });
    }

    // Ajouter localement
    this.selectedConversationMessages.push(message);
    this.selectedConversation.lastMessage = {
      content: message.content,
      timestamp: message.timestamp,
      isFromCustomer: false,
      isRead: true
    };
    this.selectedConversation.unreadCount = 0;

    this.newMessage = '';
    this.scrollToBottom();

    console.log('💬 Message envoyé:', message);
  }

  useQuickReply(reply: QuickReply): void {
    this.newMessage = reply.content;
  }

  markAsRead(conversation: Conversation): void {
    conversation.unreadCount = 0;
    conversation.lastMessage.isRead = true;
  }

  markAllAsRead(): void {
    this.conversations.forEach(conversation => {
      conversation.unreadCount = 0;
      conversation.lastMessage.isRead = true;
    });
    this.snackBar.open('Toutes les conversations ont été marquées comme lues', 'Fermer', {
      duration: 3000
    });
  }

  archiveConversation(conversation: Conversation): void {
    conversation.status = 'archived';
    this.snackBar.open('Conversation archivée', 'Fermer', {
      duration: 3000
    });
  }

  markAsSpam(conversation: Conversation): void {
    conversation.status = 'spam';
    this.snackBar.open('Conversation marquée comme spam', 'Fermer', {
      duration: 3000
    });
  }

  deleteConversation(conversation: Conversation): void {
    const index = this.conversations.indexOf(conversation);
    if (index > -1) {
      this.conversations.splice(index, 1);
      if (this.selectedConversation === conversation) {
        this.selectedConversation = null;
        this.selectedConversationMessages = [];
      }
      this.filterConversations();
    }
  }

  attachFile(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt,.zip,.rar';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.uploadAttachment(file);
      }
    };
    input.click();
  }

  attachImage(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.uploadAttachment(file);
      }
    };
    input.click();
  }

  uploadAttachment(file: File): void {
    console.log('📎 Upload du fichier:', file.name);
    
    // Upload réel via l'API
    const formData = new FormData();
    formData.append('file', file);
    if (this.selectedConversation) {
      formData.append('conversationId', this.selectedConversation.id);
    }

    this.vendorService.uploadMessageAttachment(formData).subscribe({
      next: (response: any) => {
        const attachment = {
          name: file.name,
          type: this.getFileType(file.type),
          url: response.url || response.file_url || URL.createObjectURL(file),
          size: file.size
        };

        // Ajouter à la liste des pièces jointes du message en cours
        if (!this.newMessage) {
          this.newMessage = `[Fichier joint: ${file.name}]`;
        } else {
          this.newMessage += `\n[Fichier joint: ${file.name}]`;
        }

        this.snackBar.open(`Fichier "${file.name}" prêt à être envoyé`, 'Fermer', {
          duration: 3000
        });
      },
      error: (error: any) => {
        console.error('Erreur upload fichier:', error);
        this.snackBar.open(`Erreur lors de l'upload du fichier "${file.name}"`, 'Fermer', {
          duration: 5000
        });
      }
    });
  }

  getFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('video/')) return 'video';
    if (mimeType.includes('audio/')) return 'audio';
    return 'document';
  }

  downloadAttachment(attachment: any): void {
    console.log('📥 Télécharger:', attachment.name);
    // Logique de téléchargement
  }

  getAttachmentIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'image': 'image',
      'pdf': 'picture_as_pdf',
      'document': 'description',
      'video': 'video_file',
      'audio': 'audiotrack',
      'default': 'attach_file'
    };
    return iconMap[type] || iconMap['default'];
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return timestamp.toLocaleDateString('fr-FR');
  }

  scrollToBottom(): void {
    // Logique pour faire défiler vers le bas
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  openSettings(): void {
    console.log('⚙️ Ouvrir les paramètres de messagerie...');
    // Logique pour ouvrir les paramètres
  }
}
