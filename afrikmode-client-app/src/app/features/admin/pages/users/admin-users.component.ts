import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  last_login?: string;
  avatar?: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-users-page">
      <!-- Header -->
      <div class="page-header">
        <h1>Gestion des Utilisateurs</h1>
        <p class="subtitle">Gérer tous les utilisateurs de la plateforme</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon customers">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <div class="stat-info">
            <h3>{{ getUsersByRole('customer').length }}</h3>
            <p>Clients</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon vendors">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <div class="stat-info">
            <h3>{{ getUsersByRole('vendor').length }}</h3>
            <p>Vendeurs</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon admins">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <div class="stat-info">
            <h3>{{ getUsersByRole('admin').length + getUsersByRole('super_admin').length }}</h3>
            <p>Administrateurs</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon active">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <div class="stat-info">
            <h3>{{ getUsersByStatus('active').length }}</h3>
            <p>Actifs</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-group">
          <label>Rôle</label>
          <select [(ngModel)]="selectedRole" (change)="applyFilters()" class="filter-select">
            <option value="all">Tous les rôles</option>
            <option value="customer">Clients</option>
            <option value="vendor">Vendeurs</option>
            <option value="admin">Administrateurs</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Statut</label>
          <select [(ngModel)]="selectedStatus" (change)="applyFilters()" class="filter-select">
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="suspended">Suspendu</option>
          </select>
        </div>
        <div class="search-box">
          <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (input)="applyFilters()" 
            placeholder="Rechercher par nom ou email..."
            class="search-input"
          />
        </div>
        <button class="btn btn-primary" (click)="createUser()">
          <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nouvel utilisateur
        </button>
      </div>

      <!-- Users Table -->
      <div class="table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Inscription</th>
              <th>Dernière connexion</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (user of filteredUsers; track user.id) {
              <tr>
                <td>
                  <div class="user-cell">
                    <div class="user-avatar">
                      @if (user.avatar) {
                        <img [src]="user.avatar" [alt]="user.name" />
                      } @else {
                        <span>{{ user.name.charAt(0).toUpperCase() }}</span>
                      }
                    </div>
                    <div class="user-info">
                      <p class="user-name">{{ user.name }}</p>
                      <p class="user-email">{{ user.email }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="role-badge" [class]="user.role">
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" [class]="user.status">
                    {{ getStatusLabel(user.status) }}
                  </span>
                </td>
                <td>{{ formatDate(user.created_at) }}</td>
                <td>{{ user.last_login ? formatDate(user.last_login) : 'Jamais' }}</td>
                <td>
                  <div class="actions-cell">
                    <button class="btn-icon" (click)="editUser(user)" title="Modifier">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button class="btn-icon" (click)="toggleUserStatus(user)" [title]="user.status === 'active' ? 'Désactiver' : 'Activer'">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                    </button>
                    <button class="btn-icon delete" (click)="deleteUser(user)" title="Supprimer">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>

        @if (filteredUsers.length === 0) {
          <div class="empty-state">
            <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <h3>Aucun utilisateur trouvé</h3>
            <p>Aucun utilisateur ne correspond à vos critères de recherche.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .admin-users-page {
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .page-header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }
    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .filters-section {
      background: white;
      border-radius: 16px;
      padding: 24px;
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 24px;
    }
    .table-container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .users-table {
      width: 100%;
      border-collapse: collapse;
    }
    .users-table th {
      padding: 16px 20px;
      text-align: left;
      background: #f7fafc;
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
    }
    .users-table td {
      padding: 16px 20px;
      border-bottom: 1px solid #e2e8f0;
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedRole = 'all';
  selectedStatus = 'all';
  searchQuery = '';
  isLoading = false;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    
    this.adminService.getUsers({
      role: this.selectedRole !== 'all' ? this.selectedRole : undefined,
      status: this.selectedStatus !== 'all' ? this.selectedStatus : undefined,
      search: this.searchQuery || undefined,
      limit: 100
    }).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.users = response.data;
          this.applyFilters();
        }
        this.isLoading = false;
        console.log('✅ Users loaded from API:', this.users.length);
      },
      error: (error) => {
        console.error('❌ Erreur chargement users:', error);
        this.isLoading = false;
        // Fallback vers mock data en cas d'erreur
        this.loadMockData();
      }
    });
  }

  loadMockData() {
    this.users = [
      {
        id: '1',
        name: 'Fatou Diallo',
        email: 'fatou.diallo@example.com',
        role: 'vendor',
        status: 'active',
        created_at: '2025-01-15T10:30:00Z',
        last_login: '2025-10-20T14:20:00Z'
      },
      {
        id: '2',
        name: 'Kofi Mensah',
        email: 'kofi.mensah@example.com',
        role: 'vendor',
        status: 'active',
        created_at: '2025-02-20T09:15:00Z',
        last_login: '2025-10-19T11:45:00Z'
      },
      {
        id: '3',
        name: 'Aisha Njoroge',
        email: 'aisha@example.com',
        role: 'customer',
        status: 'active',
        created_at: '2025-03-10T16:20:00Z',
        last_login: '2025-10-20T08:30:00Z'
      },
      {
        id: '4',
        name: 'Admin User',
        email: 'admin@afrikmode.com',
        role: 'super_admin',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        last_login: '2025-10-20T15:00:00Z'
      },
      {
        id: '5',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'customer',
        status: 'inactive',
        created_at: '2025-05-12T12:00:00Z'
      }
    ];
    
    this.applyFilters();
    this.isLoading = false;
    console.log('✅ Mock users loaded:', this.users.length);
  }

  applyFilters() {
    let filtered = [...this.users];

    if (this.selectedRole !== 'all') {
      filtered = filtered.filter(u => u.role === this.selectedRole);
    }

    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(u => u.status === this.selectedStatus);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    }

    this.filteredUsers = filtered;
  }

  getUsersByRole(role: string): User[] {
    return this.users.filter(u => u.role === role);
  }

  getUsersByStatus(status: string): User[] {
    return this.users.filter(u => u.status === status);
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'customer': 'Client',
      'vendor': 'Vendeur',
      'admin': 'Admin',
      'super_admin': 'Super Admin'
    };
    return labels[role] || role;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'active': 'Actif',
      'inactive': 'Inactif',
      'suspended': 'Suspendu'
    };
    return labels[status] || status;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  createUser() {
    console.log('📝 Créer un nouvel utilisateur');
    alert('Fonctionnalité "Créer utilisateur" à implémenter');
  }

  editUser(user: User) {
    console.log('✏️ Modifier utilisateur:', user.name);
    alert(`Fonctionnalité "Modifier ${user.name}" à implémenter`);
  }

  toggleUserStatus(user: User) {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    console.log(`🔄 Changer statut de ${user.name}: ${user.status} → ${newStatus}`);
    
    this.isLoading = true;
    this.adminService.updateUserStatus(user.id, newStatus).subscribe({
      next: (response) => {
        console.log('✅ Statut changé:', response);
        user.status = newStatus;
        this.applyFilters();
        this.isLoading = false;
        alert(`✅ Statut changé: ${this.getStatusLabel(newStatus)}`);
      },
      error: (error) => {
        console.error('❌ Erreur changement statut:', error);
        this.isLoading = false;
        alert('❌ Erreur lors du changement de statut: ' + (error.error?.message || error.message));
      }
    });
  }

  deleteUser(user: User) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${user.name} ?`)) {
      console.log('🗑️ Supprimer utilisateur:', user.name);
      
      this.isLoading = true;
      this.adminService.deleteUser(user.id).subscribe({
        next: (response) => {
          console.log('✅ Utilisateur supprimé:', response);
          this.users = this.users.filter(u => u.id !== user.id);
          this.applyFilters();
          alert(`✅ ${user.name} supprimé avec succès`);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Erreur suppression:', error);
          alert('❌ Erreur: ' + (error.error?.message || error.message));
          this.isLoading = false;
        }
      });
    }
  }
}

