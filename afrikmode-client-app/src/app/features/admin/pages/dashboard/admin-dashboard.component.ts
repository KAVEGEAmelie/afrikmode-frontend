import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-dashboard-page">
      <h1>Dashboard Admin</h1>
      <p>Page de dashboard admin en cours de développement...</p>
    </div>
  `,
  styles: [`
    .admin-dashboard-page {
      padding: 20px;
    }
  `]
})
export class AdminDashboardComponent {
  constructor() {}
}

