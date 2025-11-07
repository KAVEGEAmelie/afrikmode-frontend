import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';

export interface StoreDetailsData {
  store: any;
}

@Component({
  selector: 'app-store-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule
  ],
  template: `
    <div class="store-details-dialog">
      <div class="dialog-header">
        <div class="store-logo">
          <mat-icon>store</mat-icon>
        </div>
        <div class="store-info">
          <h2 mat-dialog-title>{{ store.name }}</h2>
          <p class="store-vendor">{{ store.vendor_name || store.vendor }}</p>
        </div>
        <button mat-icon-button (click)="onClose()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <mat-tab-group>
          <!-- Informations générales -->
          <mat-tab label="Informations">
            <div class="tab-content">
              <div class="details-grid">
                <mat-card class="detail-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>info</mat-icon>
                      Informations générales
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="detail-item">
                      <span class="label">Nom de la boutique:</span>
                      <span class="value">{{ store.name }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Vendeur:</span>
                      <span class="value">{{ store.vendor_name || store.vendor }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Email:</span>
                      <span class="value">{{ store.email }}</span>
                    </div>
                    <div class="detail-item" *ngIf="store.phone">
                      <span class="label">Téléphone:</span>
                      <span class="value">{{ store.phone }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Ville:</span>
                      <span class="value">{{ store.city }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Pays:</span>
                      <span class="value">{{ store.country }}</span>
                    </div>
                    <div class="detail-item" *ngIf="store.business_type">
                      <span class="label">Type d'entreprise:</span>
                      <span class="value">{{ store.business_type }}</span>
                    </div>
                    <div class="detail-item" *ngIf="store.tax_id">
                      <span class="label">ID Fiscal:</span>
                      <span class="value">{{ store.tax_id }}</span>
                    </div>
                    <div class="detail-item" *ngIf="store.description">
                      <span class="label">Description:</span>
                      <span class="value">{{ store.description }}</span>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="detail-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>admin_panel_settings</mat-icon>
                      Statut et vérification
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="detail-item">
                      <span class="label">Statut:</span>
                      <mat-chip [color]="getStatusColor(store.status)" selected>
                        {{ getStatusLabel(store.status) }}
                      </mat-chip>
                    </div>
                    <div class="detail-item" *ngIf="store.is_verified !== undefined">
                      <span class="label">Vérifiée:</span>
                      <mat-chip [color]="store.is_verified ? 'primary' : 'accent'" selected>
                        {{ store.is_verified ? 'Oui' : 'Non' }}
                      </mat-chip>
                    </div>
                    <div class="detail-item" *ngIf="store.is_featured !== undefined">
                      <span class="label">En vedette:</span>
                      <mat-chip [color]="store.is_featured ? 'accent' : 'primary'" selected>
                        {{ store.is_featured ? 'Oui' : 'Non' }}
                      </mat-chip>
                    </div>
                    <div class="detail-item" *ngIf="store.created_at">
                      <span class="label">Créée le:</span>
                      <span class="value">{{ formatDate(store.created_at) }}</span>
                    </div>
                    <div class="detail-item" *ngIf="store.verified_at">
                      <span class="label">Vérifiée le:</span>
                      <span class="value">{{ formatDate(store.verified_at) }}</span>
                    </div>
                    <div class="detail-item" *ngIf="store.suspended_at">
                      <span class="label">Suspendue le:</span>
                      <span class="value">{{ formatDate(store.suspended_at) }}</span>
                    </div>
                    <div class="detail-item" *ngIf="store.suspension_reason">
                      <span class="label">Raison suspension:</span>
                      <span class="value reason">{{ store.suspension_reason }}</span>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Statistiques -->
          <mat-tab label="Statistiques" *ngIf="store.total_products !== undefined || store.total_orders !== undefined">
            <div class="tab-content">
              <mat-card class="detail-card">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>analytics</mat-icon>
                    Statistiques de la boutique
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="stats-grid">
                    <div class="stat-box" *ngIf="store.total_products !== undefined">
                      <mat-icon>inventory</mat-icon>
                      <div class="stat-info">
                        <span class="stat-value">{{ store.total_products }}</span>
                        <span class="stat-label">Produits</span>
                      </div>
                    </div>
                    <div class="stat-box" *ngIf="store.total_orders !== undefined">
                      <mat-icon>shopping_cart</mat-icon>
                      <div class="stat-info">
                        <span class="stat-value">{{ store.total_orders }}</span>
                        <span class="stat-label">Commandes</span>
                      </div>
                    </div>
                    <div class="stat-box" *ngIf="store.total_revenue !== undefined">
                      <mat-icon>attach_money</mat-icon>
                      <div class="stat-info">
                        <span class="stat-value">{{ formatCurrency(store.total_revenue) }}</span>
                        <span class="stat-label">Revenus</span>
                      </div>
                    </div>
                    <div class="stat-box" *ngIf="store.rating !== undefined && store.rating > 0">
                      <mat-icon>star</mat-icon>
                      <div class="stat-info">
                        <span class="stat-value">{{ store.rating.toFixed(1) }}</span>
                        <span class="stat-label">Note moyenne</span>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Documents -->
          <mat-tab label="Documents" *ngIf="store.documents">
            <div class="tab-content">
              <mat-card class="detail-card">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>description</mat-icon>
                    Documents fournis
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="documents-list">
                    <div class="doc-item" *ngIf="store.documents.business_registration">
                      <mat-icon>description</mat-icon>
                      <span>Enregistrement commercial</span>
                      <button mat-icon-button (click)="viewDocument(store.documents.business_registration)">
                        <mat-icon>visibility</mat-icon>
                      </button>
                    </div>
                    <div class="doc-item" *ngIf="store.documents.tax_certificate">
                      <mat-icon>description</mat-icon>
                      <span>Certificat fiscal</span>
                      <button mat-icon-button (click)="viewDocument(store.documents.tax_certificate)">
                        <mat-icon>visibility</mat-icon>
                      </button>
                    </div>
                    <div class="doc-item" *ngIf="store.documents.id_card">
                      <mat-icon>badge</mat-icon>
                      <span>Pièce d'identité</span>
                      <button mat-icon-button (click)="viewDocument(store.documents.id_card)">
                        <mat-icon>visibility</mat-icon>
                      </button>
                    </div>
                    <div class="doc-item" *ngIf="store.documents.product_samples && store.documents.product_samples.length > 0">
                      <mat-icon>image</mat-icon>
                      <span>{{ store.documents.product_samples.length }} échantillon(s) produit</span>
                      <button mat-icon-button (click)="viewSamples(store.documents.product_samples)">
                        <mat-icon>visibility</mat-icon>
                      </button>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onClose()">
          Fermer
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .store-details-dialog {
      min-width: 700px;
      max-width: 900px;
      max-height: 85vh;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e0e0e0;
      position: relative;

      .store-logo {
        width: 64px;
        height: 64px;
        border-radius: 12px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
        }
      }

      .store-info {
        flex: 1;

        h2 {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 600;
          color: #333;
        }

        .store-vendor {
          margin: 0;
          color: #666;
          font-size: 16px;
        }
      }

      .close-btn {
        position: absolute;
        top: 0;
        right: 0;
      }
    }

    .dialog-content {
      max-height: 60vh;
      overflow-y: auto;
      padding: 0 0 24px 0;
    }

    .tab-content {
      padding: 16px 0;
    }

    .details-grid {
      display: grid;
      gap: 16px;
    }

    .detail-card {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      mat-card-header {
        padding-bottom: 8px;

        mat-card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          font-weight: 600;
          color: #1976d2;

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }
      }

      mat-card-content {
        padding-top: 0;
      }
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .label {
        font-weight: 500;
        color: #666;
        min-width: 150px;
      }

      .value {
        color: #333;
        text-align: right;
        flex: 1;
        margin-left: 16px;

        &.reason {
          color: #ef4444;
          font-weight: 500;
        }
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .stat-box {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;

      mat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
        color: #10b981;
      }

      .stat-info {
        display: flex;
        flex-direction: column;

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
        }

        .stat-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
        }
      }
    }

    .documents-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .doc-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;

      mat-icon:first-child {
        color: #64748b;
      }

      span {
        flex: 1;
        color: #1e293b;
      }
    }

    mat-dialog-actions {
      padding: 16px 0 0 0;
      margin: 0;
      border-top: 1px solid #e0e0e0;
    }

    @media (max-width: 768px) {
      .store-details-dialog {
        min-width: 90vw;
        max-width: 95vw;
      }

      .dialog-header {
        flex-direction: column;
        text-align: center;
        gap: 12px;

        .close-btn {
          position: static;
          align-self: flex-end;
        }
      }

      .detail-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;

        .value {
          text-align: left;
          margin-left: 0;
        }
      }
    }
  `]
})
export class StoreDetailsDialogComponent {
  store: any;

  constructor(
    private dialogRef: MatDialogRef<StoreDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StoreDetailsData
  ) {
    this.store = data.store;
  }

  getStatusLabel(status: string): string {
    const statuses: { [key: string]: string } = {
      'pending': 'En attente',
      'active': 'Active',
      'suspended': 'Suspendue',
      'rejected': 'Rejetée',
      'under_review': 'En révision',
      'additional_info_required': 'Infos requises'
    };
    return statuses[status] || status;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'primary';
      case 'pending': return 'accent';
      case 'suspended': return 'warn';
      case 'rejected': return 'warn';
      default: return 'primary';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  }

  viewDocument(url: string): void {
    window.open(url, '_blank');
  }

  viewSamples(samples: string[]): void {
    // TODO: Ouvrir une galerie d'images
    console.log('Échantillons:', samples);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}




