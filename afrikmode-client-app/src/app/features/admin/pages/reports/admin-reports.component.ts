import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reports-page">
      <div class="page-header">
        <h1>Génération de Rapports</h1>
        <p class="subtitle">Créez et exportez des rapports personnalisés</p>
      </div>

      <div class="reports-grid">
        <div class="report-card" (click)="generateReport('activity')">
          <div class="report-icon">📊</div>
          <h3>Rapport d'Activité Global</h3>
          <p>Vue d'ensemble de toutes les activités de la plateforme</p>
          <button class="btn-generate">Générer</button>
        </div>

        <div class="report-card" (click)="generateReport('transactions')">
          <div class="report-icon">💰</div>
          <h3>Export Transactions</h3>
          <p>Exporter toutes les transactions par période</p>
          <button class="btn-generate">Exporter</button>
        </div>

        <div class="report-card" (click)="generateReport('vendors')">
          <div class="report-icon">🏪</div>
          <h3>Rapport par Vendeur</h3>
          <p>Performance détaillée de chaque vendeur</p>
          <button class="btn-generate">Générer</button>
        </div>

        <div class="report-card" (click)="generateReport('custom')">
          <div class="report-icon">⚙️</div>
          <h3>Rapport Personnalisé</h3>
          <p>Créez votre propre rapport avec critères personnalisés</p>
          <button class="btn-generate">Créer</button>
        </div>
      </div>

      <div class="recent-reports">
        <h2>Rapports Récents</h2>
        <div class="reports-list">
          <div class="report-item">
            <div class="report-info">
              <h4>Rapport d'Activité - Octobre 2025</h4>
              <p>Généré le 21/10/2025 à 14:30</p>
            </div>
            <button class="btn-download">Télécharger</button>
          </div>
          <div class="report-item">
            <div class="report-info">
              <h4>Transactions - Septembre 2025</h4>
              <p>Généré le 01/10/2025 à 09:15</p>
            </div>
            <button class="btn-download">Télécharger</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-page { padding: 2rem; background: #f8f9fa; min-height: 100vh; }
    .page-header h1 { font-size: 2rem; font-weight: 700; color: #2c3e50; margin: 0 0 0.5rem 0; }
    .subtitle { color: #6c757d; margin-bottom: 2rem; }
    .reports-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
    .report-card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center; cursor: pointer; transition: all 0.3s; }
    .report-card:hover { transform: translateY(-4px); box-shadow: 0 4px 16px rgba(139, 46, 46, 0.15); }
    .report-icon { font-size: 3rem; margin-bottom: 1rem; }
    .report-card h3 { font-size: 1.125rem; color: #2c3e50; margin: 0 0 0.5rem 0; }
    .report-card p { color: #6c757d; font-size: 0.875rem; margin-bottom: 1.5rem; }
    .btn-generate { padding: 0.75rem 1.5rem; background: #8B2E2E; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%; }
    .recent-reports { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .recent-reports h2 { font-size: 1.25rem; color: #2c3e50; margin: 0 0 1.5rem 0; }
    .reports-list { display: flex; flex-direction: column; gap: 1rem; }
    .report-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
    .report-info h4 { margin: 0 0 0.25rem 0; color: #2c3e50; }
    .report-info p { margin: 0; font-size: 0.875rem; color: #6c757d; }
    .btn-download { padding: 0.5rem 1rem; background: #28a745; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
  `]
})
export class AdminReportsComponent {
  generateReport(type: string) {
    console.log('📊 Génération rapport:', type);
    alert(`Génération du rapport "${type}" en cours...`);
  }
}
