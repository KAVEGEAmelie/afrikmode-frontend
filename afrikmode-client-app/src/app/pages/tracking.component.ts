import { Component } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgIf, NgFor],
  template: `
    <div class="page-container">
      <div class="hero-section">
        <div class="container">
          <h1 class="page-title">Suivi de commande</h1>
          <p class="page-subtitle">Suivez votre commande en temps réel</p>
        </div>
      </div>

      <div class="content-section">
        <div class="container">
          <!-- Formulaire de recherche -->
          <div class="tracking-form">
            <h2>Rechercher votre commande</h2>
            <form (ngSubmit)="trackOrder()">
              <div class="form-group">
                <label for="orderNumber">Numéro de commande</label>
                <input 
                  type="text" 
                  id="orderNumber" 
                  [(ngModel)]="orderNumber"
                  name="orderNumber"
                  placeholder="Ex: AF-2024-001234"
                  class="form-control"
                >
              </div>
              <div class="form-group">
                <label for="email">Email de confirmation</label>
                <input 
                  type="email" 
                  id="email" 
                  [(ngModel)]="email"
                  name="email"
                  placeholder="votre@email.com"
                  class="form-control"
                >
              </div>
              <button type="submit" class="btn btn-primary">Suivre ma commande</button>
            </form>
          </div>

          <!-- Résultats du suivi -->
          <div class="tracking-result" *ngIf="trackingData">
            <div class="order-info">
              <h3>Commande {{ trackingData.orderNumber }}</h3>
              <div class="order-meta">
                <span>Passée le {{ trackingData.orderDate }}</span>
                <span class="status" [ngClass]="trackingData.status">{{ trackingData.statusLabel }}</span>
              </div>
            </div>

            <!-- Timeline de suivi -->
            <div class="tracking-timeline">
              <div class="timeline-item" 
                   *ngFor="let step of trackingData.timeline; let i = index"
                   [ngClass]="{'completed': step.completed, 'current': step.current}">
                <div class="timeline-icon">
                  <i [class]="step.icon"></i>
                </div>
                <div class="timeline-content">
                  <h4>{{ step.title }}</h4>
                  <p>{{ step.description }}</p>
                  <span class="timeline-date" *ngIf="step.date">{{ step.date }}</span>
                </div>
              </div>
            </div>

            <!-- Informations de livraison -->
            <div class="delivery-info">
              <h3>Informations de livraison</h3>
              <div class="delivery-details">
                <div class="detail-item">
                  <strong>Adresse :</strong>
                  <p>{{ trackingData.deliveryAddress }}</p>
                </div>
                <div class="detail-item">
                  <strong>Transporteur :</strong>
                  <p>{{ trackingData.carrier }}</p>
                </div>
                <div class="detail-item" *ngIf="trackingData.estimatedDelivery">
                  <strong>Livraison estimée :</strong>
                  <p>{{ trackingData.estimatedDelivery }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Aide au suivi -->
          <div class="tracking-help">
            <h2>Besoin d'aide ?</h2>
            <div class="help-grid">
              <div class="help-item">
                <i class="fas fa-question-circle"></i>
                <h3>Je ne trouve pas mon numéro de commande</h3>
                <p>Votre numéro de commande se trouve dans l'email de confirmation envoyé après votre achat.</p>
              </div>
              <div class="help-item">
                <i class="fas fa-clock"></i>
                <h3>Ma commande tarde à arriver</h3>
                <p>Les délais peuvent varier selon la destination. Contactez notre service client si nécessaire.</p>
              </div>
              <div class="help-item">
                <i class="fas fa-phone"></i>
                <h3>Problème avec ma livraison</h3>
                <p>Notre équipe support est disponible pour vous aider à résoudre tout problème de livraison.</p>
                <button routerLink="/support" class="btn btn-outline">Contacter le support</button>
              </div>
            </div>
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

    .tracking-form {
      max-width: 600px;
      margin: 0 auto 60px;
      background: #FFF9F6;
      padding: 40px;
      border-radius: 15px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .tracking-form h2 {
      text-align: center;
      color: #8B2E2E;
      margin-bottom: 30px;
    }

    .tracking-result {
      max-width: 800px;
      margin: 0 auto 60px;
      background: white;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .order-info {
      background: #8B2E2E;
      color: white;
      padding: 30px;
      text-align: center;
    }

    .order-info h3 {
      margin-bottom: 15px;
      font-size: 1.5rem;
    }

    .order-meta {
      display: flex;
      justify-content: center;
      gap: 30px;
      flex-wrap: wrap;
    }

    .status {
      padding: 5px 15px;
      border-radius: 15px;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 0.8rem;
    }

    .status.processing { background: #ffc107; color: #000; }
    .status.shipped { background: #17a2b8; color: white; }
    .status.delivered { background: #28a745; color: white; }

    .tracking-timeline {
      padding: 40px;
    }

    .timeline-item {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
      position: relative;
    }

    .timeline-item:not(:last-child):before {
      content: '';
      position: absolute;
      left: 20px;
      top: 50px;
      width: 2px;
      height: 40px;
      background: #F5E4D7;
    }

    .timeline-item.completed:before {
      background: #28a745;
    }

    .timeline-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #F5E4D7;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .timeline-item.completed .timeline-icon {
      background: #28a745;
      color: white;
    }

    .timeline-item.current .timeline-icon {
      background: #D9744F;
      color: white;
    }

    .timeline-content h4 {
      color: #8B2E2E;
      margin-bottom: 8px;
    }

    .timeline-content p {
      color: #666;
      margin-bottom: 5px;
    }

    .timeline-date {
      font-size: 0.9rem;
      color: #999;
    }

    .delivery-info {
      background: #FFF9F6;
      padding: 30px;
      margin-top: 20px;
    }

    .delivery-info h3 {
      color: #8B2E2E;
      margin-bottom: 20px;
    }

    .delivery-details {
      display: grid;
      gap: 20px;
    }

    .detail-item strong {
      color: #8B2E2E;
      display: block;
      margin-bottom: 5px;
    }

    .help-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
    }

    .help-item {
      text-align: center;
      padding: 30px;
      background: #FFF9F6;
      border-radius: 15px;
    }

    .help-item i {
      font-size: 2.5rem;
      color: #D9744F;
      margin-bottom: 20px;
    }

    .help-item h3 {
      color: #8B2E2E;
      margin-bottom: 15px;
    }

    .btn {
      padding: 12px 25px;
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
      border: none;
    }

    .btn-outline {
      background: transparent;
      color: #8B2E2E;
      border-color: #8B2E2E;
    }
  `]
})
export class TrackingComponent {
  orderNumber = '';
  email = '';
  trackingData: any = null;

  trackOrder() {
    // Simulation de données de suivi
    this.trackingData = {
      orderNumber: this.orderNumber || 'AF-2024-001234',
      orderDate: '15 septembre 2024',
      status: 'shipped',
      statusLabel: 'Expédiée',
      deliveryAddress: '123 Rue de la Paix, Lomé, Togo',
      carrier: 'DHL Express',
      estimatedDelivery: '30 septembre 2024',
      timeline: [
        {
          title: 'Commande confirmée',
          description: 'Votre commande a été confirmée et est en préparation',
          date: '15 sept. 2024 - 14:30',
          icon: 'fas fa-check',
          completed: true,
          current: false
        },
        {
          title: 'Expédiée',
          description: 'Votre commande a été expédiée et est en route',
          date: '20 sept. 2024 - 09:15',
          icon: 'fas fa-shipping-fast',
          completed: true,
          current: false
        },
        {
          title: 'En transit',
          description: 'Votre colis est actuellement en transit vers votre adresse',
          date: '28 sept. 2024 - 11:00',
          icon: 'fas fa-truck',
          completed: false,
          current: true
        },
        {
          title: 'Livraison prévue',
          description: 'Votre colis sera livré à l\'adresse indiquée',
          date: '30 sept. 2024 - Estimé',
          icon: 'fas fa-home',
          completed: false,
          current: false
        }
      ]
    };
  }
}