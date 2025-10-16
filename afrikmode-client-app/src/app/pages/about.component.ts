import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="hero-section">
        <div class="container">
          <h1 class="page-title">À propos d'AfrikMode</h1>
          <p class="page-subtitle">Votre destination mode africaine authentique</p>
        </div>
      </div>

      <div class="content-section">
        <div class="container">
          <div class="content-grid">
            <!-- Notre Histoire -->
            <div class="content-block">
              <h2>Notre Histoire</h2>
              <p>
                AfrikMode est née d'une passion profonde pour la richesse culturelle africaine et 
                le désir de partager la beauté authentique de la mode africaine avec le monde entier. 
                Fondée en 2024, notre plateforme connecte créateurs talentueux et clients en quête d'authenticité.
              </p>
              <p>
                Nous croyons que chaque vêtement raconte une histoire, porte une tradition et 
                exprime l'âme créative de l'Afrique contemporaine.
              </p>
            </div>

            <!-- Notre Mission -->
            <div class="content-block">
              <h2>Notre Mission</h2>
              <div class="mission-grid">
                <div class="mission-item">
                  <i class="fas fa-heart"></i>
                  <h3>Authenticité</h3>
                  <p>Promouvoir la mode africaine authentique et soutenir les créateurs locaux.</p>
                </div>
                <div class="mission-item">
                  <i class="fas fa-globe-africa"></i>
                  <h3>Rayonnement</h3>
                  <p>Faire briller la créativité africaine sur la scène internationale.</p>
                </div>
                <div class="mission-item">
                  <i class="fas fa-handshake"></i>
                  <h3>Éthique</h3>
                  <p>Commerce équitable et développement durable des communautés.</p>
                </div>
              </div>
            </div>

            <!-- Nos Valeurs -->
            <div class="content-block">
              <h2>Nos Valeurs</h2>
              <ul class="values-list">
                <li><strong>Excellence :</strong> Qualité supérieure dans chaque création</li>
                <li><strong>Respect :</strong> Honorer les traditions tout en embrassant la modernité</li>
                <li><strong>Innovation :</strong> Repousser les limites de la créativité</li>
                <li><strong>Communauté :</strong> Construire des ponts entre cultures et générations</li>
                <li><strong>Durabilité :</strong> Mode responsable et respectueuse de l'environnement</li>
              </ul>
            </div>

            <!-- L'Équipe -->
            <div class="content-block">
              <h2>Notre Équipe</h2>
              <p>
                AfrikMode rassemble une équipe passionnée de créateurs, stylistes, développeurs et 
                experts en commerce électronique unis par l'amour de la mode africaine.
              </p>
              <div class="team-stats">
                <div class="stat-item">
                  <span class="stat-number">50+</span>
                  <span class="stat-label">Créateurs partenaires</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">15</span>
                  <span class="stat-label">Pays représentés</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">10k+</span>
                  <span class="stat-label">Clients satisfaits</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Call to Action -->
      <div class="cta-section">
        <div class="container">
          <h2>Rejoignez la révolution mode africaine</h2>
          <p>Découvrez notre collection exclusive et soutenez les créateurs africains</p>
          <div class="cta-buttons">
            <button routerLink="/shop" class="btn btn-primary">Découvrir la collection</button>
            <button routerLink="/contact" class="btn btn-outline">Nous contacter</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 100vh;
    }

    .hero-section {
      background: linear-gradient(135deg, #8B2E2E 0%, #D9744F 50%, #F5E4D7 100%);
      color: white;
      padding: 100px 0 80px;
      text-align: center;
    }

    .page-title {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 20px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .page-subtitle {
      font-size: 1.2rem;
      opacity: 0.9;
      max-width: 600px;
      margin: 0 auto;
    }

    .content-section {
      padding: 80px 0;
      background: #fff;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .content-grid {
      display: grid;
      gap: 60px;
    }

    .content-block {
      max-width: 800px;
      margin: 0 auto;
    }

    .content-block h2 {
      color: #8B2E2E;
      font-size: 2.2rem;
      margin-bottom: 30px;
      text-align: center;
    }

    .content-block p {
      line-height: 1.8;
      color: #333;
      margin-bottom: 20px;
      font-size: 1.1rem;
    }

    .mission-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 40px;
      margin-top: 40px;
    }

    .mission-item {
      text-align: center;
      padding: 30px 20px;
      border-radius: 15px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .mission-item:hover {
      transform: translateY(-5px);
    }

    .mission-item i {
      font-size: 3rem;
      color: #D9744F;
      margin-bottom: 20px;
    }

    .mission-item h3 {
      color: #8B2E2E;
      margin-bottom: 15px;
      font-size: 1.4rem;
    }

    .values-list {
      list-style: none;
      padding: 0;
    }

    .values-list li {
      padding: 15px 0;
      border-bottom: 1px solid #F5E4D7;
      font-size: 1.1rem;
      line-height: 1.6;
    }

    .values-list strong {
      color: #8B2E2E;
    }

    .team-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 30px;
      margin-top: 40px;
    }

    .stat-item {
      text-align: center;
      padding: 30px 20px;
      background: linear-gradient(135deg, #F5E4D7 0%, #FFF9F6 100%);
      border-radius: 15px;
    }

    .stat-number {
      display: block;
      font-size: 2.5rem;
      font-weight: bold;
      color: #8B2E2E;
      margin-bottom: 10px;
    }

    .stat-label {
      color: #666;
      font-weight: 500;
    }

    .cta-section {
      background: linear-gradient(135deg, #FFF9F6 0%, #F5E4D7 100%);
      padding: 80px 0;
      text-align: center;
    }

    .cta-section h2 {
      color: #8B2E2E;
      font-size: 2.5rem;
      margin-bottom: 20px;
    }

    .cta-section p {
      font-size: 1.2rem;
      color: #666;
      margin-bottom: 40px;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .cta-buttons {
      display: flex;
      gap: 20px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 15px 30px;
      border-radius: 25px;
      font-weight: bold;
      text-decoration: none;
      display: inline-block;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      cursor: pointer;
    }

    .btn-primary {
      background: linear-gradient(135deg, #8B2E2E 0%, #D9744F 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(139, 46, 46, 0.3);
    }

    .btn-outline {
      background: transparent;
      color: #8B2E2E;
      border-color: #8B2E2E;
    }

    .btn-outline:hover {
      background: #8B2E2E;
      color: white;
    }

    @media (max-width: 768px) {
      .page-title {
        font-size: 2rem;
      }
      
      .mission-grid {
        grid-template-columns: 1fr;
      }
      
      .cta-buttons {
        flex-direction: column;
        align-items: center;
      }
      
      .btn {
        width: 200px;
      }
    }
  `]
})
export class AboutComponent { }