// Mentions légales  
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="hero-section">
        <div class="container">
          <h1 class="page-title">Mentions Légales</h1>
        </div>
      </div>
      <div class="content-section">
        <div class="container">
          <div class="legal-content">
            <section>
              <h2>Éditeur du site</h2>
              <p><strong>AfrikMode SARL</strong><br>
              123 Avenue de l'Indépendance<br>
              Lomé, Togo<br>
              Tél: +228 22 XX XX XX</p>
            </section>
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
    .legal-content h2 { color: #8B2E2E; margin-bottom: 20px; }
  `]
})
export class LegalComponent { }