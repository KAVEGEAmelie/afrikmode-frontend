import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PaymentMethod {
  id: string;
  name: string;
  provider: string;
  is_active: boolean;
  api_key?: string;
}

interface CommissionRate {
  vendor_tier: string;
  rate: number;
}

@Component({
  selector: 'app-admin-payment-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="payment-settings-page">
      <div class="page-header">
        <h1>Configuration des Paiements</h1>
        <p class="subtitle">Gérez les moyens de paiement et les commissions</p>
      </div>

      <div class="settings-grid">
        <!-- Moyens de paiement -->
        <div class="settings-card">
          <h2>Moyens de Paiement</h2>
          <div class="payment-methods">
            <div *ngFor="let method of paymentMethods" class="method-item">
              <div class="method-info">
                <div class="provider-icon">{{ getProviderIcon(method.provider) }}</div>
                <div>
                  <h4>{{ method.name }}</h4>
                  <p>{{ method.provider }}</p>
                </div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" [(ngModel)]="method.is_active" (change)="savePaymentMethod(method)">
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <button class="btn-add" (click)="addPaymentMethod()">+ Ajouter un moyen de paiement</button>
        </div>

        <!-- Taux de commission -->
        <div class="settings-card">
          <h2>Taux de Commission</h2>
          <div class="commission-rates">
            <div *ngFor="let rate of commissionRates" class="rate-item">
              <label>{{ rate.vendor_tier | titlecase }}</label>
              <div class="rate-input-group">
                <input type="number" [(ngModel)]="rate.rate" min="0" max="100" step="0.1" class="rate-input">
                <span class="rate-suffix">%</span>
              </div>
            </div>
          </div>
          <button class="btn-save" (click)="saveCommissions()">Enregistrer les modifications</button>
        </div>

        <!-- Frais de service -->
        <div class="settings-card">
          <h2>Frais de Service</h2>
          <div class="form-group">
            <label>Frais de transaction</label>
            <div class="rate-input-group">
              <input type="number" [(ngModel)]="transactionFee" class="rate-input">
              <span class="rate-suffix">XOF</span>
            </div>
          </div>
          <div class="form-group">
            <label>Frais de retrait minimum</label>
            <div class="rate-input-group">
              <input type="number" [(ngModel)]="withdrawalFee" class="rate-input">
              <span class="rate-suffix">XOF</span>
            </div>
          </div>
          <button class="btn-save" (click)="saveFees()">Enregistrer</button>
        </div>

        <!-- API Configuration -->
        <div class="settings-card">
          <h2>Configuration API</h2>
          <div class="api-config">
            <div class="api-item">
              <h4>MTN Mobile Money</h4>
              <input type="password" [(ngModel)]="apiKeys.mtn" placeholder="Clé API MTN" class="api-input">
            </div>
            <div class="api-item">
              <h4>Orange Money</h4>
              <input type="password" [(ngModel)]="apiKeys.orange" placeholder="Clé API Orange" class="api-input">
            </div>
            <div class="api-item">
              <h4>Moov Money</h4>
              <input type="password" [(ngModel)]="apiKeys.moov" placeholder="Clé API Moov" class="api-input">
            </div>
          </div>
          <button class="btn-save" (click)="saveApiKeys()">Enregistrer les clés</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-settings-page { padding: 2rem; background: #f8f9fa; min-height: 100vh; }
    .page-header h1 { font-size: 2rem; font-weight: 700; color: #2c3e50; margin: 0 0 0.5rem 0; }
    .subtitle { color: #6c757d; margin-bottom: 2rem; }
    .settings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .settings-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .settings-card h2 { font-size: 1.25rem; color: #2c3e50; margin: 0 0 1.5rem 0; }
    .payment-methods { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1rem; }
    .method-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
    .method-info { display: flex; align-items: center; gap: 1rem; }
    .provider-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #8B2E2E, #D9744F); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
    .method-info h4 { margin: 0; font-size: 1rem; }
    .method-info p { margin: 0; font-size: 0.875rem; color: #6c757d; }
    .toggle-switch { position: relative; display: inline-block; width: 48px; height: 24px; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-switch input:checked + .slider { background-color: #28a745; }
    .toggle-switch input:checked + .slider:before { transform: translateX(24px); }
    .slider { position: absolute; cursor: pointer; inset: 0; background-color: #ccc; transition: 0.4s; border-radius: 24px; }
    .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: 0.4s; border-radius: 50%; }
    .commission-rates { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
    .rate-item { display: flex; justify-content: space-between; align-items: center; }
    .rate-input-group { display: flex; align-items: center; gap: 0.5rem; }
    .rate-input { width: 100px; padding: 0.5rem; border: 1px solid #ced4da; border-radius: 6px; text-align: right; }
    .rate-suffix { color: #6c757d; font-weight: 600; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #495057; }
    .api-config { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
    .api-item h4 { margin: 0 0 0.5rem 0; }
    .api-input { width: 100%; padding: 0.75rem; border: 1px solid #ced4da; border-radius: 8px; }
    .btn-add, .btn-save { width: 100%; padding: 0.75rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-add { background: #28a745; color: white; }
    .btn-save { background: #8B2E2E; color: white; }
    .btn-add:hover { background: #218838; }
    .btn-save:hover { background: #6d2424; }
    @media (max-width: 1024px) { .settings-grid { grid-template-columns: 1fr; } }
  `]
})
export class AdminPaymentSettingsComponent implements OnInit {
  paymentMethods: PaymentMethod[] = [];
  commissionRates: CommissionRate[] = [];
  transactionFee = 500;
  withdrawalFee = 1000;
  apiKeys = { mtn: '', orange: '', moov: '' };

  ngOnInit() {
    this.paymentMethods = [
      { id: '1', name: 'MTN Mobile Money', provider: 'MTN', is_active: true },
      { id: '2', name: 'Orange Money', provider: 'Orange', is_active: true },
      { id: '3', name: 'Moov Money', provider: 'Moov', is_active: true },
      { id: '4', name: 'Carte Bancaire', provider: 'Stripe', is_active: false }
    ];

    this.commissionRates = [
      { vendor_tier: 'basic', rate: 15 },
      { vendor_tier: 'pro', rate: 10 },
      { vendor_tier: 'premium', rate: 5 }
    ];
  }

  getProviderIcon(provider: string): string {
    const icons: Record<string, string> = {
      'MTN': '📱',
      'Orange': '🍊',
      'Moov': '💳',
      'Stripe': '💰'
    };
    return icons[provider] || '💳';
  }

  savePaymentMethod(method: PaymentMethod) {
    console.log('💳 Sauvegarde:', method);
  }

  addPaymentMethod() {
    console.log('➕ Ajouter nouveau moyen de paiement');
  }

  saveCommissions() {
    console.log('💰 Commissions sauvegardées:', this.commissionRates);
  }

  saveFees() {
    console.log('💵 Frais sauvegardés:', { transactionFee: this.transactionFee, withdrawalFee: this.withdrawalFee });
  }

  saveApiKeys() {
    console.log('🔑 Clés API sauvegardées');
  }
}
