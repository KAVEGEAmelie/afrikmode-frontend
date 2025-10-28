import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="unauthorized-container">
      <div class="error-content">
        <h1>🚫 Accès Non Autorisé</h1>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <p>Votre rôle actuel ne vous permet pas d'accéder à cette section.</p>
        
        <div class="actions">
          <a routerLink="/" class="btn btn-primary">Retour à l'accueil</a>
          <a routerLink="/debug-auth" class="btn btn-secondary">Debug Auth</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f8f9fa;
    }
    
    .error-content {
      text-align: center;
      background: white;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      max-width: 500px;
    }
    
    h1 {
      color: #dc3545;
      margin-bottom: 1rem;
    }
    
    p {
      color: #6c757d;
      margin-bottom: 1rem;
    }
    
    .actions {
      margin-top: 2rem;
    }
    
    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      margin: 0.5rem;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
    }
    
    .btn-primary {
      background: #8B2E2E;
      color: white;
    }
    
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
  `]
})
export class UnauthorizedComponent {}