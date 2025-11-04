// src/app/features/admin/pages/notifications/admin-notifications.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatListModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">
            <mat-icon>notifications</mat-icon>
            Notifications
          </h1>
          <mat-chip highlighted>12 nouvelles</mat-chip>
        </div>
        <button mat-raised-button>
          <mat-icon>done_all</mat-icon>
          Tout marquer comme lu
        </button>
      </div>

      <mat-card class="notifications-card">
        <mat-list>
          <mat-list-item *ngFor="let i of [1,2,3,4,5,6,7,8,9,10,11,12]" class="notification-item">
            <mat-icon matListItemIcon [ngClass]="i <= 3 ? 'unread' : ''">
              {{ i % 3 === 0 ? 'shopping_cart' : (i % 2 === 0 ? 'person_add' : 'store') }}
            </mat-icon>
            <div matListItemTitle class="notification-title" [ngClass]="i <= 3 ? 'unread' : ''">
              Nouvelle commande #{{ 1000 + i }}
            </div>
            <div matListItemLine class="notification-time">Il y a {{ i }} minute{{ i > 1 ? 's' : '' }}</div>
          </mat-list-item>
        </mat-list>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-page { padding: 24px; background: #f8f9fa; min-height: 100%; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .header-left { display: flex; align-items: center; gap: 16px; }
    .page-title { display: flex; align-items: center; gap: 12px; margin: 0; font-size: 32px; font-weight: 700; color: #1e293b; }
    .page-title mat-icon { font-size: 36px; width: 36px; height: 36px; color: #3b82f6; }
    .notifications-card { border-radius: 16px; }
    .notification-item { border-bottom: 1px solid #e2e8f0; padding: 16px; }
    .notification-item:last-child { border-bottom: none; }
    .notification-title { font-weight: 500; }
    .notification-title.unread { font-weight: 700; color: #1e293b; }
    .notification-time { color: #64748b; font-size: 13px; }
    mat-icon.unread { color: #3b82f6; }
  `]
})
export class AdminNotificationsComponent {}
