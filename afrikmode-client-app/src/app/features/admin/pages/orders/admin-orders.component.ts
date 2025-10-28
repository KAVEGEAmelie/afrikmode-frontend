import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-orders-page">
      <h1>Commandes Admin</h1>
      <p>Page de gestion des commandes admin en cours de développement...</p>
    </div>
  `,
  styles: [`
    .admin-orders-page {
      padding: 20px;
    }
  `]
})
export class AdminOrdersComponent {
  constructor() {}
}

