// src/app/features/admin/pages/clients/clients.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  orders: number;
  totalSpent: number;
  registeredAt: Date;
  avatar?: string;
}

@Component({
  selector: 'app-admin-clients',
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
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    FormsModule
  ],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
  displayedColumns: string[] = ['avatar', 'name', 'email', 'phone', 'orders', 'totalSpent', 'status', 'registeredAt', 'actions'];
  
  clients: Client[] = [];
  filteredClients: Client[] = [];
  searchQuery: string = '';
  filterStatus: string = 'all';
  isLoading = false;

  // Stats
  stats = {
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading = true;
    
    const params: any = {
      role: 'customer',
      page: 1,
      limit: 100
    };

    if (this.filterStatus !== 'all') {
      params.status = this.filterStatus;
    }

    if (this.searchQuery) {
      params.search = this.searchQuery;
    }

    this.adminService.getUsers(params).subscribe({
      next: (response: any) => {
        const usersData = response.data || [];
        this.clients = usersData.map((user: any) => ({
          id: parseInt(user.id) || user.id,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || 'N/A',
          email: user.email || '',
          phone: user.phone || '',
          status: user.status === 'active' ? 'active' : user.status === 'suspended' ? 'suspended' : 'inactive',
          orders: user.stats?.total_orders || 0,
          totalSpent: user.stats?.total_spent || 0,
          registeredAt: user.created_at ? new Date(user.created_at) : new Date(),
          avatar: user.avatar_url || user.profile_picture
        }));

        // Calculer les stats
        this.stats.total = this.clients.length;
        this.stats.active = this.clients.filter(c => c.status === 'active').length;
        this.stats.inactive = this.clients.filter(c => c.status === 'inactive').length;
        this.stats.suspended = this.clients.filter(c => c.status === 'suspended').length;

        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement clients:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    // Recharger depuis l'API si recherche ou filtre change
    if (this.searchQuery || this.filterStatus !== 'all') {
      this.loadClients();
    } else {
      this.filteredClients = [...this.clients];
    }
  }

  viewClient(client: Client): void {
    console.log('View client:', client);
    // TODO: Navigate to client detail page
  }

  editClient(client: Client): void {
    console.log('Edit client:', client);
    // TODO: Open edit dialog
  }

  suspendClient(client: Client): void {
    console.log('Suspend client:', client);
    // TODO: Implement suspension
  }

  deleteClient(client: Client): void {
    console.log('Delete client:', client);
    // TODO: Implement deletion
  }

  exportClients(): void {
    console.log('Export clients');
    // TODO: Implement export
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'active': 'success',
      'inactive': 'warning',
      'suspended': 'error'
    };
    return colors[status] || 'default';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Actif',
      'inactive': 'Inactif',
      'suspended': 'Suspendu'
    };
    return labels[status] || status;
  }
}
