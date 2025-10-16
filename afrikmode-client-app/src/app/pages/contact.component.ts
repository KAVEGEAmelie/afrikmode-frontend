import { Component } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgFor],
  template: `
    <div class="page-container">
      <div class="hero-section">
        <div class="container">
          <h1 class="page-title">Contactez-nous</h1>
          <p class="page-subtitle">Nous sommes là pour vous aider</p>
        </div>
      </div>

      <div class="content-section">
        <div class="container">
          <div class="contact-grid">
            <!-- Formulaire de contact -->
            <div class="contact-form-section">
              <h2>Envoyez-nous un message</h2>
              <form class="contact-form" (ngSubmit)="onSubmit()">
                <div class="form-group">
                  <label for="name">Nom complet *</label>
                  <input 
                    type="text" 
                    id="name" 
                    [(ngModel)]="contactForm.name"
                    name="name"
                    required
                    class="form-control"
                  >
                </div>

                <div class="form-group">
                  <label for="email">Email *</label>
                  <input 
                    type="email" 
                    id="email" 
                    [(ngModel)]="contactForm.email"
                    name="email"
                    required
                    class="form-control"
                  >
                </div>

                <div class="form-group">
                  <label for="phone">Téléphone</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    [(ngModel)]="contactForm.phone"
                    name="phone"
                    class="form-control"
                  >
                </div>

                <div class="form-group">
                  <label for="subject">Sujet *</label>
                  <select 
                    id="subject" 
                    [(ngModel)]="contactForm.subject"
                    name="subject"
                    required
                    class="form-control"
                  >
                    <option value="">Choisissez un sujet</option>
                    <option value="general">Question générale</option>
                    <option value="order">Commande</option>
                    <option value="technical">Support technique</option>
                    <option value="partnership">Partenariat</option>
                    <option value="press">Presse</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="message">Message *</label>
                  <textarea 
                    id="message" 
                    [(ngModel)]="contactForm.message"
                    name="message"
                    required
                    rows="6"
                    class="form-control"
                    placeholder="Décrivez votre demande en détail..."
                  ></textarea>
                </div>

                <button type="submit" class="btn btn-primary">
                  <i class="fas fa-paper-plane"></i>
                  Envoyer le message
                </button>
              </form>
            </div>

            <!-- Informations de contact -->
            <div class="contact-info-section">
              <h2>Informations de contact</h2>
              
              <div class="contact-methods">
                <div class="contact-method">
                  <i class="fas fa-map-marker-alt"></i>
                  <div>
                    <h3>Adresse</h3>
                    <p>123 Avenue de l'Indépendance<br>Lomé, Togo</p>
                  </div>
                </div>

                <div class="contact-method">
                  <i class="fas fa-phone"></i>
                  <div>
                    <h3>Téléphone</h3>
                    <p>+228 22 XX XX XX<br>+228 90 XX XX XX</p>
                  </div>
                </div>

                <div class="contact-method">
                  <i class="fas fa-envelope"></i>
                  <div>
                    <h3>Email</h3>
                    <p>contact@afrikmode.com<br>support@afrikmode.com</p>
                  </div>
                </div>

                <div class="contact-method">
                  <i class="fas fa-clock"></i>
                  <div>
                    <h3>Horaires</h3>
                    <p>Lun - Ven: 8h00 - 18h00<br>Sam: 9h00 - 16h00</p>
                  </div>
                </div>
              </div>

              <!-- Réseaux sociaux -->
              <div class="social-section">
                <h3>Suivez-nous</h3>
                <div class="social-links">
                  <a href="#" class="social-link facebook">
                    <i class="fab fa-facebook-f"></i>
                  </a>
                  <a href="#" class="social-link instagram">
                    <i class="fab fa-instagram"></i>
                  </a>
                  <a href="#" class="social-link twitter">
                    <i class="fab fa-twitter"></i>
                  </a>
                  <a href="#" class="social-link whatsapp">
                    <i class="fab fa-whatsapp"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQ rapide -->
      <div class="faq-section">
        <div class="container">
          <h2>Questions fréquentes</h2>
          <div class="faq-grid">
            <div class="faq-item" *ngFor="let faq of quickFaqs">
              <h3>{{ faq.question }}</h3>
              <p>{{ faq.answer }}</p>
            </div>
          </div>
          <div class="faq-cta">
            <a routerLink="/faq" class="btn btn-outline">Voir toutes les FAQ</a>
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
    }

    .page-subtitle {
      font-size: 1.2rem;
      opacity: 0.9;
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

    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 80px;
      margin-bottom: 80px;
    }

    .contact-form-section h2,
    .contact-info-section h2 {
      color: #8B2E2E;
      font-size: 2rem;
      margin-bottom: 30px;
    }

    .contact-form {
      background: #FFF9F6;
      padding: 40px;
      border-radius: 15px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .form-group {
      margin-bottom: 25px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
    }

    .form-control {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #F5E4D7;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #D9744F;
    }

    .contact-methods {
      display: flex;
      flex-direction: column;
      gap: 30px;
      margin-bottom: 40px;
    }

    .contact-method {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      padding: 20px;
      background: #FFF9F6;
      border-radius: 12px;
    }

    .contact-method i {
      font-size: 1.5rem;
      color: #D9744F;
      margin-top: 5px;
    }

    .contact-method h3 {
      color: #8B2E2E;
      margin-bottom: 8px;
      font-size: 1.1rem;
    }

    .contact-method p {
      color: #666;
      line-height: 1.5;
      margin: 0;
    }

    .social-section {
      text-align: center;
    }

    .social-section h3 {
      color: #8B2E2E;
      margin-bottom: 20px;
    }

    .social-links {
      display: flex;
      justify-content: center;
      gap: 15px;
    }

    .social-link {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      text-decoration: none;
      transition: transform 0.3s ease;
    }

    .social-link:hover {
      transform: scale(1.1);
    }

    .social-link.facebook { background: #1877f2; }
    .social-link.instagram { background: linear-gradient(45deg, #405de6, #5851db, #833ab4, #c13584, #e1306c, #fd1d1d); }
    .social-link.twitter { background: #1da1f2; }
    .social-link.whatsapp { background: #25d366; }

    .faq-section {
      background: linear-gradient(135deg, #FFF9F6 0%, #F5E4D7 100%);
      padding: 80px 0;
    }

    .faq-section h2 {
      text-align: center;
      color: #8B2E2E;
      font-size: 2.5rem;
      margin-bottom: 50px;
    }

    .faq-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin-bottom: 40px;
    }

    .faq-item {
      background: white;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 3px 10px rgba(0,0,0,0.1);
    }

    .faq-item h3 {
      color: #8B2E2E;
      font-size: 1.1rem;
      margin-bottom: 15px;
    }

    .faq-item p {
      color: #666;
      line-height: 1.6;
      margin: 0;
    }

    .faq-cta {
      text-align: center;
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
      border: none;
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
      .contact-grid {
        grid-template-columns: 1fr;
        gap: 40px;
      }
      
      .page-title {
        font-size: 2rem;
      }
      
      .contact-form {
        padding: 25px;
      }
    }
  `]
})
export class ContactComponent {
  contactForm = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  quickFaqs = [
    {
      question: "Comment passer une commande ?",
      answer: "Parcourez notre catalogue, ajoutez les articles à votre panier et procédez au paiement sécurisé."
    },
    {
      question: "Quels sont les délais de livraison ?",
      answer: "Les délais varient de 3-7 jours ouvrés selon votre localisation et le mode de livraison choisi."
    },
    {
      question: "Puis-je retourner un article ?",
      answer: "Oui, vous avez 14 jours pour retourner un article non porté avec ses étiquettes originales."
    },
    {
      question: "Comment suivre ma commande ?",
      answer: "Vous recevrez un email avec un lien de suivi dès l'expédition de votre commande."
    }
  ];

  onSubmit() {
    console.log('Formulaire soumis:', this.contactForm);
    // Ici vous pouvez implémenter l'envoi du formulaire
    alert('Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
    
    // Réinitialiser le formulaire
    this.contactForm = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    };
  }
}