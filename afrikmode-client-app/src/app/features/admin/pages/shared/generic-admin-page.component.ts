// Generic Admin Page Component
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-generic-admin-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon>{{ icon }}</mat-icon>
          {{ title }}
        </h1>
        <p class="page-subtitle">{{ subtitle }}</p>
      </div>

      <mat-card class="content-card">
        <p class="info-text">
          <mat-icon>info</mat-icon>
          {{ message }}
        </p>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-page { padding: 24px; background: #f8f9fa; min-height: 100vh; }
    .page-header { margin-bottom: 24px; }
    .page-title { display: flex; align-items: center; gap: 12px; margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #1e293b; }
    .page-title mat-icon { font-size: 36px; width: 36px; height: 36px; color: #3b82f6; }
    .page-subtitle { margin: 0; color: #64748b; font-size: 16px; }
    .content-card { padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .info-text { display: flex; align-items: center; gap: 8px; padding: 16px; background: #dbeafe; border-radius: 8px; color: #1e40af; margin: 0; }
    .info-text mat-icon { color: #3b82f6; }
  `]
})
export class GenericAdminPageComponent {
  title: string = '';
  subtitle: string = '';
  message: string = '';
  icon: string = 'dashboard';

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(data => {
      this.title = data['title'] || 'Page Admin';
      this.subtitle = data['subtitle'] || 'Gestion de la section';
      this.message = data['message'] || 'Cette fonctionnalité est en cours de développement.';
      this.icon = data['icon'] || 'dashboard';
    });
  }
}
