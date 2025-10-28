import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="register-success-container">
      <div class="register-success-card">
        <div class="header">
          <div class="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1>Inscription réussie !</h1>
        </div>
        
        <div class="content">
          <div class="email-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="mail-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <p class="message">
              Un email de vérification a été envoyé à<br>
              <strong>{{ email }}</strong>
            </p>
          </div>

          <div class="instructions">
            <h3>Prochaines étapes :</h3>
            <ol>
              <li>
                <span class="step-number">1</span>
                <span class="step-text">Consultez votre boîte de réception</span>
              </li>
              <li>
                <span class="step-number">2</span>
                <span class="step-text">Cliquez sur le lien de vérification dans l'email</span>
              </li>
              <li>
                <span class="step-number">3</span>
                <span class="step-text">Connectez-vous pour commencer vos achats</span>
              </li>
            </ol>
          </div>

          <div class="actions">
            <button (click)="goToLogin()" class="btn btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Aller à la connexion
            </button>
            
            <div class="resend-section">
              <p>Vous n'avez pas reçu l'email ?</p>
              <button 
                (click)="resendVerificationEmail()" 
                [disabled]="isResending || countdown > 0"
                class="btn btn-secondary">
                <span *ngIf="!isResending && countdown === 0">Renvoyer l'email</span>
                <span *ngIf="isResending">
                  <div class="mini-spinner"></div>
                  Envoi en cours...
                </span>
                <span *ngIf="countdown > 0">Renvoyer dans {{ countdown }}s</span>
              </button>
            </div>
          </div>

          <div class="help-text">
            <p>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              L'email peut prendre quelques minutes pour arriver. N'oubliez pas de vérifier vos spams.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-success-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #FFF9F6 0%, #F5E4D7 100%);
      padding: 20px;
    }
    
    .register-success-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      max-width: 600px;
      width: 100%;
      animation: slideUp 0.5s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .header {
      background: linear-gradient(135deg, #8B2E2E 0%, #D9744F 100%);
      color: white;
      text-align: center;
      padding: 40px 30px;
    }

    .success-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: scaleIn 0.5s ease-out 0.2s both;
    }

    @keyframes scaleIn {
      from {
        transform: scale(0);
      }
      to {
        transform: scale(1);
      }
    }

    .success-icon svg {
      width: 50px;
      height: 50px;
      stroke-width: 2;
    }
    
    .header h1 {
      font-size: 2rem;
      margin: 0;
      font-weight: bold;
    }
    
    .content {
      padding: 40px 30px;
    }

    .email-info {
      text-align: center;
      margin-bottom: 30px;
      padding: 25px;
      background: #FFF9F6;
      border-radius: 15px;
      border: 2px dashed #D9744F;
    }

    .mail-icon {
      width: 50px;
      height: 50px;
      color: #8B2E2E;
      margin-bottom: 15px;
    }

    .message {
      font-size: 1.1rem;
      color: #3A3A3A;
      margin: 0;
      line-height: 1.6;
    }

    .message strong {
      color: #8B2E2E;
      font-weight: 600;
    }

    .instructions {
      margin: 30px 0;
    }

    .instructions h3 {
      color: #8B2E2E;
      font-size: 1.2rem;
      margin-bottom: 20px;
      font-weight: 600;
    }

    .instructions ol {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .instructions li {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
      padding: 15px;
      background: #FFF9F6;
      border-radius: 10px;
      transition: all 0.3s ease;
    }

    .instructions li:hover {
      background: #FFE5D9;
      transform: translateX(5px);
    }

    .step-number {
      width: 35px;
      height: 35px;
      background: linear-gradient(135deg, #8B2E2E 0%, #D9744F 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      flex-shrink: 0;
    }

    .step-text {
      flex: 1;
      color: #3A3A3A;
      font-size: 0.95rem;
    }

    .actions {
      margin-top: 30px;
      text-align: center;
    }

    .btn {
      padding: 14px 30px;
      border: none;
      border-radius: 25px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      justify-content: center;
      text-decoration: none;
    }

    .btn svg {
      width: 20px;
      height: 20px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #8B2E2E 0%, #D9744F 100%);
      color: white;
      width: 100%;
      margin-bottom: 20px;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(139, 46, 46, 0.3);
    }

    .resend-section {
      margin-top: 25px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
    }

    .resend-section p {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 0.9rem;
    }

    .btn-secondary {
      background: white;
      color: #8B2E2E;
      border: 2px solid #8B2E2E;
      padding: 10px 25px;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #8B2E2E;
      color: white;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    .mini-spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #8B2E2E;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .help-text {
      margin-top: 30px;
      text-align: center;
    }

    .help-text p {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: #666;
      font-size: 0.85rem;
      line-height: 1.5;
      margin: 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 10px;
    }

    .help-text svg {
      width: 20px;
      height: 20px;
      color: #8B2E2E;
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      .register-success-card {
        margin: 10px;
      }

      .header {
        padding: 30px 20px;
      }

      .header h1 {
        font-size: 1.5rem;
      }

      .content {
        padding: 30px 20px;
      }

      .message {
        font-size: 1rem;
      }
    }
  `]
})
export class RegisterSuccessComponent implements OnInit {
  email = '';
  isResending = false;
  countdown = 0;
  private countdownInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  resendVerificationEmail(): void {
    if (!this.email || this.isResending || this.countdown > 0) {
      return;
    }

    this.isResending = true;

    this.authService.resendVerification(this.email).subscribe({
      next: (response) => {
        this.isResending = false;
        this.toastService.success('Email de vérification renvoyé avec succès ! 📧');
        
        // Démarrer le compte à rebours de 60 secondes
        this.countdown = 60;
        this.countdownInterval = setInterval(() => {
          this.countdown--;
          if (this.countdown <= 0) {
            clearInterval(this.countdownInterval);
          }
        }, 1000);
      },
      error: (error) => {
        this.isResending = false;
        console.error('Erreur lors du renvoi:', error);
        
        if (error.status === 429) {
          this.toastService.error('Trop de tentatives. Veuillez réessayer plus tard');
        } else {
          this.toastService.error('Erreur lors du renvoi de l\'email');
        }
      }
    });
  }
}
