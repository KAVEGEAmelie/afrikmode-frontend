// src/app/features/admin/pages/dashboard/components/activity-feed/activity-feed.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  activities: Activity[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities(): void {
    // Simulation de données - À remplacer par un vrai service
    setTimeout(() => {
      this.activities = [
        {
          id: 1,
          type: 'order',
          message: 'Nouvelle commande #12345 reçue',
          timestamp: new Date(Date.now() - 5 * 60000),
          icon: 'shopping_bag',
          iconColor: '#4CAF50'
        },
        {
          id: 2,
          type: 'user',
          message: 'Nouvel utilisateur inscrit',
          timestamp: new Date(Date.now() - 15 * 60000),
          icon: 'person_add',
          iconColor: '#2196F3'
        },
        {
          id: 3,
          type: 'product',
          message: 'Produit "Chemise Wax" ajouté',
          timestamp: new Date(Date.now() - 30 * 60000),
          icon: 'inventory_2',
          iconColor: '#FF9800'
        },
        {
          id: 4,
          type: 'store',
          message: 'Boutique "AfrikStyle" activée',
          timestamp: new Date(Date.now() - 60 * 60000),
          icon: 'store',
          iconColor: '#9C27B0'
        },
        {
          id: 5,
          type: 'order',
          message: 'Commande #12344 expédiée',
          timestamp: new Date(Date.now() - 90 * 60000),
          icon: 'local_shipping',
          iconColor: '#4CAF50'
        }
      ];
      this.loading = false;
    }, 500);
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