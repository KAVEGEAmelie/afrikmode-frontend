import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { TokenRefreshService } from './core/services/token-refresh.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    NavbarComponent,
    FooterComponent,
    ToastContainerComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'AfrikMode';

  constructor(
    private tokenRefreshService: TokenRefreshService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Démarrer le service de rafraîchissement automatique des tokens
    // seulement si l'utilisateur est authentifié
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        console.log('🔄 Service de rafraîchissement des tokens démarré');
      }
    });
  }

  ngOnDestroy(): void {
    // Arrêter le timer de rafraîchissement
    this.tokenRefreshService.stopTimer();
  }
}