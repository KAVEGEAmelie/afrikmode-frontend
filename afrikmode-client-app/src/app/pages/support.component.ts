import { Component } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgIf, NgFor],
  template: `
    <div class="page-container">
      <div class="hero-section">
        <div class="container">
          <h1 class="page-title">Service Client</h1>
          <p class="page-subtitle">Nous sommes là pour vous accompagner à chaque étape</p>
        </div>
      </div>

      <div class="content-section">
        <div class="container">
          <!-- Options de contact -->
          <div class="contact-options">
            <h2>Comment pouvons-nous vous aider ?</h2>
            <div class="options-grid">
              <div class="option-card" *ngFor="let option of contactOptions">
                <i [class]="option.icon"></i>
                <h3>{{ option.title }}</h3>
                <p>{{ option.description }}</p>
                <div class="option-info">
                  <span class="availability">{{ option.availability }}</span>
                  <span class="response-time">{{ option.responseTime }}</span>
                </div>
                <button class="btn btn-primary" (click)="selectOption(option.type)">
                  {{ option.buttonText }}
                </button>
              </div>
            </div>
          </div>

          <!-- Chat en direct -->
          <div class="live-chat-section" *ngIf="showLiveChat">
            <div class="chat-container">
              <div class="chat-header">
                <h3>Chat en direct avec {{ currentAgent.name }}</h3>
                <button class="close-chat" (click)="closeLiveChat()">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div class="chat-messages">
                <div class="message agent-message">
                  <div class="message-avatar">
                    <img [src]="currentAgent.avatar" [alt]="currentAgent.name">
                  </div>
                  <div class="message-content">
                    <span class="message-author">{{ currentAgent.name }}</span>
                    <p>Bonjour ! Je suis {{ currentAgent.name }}, comment puis-je vous aider aujourd'hui ?</p>
                  </div>
                </div>
              </div>
              <div class="chat-input">
                <input 
                  type="text" 
                  placeholder="Tapez votre message..."
                  [(ngModel)]="chatMessage"
                  (keyup.enter)="sendMessage()"
                  class="message-input"
                >
                <button (click)="sendMessage()" class="send-btn">
                  <i class="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Questions fréquentes -->
          <div class="faq-section">
            <h2>Questions fréquentes</h2>
            <div class="faq-categories">
              <button 
                *ngFor="let category of faqCategories"
                class="category-btn"
                [class.active]="selectedFaqCategory === category.slug"
                (click)="selectFaqCategory(category.slug)"
              >
                {{ category.name }}
              </button>
            </div>
            <div class="faq-list">
              <div class="faq-item" *ngFor="let faq of getFilteredFaqs()">
                <button class="faq-question" (click)="toggleFaq(faq.id)">
                  <span>{{ faq.question }}</span>
                  <i class="fas fa-chevron-down" [class.rotated]="faq.expanded"></i>
                </button>
                <div class="faq-answer" [class.expanded]="faq.expanded">
                  <p [innerHTML]="faq.answer"></p>
                </div>
              </div>
            </div>
          </div>

          <!-- Base de connaissances -->
          <div class="knowledge-base">
            <h2>Base de connaissances</h2>
            <div class="kb-grid">
              <div class="kb-category" *ngFor="let category of knowledgeBase">
                <i [class]="category.icon"></i>
                <h3>{{ category.title }}</h3>
                <ul>
                  <li *ngFor="let article of category.articles">
                    <a href="#">{{ article }}</a>
                  </li>
                </ul>
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

    .contact-options,
    .faq-section,
    .knowledge-base {
      margin-bottom: 80px;
    }

    h2 {
      color: #8B2E2E;
      font-size: 2.5rem;
      text-align: center;
      margin-bottom: 40px;
    }

    .options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
    }

    .option-card {
      background: #FFF9F6;
      padding: 40px 30px;
      border-radius: 15px;
      text-align: center;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .option-card:hover {
      transform: translateY(-5px);
    }

    .option-card i {
      font-size: 3rem;
      color: #D9744F;
      margin-bottom: 20px;
    }

    .option-card h3 {
      color: #8B2E2E;
      margin-bottom: 15px;
      font-size: 1.4rem;
    }

    .option-card p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .option-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 25px;
      font-size: 0.9rem;
    }

    .availability {
      color: #28a745;
      font-weight: 600;
    }

    .response-time {
      color: #666;
    }

    .live-chat-section {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 400px;
      height: 500px;
      z-index: 1000;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      border-radius: 15px;
      overflow: hidden;
      background: white;
    }

    .chat-header {
      background: linear-gradient(135deg, #8B2E2E 0%, #D9744F 100%);
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chat-header h3 {
      margin: 0;
      font-size: 1.1rem;
    }

    .close-chat {
      background: none;
      border: none;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
    }

    .chat-messages {
      height: 350px;
      overflow-y: auto;
      padding: 20px;
    }

    .message {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
    }

    .message-avatar img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }

    .message-content {
      flex: 1;
    }

    .message-author {
      font-weight: 600;
      color: #8B2E2E;
      margin-bottom: 5px;
      display: block;
    }

    .message-content p {
      background: #F5E4D7;
      padding: 12px 15px;
      border-radius: 15px;
      margin: 0;
      line-height: 1.5;
    }

    .chat-input {
      display: flex;
      padding: 20px;
      border-top: 1px solid #F5E4D7;
    }

    .message-input {
      flex: 1;
      padding: 10px 15px;
      border: 1px solid #F5E4D7;
      border-radius: 25px;
      margin-right: 10px;
    }

    .send-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #8B2E2E 0%, #D9744F 100%);
      color: white;
      border: none;
      cursor: pointer;
    }

    .faq-categories {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-bottom: 40px;
      flex-wrap: wrap;
    }

    .category-btn {
      padding: 10px 20px;
      border: 2px solid #F5E4D7;
      background: white;
      border-radius: 25px;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #666;
    }

    .category-btn:hover,
    .category-btn.active {
      background: linear-gradient(135deg, #8B2E2E 0%, #D9744F 100%);
      color: white;
      border-color: transparent;
    }

    .faq-list {
      max-width: 800px;
      margin: 0 auto;
    }

    .faq-item {
      border-bottom: 1px solid #F5E4D7;
      margin-bottom: 10px;
    }

    .faq-question {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 0;
      background: none;
      border: none;
      text-align: left;
      font-size: 1.1rem;
      font-weight: 600;
      color: #8B2E2E;
      cursor: pointer;
    }

    .faq-question i {
      transition: transform 0.3s ease;
    }

    .faq-question i.rotated {
      transform: rotate(180deg);
    }

    .faq-answer {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }

    .faq-answer.expanded {
      max-height: 200px;
    }

    .faq-answer p {
      padding: 0 0 20px 0;
      color: #666;
      line-height: 1.6;
    }

    .kb-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 30px;
    }

    .kb-category {
      background: #FFF9F6;
      padding: 30px;
      border-radius: 15px;
    }

    .kb-category i {
      font-size: 2rem;
      color: #D9744F;
      margin-bottom: 20px;
    }

    .kb-category h3 {
      color: #8B2E2E;
      margin-bottom: 20px;
      font-size: 1.3rem;
    }

    .kb-category ul {
      list-style: none;
      padding: 0;
    }

    .kb-category li {
      margin-bottom: 10px;
    }

    .kb-category a {
      color: #666;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .kb-category a:hover {
      color: #D9744F;
    }

    .btn {
      padding: 12px 25px;
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
      .live-chat-section {
        width: calc(100vw - 40px);
        right: 20px;
        left: 20px;
      }
      
      .page-title {
        font-size: 2rem;
      }
    }
  `]
})
export class SupportComponent {
  showLiveChat = false;
  chatMessage = '';
  selectedFaqCategory = 'general';

  currentAgent = {
    name: 'Aminata',
    avatar: '/assets/avatars/agent-1.jpg'
  };

  contactOptions = [
    {
      type: 'chat',
      title: 'Chat en direct',
      description: 'Discutez instantanément avec un de nos conseillers',
      availability: 'En ligne maintenant',
      responseTime: 'Réponse immédiate',
      buttonText: 'Commencer le chat',
      icon: 'fas fa-comments'
    },
    {
      type: 'email',
      title: 'Email',
      description: 'Envoyez-nous un message détaillé',
      availability: 'Disponible 24h/24',
      responseTime: 'Réponse sous 2h',
      buttonText: 'Envoyer un email',
      icon: 'fas fa-envelope'
    },
    {
      type: 'phone',
      title: 'Téléphone',
      description: 'Appelez notre service client',
      availability: 'Lun-Ven 8h-18h',
      responseTime: 'Disponible maintenant',
      buttonText: 'Voir le numéro',
      icon: 'fas fa-phone'
    },
    {
      type: 'whatsapp',
      title: 'WhatsApp',
      description: 'Contactez-nous sur WhatsApp',
      availability: 'Disponible 24h/24',
      responseTime: 'Réponse rapide',
      buttonText: 'Ouvrir WhatsApp',
      icon: 'fab fa-whatsapp'
    }
  ];

  faqCategories = [
    { slug: 'general', name: 'Général' },
    { slug: 'commandes', name: 'Commandes' },
    { slug: 'livraison', name: 'Livraison' },
    { slug: 'retours', name: 'Retours' },
    { slug: 'paiement', name: 'Paiement' },
    { slug: 'compte', name: 'Mon compte' }
  ];

  faqs = [
    {
      id: 1,
      category: 'general',
      question: 'Qu\'est-ce qu\'AfrikMode ?',
      answer: 'AfrikMode est une plateforme e-commerce dédiée à la mode africaine authentique. Nous connectons créateurs talentueux et clients passionnés.',
      expanded: false
    },
    {
      id: 2,
      category: 'commandes',
      question: 'Comment passer une commande ?',
      answer: 'Parcourez notre catalogue, ajoutez les articles à votre panier, puis procédez au paiement sécurisé. Un email de confirmation vous sera envoyé.',
      expanded: false
    },
    // Ajoutez plus de FAQs selon les catégories
  ];

  knowledgeBase = [
    {
      title: 'Guide d\'achat',
      icon: 'fas fa-shopping-cart',
      articles: [
        'Comment choisir sa taille',
        'Guide des matières textiles',
        'Conseils d\'entretien',
        'Programme de fidélité'
      ]
    },
    {
      title: 'Compte & Profil',
      icon: 'fas fa-user',
      articles: [
        'Créer un compte',
        'Modifier mes informations',
        'Gérer mes adresses',
        'Sécurité du compte'
      ]
    },
    {
      title: 'Commandes',
      icon: 'fas fa-box',
      articles: [
        'Suivre ma commande',
        'Modifier une commande',
        'Annuler une commande',
        'Historique des achats'
      ]
    },
    {
      title: 'Paiement & Facturation',
      icon: 'fas fa-credit-card',
      articles: [
        'Moyens de paiement acceptés',
        'Sécurité des transactions',
        'Demander une facture',
        'Remboursements'
      ]
    }
  ];

  selectOption(type: string) {
    switch(type) {
      case 'chat':
        this.showLiveChat = true;
        break;
      case 'email':
        // Rediriger vers le formulaire de contact
        break;
      case 'phone':
        alert('Téléphone: +228 22 XX XX XX');
        break;
      case 'whatsapp':
        window.open('https://wa.me/22890XXXXXX', '_blank');
        break;
    }
  }

  closeLiveChat() {
    this.showLiveChat = false;
  }

  sendMessage() {
    if (this.chatMessage.trim()) {
      console.log('Message envoyé:', this.chatMessage);
      this.chatMessage = '';
    }
  }

  selectFaqCategory(category: string) {
    this.selectedFaqCategory = category;
  }

  getFilteredFaqs() {
    if (this.selectedFaqCategory === 'general') {
      return this.faqs;
    }
    return this.faqs.filter(faq => faq.category === this.selectedFaqCategory);
  }

  toggleFaq(faqId: number) {
    const faq = this.faqs.find(f => f.id === faqId);
    if (faq) {
      faq.expanded = !faq.expanded;
    }
  }
}