import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-detail-page">
      <h1>Détail du Produit</h1>
      <p>Page de détail du produit en cours de développement...</p>
    </div>
  `,
  styles: [`
    .product-detail-page {
      padding: 20px;
    }
  `]
})
export class ProductDetailComponent {
  constructor() {}
}

