import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

export interface UserDetailsData {
  user: any;
}

@Component({
  selector: 'app-user-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <div class="user-details-dialog">
      <div class="dialog-header">
        <div class="user-avatar">
          {{ data.user.firstName.charAt(0) }}{{ data.user.lastName.charAt(0) }}
        </div>
        <div class="user-info">
          <h2 mat-dialog-title>{{ data.user.firstName }} {{ data.user.lastName }}</h2>
          <p class="user-email">{{ data.user.email }}</p>
        </div>
        <button mat-icon-button (click)="onClose()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="details-grid">
          <!-- Informations personnelles -->
          <mat-card class="detail-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>person</mat-icon>
                Informations personnelles
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="detail-item">
                <span class="label">Prénom:</span>
                <span class="value">{{ data.user.firstName }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Nom:</span>
                <span class="value">{{ data.user.lastName }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Email:</span>
                <span class="value">{{ data.user.email }}</span>
              </div>
              <div class="detail-item" *ngIf="data.user.phone">
                <span class="label">Téléphone:</span>
                <span class="value">{{ data.user.phone }}</span>
              </div>
              <div class="detail-item" *ngIf="data.user.address">
                <span class="label">Adresse:</span>
                <span class="value">{{ data.user.address }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Rôle et statut -->
          <mat-card class="detail-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>admin_panel_settings</mat-icon>
                Rôle et permissions
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="detail-item">
                <span class="label">Rôle:</span>
                <mat-chip [color]="getRoleColor(data.user.role)" selected>
                  {{ getRoleLabel(data.user.role) }}
                </mat-chip>
              </div>
              <div class="detail-item">
                <span class="label">Statut:</span>
                <mat-chip [color]="getStatusColor(data.user.status)" selected>
                  {{ getStatusLabel(data.user.status) }}
                </mat-chip>
              </div>
              <div class="detail-item">
                <span class="label">Inscrit le:</span>
                <span class="value">{{ data.user.createdAt | date:'dd/MM/yyyy à HH:mm' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Dernière connexion:</span>
                <span class="value">{{ data.user.lastLogin ? (data.user.lastLogin | date:'dd/MM/yyyy à HH:mm') : 'Jamais' }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Statistiques -->
          <mat-card class="detail-card" *ngIf="data.user.role === 'customer'">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>shopping_cart</mat-icon>
                Statistiques d'achat
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="detail-item">
                <span class="label">Nombre de commandes:</span>
                <span class="value stat-value">{{ data.user.totalOrders }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Total dépensé:</span>
                <span class="value stat-value">{{ data.user.totalSpent | currency:'EUR':'symbol':'1.2-2' }}</span>
              </div>
              <div class="detail-item" *ngIf="data.user.totalOrders > 0">
                <span class="label">Panier moyen:</span>
                <span class="value stat-value">{{ (data.user.totalSpent / data.user.totalOrders) | currency:'EUR':'symbol':'1.2-2' }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Informations vendeur -->
          <mat-card class="detail-card" *ngIf="data.user.role === 'vendor'">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>store</mat-icon>
                Informations vendeur
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="detail-item">
                <span class="label">Boutique:</span>
                <span class="value">{{ data.user.storeName || 'Non définie' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Produits vendus:</span>
                <span class="value stat-value">{{ data.user.productsCount || 0 }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Ventes totales:</span>
                <span class="value stat-value">{{ data.user.totalSales || 0 | currency:'EUR':'symbol':'1.2-2' }}</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onClose()">
          Fermer
        </button>
        <button mat-raised-button color="primary" (click)="onEdit()">
          <mat-icon>edit</mat-icon>
          Modifier
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .user-details-dialog {
      min-width: 600px;
      max-width: 800px;
      max-height: 80vh;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e0e0e0;
      position: relative;

      .user-avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: linear-gradient(135deg, #1976d2, #42a5f5);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 24px;
      }

      .user-info {
        flex: 1;

        h2 {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 600;
          color: #333;
        }

        .user-email {
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
        min-width: 120px;
      }

      .value {
        color: #333;
        text-align: right;
        flex: 1;
        margin-left: 16px;

        &.stat-value {
          font-weight: 600;
          color: #1976d2;
        }
      }
    }

    mat-dialog-actions {
      padding: 16px 0 0 0;
      margin: 0;
      border-top: 1px solid #e0e0e0;

      button {
        margin-left: 8px;
        min-width: 100px;
      }
    }

    @media (max-width: 768px) {
      .user-details-dialog {
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

      mat-dialog-actions {
        flex-direction: column-reverse;
        gap: 8px;

        button {
          margin: 0;
          width: 100%;
        }
      }
    }
  `]
})
export class UserDetailsDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<UserDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDetailsData
  ) {}

  getRoleLabel(role: string): string {
    const roles: { [key: string]: string } = {
      'customer': 'Client',
      'vendor': 'Vendeur',
      'manager': 'Manager',
      'admin': 'Admin',
      'super_admin': 'Super Admin'
    };
    return roles[role] || role;
  }

  getStatusLabel(status: string): string {
    const statuses: { [key: string]: string } = {
      'active': 'Actif',
      'inactive': 'Inactif',
      'suspended': 'Suspendu'
    };
    return statuses[status] || status;
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'super_admin': return 'warn';
      case 'admin': return 'primary';
      case 'vendor': return 'accent';
      case 'customer': return 'primary';
      default: return 'primary';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'primary';
      case 'inactive': return 'accent';
      case 'suspended': return 'warn';
      default: return 'primary';
    }
  }

  onEdit(): void {
    this.dialogRef.close({ action: 'edit', user: this.data.user });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
