// src/app/features/admin/pages/users/users.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

// Angular Material Modules
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

// Services
import { AdminService } from '../../../../core/services/admin.service';
import { ToastService } from '../../../../core/services/toast.service';

// Dialogs
import { UserDialogComponent, UserDialogData } from './user-dialog/user-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog/confirm-dialog.component';
import { UserDetailsDialogComponent, UserDetailsData } from './user-details-dialog/user-details-dialog.component';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  lastLogin?: Date;
  totalOrders: number;
  totalSpent: number;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<User>([]);
  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'totalOrders', 'totalSpent', 'createdAt', 'actions'];
  
  loading = false;
  searchForm: FormGroup;
  
  roles = [
    { value: 'customer', label: 'Client', color: 'primary', icon: 'person' },
    { value: 'vendor', label: 'Vendeur', color: 'accent', icon: 'store' },
    { value: 'manager', label: 'Manager', color: 'warn', icon: 'supervisor_account' },
    { value: 'admin', label: 'Admin', color: 'primary', icon: 'admin_panel_settings' },
    { value: 'super_admin', label: 'Super Admin', color: 'warn', icon: 'security' }
  ];

  statuses = [
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
    { value: 'suspended', label: 'Suspendu' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private adminService: AdminService,
    private toastService: ToastService
  ) {
    this.searchForm = this.fb.group({
      search: [''],
      role: [''],
      status: ['']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.setupSearch();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private setupSearch(): void {
    // Utiliser debounce pour éviter trop d'appels API
    this.searchForm.valueChanges.subscribe(() => {
      // Recharger les données depuis le backend avec les nouveaux filtres
      this.loadUsers();
    });
  }

  private applyFilters(): void {
    // Le filtrage est maintenant géré côté serveur dans loadUsers()
    // On garde cette méthode pour compatibilité mais elle ne fait plus rien
  }

  loadUsers(): void {
    this.loading = true;
    
    // Charger les utilisateurs depuis le backend
    const filters = this.searchForm.value;
    this.adminService.getUsers({
      role: filters.role || undefined,
      status: filters.status || undefined,
      search: filters.search || undefined,
      page: 1,
      limit: 1000, // Charger tous les utilisateurs pour le filtrage côté client
      sortBy: 'created_at',
      sortOrder: 'desc'
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Transformer les données du backend en format User
          this.dataSource.data = response.data.map((user: any) => this.mapBackendUserToUser(user));
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.loading = false;
        } else {
          this.toastService.error('Erreur lors du chargement des utilisateurs');
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Erreur chargement utilisateurs:', error);
        this.toastService.error('Erreur lors du chargement des utilisateurs');
        this.loading = false;
      }
    });
  }

  private mapBackendUserToUser(backendUser: any): User {
    // Mapper les données du backend vers le format User
    const nameParts = (backendUser.name || '').split(' ');
    return {
      id: backendUser.id,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: backendUser.email || '',
      role: backendUser.role || 'customer',
      status: this.mapBackendStatusToStatus(backendUser.status || backendUser.is_active),
      createdAt: new Date(backendUser.created_at || Date.now()),
      lastLogin: backendUser.last_login ? new Date(backendUser.last_login) : undefined,
      totalOrders: backendUser.total_orders || 0,
      totalSpent: backendUser.total_spent || 0
    };
  }

  private mapBackendStatusToStatus(backendStatus: any): 'active' | 'inactive' | 'suspended' {
    if (typeof backendStatus === 'boolean') {
      return backendStatus ? 'active' : 'inactive';
    }
    if (typeof backendStatus === 'string') {
      const status = backendStatus.toLowerCase();
      if (status === 'active' || status === 'enabled') return 'active';
      if (status === 'suspended' || status === 'banned') return 'suspended';
      return 'inactive';
    }
    return 'inactive';
  }

  // Méthode pour charger les données mockées (fallback - à supprimer en production)
  private loadMockUsers(): void {
    const mockUsers: User[] = [
      // Clients
      {
        id: '1',
        firstName: 'Marie',
        lastName: 'Dupont',
        email: 'marie.dupont@email.com',
        role: 'customer',
        status: 'active',
        createdAt: new Date('2024-01-15'),
        lastLogin: new Date('2024-10-01'),
        totalOrders: 12,
        totalSpent: 1250.50
      },
      {
        id: '4',
        firstName: 'Pierre',
        lastName: 'Dubois',
        email: 'pierre.dubois@email.com',
        role: 'customer',
        status: 'inactive',
        createdAt: new Date('2024-03-05'),
        lastLogin: new Date('2024-09-15'),
        totalOrders: 5,
        totalSpent: 450.75
      },
      {
        id: '5',
        firstName: 'Claire',
        lastName: 'Laurent',
        email: 'claire.laurent@email.com',
        role: 'customer',
        status: 'suspended',
        createdAt: new Date('2024-04-12'),
        lastLogin: new Date('2024-08-20'),
        totalOrders: 8,
        totalSpent: 320.25
      },
      {
        id: '6',
        firstName: 'Antoine',
        lastName: 'Moreau',
        email: 'antoine.moreau@email.com',
        role: 'customer',
        status: 'active',
        createdAt: new Date('2024-05-20'),
        lastLogin: new Date('2024-10-03'),
        totalOrders: 3,
        totalSpent: 180.00
      },
      // Vendeurs
      {
        id: '2',
        firstName: 'Jean',
        lastName: 'Martin',
        email: 'jean.martin@email.com',
        role: 'vendor',
        status: 'active',
        createdAt: new Date('2024-02-20'),
        lastLogin: new Date('2024-10-02'),
        totalOrders: 0,
        totalSpent: 0
      },
      {
        id: '7',
        firstName: 'Sarah',
        lastName: 'Petit',
        email: 'sarah.petit@email.com',
        role: 'vendor',
        status: 'active',
        createdAt: new Date('2024-06-10'),
        lastLogin: new Date('2024-10-01'),
        totalOrders: 0,
        totalSpent: 0
      },
      {
        id: '8',
        firstName: 'Thomas',
        lastName: 'Roux',
        email: 'thomas.roux@email.com',
        role: 'vendor',
        status: 'inactive',
        createdAt: new Date('2024-03-15'),
        lastLogin: new Date('2024-09-20'),
        totalOrders: 0,
        totalSpent: 0
      },
      // Managers
      {
        id: '9',
        firstName: 'Laura',
        lastName: 'Simon',
        email: 'laura.simon@email.com',
        role: 'manager',
        status: 'active',
        createdAt: new Date('2024-01-05'),
        lastLogin: new Date('2024-10-03'),
        totalOrders: 0,
        totalSpent: 0
      },
      {
        id: '10',
        firstName: 'Marc',
        lastName: 'Durand',
        email: 'marc.durand@email.com',
        role: 'manager',
        status: 'active',
        createdAt: new Date('2024-02-10'),
        lastLogin: new Date('2024-10-02'),
        totalOrders: 0,
        totalSpent: 0
      },
      // Admins
      {
        id: '3',
        firstName: 'Sophie',
        lastName: 'Bernard',
        email: 'sophie.bernard@email.com',
        role: 'admin',
        status: 'active',
        createdAt: new Date('2024-01-10'),
        lastLogin: new Date('2024-10-02'),
        totalOrders: 0,
        totalSpent: 0
      },
      {
        id: '11',
        firstName: 'Nicolas',
        lastName: 'Leroy',
        email: 'nicolas.leroy@email.com',
        role: 'admin',
        status: 'active',
        createdAt: new Date('2024-01-20'),
        lastLogin: new Date('2024-10-01'),
        totalOrders: 0,
        totalSpent: 0
      },
      // Super Admin
      {
        id: '12',
        firstName: 'Admin',
        lastName: 'Super',
        email: 'admin.super@afrikmode.com',
        role: 'super_admin',
        status: 'active',
        createdAt: new Date('2024-01-01'),
        lastLogin: new Date('2024-10-03'),
        totalOrders: 0,
        totalSpent: 0
      }
    ];

    setTimeout(() => {
      this.dataSource.data = mockUsers;
      this.loading = false;
    }, 1000);
  }

  getRoleLabel(role: string): string {
    const roleObj = this.roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  }

  getStatusLabel(status: string): string {
    const statusObj = this.statuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'primary';
      case 'inactive':
        return 'accent';
      case 'suspended':
        return 'warn';
      default:
        return 'primary';
    }
  }

  editUser(user: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '600px',
      data: {
        user: user,
        mode: 'edit'
      } as UserDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Mettre à jour l'utilisateur via l'API
        const updateData: any = {
          name: `${result.firstName} ${result.lastName}`.trim(),
          email: result.email,
          role: result.role
        };
        
        this.adminService.updateUser(user.id, updateData).subscribe({
          next: (response) => {
            if (response.success) {
              this.toastService.success('Utilisateur modifié avec succès');
              this.loadUsers(); // Recharger la liste
            } else {
              this.toastService.error(response.message || 'Erreur lors de la modification');
            }
          },
          error: (error) => {
            console.error('Erreur modification utilisateur:', error);
            this.toastService.error('Erreur lors de la modification de l\'utilisateur');
          }
        });
      }
    });
  }

  deleteUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Supprimer l\'utilisateur',
        message: `Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.firstName} ${user.lastName} ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.adminService.deleteUser(user.id).subscribe({
          next: (response) => {
            if (response.success) {
              this.toastService.success('Utilisateur supprimé avec succès');
              this.loadUsers(); // Recharger la liste
            } else {
              this.toastService.error(response.message || 'Erreur lors de la suppression');
            }
          },
          error: (error) => {
            console.error('Erreur suppression utilisateur:', error);
            this.toastService.error('Erreur lors de la suppression de l\'utilisateur');
          }
        });
      }
    });
  }

  suspendUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Suspendre l\'utilisateur',
        message: `Êtes-vous sûr de vouloir suspendre l'utilisateur ${user.firstName} ${user.lastName} ?`,
        confirmText: 'Suspendre',
        cancelText: 'Annuler'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.adminService.updateUserStatus(user.id, 'suspended').subscribe({
          next: (response) => {
            if (response.success) {
              this.toastService.success('Utilisateur suspendu avec succès');
              this.loadUsers(); // Recharger la liste
            } else {
              this.toastService.error(response.message || 'Erreur lors de la suspension');
            }
          },
          error: (error) => {
            console.error('Erreur suspension utilisateur:', error);
            this.toastService.error('Erreur lors de la suspension de l\'utilisateur');
          }
        });
      }
    });
  }

  activateUser(user: User): void {
    this.adminService.updateUserStatus(user.id, 'active').subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Utilisateur activé avec succès');
          this.loadUsers(); // Recharger la liste
        } else {
          this.toastService.error(response.message || 'Erreur lors de l\'activation');
        }
      },
      error: (error) => {
        console.error('Erreur activation utilisateur:', error);
        this.toastService.error('Erreur lors de l\'activation de l\'utilisateur');
      }
    });
  }

  viewUserDetails(user: User): void {
    // Charger les détails complets depuis l'API
    this.adminService.getUser(user.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const dialogRef = this.dialog.open(UserDetailsDialogComponent, {
            width: '700px',
            data: {
              user: this.mapBackendUserToUser(response.data)
            } as UserDetailsData
          });
        } else {
          this.toastService.error('Erreur lors du chargement des détails');
        }
      },
      error: (error) => {
        console.error('Erreur chargement détails:', error);
        this.toastService.error('Erreur lors du chargement des détails');
      }
    });
  }

  exportUsers(): void {
    console.log('Export users');
    const csvContent = this.generateCSV();
    this.downloadCSV(csvContent, 'utilisateurs.csv');
    alert('Export des utilisateurs en cours...');
  }

  addUser(): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '600px',
      data: {
        user: null,
        mode: 'add'
      } as UserDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Créer l'utilisateur via l'API
        const userData = {
          name: `${result.firstName} ${result.lastName}`.trim(),
          email: result.email,
          password: result.password, // Le mot de passe doit être fourni lors de la création
          role: result.role,
          status: result.status || 'active'
        };
        
        this.adminService.createUser(userData).subscribe({
          next: (response) => {
            if (response.success) {
              this.toastService.success('Utilisateur créé avec succès');
              this.loadUsers(); // Recharger la liste
            } else {
              this.toastService.error(response.message || 'Erreur lors de la création');
            }
          },
          error: (error) => {
            console.error('Erreur création utilisateur:', error);
            const errorMessage = error.error?.message || error.error?.error || 'Erreur lors de la création de l\'utilisateur';
            this.toastService.error(errorMessage);
          }
        });
      }
    });
  }

  private generateCSV(): string {
    const headers = ['Nom', 'Email', 'Rôle', 'Statut', 'Commandes', 'Total dépensé', 'Date d\'inscription'];
    const rows = this.dataSource.data.map(user => [
      `${user.firstName} ${user.lastName}`,
      user.email,
      this.getRoleLabel(user.role),
      this.getStatusLabel(user.status),
      user.totalOrders.toString(),
      user.totalSpent.toString(),
      user.createdAt.toLocaleDateString('fr-FR')
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  clearFilters(): void {
    this.searchForm.reset();
    // Recharger les données sans filtres
    this.loadUsers();
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'super_admin':
        return 'warn';
      case 'admin':
        return 'primary';
      case 'vendor':
        return 'accent';
      case 'customer':
        return 'primary';
      default:
        return 'primary';
    }
  }
}