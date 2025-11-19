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
    const applicationNumber = this.route.snapshot.queryParams['number'] || this.route.snapshot.queryParams['applicationNumber'];

    console.log('🔍 Chargement candidature avec params:', { applicationId, applicationNumber });

    // Si on a un numéro de candidature, utiliser l'endpoint stores/application/:number
    if (applicationNumber) {
      console.log('📥 Récupération via numéro de candidature:', applicationNumber);
      this.storeService.getStoreApplicationByNumber(applicationNumber).subscribe({
        next: (response) => {
          console.log('✅ Réponse API stores/application:', response);
          if (response.success && response.data) {
            const data = response.data;
            // Adapter le format de l'API au format du composant
            // Le backend retourne createdAt et updatedAt, mais peut aussi retourner submittedAt
            // Fonction helper pour normaliser une date en string ISO valide
            const normalizeDate = (dateValue: any): string | null => {
              // Si null, undefined, ou objet vide, retourner null
              if (!dateValue || (typeof dateValue === 'object' && Object.keys(dateValue).length === 0)) {
                return null;
              }
              
              // Si c'est déjà une string valide
              if (typeof dateValue === 'string' && dateValue.trim() !== '') {
                const testDate = new Date(dateValue);
                if (!isNaN(testDate.getTime())) {
                  return testDate.toISOString();
                }
              }
              
              // Si c'est un objet Date
              if (dateValue instanceof Date) {
                if (!isNaN(dateValue.getTime())) {
                  return dateValue.toISOString();
                }
                return null;
              }
              
              // Si c'est un objet (mais pas Date), essayer de le convertir
              if (typeof dateValue === 'object' && dateValue !== null) {
                // Vérifier si c'est un objet Date sérialisé avec toISOString
                if ('toISOString' in dateValue && typeof (dateValue as any).toISOString === 'function') {
                  try {
                    return (dateValue as Date).toISOString();
                  } catch (e) {
                    return null;
                  }
                }
                // Sinon, essayer de convertir en string puis en Date
                try {
                  const dateStr = String(dateValue);
                  if (dateStr === '[object Object]' || dateStr === '{}') {
                    return null; // Objet vide, pas de date valide
                  }
                  const parsedDate = new Date(dateStr);
                  if (!isNaN(parsedDate.getTime())) {
                    return parsedDate.toISOString();
                  }
                } catch (e) {
                  return null;
                }
              }
              
              return null;
            };
            
            // Normaliser les dates
            let submittedAt = normalizeDate((data as any).submittedAt) || normalizeDate(data.createdAt);
            let updatedAt = normalizeDate(data.updatedAt) || submittedAt;
            
            // Si toujours pas de dates valides, utiliser la date actuelle comme fallback
            if (!submittedAt) {
              console.warn('⚠️ Aucune date de soumission valide trouvée, utilisation de la date actuelle');
              submittedAt = new Date().toISOString();
            }
            if (!updatedAt) {
              console.warn('⚠️ Aucune date de mise à jour valide trouvée, utilisation de submittedAt');
              updatedAt = submittedAt;
            }
            
            console.log('📅 Dates finales normalisées:', { submittedAt, updatedAt });
            
            this.application = {
              id: data.id,
              applicationNumber: data.applicationNumber,
              shopName: data.name,
              status: this.mapStoreStatusToApplicationStatus(data.status),
              submittedAt: submittedAt,
              lastUpdatedAt: updatedAt,
              reviewedBy: undefined,
              reviewedAt: undefined,
              rejectionReason: undefined,
              adminMessages: [],
              storeId: data.id
            };
            
            this.buildTimeline();
            this.isLoading = false;
            this.error = '';

            // Redémarrer l'auto-refresh si nécessaire
            if (['pending', 'under_review', 'info_required'].includes(this.application.status)) {
              this.startAutoRefresh();
            }
          } else {
            this.isLoading = false;
            this.error = 'Candidature non trouvée.';
          }
        },
        error: (error: any) => {
          console.error('❌ Erreur lors du chargement du statut:', error);
          this.isLoading = false;
          
          if (error.status === 404) {
            this.error = 'Candidature non trouvée. Vérifiez le numéro de candidature.';
          } else if (error.status === 403) {
            this.error = 'Vous n\'avez pas accès à cette candidature.';
          } else {
            this.error = error.error?.message || error.message || 'Erreur lors du chargement du statut. Veuillez réessayer.';
          }
        }
      });
      return;
    }

    // Sinon, utiliser l'ancien service pour compatibilité
    let request: Observable<VendorApplication>;
    
    if (applicationId) {
      request = this.applicationService.getApplicationStatus(applicationId);
    } else {
      // Récupérer la candidature actuelle de l'utilisateur
      console.log('📥 Récupération de la candidature de l\'utilisateur connecté');
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

  /**
   * Mapper le statut de la boutique vers le statut de candidature
   */
  private mapStoreStatusToApplicationStatus(storeStatus: string): 'pending' | 'under_review' | 'approved' | 'rejected' | 'info_required' {
    switch (storeStatus) {
      case 'pending':
        return 'pending';
      case 'active':
        return 'approved';
      case 'suspended':
      case 'closed':
        return 'rejected';
      default:
        return 'pending';
    }
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
      console.log('✏️ Navigation vers édition avec ID:', this.application.id);
      this.router.navigate(['/vendor/apply'], {
        queryParams: { edit: 'true', id: this.application.id }
      }).then(
        (success) => {
          if (success) {
            console.log('✅ Navigation réussie vers /vendor/apply');
          } else {
            console.error('❌ Navigation échouée vers /vendor/apply');
          }
        },
        (error) => {
          console.error('❌ Erreur navigation:', error);
        }
      );
    } else {
      console.warn('⚠️ Impossible de modifier: application ou canEdit invalide', {
        hasApplication: !!this.application,
        status: this.application?.status,
        canEdit: this.application ? this.statusConfig[this.application.status]?.canEdit : false
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

  formatDate(dateString: string | Date | undefined | null): string {
    // Si null, undefined, ou string vide
    if (!dateString) {
      return 'Date non disponible';
    }
    
    // Si c'est une string vide après trim
    if (typeof dateString === 'string' && dateString.trim() === '') {
      return 'Date non disponible';
    }
    
    try {
      let date: Date | null = null;
      
      // Si c'est déjà un objet Date valide
      if (dateString instanceof Date) {
        if (!isNaN(dateString.getTime())) {
          date = dateString;
        }
      } 
      // Si c'est une string
      else if (typeof dateString === 'string') {
        const trimmed = dateString.trim();
        
        // Vérifier si c'est une string invalide
        if (trimmed === '' || trimmed === '[object Object]' || trimmed === '{}' || trimmed === 'null' || trimmed === 'undefined') {
          return 'Date non disponible';
        }
        
        // Essayer de parser directement
        date = new Date(trimmed);
        
        // Si invalide, essayer d'autres formats
        if (isNaN(date.getTime())) {
          // Format ISO sans millisecondes: "2025-11-14T20:58:31" -> "2025-11-14T20:58:31Z"
          if (trimmed.includes('T') && !trimmed.includes('Z') && !trimmed.includes('+')) {
            date = new Date(trimmed + 'Z');
          }
          // Format avec espace: "2025-11-14 20:58:31" -> "2025-11-14T20:58:31Z"
          else if (trimmed.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)) {
            date = new Date(trimmed.replace(' ', 'T') + 'Z');
          }
          // Format timestamp
          else if (/^\d+$/.test(trimmed)) {
            date = new Date(parseInt(trimmed));
          }
        }
      }
      // Si c'est un objet (mais pas Date)
      else if (typeof dateString === 'object' && dateString !== null) {
        // Vérifier si c'est un objet vide
        if (Object.keys(dateString).length === 0) {
          return 'Date non disponible';
        }
        
        // Si l'objet a une méthode toISOString (Date sérialisée)
        if ('toISOString' in dateString && typeof (dateString as any).toISOString === 'function') {
          try {
            date = dateString as Date;
            if (isNaN(date.getTime())) {
              date = null;
            }
          } catch (e) {
            date = null;
          }
        }
        // Sinon, essayer de convertir en string puis en Date
        else {
          const dateStr = String(dateString);
          if (dateStr !== '[object Object]' && dateStr !== '{}') {
            date = new Date(dateStr);
            if (isNaN(date.getTime())) {
              date = null;
            }
          }
        }
      }
      
      // Si on n'a toujours pas de date valide
      if (!date || isNaN(date.getTime())) {
        return 'Date non disponible';
      }
      
      // Formater la date en français
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    } catch (error) {
      console.error('❌ Erreur formatage date:', error, dateString);
      return 'Date non disponible';
    }
  }

  getUnreadMessagesCount(): number {
    if (!this.application?.adminMessages) return 0;
    return this.application.adminMessages.filter(m => !m.isRead).length;
  }
}
