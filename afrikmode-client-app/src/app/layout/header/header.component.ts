import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ProductService } from '../../core/services/product.service';
import { Cart, Product } from '../../core/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf, NgFor, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated$!: Observable<boolean>;
  currentUser$!: Observable<any>;  
  cartCount$!: Observable<Cart | null>;
  wishlistCount$!: Observable<number>;
  showUserMenu = false; // Pour afficher/masquer le menu utilisateur
  
  // Variables pour la recherche
  searchQuery = '';
  searchResults: Product[] = [];
  showSearchResults = false;
  isSearching = false;
  private searchSubject = new Subject<string>();
  
  // Variables pour gérer le scroll du header
  isHeaderVisible = true;
  private lastScrollTop = 0;
  private scrollThreshold = 5; // Seuil minimum de scroll pour déclencher l'animation
  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private productService: ProductService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
    this.cartCount$ = this.cartService.cart$;
    this.wishlistCount$ = this.wishlistService.wishlistCount$;
    
    // Charger les données si l'utilisateur est déjà authentifié
    const authSub = this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.cartService.loadCartData();
        this.wishlistService.loadWishlistData();
      }
    });
    this.subscriptions.add(authSub);

    // Configurer la recherche en temps réel avec debounce
    const searchSub = this.searchSubject.pipe(
      debounceTime(300), // Attendre 300ms après la dernière saisie
      distinctUntilChanged(), // Ne rechercher que si le texte a changé
      switchMap(query => {
        if (query.trim().length < 2) {
          this.searchResults = [];
          this.showSearchResults = false;
          this.isSearching = false;
          return [];
        }
        this.isSearching = true;
        return this.productService.searchProducts(query, { limit: 5 });
      })
    ).subscribe({
      next: (response: any) => {
        this.searchResults = response.data || response || [];
        this.showSearchResults = this.searchResults.length > 0;
        this.isSearching = false;
      },
      error: (error) => {
        console.error('Erreur de recherche:', error);
        this.searchResults = [];
        this.showSearchResults = false;
        this.isSearching = false;
      }
    });
    this.subscriptions.add(searchSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  /**
   * Gérer la saisie dans la barre de recherche
   */
  onSearchInput(query: string) {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  /**
   * Effectuer la recherche complète
   */
  performSearch(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    
    if (this.searchQuery.trim()) {
      // Fermer les suggestions
      this.showSearchResults = false;
      
      // Naviguer vers la page shop avec le paramètre de recherche
      this.router.navigate(['/shop'], {
        queryParams: { search: this.searchQuery.trim() }
      });
      
      // Réinitialiser la recherche
      this.searchQuery = '';
      this.searchResults = [];
    }
  }

  /**
   * Naviguer vers un produit depuis les suggestions
   */
  goToProduct(productId: string, event: Event) {
    event.stopPropagation();
    this.showSearchResults = false;
    this.searchQuery = '';
    this.searchResults = [];
    this.router.navigate(['/products', productId]);
  }

  /**
   * Fermer les résultats de recherche
   */
  closeSearchResults() {
    setTimeout(() => {
      this.showSearchResults = false;
    }, 200);
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

    // Si on n'a pas scrollé assez (moins de 100px), toujours montrer le header
    if (scrollTop < 100) {
      this.isHeaderVisible = true;
      this.lastScrollTop = scrollTop;
      return;
    }

    // Calculer la différence de scroll
    const scrollDifference = Math.abs(scrollTop - this.lastScrollTop);

    // Ne déclencher l'animation que si le scroll dépasse le seuil
    if (scrollDifference > this.scrollThreshold) {
      if (scrollTop > this.lastScrollTop) {
        // Scroll vers le bas - CACHER le header (utilisateur scrolle vers le bas)
        this.isHeaderVisible = false;
        this.showUserMenu = false; // Fermer le menu aussi
      } else {
        // Scroll vers le haut - MONTRER le header (utilisateur remonte)
        this.isHeaderVisible = true;
      }
      this.lastScrollTop = scrollTop;
    }
  }

  // Fermer le menu quand on clique en dehors
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      if (this.showUserMenu) {
        this.showUserMenu = false;
      }
      if (this.showSearchResults) {
        this.showSearchResults = false;
      }
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
        this.authService.clearAuthData();
        this.router.navigate(['/']);
      }
    });
  }
}
