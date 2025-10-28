import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="edit-product-page">
      <h1>Modifier le Produit</h1>
      <p>Page de modification de produit en cours de développement...</p>
    </div>
  `,
  styles: [`
    .edit-product-page {
      padding: 20px;
    }
  `]
})
export class EditProductComponent {
  constructor() {}
}

