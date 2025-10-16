import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  footerLinks = {
    company: [
      { label: 'À propos', path: '/about' },
      { label: 'Contact', path: '/contact' },
      { label: 'Carrières', path: '/careers' },
      { label: 'Blog', path: '/blog' }
    ],
    help: [
      { label: 'Service client', path: '/support' },
      { label: 'Suivi de commande', path: '/order-tracking' },
      { label: 'Retours & Échanges', path: '/returns' },
      { label: 'FAQ', path: '/faq' }
    ],
    legal: [
      { label: 'Conditions générales', path: '/terms' },
      { label: 'Politique de confidentialité', path: '/privacy' },
      { label: 'Mentions légales', path: '/legal' },
      { label: 'Cookies', path: '/cookies' }
    ]
  };

  socialLinks = [
    { 
      name: 'Facebook', 
      icon: 'fab fa-facebook-f', 
      fallback: 'f', 
      url: 'https://facebook.com'
    },
    { 
      name: 'Instagram', 
      icon: 'fab fa-instagram', 
      fallback: '📷', 
      url: 'https://instagram.com'
    },
    { 
      name: 'Twitter', 
      icon: 'fab fa-twitter', 
      fallback: '🐦', 
      url: 'https://twitter.com'
    },
    { 
      name: 'TikTok', 
      icon: 'fab fa-tiktok', 
      fallback: '🎵', 
      url: 'https://tiktok.com'
    }
  ];

  paymentMethods = ['visa', 'mastercard', 'paypal', 'mobile-money'];
}

