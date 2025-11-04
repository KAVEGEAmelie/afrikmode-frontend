import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-email-verification-required',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="verification-required-container">
      <div class="verification-card">
        <div class="header">
          <div class="logo">
            <h1>AfrikMode</h1>
          </div>
        </div>
        
        <div class="content">
          <div class="icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          
          <h2>Vérification email requise</h2>
          
          <p class="message">
            Pour pouvoir devenir vendeur sur AfrikMode, vous devez d'abord vérifier votre adresse email.
          </p>
          
          <div class="email-info" *ngIf="userEmail">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Un email de vérification a été envoyé à <strong>{{ userEmail }}</strong></span>
          </div>
          
          <div class="instructions">
            <h3>Que faire maintenant ?</h3>
            <ol>
              <li>Consultez votre boîte email (vérifiez aussi les spams)</li>
              <li>Cliquez sur le lien de vérification dans l'email</li>
              <li>Revenez ici et connectez-vous à nouveau</li>
            </ol>
          </div>
          
          <div class="alert alert-info" *ngIf="resendSuccess">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Email de vérification renvoyé avec succès !
          </div>
          
          <div class="alert alert-error" *ngIf="resendError">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {{ resendError }}
          </div>
          
          <div class="actions">
            <button 
              class="btn btn-primary"
              (click)="resendVerificationEmail()"
              [disabled]="isResending || resendCooldown > 0">
              <svg *ngIf="!isResending" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z" />
              </svg>
              <div class="spinner" *ngIf="isResending"></div>
              <span *ngIf="resendCooldown === 0">{{ isResending ? 'Envoi en cours...' : 'Renvoyer l\'email' }}</span>
              <span *ngIf="resendCooldown > 0">Renvoyer dans {{ resendCooldown }}s</span>
            </button>
            
            <button class="btn btn-secondary" (click)="goToHome()">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Retour à l'accueil
            </button>
            
            <button class="btn btn-link" (click)="logout()">
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .verification-required-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #FFF9F6 0%, #F5E4D7 100%);
      padding: 20px;
    }
    
    .verification-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      max-width: 600px;
      width: 100%;
      animation: slideUp 0.5s ease;
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
      padding: 30px;
      text-align: center;
    }
    
    .logo h1 {
      color: white;
      font-size: 2.5rem;
      margin: 0;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .content {
      padding: 40px;
    }
    
    .icon-wrapper {
      display: flex;
      justify-content: center;
      margin-bottom: 25px;
    }
    
    .icon-wrapper svg {
      width: 80px;
      height: 80px;
      color: #8B2E2E;
      background: #FFF9F6;
      padding: 15px;
      border-radius: 50%;
      box-shadow: 0 5px 15px rgba(139, 46, 46, 0.2);
    }
    
    h2 {
      text-align: center;
      color: #8B2E2E;
      font-size: 1.8rem;
      margin: 0 0 20px 0;
      font-weight: bold;
    }
    
    .message {
      text-align: center;
      color: #666;
      font-size: 1.1rem;
      line-height: 1.6;
      margin: 0 0 30px 0;
    }
    
    .email-info {
      background: #E8F5E9;
      border: 1px solid #4CAF50;
      border-radius: 10px;
      padding: 15px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 20px 0;
    }
    
    .email-info svg {
      width: 24px;
      height: 24px;
      color: #4CAF50;
      flex-shrink: 0;
    }
    
    .email-info span {
      color: #2E7D32;
      font-size: 0.95rem;
    }
    
    .instructions {
      background: #F5F7FA;
      border-radius: 10px;
      padding: 25px;
      margin: 25px 0;
    }
    
    .instructions h3 {
      color: #8B2E2E;
      margin: 0 0 15px 0;
      font-size: 1.1rem;
    }
    
    .instructions ol {
      margin: 0;
      padding-left: 20px;
      color: #555;
    }
    
    .instructions li {
      margin: 10px 0;
      line-height: 1.6;
    }
    
    .alert {
      padding: 15px;
      border-radius: 10px;
      margin: 20px 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .alert svg {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }
    
    .alert-info {
      background: #E3F2FD;
      border: 1px solid #2196F3;
      color: #1565C0;
    }
    
    .alert-error {
      background: #FFEBEE;
      border: 1px solid #F44336;
      color: #C62828;
    }
    
    .actions {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-top: 30px;
    }
    
    .btn {
      padding: 15px 30px;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      text-decoration: none;
    }
    
    .btn svg {
      width: 20px;
      height: 20px;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #8B2E2E 0%, #D9744F 100%);
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(139, 46, 46, 0.3);
    }
    
    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .btn-secondary {
      background: white;
      color: #8B2E2E;
      border: 2px solid #8B2E2E;
    }
    
    .btn-secondary:hover {
      background: #8B2E2E;
      color: white;
    }
    
    .btn-link {
      background: transparent;
      color: #8B2E2E;
      padding: 10px;
      font-size: 0.95rem;
    }
    
    .btn-link:hover {
      text-decoration: underline;
    }
    
    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top: 3px solid white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
      .verification-card {
        margin: 10px;
      }
      
      .content {
        padding: 25px;
      }
      
      h2 {
        font-size: 1.5rem;
      }
      
      .message {
        font-size: 1rem;
      }
    }
  `]
})
export class EmailVerificationRequiredComponent implements OnInit {
  userEmail: string = '';
  returnUrl: string = '/';
  isResending: boolean = false;
  resendSuccess: boolean = false;
  resendError: string = '';
  resendCooldown: number = 0;
  private cooldownInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Get user email from current user
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userEmail = currentUser.email || '';
    }

    // Get return URL from query params
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/';
    });

    // If user is already verified, redirect
    if (currentUser?.is_verified) {
      this.router.navigate([this.returnUrl]);
    }
  }

  ngOnDestroy(): void {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
  }

  resendVerificationEmail(): void {
    if (this.isResending || this.resendCooldown > 0) return;

    this.isResending = true;
    this.resendSuccess = false;
    this.resendError = '';

    this.authService.resendVerification(this.userEmail).subscribe({
      next: (response) => {
        this.isResending = false;
        this.resendSuccess = true;
        this.toastService.success('Email de vérification renvoyé avec succès !');
        
        // Start cooldown timer (60 seconds)
        this.startCooldown(60);
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          this.resendSuccess = false;
        }, 5000);
      },
      error: (error) => {
        this.isResending = false;
        console.error('Error resending verification email:', error);
        
        if (error.status === 429) {
          this.resendError = 'Trop de tentatives. Veuillez patienter avant de réessayer.';
          this.startCooldown(60);
        } else if (error.status === 409) {
          this.resendError = 'Votre email est déjà vérifié.';
        } else {
          this.resendError = error.error?.message || 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.';
        }
        
        this.toastService.error(this.resendError);
      }
    });
  }

  private startCooldown(seconds: number): void {
    this.resendCooldown = seconds;
    this.cooldownInterval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.cooldownInterval);
      }
    }, 1000);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
