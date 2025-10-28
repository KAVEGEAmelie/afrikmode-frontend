import { Component, OnInit, OnDestroy, AfterViewInit, Renderer2 } from '@angular/core';
import { RouterModule, Router, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
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
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  title = 'AfrikMode';
  isLoading = false;

  constructor(
    private tokenRefreshService: TokenRefreshService,
    private authService: AuthService,
    private router: Router,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Démarrer le service de rafraîchissement automatique des tokens
    // seulement si l'utilisateur est authentifié
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        console.log('🔄 Service de rafraîchissement des tokens démarré');
      }
    });

    // Gérer les événements de navigation pour afficher un loader
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        // Petit délai pour permettre au contenu de se charger avant de masquer le loader
        setTimeout(() => {
          this.isLoading = false;
        }, 100);
      }
    });

    // Remonter en haut de page à chaque navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  ngAfterViewInit(): void {
    // Masquer le loader initial une fois que la vue est complètement initialisée
    setTimeout(() => {
      const loader = document.getElementById('appLoader');
      if (loader) {
        this.renderer.addClass(loader, 'loaded');
        setTimeout(() => {
          if (loader.parentNode) {
            loader.parentNode.removeChild(loader);
          }
        }, 500);
      }
    }, 100);
  }

  ngOnDestroy(): void {
    // Arrêter le timer de rafraîchissement
    this.tokenRefreshService.stopTimer();
  }
}