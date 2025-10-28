import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FlaggedContent {
  id: string;
  type: 'product' | 'review';
  title: string;
  vendor_name: string;
  reason: string;
  reported_by: string;
  reported_at: string;
  status: 'pending' | 'approved' | 'removed';
}

@Component({
  selector: 'app-admin-content-moderation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="moderation-page">
      <div class="page-header">
        <h1>Modération du Contenu</h1>
        <p class="subtitle">Gérez les produits et avis signal és</p>
      </div>

      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'products'" (click)="activeTab = 'products'">
          Produits signal és ({{ getFlagged('product').length }})
        </button>
        <button class="tab" [class.active]="activeTab === 'reviews'" (click)="activeTab = 'reviews'">
          Avis signalés ({{ getFlagged('review').length }})
        </button>
      </div>

      <div class="content-list">
        <div *ngFor="let item of getFlagged(activeTab === 'products' ? 'product' : 'review')" class="content-card">
          <div class="content-header">
            <h3>{{ item.title }}</h3>
            <span class="status-badge" [class]="item.status">{{ item.status }}</span>
          </div>
          <p class="vendor-info">Vendeur: {{ item.vendor_name }}</p>
          <p class="reason">Raison: {{ item.reason }}</p>
          <p class="meta">Signalé par {{ item.reported_by }} le {{ formatDate(item.reported_at) }}</p>
          <div class="actions" *ngIf="item.status === 'pending'">
            <button class="btn btn-approve" (click)="approveContent(item)">Approuver</button>
            <button class="btn btn-remove" (click)="removeContent(item)">Retirer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .moderation-page { padding: 2rem; background: #f8f9fa; min-height: 100vh; }
    .page-header h1 { font-size: 2rem; font-weight: 700; color: #2c3e50; margin: 0 0 0.5rem 0; }
    .subtitle { color: #6c757d; margin-bottom: 2rem; }
    .tabs { display: flex; gap: 1rem; margin-bottom: 2rem; }
    .tab { padding: 0.75rem 1.5rem; border: none; background: white; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
    .tab.active { background: #8B2E2E; color: white; }
    .content-list { display: flex; flex-direction: column; gap: 1rem; }
    .content-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .status-badge { padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600; }
    .status-badge.pending { background: #fff3cd; color: #856404; }
    .status-badge.approved { background: #d4edda; color: #155724; }
    .status-badge.removed { background: #f8d7da; color: #721c24; }
    .actions { display: flex; gap: 1rem; margin-top: 1rem; }
    .btn { padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-approve { background: #28a745; color: white; }
    .btn-remove { background: #dc3545; color: white; }
  `]
})
export class AdminContentModerationComponent implements OnInit {
  activeTab = 'products';
  flaggedContent: FlaggedContent[] = [];

  ngOnInit() {
    this.flaggedContent = [
      {
        id: '1',
        type: 'product',
        title: 'Robe Ankara Premium',
        vendor_name: 'Boutique Diallo',
        reason: 'Images inappropriées',
        reported_by: 'Client anonyme',
        reported_at: '2025-10-20',
        status: 'pending'
      },
      {
        id: '2',
        type: 'review',
        title: 'Avis sur "Chemise Wax"',
        vendor_name: 'Kente Royale',
        reason: 'Langage offensant',
        reported_by: 'Système automatique',
        reported_at: '2025-10-19',
        status: 'pending'
      }
    ];
  }

  getFlagged(type: string) {
    return this.flaggedContent.filter(item => item.type === type);
  }

  formatDate(date: string) {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  approveContent(item: FlaggedContent) {
    item.status = 'approved';
    console.log('✅ Approuvé:', item);
  }

  removeContent(item: FlaggedContent) {
    item.status = 'removed';
    console.log('❌ Retiré:', item);
  }
}
