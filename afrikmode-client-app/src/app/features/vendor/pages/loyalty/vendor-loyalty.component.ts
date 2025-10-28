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
import { RewardConfigDialogComponent } from './reward-config-dialog.component';
import { LevelConfigDialogComponent } from './level-config-dialog.component';
import { VendorService } from '../../../../core/services/vendor.service';

interface LoyaltyProgram {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  pointsPerCurrency: number;
  currencyThreshold: number;
  levels: LoyaltyLevel[];
  rewards: LoyaltyReward[];
  rules: LoyaltyRule[];
  createdAt: Date;
  updatedAt: Date;
}

interface LoyaltyLevel {
  id: string;
  name: string;
  description: string;
  minPoints: number;
  maxPoints: number;
  benefits: string[];
  color: string;
  icon: string;
  discountPercentage: number;
  freeShipping: boolean;
  prioritySupport: boolean;
}

interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: 'discount' | 'free_shipping' | 'free_product' | 'cashback';
  value: number;
  isActive: boolean;
  image?: string;
  validUntil?: Date;
  usageLimit?: number;
  usedCount: number;
}

interface LoyaltyRule {
  id: string;
  name: string;
  description: string;
  trigger: 'purchase' | 'signup' | 'review' | 'referral' | 'birthday';
  points: number;
  multiplier?: number;
  conditions: {
    minAmount?: number;
    category?: string;
    product?: string;
  };
  isActive: boolean;
}

interface LoyaltyCustomer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currentLevel: LoyaltyLevel;
  totalPoints: number;
  availablePoints: number;
  usedPoints: number;
  joinDate: Date;
  lastActivity: Date;
  totalSpent: number;
  totalOrders: number;
  nextLevelPoints: number;
  progressToNextLevel: number;
}

interface LoyaltyTransaction {
  id: string;
  customerId: string;
  customerName: string;
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  points: number;
  description: string;
  orderId?: string;
  timestamp: Date;
  expiryDate?: Date;
}

interface LoyaltyStats {
  totalMembers: number;
  activeMembers: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  averagePointsPerCustomer: number;
  topLevel: string;
  conversionRate: number;
  retentionRate: number;
}

@Component({
  selector: 'app-vendor-loyalty',
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
    MatSlideToggleModule
  ],
  template: `
    <div class="vendor-loyalty">
      <!-- Header -->
      <div class="loyalty-header">
        <div class="header-content">
          <h1>
            <mat-icon>loyalty</mat-icon>
            Programme Fidélité
          </h1>
          <p>Gérez votre programme de fidélisation et récompensez vos clients</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="createReward()">
            <mat-icon>add</mat-icon>
            Nouvelle Récompense
          </button>
          <button mat-raised-button (click)="openSettings()">
            <mat-icon>settings</mat-icon>
            Paramètres
          </button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="loyalty-kpis">
        <mat-card class="kpi-card">
          <mat-card-content>
            <div class="kpi-header">
              <mat-icon class="kpi-icon">people</mat-icon>
              <div class="kpi-info">
                <h3>Membres Actifs</h3>
                <p>{{ loyaltyStats.activeMembers }} sur {{ loyaltyStats.totalMembers }}</p>
              </div>
            </div>
            <div class="kpi-value">
              <span class="value">{{ loyaltyStats.activeMembers }}</span>
              <span class="subtitle">Membres</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card">
          <mat-card-content>
            <div class="kpi-header">
              <mat-icon class="kpi-icon">stars</mat-icon>
              <div class="kpi-info">
                <h3>Points Émis</h3>
                <p>{{ loyaltyStats.totalPointsIssued.toLocaleString() }} points</p>
              </div>
            </div>
            <div class="kpi-value">
              <span class="value">{{ loyaltyStats.totalPointsIssued.toLocaleString() }}</span>
              <span class="subtitle">Points</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card">
          <mat-card-content>
            <div class="kpi-header">
              <mat-icon class="kpi-icon">trending_up</mat-icon>
              <div class="kpi-info">
                <h3>Taux de Conversion</h3>
                <p>{{ loyaltyStats.conversionRate }}% des clients</p>
              </div>
            </div>
            <div class="kpi-value">
              <span class="value">{{ loyaltyStats.conversionRate }}%</span>
              <span class="subtitle">Conversion</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card">
          <mat-card-content>
            <div class="kpi-header">
              <mat-icon class="kpi-icon">repeat</mat-icon>
              <div class="kpi-info">
                <h3>Taux de Rétention</h3>
                <p>{{ loyaltyStats.retentionRate }}% de fidélité</p>
              </div>
            </div>
            <div class="kpi-value">
              <span class="value">{{ loyaltyStats.retentionRate }}%</span>
              <span class="subtitle">Rétention</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Configuration du Programme -->
      <div class="program-config">
        <mat-card class="config-card">
          <mat-card-header>
            <mat-card-title>Configuration du Programme</mat-card-title>
            <mat-card-subtitle>Paramétrez votre système de fidélisation</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="config-form">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Nom du programme</mat-label>
                  <input matInput [(ngModel)]="loyaltyProgram.name">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Points par FCFA</mat-label>
                  <input matInput type="number" [(ngModel)]="loyaltyProgram.pointsPerCurrency">
                </mat-form-field>
              </div>
              
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Seuil minimum (FCFA)</mat-label>
                  <input matInput type="number" [(ngModel)]="loyaltyProgram.currencyThreshold">
                </mat-form-field>
                <div class="toggle-container">
                  <mat-slide-toggle [(ngModel)]="loyaltyProgram.isActive">
                    Programme actif
                  </mat-slide-toggle>
                </div>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="description-field">
                  <mat-label>Description</mat-label>
                  <textarea matInput [(ngModel)]="loyaltyProgram.description" rows="3"></textarea>
                </mat-form-field>
              </div>

              <div class="form-actions">
                <button mat-raised-button color="primary" (click)="saveProgramConfig()">
                  <mat-icon>save</mat-icon>
                  Sauvegarder
                </button>
                <button mat-raised-button (click)="resetProgramConfig()">
                  <mat-icon>refresh</mat-icon>
                  Réinitialiser
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Contenu principal -->
      <div class="loyalty-content">
        <mat-tab-group>
          <!-- Onglet Membres -->
          <mat-tab label="Membres">
            <div class="tab-content">
              <!-- Filtres -->
              <div class="members-filters">
                <mat-form-field appearance="outline" class="search-field">
                  <mat-label>Rechercher un membre</mat-label>
                  <input matInput [(ngModel)]="searchQuery" (input)="filterMembers()">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>

                <mat-select [(ngModel)]="selectedLevel" (selectionChange)="filterMembers()" placeholder="Niveau">
                  <mat-option value="all">Tous les niveaux</mat-option>
                  @for (level of loyaltyProgram.levels; track level.id) {
                    <mat-option [value]="level.id">{{ level.name }}</mat-option>
                  }
                </mat-select>

                <mat-select [(ngModel)]="sortBy" (selectionChange)="sortMembers()" placeholder="Trier par">
                  <mat-option value="points">Points</mat-option>
                  <mat-option value="spent">Montant dépensé</mat-option>
                  <mat-option value="orders">Nombre de commandes</mat-option>
                  <mat-option value="joinDate">Date d'inscription</mat-option>
                </mat-select>
              </div>

              <!-- Liste des membres -->
              <div class="members-list">
                @for (member of filteredMembers; track member.id) {
                  <mat-card class="member-card" [class.vip]="member.currentLevel.name === 'VIP'">
                    <mat-card-content>
                      <div class="member-header">
                        <div class="member-info">
                          <div class="member-avatar">
                            @if (member.avatar) {
                              <img [src]="member.avatar" [alt]="member.name">
                            } @else {
                              <mat-icon>person</mat-icon>
                            }
                          </div>
                          <div class="member-details">
                            <h4>{{ member.name }}</h4>
                            <p>{{ member.email }}</p>
                            <div class="member-level">
                              <mat-chip [ngClass]="'level-' + member.currentLevel.name.toLowerCase()">
                                <mat-icon>{{ member.currentLevel.icon }}</mat-icon>
                                {{ member.currentLevel.name }}
                              </mat-chip>
                            </div>
                          </div>
                        </div>
                        
                        <div class="member-stats">
                          <div class="stat-item">
                            <span class="label">Points totaux:</span>
                            <span class="value">{{ member.totalPoints.toLocaleString() }}</span>
                          </div>
                          <div class="stat-item">
                            <span class="label">Points disponibles:</span>
                            <span class="value">{{ member.availablePoints.toLocaleString() }}</span>
                          </div>
                          <div class="stat-item">
                            <span class="label">Montant dépensé:</span>
                            <span class="value">{{ member.totalSpent | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
                          </div>
                          <div class="stat-item">
                            <span class="label">Commandes:</span>
                            <span class="value">{{ member.totalOrders }}</span>
                          </div>
                        </div>

                        <div class="member-actions">
                          <button mat-raised-button (click)="viewMemberDetails(member)">
                            <mat-icon>visibility</mat-icon>
                            Détails
                          </button>
                          <button mat-raised-button (click)="adjustPoints(member)">
                            <mat-icon>edit</mat-icon>
                            Ajuster
                          </button>
                          <button mat-icon-button [matMenuTriggerFor]="memberMenu">
                            <mat-icon>more_vert</mat-icon>
                          </button>
                          
                          <mat-menu #memberMenu="matMenu">
                            <button mat-menu-item (click)="viewMemberHistory(member)">
                              <mat-icon>history</mat-icon>
                              Historique
                            </button>
                            <button mat-menu-item (click)="sendReward(member)">
                              <mat-icon>card_giftcard</mat-icon>
                              Envoyer Récompense
                            </button>
                            <button mat-menu-item (click)="removeMember(member)">
                              <mat-icon>person_remove</mat-icon>
                              Retirer du Programme
                            </button>
                          </mat-menu>
                        </div>
                      </div>

                      <!-- Progression vers le niveau suivant -->
                      @if (member.nextLevelPoints > 0) {
                        <div class="level-progress">
                          <div class="progress-info">
                            <span>Progression vers {{ getNextLevel(member).name }}</span>
                            <span>{{ member.progressToNextLevel }}%</span>
                          </div>
                          <mat-progress-bar 
                            mode="determinate" 
                            [value]="member.progressToNextLevel"
                            [color]="member.currentLevel.color">
                          </mat-progress-bar>
                          <div class="progress-details">
                            <span>{{ member.totalPoints }} / {{ member.nextLevelPoints }} points</span>
                          </div>
                        </div>
                      }
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            </div>
          </mat-tab>

          <!-- Onglet Récompenses -->
          <mat-tab label="Récompenses">
            <div class="tab-content">
              <div class="rewards-header">
                <button mat-raised-button color="primary" (click)="createReward()">
                  <mat-icon>add</mat-icon>
                  Nouvelle Récompense
                </button>
              </div>

              <div class="rewards-list">
                @for (reward of loyaltyProgram.rewards; track reward.id) {
                  <mat-card class="reward-card" [class.inactive]="!reward.isActive">
                    <mat-card-content>
                      <div class="reward-header">
                        <div class="reward-info">
                          @if (reward.image) {
                            <div class="reward-image">
                              <img [src]="reward.image" [alt]="reward.name">
                            </div>
                          }
                          <div class="reward-details">
                            <h4>{{ reward.name }}</h4>
                            <p>{{ reward.description }}</p>
                            <div class="reward-meta">
                              <mat-chip class="points-cost">{{ reward.pointsCost }} points</mat-chip>
                              <mat-chip [ngClass]="'type-' + reward.type">
                                {{ getRewardTypeLabel(reward.type) }}
                              </mat-chip>
                              @if (reward.usageLimit) {
                                <mat-chip class="usage-limit">
                                  {{ reward.usedCount }}/{{ reward.usageLimit }} utilisations
                                </mat-chip>
                              }
                            </div>
                          </div>
                        </div>
                        
                        <div class="reward-status">
                          <mat-chip [ngClass]="reward.isActive ? 'active' : 'inactive'">
                            {{ reward.isActive ? 'Actif' : 'Inactif' }}
                          </mat-chip>
                        </div>

                        <div class="reward-actions">
                          <button mat-raised-button (click)="editReward(reward)">
                            <mat-icon>edit</mat-icon>
                            Modifier
                          </button>
                          <button mat-icon-button [matMenuTriggerFor]="rewardMenu">
                            <mat-icon>more_vert</mat-icon>
                          </button>
                          
                          <mat-menu #rewardMenu="matMenu">
                            <button mat-menu-item (click)="toggleReward(reward)">
                              <mat-icon>{{ reward.isActive ? 'pause' : 'play_arrow' }}</mat-icon>
                              {{ reward.isActive ? 'Désactiver' : 'Activer' }}
                            </button>
                            <button mat-menu-item (click)="viewRewardStats(reward)">
                              <mat-icon>analytics</mat-icon>
                              Statistiques
                            </button>
                            <button mat-menu-item (click)="duplicateReward(reward)">
                              <mat-icon>content_copy</mat-icon>
                              Dupliquer
                            </button>
                            <button mat-menu-item (click)="deleteReward(reward)">
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

          <!-- Onglet Niveaux -->
          <mat-tab label="Niveaux">
            <div class="tab-content">
              <div class="levels-header">
                <button mat-raised-button color="primary" (click)="createLevel()">
                  <mat-icon>add</mat-icon>
                  Nouveau Niveau
                </button>
              </div>

              <div class="levels-list">
                @for (level of loyaltyProgram.levels; track level.id) {
                  <mat-card class="level-card" [style.border-left-color]="level.color">
                    <mat-card-content>
                      <div class="level-header">
                        <div class="level-info">
                          <div class="level-icon" [style.background-color]="level.color">
                            <mat-icon>{{ level.icon }}</mat-icon>
                          </div>
                          <div class="level-details">
                            <h4>{{ level.name }}</h4>
                            <p>{{ level.description }}</p>
                            <div class="level-requirements">
                              <span>{{ level.minPoints }} - {{ level.maxPoints || '∞' }} points</span>
                            </div>
                          </div>
                        </div>
                        
                        <div class="level-benefits">
                          <h5>Avantages :</h5>
                          <ul>
                            @for (benefit of level.benefits; track benefit) {
                              <li>{{ benefit }}</li>
                            }
                          </ul>
                          <div class="benefit-details">
                            @if (level.discountPercentage > 0) {
                              <mat-chip class="discount">{{ level.discountPercentage }}% de réduction</mat-chip>
                            }
                            @if (level.freeShipping) {
                              <mat-chip class="free-shipping">Livraison gratuite</mat-chip>
                            }
                            @if (level.prioritySupport) {
                              <mat-chip class="priority-support">Support prioritaire</mat-chip>
                            }
                          </div>
                        </div>

                        <div class="level-actions">
                          <button mat-raised-button (click)="editLevel(level)">
                            <mat-icon>edit</mat-icon>
                            Modifier
                          </button>
                          <button mat-icon-button [matMenuTriggerFor]="levelMenu">
                            <mat-icon>more_vert</mat-icon>
                          </button>
                          
                          <mat-menu #levelMenu="matMenu">
                            <button mat-menu-item (click)="duplicateLevel(level)">
                              <mat-icon>content_copy</mat-icon>
                              Dupliquer
                            </button>
                            <button mat-menu-item (click)="viewLevelStats(level)">
                              <mat-icon>analytics</mat-icon>
                              Statistiques
                            </button>
                            <button mat-menu-item (click)="deleteLevel(level)">
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

          <!-- Onglet Transactions -->
          <mat-tab label="Transactions">
            <div class="tab-content">
              <!-- Filtres -->
              <div class="transactions-filters">
                <mat-form-field appearance="outline">
                  <mat-label>Type de transaction</mat-label>
                  <mat-select [(ngModel)]="selectedTransactionType" (selectionChange)="filterTransactions()">
                    <mat-option value="all">Tous les types</mat-option>
                    <mat-option value="earned">Points gagnés</mat-option>
                    <mat-option value="redeemed">Points utilisés</mat-option>
                    <mat-option value="expired">Points expirés</mat-option>
                    <mat-option value="adjusted">Ajustements</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Période</mat-label>
                  <mat-select [(ngModel)]="selectedPeriod" (selectionChange)="filterTransactions()">
                    <mat-option value="today">Aujourd'hui</mat-option>
                    <mat-option value="week">Cette semaine</mat-option>
                    <mat-option value="month">Ce mois</mat-option>
                    <mat-option value="quarter">Ce trimestre</mat-option>
                  </mat-select>
                </mat-form-field>

                <button mat-raised-button (click)="exportTransactions()">
                  <mat-icon>download</mat-icon>
                  Exporter
                </button>
              </div>

              <!-- Liste des transactions -->
              <div class="transactions-list">
                @for (transaction of filteredTransactions; track transaction.id) {
                  <mat-card class="transaction-card">
                    <mat-card-content>
                      <div class="transaction-header">
                        <div class="transaction-info">
                          <div class="transaction-icon" [ngClass]="'type-' + transaction.type">
                            <mat-icon>{{ getTransactionIcon(transaction.type) }}</mat-icon>
                          </div>
                          <div class="transaction-details">
                            <h4>{{ transaction.customerName }}</h4>
                            <p>{{ transaction.description }}</p>
                            <small>{{ formatDate(transaction.timestamp) }}</small>
                          </div>
                        </div>
                        
                        <div class="transaction-points" [ngClass]="'type-' + transaction.type">
                          <span class="operator">{{ getTransactionOperator(transaction.type) }}</span>
                          <span class="points">{{ transaction.points.toLocaleString() }}</span>
                          <span class="label">points</span>
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
    .vendor-loyalty {
      background: #f8fafc;
      min-height: 100vh;
    }

    .loyalty-header {
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

    .loyalty-kpis {
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

    .program-config {
      padding: 0 2rem 2rem 2rem;
    }

    .config-card {
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .config-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .form-row mat-form-field {
      flex: 1;
    }

    .description-field {
      width: 100%;
    }

    .toggle-container {
      display: flex;
      align-items: center;
      min-width: 200px;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .loyalty-content {
      padding: 0 2rem 2rem 2rem;
    }

    .tab-content {
      padding: 1.5rem 0;
    }

    .members-filters,
    .transactions-filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 300px;
    }

    .members-list,
    .rewards-list,
    .levels-list,
    .transactions-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .member-card,
    .reward-card,
    .level-card,
    .transaction-card {
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .member-card:hover,
    .reward-card:hover,
    .level-card:hover,
    .transaction-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .member-card.vip {
      border-left: 4px solid #ffd700;
    }

    .reward-card.inactive {
      opacity: 0.6;
    }

    .member-header,
    .reward-header,
    .level-header,
    .transaction-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .member-info,
    .reward-info,
    .level-info,
    .transaction-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
    }

    .member-avatar,
    .reward-image {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      overflow: hidden;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .member-avatar img,
    .reward-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .member-avatar mat-icon {
      font-size: 2rem;
      color: #6b7280;
    }

    .member-details h4,
    .reward-details h4,
    .level-details h4,
    .transaction-details h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1.1rem;
      color: #1f2937;
    }

    .member-details p,
    .reward-details p,
    .level-details p,
    .transaction-details p {
      margin: 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .member-level mat-chip,
    .reward-meta mat-chip,
    .level-requirements span {
      font-size: 0.75rem;
      height: 24px;
    }

    .level-bronze {
      background: #cd7f32;
      color: white;
    }

    .level-silver {
      background: #c0c0c0;
      color: white;
    }

    .level-gold {
      background: #ffd700;
      color: white;
    }

    .level-vip {
      background: #8B2E2E;
      color: white;
    }

    .member-stats {
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

    .member-actions,
    .reward-actions,
    .level-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .level-progress {
      margin-top: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      color: #374151;
    }

    .progress-details {
      text-align: right;
      font-size: 0.8rem;
      color: #6b7280;
      margin-top: 0.5rem;
    }

    .rewards-header,
    .levels-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 2rem;
    }

    .reward-meta {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }

    .points-cost {
      background: #e0e7ff;
      color: #3730a3;
    }

    .type-discount {
      background: #d1fae5;
      color: #065f46;
    }

    .type-free_shipping {
      background: #dbeafe;
      color: #1e40af;
    }

    .type-free_product {
      background: #fef3c7;
      color: #92400e;
    }

    .type-cashback {
      background: #f3e8ff;
      color: #7c3aed;
    }

    .usage-limit {
      background: #f3f4f6;
      color: #374151;
    }

    .active {
      background: #d1fae5;
      color: #065f46;
    }

    .inactive {
      background: #f3f4f6;
      color: #374151;
    }

    .level-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
    }

    .level-benefits {
      flex: 1;
      margin: 0 1rem;
    }

    .level-benefits h5 {
      margin: 0 0 0.5rem 0;
      color: #374151;
      font-size: 0.9rem;
    }

    .level-benefits ul {
      margin: 0 0 0.5rem 0;
      padding-left: 1rem;
      color: #6b7280;
      font-size: 0.85rem;
    }

    .benefit-details {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .discount {
      background: #d1fae5;
      color: #065f46;
    }

    .free-shipping {
      background: #dbeafe;
      color: #1e40af;
    }

    .priority-support {
      background: #fef3c7;
      color: #92400e;
    }

    .transaction-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
    }

    .type-earned {
      background: #4caf50;
    }

    .type-redeemed {
      background: #f44336;
    }

    .type-expired {
      background: #9e9e9e;
    }

    .type-adjusted {
      background: #ff9800;
    }

    .transaction-points {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
    }

    .transaction-points.type-earned {
      color: #4caf50;
    }

    .transaction-points.type-redeemed {
      color: #f44336;
    }

    .transaction-points.type-expired {
      color: #9e9e9e;
    }

    .transaction-points.type-adjusted {
      color: #ff9800;
    }

    .operator {
      font-size: 1.2rem;
      font-weight: 600;
    }

    .points {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .label {
      font-size: 0.8rem;
      color: #6b7280;
    }

    @media (max-width: 768px) {
      .loyalty-kpis {
        grid-template-columns: 1fr;
      }

      .form-row {
        flex-direction: column;
        align-items: stretch;
      }

      .members-filters,
      .transactions-filters {
        flex-direction: column;
      }

      .search-field {
        min-width: auto;
      }

      .member-header,
      .reward-header,
      .level-header,
      .transaction-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .member-actions,
      .reward-actions,
      .level-actions {
        justify-content: center;
      }

      .member-stats {
        min-width: auto;
      }
    }
  `]
})
export class VendorLoyaltyComponent implements OnInit {
  searchQuery: string = '';
  selectedLevel: string = 'all';
  selectedTransactionType: string = 'all';
  selectedPeriod: string = 'month';
  sortBy: string = 'points';

  loyaltyProgram: LoyaltyProgram = {
    id: '1',
    name: 'Programme Fidélité AfrikMode',
    description: 'Gagnez des points à chaque achat et échangez-les contre des récompenses exclusives !',
    isActive: true,
    pointsPerCurrency: 1,
    currencyThreshold: 1000,
    levels: [
      {
        id: '1',
        name: 'Bronze',
        description: 'Niveau de base',
        minPoints: 0,
        maxPoints: 999,
        benefits: ['1 point par FCFA dépensé'],
        color: '#cd7f32',
        icon: 'looks_one',
        discountPercentage: 0,
        freeShipping: false,
        prioritySupport: false
      },
      {
        id: '2',
        name: 'Silver',
        description: 'Niveau intermédiaire',
        minPoints: 1000,
        maxPoints: 4999,
        benefits: ['1.2 points par FCFA dépensé', '5% de réduction'],
        color: '#c0c0c0',
        icon: 'looks_two',
        discountPercentage: 5,
        freeShipping: false,
        prioritySupport: false
      },
      {
        id: '3',
        name: 'Gold',
        description: 'Niveau avancé',
        minPoints: 5000,
        maxPoints: 9999,
        benefits: ['1.5 points par FCFA dépensé', '10% de réduction', 'Livraison gratuite'],
        color: '#ffd700',
        icon: 'looks_3',
        discountPercentage: 10,
        freeShipping: true,
        prioritySupport: false
      },
      {
        id: '4',
        name: 'VIP',
        description: 'Niveau premium',
        minPoints: 10000,
        maxPoints: 999999,
        benefits: ['2 points par FCFA dépensé', '15% de réduction', 'Livraison gratuite', 'Support prioritaire'],
        color: '#8B2E2E',
        icon: 'star',
        discountPercentage: 15,
        freeShipping: true,
        prioritySupport: true
      }
    ],
    rewards: [
      {
        id: '1',
        name: 'Réduction 10%',
        description: 'Obtenez 10% de réduction sur votre prochaine commande',
        pointsCost: 1000,
        type: 'discount',
        value: 10,
        isActive: true,
        usedCount: 45
      },
      {
        id: '2',
        name: 'Livraison Gratuite',
        description: 'Livraison gratuite sur votre prochaine commande',
        pointsCost: 500,
        type: 'free_shipping',
        value: 0,
        isActive: true,
        usedCount: 23
      },
      {
        id: '3',
        name: 'Produit Gratuit',
        description: 'Obtenez un accessoire gratuit (valeur 5000 FCFA)',
        pointsCost: 2000,
        type: 'free_product',
        value: 5000,
        isActive: true,
        usedCount: 12
      }
    ],
    rules: [
      {
        id: '1',
        name: 'Points d\'inscription',
        description: '100 points bonus à l\'inscription',
        trigger: 'signup',
        points: 100,
        conditions: {},
        isActive: true
      },
      {
        id: '2',
        name: 'Points d\'achat',
        description: 'Points basés sur le montant dépensé',
        trigger: 'purchase',
        points: 0,
        multiplier: 1,
        conditions: { minAmount: 1000 },
        isActive: true
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  loyaltyCustomers: LoyaltyCustomer[] = [
    {
      id: '1',
      name: 'Marie Kouassi',
      email: 'marie.kouassi@email.com',
      avatar: '/assets/images/avatars/marie.jpg',
      currentLevel: this.loyaltyProgram.levels[2], // Gold
      totalPoints: 7500,
      availablePoints: 3200,
      usedPoints: 4300,
      joinDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      totalSpent: 150000,
      totalOrders: 8,
      nextLevelPoints: 10000,
      progressToNextLevel: 75
    },
    {
      id: '2',
      name: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      currentLevel: this.loyaltyProgram.levels[1], // Silver
      totalPoints: 2500,
      availablePoints: 1800,
      usedPoints: 700,
      joinDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      totalSpent: 45000,
      totalOrders: 3,
      nextLevelPoints: 5000,
      progressToNextLevel: 50
    }
  ];

  filteredMembers: LoyaltyCustomer[] = [];

  loyaltyTransactions: LoyaltyTransaction[] = [
    {
      id: '1',
      customerId: '1',
      customerName: 'Marie Kouassi',
      type: 'earned',
      points: 500,
      description: 'Points gagnés - Commande #CMD-001',
      orderId: 'CMD-001',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
    },
    {
      id: '2',
      customerId: '1',
      customerName: 'Marie Kouassi',
      type: 'redeemed',
      points: 1000,
      description: 'Réduction 10% utilisée',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
    }
  ];

  filteredTransactions: LoyaltyTransaction[] = [];

  loyaltyStats: LoyaltyStats = {
    totalMembers: 156,
    activeMembers: 89,
    totalPointsIssued: 125000,
    totalPointsRedeemed: 45000,
    averagePointsPerCustomer: 800,
    topLevel: 'Gold',
    conversionRate: 68,
    retentionRate: 85
  };

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private vendorService: VendorService
  ) {}

  ngOnInit(): void {
    this.filteredMembers = this.loyaltyCustomers;
    this.filteredTransactions = this.loyaltyTransactions;
    this.loadLoyaltyProgram();
  }

  loadLoyaltyProgram(): void {
    this.vendorService.getLoyaltyProgram().subscribe({
      next: (response) => {
        if (response && response.program) {
          this.loyaltyProgram = response.program;
        }
        console.log('✅ Programme de fidélité chargé');
      },
      error: (error) => {
        console.error('❌ Erreur chargement fidélité:', error);
        // Garder les données de démonstration
      }
    });
  }

  filterMembers(): void {
    this.filteredMembers = this.loyaltyCustomers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           member.email.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesLevel = this.selectedLevel === 'all' || member.currentLevel.id === this.selectedLevel;
      return matchesSearch && matchesLevel;
    });
  }

  sortMembers(): void {
    this.filteredMembers.sort((a, b) => {
      switch (this.sortBy) {
        case 'points':
          return b.totalPoints - a.totalPoints;
        case 'spent':
          return b.totalSpent - a.totalSpent;
        case 'orders':
          return b.totalOrders - a.totalOrders;
        case 'joinDate':
          return b.joinDate.getTime() - a.joinDate.getTime();
        default:
          return 0;
      }
    });
  }

  filterTransactions(): void {
    this.filteredTransactions = this.loyaltyTransactions.filter(transaction => {
      const matchesType = this.selectedTransactionType === 'all' || transaction.type === this.selectedTransactionType;
      return matchesType;
    });
  }

  getNextLevel(member: LoyaltyCustomer): LoyaltyLevel {
    const currentIndex = this.loyaltyProgram.levels.findIndex(level => level.id === member.currentLevel.id);
    return this.loyaltyProgram.levels[currentIndex + 1] || member.currentLevel;
  }

  getRewardTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'discount': 'Réduction',
      'free_shipping': 'Livraison gratuite',
      'free_product': 'Produit gratuit',
      'cashback': 'Cashback'
    };
    return labels[type] || type;
  }

  getTransactionIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'earned': 'add',
      'redeemed': 'remove',
      'expired': 'schedule',
      'adjusted': 'edit'
    };
    return icons[type] || 'help';
  }

  getTransactionOperator(type: string): string {
    const operators: { [key: string]: string } = {
      'earned': '+',
      'redeemed': '-',
      'expired': '-',
      'adjusted': '±'
    };
    return operators[type] || '';
  }

  formatDate(timestamp: Date): string {
    return timestamp.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  saveProgramConfig(): void {
    this.loyaltyProgram.updatedAt = new Date();
    this.snackBar.open('Configuration sauvegardée', 'Fermer', { duration: 3000 });
  }

  resetProgramConfig(): void {
    this.snackBar.open('Configuration réinitialisée', 'Fermer', { duration: 3000 });
  }

  createReward(): void {
    const dialogRef = this.dialog.open(RewardConfigDialogComponent, {
      width: '700px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const reward: LoyaltyReward = {
          id: Date.now().toString(),
          name: result.name,
          description: result.description,
          pointsCost: result.pointsCost,
          type: result.type,
          value: result.value,
          isActive: result.isActive,
          usageLimit: result.usageLimit,
          validUntil: result.validUntil,
          usedCount: 0
        };

        this.loyaltyProgram.rewards.unshift(reward);
        this.snackBar.open('Récompense créée', 'Fermer', { duration: 3000 });
      }
    });
  }

  editReward(reward: LoyaltyReward): void {
    console.log('✏️ Modifier la récompense:', reward.name);
    // Logique pour modifier la récompense
  }

  toggleReward(reward: LoyaltyReward): void {
    reward.isActive = !reward.isActive;
    this.snackBar.open(
      `Récompense ${reward.isActive ? 'activée' : 'désactivée'}`,
      'Fermer',
      { duration: 3000 }
    );
  }

  viewRewardStats(reward: LoyaltyReward): void {
    console.log('📊 Statistiques de la récompense:', reward.name);
    // Logique pour afficher les statistiques
  }

  duplicateReward(reward: LoyaltyReward): void {
    console.log('📋 Dupliquer la récompense:', reward.name);
    // Logique pour dupliquer la récompense
  }

  deleteReward(reward: LoyaltyReward): void {
    console.log('🗑️ Supprimer la récompense:', reward.name);
    // Logique pour supprimer la récompense
  }

  createLevel(): void {
    const dialogRef = this.dialog.open(LevelConfigDialogComponent, {
      width: '800px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const level: LoyaltyLevel = {
          id: Date.now().toString(),
          name: result.name,
          description: result.description,
          minPoints: result.minPoints,
          maxPoints: result.maxPoints,
          benefits: this.getBenefitsList(result),
          color: result.color,
          icon: result.icon,
          discountPercentage: result.discountPercentage,
          freeShipping: result.freeShipping,
          prioritySupport: result.prioritySupport
        };

        this.loyaltyProgram.levels.unshift(level);
        this.snackBar.open('Niveau créé', 'Fermer', { duration: 3000 });
      }
    });
  }

  editLevel(level: LoyaltyLevel): void {
    console.log('✏️ Modifier le niveau:', level.name);
    // Logique pour modifier le niveau
  }

  duplicateLevel(level: LoyaltyLevel): void {
    console.log('📋 Dupliquer le niveau:', level.name);
    // Logique pour dupliquer le niveau
  }

  viewLevelStats(level: LoyaltyLevel): void {
    console.log('📊 Statistiques du niveau:', level.name);
    // Logique pour afficher les statistiques
  }

  deleteLevel(level: LoyaltyLevel): void {
    console.log('🗑️ Supprimer le niveau:', level.name);
    // Logique pour supprimer le niveau
  }

  viewMemberDetails(member: LoyaltyCustomer): void {
    console.log('👁️ Détails du membre:', member.name);
    // Logique pour afficher les détails
  }

  adjustPoints(member: LoyaltyCustomer): void {
    console.log('✏️ Ajuster les points de:', member.name);
    // Logique pour ajuster les points
  }

  viewMemberHistory(member: LoyaltyCustomer): void {
    console.log('📊 Historique de:', member.name);
    // Logique pour afficher l'historique
  }

  sendReward(member: LoyaltyCustomer): void {
    console.log('🎁 Envoyer une récompense à:', member.name);
    // Logique pour envoyer une récompense
  }

  removeMember(member: LoyaltyCustomer): void {
    console.log('👋 Retirer du programme:', member.name);
    // Logique pour retirer du programme
  }

  exportTransactions(): void {
    console.log('📊 Exporter les transactions');
    // Logique d'export
  }

  openSettings(): void {
    console.log('⚙️ Ouvrir les paramètres du programme');
    // Logique pour ouvrir les paramètres
  }

  // Méthodes utilitaires
  getLevelColor(level: LoyaltyLevel): string {
    return level.color || '#8B2E2E';
  }

  getRewardTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'discount': 'percent',
      'free_shipping': 'local_shipping',
      'free_product': 'card_giftcard',
      'cashback': 'account_balance_wallet'
    };
    return icons[type] || 'loyalty';
  }

  getTransactionTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'earned': 'add_circle',
      'redeemed': 'remove_circle',
      'expired': 'schedule',
      'adjusted': 'edit'
    };
    return icons[type] || 'loyalty';
  }

  getTransactionTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'earned': 'primary',
      'redeemed': 'warn',
      'expired': 'accent',
      'adjusted': 'primary'
    };
    return colors[type] || 'primary';
  }

  getTransactionTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'earned': 'Gagné',
      'redeemed': 'Utilisé',
      'expired': 'Expiré',
      'adjusted': 'Ajusté'
    };
    return labels[type] || type;
  }

  calculateProgressToNextLevel(member: LoyaltyCustomer): number {
    if (member.nextLevelPoints <= 0) return 100;
    return Math.min(100, (member.totalPoints / member.nextLevelPoints) * 100);
  }

  formatPoints(points: number): string {
    return new Intl.NumberFormat('fr-FR').format(points);
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

  getMemberStatus(member: LoyaltyCustomer): string {
    const daysSinceLastActivity = Math.floor(
      (new Date().getTime() - member.lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastActivity <= 7) return 'active';
    if (daysSinceLastActivity <= 30) return 'inactive';
    return 'dormant';
  }

  getMemberStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'active': 'primary',
      'inactive': 'warn',
      'dormant': 'accent'
    };
    return colors[status] || 'primary';
  }

  getMemberStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Actif',
      'inactive': 'Inactif',
      'dormant': 'Dormant'
    };
    return labels[status] || status;
  }

  getBenefitsList(result: any): string[] {
    const benefits: string[] = [];
    if (result.freeShipping) benefits.push('Livraison gratuite');
    if (result.prioritySupport) benefits.push('Support prioritaire');
    if (result.earlyAccess) benefits.push('Accès anticipé');
    if (result.exclusiveOffers) benefits.push('Offres exclusives');
    if (result.birthdayReward) benefits.push('Cadeau d\'anniversaire');
    return benefits;
  }
}
