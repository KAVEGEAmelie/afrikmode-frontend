import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CampaignConfigDialogComponent } from './campaign-config-dialog.component';
import { TemplateConfigDialogComponent } from './template-config-dialog.component';
import { VendorService } from '../../../../core/services/vendor.service';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  type: 'newsletter' | 'promotional' | 'transactional' | 'welcome' | 'abandoned_cart';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  template: string;
  content: string;
  recipientCount: number;
  sentCount: number;
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
  createdAt: Date;
  scheduledAt?: Date;
  sentAt?: Date;
  segments: string[];
  tags: string[];
}

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: 'newsletter' | 'promotional' | 'transactional' | 'welcome' | 'abandoned_cart';
  htmlContent: string;
  previewImage: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface EmailSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
    value: any;
  }[];
  memberCount: number;
  isActive: boolean;
  createdAt: Date;
}

interface EmailSubscriber {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: 'subscribed' | 'unsubscribed' | 'bounced' | 'complained';
  source: 'website' | 'import' | 'api' | 'manual';
  tags: string[];
  segments: string[];
  subscribedAt: Date;
  lastActivity: Date;
  totalEmails: number;
  openRate: number;
  clickRate: number;
}

interface EmailStats {
  totalSubscribers: number;
  activeSubscribers: number;
  unsubscribedCount: number;
  bouncedCount: number;
  averageOpenRate: number;
  averageClickRate: number;
  totalCampaigns: number;
  sentToday: number;
  scheduledCount: number;
}

@Component({
  selector: 'app-vendor-email-marketing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatBadgeModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatStepperModule,
    MatSlideToggleModule,
    MatCheckboxModule
  ],
  template: `
    <div class="vendor-email-marketing">
      <!-- Header -->
      <div class="email-header">
        <div class="header-content">
          <h1>
            <mat-icon>email</mat-icon>
            Email Marketing
          </h1>
          <p>Créez et gérez vos campagnes email marketing</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="createCampaign()">
            <mat-icon>add</mat-icon>
            Nouvelle Campagne
          </button>
          <button mat-raised-button (click)="openSettings()">
            <mat-icon>settings</mat-icon>
            Paramètres
          </button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="email-kpis">
        <mat-card class="kpi-card">
          <mat-card-content>
            <div class="kpi-header">
              <mat-icon class="kpi-icon">people</mat-icon>
              <div class="kpi-info">
                <h3>Abonnés Actifs</h3>
                <p>{{ emailStats.activeSubscribers }} sur {{ emailStats.totalSubscribers }}</p>
              </div>
            </div>
            <div class="kpi-value">
              <span class="value">{{ emailStats.activeSubscribers.toLocaleString() }}</span>
              <span class="subtitle">Abonnés</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card">
          <mat-card-content>
            <div class="kpi-header">
              <mat-icon class="kpi-icon">visibility</mat-icon>
              <div class="kpi-info">
                <h3>Taux d'Ouverture</h3>
                <p>{{ emailStats.averageOpenRate }}% en moyenne</p>
              </div>
            </div>
            <div class="kpi-value">
              <span class="value">{{ emailStats.averageOpenRate }}%</span>
              <span class="subtitle">Ouverture</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card">
          <mat-card-content>
            <div class="kpi-header">
              <mat-icon class="kpi-icon">mouse</mat-icon>
              <div class="kpi-info">
                <h3>Taux de Clic</h3>
                <p>{{ emailStats.averageClickRate }}% en moyenne</p>
              </div>
            </div>
            <div class="kpi-value">
              <span class="value">{{ emailStats.averageClickRate }}%</span>
              <span class="subtitle">Clics</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card">
          <mat-card-content>
            <div class="kpi-header">
              <mat-icon class="kpi-icon">send</mat-icon>
              <div class="kpi-info">
                <h3>Envoyés Aujourd'hui</h3>
                <p>{{ emailStats.sentToday }} emails</p>
              </div>
            </div>
            <div class="kpi-value">
              <span class="value">{{ emailStats.sentToday }}</span>
              <span class="subtitle">Emails</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Contenu principal -->
      <div class="email-content">
        <mat-tab-group>
          <!-- Onglet Campagnes -->
          <mat-tab label="Campagnes">
            <div class="tab-content">
              <!-- Filtres -->
              <div class="campaigns-filters">
                <mat-form-field appearance="outline" class="search-field">
                  <mat-label>Rechercher une campagne</mat-label>
                  <input matInput [(ngModel)]="searchQuery" (input)="filterCampaigns()">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>

                <mat-select [(ngModel)]="selectedStatus" (selectionChange)="filterCampaigns()" placeholder="Statut">
                  <mat-option value="all">Tous les statuts</mat-option>
                  <mat-option value="draft">Brouillon</mat-option>
                  <mat-option value="scheduled">Programmée</mat-option>
                  <mat-option value="sending">En cours</mat-option>
                  <mat-option value="sent">Envoyée</mat-option>
                  <mat-option value="paused">En pause</mat-option>
                </mat-select>

                <mat-select [(ngModel)]="selectedType" (selectionChange)="filterCampaigns()" placeholder="Type">
                  <mat-option value="all">Tous les types</mat-option>
                  <mat-option value="newsletter">Newsletter</mat-option>
                  <mat-option value="promotional">Promotionnel</mat-option>
                  <mat-option value="transactional">Transactionnel</mat-option>
                  <mat-option value="welcome">Bienvenue</mat-option>
                  <mat-option value="abandoned_cart">Panier abandonné</mat-option>
                </mat-select>

                <button mat-raised-button (click)="exportCampaigns()">
                  <mat-icon>download</mat-icon>
                  Exporter
                </button>
              </div>

              <!-- Liste des campagnes -->
              <div class="campaigns-list">
                @for (campaign of filteredCampaigns; track campaign.id) {
                  <mat-card class="campaign-card" [class.draft]="campaign.status === 'draft'" [class.sent]="campaign.status === 'sent'">
                    <mat-card-content>
                      <div class="campaign-header">
                        <div class="campaign-info">
                          <h4>{{ campaign.name }}</h4>
                          <p>{{ campaign.subject }}</p>
                          <div class="campaign-meta">
                            <mat-chip [ngClass]="'type-' + campaign.type">
                              {{ getTypeLabel(campaign.type) }}
                            </mat-chip>
                            <mat-chip [ngClass]="'status-' + campaign.status">
                              {{ getStatusLabel(campaign.status) }}
                            </mat-chip>
                            <span class="campaign-date">{{ formatDate(campaign.createdAt) }}</span>
                          </div>
                        </div>
                        
                        <div class="campaign-stats">
                          <div class="stat-item">
                            <span class="label">Destinataires:</span>
                            <span class="value">{{ campaign.recipientCount.toLocaleString() }}</span>
                          </div>
                          <div class="stat-item">
                            <span class="label">Envoyés:</span>
                            <span class="value">{{ campaign.sentCount.toLocaleString() }}</span>
                          </div>
                          <div class="stat-item">
                            <span class="label">Ouverture:</span>
                            <span class="value">{{ campaign.openRate }}%</span>
                          </div>
                          <div class="stat-item">
                            <span class="label">Clics:</span>
                            <span class="value">{{ campaign.clickRate }}%</span>
                          </div>
                        </div>

                        <div class="campaign-actions">
                          @if (campaign.status === 'draft') {
                            <button mat-raised-button color="primary" (click)="editCampaign(campaign)">
                              <mat-icon>edit</mat-icon>
                              Modifier
                            </button>
                            <button mat-raised-button (click)="previewCampaign(campaign)">
                              <mat-icon>visibility</mat-icon>
                              Aperçu
                            </button>
                          }
                          @if (campaign.status === 'scheduled') {
                            <button mat-raised-button (click)="sendNow(campaign)">
                              <mat-icon>send</mat-icon>
                              Envoyer Maintenant
                            </button>
                            <button mat-raised-button (click)="editCampaign(campaign)">
                              <mat-icon>edit</mat-icon>
                              Modifier
                            </button>
                          }
                          @if (campaign.status === 'sent') {
                            <button mat-raised-button (click)="viewCampaignStats(campaign)">
                              <mat-icon>analytics</mat-icon>
                              Statistiques
                            </button>
                            <button mat-raised-button (click)="duplicateCampaign(campaign)">
                              <mat-icon>content_copy</mat-icon>
                              Dupliquer
                            </button>
                          }
                          <button mat-icon-button [matMenuTriggerFor]="campaignMenu">
                            <mat-icon>more_vert</mat-icon>
                          </button>
                          
                          <mat-menu #campaignMenu="matMenu">
                            <button mat-menu-item (click)="previewCampaign(campaign)">
                              <mat-icon>visibility</mat-icon>
                              Aperçu
                            </button>
                            <button mat-menu-item (click)="duplicateCampaign(campaign)">
                              <mat-icon>content_copy</mat-icon>
                              Dupliquer
                            </button>
                            <button mat-menu-item (click)="viewCampaignStats(campaign)">
                              <mat-icon>analytics</mat-icon>
                              Statistiques
                            </button>
                            <button mat-menu-item (click)="deleteCampaign(campaign)">
                              <mat-icon>delete</mat-icon>
                              Supprimer
                            </button>
                          </mat-menu>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            </div>
          </mat-tab>

          <!-- Onglet Templates -->
          <mat-tab label="Templates">
            <div class="tab-content">
              <div class="templates-header">
                <button mat-raised-button color="primary" (click)="createTemplate()">
                  <mat-icon>add</mat-icon>
                  Nouveau Template
                </button>
              </div>

              <div class="templates-list">
                @for (template of emailTemplates; track template.id) {
                  <mat-card class="template-card" [class.inactive]="!template.isActive">
                    <mat-card-content>
                      <div class="template-header">
                        <div class="template-preview">
                          <img [src]="template.previewImage" [alt]="template.name">
                        </div>
                        <div class="template-info">
                          <h4>{{ template.name }}</h4>
                          <p>{{ template.description }}</p>
                          <div class="template-meta">
                            <mat-chip [ngClass]="'category-' + template.category">
                              {{ getCategoryLabel(template.category) }}
                            </mat-chip>
                            <mat-chip [ngClass]="template.isActive ? 'active' : 'inactive'">
                              {{ template.isActive ? 'Actif' : 'Inactif' }}
                            </mat-chip>
                            <span class="template-date">{{ formatDate(template.updatedAt) }}</span>
                          </div>
                        </div>
                        
                        <div class="template-actions">
                          <button mat-raised-button (click)="editTemplate(template)">
                            <mat-icon>edit</mat-icon>
                            Modifier
                          </button>
                          <button mat-raised-button (click)="previewTemplate(template)">
                            <mat-icon>visibility</mat-icon>
                            Aperçu
                          </button>
                          <button mat-icon-button [matMenuTriggerFor]="templateMenu">
                            <mat-icon>more_vert</mat-icon>
                          </button>
                          
                          <mat-menu #templateMenu="matMenu">
                            <button mat-menu-item (click)="duplicateTemplate(template)">
                              <mat-icon>content_copy</mat-icon>
                              Dupliquer
                            </button>
                            <button mat-menu-item (click)="toggleTemplate(template)">
                              <mat-icon>{{ template.isActive ? 'pause' : 'play_arrow' }}</mat-icon>
                              {{ template.isActive ? 'Désactiver' : 'Activer' }}
                            </button>
                            <button mat-menu-item (click)="deleteTemplate(template)">
                              <mat-icon>delete</mat-icon>
                              Supprimer
                            </button>
                          </mat-menu>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            </div>
          </mat-tab>

          <!-- Onglet Abonnés -->
          <mat-tab label="Abonnés">
            <div class="tab-content">
              <!-- Filtres -->
              <div class="subscribers-filters">
                <mat-form-field appearance="outline" class="search-field">
                  <mat-label>Rechercher un abonné</mat-label>
                  <input matInput [(ngModel)]="subscriberSearchQuery" (input)="filterSubscribers()">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>

                <mat-select [(ngModel)]="selectedSubscriberStatus" (selectionChange)="filterSubscribers()" placeholder="Statut">
                  <mat-option value="all">Tous les statuts</mat-option>
                  <mat-option value="subscribed">Abonné</mat-option>
                  <mat-option value="unsubscribed">Désabonné</mat-option>
                  <mat-option value="bounced">Rebondi</mat-option>
                  <mat-option value="complained">Signalé</mat-option>
                </mat-select>

                <mat-select [(ngModel)]="selectedSegment" (selectionChange)="filterSubscribers()" placeholder="Segment">
                  <mat-option value="all">Tous les segments</mat-option>
                  @for (segment of emailSegments; track segment.id) {
                    <mat-option [value]="segment.id">{{ segment.name }}</mat-option>
                  }
                </mat-select>

                <button mat-raised-button (click)="importSubscribers()">
                  <mat-icon>upload</mat-icon>
                  Importer
                </button>
              </div>

              <!-- Liste des abonnés -->
              <div class="subscribers-list">
                @for (subscriber of filteredSubscribers; track subscriber.id) {
                  <mat-card class="subscriber-card" [class.unsubscribed]="subscriber.status === 'unsubscribed'">
                    <mat-card-content>
                      <div class="subscriber-header">
                        <div class="subscriber-info">
                          <div class="subscriber-avatar">
                            <mat-icon>person</mat-icon>
                          </div>
                          <div class="subscriber-details">
                            <h4>{{ subscriber.firstName }} {{ subscriber.lastName }}</h4>
                            <p>{{ subscriber.email }}</p>
                            <div class="subscriber-meta">
                              <mat-chip [ngClass]="'status-' + subscriber.status">
                                {{ getSubscriberStatusLabel(subscriber.status) }}
                              </mat-chip>
                              <span class="subscriber-date">Inscrit le {{ formatDate(subscriber.subscribedAt) }}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div class="subscriber-stats">
                          <div class="stat-item">
                            <span class="label">Emails reçus:</span>
                            <span class="value">{{ subscriber.totalEmails }}</span>
                          </div>
                          <div class="stat-item">
                            <span class="label">Taux d'ouverture:</span>
                            <span class="value">{{ subscriber.openRate }}%</span>
                          </div>
                          <div class="stat-item">
                            <span class="label">Taux de clic:</span>
                            <span class="value">{{ subscriber.clickRate }}%</span>
                          </div>
                        </div>

                        <div class="subscriber-actions">
                          <button mat-raised-button (click)="viewSubscriberDetails(subscriber)">
                            <mat-icon>visibility</mat-icon>
                            Détails
                          </button>
                          <button mat-icon-button [matMenuTriggerFor]="subscriberMenu">
                            <mat-icon>more_vert</mat-icon>
                          </button>
                          
                          <mat-menu #subscriberMenu="matMenu">
                            <button mat-menu-item (click)="editSubscriber(subscriber)">
                              <mat-icon>edit</mat-icon>
                              Modifier
                            </button>
                            <button mat-menu-item (click)="viewSubscriberHistory(subscriber)">
                              <mat-icon>history</mat-icon>
                              Historique
                            </button>
                            <button mat-menu-item (click)="removeSubscriber(subscriber)">
                              <mat-icon>person_remove</mat-icon>
                              Supprimer
                            </button>
                          </mat-menu>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            </div>
          </mat-tab>

          <!-- Onglet Segments -->
          <mat-tab label="Segments">
            <div class="tab-content">
              <div class="segments-header">
                <button mat-raised-button color="primary" (click)="createSegment()">
                  <mat-icon>add</mat-icon>
                  Nouveau Segment
                </button>
              </div>

              <div class="segments-list">
                @for (segment of emailSegments; track segment.id) {
                  <mat-card class="segment-card">
                    <mat-card-content>
                      <div class="segment-header">
                        <div class="segment-info">
                          <h4>{{ segment.name }}</h4>
                          <p>{{ segment.description }}</p>
                          <div class="segment-meta">
                            <span class="member-count">{{ segment.memberCount }} membres</span>
                            <mat-chip [ngClass]="segment.isActive ? 'active' : 'inactive'">
                              {{ segment.isActive ? 'Actif' : 'Inactif' }}
                            </mat-chip>
                            <span class="segment-date">Créé le {{ formatDate(segment.createdAt) }}</span>
                          </div>
                        </div>
                        
                        <div class="segment-criteria">
                          <h5>Critères :</h5>
                          <div class="criteria-list">
                            @for (criterion of segment.criteria; track criterion.field) {
                              <div class="criterion-item">
                                <span class="field">{{ criterion.field }}</span>
                                <span class="operator">{{ getOperatorLabel(criterion.operator) }}</span>
                                <span class="value">{{ criterion.value }}</span>
                              </div>
                            }
                          </div>
                        </div>

                        <div class="segment-actions">
                          <button mat-raised-button (click)="editSegment(segment)">
                            <mat-icon>edit</mat-icon>
                            Modifier
                          </button>
                          <button mat-raised-button (click)="previewSegment(segment)">
                            <mat-icon>visibility</mat-icon>
                            Aperçu
                          </button>
                          <button mat-icon-button [matMenuTriggerFor]="segmentMenu">
                            <mat-icon>more_vert</mat-icon>
                          </button>
                          
                          <mat-menu #segmentMenu="matMenu">
                            <button mat-menu-item (click)="duplicateSegment(segment)">
                              <mat-icon>content_copy</mat-icon>
                              Dupliquer
                            </button>
                            <button mat-menu-item (click)="toggleSegment(segment)">
                              <mat-icon>{{ segment.isActive ? 'pause' : 'play_arrow' }}</mat-icon>
                              {{ segment.isActive ? 'Désactiver' : 'Activer' }}
                            </button>
                            <button mat-menu-item (click)="deleteSegment(segment)">
                              <mat-icon>delete</mat-icon>
                              Supprimer
                            </button>
                          </mat-menu>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .vendor-email-marketing {
      background: #f8fafc;
      min-height: 100vh;
    }

    .email-header {
      background: linear-gradient(135deg, #8B2E2E 0%, #6B1F1F 100%);
      color: white;
      padding: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-content h1 {
      font-size: 2rem;
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-content h1 mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .header-content p {
      margin: 0;
      opacity: 0.9;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .email-kpis {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      padding: 2rem;
    }

    .kpi-card {
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .kpi-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .kpi-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .kpi-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #8B2E2E, #D9744F);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
    }

    .kpi-info h3 {
      font-size: 1.1rem;
      margin: 0 0 0.25rem 0;
      color: #1f2937;
    }

    .kpi-info p {
      margin: 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .kpi-value {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .value {
      font-size: 1.8rem;
      font-weight: 700;
      color: #1f2937;
    }

    .subtitle {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .email-content {
      padding: 0 2rem 2rem 2rem;
    }

    .tab-content {
      padding: 1.5rem 0;
    }

    .campaigns-filters,
    .subscribers-filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 300px;
    }

    .campaigns-list,
    .templates-list,
    .subscribers-list,
    .segments-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .campaign-card,
    .template-card,
    .subscriber-card,
    .segment-card {
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .campaign-card:hover,
    .template-card:hover,
    .subscriber-card:hover,
    .segment-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .campaign-card.draft {
      border-left: 4px solid #ff9800;
    }

    .campaign-card.sent {
      border-left: 4px solid #4caf50;
    }

    .template-card.inactive {
      opacity: 0.6;
    }

    .subscriber-card.unsubscribed {
      opacity: 0.6;
    }

    .campaign-header,
    .template-header,
    .subscriber-header,
    .segment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .campaign-info,
    .template-info,
    .subscriber-info,
    .segment-info {
      flex: 1;
    }

    .campaign-info h4,
    .template-info h4,
    .subscriber-info h4,
    .segment-info h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1.1rem;
      color: #1f2937;
    }

    .campaign-info p,
    .template-info p,
    .subscriber-info p,
    .segment-info p {
      margin: 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .campaign-meta,
    .template-meta,
    .subscriber-meta,
    .segment-meta {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }

    .campaign-meta mat-chip,
    .template-meta mat-chip,
    .subscriber-meta mat-chip,
    .segment-meta mat-chip {
      font-size: 0.75rem;
      height: 24px;
    }

    .type-newsletter {
      background: #e0e7ff;
      color: #3730a3;
    }

    .type-promotional {
      background: #fef3c7;
      color: #92400e;
    }

    .type-transactional {
      background: #d1fae5;
      color: #065f46;
    }

    .type-welcome {
      background: #f3e8ff;
      color: #7c3aed;
    }

    .type-abandoned_cart {
      background: #fee2e2;
      color: #991b1b;
    }

    .status-draft {
      background: #f3f4f6;
      color: #374151;
    }

    .status-scheduled {
      background: #dbeafe;
      color: #1e40af;
    }

    .status-sending {
      background: #fef3c7;
      color: #92400e;
    }

    .status-sent {
      background: #d1fae5;
      color: #065f46;
    }

    .status-paused {
      background: #fef2f2;
      color: #dc2626;
    }

    .status-cancelled {
      background: #f3f4f6;
      color: #374151;
    }

    .category-newsletter {
      background: #e0e7ff;
      color: #3730a3;
    }

    .category-promotional {
      background: #fef3c7;
      color: #92400e;
    }

    .category-transactional {
      background: #d1fae5;
      color: #065f46;
    }

    .category-welcome {
      background: #f3e8ff;
      color: #7c3aed;
    }

    .category-abandoned_cart {
      background: #fee2e2;
      color: #991b1b;
    }

    .status-subscribed {
      background: #d1fae5;
      color: #065f46;
    }

    .status-unsubscribed {
      background: #f3f4f6;
      color: #374151;
    }

    .status-bounced {
      background: #fee2e2;
      color: #991b1b;
    }

    .status-complained {
      background: #fef2f2;
      color: #dc2626;
    }

    .active {
      background: #d1fae5;
      color: #065f46;
    }

    .inactive {
      background: #f3f4f6;
      color: #374151;
    }

    .campaign-stats,
    .subscriber-stats {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 200px;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-item .label {
      color: #6b7280;
      font-size: 0.85rem;
    }

    .stat-item .value {
      font-weight: 600;
      color: #1f2937;
      font-size: 0.9rem;
    }

    .campaign-actions,
    .template-actions,
    .subscriber-actions,
    .segment-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .template-preview {
      width: 120px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      background: #e5e7eb;
    }

    .template-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .subscriber-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .subscriber-avatar mat-icon {
      font-size: 1.5rem;
      color: #6b7280;
    }

    .segment-criteria {
      flex: 1;
      margin: 0 1rem;
    }

    .segment-criteria h5 {
      margin: 0 0 0.5rem 0;
      color: #374151;
      font-size: 0.9rem;
    }

    .criteria-list {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .criterion-item {
      display: flex;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #6b7280;
    }

    .field {
      font-weight: 500;
      color: #1f2937;
    }

    .operator {
      color: #6b7280;
    }

    .value {
      color: #8B2E2E;
      font-weight: 500;
    }

    .member-count {
      font-weight: 600;
      color: #1f2937;
    }

    .templates-header,
    .segments-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 2rem;
    }

    @media (max-width: 768px) {
      .email-kpis {
        grid-template-columns: 1fr;
      }

      .campaigns-filters,
      .subscribers-filters {
        flex-direction: column;
      }

      .search-field {
        min-width: auto;
      }

      .campaign-header,
      .template-header,
      .subscriber-header,
      .segment-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .campaign-actions,
      .template-actions,
      .subscriber-actions,
      .segment-actions {
        justify-content: center;
      }

      .campaign-stats,
      .subscriber-stats {
        min-width: auto;
      }
    }
  `]
})
export class VendorEmailMarketingComponent implements OnInit {
  searchQuery: string = '';
  subscriberSearchQuery: string = '';
  selectedStatus: string = 'all';
  selectedType: string = 'all';
  selectedSubscriberStatus: string = 'all';
  selectedSegment: string = 'all';

  emailCampaigns: EmailCampaign[] = [
    {
      id: '1',
      name: 'Newsletter Janvier 2025',
      subject: 'Nouveautés AfrikMode - Collection Printemps',
      type: 'newsletter',
      status: 'sent',
      template: 'newsletter-template',
      content: 'Découvrez notre nouvelle collection printemps...',
      recipientCount: 1250,
      sentCount: 1248,
      openRate: 24.5,
      clickRate: 8.2,
      unsubscribeRate: 0.8,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      segments: ['all-subscribers'],
      tags: ['newsletter', 'collection']
    },
    {
      id: '2',
      name: 'Promotion Black Friday',
      subject: 'Black Friday - Jusqu\'à -50% sur toute la collection !',
      type: 'promotional',
      status: 'scheduled',
      template: 'promotional-template',
      content: 'Profitez de nos offres exceptionnelles...',
      recipientCount: 2100,
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
      unsubscribeRate: 0,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      segments: ['active-subscribers'],
      tags: ['promotion', 'black-friday']
    }
  ];

  filteredCampaigns: EmailCampaign[] = [];

  emailTemplates: EmailTemplate[] = [
    {
      id: '1',
      name: 'Newsletter Standard',
      description: 'Template de base pour les newsletters',
      category: 'newsletter',
      htmlContent: '<html>...</html>',
      previewImage: '/assets/images/email-templates/newsletter.jpg',
      isActive: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)
    },
    {
      id: '2',
      name: 'Promotion Flash',
      description: 'Template pour les promotions urgentes',
      category: 'promotional',
      htmlContent: '<html>...</html>',
      previewImage: '/assets/images/email-templates/promotional.jpg',
      isActive: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
    }
  ];

  emailSegments: EmailSegment[] = [
    {
      id: '1',
      name: 'Tous les abonnés',
      description: 'Segment incluant tous les abonnés actifs',
      criteria: [],
      memberCount: 1250,
      isActive: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60)
    },
    {
      id: '2',
      name: 'Clients VIP',
      description: 'Clients ayant dépensé plus de 100,000 FCFA',
      criteria: [
        {
          field: 'total_spent',
          operator: 'greater_than',
          value: 100000
        }
      ],
      memberCount: 45,
      isActive: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
    }
  ];

  emailSubscribers: EmailSubscriber[] = [
    {
      id: '1',
      email: 'marie.kouassi@email.com',
      firstName: 'Marie',
      lastName: 'Kouassi',
      status: 'subscribed',
      source: 'website',
      tags: ['vip', 'newsletter'],
      segments: ['all-subscribers', 'vip-customers'],
      subscribedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      totalEmails: 12,
      openRate: 35.2,
      clickRate: 12.8
    },
    {
      id: '2',
      email: 'jean.dupont@email.com',
      firstName: 'Jean',
      lastName: 'Dupont',
      status: 'subscribed',
      source: 'import',
      tags: ['newsletter'],
      segments: ['all-subscribers'],
      subscribedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      totalEmails: 8,
      openRate: 22.1,
      clickRate: 6.5
    }
  ];

  filteredSubscribers: EmailSubscriber[] = [];

  emailStats: EmailStats = {
    totalSubscribers: 1250,
    activeSubscribers: 1180,
    unsubscribedCount: 45,
    bouncedCount: 25,
    averageOpenRate: 24.5,
    averageClickRate: 8.2,
    totalCampaigns: 15,
    sentToday: 150,
    scheduledCount: 3
  };

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private vendorService: VendorService
  ) {}

  ngOnInit(): void {
    this.filteredCampaigns = this.emailCampaigns;
    this.filteredSubscribers = this.emailSubscribers;
    this.loadEmailCampaigns();
    this.loadSubscribers();
  }

  loadEmailCampaigns(): void {
    this.vendorService.getEmailCampaigns().subscribe({
      next: (response) => {
        if (response && response.campaigns) {
          this.emailCampaigns = response.campaigns;
          this.filteredCampaigns = this.emailCampaigns;
        }
        console.log('✅ Campagnes email chargées');
      },
      error: (error) => {
        console.error('❌ Erreur chargement campagnes:', error);
        // Garder les données de démonstration
      }
    });
  }

  loadSubscribers(): void {
    this.vendorService.getSubscribers().subscribe({
      next: (response) => {
        if (response && response.subscribers) {
          this.emailSubscribers = response.subscribers;
          this.filteredSubscribers = this.emailSubscribers;
        }
        console.log('✅ Abonnés chargés');
      },
      error: (error) => {
        console.error('❌ Erreur chargement abonnés:', error);
        // Garder les données de démonstration
      }
    });
  }

  filterCampaigns(): void {
    this.filteredCampaigns = this.emailCampaigns.filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           campaign.subject.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = this.selectedStatus === 'all' || campaign.status === this.selectedStatus;
      const matchesType = this.selectedType === 'all' || campaign.type === this.selectedType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }

  filterSubscribers(): void {
    this.filteredSubscribers = this.emailSubscribers.filter(subscriber => {
      const matchesSearch = subscriber.email.toLowerCase().includes(this.subscriberSearchQuery.toLowerCase()) ||
                           (subscriber.firstName && subscriber.firstName.toLowerCase().includes(this.subscriberSearchQuery.toLowerCase())) ||
                           (subscriber.lastName && subscriber.lastName.toLowerCase().includes(this.subscriberSearchQuery.toLowerCase()));
      const matchesStatus = this.selectedSubscriberStatus === 'all' || subscriber.status === this.selectedSubscriberStatus;
      const matchesSegment = this.selectedSegment === 'all' || subscriber.segments.includes(this.selectedSegment);
      return matchesSearch && matchesStatus && matchesSegment;
    });
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'newsletter': 'Newsletter',
      'promotional': 'Promotionnel',
      'transactional': 'Transactionnel',
      'welcome': 'Bienvenue',
      'abandoned_cart': 'Panier abandonné'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'draft': 'Brouillon',
      'scheduled': 'Programmée',
      'sending': 'En cours',
      'sent': 'Envoyée',
      'paused': 'En pause',
      'cancelled': 'Annulée'
    };
    return labels[status] || status;
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'newsletter': 'Newsletter',
      'promotional': 'Promotionnel',
      'transactional': 'Transactionnel',
      'welcome': 'Bienvenue',
      'abandoned_cart': 'Panier abandonné'
    };
    return labels[category] || category;
  }

  getOperatorLabel(operator: string): string {
    const labels: { [key: string]: string } = {
      'equals': 'égal à',
      'contains': 'contient',
      'greater_than': 'supérieur à',
      'less_than': 'inférieur à',
      'in': 'dans',
      'not_in': 'pas dans'
    };
    return labels[operator] || operator;
  }

  formatDate(timestamp: Date): string {
    return timestamp.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  createCampaign(): void {
    const dialogRef = this.dialog.open(CampaignConfigDialogComponent, {
      width: '900px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const campaign: EmailCampaign = {
          id: Date.now().toString(),
          name: result.name,
          subject: result.subject,
          type: result.type,
          status: result.sendOption === 'now' ? 'sending' : result.sendOption === 'scheduled' ? 'scheduled' : 'draft',
          template: result.template,
          content: result.content,
          recipientCount: result.totalRecipients,
          sentCount: 0,
          openRate: 0,
          clickRate: 0,
          unsubscribeRate: 0,
          createdAt: new Date(),
          scheduledAt: result.scheduledDate,
          segments: result.segments,
          tags: result.tags
        };

        this.emailCampaigns.unshift(campaign);
        this.snackBar.open('Campagne créée', 'Fermer', { duration: 3000 });
      }
    });
  }

  editCampaign(campaign: EmailCampaign): void {
    console.log('✏️ Modifier la campagne:', campaign.name);
    // Logique pour modifier la campagne
  }

  previewCampaign(campaign: EmailCampaign): void {
    console.log('👁️ Aperçu de la campagne:', campaign.name);
    // Logique pour l'aperçu
  }

  sendNow(campaign: EmailCampaign): void {
    campaign.status = 'sending';
    this.snackBar.open('Campagne en cours d\'envoi', 'Fermer', { duration: 3000 });
  }

  viewCampaignStats(campaign: EmailCampaign): void {
    console.log('📊 Statistiques de la campagne:', campaign.name);
    // Logique pour afficher les statistiques
  }

  duplicateCampaign(campaign: EmailCampaign): void {
    console.log('📋 Dupliquer la campagne:', campaign.name);
    // Logique pour dupliquer la campagne
  }

  deleteCampaign(campaign: EmailCampaign): void {
    console.log('🗑️ Supprimer la campagne:', campaign.name);
    // Logique pour supprimer la campagne
  }

  createTemplate(): void {
    const dialogRef = this.dialog.open(TemplateConfigDialogComponent, {
      width: '1000px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const template: EmailTemplate = {
          id: Date.now().toString(),
          name: result.name,
          description: result.description,
          category: result.category,
          htmlContent: result.htmlContent,
          previewImage: '',
          isActive: result.isActive,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        this.emailTemplates.unshift(template);
        this.snackBar.open('Template créé', 'Fermer', { duration: 3000 });
      }
    });
  }

  editTemplate(template: EmailTemplate): void {
    console.log('✏️ Modifier le template:', template.name);
    // Logique pour modifier le template
  }

  previewTemplate(template: EmailTemplate): void {
    console.log('👁️ Aperçu du template:', template.name);
    // Logique pour l'aperçu
  }

  duplicateTemplate(template: EmailTemplate): void {
    console.log('📋 Dupliquer le template:', template.name);
    // Logique pour dupliquer le template
  }

  toggleTemplate(template: EmailTemplate): void {
    template.isActive = !template.isActive;
    this.snackBar.open(
      `Template ${template.isActive ? 'activé' : 'désactivé'}`,
      'Fermer',
      { duration: 3000 }
    );
  }

  deleteTemplate(template: EmailTemplate): void {
    console.log('🗑️ Supprimer le template:', template.name);
    // Logique pour supprimer le template
  }

  importSubscribers(): void {
    console.log('📥 Importer des abonnés');
    // Logique pour importer des abonnés
  }

  viewSubscriberDetails(subscriber: EmailSubscriber): void {
    console.log('👁️ Détails de l\'abonné:', subscriber.email);
    // Logique pour afficher les détails
  }

  editSubscriber(subscriber: EmailSubscriber): void {
    console.log('✏️ Modifier l\'abonné:', subscriber.email);
    // Logique pour modifier l'abonné
  }

  viewSubscriberHistory(subscriber: EmailSubscriber): void {
    console.log('📊 Historique de l\'abonné:', subscriber.email);
    // Logique pour afficher l'historique
  }

  removeSubscriber(subscriber: EmailSubscriber): void {
    console.log('👋 Supprimer l\'abonné:', subscriber.email);
    // Logique pour supprimer l'abonné
  }

  createSegment(): void {
    console.log('👥 Créer un nouveau segment');
    // Logique pour créer un segment
  }

  editSegment(segment: EmailSegment): void {
    console.log('✏️ Modifier le segment:', segment.name);
    // Logique pour modifier le segment
  }

  previewSegment(segment: EmailSegment): void {
    console.log('👁️ Aperçu du segment:', segment.name);
    // Logique pour l'aperçu
  }

  duplicateSegment(segment: EmailSegment): void {
    console.log('📋 Dupliquer le segment:', segment.name);
    // Logique pour dupliquer le segment
  }

  toggleSegment(segment: EmailSegment): void {
    segment.isActive = !segment.isActive;
    this.snackBar.open(
      `Segment ${segment.isActive ? 'activé' : 'désactivé'}`,
      'Fermer',
      { duration: 3000 }
    );
  }

  deleteSegment(segment: EmailSegment): void {
    console.log('🗑️ Supprimer le segment:', segment.name);
    // Logique pour supprimer le segment
  }

  exportCampaigns(): void {
    console.log('📊 Exporter les campagnes');
    // Logique d'export
  }

  openSettings(): void {
    console.log('⚙️ Ouvrir les paramètres email');
    // Logique pour ouvrir les paramètres
  }

  // Méthodes utilitaires
  getCampaignTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'newsletter': 'article',
      'promotional': 'local_offer',
      'transactional': 'receipt',
      'welcome': 'waving_hand',
      'abandoned_cart': 'shopping_cart'
    };
    return icons[type] || 'email';
  }

  getCampaignTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'newsletter': 'Newsletter',
      'promotional': 'Promotionnel',
      'transactional': 'Transactionnel',
      'welcome': 'Bienvenue',
      'abandoned_cart': 'Panier abandonné'
    };
    return labels[type] || type;
  }

  getCampaignStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'draft': 'accent',
      'scheduled': 'primary',
      'sending': 'primary',
      'sent': 'primary',
      'paused': 'warn',
      'cancelled': 'warn'
    };
    return colors[status] || 'primary';
  }

  getCampaignStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'draft': 'Brouillon',
      'scheduled': 'Programmé',
      'sending': 'Envoi en cours',
      'sent': 'Envoyé',
      'paused': 'En pause',
      'cancelled': 'Annulé'
    };
    return labels[status] || status;
  }

  getSubscriberStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'subscribed': 'primary',
      'unsubscribed': 'warn',
      'bounced': 'accent',
      'complained': 'warn'
    };
    return colors[status] || 'primary';
  }

  getSubscriberStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'subscribed': 'Abonné',
      'unsubscribed': 'Désabonné',
      'bounced': 'Rebondi',
      'complained': 'Signalé'
    };
    return labels[status] || status;
  }

  getTemplateCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'newsletter': 'article',
      'promotional': 'local_offer',
      'transactional': 'receipt',
      'welcome': 'waving_hand',
      'abandoned_cart': 'shopping_cart'
    };
    return icons[category] || 'email';
  }

  getTemplateCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'newsletter': 'Newsletter',
      'promotional': 'Promotionnel',
      'transactional': 'Transactionnel',
      'welcome': 'Bienvenue',
      'abandoned_cart': 'Panier abandonné'
    };
    return labels[category] || category;
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('fr-FR').format(value);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDateTime(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    return 'À l\'instant';
  }

  calculateOpenRate(opens: number, sent: number): number {
    if (sent === 0) return 0;
    return (opens / sent) * 100;
  }

  calculateClickRate(clicks: number, opens: number): number {
    if (opens === 0) return 0;
    return (clicks / opens) * 100;
  }

  calculateUnsubscribeRate(unsubscribes: number, sent: number): number {
    if (sent === 0) return 0;
    return (unsubscribes / sent) * 100;
  }

  getPerformanceColor(rate: number, type: 'open' | 'click' | 'unsubscribe'): string {
    if (type === 'unsubscribe') {
      if (rate < 1) return 'primary';
      if (rate < 3) return 'warn';
      return 'warn';
    } else {
      if (rate > 20) return 'primary';
      if (rate > 10) return 'primary';
      return 'accent';
    }
  }

  getPerformanceLabel(rate: number, type: 'open' | 'click' | 'unsubscribe'): string {
    if (type === 'unsubscribe') {
      if (rate < 1) return 'Excellent';
      if (rate < 3) return 'Bon';
      return 'À améliorer';
    } else {
      if (rate > 20) return 'Excellent';
      if (rate > 10) return 'Bon';
      return 'À améliorer';
    }
  }
}


