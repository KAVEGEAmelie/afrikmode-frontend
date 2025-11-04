// src/app/features/admin/pages/appearance/widgets/widgets.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-widgets',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatSlideToggleModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon>widgets</mat-icon>
          Widgets
        </h1>
        <p class="page-subtitle">Gérez les widgets de votre plateforme</p>
      </div>

      <div class="widgets-grid">
        <mat-card class="widget-card">
          <div class="widget-header">
            <mat-icon>message</mat-icon>
            <h3>Chat en Direct</h3>
          </div>
          <p>Support client en temps réel</p>
          <mat-slide-toggle [checked]="true"></mat-slide-toggle>
        </mat-card>

        <mat-card class="widget-card">
          <div class="widget-header">
            <mat-icon>notifications</mat-icon>
            <h3>Notifications Push</h3>
          </div>
          <p>Alertes en temps réel</p>
          <mat-slide-toggle [checked]="true"></mat-slide-toggle>
        </mat-card>

        <mat-card class="widget-card">
          <div class="widget-header">
            <mat-icon>star</mat-icon>
            <h3>Avis Clients</h3>
          </div>
          <p>Afficher les avis sur les produits</p>
          <mat-slide-toggle [checked]="true"></mat-slide-toggle>
        </mat-card>

        <mat-card class="widget-card">
          <div class="widget-header">
            <mat-icon>share</mat-icon>
            <h3>Partage Social</h3>
          </div>
          <p>Boutons de partage social</p>
          <mat-slide-toggle [checked]="false"></mat-slide-toggle>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .admin-page { padding: 24px; background: #f8f9fa; min-height: 100%; }
    .page-header { margin-bottom: 32px; }
    .page-title { display: flex; align-items: center; gap: 12px; margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #1e293b; }
    .page-title mat-icon { font-size: 36px; width: 36px; height: 36px; color: #3b82f6; }
    .page-subtitle { margin: 0; color: #64748b; font-size: 16px; }
    .widgets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
    .widget-card { padding: 24px; border-radius: 16px; }
    .widget-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
    .widget-header mat-icon { color: #3b82f6; font-size: 28px; width: 28px; height: 28px; }
    .widget-header h3 { margin: 0; font-size: 18px; font-weight: 600; }
    .widget-card p { margin: 0 0 16px 0; color: #64748b; }
  `]
})
export class WidgetsComponent {}
