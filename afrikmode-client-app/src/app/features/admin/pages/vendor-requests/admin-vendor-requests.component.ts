import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminService, VendorRequest } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-admin-vendor-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="vendor-requests-page">
      <!-- En-tête -->
      <div class="page-header">
        <div class="header-content">
          <h1>Demandes de Vendeurs</h1>
          <p class="subtitle">Gérez les nouvelles demandes d'inscription vendeur</p>
        </div>
        <div class="header-actions">
          <div class="stats-chips">
            <div class="stat-chip pending">
              <span class="count">{{ getRequestsByStatus('pending').length }}</span>
              <span class="label">En attente</span>
            </div>
            <div class="stat-chip review">
              <span class="count">{{ getRequestsByStatus('under_review').length }}</span>
              <span class="label">En cours</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="filters-section">
        <div class="filter-group">
          <label>Statut</label>
          <select [(ngModel)]="selectedStatus" (change)="applyFilters()" class="filter-select">
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="under_review">En cours d'examen</option>
            <option value="additional_info_required">Info complémentaire</option>
            <option value="approved">Approuvées</option>
            <option value="rejected">Rejetées</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Trier par</label>
          <select [(ngModel)]="sortBy" (change)="applyFilters()" class="filter-select">
            <option value="date_desc">Plus récentes</option>
            <option value="date_asc">Plus anciennes</option>
            <option value="name_asc">Nom (A-Z)</option>
          </select>
        </div>
        <div class="search-box">
          <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (input)="applyFilters()" 
            placeholder="Rechercher par nom, email, entreprise..."
            class="search-input"
          />
        </div>
      </div>

      <!-- Liste des demandes -->
      <div class="requests-list">
        <div *ngFor="let request of filteredRequests" class="request-card" [class.selected]="selectedRequest?.id === request.id">
          <div class="request-header" (click)="selectRequest(request)">
            <div class="request-info">
              <div class="vendor-avatar">
                {{ request.vendor_name.charAt(0).toUpperCase() }}
              </div>
              <div class="request-details">
                <h3>{{ request.vendor_name }}</h3>
                <p class="business-name">{{ request.business_name }}</p>
                <p class="request-meta">
                  <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  {{ request.email }}
                  <span class="separator">•</span>
                  <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  {{ request.phone }}
                </p>
              </div>
            </div>
            <div class="request-status">
              <span class="status-badge" [class]="request.status">
                {{ getStatusLabel(request.status) }}
              </span>
              <p class="request-date">{{ formatDate(request.submitted_at) }}</p>
            </div>
          </div>

          <!-- Détails expandables -->
          <div *ngIf="selectedRequest?.id === request.id" class="request-expanded">
            <div class="details-grid">
              <!-- Informations entreprise -->
              <div class="detail-section">
                <h4>Informations Entreprise</h4>
                <div class="detail-row">
                  <span class="label">Type d'entreprise:</span>
                  <span class="value">{{ request.business_type }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">ID Fiscale:</span>
                  <span class="value">{{ request.tax_id }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Adresse:</span>
                  <span class="value">{{ request.address }}, {{ request.city }}, {{ request.country }}</span>
                </div>
                <div class="detail-row" *ngIf="request.website">
                  <span class="label">Site web:</span>
                  <a [href]="request.website" target="_blank" class="link">{{ request.website }}</a>
                </div>
              </div>

              <!-- Description -->
              <div class="detail-section full-width">
                <h4>Description de l'activité</h4>
                <p class="description-text">{{ request.description }}</p>
              </div>

              <!-- Documents -->
              <div class="detail-section">
                <h4>Documents fournis</h4>
                <div class="documents-list">
                  <div *ngIf="request.documents.business_registration" class="document-item">
                    <svg class="doc-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <span>Enregistrement commercial</span>
                    <button class="btn-view" (click)="viewDocument(request.documents.business_registration)">Voir</button>
                  </div>
                  <div *ngIf="request.documents.tax_certificate" class="document-item">
                    <svg class="doc-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <span>Certificat fiscal</span>
                    <button class="btn-view" (click)="viewDocument(request.documents.tax_certificate)">Voir</button>
                  </div>
                  <div *ngIf="request.documents.id_card" class="document-item">
                    <svg class="doc-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/>
                    </svg>
                    <span>Pièce d'identité</span>
                    <button class="btn-view" (click)="viewDocument(request.documents.id_card)">Voir</button>
                  </div>
                  <div *ngIf="request.documents.product_samples && request.documents.product_samples.length > 0" class="document-item">
                    <svg class="doc-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span>Échantillons produits ({{ request.documents.product_samples.length }})</span>
                    <button class="btn-view" (click)="viewProductSamples(request.documents.product_samples)">Voir</button>
                  </div>
                </div>
              </div>

              <!-- Notes admin -->
              <div class="detail-section">
                <h4>Notes administratives</h4>
                <textarea 
                  [(ngModel)]="request.notes" 
                  class="notes-textarea"
                  placeholder="Ajoutez des notes internes..."
                  rows="4"
                ></textarea>
              </div>
            </div>

            <!-- Actions -->
            <div class="action-buttons">
              <button 
                class="btn btn-approve" 
                (click)="openApproveModal(request)"
                [disabled]="request.status === 'approved'"
              >
                <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Approuver
              </button>
              <button 
                class="btn btn-info" 
                (click)="openAdditionalInfoModal(request)"
                [disabled]="request.status === 'approved' || request.status === 'rejected'"
              >
                <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Demander info
              </button>
              <button 
                class="btn btn-reject" 
                (click)="openRejectModal(request)"
                [disabled]="request.status === 'approved' || request.status === 'rejected'"
              >
                <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Rejeter
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="filteredRequests.length === 0" class="empty-state">
          <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
          </svg>
          <h3>Aucune demande trouvée</h3>
          <p>Il n'y a aucune demande correspondant à vos critères.</p>
        </div>
      </div>

      <!-- Modal Approbation -->
      <div *ngIf="showApproveModal" class="modal-overlay" (click)="closeModals()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Approuver la demande</h3>
            <button class="btn-close" (click)="closeModals()">&times;</button>
          </div>
          <div class="modal-body">
            <p>Êtes-vous sûr de vouloir approuver la demande de <strong>{{ selectedRequest?.vendor_name }}</strong> ?</p>
            <p class="info-text">Le vendeur recevra un email de confirmation et pourra accéder à son compte.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-cancel" (click)="closeModals()">Annuler</button>
            <button class="btn btn-primary" (click)="approveRequest()">Confirmer l'approbation</button>
          </div>
        </div>
      </div>

      <!-- Modal Rejet -->
      <div *ngIf="showRejectModal" class="modal-overlay" (click)="closeModals()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Rejeter la demande</h3>
            <button class="btn-close" (click)="closeModals()">&times;</button>
          </div>
          <div class="modal-body">
            <p>Raison du rejet <span class="required">*</span></p>
            <textarea 
              [(ngModel)]="rejectionReason" 
              class="rejection-textarea"
              placeholder="Expliquez pourquoi la demande est rejetée..."
              rows="5"
            ></textarea>
          </div>
          <div class="modal-footer">
            <button class="btn btn-cancel" (click)="closeModals()">Annuler</button>
            <button class="btn btn-danger" (click)="rejectRequest()" [disabled]="!rejectionReason">Confirmer le rejet</button>
          </div>
        </div>
      </div>

      <!-- Modal Info Complémentaire -->
      <div *ngIf="showAdditionalInfoModal" class="modal-overlay" (click)="closeModals()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Demander des informations complémentaires</h3>
            <button class="btn-close" (click)="closeModals()">&times;</button>
          </div>
          <div class="modal-body">
            <p>Informations requises <span class="required">*</span></p>
            <textarea 
              [(ngModel)]="additionalInfoRequest" 
              class="rejection-textarea"
              placeholder="Précisez les informations ou documents manquants..."
              rows="5"
            ></textarea>
          </div>
          <div class="modal-footer">
            <button class="btn btn-cancel" (click)="closeModals()">Annuler</button>
            <button class="btn btn-primary" (click)="requestAdditionalInfo()" [disabled]="!additionalInfoRequest">Envoyer la demande</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./admin-vendor-requests.component.scss']
})
export class AdminVendorRequestsComponent implements OnInit {
  // Données
  requests: VendorRequest[] = [];
  filteredRequests: VendorRequest[] = [];
  selectedRequest: VendorRequest | null = null;

  // Filtres
  selectedStatus = 'all';
  sortBy = 'date_desc';
  searchQuery = '';

  // Modales
  showApproveModal = false;
  showRejectModal = false;
  showAdditionalInfoModal = false;
  rejectionReason = '';
  additionalInfoRequest = '';

  // Loading state
  isLoading = false;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.isLoading = true;
    
    this.adminService.getStoreRequests({
      status: this.selectedStatus !== 'all' ? this.selectedStatus : undefined,
      search: this.searchQuery || undefined,
      sortBy: this.sortBy.includes('date') ? 'created_at' : this.sortBy,
      sortOrder: this.sortBy.endsWith('_desc') ? 'desc' : 'asc',
      limit: 50
    }).subscribe({
      next: (response) => {
        this.requests = response.data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement demandes:', error);
        this.isLoading = false;
        // Fallback to mock data for demo
        this.loadMockData();
      }
    });
  }

  loadMockData() {
    // Données de démonstration (fallback)
    this.requests = [
      {
        id: '1',
        vendor_name: 'Fatou Diallo',
        email: 'fatou.diallo@example.com',
        phone: '+221 77 123 45 67',
        business_name: 'Boutique Diallo Mode',
        business_type: 'Entreprise individuelle',
        tax_id: 'SN-2024-00123',
        address: '123 Rue de la République',
        city: 'Dakar',
        country: 'Sénégal',
        website: 'https://diallomode.sn',
        description: 'Spécialisée dans les vêtements traditionnels africains de haute qualité avec des tissus locaux.',
        documents: {
          business_registration: 'doc_123.pdf',
          tax_certificate: 'tax_123.pdf',
          id_card: 'id_123.pdf',
          product_samples: ['sample1.jpg', 'sample2.jpg', 'sample3.jpg']
        },
        status: 'pending',
        submitted_at: '2025-10-15T10:30:00Z'
      },
      {
        id: '2',
        vendor_name: 'Kofi Mensah',
        email: 'kofi.mensah@example.com',
        phone: '+233 24 987 65 43',
        business_name: 'Kente Royale',
        business_type: 'SARL',
        tax_id: 'GH-2024-00456',
        address: '45 Independence Avenue',
        city: 'Accra',
        country: 'Ghana',
        description: 'Production et vente de tissus Kente authentiques, fabriqués de manière artisanale.',
        documents: {
          business_registration: 'doc_456.pdf',
          tax_certificate: 'tax_456.pdf',
          product_samples: ['kente1.jpg', 'kente2.jpg']
        },
        status: 'under_review',
        submitted_at: '2025-10-18T14:20:00Z'
      },
      {
        id: '3',
        vendor_name: 'Aisha Njoroge',
        email: 'aisha@maasaistyle.com',
        phone: '+254 71 234 56 78',
        business_name: 'Maasai Style Collective',
        business_type: 'Coopérative',
        tax_id: 'KE-2024-00789',
        address: '78 Kenyatta Street',
        city: 'Nairobi',
        country: 'Kenya',
        website: 'https://maasaistyle.co.ke',
        description: 'Coopérative de femmes artisanes Maasai spécialisées dans les bijoux et accessoires traditionnels.',
        documents: {
          business_registration: 'doc_789.pdf',
          tax_certificate: 'tax_789.pdf',
          id_card: 'id_789.pdf',
          product_samples: ['jewelry1.jpg', 'jewelry2.jpg', 'jewelry3.jpg', 'jewelry4.jpg']
        },
        status: 'additional_info_required',
        submitted_at: '2025-10-12T09:15:00Z',
        notes: 'Documents incomplets - certificat sanitaire manquant pour les produits cosmétiques'
      }
    ];

    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.requests];

    // Filtre par statut
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(r => r.status === this.selectedStatus);
    }

    // Recherche
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.vendor_name.toLowerCase().includes(query) ||
        r.email.toLowerCase().includes(query) ||
        r.business_name.toLowerCase().includes(query)
      );
    }

    // Tri
    if (this.sortBy === 'date_desc') {
      filtered.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
    } else if (this.sortBy === 'date_asc') {
      filtered.sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime());
    } else if (this.sortBy === 'name_asc') {
      filtered.sort((a, b) => a.vendor_name.localeCompare(b.vendor_name));
    }

    this.filteredRequests = filtered;
  }

  getRequestsByStatus(status: string): VendorRequest[] {
    return this.requests.filter(r => r.status === status);
  }

  selectRequest(request: VendorRequest) {
    this.selectedRequest = this.selectedRequest?.id === request.id ? null : request;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'pending': 'En attente',
      'under_review': 'En cours',
      'approved': 'Approuvée',
      'rejected': 'Rejetée',
      'additional_info_required': 'Info requise'
    };
    return labels[status] || status;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Aujourd\'hui';
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  viewDocument(documentUrl: string) {
    console.log('Voir document:', documentUrl);
    // TODO: Ouvrir le document dans une modale ou un nouvel onglet
    window.open(`/api/documents/${documentUrl}`, '_blank');
  }

  viewProductSamples(samples: string[]) {
    console.log('Voir échantillons:', samples);
    // TODO: Ouvrir une galerie d'images
  }

  openApproveModal(request: VendorRequest) {
    this.selectedRequest = request;
    this.showApproveModal = true;
  }

  openRejectModal(request: VendorRequest) {
    this.selectedRequest = request;
    this.rejectionReason = '';
    this.showRejectModal = true;
  }

  openAdditionalInfoModal(request: VendorRequest) {
    this.selectedRequest = request;
    this.additionalInfoRequest = '';
    this.showAdditionalInfoModal = true;
  }

  closeModals() {
    this.showApproveModal = false;
    this.showRejectModal = false;
    this.showAdditionalInfoModal = false;
    this.rejectionReason = '';
    this.additionalInfoRequest = '';
  }

  approveRequest() {
    if (this.selectedRequest) {
      this.isLoading = true;
      
      this.adminService.approveStore(this.selectedRequest.id).subscribe({
        next: (response) => {
          console.log('✅ Demande approuvée:', response);
          
          // Mettre à jour localement
          if (this.selectedRequest) {
            this.selectedRequest.status = 'approved';
            this.selectedRequest.reviewed_at = new Date().toISOString();
          }
          
          // Afficher un message de succès
          alert('✅ Boutique approuvée avec succès ! Le vendeur a reçu un email de confirmation.');
          
          this.closeModals();
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur approbation:', error);
          alert('❌ Erreur lors de l\'approbation: ' + (error.error?.message || error.message));
          this.isLoading = false;
        }
      });
    }
  }

  rejectRequest() {
    if (this.selectedRequest && this.rejectionReason) {
      this.isLoading = true;
      
      this.adminService.rejectStore(this.selectedRequest.id, this.rejectionReason).subscribe({
        next: (response) => {
          console.log('❌ Demande rejetée:', response);
          
          // Mettre à jour localement
          if (this.selectedRequest) {
            this.selectedRequest.status = 'rejected';
            this.selectedRequest.rejection_reason = this.rejectionReason;
            this.selectedRequest.reviewed_at = new Date().toISOString();
          }
          
          // Afficher un message de succès
          alert('❌ Boutique rejetée. Le vendeur a reçu un email avec la raison du rejet.');
          
          this.closeModals();
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur rejet:', error);
          alert('❌ Erreur lors du rejet: ' + (error.error?.message || error.message));
          this.isLoading = false;
        }
      });
    }
  }

  requestAdditionalInfo() {
    if (this.selectedRequest && this.additionalInfoRequest) {
      this.isLoading = true;
      
      this.adminService.requestAdditionalInfo(this.selectedRequest.id, this.additionalInfoRequest).subscribe({
        next: (response) => {
          console.log('📝 Info complémentaire demandée:', response);
          
          // Mettre à jour localement
          if (this.selectedRequest) {
            this.selectedRequest.status = 'additional_info_required';
            this.selectedRequest.notes = this.additionalInfoRequest;
            this.selectedRequest.reviewed_at = new Date().toISOString();
          }
          
          // Afficher un message de succès
          alert('📝 Demande d\'informations envoyée. Le vendeur a reçu un email.');
          
          this.closeModals();
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur demande info:', error);
          alert('❌ Erreur lors de l\'envoi: ' + (error.error?.message || error.message));
          this.isLoading = false;
        }
      });
    }
  }
}
