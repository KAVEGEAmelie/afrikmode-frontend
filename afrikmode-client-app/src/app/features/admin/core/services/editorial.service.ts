import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: string;
  authorId: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  viewsCount: number;
}

export interface FeaturedItem {
  id: string;
  type: 'product' | 'vendor';
  itemId: string;
  title: string;
  description?: string;
  image?: string;
  position: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  clicksCount: number;
}

export interface Banner {
  id: string;
  title: string;
  description?: string;
  image: string;
  link?: string;
  position: 'home_hero' | 'home_secondary' | 'shop_top' | 'shop_sidebar';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  clicksCount: number;
  impressionsCount: number;
}

export interface Newsletter {
  id: string;
  subject: string;
  content: string;
  targetAudience: 'all' | 'customers' | 'vendors';
  status: 'draft' | 'scheduled' | 'sent';
  scheduledFor?: Date;
  sentAt?: Date;
  recipientsCount?: number;
  opensCount?: number;
  clicksCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class EditorialService {
  private apiUrl = `${environment.apiUrl}/admin/editorial`;

  constructor(private http: HttpClient) {}

  // ==================== BLOG ====================

  /**
   * Récupérer tous les articles de blog
   */
  getBlogPosts(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Observable<{
    posts: BlogPost[];
    total: number;
    page: number;
    limit: number;
  }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) params = params.set('status', status);

    return this.http.get<{
      posts: BlogPost[];
      total: number;
      page: number;
      limit: number;
    }>(`${this.apiUrl}/blog`, { params });
  }

  /**
   * Récupérer un article par ID
   */
  getBlogPostById(id: string): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.apiUrl}/blog/${id}`);
  }

  /**
   * Créer un nouvel article
   */
  createBlogPost(data: Partial<BlogPost>): Observable<BlogPost> {
    return this.http.post<BlogPost>(`${this.apiUrl}/blog`, data);
  }

  /**
   * Mettre à jour un article
   */
  updateBlogPost(id: string, data: Partial<BlogPost>): Observable<BlogPost> {
    return this.http.put<BlogPost>(`${this.apiUrl}/blog/${id}`, data);
  }

  /**
   * Supprimer un article
   */
  deleteBlogPost(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/blog/${id}`
    );
  }

  /**
   * Publier un article
   */
  publishBlogPost(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/blog/${id}/publish`,
      {}
    );
  }

  // ==================== FEATURED ====================

  /**
   * Récupérer les contenus mis en avant
   */
  getFeaturedItems(type?: 'product' | 'vendor'): Observable<FeaturedItem[]> {
    let params = new HttpParams();
    if (type) params = params.set('type', type);

    return this.http.get<FeaturedItem[]>(`${this.apiUrl}/featured`, { params });
  }

  /**
   * Ajouter un contenu en avant
   */
  createFeaturedItem(data: Partial<FeaturedItem>): Observable<FeaturedItem> {
    return this.http.post<FeaturedItem>(`${this.apiUrl}/featured`, data);
  }

  /**
   * Retirer un contenu mis en avant
   */
  deleteFeaturedItem(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/featured/${id}`
    );
  }

  /**
   * Activer/désactiver un contenu mis en avant
   */
  toggleFeaturedItem(id: string): Observable<{ success: boolean; isActive: boolean }> {
    return this.http.patch<{ success: boolean; isActive: boolean }>(
      `${this.apiUrl}/featured/${id}/toggle`,
      {}
    );
  }

  // ==================== BANNERS ====================

  /**
   * Récupérer toutes les bannières
   */
  getBanners(position?: string): Observable<Banner[]> {
    let params = new HttpParams();
    if (position) params = params.set('position', position);

    return this.http.get<Banner[]>(`${this.apiUrl}/banners`, { params });
  }

  /**
   * Créer une nouvelle bannière
   */
  createBanner(data: Partial<Banner>): Observable<Banner> {
    return this.http.post<Banner>(`${this.apiUrl}/banners`, data);
  }

  /**
   * Mettre à jour une bannière
   */
  updateBanner(id: string, data: Partial<Banner>): Observable<Banner> {
    return this.http.put<Banner>(`${this.apiUrl}/banners/${id}`, data);
  }

  /**
   * Supprimer une bannière
   */
  deleteBanner(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/banners/${id}`
    );
  }

  /**
   * Activer/désactiver une bannière
   */
  toggleBanner(id: string): Observable<{ success: boolean; isActive: boolean }> {
    return this.http.patch<{ success: boolean; isActive: boolean }>(
      `${this.apiUrl}/banners/${id}/toggle`,
      {}
    );
  }

  // ==================== NEWSLETTERS ====================

  /**
   * Récupérer toutes les newsletters
   */
  getNewsletters(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Observable<{
    newsletters: Newsletter[];
    total: number;
    page: number;
    limit: number;
  }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) params = params.set('status', status);

    return this.http.get<{
      newsletters: Newsletter[];
      total: number;
      page: number;
      limit: number;
    }>(`${this.apiUrl}/newsletters`, { params });
  }

  /**
   * Créer une newsletter
   */
  createNewsletter(data: Partial<Newsletter>): Observable<Newsletter> {
    return this.http.post<Newsletter>(`${this.apiUrl}/newsletters`, data);
  }

  /**
   * Mettre à jour une newsletter
   */
  updateNewsletter(id: string, data: Partial<Newsletter>): Observable<Newsletter> {
    return this.http.put<Newsletter>(`${this.apiUrl}/newsletters/${id}`, data);
  }

  /**
   * Supprimer une newsletter
   */
  deleteNewsletter(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/newsletters/${id}`
    );
  }

  /**
   * Envoyer une newsletter immédiatement
   */
  sendNewsletter(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/newsletters/${id}/send`,
      {}
    );
  }

  /**
   * Planifier l'envoi d'une newsletter
   */
  scheduleNewsletter(id: string, scheduledFor: Date): Observable<{
    success: boolean;
    message: string;
  }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/newsletters/${id}/schedule`,
      { scheduledFor }
    );
  }

  /**
   * Envoyer un test de newsletter
   */
  sendTestNewsletter(id: string, testEmail: string): Observable<{
    success: boolean;
    message: string;
  }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/newsletters/${id}/test`,
      { testEmail }
    );
  }
}
