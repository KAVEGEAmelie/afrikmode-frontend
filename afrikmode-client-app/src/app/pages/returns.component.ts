// Page Returns - Retours et Échanges
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-returns',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="hero-section">
        <div class="container">
          <h1 class="page-title">Retours & Échanges</h1>
          <p class="page-subtitle">Politique de retour simple et transparente</p>
        </div>
      </div>
      <div class="content-section">
        <div class="container">
          <div class="policy-content">
            <h2>Conditions de retour</h2>
            <p>Vous avez <strong>14 jours</strong> à compter de la réception pour retourner votre article.</p>
            <!-- Contenu de la politique de retour -->
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { min-height: 100vh; }
    .hero-section { background: linear-gradient(135deg, #8B2E2E 0%, #D9744F 100%); color: white; padding: 100px 0 80px; text-align: center; }
    .page-title { font-size: 3rem; font-weight: bold; margin-bottom: 20px; }
    .content-section { padding: 80px 0; }
    .container { max-width: 1000px; margin: 0 auto; padding: 0 20px; }
    .policy-content h2 { color: #8B2E2E; margin-bottom: 30px; }
  `]
})
export class ReturnsComponent { }