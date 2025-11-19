import { Injectable, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrollService implements OnDestroy {
  private subscription: Subscription;

  constructor(private router: Router) {
    // Écouter les événements de navigation
    this.subscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.scrollToTop();
      });
  }

  /**
   * Scroll vers le haut de la page
   */
  scrollToTop(): void {
    // Essayer plusieurs méthodes pour garantir le scroll
    if (typeof window !== 'undefined') {
      // Méthode 1: window.scrollTo (scroll instantané)
      window.scrollTo(0, 0);
      
      // Méthode 2: Fallback pour document.documentElement
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      
      // Méthode 3: Fallback pour document.body (anciens navigateurs)
      if (document.body) {
        document.body.scrollTop = 0;
      }
      
      // Méthode 4: window.scrollTo avec options (si supporté)
      try {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto' // 'auto' = instantané
        });
      } catch (e) {
        // Ignorer si non supporté
      }
    }
  }

  /**
   * Scroll vers le haut avec animation
   */
  scrollToTopSmooth(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}



