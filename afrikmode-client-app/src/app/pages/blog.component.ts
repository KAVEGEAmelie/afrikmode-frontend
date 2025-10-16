import { Component } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule, NgFor],
  template: `
    <div class="page-container">
      <div class="hero-section">
        <div class="container">
          <h1 class="page-title">Blog AfrikMode</h1>
          <p class="page-subtitle">Découvrez les tendances, l'histoire et la créativité de la mode africaine</p>
        </div>
      </div>

      <div class="content-section">
        <div class="container">
          <!-- Catégories -->
          <div class="categories-section">
            <h2>Catégories</h2>
            <div class="categories-grid">
              <button 
                *ngFor="let category of categories" 
                class="category-btn"
                [class.active]="selectedCategory === category.slug"
                (click)="selectCategory(category.slug)"
              >
                <i [class]="category.icon"></i>
                <span>{{ category.name }}</span>
              </button>
            </div>
          </div>

          <!-- Articles principaux -->
          <div class="featured-section">
            <h2>Articles à la une</h2>
            <div class="featured-grid">
              <article class="featured-article" *ngFor="let article of featuredArticles">
                <div class="article-image">
                  <img [src]="article.image" [alt]="article.title">
                  <div class="article-category">{{ article.category }}</div>
                </div>
                <div class="article-content">
                  <h3>{{ article.title }}</h3>
                  <p class="article-excerpt">{{ article.excerpt }}</p>
                  <div class="article-meta">
                    <span class="article-date">
                      <i class="fas fa-calendar"></i>
                      {{ article.date }}
                    </span>
                    <span class="article-author">
                      <i class="fas fa-user"></i>
                      {{ article.author }}
                    </span>
                  </div>
                  <button class="btn btn-primary">Lire l'article</button>
                </div>
              </article>
            </div>
          </div>

          <!-- Articles récents -->
          <div class="recent-section">
            <h2>Articles récents</h2>
            <div class="articles-grid">
              <article class="article-card" *ngFor="let article of recentArticles">
                <div class="article-image">
                  <img [src]="article.image" [alt]="article.title">
                  <div class="article-category">{{ article.category }}</div>
                </div>
                <div class="article-content">
                  <h3>{{ article.title }}</h3>
                  <p class="article-excerpt">{{ article.excerpt }}</p>
                  <div class="article-meta">
                    <span class="article-date">{{ article.date }}</span>
                    <span class="read-time">{{ article.readTime }} min de lecture</span>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <!-- Newsletter -->
          <div class="newsletter-section">
            <div class="newsletter-content">
              <h2>Restez informé</h2>
              <p>Recevez nos derniers articles et tendances mode directement dans votre boîte mail</p>
              <div class="newsletter-form">
                <input type="email" placeholder="Votre adresse email" class="newsletter-input">
                <button class="btn btn-primary">S'abonner</button>
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

    .categories-section,
    .featured-section,
    .recent-section {
      margin-bottom: 80px;
    }

    h2 {
      color: #8B2E2E;
      font-size: 2.5rem;
      text-align: center;
      margin-bottom: 40px;
    }

    .categories-grid {
      display: flex;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .category-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 24px;
      border: 2px solid #F5E4D7;
      background: white;
      border-radius: 25px;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #666;
      font-weight: 500;
    }

    .category-btn:hover,
    .category-btn.active {
      background: linear-gradient(135deg, #8B2E2E 0%, #D9744F 100%);
      color: white;
      border-color: transparent;
      transform: translateY(-2px);
    }

    .category-btn i {
      font-size: 1.1rem;
    }

    .featured-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 40px;
    }

    .featured-article {
      background: #FFF9F6;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .featured-article:hover {
      transform: translateY(-5px);
    }

    .articles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
    }

    .article-card {
      background: #FFF9F6;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .article-card:hover {
      transform: translateY(-5px);
    }

    .article-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .featured-article .article-image {
      height: 250px;
    }

    .article-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .article-category {
      position: absolute;
      top: 15px;
      left: 15px;
      background: rgba(139, 46, 46, 0.9);
      color: white;
      padding: 5px 12px;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .article-content {
      padding: 25px;
    }

    .article-content h3 {
      color: #8B2E2E;
      font-size: 1.3rem;
      margin-bottom: 15px;
      line-height: 1.4;
    }

    .featured-article .article-content h3 {
      font-size: 1.5rem;
    }

    .article-excerpt {
      color: #666;
      line-height: 1.6;
      margin-bottom: 20px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .article-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      font-size: 0.9rem;
      color: #999;
    }

    .article-meta span {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .article-meta i {
      color: #D9744F;
    }

    .newsletter-section {
      background: linear-gradient(135deg, #FFF9F6 0%, #F5E4D7 100%);
      padding: 60px 40px;
      border-radius: 20px;
      text-align: center;
    }

    .newsletter-content h2 {
      color: #8B2E2E;
      margin-bottom: 20px;
    }

    .newsletter-content p {
      color: #666;
      font-size: 1.1rem;
      margin-bottom: 30px;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    .newsletter-form {
      display: flex;
      gap: 15px;
      justify-content: center;
      max-width: 400px;
      margin: 0 auto;
    }

    .newsletter-input {
      flex: 1;
      padding: 12px 20px;
      border: 2px solid #F5E4D7;
      border-radius: 25px;
      font-size: 1rem;
    }

    .newsletter-input:focus {
      outline: none;
      border-color: #D9744F;
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
      white-space: nowrap;
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

      .featured-grid {
        grid-template-columns: 1fr;
      }

      .categories-grid {
        justify-content: flex-start;
        overflow-x: auto;
        padding-bottom: 10px;
      }

      .newsletter-form {
        flex-direction: column;
      }

      .article-meta {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
      }
    }
  `]
})
export class BlogComponent {
  selectedCategory = 'all';

  categories = [
    { slug: 'all', name: 'Tous', icon: 'fas fa-th-large' },
    { slug: 'tendances', name: 'Tendances', icon: 'fas fa-star' },
    { slug: 'histoire', name: 'Histoire', icon: 'fas fa-history' },
    { slug: 'createurs', name: 'Créateurs', icon: 'fas fa-palette' },
    { slug: 'conseils', name: 'Conseils', icon: 'fas fa-lightbulb' },
    { slug: 'culture', name: 'Culture', icon: 'fas fa-globe-africa' }
  ];

  featuredArticles = [
    {
      title: 'Les tendances mode automne-hiver 2024 en Afrique',
      excerpt: 'Découvrez les couleurs, motifs et styles qui définiront la saison froide sur le continent africain.',
      image: '/assets/blog/tendances-2024.jpg',
      category: 'Tendances',
      date: '25 Septembre 2024',
      author: 'Fatima Ouédraogo'
    },
    {
      title: 'Portrait : Thabo Makhetha, le visionnaire du textile sud-africain',
      excerpt: 'Rencontre avec ce créateur qui révolutionne la mode africaine en alliant tradition et innovation.',
      image: '/assets/blog/thabo-portrait.jpg',
      category: 'Créateurs',
      date: '20 Septembre 2024',
      author: 'Amara Koné'
    }
  ];

  recentArticles = [
    {
      title: 'Comment porter le wax avec élégance au bureau',
      excerpt: 'Nos conseils pour intégrer les imprimés africains dans votre garde-robe professionnelle.',
      image: '/assets/blog/wax-bureau.jpg',
      category: 'Conseils',
      date: '15 Sept 2024',
      readTime: 5
    },
    {
      title: 'L\'histoire du kente ghanéen : symboles et significations',
      excerpt: 'Plongez dans l\'univers fascinant de ce tissu traditionnel aux motifs chargés de sens.',
      image: '/assets/blog/kente-histoire.jpg',
      category: 'Histoire',
      date: '12 Sept 2024',
      readTime: 8
    },
    {
      title: 'Lagos Fashion Week 2024 : les moments forts',
      excerpt: 'Retour sur les défilés et créations qui ont marqué cette édition exceptionnelle.',
      image: '/assets/blog/lagos-fashion.jpg',
      category: 'Tendances',
      date: '8 Sept 2024',
      readTime: 6
    },
    {
      title: 'Sustainability in African Fashion: The Way Forward',
      excerpt: 'Comment la mode africaine peut-elle devenir un modèle de durabilité mondiale ?',
      image: '/assets/blog/sustainable-fashion.jpg',
      category: 'Culture',
      date: '5 Sept 2024',
      readTime: 7
    },
    {
      title: 'DIY : Créer ses propres bijoux inspirés de l\'artisanat africain',
      excerpt: 'Tutoriel pas à pas pour fabriquer des accessoires authentiques à la maison.',
      image: '/assets/blog/diy-bijoux.jpg',
      category: 'Conseils',
      date: '1 Sept 2024',
      readTime: 10
    },
    {
      title: 'Rencontre avec les artisanes du bogolan malien',
      excerpt: 'Dans les ateliers de Bamako, découvrez les secrets de cette technique ancestrale.',
      image: '/assets/blog/bogolan-mali.jpg',
      category: 'Culture',
      date: '28 Août 2024',
      readTime: 9
    }
  ];

  selectCategory(category: string) {
    this.selectedCategory = category;
    // Ici vous pouvez implémenter le filtrage des articles
    console.log('Catégorie sélectionnée:', category);
  }
}