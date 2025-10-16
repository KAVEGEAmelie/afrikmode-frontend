import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'vendor' | 'manager' | 'admin' | 'super_admin';
  status: 'active' | 'pending' | 'suspended' | 'banned';
  phone?: string;
  country?: string;
  city?: string;
  lastLogin?: Date;
  createdAt: Date;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  loyaltyPoints: number;
}

export interface UserStats {
  total: number;
  customers: number;
  vendors: number;
  managers: number;
  admins: number;
  active: number;
  pending: number;
  suspended: number;
}

@Component({
  selector: 'app-admin-users-management',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatChipsModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="users-management">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>Gestion des Utilisateurs</h1>
          <p>Gérez tous les utilisateurs de la plateforme</p>
        </div>
        <div class="header-right">
          <button mat-raised-button color="primary" (click)="openAddUserDialog()">
            <mat-icon>person_add</mat-icon>
            Nouvel utilisateur
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-cards">
        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon customers">
              <mat-icon>people</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ userStats.customers }}</div>
              <div class="stat-label">Clients</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon vendors">
              <mat-icon>store</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ userStats.vendors }}</div>
              <div class="stat-label">Vendeurs</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon managers">
              <mat-icon>admin_panel_settings</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ userStats.managers }}</div>
              <div class="stat-label">Managers</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon admins">
              <mat-icon>security</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ userStats.admins }}</div>
              <div class="stat-label">Admins</div>
            </div>
          </div>
        </mat-card>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Rechercher</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="Nom, email, téléphone...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="role-field">
              <mat-label>Rôle</mat-label>
              <mat-select [(ngModel)]="selectedRole" (selectionChange)="applyFilters()">
                <mat-option value="">Tous les rôles</mat-option>
                <mat-option value="customer">Client</mat-option>
                <mat-option value="vendor">Vendeur</mat-option>
                <mat-option value="manager">Manager</mat-option>
                <mat-option value="admin">Admin</mat-option>
                <mat-option value="super_admin">Super Admin</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="status-field">
              <mat-label>Statut</mat-label>
              <mat-select [(ngModel)]="selectedStatus" (selectionChange)="applyFilters()">
                <mat-option value="">Tous les statuts</mat-option>
                <mat-option value="active">Actif</mat-option>
                <mat-option value="pending">En attente</mat-option>
                <mat-option value="suspended">Suspendu</mat-option>
                <mat-option value="banned">Banni</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-button (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
              Effacer
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Users Table -->
      <mat-card class="table-card">
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="filteredUsers" matSort class="users-table">
              <!-- Checkbox Column -->
              <ng-container matColumnDef="select">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-checkbox (change)="$event ? masterToggle() : null"
                                [checked]="hasValue() && isAllSelected()"
                                [indeterminate]="hasValue() && !isAllSelected()">
                  </mat-checkbox>
                </th>
                <td mat-cell *matCellDef="let row">
                  <mat-checkbox (click)="$event.stopPropagation()"
                                (change)="$event ? toggle(row) : null"
                                [checked]="isSelected(row)">
                  </mat-checkbox>
                </td>
              </ng-container>

              <!-- User Column -->
              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Utilisateur</th>
                <td mat-cell *matCellDef="let user">
                  <div class="user-info">
                    <div class="user-avatar">
                      <mat-icon>person</mat-icon>
                    </div>
                    <div class="user-details">
                      <div class="user-name">{{ user.firstName }} {{ user.lastName }}</div>
                      <div class="user-email">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Role Column -->
              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Rôle</th>
                <td mat-cell *matCellDef="let user">
                  <mat-chip [ngClass]="'role-' + user.role">
                    {{ getRoleLabel(user.role) }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
                <td mat-cell *matCellDef="let user">
                  <mat-chip [ngClass]="'status-' + user.status">
                    {{ getStatusLabel(user.status) }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Last Login Column -->
              <ng-container matColumnDef="lastLogin">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Dernière connexion</th>
                <td mat-cell *matCellDef="let user">
                  {{ user.lastLogin ? (user.lastLogin | date:'short') : 'Jamais' }}
                </td>
              </ng-container>

              <!-- Created At Column -->
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Inscrit le</th>
                <td mat-cell *matCellDef="let user">
                  {{ user.createdAt | date:'short' }}
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let user">
                  <button mat-icon-button [matMenuTriggerFor]="userMenu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #userMenu="matMenu">
                    <button mat-menu-item (click)="viewUser(user)">
                      <mat-icon>visibility</mat-icon>
                      <span>Voir</span>
                    </button>
                    <button mat-menu-item (click)="editUser(user)">
                      <mat-icon>edit</mat-icon>
                      <span>Modifier</span>
                    </button>
                    <button mat-menu-item (click)="toggleUserStatus(user)">
                      <mat-icon>{{ user.status === 'active' ? 'block' : 'check_circle' }}</mat-icon>
                      <span>{{ user.status === 'active' ? 'Suspendre' : 'Activer' }}</span>
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item (click)="deleteUser(user)" class="danger">
                      <mat-icon>delete</mat-icon>
                      <span>Supprimer</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                  (click)="viewUser(row)" class="clickable-row"></tr>
            </table>

            <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]" 
                           showFirstLastButtons
                           [length]="totalUsers"
                           [pageSize]="pageSize"
                           (page)="onPageChange($event)">
            </mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./admin-users-management.component.scss']
})
export class AdminUsersManagementComponent implements OnInit {
  displayedColumns: string[] = ['select', 'user', 'role', 'status', 'lastLogin', 'createdAt', 'actions'];
  users: User[] = [];
  filteredUsers: User[] = [];
  userStats: UserStats = {
    total: 0,
    customers: 0,
    vendors: 0,
    managers: 0,
    admins: 0,
    active: 0,
    pending: 0,
    suspended: 0
  };

  // Filters
  searchTerm: string = '';
  selectedRole: string = '';
  selectedStatus: string = '';

  // Pagination
  pageSize: number = 25;
  totalUsers: number = 0;
  currentPage: number = 0;

  // Selection
  selection = new Set<User>();

  loading = true;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.loading = true;
    
    // Simuler le chargement des données
    setTimeout(() => {
      this.users = this.generateMockUsers();
      this.filteredUsers = [...this.users];
      this.calculateStats();
      this.loading = false;
    }, 1000);
  }

  private generateMockUsers(): User[] {
    const users: User[] = [];
    const roles: User['role'][] = ['customer', 'vendor', 'manager', 'admin', 'super_admin'];
    const statuses: User['status'][] = ['active', 'pending', 'suspended', 'banned'];
    
    for (let i = 1; i <= 100; i++) {
      const role = roles[Math.floor(Math.random() * roles.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      users.push({
        id: `user-${i}`,
        email: `user${i}@example.com`,
        firstName: `Prénom${i}`,
        lastName: `Nom${i}`,
        role,
        status,
        phone: `+33${Math.floor(Math.random() * 900000000) + 100000000}`,
        country: 'France',
        city: 'Paris',
        lastLogin: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        emailVerified: Math.random() > 0.2,
        twoFactorEnabled: Math.random() > 0.7,
        loyaltyPoints: Math.floor(Math.random() * 1000)
      });
    }
    
    return users;
  }

  private calculateStats(): void {
    this.userStats = {
      total: this.users.length,
      customers: this.users.filter(u => u.role === 'customer').length,
      vendors: this.users.filter(u => u.role === 'vendor').length,
      managers: this.users.filter(u => u.role === 'manager').length,
      admins: this.users.filter(u => u.role === 'admin' || u.role === 'super_admin').length,
      active: this.users.filter(u => u.status === 'active').length,
      pending: this.users.filter(u => u.status === 'pending').length,
      suspended: this.users.filter(u => u.status === 'suspended').length
    };
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(this.searchTerm));
      
      const matchesRole = !this.selectedRole || user.role === this.selectedRole;
      const matchesStatus = !this.selectedStatus || user.status === this.selectedStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
    
    this.totalUsers = this.filteredUsers.length;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    // Implémenter la pagination côté serveur
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.filteredUsers.forEach(user => this.selection.add(user));
    }
  }

  isAllSelected(): boolean {
    return this.selection.size === this.filteredUsers.length;
  }

  hasValue(): boolean {
    return this.selection.size > 0;
  }

  toggle(user: User): void {
    if (this.selection.has(user)) {
      this.selection.delete(user);
    } else {
      this.selection.add(user);
    }
  }

  isSelected(user: User): boolean {
    return this.selection.has(user);
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'customer': 'Client',
      'vendor': 'Vendeur',
      'manager': 'Manager',
      'admin': 'Admin',
      'super_admin': 'Super Admin'
    };
    return labels[role] || role;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Actif',
      'pending': 'En attente',
      'suspended': 'Suspendu',
      'banned': 'Banni'
    };
    return labels[status] || status;
  }

  openAddUserDialog(): void {
    console.log('Ouvrir dialog ajout utilisateur');
  }

  viewUser(user: User): void {
    console.log('Voir utilisateur:', user);
  }

  editUser(user: User): void {
    console.log('Modifier utilisateur:', user);
  }

  toggleUserStatus(user: User): void {
    console.log('Changer statut utilisateur:', user);
  }

  deleteUser(user: User): void {
    console.log('Supprimer utilisateur:', user);
  }
}
