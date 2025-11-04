// src/app/features/admin/pages/appearance/menus/menus.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-menus',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatListModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">
            <mat-icon>menu</mat-icon>
            Gestion des Menus
          </h1>
          <p class="page-subtitle">Configurez les menus de navigation</p>
        </div>
        <button mat-raised-button color="primary">
          <mat-icon>add</mat-icon>
          Nouveau Menu
        </button>
      </div>

      <mat-card class="menu-card">
        <h3>Menu Principal</h3>
        <mat-list>
          <mat-list-item>
            <mat-icon matListItemIcon>home</mat-icon>
            <span matListItemTitle>Accueil</span>
            <button mat-icon-button matListItemMeta>
              <mat-icon>edit</mat-icon>
            </button>
          </mat-list-item>
          <mat-list-item>
            <mat-icon matListItemIcon>category</mat-icon>
            <span matListItemTitle>Catégories</span>
            <button mat-icon-button matListItemMeta>
              <mat-icon>edit</mat-icon>
            </button>
          </mat-list-item>
          <mat-list-item>
            <mat-icon matListItemIcon>store</mat-icon>
            <span matListItemTitle>Boutiques</span>
            <button mat-icon-button matListItemMeta>
              <mat-icon>edit</mat-icon>
            </button>
          </mat-list-item>
          <mat-list-item>
            <mat-icon matListItemIcon>contact_support</mat-icon>
            <span matListItemTitle>Contact</span>
            <button mat-icon-button matListItemMeta>
              <mat-icon>edit</mat-icon>
            </button>
          </mat-list-item>
        </mat-list>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-page { padding: 24px; background: #f8f9fa; min-height: 100%; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .page-title { display: flex; align-items: center; gap: 12px; margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #1e293b; }
    .page-title mat-icon { font-size: 36px; width: 36px; height: 36px; color: #3b82f6; }
    .page-subtitle { margin: 0; color: #64748b; font-size: 16px; }
    .menu-card { padding: 24px; border-radius: 16px; }
    .menu-card h3 { margin: 0 0 16px 0; font-size: 18px; font-weight: 600; }
  `]
})
export class MenusComponent {}
