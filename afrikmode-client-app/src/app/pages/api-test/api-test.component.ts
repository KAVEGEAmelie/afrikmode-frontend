import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-api-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="api-test-container">
      <h2>Test de Connexion API</h2>
      
      <div class="test-section">
        <h3>Test de Santé du Backend</h3>
        <button (click)="testHealth()" [disabled]="loading">Tester la Santé</button>
        <div *ngIf="healthResult" class="result">
          <pre>{{ healthResult | json }}</pre>
        </div>
      </div>

      <div class="test-section">
        <h3>Test d'Authentification</h3>
        <div class="auth-form">
          <input [value]="loginData.email" (input)="loginData.email = $event.target.value" placeholder="Email" type="email">
          <input [value]="loginData.password" (input)="loginData.password = $event.target.value" placeholder="Mot de passe" type="password">
          <button (click)="testLogin()" [disabled]="loading">Tester Login</button>
        </div>
        <div *ngIf="authResult" class="result">
          <pre>{{ authResult | json }}</pre>
        </div>
      </div>

      <div class="test-section">
        <h3>Test de Connexion Utilisateur</h3>
        <button (click)="testUserInfo()" [disabled]="loading">Obtenir Info Utilisateur</button>
        <div *ngIf="userResult" class="result">
          <pre>{{ userResult | json }}</pre>
        </div>
      </div>

      <div *ngIf="loading" class="loading">Chargement...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
    </div>
  `,
  styles: [`
    .api-test-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .test-section {
      margin-bottom: 2rem;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .auth-form {
      display: flex;
      gap: 1rem;
      margin: 1rem 0;
    }

    .auth-form input {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    button {
      padding: 0.5rem 1rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .result {
      margin-top: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;
      border-left: 4px solid #28a745;
    }

    .loading {
      color: #007bff;
      font-weight: bold;
    }

    .error {
      color: #dc3545;
      background: #f8d7da;
      padding: 1rem;
      border-radius: 4px;
      border-left: 4px solid #dc3545;
    }
  `]
})
export class ApiTestComponent implements OnInit {
  loading = false;
  error = '';
  healthResult: any = null;
  authResult: any = null;
  userResult: any = null;

  loginData = {
    email: 'test@example.com',
    password: 'password123'
  };

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    console.log('API Test Component initialized');
  }

  testHealth() {
    this.loading = true;
    this.error = '';
    this.healthResult = null;

    this.apiService.get('health').subscribe({
      next: (result) => {
        this.healthResult = result;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Erreur lors du test de santé';
        this.loading = false;
      }
    });
  }

  testLogin() {
    this.loading = true;
    this.error = '';
    this.authResult = null;

    this.authService.login(this.loginData).subscribe({
      next: (result) => {
        this.authResult = result;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Erreur lors de la connexion';
        this.loading = false;
      }
    });
  }

  testUserInfo() {
    this.loading = true;
    this.error = '';
    this.userResult = null;

    this.apiService.get('auth/me').subscribe({
      next: (result) => {
        this.userResult = result;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Erreur lors de la récupération des infos utilisateur';
        this.loading = false;
      }
    });
  }
}