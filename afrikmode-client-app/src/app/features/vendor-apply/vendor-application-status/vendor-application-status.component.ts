import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { StoreService } from '../../../core/services/store.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

interface ApplicationStatus {
  id: string;
  applicationNumber: string;
  shopName: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'info_required';
  submittedAt: string;
  lastUpdatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  adminMessages?: AdminMessage[];
  storeId?: string;
}

interface AdminMessage {
  id: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
}

interface TimelineItem {
  status: string;
  label: string;
  description: string;
  date?: string;
  icon: string;
  color: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

@Component({
  selector: 'app-vendor-application-status',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, RouterModule],
  templateUrl: './vendor-application-status.component.html',
  styleUrl: './vendor-application-status.component.scss'
})
export class VendorApplicationStatusComponent implements OnInit, OnDestroy {
  application: ApplicationStatus | null = null;
  isLoading: boolean = true;
  error: string = '';
  
  timelineItems: TimelineItem[] = [];
  
  private refreshSubscription?: Subscription;
  private readonly REFRESH_INTERVAL = 30000; // 30 secondes

  statusConfig = {
    pending: {
      title: 'En Attente',
      description: 'Votre candidature a été reçue et est en attente d\'examen',
      color: '#FFA726',
      icon: 'clock',
      canEdit: true
    },
    under_review: {
      title: 'En Cours d\'Examen',
      description: 'Notre équipe examine actuellement votre dossier',
      color: '#42A5F5',
      icon: 'search',
      canEdit: false
    },
    info_required: {
      title: 'Informations Requises',
      description: 'Des informations supplémentaires sont nécessaires',
      color: '#FF7043',
      icon: 'alert',
      canEdit: true
    },
    approved: {
      title: 'Approuvée',
      description: 'Félicitations ! Votre boutique a été approuvée',
      color: '#66BB6A',
      icon: 'check',
      canEdit: false
    },
    rejected: {
      title: 'Rejetée',
      description: 'Votre candidature n\'a pas été approuvée',
      color: '#EF5350',
      icon: 'close',
      canEdit: false
    }
  };

  constructor(
    private storeService: StoreService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadApplicationStatus();
    this.startAutoRefresh();
    
    window.scrollTo(0, 0);
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  loadApplicationStatus(): void {
    this.isLoading = true;
    this.error = '';

    // Simuler la récupération du statut (à remplacer par un vrai appel API)
    // Dans un vrai scénario, appeler: this.storeService.getApplicationStatus()
    
    // Pour l'instant, simulons avec des données mockées
    setTimeout(() => {
      const mockApplication: ApplicationStatus = {
        id: '123',
        applicationNumber: this.route.snapshot.queryParams['applicationNumber'] || 'VA-20251021-0001',
        shopName: 'Ma Boutique Africaine',
        status: 'under_review',
        submittedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        adminMessages: [
          {
            id: '1',
            message: 'Votre candidature a été reçue avec succès. Notre équipe l\'examine actuellement.',
            createdAt: new Date().toISOString(),
            isRead: true,
            type: 'success'
          }
        ]
      };

      this.application = mockApplication;
      this.buildTimeline();
      this.isLoading = false;
    }, 1000);
  }

  buildTimeline(): void {
    if (!this.application) return;

    const allSteps: TimelineItem[] = [
      {
        status: 'submitted',
        label: 'Candidature soumise',
        description: 'Votre demande a été enregistrée',
        date: this.application.submittedAt,
        icon: 'send',
        color: '#66BB6A',
        isCompleted: true,
        isCurrent: false
      },
      {
        status: 'under_review',
        label: 'En cours d\'examen',
        description: 'Notre équipe vérifie votre dossier',
        date: this.application.status === 'under_review' ? this.application.lastUpdatedAt : undefined,
        icon: 'search',
        color: '#42A5F5',
        isCompleted: ['under_review', 'info_required', 'approved', 'rejected'].includes(this.application.status),
        isCurrent: this.application.status === 'under_review'
      },
      {
        status: 'decision',
        label: 'Décision',
        description: this.application.status === 'approved' 
          ? 'Candidature approuvée' 
          : this.application.status === 'rejected'
          ? 'Candidature rejetée'
          : 'En attente de décision',
        date: this.application.reviewedAt,
        icon: this.application.status === 'approved' ? 'check' : this.application.status === 'rejected' ? 'close' : 'hourglass',
        color: this.application.status === 'approved' ? '#66BB6A' : this.application.status === 'rejected' ? '#EF5350' : '#FFA726',
        isCompleted: ['approved', 'rejected'].includes(this.application.status),
        isCurrent: ['approved', 'rejected'].includes(this.application.status)
      }
    ];

    // Si info requise, insérer une étape supplémentaire
    if (this.application.status === 'info_required') {
      allSteps.splice(2, 0, {
        status: 'info_required',
        label: 'Informations requises',
        description: 'Veuillez fournir des informations supplémentaires',
        date: this.application.lastUpdatedAt,
        icon: 'alert',
        color: '#FF7043',
        isCompleted: false,
        isCurrent: true
      });
    }

    this.timelineItems = allSteps;
  }

  startAutoRefresh(): void {
    // Rafraîchir automatiquement toutes les 30 secondes si status est pending ou under_review
    if (this.application && ['pending', 'under_review', 'info_required'].includes(this.application.status)) {
      this.refreshSubscription = interval(this.REFRESH_INTERVAL).subscribe(() => {
        this.loadApplicationStatus();
      });
    }
  }

  stopAutoRefresh(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  manualRefresh(): void {
    this.toastService.info('Actualisation...');
    this.loadApplicationStatus();
  }

  editApplication(): void {
    if (this.application && this.statusConfig[this.application.status].canEdit) {
      this.router.navigate(['/vendor/apply'], {
        queryParams: { edit: true, id: this.application.id }
      });
    }
  }

  goToDashboard(): void {
    if (this.application?.storeId) {
      this.router.navigate(['/vendor/dashboard']);
    }
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  markMessageAsRead(messageId: string): void {
    if (!this.application?.adminMessages) return;
    
    const message = this.application.adminMessages.find(m => m.id === messageId);
    if (message) {
      message.isRead = true;
      // Ici, appeler l'API pour marquer comme lu
      // this.storeService.markMessageAsRead(messageId).subscribe();
    }
  }

  getStatusIcon(): string {
    if (!this.application) return 'clock';
    return this.statusConfig[this.application.status].icon;
  }

  getStatusColor(): string {
    if (!this.application) return '#FFA726';
    return this.statusConfig[this.application.status].color;
  }

  getStatusTitle(): string {
    if (!this.application) return '';
    return this.statusConfig[this.application.status].title;
  }

  getStatusDescription(): string {
    if (!this.application) return '';
    return this.statusConfig[this.application.status].description;
  }

  canEdit(): boolean {
    if (!this.application) return false;
    return this.statusConfig[this.application.status].canEdit;
  }

  isApproved(): boolean {
    return this.application?.status === 'approved';
  }

  isRejected(): boolean {
    return this.application?.status === 'rejected';
  }

  isPending(): boolean {
    return this.application?.status === 'pending' || this.application?.status === 'under_review';
  }

  needsInfo(): boolean {
    return this.application?.status === 'info_required';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getUnreadMessagesCount(): number {
    if (!this.application?.adminMessages) return 0;
    return this.application.adminMessages.filter(m => !m.isRead).length;
  }
}
