import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VendorNotificationService } from '../../../core/services/vendor-notification.service';

@Component({
  selector: 'app-notification-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-badge-container" (click)="navigateToNotifications()">
      <button class="notification-bell" [class.has-notifications]="unreadCount > 0">
        <i class="fas fa-bell"></i>
        <span class="badge" *ngIf="unreadCount > 0">
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </button>

      <!-- Indicateur de connexion WebSocket -->
      <div class="connection-indicator" [class.connected]="isConnected" *ngIf="showConnectionStatus">
        <i class="fas fa-circle"></i>
      </div>
    </div>
  `,
  styles: [`
    .notification-badge-container {
      position: relative;
      display: inline-block;
      cursor: pointer;
    }

    .notification-bell {
      position: relative;
      background: transparent;
      border: none;
      font-size: 1.5rem;
      color: #64748b;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.5rem;
      transition: all 0.3s ease;
    }

    .notification-bell:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .notification-bell.has-notifications {
      color: #3b82f6;
      animation: ring 2s ease-in-out infinite;
    }

    @keyframes ring {
      0%, 100% { transform: rotate(0deg); }
      10%, 30% { transform: rotate(-10deg); }
      20%, 40% { transform: rotate(10deg); }
    }

    .badge {
      position: absolute;
      top: 0;
      right: 0;
      background: #ef4444;
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.125rem 0.375rem;
      border-radius: 9999px;
      min-width: 1.25rem;
      text-align: center;
      line-height: 1;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .connection-indicator {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 8px;
      height: 8px;
    }

    .connection-indicator i {
      font-size: 8px;
      color: #94a3b8;
      transition: color 0.3s ease;
    }

    .connection-indicator.connected i {
      color: #22c55e;
      animation: blink 2s ease-in-out infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `]
})
export class NotificationBadgeComponent implements OnInit, OnDestroy {
  unreadCount = 0;
  isConnected = false;
  showConnectionStatus = true;

  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: VendorNotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // S'abonner au compteur de notifications non lues
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });

    // S'abonner au statut de connexion WebSocket
    this.notificationService.connected$
      .pipe(takeUntil(this.destroy$))
      .subscribe(connected => {
        this.isConnected = connected;
      });

    // Récupérer le compteur initial
    this.notificationService.getUnreadCount().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  navigateToNotifications(): void {
    this.router.navigate(['/vendor/notifications']);
  }
}
