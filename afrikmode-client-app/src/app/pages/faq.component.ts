// Page FAQ
import { Component } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterModule, NgFor],
  template: `
    <div class="page-container">
      <div class="hero-section">
        <div class="container">
          <h1 class="page-title">Questions Fréquentes</h1>
          <p class="page-subtitle">Trouvez rapidement les réponses à vos questions</p>
        </div>
      </div>
      <div class="content-section">
        <div class="container">
          <div class="faq-list">
            <div class="faq-item" *ngFor="let faq of faqs">
              <button class="faq-question" (click)="toggleFaq(faq.id)">
                {{ faq.question }}
                <i class="fas fa-chevron-down" [class.rotated]="faq.expanded"></i>
              </button>
              <div class="faq-answer" [class.expanded]="faq.expanded">
                <p [innerHTML]="faq.answer"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { min-height: 100vh; }
    .hero-section { background: linear-gradient(135deg, #8B2E2E 0%, #D9744F 100%); color: white; padding: 100px 0 80px; text-align: center; }
    .faq-question { width: 100%; display: flex; justify-content: space-between; padding: 20px; background: #FFF9F6; border: none; margin-bottom: 10px; border-radius: 10px; cursor: pointer; font-weight: 600; color: #8B2E2E; }
    .faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
    .faq-answer.expanded { max-height: 200px; }
  `]
})
export class FaqComponent {
  faqs = [
    { id: 1, question: "Comment passer une commande ?", answer: "Ajoutez les articles à votre panier et procédez au paiement.", expanded: false },
    { id: 2, question: "Quels sont les délais de livraison ?", answer: "3-7 jours ouvrés selon votre localisation.", expanded: false },
    // Ajoutez plus de FAQs
  ];

  toggleFaq(id: number) {
    const faq = this.faqs.find(f => f.id === id);
    if (faq) faq.expanded = !faq.expanded;
  }
}