// src/app/features/messages/conversations-list/conversations-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MessageService, Conversation } from '../../../core/services/message.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-conversations-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './conversations-list.component.html',
  styleUrls: ['./conversations-list.component.scss']
})
export class ConversationsListComponent implements OnInit, OnDestroy {
  conversations: Conversation[] = [];
  filteredConversations: Conversation[] = [];
  loading = false;
  unreadCount = 0;
  
  // Filtres
  filterStatus: 'all' | 'active' | 'closed' | 'archived' = 'all';
  searchQuery = '';
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 10;

  private conversationsSubscription?: Subscription;
  private unreadCountSubscription?: Subscription;

  constructor(
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadConversations();
    this.subscribeToUpdates();
  }

  ngOnDestroy(): void {
    this.conversationsSubscription?.unsubscribe();
    this.unreadCountSubscription?.unsubscribe();
  }

  loadConversations(): void {
    this.loading = true;
    
    const params: any = {
      page: this.currentPage,
      limit: this.itemsPerPage
    };

    if (this.filterStatus !== 'all') {
      params.status = this.filterStatus;
    }

    this.messageService.getConversations(params).subscribe({
      next: (response: any) => {
        this.conversations = response.data || [];
        this.filteredConversations = this.conversations;
        this.totalPages = response.pagination?.totalPages || 1;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des conversations:', error);
        this.loading = false;
      }
    });
  }

  subscribeToUpdates(): void {
    // S'abonner aux mises à jour en temps réel
    this.conversationsSubscription = this.messageService.conversations$.subscribe({
      next: (conversations: any) => {
        if (conversations && conversations.length > 0) {
          this.conversations = conversations;
          this.applyFilters();
        }
      }
    });

    // S'abonner au compteur de messages non lus
    this.unreadCountSubscription = this.messageService.unreadCount$.subscribe({
      next: (count) => {
        this.unreadCount = count;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.conversations];

    // Filtre par statut
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === this.filterStatus);
    }

    // Filtre par recherche
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.subject?.toLowerCase().includes(query) ||
        c.last_message?.toLowerCase().includes(query) ||
        c.buyer_name?.toLowerCase().includes(query) ||
        c.seller_name?.toLowerCase().includes(query) ||
        c.product_name?.toLowerCase().includes(query)
      );
    }

    this.filteredConversations = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  changeFilter(status: 'all' | 'active' | 'closed' | 'archived'): void {
    this.filterStatus = status;
    this.currentPage = 1;
    this.loadConversations();
  }

  openConversation(conversation: Conversation): void {
    // Marquer les messages comme lus
    if (conversation.unread_count && conversation.unread_count > 0) {
      this.messageService.markConversationAsRead(conversation.id).subscribe();
    }
    
    // Naviguer vers le chat
    this.router.navigate(['/messages', conversation.id]);
  }

  archiveConversation(conversation: Conversation, event: Event): void {
    event.stopPropagation();
    
    if (confirm('Voulez-vous archiver cette conversation ?')) {
      this.messageService.archiveConversation(conversation.id).subscribe({
        next: () => {
          this.loadConversations();
        },
        error: (error: any) => {
          console.error('Erreur lors de l\'archivage:', error);
          alert('Erreur lors de l\'archivage de la conversation');
        }
      });
    }
  }

  closeConversation(conversation: Conversation, event: Event): void {
    event.stopPropagation();
    
    if (confirm('Voulez-vous clôturer cette conversation ?')) {
      this.messageService.closeConversation(conversation.id).subscribe({
        next: () => {
          this.loadConversations();
        },
        error: (error: any) => {
          console.error('Erreur lors de la clôture:', error);
          alert('Erreur lors de la clôture de la conversation');
        }
      });
    }
  }

  deleteConversation(conversation: Conversation, event: Event): void {
    event.stopPropagation();
    
    if (confirm('Voulez-vous supprimer définitivement cette conversation ?')) {
      // Pour l'instant, on archive la conversation (la méthode delete sera ajoutée au backend plus tard)
      this.messageService.archiveConversation(conversation.id).subscribe({
        next: () => {
          alert('Conversation archivée avec succès');
          this.loadConversations();
        },
        error: (error: any) => {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression de la conversation');
        }
      });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Aujourd'hui - afficher l'heure
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadConversations();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadConversations();
    }
  }

  getOtherParticipant(conversation: Conversation): { name: string; avatar: string } {
    // Détermine qui est "l'autre" personne dans la conversation
    const currentUserId = localStorage.getItem('user_id');
    
    if (conversation.buyer_id === currentUserId) {
      return {
        name: conversation.seller_name || 'Vendeur',
        avatar: conversation.seller_avatar || 'assets/images/default-avatar.png'
      };
    } else {
      return {
        name: conversation.buyer_name || 'Client',
        avatar: conversation.buyer_avatar || 'assets/images/default-avatar.png'
      };
    }
  }
}
