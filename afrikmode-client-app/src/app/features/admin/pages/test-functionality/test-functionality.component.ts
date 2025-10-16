import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { AdminStateService } from '../../core/services/admin-state.service';
import { AdminAuthService } from '../../core/services/admin-auth.service';

@Component({
  selector: 'app-test-functionality',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatChipsModule
  ],
  providers: [AdminStateService, AdminAuthService],
  template: `
    <div style="padding: 20px; background: #f5f5f5; min-height: 100vh;">
      <h1>🧪 Test des Fonctionnalités Admin</h1>
      
      <!-- Test Navigation -->
      <mat-card style="margin: 20px 0;">
        <mat-card-header>
          <mat-card-title>🧭 Test Navigation</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button mat-raised-button color="primary" (click)="testNavigation('/admin/dashboard')">
              <mat-icon>dashboard</mat-icon> Dashboard
            </button>
            <button mat-raised-button color="accent" (click)="testNavigation('/admin/users')">
              <mat-icon>people</mat-icon> Utilisateurs
            </button>
            <button mat-raised-button color="accent" (click)="testNavigation('/admin/stores')">
              <mat-icon>store</mat-icon> Boutiques
            </button>
            <button mat-raised-button color="accent" (click)="testNavigation('/admin/products')">
              <mat-icon>inventory</mat-icon> Produits
            </button>
            <button mat-raised-button color="accent" (click)="testNavigation('/admin/orders')">
              <mat-icon>shopping_cart</mat-icon> Commandes
            </button>
            <button mat-raised-button color="accent" (click)="testNavigation('/admin/support')">
              <mat-icon>support</mat-icon> Support
            </button>
            <button mat-raised-button color="accent" (click)="testNavigation('/admin/analytics')">
              <mat-icon>analytics</mat-icon> Analytics
            </button>
            <button mat-raised-button color="accent" (click)="testNavigation('/admin/coupons')">
              <mat-icon>local_offer</mat-icon> Coupons
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Test Services -->
      <mat-card style="margin: 20px 0;">
        <mat-card-header>
          <mat-card-title>⚙️ Test Services</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button mat-raised-button (click)="testAuthService()">
              <mat-icon>security</mat-icon> Test Auth
            </button>
            <button mat-raised-button (click)="testStateService()">
              <mat-icon>storage</mat-icon> Test State
            </button>
            <button mat-raised-button (click)="testDashboardData()">
              <mat-icon>dashboard</mat-icon> Test Dashboard
            </button>
            <button mat-raised-button (click)="testLogout()">
              <mat-icon>logout</mat-icon> Test Logout
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Résultats des Tests -->
      <mat-card style="margin: 20px 0;">
        <mat-card-header>
          <mat-card-title>📊 Résultats des Tests</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-list>
            <mat-list-item *ngFor="let result of testResults">
              <mat-icon [color]="result.success ? 'primary' : 'warn'">
                {{ result.success ? 'check_circle' : 'error' }}
              </mat-icon>
              <span mat-line>{{ result.message }}</span>
              <span mat-line class="test-detail">{{ result.detail }}</span>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>

      <!-- Informations Système -->
      <mat-card style="margin: 20px 0;">
        <mat-card-header>
          <mat-card-title>ℹ️ Informations Système</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
            <div>
              <h4>URL Actuelle</h4>
              <p>{{ currentUrl }}</p>
            </div>
            <div>
              <h4>Timestamp</h4>
              <p>{{ timestamp }}</p>
            </div>
            <div>
              <h4>État Auth</h4>
              <mat-chip [color]="isAuthenticated ? 'primary' : 'warn'">
                {{ isAuthenticated ? 'Connecté' : 'Non connecté' }}
              </mat-chip>
            </div>
            <div>
              <h4>État Loading</h4>
              <mat-chip [color]="isLoading ? 'accent' : 'primary'">
                {{ isLoading ? 'Chargement...' : 'Prêt' }}
              </mat-chip>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .test-detail {
      font-size: 12px;
      color: #666;
    }
    h1 { color: #2c3e50; }
    h4 { color: #34495e; margin-bottom: 8px; }
    button { margin: 5px; }
  `]
})
export class TestFunctionalityComponent implements OnInit {
  currentUrl = window.location.href;
  timestamp = new Date().toLocaleString();
  isAuthenticated = false;
  isLoading = false;
  testResults: Array<{success: boolean, message: string, detail: string}> = [];

  constructor(
    private router: Router,
    private adminAuth: AdminAuthService,
    private adminState: AdminStateService
  ) {}

  ngOnInit(): void {
    this.testInitialState();
  }

  testInitialState(): void {
    this.adminAuth.isAuthenticated$.subscribe(auth => {
      this.isAuthenticated = auth;
      this.addTestResult(true, 'État d\'authentification chargé', `Connecté: ${auth}`);
    });

    this.adminState.dashboardLoading$.subscribe(loading => {
      this.isLoading = loading;
    });
  }

  testNavigation(route: string): void {
    try {
      this.router.navigate([route]);
      this.addTestResult(true, `Navigation vers ${route}`, 'Redirection réussie');
    } catch (error) {
      this.addTestResult(false, `Navigation vers ${route}`, `Erreur: ${error}`);
    }
  }

  testAuthService(): void {
    try {
      const user = this.adminAuth.getCurrentUser();
      this.addTestResult(true, 'Service Auth', `Utilisateur: ${user ? 'Trouvé' : 'Non trouvé'}`);
    } catch (error) {
      this.addTestResult(false, 'Service Auth', `Erreur: ${error}`);
    }
  }

  testStateService(): void {
    try {
      this.adminState.loadDashboardStats().subscribe({
        next: (data) => {
          this.addTestResult(true, 'Service State - Dashboard', `Données chargées: ${data ? 'Oui' : 'Non'}`);
        },
        error: (error) => {
          this.addTestResult(false, 'Service State - Dashboard', `Erreur: ${error.message}`);
        }
      });
    } catch (error) {
      this.addTestResult(false, 'Service State', `Erreur: ${error}`);
    }
  }

  testDashboardData(): void {
    try {
      this.adminState.dashboardStats$.subscribe(data => {
        this.addTestResult(true, 'Données Dashboard', `Statistiques: ${data ? 'Disponibles' : 'Non disponibles'}`);
      });
    } catch (error) {
      this.addTestResult(false, 'Données Dashboard', `Erreur: ${error}`);
    }
  }

  testLogout(): void {
    try {
      this.adminAuth.logout();
      this.addTestResult(true, 'Déconnexion', 'Logout exécuté');
    } catch (error) {
      this.addTestResult(false, 'Déconnexion', `Erreur: ${error}`);
    }
  }

  private addTestResult(success: boolean, message: string, detail: string): void {
    this.testResults.unshift({
      success,
      message,
      detail
    });
    
    // Garder seulement les 10 derniers résultats
    if (this.testResults.length > 10) {
      this.testResults = this.testResults.slice(0, 10);
    }
  }
}
