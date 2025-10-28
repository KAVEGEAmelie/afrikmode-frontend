import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Transaction {
  id: string;
  order_id: string;
  vendor_name: string;
  customer_name: string;
  amount: number;
  status: 'completed' | 'pending' | 'refunded' | 'disputed';
  payment_method: string;
  date: string;
}

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="transactions-page">
      <div class="page-header">
        <h1>Gestion des Transactions</h1>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ formatCurrency(getTotalAmount()) }}</div>
            <div class="stat-label">Total transactions</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ getByStatus('disputed').length }}</div>
            <div class="stat-label">Litiges en cours</div>
          </div>
        </div>
      </div>

      <div class="filters">
        <select [(ngModel)]="filterStatus" (change)="applyFilters()" class="filter-select">
          <option value="all">Tous les statuts</option>
          <option value="completed">Complétées</option>
          <option value="pending">En attente</option>
          <option value="disputed">Litiges</option>
          <option value="refunded">Remboursées</option>
        </select>
        <input type="text" [(ngModel)]="searchQuery" (input)="applyFilters()" placeholder="Rechercher..." class="search-input">
      </div>

      <div class="transactions-table">
        <table>
          <thead>
            <tr>
              <th>ID Transaction</th>
              <th>Vendeur</th>
              <th>Client</th>
              <th>Montant</th>
              <th>Méthode</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let tx of filteredTransactions">
              <td>#{{ tx.order_id }}</td>
              <td>{{ tx.vendor_name }}</td>
              <td>{{ tx.customer_name }}</td>
              <td class="amount">{{ formatCurrency(tx.amount) }}</td>
              <td>{{ tx.payment_method }}</td>
              <td>{{ formatDate(tx.date) }}</td>
              <td><span class="status-badge" [class]="tx.status">{{ tx.status }}</span></td>
              <td>
                <button class="btn-action" (click)="viewDetails(tx)">Détails</button>
                <button *ngIf="tx.status === 'disputed'" class="btn-refund" (click)="refundTransaction(tx)">Rembourser</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .transactions-page { padding: 2rem; background: #f8f9fa; min-height: 100vh; }
    .page-header { display: flex; justify-content: space-between; margin-bottom: 2rem; }
    .page-header h1 { font-size: 2rem; font-weight: 700; color: #2c3e50; }
    .stats-grid { display: flex; gap: 1rem; }
    .stat-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #8B2E2E; }
    .stat-label { color: #6c757d; font-size: 0.875rem; margin-top: 0.5rem; }
    .filters { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
    .filter-select, .search-input { padding: 0.75rem; border: 1px solid #ced4da; border-radius: 8px; }
    .search-input { flex: 1; }
    .transactions-table { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f8f9fa; padding: 1rem; text-align: left; font-weight: 600; color: #495057; border-bottom: 2px solid #e9ecef; }
    td { padding: 1rem; border-bottom: 1px solid #f1f3f5; }
    .amount { font-weight: 700; color: #28a745; }
    .status-badge { padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600; }
    .status-badge.completed { background: #d4edda; color: #155724; }
    .status-badge.pending { background: #fff3cd; color: #856404; }
    .status-badge.disputed { background: #f8d7da; color: #721c24; }
    .status-badge.refunded { background: #d1ecf1; color: #0c5460; }
    .btn-action { padding: 0.5rem 1rem; background: #8B2E2E; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 0.5rem; }
    .btn-refund { padding: 0.5rem 1rem; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; }
  `]
})
export class AdminTransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  filterStatus = 'all';
  searchQuery = '';

  ngOnInit() {
    this.transactions = [
      { id: '1', order_id: 'ORD-001', vendor_name: 'Diallo Mode', customer_name: 'Sophie Martin', amount: 45000, status: 'completed', payment_method: 'MTN Money', date: '2025-10-20' },
      { id: '2', order_id: 'ORD-002', vendor_name: 'Kente Royale', customer_name: 'Jean Dupont', amount: 28500, status: 'disputed', payment_method: 'Orange Money', date: '2025-10-19' },
      { id: '3', order_id: 'ORD-003', vendor_name: 'Maasai Style', customer_name: 'Marie Dubois', amount: 12000, status: 'pending', payment_method: 'Carte bancaire', date: '2025-10-18' }
    ];
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.transactions];
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(tx => tx.status === this.filterStatus);
    }
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(tx =>
        tx.vendor_name.toLowerCase().includes(query) ||
        tx.customer_name.toLowerCase().includes(query) ||
        tx.order_id.toLowerCase().includes(query)
      );
    }
    this.filteredTransactions = filtered;
  }

  getByStatus(status: string) {
    return this.transactions.filter(tx => tx.status === status);
  }

  getTotalAmount() {
    return this.transactions.reduce((sum, tx) => sum + tx.amount, 0);
  }

  formatCurrency(amount: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount);
  }

  formatDate(date: string) {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  viewDetails(tx: Transaction) {
    console.log('Voir détails:', tx);
  }

  refundTransaction(tx: Transaction) {
    if (confirm(`Rembourser ${this.formatCurrency(tx.amount)} ?`)) {
      tx.status = 'refunded';
      console.log('💰 Remboursé:', tx);
    }
  }
}
