import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { ReportsService, TransactionReportData } from '../../core/services/reports.service';
import { ToastService } from '../../../../core/services/toast.service';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-reports-sales',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    MatTabsModule
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <div class="reports-sales-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>
            <mat-icon>trending_up</mat-icon>
            Rapport de Ventes
          </h1>
          <p class="subtitle">Analysez les performances de vos ventes par période</p>
        </div>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <form [formGroup]="filterForm" class="filters-form">
            <mat-form-field appearance="outline">
              <mat-label>Date de début</mat-label>
              <input matInput [matDatepicker]="picker1" formControlName="dateFrom">
              <mat-datepicker-toggle matIconSuffix [for]="picker1"></mat-datepicker-toggle>
              <mat-datepicker #picker1></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date de fin</mat-label>
              <input matInput [matDatepicker]="picker2" formControlName="dateTo">
              <mat-datepicker-toggle matIconSuffix [for]="picker2"></mat-datepicker-toggle>
              <mat-datepicker #picker2></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Format d'export</mat-label>
              <mat-select formControlName="format">
                <mat-option value="pdf">PDF</mat-option>
                <mat-option value="excel">Excel</mat-option>
                <mat-option value="csv">CSV</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button color="primary" (click)="loadReportData()" [disabled]="loading">
                <mat-icon>refresh</mat-icon>
                Actualiser
              </button>
              <button mat-raised-button color="accent" (click)="generateReport()" [disabled]="loading || !filterForm.valid">
                <mat-icon>download</mat-icon>
                Générer & Télécharger
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Loading -->
      @if (loading) {
        <div class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Chargement des données...</p>
        </div>
      }

      <!-- Report Data -->
      @if (!loading && reportData) {
        <mat-tab-group>
          <!-- Overview Tab -->
          <mat-tab label="Vue d'ensemble">
            <div class="tab-content">
              <div class="stats-grid">
                <mat-card class="stat-card">
                  <mat-card-content>
                    <div class="stat-icon revenue">
                      <mat-icon>attach_money</mat-icon>
                    </div>
                    <div class="stat-info">
                      <h3>{{ formatCurrency(reportData.totalAmount) }}</h3>
                      <p>Chiffre d'affaires total</p>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                  <mat-card-content>
                    <div class="stat-icon transactions">
                      <mat-icon>shopping_cart</mat-icon>
                    </div>
                    <div class="stat-info">
                      <h3>{{ reportData.totalTransactions }}</h3>
                      <p>Transactions totales</p>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                  <mat-card-content>
                    <div class="stat-icon disputes">
                      <mat-icon>gavel</mat-icon>
                    </div>
                    <div class="stat-info">
                      <h3>{{ reportData.disputes }}</h3>
                      <p>Litiges</p>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                  <mat-card-content>
                    <div class="stat-icon refunds">
                      <mat-icon>undo</mat-icon>
                    </div>
                    <div class="stat-info">
                      <h3>{{ reportData.refunds }}</h3>
                      <p>Remboursements</p>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Payment Methods Tab -->
          <mat-tab label="Méthodes de paiement">
            <div class="tab-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Ventes par méthode de paiement</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <table mat-table [dataSource]="paymentMethodsData" class="mat-elevation-z0">
                    <ng-container matColumnDef="method">
                      <th mat-header-cell *matHeaderCellDef>Méthode</th>
                      <td mat-cell *matCellDef="let item">{{ item.method }}</td>
                    </ng-container>
                    <ng-container matColumnDef="count">
                      <th mat-header-cell *matHeaderCellDef>Nombre</th>
                      <td mat-cell *matCellDef="let item">{{ item.count }}</td>
                    </ng-container>
                    <ng-container matColumnDef="amount">
                      <th mat-header-cell *matHeaderCellDef>Montant</th>
                      <td mat-cell *matCellDef="let item">{{ formatCurrency(item.amount) }}</td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="paymentMethodsColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: paymentMethodsColumns;"></tr>
                  </table>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Status Tab -->
          <mat-tab label="Par statut">
            <div class="tab-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Ventes par statut</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <table mat-table [dataSource]="statusData" class="mat-elevation-z0">
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Statut</th>
                      <td mat-cell *matCellDef="let item">
                        <mat-chip [color]="getStatusColor(item.status)">
                          {{ item.status }}
                        </mat-chip>
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="count">
                      <th mat-header-cell *matHeaderCellDef>Nombre</th>
                      <td mat-cell *matCellDef="let item">{{ item.count }}</td>
                    </ng-container>
                    <ng-container matColumnDef="amount">
                      <th mat-header-cell *matHeaderCellDef>Montant</th>
                      <td mat-cell *matCellDef="let item">{{ formatCurrency(item.amount) }}</td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="statusColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: statusColumns;"></tr>
                  </table>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .reports-sales-page {
      padding: 24px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .page-header {
      margin-bottom: 24px;
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .page-header h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
    }

    .page-header h1 mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #10b981;
    }

    .subtitle {
      margin: 0;
      color: #64748b;
      font-size: 14px;
    }

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-form {
      display: flex;
      gap: 16px;
      align-items: flex-end;
      flex-wrap: wrap;
    }

    .filters-form mat-form-field {
      flex: 1;
      min-width: 200px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      gap: 16px;
    }

    .tab-content {
      padding: 24px 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 24px !important;
    }

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .stat-icon.revenue {
      background: linear-gradient(135deg, #10b981, #059669);
    }

    .stat-icon.transactions {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
    }

    .stat-icon.disputes {
      background: linear-gradient(135deg, #f59e0b, #d97706);
    }

    .stat-icon.refunds {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    .stat-info h3 {
      margin: 0 0 4px 0;
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }

    .stat-info p {
      margin: 0;
      color: #64748b;
      font-size: 14px;
    }

    table {
      width: 100%;
    }
  `]
})
export class ReportsSalesComponent implements OnInit {
  filterForm: FormGroup;
  reportData: TransactionReportData | null = null;
  loading = false;
  paymentMethodsData: any[] = [];
  statusData: any[] = [];
  paymentMethodsColumns = ['method', 'count', 'amount'];
  statusColumns = ['status', 'count', 'amount'];

  constructor(
    private fb: FormBuilder,
    private reportsService: ReportsService,
    private toastService: ToastService
  ) {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    this.filterForm = this.fb.group({
      dateFrom: [lastMonth],
      dateTo: [today],
      format: ['pdf']
    });
  }

  ngOnInit(): void {
    this.loadReportData();
  }

  loadReportData(): void {
    if (!this.filterForm.valid) {
      this.toastService.warning('Veuillez remplir tous les champs');
      return;
    }

    const dateFrom = this.filterForm.value.dateFrom;
    const dateTo = this.filterForm.value.dateTo;

    if (!dateFrom || !dateTo) {
      this.toastService.warning('Veuillez sélectionner les dates');
      return;
    }

    this.loading = true;
    this.reportsService.getTransactionReportData(
      dateFrom.toISOString().split('T')[0],
      dateTo.toISOString().split('T')[0]
    ).subscribe({
      next: (data) => {
        this.reportData = data;
        this.paymentMethodsData = data.byPaymentMethod || [];
        this.statusData = data.byStatus || [];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur chargement données:', error);
        this.toastService.error('Erreur lors du chargement des données');
        this.loading = false;
      }
    });
  }

  generateReport(): void {
    if (!this.filterForm.valid) {
      this.toastService.warning('Veuillez remplir tous les champs');
      return;
    }

    const values = this.filterForm.value;
    const dateFrom = values.dateFrom.toISOString().split('T')[0];
    const dateTo = values.dateTo.toISOString().split('T')[0];

    this.loading = true;
    this.reportsService.generateTransactionReport({
      dateFrom,
      dateTo,
      format: values.format
    }).subscribe({
      next: (response) => {
        this.toastService.success('Rapport généré avec succès');
        // Télécharger le rapport
        setTimeout(() => {
          this.downloadGeneratedReport(response.reportId);
        }, 1000);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur génération rapport:', error);
        this.toastService.error('Erreur lors de la génération du rapport');
        this.loading = false;
      }
    });
  }

  private downloadGeneratedReport(reportId: string): void {
    this.reportsService.downloadReport(reportId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport-ventes-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.toastService.success('Rapport téléchargé');
      },
      error: (error: any) => {
        console.error('Erreur téléchargement:', error);
        this.toastService.error('Erreur lors du téléchargement');
      }
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'completed': 'primary',
      'pending': 'accent',
      'failed': 'warn',
      'cancelled': 'warn'
    };
    return colors[status.toLowerCase()] || 'primary';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  }
}

