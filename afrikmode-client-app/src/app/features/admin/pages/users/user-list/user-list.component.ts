// src/app/features/admin/pages/users/user-list/user-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AdminDataTableComponent, TableColumn, TableAction } from '../../../shared/components/admin-data-table/admin-data-table.component';
import { AdminUsersService } from '../../../core/services/admin-users.service';
import { AdminUser, UserListResponse } from '../../../core/models/admin-user.model';

@Component({
  standalone: true,
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    AdminDataTableComponent
  ]
})
export class UserListComponent implements OnInit {
  users: AdminUser[] = [];
  loading = false;

  columns: TableColumn[] = [
    {
      key: 'avatar',
      label: 'Photo',
      type: 'text',
      sortable: false,
      width: '60px',
      align: 'center'
    },
    {
      key: 'first_name',
      label: 'Nom Complet',
      sortable: true,
      format: (value: any) => 'Nom défini dans template'
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true
    },
    {
      key: 'role',
      label: 'Rôle',
      type: 'badge',
      sortable: true,
      format: (value) => value || 'user'
    },
    {
      key: 'status',
      label: 'Statut',
      type: 'badge',
      sortable: true
    },
    {
      key: 'created_at',
      label: 'Date Création',
      type: 'date',
      sortable: true
    },
    {
      key: 'last_login_at',
      label: 'Dernière Connexion',
      type: 'date',
      sortable: true
    }
  ];

  actions: TableAction[] = [
    {
      label: 'Voir',
      icon: 'visibility',
      color: 'primary',
      action: (user) => this.viewUser(user)
    },
    {
      label: 'Modifier',
      icon: 'edit',
      color: 'accent',
      action: (user) => this.editUser(user)
    },
    {
      label: 'Supprimer',
      icon: 'delete',
      color: 'warn',
      action: (user) => this.deleteUser(user),
      visible: (user) => user.role !== 'super_admin'
    }
  ];

  constructor(
    private usersService: AdminUsersService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.usersService.getUsers().subscribe({
      next: (response) => {
        this.users = response.users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.loading = false;
      }
    });
  }

  onSelectionChange(selectedUsers: AdminUser[]) {
    console.log('Utilisateurs sélectionnés:', selectedUsers);
  }

  onSortChange(sort: {column: string, direction: 'asc' | 'desc'}) {
    console.log('Tri changé:', sort);
  }

  viewUser(user: AdminUser) {
    // Navigation vers les détails de l'utilisateur
    console.log('Voir utilisateur:', user);
  }

  editUser(user: AdminUser) {
    // Navigation vers l'édition de l'utilisateur
    console.log('Modifier utilisateur:', user);
  }

  deleteUser(user: AdminUser) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.first_name} ${user.last_name} (${user.email}) ?`)) {
      this.usersService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }

  exportUsers() {
    // Implémentation de l'export
    console.log('Export des utilisateurs');
  }

  getRoleColor(role: string): string {
    const colors: {[key: string]: string} = {
      'super_admin': 'rgb(244, 67, 54)',
      'admin': 'rgb(255, 152, 0)',
      'moderator': 'rgb(76, 175, 80)',
      'user': 'rgb(96, 125, 139)'
    };
    return colors[role] || colors['user'];
  }

  getStatusColor(status: string): string {
    const colors: {[key: string]: string} = {
      'active': 'rgb(76, 175, 80)',
      'inactive': 'rgb(255, 152, 0)',
      'suspended': 'rgb(244, 67, 54)',
      'pending': 'rgb(96, 125, 139)'
    };
    return colors[status] || colors['pending'];
  }

  trackByUserId(index: number, user: AdminUser): string {
    return user.id;
  }
}