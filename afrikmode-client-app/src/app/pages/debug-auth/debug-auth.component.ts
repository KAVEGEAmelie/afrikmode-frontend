import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-debug-auth',
  standalone: true,
  imports: [CommonModule, NgIf],
  template: `
    <div class="debug-container">
      <h1>Debug Authentication</h1>
      
      <div class="debug-section">
        <h2>État de l'authentification</h2>
        <p><strong>Connecté:</strong> {{ isAuthenticated$ | async }}</p>
        <p><strong>Utilisateur:</strong> {{ (currentUser$ | async)?.email || 'Aucun' }}</p>
        <p><strong>Rôle:</strong> {{ (currentUser$ | async)?.role || 'Aucun' }}</p>
        <p><strong>Statut:</strong> {{ (currentUser$ | async)?.status || 'Aucun' }}</p>
      </div>

      <div class="debug-section">
        <h2>Données localStorage</h2>
        <p><strong>Token:</strong> {{ token ? 'Présent' : 'Absent' }}</p>
        <p><strong>Refresh Token:</strong> {{ refreshToken ? 'Présent' : 'Absent' }}</p>
        <p><strong>User Data:</strong> {{ userData ? 'Présent' : 'Absent' }}</p>
      </div>

      <div class="debug-section">
        <h2>Test des routes</h2>
        <button (click)="testAdminRoute()" class="btn">Tester /admin</button>
        <button (click)="testVendorRoute()" class="btn">Tester /vendor</button>
        <button (click)="clearAuth()" class="btn btn-danger">Vider l'auth</button>
      </div>

      <div class="debug-section" *ngIf="(currentUser$ | async) as user">
        <h2>Données utilisateur complètes</h2>
        <pre>{{ user | json }}</pre>
      </div>
    </div>
  `,
  styles: [`
    .debug-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .debug-section {
      margin: 2rem 0;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      margin: 0.5rem;
      background: #8B2E2E;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .btn-danger {
      background: #dc3545;
    }
    
    pre {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
    }
  `]
})
export class DebugAuthComponent implements OnInit {
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<any>;
  
  token: string | null = null;
  refreshToken: string | null = null;
  userData: string | null = null;

  constructor(private authService: AuthService) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    this.loadLocalStorageData();
  }

  loadLocalStorageData() {
    this.token = localStorage.getItem('auth_token');
    this.refreshToken = localStorage.getItem('refresh_token');
    this.userData = localStorage.getItem('user');
  }

  testAdminRoute() {
    window.location.href = '/admin';
  }

  testVendorRoute() {
    window.location.href = '/vendor';
  }

  clearAuth() {
    this.authService.logout().subscribe(() => {
      this.loadLocalStorageData();
    });
  }
}




