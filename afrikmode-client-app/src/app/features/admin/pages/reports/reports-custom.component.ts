import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ReportsService, ReportTemplate } from '../../core/services/reports.service';
import { ToastService } from '../../../../core/services/toast.service';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-reports-custom',
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
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <div class="reports-custom-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>
            <mat-icon>tune</mat-icon>
            Rapports Personnalisés
          </h1>
          <p class="subtitle">Créez votre propre rapport avec critères personnalisés</p>
        </div>
      </div>

      <!-- Report Builder -->
      <mat-card class="builder-card">
        <mat-card-header>
          <mat-card-title>Générateur de rapport personnalisé</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="customReportForm" class="custom-form">
            <!-- Basic Info -->
            <div class="form-section">
              <h3>Informations de base</h3>
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Titre du rapport</mat-label>
                  <input matInput formControlName="title" placeholder="Ex: Rapport mensuel Q4 2025">
                  <mat-error *ngIf="customReportForm.get('title')?.hasError('required')">
                    Le titre est obligatoire
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
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
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description (optionnel)</mat-label>
                  <textarea matInput formControlName="description" rows="3" placeholder="Décrivez le contenu de ce rapport..."></textarea>
                </mat-form-field>
              </div>
            </div>

            <!-- Metrics Selection -->
            <div class="form-section">
              <h3>Métriques à inclure</h3>
              <div class="metrics-grid">
                <mat-checkbox formControlName="includeUsers">Utilisateurs</mat-checkbox>
                <mat-checkbox formControlName="includeOrders">Commandes</mat-checkbox>
                <mat-checkbox formControlName="includeRevenue">Revenus</mat-checkbox>
                <mat-checkbox formControlName="includeProducts">Produits</mat-checkbox>
                <mat-checkbox formControlName="includeVendors">Vendeurs</mat-checkbox>
                <mat-checkbox formControlName="includeTransactions">Transactions</mat-checkbox>
                <mat-checkbox formControlName="includeInventory">Inventaire</mat-checkbox>
                <mat-checkbox formControlName="includeAnalytics">Analytics</mat-checkbox>
              </div>
            </div>

            <!-- Selected Metrics Display -->
            @if (selectedMetrics.length > 0) {
              <div class="selected-metrics">
                <h4>Métriques sélectionnées:</h4>
                <div class="chips-container">
                  <mat-chip *ngFor="let metric of selectedMetrics">{{ getMetricLabel(metric) }}</mat-chip>
                </div>
              </div>
            }

            <!-- Actions -->
            <div class="form-actions">
              <button mat-raised-button type="button" (click)="previewReport()" [disabled]="!customReportForm.valid || loading">
                <mat-icon>visibility</mat-icon>
                Aperçu
              </button>
              <button mat-raised-button color="primary" type="button" (click)="generateReport()" [disabled]="!customReportForm.valid || loading || selectedMetrics.length === 0">
                <mat-icon>download</mat-icon>
                Générer & Télécharger
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Templates -->
      <mat-card class="templates-card">
        <mat-card-header>
          <mat-card-title>Modèles de rapports</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (loadingTemplates) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          }

          @if (!loadingTemplates && templates.length > 0) {
            <div class="templates-grid">
              <div class="template-card" *ngFor="let template of templates" (click)="useTemplate(template)">
                <mat-icon>{{ getTemplateIcon(template.type) }}</mat-icon>
                <h4>{{ template.name }}</h4>
                <p>{{ template.description }}</p>
                <button mat-stroked-button color="primary">Utiliser</button>
              </div>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .reports-custom-page {
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
      color: #8b5cf6;
    }

    .builder-card, .templates-card {
      margin-bottom: 24px;
    }

    .custom-form {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .form-section h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
    }

    .form-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .form-row mat-form-field {
      flex: 1;
      min-width: 200px;
    }

    .full-width {
      width: 100%;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }

    .selected-metrics {
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .selected-metrics h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }

    .chips-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
    }

    .template-card {
      padding: 20px;
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .template-card:hover {
      border-color: #8b5cf6;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
    }

    .template-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #8b5cf6;
      margin-bottom: 12px;
    }

    .template-card h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .template-card p {
      margin: 0 0 16px 0;
      color: #64748b;
      font-size: 14px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
  `]
})
export class ReportsCustomComponent implements OnInit {
  customReportForm: FormGroup;
  loading = false;
  loadingTemplates = false;
  templates: ReportTemplate[] = [];
  selectedMetrics: string[] = [];

  constructor(
    private fb: FormBuilder,
    private reportsService: ReportsService,
    private toastService: ToastService
  ) {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    this.customReportForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      dateFrom: [lastMonth, Validators.required],
      dateTo: [today, Validators.required],
      format: ['pdf', Validators.required],
      includeUsers: [false],
      includeOrders: [false],
      includeRevenue: [false],
      includeProducts: [false],
      includeVendors: [false],
      includeTransactions: [false],
      includeInventory: [false],
      includeAnalytics: [false]
    });

    // Écouter les changements des checkboxes
    this.customReportForm.valueChanges.subscribe(() => {
      this.updateSelectedMetrics();
    });
  }

  ngOnInit(): void {
    this.loadTemplates();
    this.updateSelectedMetrics();
  }

  private updateSelectedMetrics(): void {
    const formValue = this.customReportForm.value;
    this.selectedMetrics = [];
    
    if (formValue.includeUsers) this.selectedMetrics.push('users');
    if (formValue.includeOrders) this.selectedMetrics.push('orders');
    if (formValue.includeRevenue) this.selectedMetrics.push('revenue');
    if (formValue.includeProducts) this.selectedMetrics.push('products');
    if (formValue.includeVendors) this.selectedMetrics.push('vendors');
    if (formValue.includeTransactions) this.selectedMetrics.push('transactions');
    if (formValue.includeInventory) this.selectedMetrics.push('inventory');
    if (formValue.includeAnalytics) this.selectedMetrics.push('analytics');
  }

  loadTemplates(): void {
    this.loadingTemplates = true;
    this.reportsService.getReportTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
        this.loadingTemplates = false;
      },
      error: (error: any) => {
        console.error('Erreur chargement templates:', error);
        this.toastService.error('Erreur lors du chargement des modèles');
        this.loadingTemplates = false;
      }
    });
  }

  useTemplate(template: ReportTemplate): void {
    this.toastService.info(`Utilisation du modèle: ${template.name}`);
    // TODO: Pré-remplir le formulaire avec les paramètres du template
  }

  previewReport(): void {
    if (!this.customReportForm.valid) {
      this.toastService.warning('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.selectedMetrics.length === 0) {
      this.toastService.warning('Veuillez sélectionner au moins une métrique');
      return;
    }

    this.toastService.info('Aperçu du rapport en cours de génération...');
    // TODO: Implémenter l'aperçu
  }

  generateReport(): void {
    if (!this.customReportForm.valid) {
      this.toastService.warning('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.selectedMetrics.length === 0) {
      this.toastService.warning('Veuillez sélectionner au moins une métrique');
      return;
    }

    const values = this.customReportForm.value;
    const dateFrom = values.dateFrom.toISOString().split('T')[0];
    const dateTo = values.dateTo.toISOString().split('T')[0];

    this.loading = true;
    this.reportsService.generateCustomReport({
      title: values.title,
      description: values.description,
      dateFrom,
      dateTo,
      format: values.format,
      metrics: this.selectedMetrics
    }).subscribe({
      next: (response) => {
        this.toastService.success('Rapport généré avec succès');
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
        const title = this.customReportForm.value.title || 'rapport-personnalise';
        a.download = `${title}-${new Date().toISOString().split('T')[0]}.pdf`;
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

  getMetricLabel(metric: string): string {
    const labels: { [key: string]: string } = {
      'users': 'Utilisateurs',
      'orders': 'Commandes',
      'revenue': 'Revenus',
      'products': 'Produits',
      'vendors': 'Vendeurs',
      'transactions': 'Transactions',
      'inventory': 'Inventaire',
      'analytics': 'Analytics'
    };
    return labels[metric] || metric;
  }

  getTemplateIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'activity': 'assessment',
      'transactions': 'account_balance',
      'vendors': 'store',
      'custom': 'tune'
    };
    return icons[type] || 'description';
  }
}

