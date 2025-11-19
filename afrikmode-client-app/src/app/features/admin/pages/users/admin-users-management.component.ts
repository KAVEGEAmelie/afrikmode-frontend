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
import { MatDialog } from '@angular/material/dialog';
import { AdminUsersService } from '../../core/services/admin-users.service';
import { ToastService } from '../../../../core/services/toast.service';
import { UserDetailsDialogComponent, UserDetailsData } from './user-details-dialog/user-details-dialog.component';
import { UserDialogComponent, UserDialogData } from './user-dialog/user-dialog.component';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'vendor' | 'admin' | 'super_admin';
  status: 'active' | 'pending' | 'suspended' | 'banned' | 'inactive';
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
                <mat-option value="admin">Administrateur</mat-option>
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
                <td mat-cell *matCellDef="let user" (click)="$event.stopPropagation()">
                  <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
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

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private usersService: AdminUsersService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadUserStats();
  }

  private loadUsers(): void {
    this.loading = true;
    
    // Charger les utilisateurs depuis l'API
    this.usersService.getUsers({
      page: this.currentPage + 1,
      limit: this.pageSize,
      search: this.searchTerm || undefined,
      role: this.selectedRole || undefined,
      status: this.selectedStatus || undefined,
      sortBy: 'created_at',
      sortOrder: 'desc'
    }).subscribe({
      next: (response: any) => {
        // Le service peut retourner directement les données ou un objet avec success/data
        const usersData = response.data || response.users || (Array.isArray(response) ? response : []);
        const pagination = response.pagination || response;
        
        if (usersData && Array.isArray(usersData)) {
          // Transformer les données du backend en format User
          this.users = usersData.map((user: any) => this.mapBackendUserToUser(user));
      this.filteredUsers = [...this.users];
          this.totalUsers = pagination.total || pagination.totalUsers || this.users.length;
      this.calculateStats();
        } else {
          this.users = [];
          this.filteredUsers = [];
          this.toastService.error('Erreur lors du chargement des utilisateurs');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement utilisateurs:', error);
        this.toastService.error('Erreur lors du chargement des utilisateurs');
        this.users = [];
        this.filteredUsers = [];
      this.loading = false;
      }
    });
  }

  private loadUserStats(): void {
    // Charger les statistiques des utilisateurs
    this.usersService.getUserStats().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.userStats = {
            total: response.data.total || 0,
            customers: response.data.customers || 0,
            vendors: response.data.vendors || 0,
            admins: response.data.admins || 0,
            active: response.data.active || 0,
            pending: response.data.pending || 0,
            suspended: response.data.suspended || 0
          };
        }
      },
      error: (error) => {
        console.error('Erreur chargement statistiques utilisateurs:', error);
        // Les stats restent à 0 en cas d'erreur
      }
    });
  }

  /**
   * Parse une date de manière sécurisée
   * Retourne undefined si la date est invalide ou null
   */
  private parseDate(dateValue: any): Date | undefined {
    if (!dateValue) return undefined;
    
    const date = new Date(dateValue);
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      return undefined;
    }
    
    return date;
  }

  private mapBackendUserToUser(backendUser: any): User {
    // Mapper les données du backend vers le format User
    const firstName = backendUser.first_name || backendUser.firstName || '';
    const lastName = backendUser.last_name || backendUser.lastName || '';
    const name = backendUser.name || `${firstName} ${lastName}`.trim();
    const nameParts = name.split(' ');
    
    // Parser les dates de manière sécurisée
    const lastLogin = this.parseDate(backendUser.last_login);
    const createdAt = this.parseDate(backendUser.created_at) || new Date();
    
    return {
      id: backendUser.id,
      email: backendUser.email || '',
      firstName: firstName || nameParts[0] || '',
      lastName: lastName || nameParts.slice(1).join(' ') || '',
      role: backendUser.role || 'customer',
      status: this.mapBackendStatusToStatus(backendUser.status || backendUser.is_active),
      phone: backendUser.phone || backendUser.phone_number,
      country: backendUser.country,
      city: backendUser.city,
      lastLogin: lastLogin,
      createdAt: createdAt,
      emailVerified: backendUser.email_verified || backendUser.is_verified || false,
      twoFactorEnabled: backendUser.two_factor_enabled || false,
      loyaltyPoints: backendUser.loyalty_points || 0
    };
  }

  private mapBackendStatusToStatus(backendStatus: any): User['status'] {
    if (typeof backendStatus === 'boolean') {
      return backendStatus ? 'active' : 'pending';
    }
    if (typeof backendStatus === 'string') {
      const status = backendStatus.toLowerCase();
      if (['active', 'pending', 'suspended', 'banned'].includes(status)) {
        return status as User['status'];
      }
    }
    return 'active'; // Par défaut
  }

  private calculateStats(): void {
    // Calculer les stats depuis les utilisateurs chargés (fallback si l'API ne retourne pas les stats)
    // Note: loadUserStats() charge les stats depuis l'API, cette méthode est un fallback
    this.userStats = {
      total: this.userStats.total || this.users.length,
      customers: this.userStats.customers || this.users.filter(u => u.role === 'customer').length,
      vendors: this.userStats.vendors || this.users.filter(u => u.role === 'vendor').length,
      admins: this.userStats.admins || this.users.filter(u => u.role === 'admin' || u.role === 'super_admin').length,
      active: this.userStats.active || this.users.filter(u => u.status === 'active').length,
      pending: this.userStats.pending || this.users.filter(u => u.status === 'pending').length,
      suspended: this.userStats.suspended || this.users.filter(u => u.status === 'suspended').length
    };
  }

  applyFilters(): void {
    // Recharger les utilisateurs avec les nouveaux filtres
    this.currentPage = 0;
    this.loadUsers();
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
    // Recharger les utilisateurs avec la nouvelle page
    this.loadUsers();
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
      'admin': 'Administrateur',
      'super_admin': 'Administrateur'
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
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '600px',
      data: {
        mode: 'add'
      } as UserDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers(); // Recharger la liste après ajout
      }
    });
  }

  viewUser(user: User): void {
    // Charger les détails complets depuis l'API
    this.usersService.getUserById(user.id).subscribe({
      next: (response: any) => {
        const userData = response.data || response;
        const dialogRef = this.dialog.open(UserDetailsDialogComponent, {
          width: '700px',
          data: {
            user: this.mapBackendUserToUser(userData)
          } as UserDetailsData
        });
      },
      error: (error) => {
        console.error('Erreur chargement détails:', error);
        this.toastService.error('Erreur lors du chargement des détails');
      }
    });
  }

  editUser(user: User): void {
    // Charger les détails complets depuis l'API
    this.usersService.getUserById(user.id).subscribe({
      next: (response: any) => {
        const userData = response.data || response;
        const dialogRef = this.dialog.open(UserDialogComponent, {
          width: '600px',
          data: {
            user: this.mapBackendUserToUser(userData),
            mode: 'edit'
          } as UserDialogData
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.loadUsers(); // Recharger la liste après modification
          }
        });
      },
      error: (error) => {
        console.error('Erreur chargement utilisateur:', error);
        this.toastService.error('Erreur lors du chargement de l\'utilisateur');
      }
    });
  }

  toggleUserStatus(user: User): void {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'active' ? 'activer' : 'suspendre';
    
    if (confirm(`Êtes-vous sûr de vouloir ${action} cet utilisateur ?`)) {
      this.usersService.updateUserStatus(user.id, newStatus).subscribe({
        next: () => {
          this.toastService.success(`Utilisateur ${action} avec succès`);
          this.loadUsers(); // Recharger la liste
        },
        error: (error) => {
          console.error('Erreur changement statut:', error);
          this.toastService.error('Erreur lors du changement de statut');
        }
      });
    }
  }

  deleteUser(user: User): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.firstName} ${user.lastName} ?`)) {
      this.usersService.deleteUser(user.id).subscribe({
        next: () => {
          this.toastService.success('Utilisateur supprimé avec succès');
          this.loadUsers(); // Recharger la liste
        },
        error: (error) => {
          console.error('Erreur suppression:', error);
          this.toastService.error('Erreur lors de la suppression');
        }
      });
    }
  }
}
