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

// Services (à implémenter plus tard)
// import { UserService } from '../../core/services/user.service';
// import { AuthService } from '../../core/services/auth.service';

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
    private dialog: MatDialog
    // private userService: UserService,
    // private authService: AuthService
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
    this.searchForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  private applyFilters(): void {
    const filters = this.searchForm.value;
    
    this.dataSource.filterPredicate = (data: User, filter: string) => {
      const searchMatch = !filters.search || 
        data.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
        data.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
        data.email.toLowerCase().includes(filters.search.toLowerCase());
      
      const roleMatch = !filters.role || data.role === filters.role;
      const statusMatch = !filters.status || data.status === filters.status;
      
      return searchMatch && roleMatch && statusMatch;
    };
    
    // Forcer le re-filtrage
    this.dataSource.filter = JSON.stringify(filters);
  }

  loadUsers(): void {
    this.loading = true;
    
    // Simuler des données pour l'instant
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
    console.log('Edit user:', user);
    alert(`Modifier l'utilisateur: ${user.firstName} ${user.lastName}`);
    // TODO: Ouvrir dialog d'édition
  }

  deleteUser(user: User): void {
    console.log('Delete user:', user);
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.firstName} ${user.lastName} ?`)) {
      const index = this.dataSource.data.findIndex(u => u.id === user.id);
      if (index > -1) {
        this.dataSource.data.splice(index, 1);
        this.dataSource._updateChangeSubscription();
        alert('Utilisateur supprimé avec succès');
      }
    }
  }

  suspendUser(user: User): void {
    console.log('Suspend user:', user);
    user.status = 'suspended';
    this.dataSource._updateChangeSubscription();
    alert(`Utilisateur ${user.firstName} ${user.lastName} suspendu`);
  }

  activateUser(user: User): void {
    console.log('Activate user:', user);
    user.status = 'active';
    this.dataSource._updateChangeSubscription();
    alert(`Utilisateur ${user.firstName} ${user.lastName} activé`);
  }

  viewUserDetails(user: User): void {
    console.log('View user details:', user);
    alert(`Détails de l'utilisateur:\n\nNom: ${user.firstName} ${user.lastName}\nEmail: ${user.email}\nRôle: ${this.getRoleLabel(user.role)}\nStatut: ${this.getStatusLabel(user.status)}\nCommandes: ${user.totalOrders}\nTotal dépensé: ${user.totalSpent}€`);
  }

  exportUsers(): void {
    console.log('Export users');
    const csvContent = this.generateCSV();
    this.downloadCSV(csvContent, 'utilisateurs.csv');
    alert('Export des utilisateurs en cours...');
  }

  addUser(): void {
    console.log('Add new user');
    alert('Fonctionnalité d\'ajout d\'utilisateur - À implémenter');
    // TODO: Ouvrir dialog d'ajout
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