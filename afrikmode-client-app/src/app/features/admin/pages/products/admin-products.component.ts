import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-products-page">
      <h1>Produits Admin</h1>
      <p>Page de gestion des produits admin en cours de développement...</p>
    </div>
  `,
  styles: [`
    .admin-products-page {
      padding: 20px;
    }
  `]
})
export class AdminProductsComponent {
  constructor() {}
}

