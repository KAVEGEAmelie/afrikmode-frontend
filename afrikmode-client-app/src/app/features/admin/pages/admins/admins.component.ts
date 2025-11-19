// src/app/features/admin/pages/admins/admins.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';

interface Admin {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  status: 'active' | 'inactive';
  lastLogin: Date;
  createdAt: Date;
  avatar?: string;
}

@Component({
  selector: 'app-admins',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatDividerModule,
    FormsModule
  ],
  templateUrl: './admins.component.html',
  styleUrls: ['./admins.component.scss']
})
export class AdminsComponent implements OnInit {
  displayedColumns: string[] = ['avatar', 'name', 'email', 'role', 'permissions', 'status', 'lastLogin', 'actions'];
  
  admins: Admin[] = [];
  filteredAdmins: Admin[] = [];
  searchQuery: string = '';
  filterRole: string = 'all';
  isLoading = false;

  stats = {
    total: 0,
    superAdmins: 0,
    admins: 0,
    moderators: 0
  };

  constructor(
    private dialog: MatDialog,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.isLoading = true;
    
    const params: any = {
      role: this.filterRole !== 'all' ? this.filterRole : undefined,
      page: 1,
      limit: 100
    };

    // Filtrer seulement les admins (super_admin, admin, moderator)
    if (!params.role) {
      // Charger tous les utilisateurs avec rôles admin
      params.roles = ['super_admin', 'admin', 'moderator'];
    }

    if (this.searchQuery) {
      params.search = this.searchQuery;
    }

    this.adminService.getUsers(params).subscribe({
      next: (response: any) => {
        const usersData = response.data || [];
        // Filtrer seulement les admins
        const adminUsers = usersData.filter((user: any) => 
          ['super_admin', 'admin', 'moderator'].includes(user.role)
        );
        
        this.admins = adminUsers.map((user: any) => {
          // Fonction helper pour parser une date de manière sécurisée
          const parseDate = (dateValue: any): Date => {
            if (!dateValue) return new Date();
            if (dateValue instanceof Date) {
              return isNaN(dateValue.getTime()) ? new Date() : dateValue;
            }
            if (typeof dateValue === 'string') {
              const date = new Date(dateValue);
              return isNaN(date.getTime()) ? new Date() : date;
            }
            return new Date();
          };

          return {
            id: parseInt(user.id) || user.id,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || 'N/A',
            email: user.email || '',
            role: user.role || 'admin',
            permissions: user.permissions || [],
            status: user.status === 'active' ? 'active' : 'inactive',
            lastLogin: parseDate(user.last_login),
            createdAt: parseDate(user.created_at),
            avatar: user.avatar_url || user.profile_picture
          };
        });

        // Calculer les stats
        this.stats.total = this.admins.length;
        this.stats.superAdmins = this.admins.filter(a => a.role === 'super_admin').length;
        this.stats.admins = this.admins.filter(a => a.role === 'admin').length;
        this.stats.moderators = this.admins.filter(a => a.role === 'moderator').length;

        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement admins:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    // Recharger depuis l'API si recherche ou filtre change
    if (this.searchQuery || this.filterRole !== 'all') {
      this.loadAdmins();
    } else {
      this.filteredAdmins = [...this.admins];
    }
  }

  addAdmin(): void {
    console.log('Add new admin');
    // TODO: Open add admin dialog
  }

  viewAdmin(admin: Admin): void {
    console.log('View admin:', admin);
  }

  editAdmin(admin: Admin): void {
    console.log('Edit admin:', admin);
  }

  editPermissions(admin: Admin): void {
    console.log('Edit permissions:', admin);
  }

  suspendAdmin(admin: Admin): void {
    console.log('Suspend admin:', admin);
  }

  deleteAdmin(admin: Admin): void {
    console.log('Delete admin:', admin);
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'super_admin': 'Super Admin',
      'admin': 'Administrateur',
      'moderator': 'Modérateur'
    };
    return labels[role] || role;
  }

  getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      'super_admin': 'error',
      'admin': 'primary',
      'moderator': 'accent'
    };
    return colors[role] || 'default';
  }

  getStatusColor(status: string): string {
    return status === 'active' ? 'success' : 'warning';
  }

  getStatusLabel(status: string): string {
    return status === 'active' ? 'Actif' : 'Inactif';
  }
}
