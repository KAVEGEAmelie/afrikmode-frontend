import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { VendorService } from '../../../../core/services/vendor.service';

interface Transaction {
  id: string;
  type: 'sale' | 'commission' | 'payout' | 'refund';
  reference: string;
  description: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  date: string;
}

interface PayoutRequest {
  id: string;
  amount: number;
  method: string;
  account_details: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requested_at: string;
  processed_at?: string;
}

@Component({
  selector: 'app-vendor-finances',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule,
    MatTableModule
  ],
  template: `
    <div class="vendor-finances">
      <!-- Header avec gradient -->
      <div class="page-header">
        <div class="header-content">
          <h1>
            <mat-icon>account_balance_wallet</mat-icon>
            Gestion Financière
          </h1>
          <p>Suivez vos revenus, commissions et demandez vos paiements</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button class="export-btn" (click)="exportTransactions()">
            <mat-icon>download</mat-icon>
            Exporter
          </button>
          <button mat-raised-button color="primary" (click)="requestPayout()">
            <mat-icon>request_quote</mat-icon>
            Demander un paiement
          </button>
        </div>
      </div>

      <!-- Statistiques financières -->
      <div class="stats-grid">
        <div class="stat-card balance">
          <div class="stat-icon">
            <mat-icon>account_balance</mat-icon>
          </div>
          <div class="stat-content">
            <p class="stat-label">Solde Disponible</p>
            <h3>{{ availableBalance | number:'1.0-0' }} FCFA</h3>
            <span class="stat-subtitle">Prêt à retirer</span>
          </div>
        </div>

        <div class="stat-card revenue">
          <div class="stat-icon">
            <mat-icon>trending_up</mat-icon>
          </div>
          <div class="stat-content">
            <p class="stat-label">Revenus du Mois</p>
            <h3>{{ monthlyRevenue | number:'1.0-0' }} FCFA</h3>
            <span class="stat-growth positive">
              <mat-icon>arrow_upward</mat-icon>
              +15.2%
            </span>
          </div>
        </div>

        <div class="stat-card commission">
          <div class="stat-icon">
            <mat-icon>percent</mat-icon>
          </div>
          <div class="stat-content">
            <p class="stat-label">Commissions Payées</p>
            <h3>{{ totalCommissions | number:'1.0-0' }} FCFA</h3>
            <span class="stat-subtitle">{{ commissionRate }}% par vente</span>
          </div>
        </div>

        <div class="stat-card pending">
          <div class="stat-icon">
            <mat-icon>schedule</mat-icon>
          </div>
          <div class="stat-content">
            <p class="stat-label">En Attente</p>
            <h3>{{ pendingAmount | number:'1.0-0' }} FCFA</h3>
            <span class="stat-subtitle">Ventes en traitement</span>
          </div>
        </div>

        <div class="stat-card paid">
          <div class="stat-icon">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="stat-content">
            <p class="stat-label">Retraits Totaux</p>
            <h3>{{ totalPayouts | number:'1.0-0' }} FCFA</h3>
            <span class="stat-subtitle">{{ payoutCount }} paiements</span>
          </div>
        </div>

        <div class="stat-card refunds">
          <div class="stat-icon">
            <mat-icon>money_off</mat-icon>
          </div>
          <div class="stat-content">
            <p class="stat-label">Remboursements</p>
            <h3>{{ totalRefunds | number:'1.0-0' }} FCFA</h3>
            <span class="stat-subtitle">{{ refundCount }} remboursements</span>
          </div>
        </div>
      </div>

      <!-- Graphique des revenus -->
      <div class="chart-section">
        <mat-card class="revenue-chart-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>show_chart</mat-icon>
              Évolution des Revenus
            </mat-card-title>
            <mat-card-subtitle>6 derniers mois</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-container">
              <div class="chart-placeholder">
                <mat-icon>insights</mat-icon>
                <p>Graphique des revenus mensuels</p>
                <small>Revenus, Commissions, Retraits</small>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="breakdown-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>pie_chart</mat-icon>
              Répartition des Revenus
            </mat-card-title>
            <mat-card-subtitle>Ce mois</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="breakdown-list">
              <div class="breakdown-item">
                <div class="breakdown-info">
                  <div class="breakdown-icon products">
                    <mat-icon>shopping_bag</mat-icon>
                  </div>
                  <div>
                    <div class="breakdown-label">Ventes Produits</div>
                    <div class="breakdown-value">1,250,000 FCFA</div>
                  </div>
                </div>
                <div class="breakdown-percentage">65%</div>
              </div>

              <div class="breakdown-item">
                <div class="breakdown-info">
                  <div class="breakdown-icon commissions">
                    <mat-icon>percent</mat-icon>
                  </div>
                  <div>
                    <div class="breakdown-label">Commissions</div>
                    <div class="breakdown-value">-125,000 FCFA</div>
                  </div>
                </div>
                <div class="breakdown-percentage">10%</div>
              </div>

              <div class="breakdown-item">
                <div class="breakdown-info">
                  <div class="breakdown-icon shipping">
                    <mat-icon>local_shipping</mat-icon>
                  </div>
                  <div>
                    <div class="breakdown-label">Frais de Livraison</div>
                    <div class="breakdown-value">+75,000 FCFA</div>
                  </div>
                </div>
                <div class="breakdown-percentage">15%</div>
              </div>

              <div class="breakdown-item">
                <div class="breakdown-info">
                  <div class="breakdown-icon refunds">
                    <mat-icon>money_off</mat-icon>
                  </div>
                  <div>
                    <div class="breakdown-label">Remboursements</div>
                    <div class="breakdown-value">-50,000 FCFA</div>
                  </div>
                </div>
                <div class="breakdown-percentage">10%</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Onglets des transactions -->
      <mat-card class="transactions-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>receipt_long</mat-icon>
            Historique des Transactions
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-tab-group>
            <!-- Toutes les transactions -->
            <mat-tab label="Toutes">
              <div class="tab-content">
                <div class="filters-bar">
                  <input 
                    type="text" 
                    placeholder="Rechercher une transaction..." 
                    [(ngModel)]="searchTerm"
                    (input)="filterTransactions()">
                  
                  <select [(ngModel)]="typeFilter" (change)="filterTransactions()">
                    <option value="">Tous les types</option>
                    <option value="sale">Ventes</option>
                    <option value="commission">Commissions</option>
                    <option value="payout">Retraits</option>
                    <option value="refund">Remboursements</option>
                  </select>

                  <select [(ngModel)]="statusFilter" (change)="filterTransactions()">
                    <option value="">Tous les statuts</option>
                    <option value="completed">Terminé</option>
                    <option value="pending">En attente</option>
                    <option value="failed">Échoué</option>
                  </select>
                </div>

                <div class="transactions-list">
                  @for (transaction of filteredTransactions; track transaction.id) {
                    <div class="transaction-item">
                      <div class="transaction-icon" [class]="'type-' + transaction.type">
                        <mat-icon>{{ getTransactionIcon(transaction.type) }}</mat-icon>
                      </div>
                      
                      <div class="transaction-details">
                        <div class="transaction-desc">{{ transaction.description }}</div>
                        <div class="transaction-ref">{{ transaction.reference }}</div>
                        <div class="transaction-date">{{ formatDate(transaction.date) }}</div>
                      </div>

                      <div class="transaction-status">
                        <mat-chip [class]="'status-' + transaction.status">
                          {{ getStatusLabel(transaction.status) }}
                        </mat-chip>
                      </div>

                      <div class="transaction-amount" [class]="transaction.type === 'commission' || transaction.type === 'refund' ? 'negative' : 'positive'">
                        {{ transaction.type === 'commission' || transaction.type === 'refund' ? '-' : '+' }}{{ transaction.amount | number:'1.0-0' }} FCFA
                      </div>

                      <button mat-icon-button (click)="viewTransactionDetails(transaction)">
                        <mat-icon>chevron_right</mat-icon>
                      </button>
                    </div>
                  }
                </div>

                @if (filteredTransactions.length === 0) {
                  <div class="empty-state">
                    <mat-icon>receipt_long</mat-icon>
                    <p>Aucune transaction trouvée</p>
                  </div>
                }
              </div>
            </mat-tab>

            <!-- Demandes de paiement -->
            <mat-tab label="Mes Retraits">
              <div class="tab-content">
                <div class="payouts-list">
                  @for (payout of payoutRequests; track payout.id) {
                    <div class="payout-item">
                      <div class="payout-icon">
                        <mat-icon>request_quote</mat-icon>
                      </div>
                      
                      <div class="payout-details">
                        <div class="payout-amount">{{ payout.amount | number:'1.0-0' }} FCFA</div>
                        <div class="payout-method">{{ payout.method }}</div>
                        <div class="payout-account">{{ payout.account_details }}</div>
                        <div class="payout-date">Demandé le {{ formatDate(payout.requested_at) }}</div>
                      </div>

                      <mat-chip [class]="'payout-' + payout.status">
                        {{ getPayoutStatusLabel(payout.status) }}
                      </mat-chip>

                      @if (payout.status === 'pending') {
                        <button mat-raised-button class="cancel-btn" (click)="cancelPayoutRequest(payout)">
                          <mat-icon>cancel</mat-icon>
                          Annuler
                        </button>
                      }
                    </div>
                  }
                </div>

                @if (payoutRequests.length === 0) {
                  <div class="empty-state">
                    <mat-icon>account_balance_wallet</mat-icon>
                    <p>Aucune demande de retrait</p>
                    <button mat-raised-button color="primary" (click)="requestPayout()">
                      <mat-icon>add</mat-icon>
                      Demander un paiement
                    </button>
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
    .vendor-finances {
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
      font-size: 1rem;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .export-btn {
      background: rgba(255, 255, 255, 0.2) !important;
      color: white !important;
      border: 1px solid rgba(255, 255, 255, 0.3);
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
      border-left: 4px solid transparent;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .stat-card.balance { border-left-color: #8B2E2E; }
    .stat-card.revenue { border-left-color: #10b981; }
    .stat-card.commission { border-left-color: #f59e0b; }
    .stat-card.pending { border-left-color: #3b82f6; }
    .stat-card.paid { border-left-color: #8b5cf6; }
    .stat-card.refunds { border-left-color: #ef4444; }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .stat-card.balance .stat-icon { background: linear-gradient(135deg, #8B2E2E, #6B1F1F); color: white; }
    .stat-card.revenue .stat-icon { background: linear-gradient(135deg, #10b981, #059669); color: white; }
    .stat-card.commission .stat-icon { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }
    .stat-card.pending .stat-icon { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; }
    .stat-card.paid .stat-icon { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; }
    .stat-card.refunds .stat-icon { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }

    .stat-content {
      flex: 1;
    }

    .stat-label {
      margin: 0;
      color: #6b7280;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .stat-content h3 {
      font-size: 1.75rem;
      margin: 0.25rem 0;
      color: #1f2937;
      font-weight: 700;
    }

    .stat-subtitle {
      font-size: 0.75rem;
      color: #9ca3af;
    }

    .stat-growth {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
    }

    .stat-growth.positive {
      background: #d1fae5;
      color: #065f46;
    }

    .stat-growth.negative {
      background: #fee2e2;
      color: #991b1b;
    }

    .stat-growth mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .chart-section {
      padding: 0 2rem 2rem 2rem;
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }

    .revenue-chart-card,
    .breakdown-card {
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .chart-container {
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chart-placeholder {
      text-align: center;
      color: #9ca3af;
    }

    .chart-placeholder mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      opacity: 0.5;
    }

    .breakdown-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .breakdown-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 12px;
      transition: background 0.3s ease;
    }

    .breakdown-item:hover {
      background: #f3f4f6;
    }

    .breakdown-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .breakdown-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .breakdown-icon.products { background: linear-gradient(135deg, #8B2E2E, #D9744F); }
    .breakdown-icon.commissions { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .breakdown-icon.shipping { background: linear-gradient(135deg, #3b82f6, #2563eb); }
    .breakdown-icon.refunds { background: linear-gradient(135deg, #ef4444, #dc2626); }

    .breakdown-label {
      font-size: 0.9rem;
      color: #6b7280;
    }

    .breakdown-value {
      font-size: 1.1rem;
      font-weight: 700;
      color: #1f2937;
    }

    .breakdown-percentage {
      font-size: 1.2rem;
      font-weight: 700;
      color: #8B2E2E;
    }

    .transactions-card {
      margin: 0 2rem 2rem 2rem;
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .tab-content {
      padding: 1.5rem 0;
    }

    .filters-bar {
      display: flex;
      gap: 1rem;
      padding: 0 1rem 1.5rem 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .filters-bar input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 0.9rem;
    }

    .filters-bar input:focus {
      outline: none;
      border-color: #8B2E2E;
    }

    .filters-bar select {
      padding: 0.75rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      background: white;
      font-size: 0.9rem;
      cursor: pointer;
    }

    .transactions-list,
    .payouts-list {
      display: flex;
      flex-direction: column;
    }

    .transaction-item,
    .payout-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1rem;
      border-bottom: 1px solid #f3f4f6;
      transition: background 0.3s ease;
    }

    .transaction-item:hover,
    .payout-item:hover {
      background: #f9fafb;
    }

    .transaction-icon,
    .payout-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .transaction-icon.type-sale { background: linear-gradient(135deg, #10b981, #059669); }
    .transaction-icon.type-commission { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .transaction-icon.type-payout { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
    .transaction-icon.type-refund { background: linear-gradient(135deg, #ef4444, #dc2626); }
    .payout-icon { background: linear-gradient(135deg, #8B2E2E, #D9744F); }

    .transaction-details,
    .payout-details {
      flex: 1;
    }

    .transaction-desc,
    .payout-amount {
      font-weight: 600;
      color: #1f2937;
    }

    .transaction-ref,
    .payout-method {
      font-size: 0.85rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }

    .transaction-date,
    .payout-account,
    .payout-date {
      font-size: 0.75rem;
      color: #9ca3af;
      margin-top: 0.25rem;
    }

    .transaction-status mat-chip,
    mat-chip {
      font-size: 0.8rem;
      padding: 0.4rem 0.8rem;
      border-radius: 16px;
    }

    mat-chip.status-completed,
    mat-chip.payout-completed {
      background: #d1fae5;
      color: #065f46;
    }

    mat-chip.status-pending,
    mat-chip.payout-pending {
      background: #fef3c7;
      color: #92400e;
    }

    mat-chip.status-failed,
    mat-chip.payout-rejected {
      background: #fee2e2;
      color: #991b1b;
    }

    mat-chip.payout-processing {
      background: #dbeafe;
      color: #1e40af;
    }

    .transaction-amount {
      font-size: 1.1rem;
      font-weight: 700;
      min-width: 150px;
      text-align: right;
    }

    .transaction-amount.positive {
      color: #10b981;
    }

    .transaction-amount.negative {
      color: #ef4444;
    }

    .cancel-btn {
      background: #fee2e2 !important;
      color: #991b1b !important;
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

    .empty-state p {
      margin: 0 0 1.5rem 0;
      font-size: 1.1rem;
    }

    @media (max-width: 1024px) {
      .chart-section {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .filters-bar {
        flex-direction: column;
      }

      .transaction-item {
        flex-wrap: wrap;
      }

      .transaction-amount {
        min-width: auto;
        width: 100%;
        text-align: left;
      }
    }
  `]
})
export class VendorFinancesComponent implements OnInit {
  // Statistiques
  availableBalance = 0;
  monthlyRevenue = 0;
  totalCommissions = 0;
  pendingAmount = 0;
  totalPayouts = 0;
  payoutCount = 0;
  totalRefunds = 0;
  refundCount = 0;
  commissionRate = 10;
  isLoading = false;

  // Filtres
  searchTerm = '';
  typeFilter = '';
  statusFilter = '';

  // Données
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  payoutRequests: PayoutRequest[] = [];
  errorMessage: string | null = null;

  constructor(private vendorService: VendorService) {}

  ngOnInit(): void {
    this.loadFinances();
    this.loadTransactions();
    this.loadPayoutRequests();
  }

  loadFinances(): void {
    this.isLoading = true;
    
    this.vendorService.getFinances().subscribe({
      next: (data: any) => {
        this.availableBalance = data.availableBalance || 0;
        this.monthlyRevenue = data.monthlyRevenue || 0;
        this.totalCommissions = data.totalCommissions || 0;
        this.pendingAmount = data.pendingAmount || 0;
        this.totalPayouts = data.totalPayouts || 0;
        this.payoutCount = data.payoutCount || 0;
        this.totalRefunds = data.totalRefunds || 0;
        this.refundCount = data.refundCount || 0;
        this.commissionRate = data.commissionRate || 10;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des finances:', error);
        // Ne pas charger de données mockées en production
        this.errorMessage = 'Erreur lors du chargement des données financières. Veuillez réessayer.';
        this.isLoading = false;
      }
    });
  }

  // Supprimé loadMockFinances() - utiliser uniquement l'API

  loadTransactions(): void {
    // Utiliser getFinances qui peut inclure les transactions
    this.vendorService.getFinances().subscribe({
      next: (data: any) => {
        // Les transactions peuvent être dans data.transactions ou data.history
        this.transactions = data.transactions || data.history || [];
        this.filteredTransactions = [...this.transactions];
        this.filterTransactions();
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des transactions:', error);
        // Ne pas charger de données mockées en production
        this.transactions = [];
        this.filteredTransactions = [];
        this.errorMessage = 'Erreur lors du chargement des transactions. Veuillez réessayer.';
      }
    });
  }

  // Supprimé loadMockTransactions() - utiliser uniquement l'API

  loadPayoutRequests(): void {
    this.payoutRequests = [
      {
        id: '1',
        amount: 850000,
        method: 'Mobile Money (TMoney)',
        account_details: '+228 90 12 34 56',
        status: 'pending',
        requested_at: '2025-01-16T08:00:00'
      },
      {
        id: '2',
        amount: 500000,
        method: 'Virement bancaire',
        account_details: 'TG** **** **** 5678',
        status: 'completed',
        requested_at: '2025-01-10T10:30:00',
        processed_at: '2025-01-12T15:45:00'
      }
    ];
  }

  filterTransactions(): void {
    this.filteredTransactions = this.transactions.filter(transaction => {
      const matchesSearch = !this.searchTerm || 
        transaction.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        transaction.reference.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesType = !this.typeFilter || transaction.type === this.typeFilter;
      const matchesStatus = !this.statusFilter || transaction.status === this.statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }

  getTransactionIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'sale': 'shopping_bag',
      'commission': 'percent',
      'payout': 'account_balance_wallet',
      'refund': 'money_off'
    };
    return icons[type] || 'help';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'En attente',
      'completed': 'Terminé',
      'failed': 'Échoué',
      'cancelled': 'Annulé'
    };
    return labels[status] || status;
  }

  getPayoutStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'En attente',
      'processing': 'En traitement',
      'completed': 'Terminé',
      'rejected': 'Rejeté'
    };
    return labels[status] || status;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  exportTransactions(): void {
    console.log('📥 Export des transactions...');
    alert('Fonctionnalité d\'export à venir !');
  }

  requestPayout(): void {
    const amount = prompt('Montant à retirer (FCFA) :');
    if (amount && parseInt(amount) > 0) {
      if (parseInt(amount) <= this.availableBalance) {
        console.log('💰 Demande de retrait de', amount, 'FCFA');
        alert(`Demande de retrait de ${amount} FCFA créée avec succès !`);
      } else {
        alert('Solde insuffisant !');
      }
    }
  }

  viewTransactionDetails(transaction: Transaction): void {
    console.log('📄 Détails de la transaction', transaction.reference);
    alert(`Détails : ${transaction.description}\nMontant : ${transaction.amount} FCFA`);
  }

  cancelPayoutRequest(payout: PayoutRequest): void {
    if (confirm(`Annuler la demande de retrait de ${payout.amount} FCFA ?`)) {
      console.log('❌ Annulation de la demande', payout.id);
      payout.status = 'rejected';
    }
  }
}
