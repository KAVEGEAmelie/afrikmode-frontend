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
import { ReportsService } from '../../core/services/reports.service';
import { ToastService } from '../../../../core/services/toast.service';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-reports-finance',
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
    <div class="reports-finance-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>
            <mat-icon>account_balance</mat-icon>
            Rapport Financier
          </h1>
          <p class="subtitle">Synthèse financière et comptable complète</p>
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
              <button mat-raised-button color="primary" (click)="loadFinancialData()" [disabled]="loading">
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

      <!-- Financial Summary -->
      @if (!loading) {
        <div class="stats-grid">
          <mat-card class="stat-card revenue">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>trending_up</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ formatCurrency(financialData.totalRevenue) }}</h3>
                <p>Revenus totaux</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card expenses">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>trending_down</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ formatCurrency(financialData.totalExpenses) }}</h3>
                <p>Dépenses totales</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card profit">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>account_balance_wallet</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ formatCurrency(financialData.netProfit) }}</h3>
                <p>Bénéfice net</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card commissions">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>percent</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ formatCurrency(financialData.commissions) }}</h3>
                <p>Commissions</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <mat-tab-group>
          <!-- Revenue Tab -->
          <mat-tab label="Revenus">
            <div class="tab-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Détail des revenus</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <table mat-table [dataSource]="revenueData" class="mat-elevation-z0">
                    <ng-container matColumnDef="source">
                      <th mat-header-cell *matHeaderCellDef>Source</th>
                      <td mat-cell *matCellDef="let item">{{ item.source }}</td>
                    </ng-container>
                    <ng-container matColumnDef="amount">
                      <th mat-header-cell *matHeaderCellDef>Montant</th>
                      <td mat-cell *matCellDef="let item">{{ formatCurrency(item.amount) }}</td>
                    </ng-container>
                    <ng-container matColumnDef="percentage">
                      <th mat-header-cell *matHeaderCellDef>%</th>
                      <td mat-cell *matCellDef="let item">{{ item.percentage }}%</td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="revenueColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: revenueColumns;"></tr>
                  </table>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Expenses Tab -->
          <mat-tab label="Dépenses">
            <div class="tab-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Détail des dépenses</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <table mat-table [dataSource]="expensesData" class="mat-elevation-z0">
                    <ng-container matColumnDef="category">
                      <th mat-header-cell *matHeaderCellDef>Catégorie</th>
                      <td mat-cell *matCellDef="let item">{{ item.category }}</td>
                    </ng-container>
                    <ng-container matColumnDef="amount">
                      <th mat-header-cell *matHeaderCellDef>Montant</th>
                      <td mat-cell *matCellDef="let item">{{ formatCurrency(item.amount) }}</td>
                    </ng-container>
                    <ng-container matColumnDef="percentage">
                      <th mat-header-cell *matHeaderCellDef>%</th>
                      <td mat-cell *matCellDef="let item">{{ item.percentage }}%</td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="expensesColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: expensesColumns;"></tr>
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
    .reports-finance-page {
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
      color: #f59e0b;
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
      background: linear-gradient(135deg, #f59e0b, #d97706);
    }

    .stat-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .stat-card.revenue .stat-icon {
      background: linear-gradient(135deg, #10b981, #059669);
    }

    .stat-card.expenses .stat-icon {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    .stat-card.profit .stat-icon {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
    }

    .stat-card.commissions .stat-icon {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
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

    .tab-content {
      padding: 24px 0;
    }

    table {
      width: 100%;
    }
  `]
})
export class ReportsFinanceComponent implements OnInit {
  filterForm: FormGroup;
  loading = false;
  financialData = {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    commissions: 0
  };
  revenueData: any[] = [];
  expensesData: any[] = [];
  revenueColumns = ['source', 'amount', 'percentage'];
  expensesColumns = ['category', 'amount', 'percentage'];

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
    this.loadFinancialData();
  }

  loadFinancialData(): void {
    this.loading = true;
    // TODO: Appeler l'API pour récupérer les données financières
    setTimeout(() => {
      this.financialData = {
        totalRevenue: 12500000,
        totalExpenses: 3500000,
        netProfit: 9000000,
        commissions: 1250000
      };
      this.revenueData = [
        { source: 'Ventes', amount: 10000000, percentage: 80 },
        { source: 'Commissions', amount: 2000000, percentage: 16 },
        { source: 'Autres', amount: 500000, percentage: 4 }
      ];
      this.expensesData = [
        { category: 'Opérationnel', amount: 2000000, percentage: 57 },
        { category: 'Marketing', amount: 1000000, percentage: 29 },
        { category: 'Autres', amount: 500000, percentage: 14 }
      ];
      this.loading = false;
    }, 1000);
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
    // TODO: Générer le rapport financier
    this.toastService.info('Génération du rapport financier...');
    setTimeout(() => {
      this.loading = false;
      this.toastService.success('Rapport généré avec succès');
    }, 2000);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  }
}

