import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="add-product-page">
      <h1>Ajouter un Produit</h1>
      <p>Page d'ajout de produit en cours de développement...</p>
    </div>
  `,
  styles: [`
    .add-product-page {
      padding: 20px;
    }
  `]
})
export class AddProductComponent {
  constructor() {}
}

