// src/app/features/profile/components/profile-layout/profile-layout.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  badge?: number;
}

@Component({
  selector: 'app-profile-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './profile-layout.component.html',
  styleUrls: ['./profile-layout.component.scss']
})
export class ProfileLayoutComponent implements OnInit {
  
  isSidebarOpen = false;
  currentRoute = '';
  isEditing = false;
  isSaving = false;
  personalForm: FormGroup;
  
  user: any = null;
  loading = true;

  menuItems: MenuItem[] = [
    {
      path: '/profile',
      label: 'Vue d\'ensemble',
      icon: 'fa-home'
    },
    {
      path: '/profile/personal-info',
      label: 'Informations personnelles',
      icon: 'fa-user'
    },
    {
      path: '/profile/addresses',
      label: 'Mes adresses',
      icon: 'fa-map-marker-alt'
    },
    {
      path: '/profile/order-history',
      label: 'Mes commandes',
      icon: 'fa-shopping-bag'
    },
    {
      path: '/profile/wishlist',
      label: 'Ma liste de souhaits',
      icon: 'fa-heart',
      badge: 5
    },
    {
      path: '/profile/reviews',
      label: 'Mes avis',
      icon: 'fa-star'
    },
    {
      path: '/profile/notifications',
      label: 'Notifications',
      icon: 'fa-bell',
      badge: 3
    },
    {
      path: '/profile/security',
      label: 'Sécurité',
      icon: 'fa-shield-alt'
    },
    {
      path: '/profile/delete-account',
      label: 'Supprimer mon compte',
      icon: 'fa-trash-alt'
    }
  ];

  constructor(
    private router: Router, 
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.personalForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Track current route
    this.currentRoute = this.router.url;
    
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
        this.closeSidebar();
      });
    
    // Load user data
    this.loadUserData();
  }

  loadUserData(): void {
    this.loading = true;
    
    this.userService.getProfile().subscribe({
      next: (response) => {
        console.log('🔍 Données utilisateur reçues (layout):', JSON.stringify(response, null, 2));
        
        // L'API retourne les données dans response.data
        const user = response.data || response;
        
        // Normaliser l'URL de l'avatar (remplacer les backslashes Windows)
        const avatarUrl = user.avatarUrl ? this.normalizeImageUrl(user.avatarUrl) : null;
        
        this.user = {
          name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur',
          email: user.email || '',
          avatar: avatarUrl || 'assets/images/avatar-placeholder.png',
          memberSince: user.createdAt ? new Date(user.createdAt).getFullYear().toString() : '2023'
        };
        console.log('✅ Utilisateur formaté (layout):', JSON.stringify(this.user, null, 2));
        this.loading = false;
        
        // Update form with real data
        this.personalForm.patchValue({
          name: this.user.name,
          email: this.user.email
        });
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement du profil:', error);
        this.loading = false;
        
        // Si erreur d'authentification, rediriger vers la connexion
        if (error.status === 401 || error.status === 403) {
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        }
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  isActive(path: string): boolean {
    if (path === '/profile') {
      return this.currentRoute === '/profile';
    }
    return this.currentRoute.startsWith(path);
  }

  enableEdit(): void {
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.personalForm.patchValue({
      name: this.user.name,
      email: this.user.email
    });
  }

  saveChanges(): void {
    if (this.personalForm.valid) {
      this.isSaving = true;
      
      // Simuler la sauvegarde
      setTimeout(() => {
        const formValue = this.personalForm.value;
        this.user.name = formValue.name;
        this.user.email = formValue.email;
        
        this.isSaving = false;
        this.isEditing = false;
        console.log('Profil mis à jour:', this.user);
      }, 1000);
    }
  }

  /**
   * Normalise une URL d'image en remplaçant les backslashes Windows par des slashes
   */
  normalizeImageUrl(url: string | null): string | null {
    if (!url) return null;
    // Remplacer les backslashes par des slashes
    return url.replace(/\\/g, '/');
  }

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      // TODO: Call auth service logout
      localStorage.removeItem('auth_token');
      this.router.navigate(['/auth/login']);
    }
  }
}