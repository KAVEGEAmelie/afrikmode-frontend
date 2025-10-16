import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { Cart } from '../../core/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isAuthenticated$!: Observable<boolean>;
  currentUser$!: Observable<any>;  
  cartCount$!: Observable<Cart | null>;
  wishlistCount$!: Observable<number>;
  showUserMenu = false; // Pour afficher/masquer le menu utilisateur
  
  // Variables pour gérer le scroll du header
  isHeaderVisible = true;
  private lastScrollTop = 0;
  private scrollThreshold = 5; // Seuil minimum de scroll pour déclencher l'animation

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
    this.cartCount$ = this.cartService.cart$;
    this.wishlistCount$ = this.wishlistService.wishlistCount$;
    
    // Charger les données si l'utilisateur est déjà authentifié
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.cartService.loadCartData();
        this.wishlistService.loadWishlistData();
      }
    });
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  // Gérer le scroll pour afficher/masquer le header
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Si on est tout en haut, toujours montrer le header
    if (scrollTop <= 0) {
      this.isHeaderVisible = true;
      this.lastScrollTop = scrollTop;
      return;
    }

    // Calculer la différence de scroll
    const scrollDifference = Math.abs(scrollTop - this.lastScrollTop);

    // Ne déclencher l'animation que si le scroll dépasse le seuil
    if (scrollDifference > this.scrollThreshold) {
      if (scrollTop > this.lastScrollTop) {
        // Scroll vers le bas - cacher le header
        this.isHeaderVisible = false;
        this.showUserMenu = false; // Fermer le menu aussi
      } else {
        // Scroll vers le haut - montrer le header
        this.isHeaderVisible = true;
      }
      this.lastScrollTop = scrollTop;
    }
  }

  // Fermer le menu quand on clique en dehors
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside && this.showUserMenu) {
      this.showUserMenu = false;
    }
  }

  logout() {
    this.showUserMenu = false;
    this.authService.logout().subscribe({
      next: () => {
        console.log('✅ Déconnexion réussie');
      },
      error: (error) => {
        console.error('❌ Erreur lors de la déconnexion:', error);
        // Même en cas d'erreur, on déconnecte côté frontend
        this.authService['clearAuthData']();
      }
    });
  }
}
