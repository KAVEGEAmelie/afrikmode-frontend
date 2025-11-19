// src/app/features/admin/pages/dashboard/components/activity-feed/activity-feed.component.ts

import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../../environments/environment';

interface Activity {
  id: number;
  type: 'order' | 'user' | 'product' | 'store';
  message: string;
  timestamp: Date;
  icon: string;
  iconColor: string;
}

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-feed.component.html',
  styleUrls: ['./activity-feed.component.scss']
})
export class ActivityFeedComponent implements OnInit {
  @Input() activities: Activity[] = [];
  loading = true;
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Si des activities sont passées en Input, les utiliser, sinon charger depuis l'API
    if (this.activities && this.activities.length > 0) {
      this.loading = false;
    } else {
      this.loadActivities();
    }
  }

  loadActivities(): void {
    this.http.get(`${this.apiUrl}/dashboard/recent-activity?limit=10`).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          const activities: Activity[] = [];
          
          // Commandes récentes
          if (response.data.recentOrders && Array.isArray(response.data.recentOrders)) {
            response.data.recentOrders.forEach((order: any) => {
              activities.push({
                id: parseInt(order.id) || 0,
                type: 'order',
                message: `Nouvelle commande #${order.order_number || order.id} reçue`,
                timestamp: new Date(order.created_at),
                icon: 'shopping_bag',
                iconColor: '#4CAF50'
              });
            });
          }
          
          // Nouveaux utilisateurs
          if (response.data.recentUsers && Array.isArray(response.data.recentUsers)) {
            response.data.recentUsers.forEach((user: any) => {
              const userName = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Utilisateur';
              activities.push({
                id: parseInt(user.id) || 0,
                type: 'user',
                message: `Nouvel utilisateur inscrit: ${userName}`,
                timestamp: new Date(user.created_at),
                icon: 'person_add',
                iconColor: '#2196F3'
              });
            });
          }
          
          // Nouvelles boutiques
          if (response.data.recentStores && Array.isArray(response.data.recentStores)) {
            response.data.recentStores.forEach((store: any) => {
              activities.push({
                id: parseInt(store.id) || 0,
                type: 'store',
                message: `Nouvelle boutique créée: ${store.store_name || store.name || 'Sans nom'}`,
                timestamp: new Date(store.created_at),
                icon: 'store',
                iconColor: '#9C27B0'
              });
            });
          }
          
          // Trier par date (plus récent en premier)
          activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          this.activities = activities.slice(0, 5);
        } else {
          this.activities = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des activités:', error);
        this.activities = [];
        this.loading = false;
      }
    });
  }

  getTimeAgo(date: Date): string {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
  }
}