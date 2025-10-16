import { Component } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-careers',
  standalone: true,
  imports: [CommonModule, RouterModule, NgFor],
  template: `
    <div class="page-container">
      <div class="hero-section">
        <div class="container">
          <h1 class="page-title">Rejoignez l'équipe AfrikMode</h1>
          <p class="page-subtitle">Construisons ensemble l'avenir de la mode africaine</p>
        </div>
      </div>

      <div class="content-section">
        <div class="container">
          <!-- Pourquoi nous rejoindre -->
          <div class="why-join-section">
            <h2>Pourquoi rejoindre AfrikMode ?</h2>
            <div class="benefits-grid">
              <div class="benefit-item" *ngFor="let benefit of benefits">
                <i [class]="benefit.icon"></i>
                <h3>{{ benefit.title }}</h3>
                <p>{{ benefit.description }}</p>
              </div>
            </div>
          </div>

          <!-- Postes disponibles -->
          <div class="jobs-section">
            <h2>Postes disponibles</h2>
            <div class="jobs-list">
              <div class="job-card" *ngFor="let job of availableJobs">
                <div class="job-header">
                  <div class="job-info">
                    <h3>{{ job.title }}</h3>
                    <div class="job-meta">
                      <span class="job-location">
                        <i class="fas fa-map-marker-alt"></i>
                        {{ job.location }}
                      </span>
                      <span class="job-type">
                        <i class="fas fa-clock"></i>
                        {{ job.type }}
                      </span>
                      <span class="job-department">
                        <i class="fas fa-users"></i>
                        {{ job.department }}
                      </span>
                    </div>
                  </div>
                  <button class="btn btn-primary">Postuler</button>
                </div>
                <p class="job-description">{{ job.description }}</p>
                <div class="job-requirements">
                  <h4>Compétences requises :</h4>
                  <ul>
                    <li *ngFor="let req of job.requirements">{{ req }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Culture d'entreprise -->
          <div class="culture-section">
            <h2>Notre culture</h2>
            <div class="culture-grid">
              <div class="culture-item" *ngFor="let item of cultureItems">
                <div class="culture-icon">{{ item.emoji }}</div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.description }}</p>
              </div>
            </div>
          </div>

          <!-- Processus de recrutement -->
          <div class="process-section">
            <h2>Notre processus de recrutement</h2>
            <div class="process-steps">
              <div class="process-step" *ngFor="let step of recruitmentProcess; let i = index">
                <div class="step-number">{{ i + 1 }}</div>
                <div class="step-content">
                  <h3>{{ step.title }}</h3>
                  <p>{{ step.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Call to Action -->
      <div class="cta-section">
        <div class="container">
          <h2>Vous ne trouvez pas le poste idéal ?</h2>
          <p>Envoyez-nous votre candidature spontanée, nous serions ravis de découvrir votre profil !</p>
          <button routerLink="/contact" class="btn btn-primary">Candidature spontanée</button>
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

    .why-join-section,
    .jobs-section,
    .culture-section,
    .process-section {
      margin-bottom: 80px;
    }

    h2 {
      color: #8B2E2E;
      font-size: 2.5rem;
      text-align: center;
      margin-bottom: 50px;
    }

    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 40px;
    }

    .benefit-item {
      text-align: center;
      padding: 40px 20px;
      background: #FFF9F6;
      border-radius: 15px;
      transition: transform 0.3s ease;
    }

    .benefit-item:hover {
      transform: translateY(-5px);
    }

    .benefit-item i {
      font-size: 3rem;
      color: #D9744F;
      margin-bottom: 20px;
    }

    .benefit-item h3 {
      color: #8B2E2E;
      font-size: 1.3rem;
      margin-bottom: 15px;
    }

    .benefit-item p {
      color: #666;
      line-height: 1.6;
    }

    .jobs-list {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    .job-card {
      background: #FFF9F6;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .job-info h3 {
      color: #8B2E2E;
      font-size: 1.5rem;
      margin-bottom: 10px;
    }

    .job-meta {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .job-meta span {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #666;
      font-size: 0.9rem;
    }

    .job-meta i {
      color: #D9744F;
    }

    .job-description {
      color: #333;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .job-requirements h4 {
      color: #8B2E2E;
      margin-bottom: 10px;
    }

    .job-requirements ul {
      list-style: none;
      padding: 0;
    }

    .job-requirements li {
      padding: 5px 0;
      color: #666;
      position: relative;
      padding-left: 20px;
    }

    .job-requirements li:before {
      content: "•";
      color: #D9744F;
      position: absolute;
      left: 0;
    }

    .culture-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 40px;
    }

    .culture-item {
      text-align: center;
      padding: 30px 20px;
    }

    .culture-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    .culture-item h3 {
      color: #8B2E2E;
      margin-bottom: 15px;
      font-size: 1.3rem;
    }

    .culture-item p {
      color: #666;
      line-height: 1.6;
    }

    .process-steps {
      display: flex;
      flex-direction: column;
      gap: 30px;
      max-width: 800px;
      margin: 0 auto;
    }

    .process-step {
      display: flex;
      align-items: flex-start;
      gap: 30px;
      padding: 30px;
      background: #FFF9F6;
      border-radius: 15px;
    }

    .step-number {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #8B2E2E 0%, #D9744F 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .step-content h3 {
      color: #8B2E2E;
      margin-bottom: 10px;
      font-size: 1.3rem;
    }

    .step-content p {
      color: #666;
      line-height: 1.6;
      margin: 0;
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

    .btn {
      padding: 15px 30px;
      border-radius: 25px;
      font-weight: bold;
      text-decoration: none;
      display: inline-block;
      transition: all 0.3s ease;
      border: none;
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

    @media (max-width: 768px) {
      .page-title {
        font-size: 2rem;
      }
      
      .job-header {
        flex-direction: column;
        gap: 20px;
      }
      
      .job-meta {
        flex-direction: column;
        gap: 10px;
      }
      
      .process-step {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class CareersComponent {
  benefits = [
    {
      icon: 'fas fa-heart',
      title: 'Mission inspirante',
      description: 'Participez à la valorisation de la culture africaine à travers la mode'
    },
    {
      icon: 'fas fa-rocket',
      title: 'Innovation',
      description: 'Travaillez avec les dernières technologies dans un environnement dynamique'
    },
    {
      icon: 'fas fa-users',
      title: 'Équipe diverse',
      description: 'Collaborez avec des talents issus de différents horizons culturels'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Évolution',
      description: 'Opportunités de croissance et de développement professionnel'
    },
    {
      icon: 'fas fa-balance-scale',
      title: 'Équilibre',
      description: 'Horaires flexibles et télétravail pour un meilleur équilibre vie pro/perso'
    },
    {
      icon: 'fas fa-gift',
      title: 'Avantages',
      description: 'Assurance santé, formation continue et remises sur nos produits'
    }
  ];

  availableJobs = [
    {
      title: 'Développeur Frontend Angular',
      location: 'Lomé, Togo',
      type: 'Temps plein',
      department: 'Technique',
      description: 'Nous recherchons un développeur Angular expérimenté pour améliorer notre plateforme e-commerce.',
      requirements: [
        'Maîtrise d\'Angular (version 15+)',
        'Expérience en TypeScript et RxJS',
        'Connaissance des PWA et du responsive design',
        'Minimum 3 ans d\'expérience'
      ]
    },
    {
      title: 'Chef de Produit Mode',
      location: 'Lomé, Togo',
      type: 'Temps plein',
      department: 'Produit',
      description: 'Pilotez le développement de notre gamme de produits et les relations avec nos créateurs partenaires.',
      requirements: [
        'Formation en mode ou commerce',
        'Expérience dans l\'industrie textile',
        'Connaissance du marché africain',
        'Compétences en négociation'
      ]
    },
    {
      title: 'Responsable Marketing Digital',
      location: 'Remote',
      type: 'Temps plein',
      department: 'Marketing',
      description: 'Développez notre stratégie marketing digital et notre présence sur les réseaux sociaux.',
      requirements: [
        'Expérience en marketing digital',
        'Maîtrise des réseaux sociaux',
        'Compétences en SEO/SEM',
        'Créativité et sens artistique'
      ]
    }
  ];

  cultureItems = [
    {
      emoji: '🌍',
      title: 'Diversité',
      description: 'Nous célébrons la richesse des cultures africaines et promouvons l\'inclusion'
    },
    {
      emoji: '🚀',
      title: 'Innovation',
      description: 'Nous encourageons la créativité et l\'expérimentation pour repousser les limites'
    },
    {
      emoji: '🤝',
      title: 'Collaboration',
      description: 'Nous croyons en la force du travail d\'équipe et du partage des connaissances'
    },
    {
      emoji: '💪',
      title: 'Excellence',
      description: 'Nous visons l\'excellence dans tout ce que nous faisons, avec passion et détermination'
    }
  ];

  recruitmentProcess = [
    {
      title: 'Candidature',
      description: 'Envoyez votre CV et lettre de motivation via notre plateforme ou par email'
    },
    {
      title: 'Présélection',
      description: 'Notre équipe RH examine votre profil et vous contacte sous 48h si votre candidature nous intéresse'
    },
    {
      title: 'Entretien téléphonique',
      description: 'Premier échange de 30 minutes pour faire connaissance et discuter de vos motivations'
    },
    {
      title: 'Entretien technique',
      description: 'Rencontre avec l\'équipe technique ou opérationnelle selon le poste (1h-1h30)'
    },
    {
      title: 'Entretien final',
      description: 'Dernière rencontre avec les dirigeants pour valider l\'adéquation culturelle'
    },
    {
      title: 'Décision',
      description: 'Nous vous communiquons notre décision sous 3 jours ouvrés maximum'
    }
  ];
}