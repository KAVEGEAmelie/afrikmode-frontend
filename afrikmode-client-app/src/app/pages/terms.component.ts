// Pages légales - Conditions générales
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="hero-section">
        <div class="container">
          <h1 class="page-title">Conditions Générales d'Utilisation</h1>
        </div>
      </div>
      <div class="content-section">
        <div class="container">
          <div class="legal-content">
            <section>
              <h2>1. Objet</h2>
              <p>Les présentes conditions générales ont pour objet de définir les modalités et conditions d'utilisation du site AfrikMode.</p>
            </section>
            <section>
              <h2>2. Acceptation des conditions</h2>
              <p>L'utilisation du site implique l'acceptation pleine et entière des présentes conditions générales.</p>
            </section>
            <!-- Plus de contenu légal -->
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { min-height: 100vh; }
    .hero-section { background: linear-gradient(135deg, #8B2E2E 0%, #D9744F 100%); color: white; padding: 100px 0 60px; text-align: center; }
    .content-section { padding: 60px 0; }
    .container { max-width: 800px; margin: 0 auto; padding: 0 20px; }
    .legal-content section { margin-bottom: 40px; }
    .legal-content h2 { color: #8B2E2E; margin-bottom: 20px; }
    .legal-content p { line-height: 1.8; color: #333; }
  `]
})
export class TermsComponent { }