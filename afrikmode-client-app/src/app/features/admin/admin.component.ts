// src/app/features/admin/admin.component.ts
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminTopbarComponent } from './shared/components/admin-topbar/admin-topbar.component';
import { AdminSidebarComponent } from './shared/components/admin-sidebar/admin-sidebar.component';
import { AdminAuthService } from './core/services/admin-auth.service';
import { AdminStateService } from './core/services/admin-state.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    AdminTopbarComponent,
    AdminSidebarComponent
  ]
})
export class AdminComponent implements OnInit, OnDestroy {
  @ViewChild('drawer') drawer!: MatSidenav;
  
  isMobile$: Observable<boolean>;
  sidenavMode: 'side' | 'over' = 'side';
  sidenavOpened: boolean = true;
  currentUser$: Observable<any>;
  loading$: Observable<boolean>;
  private subscriptions: Subscription[] = [];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private adminAuth: AdminAuthService,
    private adminState: AdminStateService
  ) {
    this.isMobile$ = this.breakpointObserver.observe([Breakpoints.Handset])
      .pipe(
        map(result => result.matches),
        shareReplay()
      );
    
    this.currentUser$ = this.adminAuth.currentUser$;
    this.loading$ = this.adminState.usersLoading$;
  }

  ngOnInit(): void {
    // Configuration responsive
    this.subscriptions.push(
      this.isMobile$.subscribe(isMobile => {
        this.sidenavMode = isMobile ? 'over' : 'side';
        this.sidenavOpened = !isMobile;
      })
    );

    // Charger les données du dashboard
    this.adminState.loadDashboardStats();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleSidenav(): void {
    this.drawer.toggle();
  }

  onLogout(): void {
    this.adminAuth.logout();
  }
}