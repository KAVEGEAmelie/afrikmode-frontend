import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  template: `
    <div class="unauthorized-container">
      <mat-card class="unauthorized-card">
        <mat-card-content>
          <div class="error-content">
            <mat-icon class="error-icon">block</mat-icon>
            <h1>Accès Non Autorisé</h1>
            <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
            <p>Contactez votre administrateur si vous pensez qu'il s'agit d'une erreur.</p>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" routerLink="/admin/dashboard">
            <mat-icon>home</mat-icon>
            Retour au Dashboard
          </button>
          <button mat-button routerLink="/admin">
            <mat-icon>arrow_back</mat-icon>
            Retour
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
      padding: 20px;
    }

    .unauthorized-card {
      max-width: 500px;
      width: 100%;
      text-align: center;
    }

    .error-content {
      padding: 20px 0;
    }

    .error-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      color: #f44336;
      margin-bottom: 20px;
    }

    h1 {
      color: #333;
      margin-bottom: 16px;
    }

    p {
      color: #666;
      margin-bottom: 12px;
      line-height: 1.5;
    }

    mat-card-actions {
      justify-content: center;
      gap: 16px;
    }
  `]
})
export class UnauthorizedComponent {}



























































