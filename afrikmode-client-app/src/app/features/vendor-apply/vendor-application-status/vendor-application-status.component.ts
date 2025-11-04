import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { interval, Subscription, Observable } from 'rxjs';
import { StoreService } from '../../../core/services/store.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { VendorApplicationService, VendorApplication } from '../../../core/services/vendor-application.service';

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

  private applicationService = inject(VendorApplicationService);

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

    const applicationId = this.route.snapshot.queryParams['id'];
    const applicationNumber = this.route.snapshot.queryParams['applicationNumber'];

    let request: Observable<VendorApplication>;
    
    if (applicationId) {
      request = this.applicationService.getApplicationStatus(applicationId);
    } else if (applicationNumber) {
      request = this.applicationService.getApplicationByNumber(applicationNumber);
    } else {
      // Récupérer la candidature actuelle de l'utilisateur
      request = this.applicationService.getApplicationStatus();
    }

    request.subscribe({
      next: (application: VendorApplication) => {
        // Adapter le format de l'API au format du composant
        this.application = {
          id: application.id,
          applicationNumber: application.applicationNumber,
          shopName: application.shopName,
          status: application.status,
          submittedAt: application.submittedAt,
          lastUpdatedAt: application.lastUpdatedAt,
          reviewedBy: application.reviewedBy,
          reviewedAt: application.reviewedAt,
          rejectionReason: application.rejectionReason,
          adminMessages: application.adminMessages || [],
          storeId: application.storeId
        };
        
        this.buildTimeline();
        this.isLoading = false;
        this.error = '';

        // Redémarrer l'auto-refresh si nécessaire
        if (['pending', 'under_review', 'info_required'].includes(this.application.status)) {
          this.startAutoRefresh();
        }
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement du statut:', error);
        this.isLoading = false;
        
        if (error.status === 404) {
          this.error = 'Candidature non trouvée. Vérifiez le numéro de candidature.';
        } else if (error.status === 403) {
          this.error = 'Vous n\'avez pas accès à cette candidature.';
        } else {
          this.error = error.message || 'Erreur lors du chargement du statut. Veuillez réessayer.';
        }

        // En cas d'erreur, on peut quand même afficher une version mockée pour le dev
        // Décommenter la ligne suivante pour le développement
        // this.loadMockApplication();
      }
    });
  }

  // Méthode de fallback avec données mockées (pour développement uniquement)
  private loadMockApplication(): void {
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
    if (!this.application?.adminMessages || !this.application.id) return;
    
    const message = this.application.adminMessages.find(m => m.id === messageId);
    if (message) {
      this.applicationService.markMessageAsRead(this.application.id, messageId).subscribe({
        next: () => {
          message.isRead = true;
        },
        error: (error) => {
          console.error('Erreur lors du marquage du message:', error);
          // Marquer quand même visuellement en cas d'erreur
          message.isRead = true;
        }
      });
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
