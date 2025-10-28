// src/app/features/messages/chat/chat.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService, Message, Conversation } from '../../../core/services/message.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('fileInput') private fileInput!: ElementRef;

  conversationId!: number;
  conversation: Conversation | null = null;
  messages: Message[] = [];
  newMessage = '';
  attachments: File[] = [];
  attachmentPreviews: string[] = [];
  
  loading = false;
  sending = false;
  error: string | null = null;
  currentUserId: string | null = null;
  
  private messagesSubscription?: Subscription;
  private shouldScrollToBottom = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {
    this.currentUserId = localStorage.getItem('user_id');
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.conversationId = +params['id'];
      if (this.conversationId) {
        this.loadConversation();
        this.loadMessages();
        this.subscribeToMessages();
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.messagesSubscription?.unsubscribe();
  }

  loadConversation(): void {
    this.messageService.getConversation(this.conversationId.toString()).subscribe({
      next: (response: any) => {
        this.conversation = response.data;
      },
      error: (error: any) => {
        console.error('Erreur chargement conversation:', error);
        this.error = 'Impossible de charger la conversation';
      }
    });
  }

  loadMessages(): void {
    this.loading = true;
    this.messageService.getMessages(this.conversationId.toString()).subscribe({
      next: (response: any) => {
        this.messages = response.data || [];
        this.shouldScrollToBottom = true;
        this.loading = false;
        
        // Marquer tous les messages comme lus
        this.markAllAsRead();
      },
      error: (error: any) => {
        console.error('Erreur chargement messages:', error);
        this.error = 'Impossible de charger les messages';
        this.loading = false;
      }
    });
  }

  subscribeToMessages(): void {
    this.messagesSubscription = this.messageService.messages$.subscribe({
      next: (messages) => {
        if (messages && messages.length > 0) {
          // Filtrer les messages de cette conversation
          const conversationMessages = messages.filter(m => m.conversation_id === this.conversationId);
          if (conversationMessages.length > 0) {
            this.messages = messages;
            this.shouldScrollToBottom = true;
            this.markAllAsRead();
          }
        }
      }
    });
  }

  sendMessage(): void {
    if ((!this.newMessage.trim() && this.attachments.length === 0) || this.sending) {
      return;
    }

    this.sending = true;
    this.error = null;

    this.messageService.sendMessage(this.conversationId.toString(), this.newMessage.trim(), this.attachments).subscribe({
      next: (response: any) => {
        // Le message sera ajouté via la souscription WebSocket
        this.newMessage = '';
        this.attachments = [];
        this.attachmentPreviews = [];
        this.sending = false;
        this.shouldScrollToBottom = true;
      },
      error: (error: any) => {
        console.error('Erreur envoi message:', error);
        this.error = 'Impossible d\'envoyer le message';
        this.sending = false;
      }
    });
  }

  onEnterPress(event: KeyboardEvent): void {
    if (!event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onFileSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    
    if (this.attachments.length + files.length > 5) {
      this.error = 'Maximum 5 pièces jointes par message';
      return;
    }

    files.forEach(file => {
      // Vérifier la taille (max 5MB par fichier)
      if (file.size > 5 * 1024 * 1024) {
        this.error = `Le fichier ${file.name} est trop volumineux (max 5MB)`;
        return;
      }

      this.attachments.push(file);

      // Créer une prévisualisation pour les images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.attachmentPreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        this.attachmentPreviews.push(''); // Pas de prévisualisation pour les fichiers non-image
      }
    });

    // Réinitialiser l'input file
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  removeAttachment(index: number): void {
    this.attachments.splice(index, 1);
    this.attachmentPreviews.splice(index, 1);
  }

  openFileDialog(): void {
    this.fileInput.nativeElement.click();
  }

  markAllAsRead(): void {
    const unreadMessages = this.messages.filter(m => 
      !m.is_read && m.sender_id.toString() !== this.currentUserId
    );

    if (unreadMessages.length > 0) {
      this.messageService.markConversationAsRead(this.conversationId).subscribe({
        next: () => {
          // Mettre à jour localement
          this.messages = this.messages.map(m => ({
            ...m,
            is_read: true
          }));
        },
        error: (error: any) => {
          console.error('Erreur lors du marquage comme lu:', error);
        }
      });
    }
  }

  closeConversationAction(): void {
    if (!confirm('Êtes-vous sûr de vouloir clôturer cette conversation ?')) {
      return;
    }

    this.messageService.closeConversation(this.conversationId).subscribe({
      next: () => {
        if (this.conversation) {
          this.conversation.status = 'closed';
        }
        alert('Conversation clôturée avec succès');
      },
      error: (error: any) => {
        console.error('Erreur clôture conversation:', error);
        alert('Impossible de clôturer la conversation');
      }
    });
  }

  archiveConversationAction(): void {
    if (!confirm('Êtes-vous sûr de vouloir archiver cette conversation ?')) {
      return;
    }

    this.messageService.archiveConversation(this.conversationId).subscribe({
      next: () => {
        alert('Conversation archivée avec succès');
        this.router.navigate(['/messages']);
      },
      error: (error: any) => {
        console.error('Erreur archivage conversation:', error);
        alert('Impossible d\'archiver la conversation');
      }
    });
  }

  deleteConversation(): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible.')) {
      return;
    }

    // Pour l'instant, rediriger vers la liste (la méthode delete sera ajoutée au backend plus tard)
    alert('Conversation marquée pour suppression');
    this.router.navigate(['/messages']);
  }

  isSentByMe(message: Message): boolean {
    return message.sender_id.toString() === this.currentUserId;
  }

  getOtherParticipant(): { name: string; avatar: string } {
    if (!this.conversation) {
      return { name: 'Utilisateur', avatar: 'assets/images/default-avatar.png' };
    }

    const isBuyer = this.conversation.buyer_id.toString() === this.currentUserId;
    
    return {
      name: isBuyer 
        ? (this.conversation.seller_name || 'Vendeur')
        : (this.conversation.buyer_name || 'Client'),
      avatar: isBuyer
        ? (this.conversation.seller_avatar || 'assets/images/default-avatar.png')
        : (this.conversation.buyer_avatar || 'assets/images/default-avatar.png')
    };
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    }
  }

  shouldShowDateSeparator(index: number): boolean {
    if (index === 0) return true;
    
    const currentDate = new Date(this.messages[index].created_at).toDateString();
    const previousDate = new Date(this.messages[index - 1].created_at).toDateString();
    
    return currentDate !== previousDate;
  }

  getFileName(url: string): string {
    return url.split('/').pop() || 'Fichier';
  }

  isImage(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  }

  downloadAttachment(url: string): void {
    window.open(url, '_blank');
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Erreur scroll:', err);
    }
  }

  goBack(): void {
    this.router.navigate(['/messages']);
  }
}
