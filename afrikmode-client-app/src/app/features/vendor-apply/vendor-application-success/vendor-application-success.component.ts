import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-vendor-application-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './vendor-application-success.component.html',
  styleUrl: './vendor-application-success.component.scss'
})
export class VendorApplicationSuccessComponent implements OnInit {
  email: string = '';
  shopName: string = '';
  applicationNumber: string = '';

  timelineSteps = [
    {
      icon: 'check',
      title: 'Candidature reçue',
      description: 'Votre demande a été enregistrée avec succès',
      status: 'completed',
      time: 'Maintenant'
    },
    {
      icon: 'review',
      title: 'Examen en cours',
      description: 'Notre équipe examine votre dossier',
      status: 'current',
      time: '24-48h'
    },
    {
      icon: 'decision',
      title: 'Décision',
      description: 'Vous recevrez notre réponse par email',
      status: 'pending',
      time: '48-72h'
    },
    {
      icon: 'start',
      title: 'Activation boutique',
      description: 'Commencez à vendre vos produits',
      status: 'pending',
      time: 'Après validation'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get query params
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.shopName = params['shopName'] || '';
      // Utiliser le numéro de candidature du backend (généré côté serveur)
      this.applicationNumber = params['applicationNumber'] || '';
      
      // Si pas de numéro dans les params, générer un fallback (ne devrait pas arriver)
      if (!this.applicationNumber) {
        console.warn('⚠️ Numéro de candidature non trouvé dans les query params, génération fallback');
        this.applicationNumber = this.generateApplicationNumber();
      }
    });

    // Scroll to top
    window.scrollTo(0, 0);
  }

  /**
   * Génère un numéro de candidature (fallback uniquement, ne devrait pas être utilisé)
   * Le vrai numéro vient du backend
   */
  private generateApplicationNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `VA-${year}${month}${day}-${random}`;
  }

  goToStatusPage(): void {
    // Ne pas passer de paramètres - le composant chargera automatiquement
    // la candidature de l'utilisateur connecté
    this.router.navigate(['/vendor/application-status']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
