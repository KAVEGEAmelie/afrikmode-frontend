// src/app/features/admin/pages/stores/stores-pending.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { AdminService, VendorRequest } from '../../../../core/services/admin.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../users/confirm-dialog/confirm-dialog.component';
import { StoreReasonDialogComponent, StoreReasonDialogData } from './store-reason-dialog/store-reason-dialog.component';
import { StoreDetailsDialogComponent, StoreDetailsData } from './store-details-dialog/store-details-dialog.component';

interface PendingStore {
  id: string;
  name: string;
  vendor_name: string;
  email: string;
  phone: string;
  description: string;
  city: string;
  country: string;
  business_type: string;
  tax_id: string;
  submitted_at: string;
  documents: {
    business_registration?: string;
    tax_certificate?: string;
    id_card?: string;
    product_samples?: string[];
  };
}

@Component({
  selector: 'app-stores-pending',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  template: `
    <div class="admin-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">
            <mat-icon>hourglass_empty</mat-icon>
            Boutiques en Attente
          </h1>
          <p class="page-subtitle">Examinez et approuvez les nouvelles demandes de boutiques</p>
        </div>
        <div class="header-right">
          <mat-chip highlighted color="warn">{{ stores.length }} en attente</mat-chip>
        </div>
      </div>

      <!-- Loading -->
      @if (loading) {
        <div class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Chargement des boutiques en attente...</p>
        </div>
      }

      <!-- Stores Grid -->
      @if (!loading && stores.length > 0) {
        <div class="stores-grid">
          <mat-card class="store-card" *ngFor="let store of stores">
            <div class="store-header">
              <div class="store-logo">
                <mat-icon>store</mat-icon>
              </div>
              <div class="store-info">
                <h3>{{ store.name }}</h3>
                <p class="vendor-name">
                  <mat-icon>person</mat-icon>
                  {{ store.vendor_name }}
                </p>
                <p class="store-location">
                  <mat-icon>location_on</mat-icon>
                  {{ store.city }}, {{ store.country }}
                </p>
              </div>
            </div>

            <div class="store-details">
              <p class="store-description">{{ store.description }}</p>
              
              <div class="detail-row">
                <span class="label">Type d'entreprise:</span>
                <span class="value">{{ store.business_type }}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">ID Fiscal:</span>
                <span class="value">{{ store.tax_id }}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Contact:</span>
                <span class="value">{{ store.email }} | {{ store.phone }}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Date de soumission:</span>
                <span class="value">{{ formatDate(store.submitted_at) }}</span>
              </div>

              <!-- Documents -->
              <div class="documents-section">
                <h4>Documents fournis:</h4>
                <div class="documents-list">
                  @if (store.documents.business_registration) {
                    <mat-chip class="doc-chip">
                      <mat-icon>description</mat-icon>
                      Enregistrement commercial
                    </mat-chip>
                  }
                  @if (store.documents.tax_certificate) {
                    <mat-chip class="doc-chip">
                      <mat-icon>description</mat-icon>
                      Certificat fiscal
                    </mat-chip>
                  }
                  @if (store.documents.id_card) {
                    <mat-chip class="doc-chip">
                      <mat-icon>badge</mat-icon>
                      Pièce d'identité
                    </mat-chip>
                  }
                  @if (store.documents.product_samples && store.documents.product_samples.length > 0) {
                    <mat-chip class="doc-chip">
                      <mat-icon>image</mat-icon>
                      {{ store.documents.product_samples.length }} échantillon(s)
                    </mat-chip>
                  }
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="store-actions">
              <button 
                mat-raised-button 
                color="primary" 
                (click)="approveStore(store)"
                [disabled]="processingStoreId === store.id">
                <mat-icon>check</mat-icon>
                Approuver
              </button>
              <button 
                mat-stroked-button 
                color="warn" 
                (click)="rejectStore(store)"
                [disabled]="processingStoreId === store.id">
                <mat-icon>close</mat-icon>
                Rejeter
              </button>
              <button 
                mat-icon-button 
                [matMenuTriggerFor]="menu"
                matTooltip="Plus d'options">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="viewDetails(store)">
                  <mat-icon>visibility</mat-icon>
                  Voir détails
                </button>
                <button mat-menu-item (click)="requestInfo(store)">
                  <mat-icon>info</mat-icon>
                  Demander des infos
                </button>
              </mat-menu>
            </div>

            @if (processingStoreId === store.id) {
              <div class="processing-overlay">
                <mat-spinner diameter="30"></mat-spinner>
                <span>Traitement en cours...</span>
              </div>
            }
          </mat-card>
        </div>
      }

      <!-- Empty State -->
      @if (!loading && stores.length === 0) {
        <mat-card class="empty-state">
          <mat-icon>inbox</mat-icon>
          <h2>Aucune boutique en attente</h2>
          <p>Toutes les demandes ont été traitées</p>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .admin-page {
      padding: 24px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-left {
      flex: 1;
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
    }

    .page-title mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #f59e0b;
    }

    .page-subtitle {
      margin: 0;
      color: #64748b;
      font-size: 14px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      gap: 16px;
    }

    .loading-container p {
      color: #64748b;
      margin: 0;
    }

    .stores-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
    }

    .store-card {
      padding: 24px;
      border-radius: 16px;
      position: relative;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .store-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .store-header {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      align-items: flex-start;
    }

    .store-logo {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .store-logo mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .store-info {
      flex: 1;
    }

    .store-info h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
    }

    .vendor-name, .store-location {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 4px 0;
      color: #64748b;
      font-size: 14px;
    }

    .vendor-name mat-icon, .store-location mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .store-details {
      margin-bottom: 20px;
    }

    .store-description {
      color: #475569;
      margin-bottom: 16px;
      line-height: 1.6;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e2e8f0;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-row .label {
      font-weight: 500;
      color: #64748b;
      font-size: 13px;
    }

    .detail-row .value {
      color: #1e293b;
      font-size: 13px;
      text-align: right;
    }

    .documents-section {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 2px solid #e2e8f0;
    }

    .documents-section h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }

    .documents-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .doc-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
    }

    .doc-chip mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .store-actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }

    .store-actions button {
      flex: 1;
    }

    .processing-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .empty-state {
      padding: 60px 20px;
      text-align: center;
      background: white;
      border-radius: 12px;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #cbd5e1;
      margin-bottom: 16px;
    }

    .empty-state h2 {
      margin: 0 0 8px 0;
      color: #1e293b;
    }

    .empty-state p {
      margin: 0;
      color: #64748b;
    }
  `]
})
export class StoresPendingComponent implements OnInit {
  stores: PendingStore[] = [];
  loading = true;
  processingStoreId: string | null = null;

  constructor(
    private adminService: AdminService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPendingStores();
  }

  private loadPendingStores(): void {
    this.loading = true;
    
    this.adminService.getStoreRequests({
      status: 'pending',
      page: 1,
      limit: 1000,
      sortBy: 'created_at',
      sortOrder: 'desc'
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stores = response.data.map((item: VendorRequest) => this.mapToPendingStore(item));
          this.loading = false;
        } else {
          this.toastService.error('Erreur lors du chargement des boutiques');
          this.loading = false;
        }
      },
      error: (error: any) => {
        console.error('Erreur chargement boutiques en attente:', error);
        this.toastService.error('Erreur lors du chargement des boutiques');
        this.loading = false;
      }
    });
  }

  approveStore(store: PendingStore): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Approuver la boutique',
        message: `Êtes-vous sûr de vouloir approuver la boutique "${store.name}" ?`,
        confirmText: 'Approuver',
        cancelText: 'Annuler',
        type: 'info',
        icon: 'check_circle'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.processingStoreId = store.id;
        
        this.adminService.approveStore(store.id).subscribe({
          next: (response) => {
            if (response.success) {
              this.toastService.success('Boutique approuvée avec succès');
              this.loadPendingStores();
            } else {
              this.toastService.error(response.message || 'Erreur lors de l\'approbation');
              this.processingStoreId = null;
            }
          },
          error: (error: any) => {
            console.error('Erreur approbation boutique:', error);
            this.toastService.error('Erreur lors de l\'approbation de la boutique');
            this.processingStoreId = null;
          }
        });
      }
    });
  }

  rejectStore(store: PendingStore): void {
    const dialogRef = this.dialog.open(StoreReasonDialogComponent, {
      width: '500px',
      data: {
        title: 'Rejeter la boutique',
        message: `Veuillez indiquer la raison du rejet pour la boutique "${store.name}" :`,
        placeholder: 'Raison du rejet',
        confirmText: 'Rejeter',
        cancelText: 'Annuler',
        type: 'danger',
        icon: 'close',
        required: true
      } as StoreReasonDialogData
    });

    dialogRef.afterClosed().subscribe((reason) => {
      if (reason) {
        this.processingStoreId = store.id;
        
        this.adminService.rejectStore(store.id, reason).subscribe({
          next: (response) => {
            if (response.success) {
              this.toastService.success('Boutique rejetée');
              this.loadPendingStores();
            } else {
              this.toastService.error(response.message || 'Erreur lors du rejet');
              this.processingStoreId = null;
            }
          },
          error: (error: any) => {
            console.error('Erreur rejet boutique:', error);
            this.toastService.error('Erreur lors du rejet de la boutique');
            this.processingStoreId = null;
          }
        });
      }
    });
  }

  requestInfo(store: PendingStore): void {
    const dialogRef = this.dialog.open(StoreReasonDialogComponent, {
      width: '500px',
      data: {
        title: 'Demander des informations',
        message: `Quelles informations supplémentaires souhaitez-vous demander au vendeur de "${store.name}" ?`,
        placeholder: 'Message à envoyer au vendeur',
        confirmText: 'Envoyer',
        cancelText: 'Annuler',
        type: 'info',
        icon: 'info',
        required: true
      } as StoreReasonDialogData
    });

    dialogRef.afterClosed().subscribe((message) => {
      if (message) {
        this.processingStoreId = store.id;
        
        this.adminService.requestAdditionalInfo(store.id, message).subscribe({
          next: (response) => {
            if (response.success) {
              this.toastService.success('Demande d\'informations envoyée');
              this.processingStoreId = null;
            } else {
              this.toastService.error(response.message || 'Erreur lors de l\'envoi');
              this.processingStoreId = null;
            }
          },
          error: (error: any) => {
            console.error('Erreur demande info:', error);
            this.toastService.error('Erreur lors de l\'envoi de la demande');
            this.processingStoreId = null;
          }
        });
      }
    });
  }

  viewDetails(store: PendingStore): void {
    this.dialog.open(StoreDetailsDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        store: store
      } as StoreDetailsData
    });
  }

  private mapToPendingStore(item: VendorRequest): PendingStore {
    return {
      id: item.id,
      name: item.business_name || item.vendor_name,
      vendor_name: item.vendor_name,
      email: item.email,
      phone: item.phone,
      description: item.description,
      city: item.city,
      country: item.country,
      business_type: item.business_type,
      tax_id: item.tax_id,
      submitted_at: item.submitted_at,
      documents: item.documents || {}
    };
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
