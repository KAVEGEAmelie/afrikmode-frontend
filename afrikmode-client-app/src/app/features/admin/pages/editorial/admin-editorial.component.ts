import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface BlogPost {
  id: string;
  title: string;
  status: 'draft' | 'published';
  created_at: string;
}

@Component({
  selector: 'app-admin-editorial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="editorial-page">
      <div class="page-header">
        <h1>Contenu Éditorial</h1>
        <p class="subtitle">Gérez les articles, bannières et newsletters</p>
      </div>

      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'blog'" (click)="activeTab = 'blog'">Articles Blog</button>
        <button class="tab" [class.active]="activeTab === 'featured'" (click)="activeTab = 'featured'">Mise en Avant</button>
        <button class="tab" [class.active]="activeTab === 'banners'" (click)="activeTab = 'banners'">Bannières</button>
        <button class="tab" [class.active]="activeTab === 'newsletter'" (click)="activeTab = 'newsletter'">Newsletters</button>
      </div>

      <!-- Blog -->
      <div *ngIf="activeTab === 'blog'" class="content-section">
        <div class="section-header">
          <h2>Articles de Blog</h2>
          <button class="btn-primary" (click)="createBlogPost()">Nouvel article</button>
        </div>
        <div class="blog-list">
          <div *ngFor="let post of blogPosts" class="blog-item">
            <h3>{{ post.title }}</h3>
            <span class="status-badge" [class]="post.status">{{ post.status }}</span>
            <p class="date">{{ formatDate(post.created_at) }}</p>
            <div class="actions">
              <button class="btn-edit">Modifier</button>
              <button class="btn-delete">Supprimer</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mise en Avant -->
      <div *ngIf="activeTab === 'featured'" class="content-section">
        <div class="section-header">
          <h2>Produits & Vendeurs en Vedette</h2>
          <button class="btn-primary" (click)="addFeatured()">Ajouter à la une</button>
        </div>
        <div class="featured-grid">
          <div class="featured-card">
            <div class="featured-image">📦</div>
            <h4>Produit: Robe Ankara Premium</h4>
            <p>Vendeur: Diallo Mode</p>
            <button class="btn-remove">Retirer</button>
          </div>
          <div class="featured-card">
            <div class="featured-image">🏪</div>
            <h4>Boutique: Kente Royale</h4>
            <p>Vendeur vedette du mois</p>
            <button class="btn-remove">Retirer</button>
          </div>
        </div>
      </div>

      <!-- Bannières -->
      <div *ngIf="activeTab === 'banners'" class="content-section">
        <div class="section-header">
          <h2>Bannières Page d'Accueil</h2>
          <button class="btn-primary" (click)="uploadBanner()">Nouvelle bannière</button>
        </div>
        <div class="banners-list">
          <div class="banner-item">
            <div class="banner-preview">🖼️ Banner 1 - Promo Halloween</div>
            <label class="toggle-switch">
              <input type="checkbox" checked>
              <span class="slider"></span>
            </label>
          </div>
          <div class="banner-item">
            <div class="banner-preview">🖼️ Banner 2 - Nouvelle Collection</div>
            <label class="toggle-switch">
              <input type="checkbox">
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Newsletter -->
      <div *ngIf="activeTab === 'newsletter'" class="content-section">
        <div class="section-header">
          <h2>Campagnes Newsletter</h2>
          <button class="btn-primary" (click)="createNewsletter()">Nouvelle campagne</button>
        </div>
        <div class="newsletter-form">
          <div class="form-group">
            <label>Sujet</label>
            <input type="text" [(ngModel)]="newsletterSubject" class="form-input" placeholder="Ex: Offres spéciales du mois">
          </div>
          <div class="form-group">
            <label>Message</label>
            <textarea [(ngModel)]="newsletterMessage" class="form-textarea" rows="6"></textarea>
          </div>
          <div class="form-group">
            <label>Destinataires</label>
            <select [(ngModel)]="newsletterTarget" class="form-select">
              <option value="all">Tous les utilisateurs</option>
              <option value="customers">Clients uniquement</option>
              <option value="vendors">Vendeurs uniquement</option>
            </select>
          </div>
          <button class="btn-send">Envoyer la newsletter</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .editorial-page { padding: 2rem; background: #f8f9fa; min-height: 100vh; }
    .page-header h1 { font-size: 2rem; font-weight: 700; color: #2c3e50; margin: 0 0 0.5rem 0; }
    .subtitle { color: #6c757d; margin-bottom: 2rem; }
    .tabs { display: flex; gap: 1rem; margin-bottom: 2rem; }
    .tab { padding: 0.75rem 1.5rem; border: none; background: white; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
    .tab.active { background: #8B2E2E; color: white; }
    .content-section { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .section-header h2 { margin: 0; font-size: 1.25rem; color: #2c3e50; }
    .btn-primary { padding: 0.75rem 1.5rem; background: #8B2E2E; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .blog-list { display: flex; flex-direction: column; gap: 1rem; }
    .blog-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
    .blog-item h3 { margin: 0; font-size: 1rem; flex: 1; }
    .status-badge { padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600; margin: 0 1rem; }
    .status-badge.draft { background: #fff3cd; color: #856404; }
    .status-badge.published { background: #d4edda; color: #155724; }
    .date { color: #6c757d; font-size: 0.875rem; margin: 0 1rem; }
    .actions { display: flex; gap: 0.5rem; }
    .btn-edit, .btn-delete { padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
    .btn-edit { background: #8B2E2E; color: white; }
    .btn-delete { background: #dc3545; color: white; }
    .featured-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
    .featured-card { padding: 1.5rem; background: #f8f9fa; border-radius: 8px; text-align: center; }
    .featured-image { font-size: 3rem; margin-bottom: 1rem; }
    .featured-card h4 { margin: 0 0 0.5rem 0; }
    .featured-card p { color: #6c757d; margin: 0 0 1rem 0; }
    .btn-remove { padding: 0.5rem 1rem; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; width: 100%; }
    .banners-list { display: flex; flex-direction: column; gap: 1rem; }
    .banner-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
    .banner-preview { font-size: 1.5rem; }
    .toggle-switch { position: relative; display: inline-block; width: 48px; height: 24px; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-switch input:checked + .slider { background-color: #28a745; }
    .toggle-switch input:checked + .slider:before { transform: translateX(24px); }
    .slider { position: absolute; cursor: pointer; inset: 0; background-color: #ccc; transition: 0.4s; border-radius: 24px; }
    .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: 0.4s; border-radius: 50%; }
    .newsletter-form { max-width: 600px; }
    .form-group { margin-bottom: 1.5rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #495057; }
    .form-input, .form-textarea, .form-select { width: 100%; padding: 0.75rem; border: 1px solid #ced4da; border-radius: 8px; font-family: inherit; }
    .btn-send { padding: 0.75rem 1.5rem; background: #28a745; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
  `]
})
export class AdminEditorialComponent implements OnInit {
  activeTab = 'blog';
  blogPosts: BlogPost[] = [];
  newsletterSubject = '';
  newsletterMessage = '';
  newsletterTarget = 'all';

  ngOnInit() {
    this.blogPosts = [
      { id: '1', title: 'Les tendances mode africaine 2025', status: 'published', created_at: '2025-10-15' },
      { id: '2', title: 'Guide d\'achat tissus traditionnels', status: 'draft', created_at: '2025-10-18' }
    ];
  }

  formatDate(date: string) {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  createBlogPost() { console.log('📝 Créer article'); }
  addFeatured() { console.log('⭐ Ajouter à la une'); }
  uploadBanner() { console.log('🖼️ Upload bannière'); }
  createNewsletter() { console.log('📧 Créer newsletter'); }
}
