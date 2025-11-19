import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter, take } from 'rxjs/operators';
import { NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ProductService } from '../../core/services/product.service';
import { VendorApplicationService } from '../../core/services/vendor-application.service';
import { StoreService } from '../../core/services/store.service';
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
  
  // Variables pour le bouton vendeur intelligent
  vendorApplicationStatus: 'none' | 'pending' | 'approved' | 'rejected' = 'none';
  vendorButtonText: string = 'Devenir vendeur';
  vendorButtonRoute: string = '/vendor/apply';
  vendorButtonQueryParams: any = {};
  isCheckingVendorStatus = false;
  
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
    private storeService: StoreService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private productService: ProductService,
    private vendorApplicationService: VendorApplicationService,
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
        // Vérifier le statut de la candidature vendeur
        this.checkVendorStatus();
      } else {
        // Réinitialiser le statut vendeur si déconnecté
        this.resetVendorStatus();
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

    // Écouter les changements de route pour re-vérifier le statut
    const routeSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      debounceTime(500) // Attendre 500ms après la navigation
    ).subscribe(() => {
      // Re-vérifier le statut après chaque navigation
      // Utiliser take(1) pour prendre une seule valeur et se désabonner automatiquement
      this.authService.isAuthenticated$.pipe(
        take(1),
        filter(isAuth => isAuth === true)
      ).subscribe(() => {
        this.checkVendorStatus();
      });
    });
    this.subscriptions.add(routeSub);

    // Écouter les événements de création de boutique
    const storeCreatedSub = this.storeService.storeCreated$.subscribe(() => {
      console.log('🔄 Boutique créée - Mise à jour du statut...');
      // Re-vérifier le statut après création d'une boutique
      setTimeout(() => {
        this.checkVendorStatus();
      }, 1000);
    });
    this.subscriptions.add(storeCreatedSub);
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
        // Scroll vers le bas - CACHER le header
        this.isHeaderVisible = false;
        this.showUserMenu = false;
      } else {
        // Scroll vers le haut - MONTRER le header
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

  /**
   * Vérifier le statut des boutiques de l'utilisateur
   * Utilise le nouvel endpoint /api/stores/my/status qui vérifie les boutiques réelles
   */
  private checkVendorStatus(): void {
    this.isCheckingVendorStatus = true;
    console.log('🔍 Vérification du statut des boutiques...');
    
    this.storeService.getMyStoresStatus().subscribe({
      next: (response) => {
        this.isCheckingVendorStatus = false;
        console.log('📥 Statut boutiques reçu:', response);
        
        if (response.success && response.data) {
          const { buttonStatus, buttonText, buttonRoute } = response.data;
          
          // Mapper le buttonStatus vers vendorApplicationStatus
          if (buttonStatus === 'active') {
            this.vendorApplicationStatus = 'approved';
            this.vendorButtonText = buttonText || 'Mon Dashboard';
            this.vendorButtonRoute = buttonRoute || '/vendor/dashboard';
            this.vendorButtonQueryParams = {};
            console.log('✅ Boutique active - Dashboard disponible');
          } else if (buttonStatus === 'pending') {
            this.vendorApplicationStatus = 'pending';
            this.vendorButtonText = buttonText || 'Suivre ma candidature';
            // Parser la route pour extraire le path et les query params
            const routeParts = (buttonRoute || '/vendor/application-status').split('?');
            this.vendorButtonRoute = routeParts[0];
            // Extraire les query params
            if (routeParts.length > 1) {
              const params = new URLSearchParams(routeParts[1]);
              this.vendorButtonQueryParams = {};
              params.forEach((value, key) => {
                this.vendorButtonQueryParams[key] = value;
              });
            } else {
              // Si pas de query params dans buttonRoute, essayer de les récupérer depuis latestStore
              if (response.data.latestStore?.applicationNumber) {
                this.vendorButtonQueryParams = { number: response.data.latestStore.applicationNumber };
              } else {
                this.vendorButtonQueryParams = {};
              }
            }
            console.log('⏳ Boutique en attente - Suivi disponible', this.vendorButtonQueryParams);
          } else {
            // Aucune boutique (buttonStatus === 'none')
            this.resetVendorStatus();
            console.log('ℹ️ Aucune boutique - affichage bouton par défaut');
          }
        } else {
          this.resetVendorStatus();
        }
      },
      error: (error) => {
        this.isCheckingVendorStatus = false;
        console.error('❌ Erreur checkVendorStatus:', error);
        // En cas d'erreur, afficher le bouton par défaut
        this.resetVendorStatus();
        console.log('ℹ️ Erreur ou aucune boutique trouvée');
      }
    });
  }

  /**
   * Réinitialiser le statut vendeur aux valeurs par défaut
   */
  private resetVendorStatus(): void {
    this.vendorApplicationStatus = 'none';
    this.vendorButtonText = 'Devenir vendeur';
    this.vendorButtonRoute = '/vendor/apply';
    this.vendorButtonQueryParams = {};
  }
}
