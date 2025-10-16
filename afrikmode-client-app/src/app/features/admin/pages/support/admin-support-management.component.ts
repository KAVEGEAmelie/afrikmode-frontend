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
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  category: 'technical' | 'billing' | 'order' | 'product' | 'general' | 'complaint';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'pending_customer' | 'resolved' | 'closed';
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  tags: string[];
  attachments: string[];
  messages: TicketMessage[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  satisfactionRating?: number;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  sender: {
    id: string;
    name: string;
    type: 'customer' | 'agent' | 'system';
  };
  message: string;
  attachments: string[];
  isInternal: boolean;
  createdAt: Date;
}

export interface SupportStats {
  total: number;
  open: number;
  inProgress: number;
  pendingCustomer: number;
  resolved: number;
  closed: number;
  urgent: number;
  averageResolutionTime: number;
  customerSatisfaction: number;
}

@Component({
  selector: 'app-admin-support-management',
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
    MatTabsModule,
    MatBadgeModule,
    MatExpansionModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="support-management">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>Support Client</h1>
          <p>Gérez les tickets de support et l'assistance client</p>
        </div>
        <div class="header-right">
          <button mat-raised-button color="accent" (click)="exportTickets()">
            <mat-icon>download</mat-icon>
            Exporter
          </button>
          <button mat-raised-button color="primary" (click)="createTicket()">
            <mat-icon>add</mat-icon>
            Nouveau ticket
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-cards">
        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <mat-icon>support_agent</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ supportStats.total }}</div>
              <div class="stat-label">Total tickets</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon open">
              <mat-icon>inbox</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ supportStats.open }}</div>
              <div class="stat-label">Ouverts</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon in-progress">
              <mat-icon>hourglass_empty</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ supportStats.inProgress }}</div>
              <div class="stat-label">En cours</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon urgent">
              <mat-icon>priority_high</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ supportStats.urgent }}</div>
              <div class="stat-label">Urgents</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon resolved">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ supportStats.resolved }}</div>
              <div class="stat-label">Résolus</div>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon satisfaction">
              <mat-icon>sentiment_satisfied</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ supportStats.customerSatisfaction }}%</div>
              <div class="stat-label">Satisfaction</div>
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
              <input matInput [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="N° ticket, sujet, client...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="status-field">
              <mat-label>Statut</mat-label>
              <mat-select [(ngModel)]="selectedStatus" (selectionChange)="applyFilters()">
                <mat-option value="">Tous les statuts</mat-option>
                <mat-option value="open">Ouvert</mat-option>
                <mat-option value="in_progress">En cours</mat-option>
                <mat-option value="pending_customer">En attente client</mat-option>
                <mat-option value="resolved">Résolu</mat-option>
                <mat-option value="closed">Fermé</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="priority-field">
              <mat-label>Priorité</mat-label>
              <mat-select [(ngModel)]="selectedPriority" (selectionChange)="applyFilters()">
                <mat-option value="">Toutes les priorités</mat-option>
                <mat-option value="low">Faible</mat-option>
                <mat-option value="medium">Moyenne</mat-option>
                <mat-option value="high">Élevée</mat-option>
                <mat-option value="urgent">Urgente</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="category-field">
              <mat-label>Catégorie</mat-label>
              <mat-select [(ngModel)]="selectedCategory" (selectionChange)="applyFilters()">
                <mat-option value="">Toutes les catégories</mat-option>
                <mat-option value="technical">Technique</mat-option>
                <mat-option value="billing">Facturation</mat-option>
                <mat-option value="order">Commande</mat-option>
                <mat-option value="product">Produit</mat-option>
                <mat-option value="general">Général</mat-option>
                <mat-option value="complaint">Plainte</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-button (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
              Effacer
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Tickets Table -->
      <mat-card class="table-card">
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="filteredTickets" matSort class="tickets-table">
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

              <!-- Ticket Column -->
              <ng-container matColumnDef="ticket">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Ticket</th>
                <td mat-cell *matCellDef="let ticket">
                  <div class="ticket-info">
                    <div class="ticket-number">#{{ ticket.ticketNumber }}</div>
                    <div class="ticket-subject">{{ ticket.subject }}</div>
                    <div class="ticket-date">{{ ticket.createdAt | date:'short' }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Customer Column -->
              <ng-container matColumnDef="customer">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Client</th>
                <td mat-cell *matCellDef="let ticket">
                  <div class="customer-info">
                    <div class="customer-name">{{ ticket.customer.name }}</div>
                    <div class="customer-email">{{ ticket.customer.email }}</div>
                    <div class="customer-phone">{{ ticket.customer.phone }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Category Column -->
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Catégorie</th>
                <td mat-cell *matCellDef="let ticket">
                  <mat-chip [ngClass]="'category-' + ticket.category">
                    {{ getCategoryLabel(ticket.category) }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Priority Column -->
              <ng-container matColumnDef="priority">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Priorité</th>
                <td mat-cell *matCellDef="let ticket">
                  <mat-chip [ngClass]="'priority-' + ticket.priority">
                    {{ getPriorityLabel(ticket.priority) }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
                <td mat-cell *matCellDef="let ticket">
                  <mat-chip [ngClass]="'status-' + ticket.status">
                    {{ getStatusLabel(ticket.status) }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Assigned To Column -->
              <ng-container matColumnDef="assignedTo">
                <th mat-header-cell *matHeaderCellDef>Assigné à</th>
                <td mat-cell *matCellDef="let ticket">
                  <div class="assigned-info" *ngIf="ticket.assignedTo; else unassigned">
                    <div class="agent-name">{{ ticket.assignedTo.name }}</div>
                    <div class="agent-email">{{ ticket.assignedTo.email }}</div>
                  </div>
                  <ng-template #unassigned>
                    <span class="unassigned">Non assigné</span>
                  </ng-template>
                </td>
              </ng-container>

              <!-- Messages Column -->
              <ng-container matColumnDef="messages">
                <th mat-header-cell *matHeaderCellDef>Messages</th>
                <td mat-cell *matCellDef="let ticket">
                  <div class="messages-info">
                    <div class="message-count">
                      <mat-icon>message</mat-icon>
                      {{ ticket.messages.length }}
                    </div>
                    <div class="last-message" *ngIf="ticket.messages.length > 0">
                      {{ ticket.messages[ticket.messages.length - 1].createdAt | date:'short' }}
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let ticket">
                  <button mat-icon-button [matMenuTriggerFor]="ticketMenu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #ticketMenu="matMenu">
                    <button mat-menu-item (click)="viewTicket(ticket)">
                      <mat-icon>visibility</mat-icon>
                      <span>Voir détails</span>
                    </button>
                    <button mat-menu-item (click)="replyTicket(ticket)">
                      <mat-icon>reply</mat-icon>
                      <span>Répondre</span>
                    </button>
                    <button mat-menu-item (click)="assignTicket(ticket)">
                      <mat-icon>person_add</mat-icon>
                      <span>Assigner</span>
                    </button>
                    <button mat-menu-item (click)="updateStatus(ticket)">
                      <mat-icon>update</mat-icon>
                      <span>Changer statut</span>
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item (click)="closeTicket(ticket)">
                      <mat-icon>close</mat-icon>
                      <span>Fermer</span>
                    </button>
                    <button mat-menu-item (click)="deleteTicket(ticket)" class="danger">
                      <mat-icon>delete</mat-icon>
                      <span>Supprimer</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                  (click)="viewTicket(row)" class="clickable-row"></tr>
            </table>

            <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]" 
                           showFirstLastButtons
                           [length]="totalTickets"
                           [pageSize]="pageSize"
                           (page)="onPageChange($event)">
            </mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./admin-support-management.component.scss']
})
export class AdminSupportManagementComponent implements OnInit {
  displayedColumns: string[] = ['select', 'ticket', 'customer', 'category', 'priority', 'status', 'assignedTo', 'messages', 'actions'];
  tickets: SupportTicket[] = [];
  filteredTickets: SupportTicket[] = [];
  supportStats: SupportStats = {
    total: 0,
    open: 0,
    inProgress: 0,
    pendingCustomer: 0,
    resolved: 0,
    closed: 0,
    urgent: 0,
    averageResolutionTime: 0,
    customerSatisfaction: 0
  };

  // Filters
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedPriority: string = '';
  selectedCategory: string = '';

  // Pagination
  pageSize: number = 25;
  totalTickets: number = 0;
  currentPage: number = 0;

  // Selection
  selection = new Set<SupportTicket>();

  loading = true;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  private loadTickets(): void {
    this.loading = true;
    
    setTimeout(() => {
      this.tickets = this.generateMockTickets();
      this.filteredTickets = [...this.tickets];
      this.calculateStats();
      this.loading = false;
    }, 1000);
  }

  private generateMockTickets(): SupportTicket[] {
    const tickets: SupportTicket[] = [];
    const statuses: SupportTicket['status'][] = ['open', 'in_progress', 'pending_customer', 'resolved', 'closed'];
    const priorities: SupportTicket['priority'][] = ['low', 'medium', 'high', 'urgent'];
    const categories: SupportTicket['category'][] = ['technical', 'billing', 'order', 'product', 'general', 'complaint'];
    const agents = [
      { id: 'agent-1', name: 'Agent Support 1', email: 'agent1@afrikmode.com' },
      { id: 'agent-2', name: 'Agent Support 2', email: 'agent2@afrikmode.com' },
      { id: 'agent-3', name: 'Agent Support 3', email: 'agent3@afrikmode.com' }
    ];
    
    for (let i = 1; i <= 50; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const assignedAgent = Math.random() > 0.3 ? agents[Math.floor(Math.random() * agents.length)] : undefined;
      
      const messageCount = Math.floor(Math.random() * 10) + 1;
      const messages: TicketMessage[] = [];
      
      for (let j = 1; j <= messageCount; j++) {
        const isCustomerMessage = j === 1 || Math.random() > 0.5;
        messages.push({
          id: `msg-${i}-${j}`,
          ticketId: `ticket-${i}`,
          sender: {
            id: isCustomerMessage ? `customer-${i}` : `agent-${j}`,
            name: isCustomerMessage ? `Client ${i}` : `Agent ${j}`,
            type: isCustomerMessage ? 'customer' : 'agent'
          },
          message: `Message ${j} pour le ticket ${i}`,
          attachments: Math.random() > 0.8 ? [`attachment-${j}.pdf`] : [],
          isInternal: false,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        });
      }
      
      tickets.push({
        id: `ticket-${i}`,
        ticketNumber: `TKT-${String(i).padStart(6, '0')}`,
        subject: `Sujet du ticket ${i}`,
        description: `Description détaillée du ticket ${i}`,
        customer: {
          id: `customer-${i}`,
          name: `Client ${i}`,
          email: `client${i}@example.com`,
          phone: `+228${Math.floor(Math.random() * 90000000) + 10000000}`
        },
        category,
        priority,
        status,
        assignedTo: assignedAgent,
        tags: [`tag-${i}`, `category-${category}`],
        attachments: Math.random() > 0.7 ? [`attachment-${i}.pdf`, `screenshot-${i}.png`] : [],
        messages,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        resolvedAt: status === 'resolved' || status === 'closed' ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
        closedAt: status === 'closed' ? new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000) : undefined,
        satisfactionRating: status === 'closed' ? Math.floor(Math.random() * 3) + 3 : undefined
      });
    }
    
    return tickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  private calculateStats(): void {
    this.supportStats = {
      total: this.tickets.length,
      open: this.tickets.filter(t => t.status === 'open').length,
      inProgress: this.tickets.filter(t => t.status === 'in_progress').length,
      pendingCustomer: this.tickets.filter(t => t.status === 'pending_customer').length,
      resolved: this.tickets.filter(t => t.status === 'resolved').length,
      closed: this.tickets.filter(t => t.status === 'closed').length,
      urgent: this.tickets.filter(t => t.priority === 'urgent').length,
      averageResolutionTime: 24, // heures
      customerSatisfaction: 85 // pourcentage
    };
  }

  applyFilters(): void {
    this.filteredTickets = this.tickets.filter(ticket => {
      const matchesSearch = !this.searchTerm || 
        ticket.ticketNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        ticket.customer.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        ticket.customer.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || ticket.status === this.selectedStatus;
      const matchesPriority = !this.selectedPriority || ticket.priority === this.selectedPriority;
      const matchesCategory = !this.selectedCategory || ticket.category === this.selectedCategory;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
    
    this.totalTickets = this.filteredTickets.length;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.selectedCategory = '';
    this.applyFilters();
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.filteredTickets.forEach(ticket => this.selection.add(ticket));
    }
  }

  isAllSelected(): boolean {
    return this.selection.size === this.filteredTickets.length;
  }

  hasValue(): boolean {
    return this.selection.size > 0;
  }

  toggle(ticket: SupportTicket): void {
    if (this.selection.has(ticket)) {
      this.selection.delete(ticket);
    } else {
      this.selection.add(ticket);
    }
  }

  isSelected(ticket: SupportTicket): boolean {
    return this.selection.has(ticket);
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'technical': 'Technique',
      'billing': 'Facturation',
      'order': 'Commande',
      'product': 'Produit',
      'general': 'Général',
      'complaint': 'Plainte'
    };
    return labels[category] || category;
  }

  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      'low': 'Faible',
      'medium': 'Moyenne',
      'high': 'Élevée',
      'urgent': 'Urgente'
    };
    return labels[priority] || priority;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'open': 'Ouvert',
      'in_progress': 'En cours',
      'pending_customer': 'En attente client',
      'resolved': 'Résolu',
      'closed': 'Fermé'
    };
    return labels[status] || status;
  }

  exportTickets(): void {
    console.log('Exporter tickets');
  }

  createTicket(): void {
    console.log('Créer nouveau ticket');
  }

  viewTicket(ticket: SupportTicket): void {
    console.log('Voir ticket:', ticket);
  }

  replyTicket(ticket: SupportTicket): void {
    console.log('Répondre au ticket:', ticket);
  }

  assignTicket(ticket: SupportTicket): void {
    console.log('Assigner ticket:', ticket);
  }

  updateStatus(ticket: SupportTicket): void {
    console.log('Changer statut ticket:', ticket);
  }

  closeTicket(ticket: SupportTicket): void {
    console.log('Fermer ticket:', ticket);
  }

  deleteTicket(ticket: SupportTicket): void {
    console.log('Supprimer ticket:', ticket);
  }
}














