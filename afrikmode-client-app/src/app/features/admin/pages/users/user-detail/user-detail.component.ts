// src/app/features/admin/pages/users/user-detail/user-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { AdminUsersService } from '../../../core/services/admin-users.service';
import { AdminUser } from '../../../core/models/admin-user.model';
import { UserRolePipe } from '../../../shared/pipes/user-role.pipe';

@Component({
  standalone: true,
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatDividerModule,
    MatListModule,
    UserRolePipe
  ]
})
export class UserDetailComponent implements OnInit {
  user: AdminUser | null = null;
  loading = true;
  userId: string;

  // Données simulées pour l'historique et les statistiques
  userStats = {
    totalOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0,
    lastOrderDate: null as Date | null
  };

  recentActivity = [
    { action: 'Connexion', date: new Date(), details: 'Connexion depuis Chrome' },
    { action: 'Commande créée', date: new Date(Date.now() - 86400000), details: 'Commande #12345' },
    { action: 'Profil modifié', date: new Date(Date.now() - 172800000), details: 'Mise à jour du téléphone' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: AdminUsersService
  ) {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
  }

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    if (!this.userId) {
      this.router.navigate(['/admin/users']);
      return;
    }

    this.loading = true;
    this.usersService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.loadUserStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        this.loading = false;
      }
    });
  }

  loadUserStats() {
    // Simulation des statistiques utilisateur
    this.userStats = {
      totalOrders: Math.floor(Math.random() * 50),
      totalSpent: Math.floor(Math.random() * 10000),
      averageOrderValue: Math.floor(Math.random() * 500),
      lastOrderDate: new Date(Date.now() - Math.random() * 30 * 86400000)
    };
  }

  editUser() {
    this.router.navigate(['/admin/users', this.userId, 'edit']);
  }

  deleteUser() {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${this.user?.first_name} ${this.user?.last_name} ?`)) {
      this.usersService.deleteUser(this.userId).subscribe({
        next: () => {
          this.router.navigate(['/admin/users']);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }

  toggleUserStatus() {
    if (!this.user) return;

    const newStatus = this.user.status === 'active' ? 'inactive' : 'active';
    this.usersService.updateUser(this.userId, { status: newStatus }).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du statut:', error);
      }
    });
  }

  getRoleColor(role: string): string {
    const colors: {[key: string]: string} = {
      'admin': '#ff9800',
      'vendor': '#2196f3',
      'customer': '#607d8b'
    };
    return colors[role] || colors['customer'];
  }

  getStatusColor(status: string): string {
    const colors: {[key: string]: string} = {
      'active': '#4caf50',
      'inactive': '#ff9800',
      'suspended': '#f44336',
      'banned': '#9c27b0'
    };
    return colors[status] || colors['active'];
  }

  getStatusLabel(status: string): string {
    const labels: {[key: string]: string} = {
      'active': 'Actif',
      'inactive': 'Inactif',
      'suspended': 'Suspendu',
      'banned': 'Banni'
    };
    return labels[status] || status;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  goBack() {
    this.router.navigate(['/admin/users']);
  }
}
