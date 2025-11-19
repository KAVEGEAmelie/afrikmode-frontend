import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminDashboardService } from '../../../core/services/admin-dashboard.service';

interface CommissionData {
  totalCommissions: number;
  monthlyCommissions: number;
  commissionsGrowth: number;
  pendingPayouts: number;
  approvedPayouts: number;
  completedPayouts: number;
}

interface PendingPayout {
  id: string;
  vendorName: string;
  vendorEmail: string;
  amount: number;
  requestedAt: string;
  status: string;
  method: string;
  accountDetails: string;
}

@Component({
  selector: 'app-admin-commissions',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="admin-commissions">
      <!-- En-tête -->
      <div class="page-header">
        <div class="header-content">
          <h1>
            <mat-icon>account_balance</mat-icon>
            Commissions & Paiements Vendeurs
          </h1>
          <p>Gérez les commissions de la plateforme et approuvez les demandes de paiement</p>
        </div>
      </div>

      <!-- Statistiques des commissions -->
      <div class="stats-grid">
        <mat-card class="stat-card total">
          <div class="stat-icon">
            <mat-icon>account_balance_wallet</mat-icon>
          </div>
          <div class="stat-content">
            <p class="stat-label">Total Commissions</p>
            <h3>{{ commissionData.totalCommissions | number:'1.0-0' }} FCFA</h3>
            <span class="stat-subtitle">Depuis le début</span>
          </div>
        </mat-card>

        <mat-card class="stat-card monthly">
          <div class="stat-icon">
            <mat-icon>trending_up</mat-icon>
          </div>
          <div class="stat-content">
            <p class="stat-label">Commissions ce Mois</p>
            <h3>{{ commissionData.monthlyCommissions | number:'1.0-0' }} FCFA</h3>
            <span class="stat-growth positive">
              <mat-icon>arrow_upward</mat-icon>
              +{{ commissionData.commissionsGrowth }}%
            </span>
          </div>
        </mat-card>

        <mat-card class="stat-card pending">
          <div class="stat-icon">
            <mat-icon>schedule</mat-icon>
          </div>
          <div class="stat-content">
            <p class="stat-label">Paiements en Attente</p>
            <h3>{{ commissionData.pendingPayouts }}</h3>
            <span class="stat-subtitle">À approuver</span>
          </div>
        </mat-card>

        <mat-card class="stat-card completed">
          <div class="stat-icon">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="stat-content">
            <p class="stat-label">Paiements Complétés</p>
            <h3>{{ commissionData.completedPayouts }}</h3>
            <span class="stat-subtitle">Ce mois</span>
          </div>
        </mat-card>
      </div>

      <!-- Demandes de paiement en attente -->
      <mat-card class="payouts-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>request_quote</mat-icon>
            Demandes de Paiement en Attente
          </mat-card-title>
          <mat-card-subtitle>
            {{ pendingPayouts.length }} demandes à traiter
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (isLoading) {
            <div class="loading-state">
              <mat-icon>hourglass_empty</mat-icon>
              <p>Chargement des demandes...</p>
            </div>
          }

          @if (!isLoading && pendingPayouts.length === 0) {
            <div class="empty-state">
              <mat-icon>check_circle</mat-icon>
              <p>Aucune demande en attente</p>
              <small>Toutes les demandes ont été traitées</small>
            </div>
          }

          @if (!isLoading && pendingPayouts.length > 0) {
            <div class="payouts-table">
              <table>
                <thead>
                  <tr>
                    <th>Vendeur</th>
                    <th>Montant</th>
                    <th>Méthode</th>
                    <th>Date Demande</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (payout of pendingPayouts; track payout.id) {
                    <tr>
                      <td>
                        <div class="vendor-info">
                          <div class="vendor-avatar">
                            <mat-icon>store</mat-icon>
                          </div>
                          <div class="vendor-details">
                            <div class="vendor-name">{{ payout.vendorName }}</div>
                            <div class="vendor-email">{{ payout.vendorEmail }}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="amount">{{ payout.amount | number:'1.0-0' }} FCFA</div>
                      </td>
                      <td>
                        <div class="method">
                          <mat-icon>{{ getPaymentMethodIcon(payout.method) }}</mat-icon>
                          {{ payout.method }}
                        </div>
                      </td>
                      <td>{{ payout.requestedAt | date:'dd/MM/yyyy HH:mm' }}</td>
                      <td>
                        <mat-chip [class]="'status-' + payout.status">
                          {{ getStatusLabel(payout.status) }}
                        </mat-chip>
                      </td>
                      <td>
                        <div class="actions">
                          <button mat-icon-button 
                                  color="primary" 
                                  (click)="viewDetails(payout)"
                                  matTooltip="Voir détails">
                            <mat-icon>visibility</mat-icon>
                          </button>
                          @if (payout.status === 'pending') {
                            <button mat-icon-button 
                                    color="accent" 
                                    (click)="approvePayout(payout)"
                                    matTooltip="Approuver">
                              <mat-icon>check</mat-icon>
                            </button>
                            <button mat-icon-button 
                                    color="warn" 
                                    (click)="rejectPayout(payout)"
                                    matTooltip="Rejeter">
                              <mat-icon>close</mat-icon>
                            </button>
                          }
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </mat-card-content>
      </mat-card>

      <!-- Informations système de commission -->
      <mat-card class="commission-info-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>info</mat-icon>
            Système de Commission
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="info-grid">
            <div class="info-item">
              <mat-icon>percent</mat-icon>
              <div class="info-content">
                <div class="info-label">Taux de Commission</div>
                <div class="info-value">10%</div>
                <div class="info-description">Sur chaque vente</div>
              </div>
            </div>

            <div class="info-item">
              <mat-icon>schedule</mat-icon>
              <div class="info-content">
                <div class="info-label">Délai de Sécurité</div>
                <div class="info-value">7 jours</div>
                <div class="info-description">Avant disponibilité des fonds</div>
              </div>
            </div>

            <div class="info-item">
              <mat-icon>auto_awesome</mat-icon>
              <div class="info-content">
                <div class="info-label">Confirmation Auto</div>
                <div class="info-value">14 jours</div>
                <div class="info-description">Sans action client</div>
              </div>
            </div>

            <div class="info-item">
              <mat-icon>payment</mat-icon>
              <div class="info-content">
                <div class="info-label">Méthodes de Paiement</div>
                <div class="info-value">TMoney, Flooz, Orange Money, Virement</div>
                <div class="info-description">Options disponibles pour les vendeurs</div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-commissions {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 24px;
      
      .header-content {
        h1 {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 28px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #1a1a1a;

          mat-icon {
            font-size: 32px;
            width: 32px;
            height: 32px;
            color: #4caf50;
          }
        }

        p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;

      .stat-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: transform 0.2s;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        &.total {
          border-left: 4px solid #4caf50;
        }

        &.monthly {
          border-left: 4px solid #2196f3;
        }

        &.pending {
          border-left: 4px solid #ff9800;
        }

        &.completed {
          border-left: 4px solid #9c27b0;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(76, 175, 80, 0.1);

          mat-icon {
            font-size: 28px;
            width: 28px;
            height: 28px;
            color: #4caf50;
          }
        }

        .stat-content {
          flex: 1;

          .stat-label {
            font-size: 13px;
            color: #666;
            margin: 0 0 4px 0;
          }

          h3 {
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 4px 0;
            color: #1a1a1a;
          }

          .stat-subtitle {
            font-size: 12px;
            color: #999;
          }

          .stat-growth {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            padding: 2px 8px;
            border-radius: 12px;

            &.positive {
              color: #4caf50;
              background: rgba(76, 175, 80, 0.1);
            }

            mat-icon {
              font-size: 16px;
              width: 16px;
              height: 16px;
            }
          }
        }
      }
    }

    .payouts-card {
      margin-bottom: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);

      mat-card-header {
        padding: 20px 24px;
        border-bottom: 1px solid #e0e0e0;

        mat-card-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 18px;
          font-weight: 600;
          margin: 0;

          mat-icon {
            color: #4caf50;
          }
        }

        mat-card-subtitle {
          margin-top: 4px;
          color: #666;
          font-size: 13px;
        }
      }

      .loading-state, .empty-state {
        padding: 60px 20px;
        text-align: center;
        color: #999;

        mat-icon {
          font-size: 64px;
          width: 64px;
          height: 64px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        p {
          font-size: 16px;
          margin: 0 0 8px 0;
        }

        small {
          font-size: 13px;
        }
      }

      .payouts-table {
        overflow-x: auto;

        table {
          width: 100%;
          border-collapse: collapse;

          thead tr {
            background: #f5f5f5;
            border-bottom: 2px solid #e0e0e0;

            th {
              padding: 12px 16px;
              text-align: left;
              font-size: 13px;
              font-weight: 600;
              color: #666;
              text-transform: uppercase;
            }
          }

          tbody tr {
            border-bottom: 1px solid #e0e0e0;
            transition: background 0.2s;

            &:hover {
              background: #f9f9f9;
            }

            td {
              padding: 16px;
              font-size: 14px;

              .vendor-info {
                display: flex;
                align-items: center;
                gap: 12px;

                .vendor-avatar {
                  width: 40px;
                  height: 40px;
                  border-radius: 50%;
                  background: #e3f2fd;
                  display: flex;
                  align-items: center;
                  justify-content: center;

                  mat-icon {
                    color: #2196f3;
                    font-size: 20px;
                    width: 20px;
                    height: 20px;
                  }
                }

                .vendor-details {
                  .vendor-name {
                    font-weight: 500;
                    color: #1a1a1a;
                  }

                  .vendor-email {
                    font-size: 12px;
                    color: #666;
                  }
                }
              }

              .amount {
                font-weight: 600;
                color: #4caf50;
                font-size: 15px;
              }

              .method {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #666;

                mat-icon {
                  font-size: 18px;
                  width: 18px;
                  height: 18px;
                }
              }

              mat-chip {
                font-size: 11px;
                padding: 4px 12px;
                border-radius: 12px;

                &.status-pending {
                  background: #fff3e0;
                  color: #f57c00;
                }

                &.status-approved {
                  background: #e8f5e9;
                  color: #2e7d32;
                }

                &.status-processing {
                  background: #e3f2fd;
                  color: #1976d2;
                }

                &.status-completed {
                  background: #f3e5f5;
                  color: #7b1fa2;
                }

                &.status-rejected {
                  background: #ffebee;
                  color: #c62828;
                }
              }

              .actions {
                display: flex;
                gap: 4px;
              }
            }
          }
        }
      }
    }

    .commission-info-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 24px;
        padding: 12px 0;

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;

          mat-icon {
            font-size: 32px;
            width: 32px;
            height: 32px;
            color: #4caf50;
            margin-top: 4px;
          }

          .info-content {
            flex: 1;

            .info-label {
              font-size: 13px;
              color: #666;
              margin-bottom: 4px;
            }

            .info-value {
              font-size: 18px;
              font-weight: 600;
              color: #1a1a1a;
              margin-bottom: 4px;
            }

            .info-description {
              font-size: 12px;
              color: #999;
            }
          }
        }
      }
    }
  `]
})
export class AdminCommissionsComponent implements OnInit {
  isLoading = true;
  
  commissionData: CommissionData = {
    totalCommissions: 0,
    monthlyCommissions: 0,
    commissionsGrowth: 0,
    pendingPayouts: 0,
    approvedPayouts: 0,
    completedPayouts: 0
  };

  pendingPayouts: PendingPayout[] = [];

  constructor(private adminDashboardService: AdminDashboardService) {}

  ngOnInit(): void {
    this.loadCommissionsData();
    this.loadPendingPayouts();
  }

  loadCommissionsData(): void {
    this.adminDashboardService.getCommissionsData('30d').subscribe({
      next: (data: any) => {
        this.commissionData = {
          totalCommissions: data.total_commissions || 0,
          monthlyCommissions: data.monthly_commissions || 0,
          commissionsGrowth: data.growth_percentage || 0,
          pendingPayouts: data.pending_payouts_count || 0,
          approvedPayouts: data.approved_payouts_count || 0,
          completedPayouts: data.completed_payouts_count || 0
        };
      },
      error: (error: any) => {
        console.error('Erreur chargement commissions:', error);
      }
    });
  }

  loadPendingPayouts(): void {
    this.isLoading = true;
    this.adminDashboardService.getPendingPayouts().subscribe({
      next: (response: any) => {
        this.pendingPayouts = (response.data || response.payouts || []).map((p: any) => ({
          id: p.id,
          vendorName: p.vendor_name || p.vendorName,
          vendorEmail: p.vendor_email || p.vendorEmail,
          amount: p.amount,
          requestedAt: p.requested_at || p.requestedAt || p.created_at,
          status: p.status,
          method: p.method || p.payment_method,
          accountDetails: p.account_details || p.accountDetails
        }));
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur chargement pending payouts:', error);
        this.isLoading = false;
      }
    });
  }

  getPaymentMethodIcon(method: string): string {
    const icons: { [key: string]: string } = {
      'TMoney': 'phone_android',
      'Flooz': 'phone_android',
      'Orange Money': 'phone_android',
      'MTN Money': 'phone_android',
      'Virement': 'account_balance',
      'Virement bancaire': 'account_balance'
    };
    return icons[method] || 'payment';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'En attente',
      'processing': 'En traitement',
      'approved': 'Approuvé',
      'completed': 'Terminé',
      'rejected': 'Rejeté'
    };
    return labels[status] || status;
  }

  viewDetails(payout: PendingPayout): void {
    alert(`Détails du paiement:\n\nVendeur: ${payout.vendorName}\nMontant: ${payout.amount.toLocaleString('fr-FR')} FCFA\nMéthode: ${payout.method}\nCompte: ${payout.accountDetails}`);
  }

  approvePayout(payout: PendingPayout): void {
    if (confirm(`Approuver le paiement de ${payout.amount.toLocaleString('fr-FR')} FCFA pour ${payout.vendorName} ?`)) {
      this.adminDashboardService.approvePayout(payout.id).subscribe({
        next: () => {
          alert('✅ Paiement approuvé avec succès !');
          this.loadPendingPayouts();
          this.loadCommissionsData();
        },
        error: (error: any) => {
          console.error('Erreur approbation paiement:', error);
          alert('❌ Erreur lors de l\'approbation du paiement');
        }
      });
    }
  }

  rejectPayout(payout: PendingPayout): void {
    const reason = prompt('Raison du rejet :');
    if (reason) {
      this.adminDashboardService.rejectPayout(payout.id, reason).subscribe({
        next: () => {
          alert('✅ Paiement rejeté');
          this.loadPendingPayouts();
          this.loadCommissionsData();
        },
        error: (error: any) => {
          console.error('Erreur rejet paiement:', error);
          alert('❌ Erreur lors du rejet du paiement');
        }
      });
    }
  }
}
