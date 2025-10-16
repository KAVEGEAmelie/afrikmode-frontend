// src/app/features/admin/shared/components/admin-topbar/admin-topbar.component.ts
import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AdminAuthService } from '../../../core/services/admin-auth.service';
import { AdminStateService } from '../../../core/services/admin-state.service';

@Component({
  selector: 'app-admin-topbar',
  standalone: true,
  templateUrl: './admin-topbar.component.html',
  styleUrls: ['./admin-topbar.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatBadgeModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [AdminAuthService, AdminStateService]
})

export class AdminTopbarComponent implements OnInit, OnDestroy {
  @Output() menuClick = new EventEmitter<void>();

  notificationsCount: number = 12;
  userName: string = 'Admin';
  userAvatar: string = '';
  searchQuery: string = '';
  currentUser$: Observable<any>;
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private adminAuth: AdminAuthService,
    private adminState: AdminStateService
  ) {
    this.currentUser$ = this.adminAuth.currentUser$;
  }

  ngOnInit(): void {
    // S'abonner aux données utilisateur
    const userSub = this.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.firstName || user.email || 'Admin';
        this.userAvatar = user.avatar || '';
      }
    });
    this.subscriptions.push(userSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onMenuClick(): void {
    this.menuClick.emit();
  }

  onNotificationsClick(): void {
    this.router.navigate(['/admin/notifications']);
  }

  onProfileClick(): void {
    this.router.navigate(['/admin/profile']);
  }

  onSettingsClick(): void {
    this.router.navigate(['/admin/settings']);
  }

  onLogout(): void {
    this.adminAuth.logout();
    this.router.navigate(['/admin/login']);
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      // Implémenter la recherche globale
      console.log('Recherche:', this.searchQuery);
      // TODO: Implémenter la recherche globale
    }
  }

  onSearchKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }
}