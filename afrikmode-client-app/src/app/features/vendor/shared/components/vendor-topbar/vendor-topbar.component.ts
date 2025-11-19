import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth.service';
import { NotificationService, Notification } from '../../../../../core/services/notification.service';
import { MessageService, Conversation } from '../../../../../core/services/message.service';
import { WebsocketService } from '../../../../../core/services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vendor-topbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar class="vendor-topbar" color="primary">
      <!-- Left Section -->
      <div class="topbar-left">
        <!-- Menu Button (pour mobile et toggle sidebar) -->
        <button 
          mat-icon-button 
          class="menu-btn"
          (click)="toggleSidebar.emit()"
          type="button">
          <mat-icon>menu</mat-icon>
        </button>
        
        <span class="app-title">Tableau de Bord Vendeur</span>
      </div>

      <!-- Right Section -->
      <div class="topbar-right">
        <!-- Profile Menu -->
        <button 
          mat-button
          [matMenuTriggerFor]="profileMenu"
          class="profile-btn"
          type="button">
          <mat-icon>person</mat-icon>
          <span>Profil</span>
        </button>
      </div>
    </mat-toolbar>

    <!-- Profile Menu -->
    <mat-menu #profileMenu="matMenu" xPosition="before" yPosition="below">
      <div class="profile-header" (click)="$event.stopPropagation()">
        <div class="profile-avatar">
          <img [src]="userProfile.avatar || '/assets/images/default-avatar.png'" [alt]="userProfile.name">
        </div>
        <div class="profile-info">
          <h3>{{ userProfile.name || 'Ma Boutique' }}</h3>
          <p>{{ userProfile.email || 'vendeur@afrikmode.com' }}</p>
        </div>
      </div>
      <mat-divider></mat-divider>
      
      <button mat-menu-item (click)="goToProfile()">
        <mat-icon>account_circle</mat-icon>
        <span>Mon Profil</span>
      </button>
      
      <button mat-menu-item (click)="goToStore()">
        <mat-icon>store</mat-icon>
        <span>Ma Boutique</span>
      </button>
      
      <button mat-menu-item (click)="goToSettings()">
        <mat-icon>settings</mat-icon>
        <span>Paramètres</span>
      </button>
      
      <mat-divider></mat-divider>
      
      <button mat-menu-item (click)="logout()" class="logout-btn">
        <mat-icon>logout</mat-icon>
        <span>Déconnexion</span>
      </button>
    </mat-menu>
  `,
  styleUrls: ['./vendor-topbar.component.scss']
})
export class VendorTopbarComponent implements OnInit, OnDestroy {
  @Input() currentPage: string = 'Dashboard';
  @Input() isMobile: boolean | null = false;
  @Input() collapsed: boolean = false;
  @Output() menuClick = new EventEmitter<void>();
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() openSidebar = new EventEmitter<void>();

  notificationCount: number = 0;
  messageCount: number = 0;
  notifications: Notification[] = [];
  messages: Conversation[] = [];
  private subscriptions: Subscription[] = [];
  
  userProfile = {
    name: 'Boutique AfrikMode',
    email: 'vendeur@afrikmode.com',
    avatar: '/assets/images/default-avatar.svg',
    status: 'Boutique Active'
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private messageService: MessageService,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.initializeServices();
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeServices(): void {
    // Se connecter au WebSocket
    this.websocketService.connect();

    // S'abonner aux notifications
    const notificationSub = this.notificationService.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
      this.notificationCount = notifications.filter(n => !n.read).length;
    });

    // S'abonner au compteur de notifications non lues
    const unreadCountSub = this.notificationService.getUnreadCount().subscribe(count => {
      this.notificationCount = count;
    });

    // S'abonner aux conversations
    const conversationsSub = this.messageService.getConversations().subscribe(response => {
      // Gérer la réponse qui peut être un objet { success: true, data: [...] } ou directement un tableau
      let conversations: Conversation[] = [];
      if (Array.isArray(response)) {
        conversations = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        conversations = response.data;
      } else if (response && response.conversations && Array.isArray(response.conversations)) {
        conversations = response.conversations;
      }
      
      this.messages = conversations;
      this.messageCount = conversations.reduce((sum: number, conv: any) => {
        return sum + (conv.unreadCount || conv.unread_count || 0);
      }, 0);
    });

    // S'abonner au compteur de messages non lus
    const messageCountSub = this.messageService.getUnreadCount().subscribe(count => {
      this.messageCount = count;
    });

    this.subscriptions.push(notificationSub, unreadCountSub, conversationsSub, messageCountSub);
  }

  private loadUserProfile(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userProfile = {
        name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : 'Ma Boutique',
        email: user.email,
        avatar: user.avatar || '/assets/images/default-avatar.svg',
        status: user.status === 'active' ? 'Boutique Active' : 'Boutique Inactive'
      };
    }
  }

  // Quick Actions
  addProduct(): void {
    this.router.navigate(['/vendor/products/add']);
  }

  viewOrders(): void {
    this.router.navigate(['/vendor/orders']);
  }

  viewAnalytics(): void {
    this.router.navigate(['/vendor/analytics']);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  viewAllNotifications(): void {
    this.router.navigate(['/vendor/notifications']);
  }

  composeMessage(): void {
    this.router.navigate(['/vendor/messages/compose']);
  }

  viewAllMessages(): void {
    this.router.navigate(['/vendor/messages']);
  }

  goToProfile(): void {
    this.router.navigate(['/vendor/profile']);
  }

  goToStore(): void {
    this.router.navigate(['/vendor/store']);
  }

  goToFinances(): void {
    this.router.navigate(['/vendor/finances']);
  }

  goToSettings(): void {
    this.router.navigate(['/vendor/settings']);
  }

  goToHelp(): void {
    this.router.navigate(['/vendor/help']);
  }

  goToDocumentation(): void {
    this.router.navigate(['/vendor/documentation']);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.websocketService.disconnect();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion:', error);
        // Déconnexion locale même en cas d'erreur
        this.websocketService.disconnect();
        this.router.navigate(['/login']);
      }
    });
  }
}