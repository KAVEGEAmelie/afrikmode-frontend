import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="products-page">
      <h1>Produits</h1>
      <p>Page des produits en cours de développement...</p>
    </div>
  `,
  styles: [`
    .products-page {
      padding: 20px;
    }
  `]
})
export class ProductsComponent {
  constructor() {}
}

