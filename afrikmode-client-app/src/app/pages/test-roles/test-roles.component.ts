import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-test-roles',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf],
  template: `
    <div class="test-roles-container">
      <h1>🧪 Test des Rôles et Accès</h1>
      
      <div class="auth-status">
        <h2>État de l'authentification</h2>
        <p><strong>Connecté:</strong> {{ isAuthenticated$ | async }}</p>
        <p><strong>Email:</strong> {{ (currentUser$ | async)?.email || 'Non connecté' }}</p>
        <p><strong>Rôle:</strong> {{ (currentUser$ | async)?.role || 'Aucun' }}</p>
        <p><strong>Statut:</strong> {{ (currentUser$ | async)?.status || 'Aucun' }}</p>
      </div>

      <div class="test-buttons">
        <h2>Test d'accès aux interfaces</h2>
        
        <div class="button-group">
          <button (click)="testAdminAccess()" class="btn btn-admin">
            🔐 Tester /admin
          </button>
          <button (click)="testVendorAccess()" class="btn btn-vendor">
            🏪 Tester /vendor
          </button>
        </div>

        <div class="button-group">
          <button (click)="simulateAdminRole()" class="btn btn-simulate">
            👑 Simuler rôle Admin
          </button>
          <button (click)="simulateVendorRole()" class="btn btn-simulate">
            🛍️ Simuler rôle Vendor
          </button>
        </div>

        <div class="button-group">
          <button (click)="clearAuth()" class="btn btn-danger">
            🗑️ Vider l'authentification
          </button>
          <button (click)="goToLogin()" class="btn btn-primary">
            🔑 Aller au Login
          </button>
        </div>
      </div>

      <div class="debug-info" *ngIf="(currentUser$ | async) as user">
        <h2>Données utilisateur complètes</h2>
        <pre>{{ user | json }}</pre>
      </div>

      <div class="instructions">
        <h2>📋 Instructions</h2>
        <ol>
          <li>Si tu n'es pas connecté, clique sur "Aller au Login"</li>
          <li>Connecte-toi avec un compte admin ou vendor</li>
          <li>Teste l'accès aux interfaces avec les boutons</li>
          <li>Si tu n'as pas de compte admin/vendor, utilise les boutons de simulation</li>
        </ol>
      </div>
    </div>
  `,
  styles: [`
    .test-roles-container {
      max-width: 900px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    
    .auth-status, .test-buttons, .debug-info, .instructions {
      margin: 2rem 0;
      padding: 1.5rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #f9f9f9;
    }
    
    .button-group {
      margin: 1rem 0;
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      text-decoration: none;
      display: inline-block;
      transition: all 0.3s ease;
    }
    
    .btn-admin {
      background: #dc3545;
      color: white;
    }
    
    .btn-vendor {
      background: #28a745;
      color: white;
    }
    
    .btn-simulate {
      background: #ffc107;
      color: #212529;
    }
    
    .btn-danger {
      background: #6c757d;
      color: white;
    }
    
    .btn-primary {
      background: #8B2E2E;
      color: white;
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    
    pre {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 0.9rem;
    }
    
    .instructions ol {
      padding-left: 1.5rem;
    }
    
    .instructions li {
      margin: 0.5rem 0;
    }
  `]
})
export class TestRolesComponent implements OnInit {
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<any>;

  constructor(private authService: AuthService) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {}

  testAdminAccess() {
    console.log('🧪 Test accès admin...');
    window.location.href = '/admin';
  }

  testVendorAccess() {
    console.log('🧪 Test accès vendor...');
    window.location.href = '/vendor';
  }

  simulateAdminRole() {
    console.log('👑 Simulation rôle admin...');
    const mockAdminUser = {
      id: 1,
      email: 'admin@test.com',
      first_name: 'Admin',
      last_name: 'Test',
      role: 'admin',
      status: 'active',
      is_verified: true,
      two_factor_enabled: false
    };
    
    localStorage.setItem('user', JSON.stringify(mockAdminUser));
    localStorage.setItem('auth_token', 'mock-admin-token');
    localStorage.setItem('refresh_token', 'mock-refresh-token');
    
    // Recharger les données d'auth
    this.authService['checkAuthState']();
    
    alert('Rôle admin simulé ! Tu peux maintenant tester l\'accès admin.');
  }

  simulateVendorRole() {
    console.log('🛍️ Simulation rôle vendor...');
    const mockVendorUser = {
      id: 2,
      email: 'vendor@test.com',
      first_name: 'Vendor',
      last_name: 'Test',
      role: 'vendor',
      status: 'active',
      is_verified: true,
      two_factor_enabled: false
    };
    
    localStorage.setItem('user', JSON.stringify(mockVendorUser));
    localStorage.setItem('auth_token', 'mock-vendor-token');
    localStorage.setItem('refresh_token', 'mock-refresh-token');
    
    // Recharger les données d'auth
    this.authService['checkAuthState']();
    
    alert('Rôle vendor simulé ! Tu peux maintenant tester l\'accès vendor.');
  }

  clearAuth() {
    this.authService.logout().subscribe(() => {
      alert('Authentification vidée !');
    });
  }

  goToLogin() {
    window.location.href = '/login';
  }
}




