import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { VendorService } from '../../../../core/services/vendor.service';

interface Promotion {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'shipping';
  value: number;
  code: string;
  status: 'active' | 'scheduled' | 'expired' | 'paused';
  start_date: string;
  end_date: string;
  usage_count: number;
  usage_limit?: number;
}

@Component({
  selector: 'app-vendor-marketing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatMenuModule
  ],
  template: `
    <div class="vendor-marketing">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>
            <mat-icon>campaign</mat-icon>
            Marketing & Promotions
          </h1>
          <p>Créez des campagnes marketing pour booster vos ventes</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="createPromotion()">
            <mat-icon>add</mat-icon>
            Nouvelle Promotion
          </button>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon active">
            <mat-icon>local_offer</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ activePromotions }}</h3>
            <p>Promotions Actives</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon uses">
            <mat-icon>redeem</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ totalUses }}</h3>
            <p>Utilisations</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon revenue">
            <mat-icon>trending_up</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ revenueFromPromos | number:'1.0-0' }} FCFA</h3>
            <p>Revenus Promotions</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon conversion">
            <mat-icon>percent</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ conversionRate }}%</h3>
            <p>Taux de Conversion</p>
          </div>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="quick-actions">
        <mat-card class="action-card" (click)="createCouponCode()">
          <mat-icon>confirmation_number</mat-icon>
          <h3>Code Promo</h3>
          <p>Créer un code de réduction</p>
        </mat-card>

        <mat-card class="action-card" (click)="createFlashSale()">
          <mat-icon>flash_on</mat-icon>
          <h3>Vente Flash</h3>
          <p>Offre limitée dans le temps</p>
        </mat-card>

        <mat-card class="action-card" (click)="createBundleOffer()">
          <mat-icon>inventory_2</mat-icon>
          <h3>Pack Produits</h3>
          <p>Offre groupée de produits</p>
        </mat-card>

        <mat-card class="action-card" (click)="createFreeShipping()">
          <mat-icon>local_shipping</mat-icon>
          <h3>Livraison Gratuite</h3>
          <p>Offrir la livraison</p>
        </mat-card>
      </div>

      <!-- Liste des promotions -->
      <mat-card class="promotions-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>local_offer</mat-icon>
            Mes Promotions
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-tab-group>
            <mat-tab label="Actives">
              <div class="tab-content">
                <div class="promotions-list">
                  @for (promo of getPromotionsByStatus('active'); track promo.id) {
                    <div class="promo-card">
                      <div class="promo-header">
                        <div class="promo-type">
                          <mat-icon>{{ getPromoTypeIcon(promo.type) }}</mat-icon>
                          <span>{{ getPromoTypeLabel(promo.type) }}</span>
                        </div>
                        <mat-chip class="status-active">Actif</mat-chip>
                      </div>

                      <div class="promo-content">
                        <h3>{{ promo.name }}</h3>
                        <div class="promo-code">
                          <mat-icon>confirmation_number</mat-icon>
                          <span>{{ promo.code }}</span>
                          <button mat-icon-button (click)="copyCode(promo.code)">
                            <mat-icon>content_copy</mat-icon>
                          </button>
                        </div>

                        <div class="promo-details">
                          <div class="detail">
                            <mat-icon>local_offer</mat-icon>
                            <span>
                              @if (promo.type === 'percentage') {
                                -{{ promo.value }}%
                              } @else if (promo.type === 'fixed') {
                                -{{ promo.value | number:'1.0-0' }} FCFA
                              } @else {
                                Livraison gratuite
                              }
                            </span>
                          </div>

                          <div class="detail">
                            <mat-icon>calendar_today</mat-icon>
                            <span>{{ formatDateRange(promo.start_date, promo.end_date) }}</span>
                          </div>

                          <div class="detail">
                            <mat-icon>redeem</mat-icon>
                            <span>{{ promo.usage_count }} / {{ promo.usage_limit || '∞' }} utilisations</span>
                          </div>
                        </div>
                      </div>

                      <div class="promo-actions">
                        <button mat-button (click)="viewStats(promo)">
                          <mat-icon>bar_chart</mat-icon>
                          Statistiques
                        </button>
                        <button mat-button (click)="editPromo(promo)">
                          <mat-icon>edit</mat-icon>
                          Modifier
                        </button>
                        <button mat-button (click)="pausePromo(promo)">
                          <mat-icon>pause</mat-icon>
                          Pause
                        </button>
                        <button mat-icon-button [matMenuTriggerFor]="promoMenu">
                          <mat-icon>more_vert</mat-icon>
                        </button>

                        <mat-menu #promoMenu="matMenu">
                          <button mat-menu-item (click)="duplicatePromo(promo)">
                            <mat-icon>content_copy</mat-icon>
                            Dupliquer
                          </button>
                          <button mat-menu-item (click)="sharePromo(promo)">
                            <mat-icon>share</mat-icon>
                            Partager
                          </button>
                          <button mat-menu-item (click)="deletePromo(promo)" class="danger">
                            <mat-icon>delete</mat-icon>
                            Supprimer
                          </button>
                        </mat-menu>
                      </div>
                    </div>
                  }
                </div>

                @if (getPromotionsByStatus('active').length === 0) {
                  <div class="empty-state">
                    <mat-icon>local_offer</mat-icon>
                    <h3>Aucune promotion active</h3>
                    <p>Créez votre première campagne marketing</p>
                    <button mat-raised-button color="primary" (click)="createPromotion()">
                      <mat-icon>add</mat-icon>
                      Nouvelle Promotion
                    </button>
                  </div>
                }
              </div>
            </mat-tab>

            <mat-tab label="Planifiées">
              <div class="tab-content">
                <div class="promotions-list">
                  @for (promo of getPromotionsByStatus('scheduled'); track promo.id) {
                    <div class="promo-card">
                      <div class="promo-header">
                        <div class="promo-type">
                          <mat-icon>{{ getPromoTypeIcon(promo.type) }}</mat-icon>
                          <span>{{ getPromoTypeLabel(promo.type) }}</span>
                        </div>
                        <mat-chip class="status-scheduled">Planifiée</mat-chip>
                      </div>

                      <div class="promo-content">
                        <h3>{{ promo.name }}</h3>
                        <div class="promo-code">
                          <mat-icon>confirmation_number</mat-icon>
                          <span>{{ promo.code }}</span>
                        </div>

                        <div class="promo-details">
                          <div class="detail">
                            <mat-icon>schedule</mat-icon>
                            <span>Démarre le {{ formatDate(promo.start_date) }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="promo-actions">
                        <button mat-button (click)="editPromo(promo)">
                          <mat-icon>edit</mat-icon>
                          Modifier
                        </button>
                        <button mat-button (click)="activateNow(promo)">
                          <mat-icon>play_arrow</mat-icon>
                          Activer maintenant
                        </button>
                      </div>
                    </div>
                  }
                </div>

                @if (getPromotionsByStatus('scheduled').length === 0) {
                  <div class="empty-state">
                    <mat-icon>schedule</mat-icon>
                    <p>Aucune promotion planifiée</p>
                  </div>
                }
              </div>
            </mat-tab>

            <mat-tab label="Expirées">
              <div class="tab-content">
                <div class="promotions-list">
                  @for (promo of getPromotionsByStatus('expired'); track promo.id) {
                    <div class="promo-card expired">
                      <div class="promo-header">
                        <div class="promo-type">
                          <mat-icon>{{ getPromoTypeIcon(promo.type) }}</mat-icon>
                          <span>{{ getPromoTypeLabel(promo.type) }}</span>
                        </div>
                        <mat-chip class="status-expired">Expirée</mat-chip>
                      </div>

                      <div class="promo-content">
                        <h3>{{ promo.name }}</h3>
                        <div class="promo-details">
                          <div class="detail">
                            <mat-icon>redeem</mat-icon>
                            <span>{{ promo.usage_count }} utilisations</span>
                          </div>
                        </div>
                      </div>

                      <div class="promo-actions">
                        <button mat-button (click)="viewStats(promo)">
                          <mat-icon>bar_chart</mat-icon>
                          Voir stats
                        </button>
                        <button mat-button (click)="duplicatePromo(promo)">
                          <mat-icon>content_copy</mat-icon>
                          Dupliquer
                        </button>
                      </div>
                    </div>
                  }
                </div>

                @if (getPromotionsByStatus('expired').length === 0) {
                  <div class="empty-state">
                    <mat-icon>history</mat-icon>
                    <p>Aucune promotion expirée</p>
                  </div>
                }
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .vendor-marketing {
      background: #f8fafc;
      min-height: 100vh;
    }

    .page-header {
      background: linear-gradient(135deg, #8B2E2E 0%, #6B1F1F 100%);
      color: white;
      padding: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .header-content h1 {
      font-size: 2rem;
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-content h1 mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .header-content p {
      margin: 0;
      opacity: 0.9;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
      padding: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
    }

    .stat-icon.active { background: linear-gradient(135deg, #10b981, #059669); }
    .stat-icon.uses { background: linear-gradient(135deg, #3b82f6, #2563eb); }
    .stat-icon.revenue { background: linear-gradient(135deg, #8B2E2E, #D9744F); }
    .stat-icon.conversion { background: linear-gradient(135deg, #f59e0b, #d97706); }

    .stat-content h3 {
      font-size: 1.75rem;
      margin: 0;
      color: #1f2937;
      font-weight: 700;
    }

    .stat-content p {
      margin: 0.25rem 0 0 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      padding: 0 2rem 2rem 2rem;
    }

    .action-card {
      text-align: center;
      padding: 2rem 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .action-card:hover {
      border-color: #8B2E2E;
      transform: translateY(-4px);
    }

    .action-card mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #8B2E2E;
      margin-bottom: 1rem;
    }

    .action-card h3 {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
    }

    .action-card p {
      margin: 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .promotions-card {
      margin: 0 2rem 2rem 2rem;
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .tab-content {
      padding: 1.5rem 0;
    }

    .promotions-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 1rem;
    }

    .promo-card {
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 16px;
      padding: 1.5rem;
      transition: all 0.3s ease;
    }

    .promo-card:hover {
      border-color: #8B2E2E;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .promo-card.expired {
      opacity: 0.7;
    }

    .promo-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .promo-type {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #6b7280;
      font-size: 0.9rem;
      font-weight: 600;
    }

    mat-chip.status-active {
      background: #d1fae5;
      color: #065f46;
    }

    mat-chip.status-scheduled {
      background: #dbeafe;
      color: #1e40af;
    }

    mat-chip.status-expired {
      background: #f3f4f6;
      color: #374151;
    }

    .promo-content h3 {
      font-size: 1.25rem;
      margin: 0 0 1rem 0;
      color: #1f2937;
    }

    .promo-code {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f9fafb;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-family: 'Courier New', monospace;
      font-weight: 700;
      color: #8B2E2E;
      font-size: 1.1rem;
    }

    .promo-details {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 1rem;
    }

    .detail {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .promo-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #9ca3af;
    }

    .empty-state mat-icon {
      font-size: 5rem;
      width: 5rem;
      height: 5rem;
      opacity: 0.5;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: #374151;
    }

    .empty-state p {
      margin: 0 0 1.5rem 0;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .quick-actions {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class VendorMarketingComponent implements OnInit {
  activePromotions = 3;
  totalUses = 127;
  revenueFromPromos = 450000;
  conversionRate = 4.2;

  promotions: Promotion[] = [];

  constructor(private vendorService: VendorService) {}

  ngOnInit(): void {
    this.loadPromotions();
  }

  loadPromotions(): void {
    // Charger depuis l'API si disponible
    // Pour l'instant, utiliser des données de démonstration
    this.promotions = [
      {
        id: '1',
        name: 'Soldes de Janvier',
        type: 'percentage',
        value: 20,
        code: 'JANVIER20',
        status: 'active',
        start_date: '2025-01-01',
        end_date: '2025-01-31',
        usage_count: 45,
        usage_limit: 100
      },
      {
        id: '2',
        name: 'Livraison Offerte',
        type: 'shipping',
        value: 0,
        code: 'FREESHIPJAN',
        status: 'active',
        start_date: '2025-01-15',
        end_date: '2025-02-15',
        usage_count: 32
      },
      {
        id: '3',
        name: 'Vente Flash Février',
        type: 'percentage',
        value: 30,
        code: 'FLASH30',
        status: 'scheduled',
        start_date: '2025-02-01',
        end_date: '2025-02-03',
        usage_count: 0,
        usage_limit: 50
      }
    ];
  }

  getPromotionsByStatus(status: string): Promotion[] {
    return this.promotions.filter(p => p.status === status);
  }

  getPromoTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'percentage': 'percent',
      'fixed': 'money_off',
      'shipping': 'local_shipping'
    };
    return icons[type] || 'local_offer';
  }

  getPromoTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'percentage': 'Pourcentage',
      'fixed': 'Montant fixe',
      'shipping': 'Livraison gratuite'
    };
    return labels[type] || type;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  formatDateRange(start: string, end: string): string {
    return `${this.formatDate(start)} - ${this.formatDate(end)}`;
  }

  createPromotion(): void {
    console.log('➕ Création d\'une nouvelle promotion');
    alert('Formulaire de création à venir !');
  }

  createCouponCode(): void {
    console.log('🎟️ Création code promo');
    alert('Formulaire code promo à venir !');
  }

  createFlashSale(): void {
    console.log('⚡ Création vente flash');
    alert('Formulaire vente flash à venir !');
  }

  createBundleOffer(): void {
    console.log('📦 Création pack produits');
    alert('Formulaire pack produits à venir !');
  }

  createFreeShipping(): void {
    console.log('🚚 Création livraison gratuite');
    alert('Formulaire livraison gratuite à venir !');
  }

  copyCode(code: string): void {
    navigator.clipboard.writeText(code);
    console.log('📋 Code copié:', code);
    alert(`Code "${code}" copié dans le presse-papier !`);
  }

  viewStats(promo: Promotion): void {
    console.log('📊 Statistiques de', promo.name);
  }

  editPromo(promo: Promotion): void {
    console.log('✏️ Modifier', promo.name);
  }

  pausePromo(promo: Promotion): void {
    console.log('⏸️ Mettre en pause', promo.name);
    promo.status = 'paused';
  }

  duplicatePromo(promo: Promotion): void {
    console.log('📄 Dupliquer', promo.name);
  }

  sharePromo(promo: Promotion): void {
    console.log('🔗 Partager', promo.name);
  }

  deletePromo(promo: Promotion): void {
    if (confirm(`Supprimer la promotion "${promo.name}" ?`)) {
      console.log('🗑️ Suppression de', promo.name);
      this.promotions = this.promotions.filter(p => p.id !== promo.id);
    }
  }

  activateNow(promo: Promotion): void {
    console.log('▶️ Activer maintenant', promo.name);
    promo.status = 'active';
  }
}
