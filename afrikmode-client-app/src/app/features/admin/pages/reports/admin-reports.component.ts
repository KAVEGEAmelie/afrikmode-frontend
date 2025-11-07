import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReportsService, Report } from '../../core/services/reports.service';
import { ToastService } from '../../../../core/services/toast.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule,
    MatTooltipModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <div class="reports-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>
            <mat-icon>assessment</mat-icon>
            Rapports & Exports
          </h1>
          <p class="subtitle">Générez et exportez des rapports détaillés de votre plateforme</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="openGenerateDialog()">
            <mat-icon>add</mat-icon>
            Nouveau rapport
          </button>
        </div>
      </div>

      <!-- Quick Access Cards -->
      <div class="reports-grid">
        <mat-card class="report-card" (click)="navigateToReport('sales')">
          <div class="report-icon sales">
            <mat-icon>trending_up</mat-icon>
          </div>
          <h3>Rapport de Ventes</h3>
          <p>Analysez les performances de vos ventes par période</p>
          <button mat-stroked-button color="primary" (click)="navigateToReport('sales'); $event.stopPropagation()">
            Voir rapport
          </button>
        </mat-card>

        <mat-card class="report-card" (click)="navigateToReport('inventory')">
          <div class="report-icon inventory">
            <mat-icon>inventory</mat-icon>
          </div>
          <h3>Rapport d'Inventaire</h3>
          <p>État des stocks et niveaux d'inventaire</p>
          <button mat-stroked-button color="primary" (click)="navigateToReport('inventory'); $event.stopPropagation()">
            Voir rapport
          </button>
        </mat-card>

        <mat-card class="report-card" (click)="navigateToReport('finance')">
          <div class="report-icon finance">
            <mat-icon>account_balance</mat-icon>
          </div>
          <h3>Rapport Financier</h3>
          <p>Synthèse financière et comptable complète</p>
          <button mat-stroked-button color="primary" (click)="navigateToReport('finance'); $event.stopPropagation()">
            Voir rapport
          </button>
        </mat-card>

        <mat-card class="report-card" (click)="navigateToReport('custom')">
          <div class="report-icon custom">
            <mat-icon>tune</mat-icon>
          </div>
          <h3>Rapport Personnalisé</h3>
          <p>Créez votre propre rapport avec critères personnalisés</p>
          <button mat-stroked-button color="primary" (click)="navigateToReport('custom'); $event.stopPropagation()">
            Créer
          </button>
        </mat-card>
      </div>

      <!-- Recent Reports -->
      <mat-card class="recent-reports-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>history</mat-icon>
            Rapports Récents
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (loading) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Chargement des rapports...</p>
            </div>
          }

          @if (!loading && reports.length > 0) {
            <div class="reports-table">
              <table mat-table [dataSource]="reports" class="mat-elevation-z0">
                <!-- Type Column -->
                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let report">
                    <mat-chip [color]="getTypeColor(report.type)">
                      {{ getTypeLabel(report.type) }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Title Column -->
                <ng-container matColumnDef="title">
                  <th mat-header-cell *matHeaderCellDef>Titre</th>
                  <td mat-cell *matCellDef="let report">{{ report.title }}</td>
                </ng-container>

                <!-- Format Column -->
                <ng-container matColumnDef="format">
                  <th mat-header-cell *matHeaderCellDef>Format</th>
                  <td mat-cell *matCellDef="let report">
                    <span class="format-badge">{{ report.format.toUpperCase() }}</span>
                  </td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Statut</th>
                  <td mat-cell *matCellDef="let report">
                    <mat-chip [color]="getStatusColor(report.status)">
                      {{ getStatusLabel(report.status) }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Generated At Column -->
                <ng-container matColumnDef="generatedAt">
                  <th mat-header-cell *matHeaderCellDef>Généré le</th>
                  <td mat-cell *matCellDef="let report">
                    {{ formatDate(report.generatedAt) }}
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let report">
                    <button 
                      mat-icon-button 
                      [matMenuTriggerFor]="menu"
                      [disabled]="report.status !== 'completed'">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button 
                        mat-menu-item 
                        (click)="downloadReport(report)"
                        [disabled]="report.status !== 'completed'">
                        <mat-icon>download</mat-icon>
                        Télécharger
                      </button>
                      <button mat-menu-item (click)="viewReport(report)">
                        <mat-icon>visibility</mat-icon>
                        Voir détails
                      </button>
                      <button mat-menu-item (click)="deleteReport(report)">
                        <mat-icon>delete</mat-icon>
                        Supprimer
                      </button>
                    </mat-menu>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>

              <mat-paginator
                [length]="totalReports"
                [pageSize]="pageSize"
                [pageIndex]="currentPage"
                [pageSizeOptions]="[10, 20, 50]"
                (page)="onPageChange($event)"
                showFirstLastButtons>
              </mat-paginator>
            </div>
          }

          @if (!loading && reports.length === 0) {
            <div class="empty-state">
              <mat-icon>assessment</mat-icon>
              <h3>Aucun rapport généré</h3>
              <p>Commencez par générer votre premier rapport</p>
              <button mat-raised-button color="primary" (click)="openGenerateDialog()">
                <mat-icon>add</mat-icon>
                Générer un rapport
              </button>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .reports-page {
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

    .header-left h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
    }

    .header-left h1 mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #8B2E2E;
    }

    .subtitle {
      margin: 0;
      color: #64748b;
      font-size: 14px;
    }

    .reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .report-card {
      padding: 24px;
      border-radius: 16px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .report-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    }

    .report-icon {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .report-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .report-icon.sales {
      background: linear-gradient(135deg, #10b981, #059669);
    }

    .report-icon.inventory {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
    }

    .report-icon.finance {
      background: linear-gradient(135deg, #f59e0b, #d97706);
    }

    .report-icon.custom {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    }

    .report-card h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
    }

    .report-card p {
      margin: 0 0 16px 0;
      color: #64748b;
      font-size: 14px;
      line-height: 1.5;
    }

    .recent-reports-card {
      margin-top: 24px;
    }

    .recent-reports-card mat-card-header {
      padding-bottom: 16px;
    }

    .recent-reports-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 600;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      gap: 16px;
    }

    .loading-container p {
      color: #64748b;
      margin: 0;
    }

    .reports-table {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    .format-badge {
      padding: 4px 8px;
      background: #e2e8f0;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #cbd5e1;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #1e293b;
    }

    .empty-state p {
      margin: 0 0 24px 0;
      color: #64748b;
    }

    mat-paginator {
      background: transparent;
    }
  `]
})
export class AdminReportsComponent implements OnInit {
  reports: Report[] = [];
  loading = false;
  totalReports = 0;
  currentPage = 0;
  pageSize = 10;
  displayedColumns: string[] = ['type', 'title', 'format', 'status', 'generatedAt', 'actions'];

  constructor(
    private reportsService: ReportsService,
    private toastService: ToastService,
    private router: Router,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  private loadReports(): void {
    this.loading = true;
    this.reportsService.getReports(this.currentPage + 1, this.pageSize).subscribe({
      next: (response) => {
        this.reports = response.reports || [];
        this.totalReports = response.total || 0;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur chargement rapports:', error);
        this.toastService.error('Erreur lors du chargement des rapports');
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadReports();
  }

  navigateToReport(type: string): void {
    this.router.navigate([`/admin/reports/${type}`]);
  }

  openGenerateDialog(): void {
    // TODO: Ouvrir un dialog pour générer un nouveau rapport
    this.toastService.info('Fonctionnalité de génération de rapport à venir');
  }

  downloadReport(report: Report): void {
    if (!report.id || report.status !== 'completed') {
      this.toastService.warning('Ce rapport n\'est pas encore disponible');
      return;
    }

    this.reportsService.downloadReport(report.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.title}.${report.format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.toastService.success('Rapport téléchargé avec succès');
      },
      error: (error: any) => {
        console.error('Erreur téléchargement rapport:', error);
        this.toastService.error('Erreur lors du téléchargement du rapport');
      }
    });
  }

  viewReport(report: Report): void {
    // TODO: Ouvrir un dialog avec les détails du rapport
    this.toastService.info(`Détails du rapport: ${report.title}`);
  }

  deleteReport(report: Report): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le rapport "${report.title}" ?`)) {
      return;
    }

    if (!report.id) return;

    this.reportsService.deleteReport(report.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Rapport supprimé avec succès');
          this.loadReports();
        } else {
          this.toastService.error(response.message || 'Erreur lors de la suppression');
        }
      },
      error: (error: any) => {
        console.error('Erreur suppression rapport:', error);
        this.toastService.error('Erreur lors de la suppression du rapport');
      }
    });
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'activity': 'Activité',
      'transactions': 'Transactions',
      'vendors': 'Vendeurs',
      'custom': 'Personnalisé',
      'sales': 'Ventes',
      'inventory': 'Inventaire',
      'finance': 'Financier'
    };
    return labels[type] || type;
  }

  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'activity': 'primary',
      'transactions': 'accent',
      'vendors': 'primary',
      'custom': 'accent',
      'sales': 'primary',
      'inventory': 'accent',
      'finance': 'primary'
    };
    return colors[type] || 'primary';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'En attente',
      'completed': 'Terminé',
      'failed': 'Échoué'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'accent',
      'completed': 'primary',
      'failed': 'warn'
    };
    return colors[status] || 'primary';
  }

  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
