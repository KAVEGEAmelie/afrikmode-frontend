// src/app/features/admin/pages/appearance/homepage/homepage.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatSlideToggleModule, FormsModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon>home</mat-icon>
          Page d'Accueil
        </h1>
        <p class="page-subtitle">Configurez l'affichage de la page d'accueil</p>
      </div>

      <mat-card class="section-card">
        <h3>Sections de la page</h3>
        <div class="section-item">
          <div>
            <h4>Bannière Hero</h4>
            <p>Grande bannière en haut de page</p>
          </div>
          <mat-slide-toggle [checked]="true"></mat-slide-toggle>
        </div>
        <div class="section-item">
          <div>
            <h4>Catégories Populaires</h4>
            <p>Afficher les catégories principales</p>
          </div>
          <mat-slide-toggle [checked]="true"></mat-slide-toggle>
        </div>
        <div class="section-item">
          <div>
            <h4>Produits Tendance</h4>
            <p>Produits mis en avant</p>
          </div>
          <mat-slide-toggle [checked]="true"></mat-slide-toggle>
        </div>
        <div class="section-item">
          <div>
            <h4>Nouveautés</h4>
            <p>Derniers produits ajoutés</p>
          </div>
          <mat-slide-toggle [checked]="true"></mat-slide-toggle>
        </div>
      </mat-card>

      <button mat-raised-button color="primary" class="save-btn">
        <mat-icon>save</mat-icon>
        Enregistrer les modifications
      </button>
    </div>
  `,
  styles: [`
    .admin-page { padding: 24px; background: #f8f9fa; min-height: 100%; }
    .page-header { margin-bottom: 32px; }
    .page-title { display: flex; align-items: center; gap: 12px; margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #1e293b; }
    .page-title mat-icon { font-size: 36px; width: 36px; height: 36px; color: #3b82f6; }
    .page-subtitle { margin: 0; color: #64748b; font-size: 16px; }
    .section-card { padding: 32px; margin-bottom: 24px; border-radius: 16px; }
    .section-card h3 { margin: 0 0 24px 0; font-size: 18px; font-weight: 600; }
    .section-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid #e2e8f0; }
    .section-item:last-child { border-bottom: none; }
    .section-item h4 { margin: 0 0 4px 0; font-size: 16px; font-weight: 600; }
    .section-item p { margin: 0; font-size: 14px; color: #64748b; }
    .save-btn { height: 48px; padding: 0 32px; font-weight: 600; }
    .save-btn mat-icon { margin-right: 8px; }
  `]
})
export class HomepageComponent {}
