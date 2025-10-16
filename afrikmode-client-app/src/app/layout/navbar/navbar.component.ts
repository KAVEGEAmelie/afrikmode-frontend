import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive, NgIf, NgFor],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  categories = [
    { 
      name: 'Nouveautés', 
      path: '/nouveautes', 
      icon: '✨',
      description: 'Découvrez nos dernières collections',
      isHotItem: true
    },
    { 
      name: 'Femmes', 
      path: '/femmes', 
      icon: '👗',
      description: 'Mode féminine africaine contemporaine',
      subcategories: ['robes', 'tops', 'jupes', 'pantalons']
    },
    { 
      name: 'Hommes', 
      path: '/hommes', 
      icon: '👔',
      description: 'Élégance masculine africaine',
      subcategories: ['chemises', 'pantalons', 'costumes', 'accessoires']
    },
    { 
      name: 'Enfants', 
      path: '/enfants', 
      icon: '🧸',
      description: 'Mode enfantine colorée et confortable',
      subcategories: ['filles', 'garçons', 'bébés']
    },
    { 
      name: 'Accessoires', 
      path: '/accessoires', 
      icon: '👜',
      description: 'Complétez votre look avec style',
      subcategories: ['sacs', 'bijoux', 'chaussures', 'foulards']
    },
    { 
      name: 'Promotions', 
      path: '/promotions', 
      icon: '🔥',
      description: 'Offres exceptionnelles limitées',
      isHotItem: true,
      badge: 'Jusqu\'à -50%'
    }
  ];

  isMobileMenuOpen = false;

  constructor() {}

  ngOnInit() {}

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Fermer le menu mobile en cliquant à côté
  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  // Gérer les sous-catégories
  onCategoryHover(category: any) {
    // Logique pour afficher les sous-catégories au hover
    console.log('Hovering category:', category.name);
  }

  // Analytics - tracker les clics sur les boutons
  trackCategoryClick(categoryName: string, categoryPath: string) {
    console.log(`Clicked on ${categoryName} - Path: ${categoryPath}`);
    // Ici vous pouvez ajouter Google Analytics ou autre tracking
  }
}