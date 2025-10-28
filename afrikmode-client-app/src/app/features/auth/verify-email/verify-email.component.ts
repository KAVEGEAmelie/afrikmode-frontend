import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf],
  template: `
    <div class="verify-email-container">
      <div class="verify-email-card">
        <div class="header">
          <h1>AfrikMode</h1>
          <p>Vérification de votre email</p>
        </div>
        
        <div class="content">
          <div *ngIf="isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Vérification en cours...</p>
          </div>
          
          <div *ngIf="!isLoading && isSuccess" class="success-state">
            <div class="success-icon">✅</div>
            <h2>Email vérifié avec succès !</h2>
            <p>Votre compte a été activé. Vous serez redirigé vers la page de connexion dans quelques instants...</p>
            <button (click)="goToLogin()" class="btn btn-primary">
              Se connecter maintenant
            </button>
          </div>
          
          <div *ngIf="!isLoading && isError" class="error-state">
            <div class="error-icon">❌</div>
            <h2>Erreur de vérification</h2>
            <p>{{ errorMessage }}</p>
            <button (click)="goToLogin()" class="btn btn-secondary">
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .verify-email-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #FFF9F6 0%, #F5E4D7 100%);
      padding: 20px;
    }
    
    .verify-email-card {
      background: white;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      max-width: 500px;
      width: 100%;
    }
    
    .header {
      background: linear-gradient(135deg, #8B2E2E 0%, #D9744F 100%);
      color: white;
      text-align: center;
      padding: 30px;
    }
    
    .header h1 {
      font-size: 2rem;
      margin: 0 0 10px 0;
      font-weight: bold;
    }
    
    .header p {
      margin: 0;
      opacity: 0.9;
    }
    
    .content {
      padding: 40px;
      text-align: center;
    }
    
    .loading-state, .success-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
    
    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #8B2E2E;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .success-icon, .error-icon {
      font-size: 4rem;
    }
    
    h2 {
      color: #8B2E2E;
      margin: 0;
    }
    
    p {
      color: #666;
      line-height: 1.6;
      margin: 0;
    }
    
    .btn {
      padding: 12px 30px;
      border: none;
      border-radius: 25px;
      font-weight: bold;
      text-decoration: none;
      display: inline-block;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #8B2E2E 0%, #D9744F 100%);
      color: white;
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(139, 46, 46, 0.3);
    }
    
    .btn-secondary {
      background: #f8f9fa;
      color: #8B2E2E;
      border: 2px solid #8B2E2E;
    }
    
    .btn-secondary:hover {
      background: #8B2E2E;
      color: white;
    }
  `]
})
export class VerifyEmailComponent implements OnInit {
  isLoading = true;
  isSuccess = false;
  isError = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.verifyEmail(token);
      } else {
        this.showError('Token de vérification manquant');
      }
    });
  }

  verifyEmail(token: string): void {
    this.authService.verifyEmail(token).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isSuccess = true;
        console.log('✅ Email vérifié avec succès:', response);
        
        // Rediriger automatiquement vers la page de connexion après 3 secondes
        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: { verified: 'true' }
          });
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.showError(this.getErrorMessage(error));
        console.error('❌ Erreur de vérification:', error);
      }
    });
  }

  private getErrorMessage(error: any): string {
    if (error.status === 400) {
      return 'Token de vérification invalide ou expiré';
    } else if (error.status === 404) {
      return 'Utilisateur non trouvé';
    } else if (error.status === 409) {
      return 'Email déjà vérifié';
    } else {
      return 'Une erreur est survenue lors de la vérification';
    }
  }

  private showError(message: string): void {
    this.isError = true;
    this.errorMessage = message;
  }

  goToLogin(): void {
    this.router.navigate(['/login'], {
      queryParams: { verified: 'true' }
    });
  }
}