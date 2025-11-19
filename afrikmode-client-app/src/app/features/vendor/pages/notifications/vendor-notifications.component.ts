import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VendorNotificationService } from '../../core/services/vendor-notification.service';
import { VendorNotification, NotificationType, NotificationPriority } from '../../core/models/notification.interface';

@Component({
  selector: 'app-vendor-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>
            <i class="fas fa-bell"></i>
            Notifications
          </h1>
          <span class="badge-count" *ngIf="unreadCount > 0">
            {{ unreadCount }} non lue{{ unreadCount > 1 ? 's' : '' }}
          </span>
          <span class="connection-status" [class.connected]="isConnected">
            <i class="fas fa-circle"></i>
            {{ isConnected ? 'Temps réel actif' : 'Hors ligne' }}
          </span>
        </div>

        <div class="header-actions">
          <button class="btn-action" (click)="markAllAsRead()" [disabled]="unreadCount === 0">
            <i class="fas fa-check-double"></i>
            Tout marquer comme lu
          </button>
          <button class="btn-action" (click)="loadNotifications()">
            <i class="fas fa-sync" [class.fa-spin]="loading"></i>
            Actualiser
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <button
          class="filter-btn"
          [class.active]="currentFilter === 'all'"
          (click)="setFilter('all')">
          Toutes ({{ stats.total || 0 }})
        </button>
        <button
          class="filter-btn"
          [class.active]="currentFilter === 'unread'"
          (click)="setFilter('unread')">
          Non lues ({{ unreadCount }})
        </button>
        <button
          class="filter-btn"
          [class.active]="currentFilter === 'order'"
          (click)="setFilter('order')">
          <i class="fas fa-shopping-cart"></i>
          Commandes
        </button>
        <button
          class="filter-btn"
          [class.active]="currentFilter === 'stock'"
          (click)="setFilter('stock')">
          <i class="fas fa-warehouse"></i>
          Stock
        </button>
        <button
          class="filter-btn"
          [class.active]="currentFilter === 'payment'"
          (click)="setFilter('payment')">
          <i class="fas fa-dollar-sign"></i>
          Paiements
        </button>
        <button
          class="filter-btn"
          [class.active]="currentFilter === 'review'"
          (click)="setFilter('review')">
          <i class="fas fa-star"></i>
          Avis
        </button>
      </div>

      <!-- Notifications List -->
      <div class="notifications-container">
        <div class="notifications-list" *ngIf="notifications.length > 0">
          <div
            *ngFor="let notification of notifications; trackBy: trackByNotificationId"
            class="notification-item"
            [class.unread]="notification.status === 'unread'"
            [class.priority-high]="notification.priority === 'high'"
            [class.priority-urgent]="notification.priority === 'urgent'"
            (click)="handleNotificationClick(notification)">

            <div class="notification-icon" [class]="'type-' + notification.type">
              <i [class]="getNotificationIcon(notification.type)"></i>
            </div>

            <div class="notification-content">
              <div class="notification-header">
                <h4>{{ notification.title }}</h4>
                <span class="notification-time">{{ getRelativeTime(notification.created_at) }}</span>
              </div>

              <p class="notification-message">{{ notification.message }}</p>

              <div class="notification-meta">
                <span class="notification-type">{{ getTypeLabel(notification.type) }}</span>
                <span class="notification-priority" [class]="'priority-' + notification.priority">
                  {{ getPriorityLabel(notification.priority) }}
                </span>
              </div>
            </div>

            <div class="notification-actions" (click)="$event.stopPropagation()">
              <button
                class="action-btn"
                *ngIf="notification.status === 'unread'"
                (click)="markAsRead(notification.id)"
                title="Marquer comme lu">
                <i class="fas fa-check"></i>
              </button>

              <button
                class="action-btn"
                (click)="deleteNotification(notification.id)"
                title="Supprimer">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="!loading && notifications.length === 0">
          <i class="fas fa-bell-slash"></i>
          <h3>Aucune notification</h3>
          <p>{{ getEmptyStateMessage() }}</p>
        </div>

        <!-- Loading -->
        <div class="loading-state" *ngIf="loading">
          <div class="spinner"></div>
          <p>Chargement des notifications...</p>
        </div>

        <!-- Load More -->
        <div class="load-more" *ngIf="hasMore && !loading">
          <button class="btn-load-more" (click)="loadMore()">
            Charger plus
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-page {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .page-header h1 {
      font-size: 1.875rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .page-header h1 i {
      color: #3b82f6;
    }

    .badge-count {
      background: #ef4444;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .connection-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #64748b;
      padding: 0.375rem 0.75rem;
      border-radius: 0.5rem;
      background: #f1f5f9;
    }

    .connection-status i {
      font-size: 0.5rem;
      color: #94a3b8;
    }

    .connection-status.connected i {
      color: #22c55e;
      animation: blink 2s ease-in-out infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    .btn-action {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      color: #475569;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-action:hover:not(:disabled) {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .btn-action:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .filters-bar {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
    }

    .filter-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      color: #64748b;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .filter-btn:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .filter-btn.active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }

    .notifications-container {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .notifications-list {
      display: flex;
      flex-direction: column;
    }

    .notification-item {
      display: flex;
      gap: 1rem;
      padding: 1.25rem;
      border-bottom: 1px solid #f1f5f9;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .notification-item:last-child {
      border-bottom: none;
    }

    .notification-item:hover {
      background: #f8fafc;
    }

    .notification-item.unread {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
    }

    .notification-item.priority-high {
      border-left-color: #f97316;
    }

    .notification-item.priority-urgent {
      border-left-color: #ef4444;
    }

    .notification-icon {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 1.25rem;
    }

    .notification-icon.type-order {
      background: #dbeafe;
      color: #3b82f6;
    }

    .notification-icon.type-product {
      background: #fef3c7;
      color: #f59e0b;
    }

    .notification-icon.type-payment {
      background: #d1fae5;
      color: #10b981;
    }

    .notification-icon.type-review {
      background: #fef3c7;
      color: #f59e0b;
    }

    .notification-icon.type-message {
      background: #e0e7ff;
      color: #6366f1;
    }

    .notification-icon.type-system {
      background: #e2e8f0;
      color: #64748b;
    }

    .notification-icon.type-stock {
      background: #fed7aa;
      color: #ea580c;
    }

    .notification-icon.type-performance {
      background: #ddd6fe;
      color: #8b5cf6;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .notification-header h4 {
      font-size: 1rem;
      font-weight: 600;
      color: #0f172a;
      margin: 0;
    }

    .notification-time {
      font-size: 0.75rem;
      color: #94a3b8;
      white-space: nowrap;
    }

    .notification-message {
      font-size: 0.875rem;
      color: #475569;
      margin: 0 0 0.75rem 0;
      line-height: 1.5;
    }

    .notification-meta {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .notification-type {
      font-size: 0.75rem;
      color: #64748b;
      background: #f1f5f9;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
    }

    .notification-priority {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
    }

    .notification-priority.priority-low {
      background: #dbeafe;
      color: #1e40af;
    }

    .notification-priority.priority-medium {
      background: #e2e8f0;
      color: #475569;
    }

    .notification-priority.priority-high {
      background: #fed7aa;
      color: #c2410c;
    }

    .notification-priority.priority-urgent {
      background: #fee2e2;
      color: #991b1b;
    }

    .notification-actions {
      display: flex;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .action-btn {
      width: 2rem;
      height: 2rem;
      border-radius: 0.375rem;
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .action-btn:hover {
      background: #f1f5f9;
      color: #475569;
    }

    .empty-state,
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .empty-state i {
      font-size: 4rem;
      color: #cbd5e1;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #475569;
      margin: 0 0 0.5rem 0;
    }

    .empty-state p {
      color: #94a3b8;
      margin: 0;
    }

    .spinner {
      width: 3rem;
      height: 3rem;
      border: 3px solid #e2e8f0;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-state p {
      margin-top: 1rem;
      color: #94a3b8;
    }

    .load-more {
      padding: 1.5rem;
      text-align: center;
      border-top: 1px solid #f1f5f9;
    }

    .btn-load-more {
      padding: 0.625rem 1.5rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      color: #475569;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-load-more:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    @media (max-width: 768px) {
      .notifications-page {
        padding: 1rem;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .header-actions {
        width: 100%;
      }

      .btn-action {
        flex: 1;
      }

      .notification-item {
        flex-direction: column;
      }

      .notification-actions {
        justify-content: flex-end;
      }
    }
  `]
})
export class VendorNotificationsComponent implements OnInit, OnDestroy {
  notifications: VendorNotification[] = [];
  unreadCount = 0;
  isConnected = false;
  loading = false;
  currentFilter: string = 'all';
  limit = 20;
  offset = 0;
  hasMore = true;

  stats = {
    total: 0
  };

  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: VendorNotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // S'abonner aux notifications
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
      });

    // S'abonner au compteur
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });

    // S'abonner à la connexion
    this.notificationService.connected$
      .pipe(takeUntil(this.destroy$))
      .subscribe(connected => {
        this.isConnected = connected;
      });

    // Charger les notifications
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications(): void {
    this.loading = true;
    this.offset = 0;

    const filter: any = {
      limit: this.limit,
      offset: this.offset
    };

    if (this.currentFilter === 'unread') {
      filter.unread_only = true;
    } else if (this.currentFilter !== 'all') {
      filter.type = this.currentFilter;
    }

    this.notificationService.getNotifications(filter).subscribe({
      next: (response) => {
        if (response.success) {
          this.stats.total = response.pagination.total;
          this.hasMore = this.notifications.length < response.pagination.total;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.loading = false;
      }
    });
  }

  loadMore(): void {
    this.offset += this.limit;

    const filter: any = {
      limit: this.limit,
      offset: this.offset
    };

    if (this.currentFilter === 'unread') {
      filter.unread_only = true;
    } else if (this.currentFilter !== 'all') {
      filter.type = this.currentFilter;
    }

    this.notificationService.getNotifications(filter).subscribe({
      next: (response) => {
        if (response.success) {
          const currentNotifications = this.notificationService['notificationsSubject'].value;
          this.notificationService['notificationsSubject'].next([...currentNotifications, ...response.data]);
          this.hasMore = (this.offset + this.limit) < response.pagination.total;
        }
      },
      error: (error) => {
        console.error('Error loading more notifications:', error);
      }
    });
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
    this.loadNotifications();
  }

  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      error: (error) => console.error('Error marking as read:', error)
    });
  }

  markAllAsRead(): void {
    if (this.unreadCount === 0) return;

    this.notificationService.markAllAsRead().subscribe({
      error: (error) => console.error('Error marking all as read:', error)
    });
  }

  deleteNotification(notificationId: string): void {
    if (!confirm('Supprimer cette notification ?')) return;

    this.notificationService.delete(notificationId).subscribe({
      error: (error) => console.error('Error deleting notification:', error)
    });
  }

  handleNotificationClick(notification: VendorNotification): void {
    // Marquer comme lue
    if (notification.status === 'unread') {
      this.markAsRead(notification.id);
    }

    // Naviguer vers l'URL d'action si présente
    if (notification.action_url) {
      this.router.navigateByUrl(notification.action_url);
    }
  }

  getNotificationIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      order: 'fas fa-shopping-cart',
      product: 'fas fa-box',
      payment: 'fas fa-dollar-sign',
      review: 'fas fa-star',
      message: 'fas fa-envelope',
      system: 'fas fa-cog',
      stock: 'fas fa-warehouse',
      performance: 'fas fa-chart-line'
    };
    return icons[type] || 'fas fa-bell';
  }

  getTypeLabel(type: NotificationType): string {
    const labels: Record<NotificationType, string> = {
      order: 'Commande',
      product: 'Produit',
      payment: 'Paiement',
      review: 'Avis',
      message: 'Message',
      system: 'Système',
      stock: 'Stock',
      performance: 'Performance'
    };
    return labels[type] || type;
  }

  getPriorityLabel(priority: NotificationPriority): string {
    const labels: Record<NotificationPriority, string> = {
      low: 'Faible',
      medium: 'Normale',
      high: 'Haute',
      urgent: 'Urgente'
    };
    return labels[priority] || priority;
  }

  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 43200) return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
    return date.toLocaleDateString('fr-FR');
  }

  getEmptyStateMessage(): string {
    if (this.currentFilter === 'unread') {
      return 'Toutes vos notifications ont été lues';
    }
    if (this.currentFilter !== 'all') {
      return `Aucune notification de type "${this.getTypeLabel(this.currentFilter as NotificationType)}"`;
    }
    return 'Vous n\'avez aucune notification pour le moment';
  }

  trackByNotificationId(index: number, notification: VendorNotification): string {
    return notification.id;
  }
}
