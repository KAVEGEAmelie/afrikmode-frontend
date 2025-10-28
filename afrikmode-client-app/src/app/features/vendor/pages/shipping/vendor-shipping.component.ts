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
import { MatTableModule } from '@angular/material/table';
import { MatStepperModule } from '@angular/material/stepper';
import { ZoneConfigDialogComponent } from './zone-config-dialog.component';
import { CarrierConfigDialogComponent } from './carrier-config-dialog.component';
import { LabelGeneratorDialogComponent } from './label-generator-dialog.component';
import { ShippingSettingsDialogComponent } from './shipping-settings-dialog.component';
import { VendorService } from '../../../../core/services/vendor.service';

interface ShippingOrder {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  address: {
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
  };
  items: {
    name: string;
    quantity: number;
    weight: number;
    value: number;
  }[];
  carrier: {
    name: string;
    service: string;
    trackingNumber?: string;
  };
  status: 'pending' | 'preparing' | 'shipped' | 'in_transit' | 'delivered' | 'returned' | 'cancelled';
  shippingDate?: Date;
  deliveryDate?: Date;
  estimatedDelivery?: Date;
  totalWeight: number;
  totalValue: number;
  shippingCost: number;
  notes?: string;
}

interface Carrier {
  id: string;
  name: string;
  logo: string;
  services: {
    name: string;
    description: string;
    estimatedDays: number;
    cost: number;
    maxWeight: number;
    maxDimensions: string;
  }[];
  isActive: boolean;
  rating: number;
}

interface DeliveryZone {
  id: string;
  name: string;
  regions: string[];
  deliveryTime: number;
  cost: number;
  freeShippingThreshold: number;
  isActive: boolean;
}

interface ShippingLabel {
  id: string;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  labelUrl: string;
  qrCode: string;
  createdAt: Date;
  status: 'generated' | 'printed' | 'shipped';
}

interface ReturnRequest {
  id: string;
  orderId: string;
  customer: {
    name: string;
    email: string;
  };
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requestedDate: Date;
  processedDate?: Date;
  items: {
    name: string;
    quantity: number;
    reason: string;
  }[];
  refundAmount: number;
}

@Component({
  selector: 'app-vendor-shipping',
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
    MatTableModule,
    MatStepperModule
  ],
  template: `
    <div class="vendor-shipping">
      <!-- Header -->
      <div class="shipping-header">
        <div class="header-content">
          <h1>
            <mat-icon>local_shipping</mat-icon>
            Gestion Livraison Avancée
          </h1>
          <p>Gérez vos expéditions, transporteurs et zones de livraison</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="createShippingLabel()">
            <mat-icon>print</mat-icon>
            Générer Étiquette
          </button>
          <button mat-raised-button (click)="openSettings()">
            <mat-icon>settings</mat-icon>
            Paramètres
          </button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="shipping-kpis">
        <mat-card class="kpi-card">
          <mat-card-content>
            <div class="kpi-header">
              <mat-icon class="kpi-icon">local_shipping</mat-icon>
              <div class="kpi-info">
                <h3>Commandes à Expédier</h3>
                <p>{{ pendingShipments }} commandes</p>
              </div>
            </div>
            <div class="kpi-value">
              <span class="value">{{ pendingShipments }}</span>
              <span class="subtitle">En attente</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card">
          <mat-card-content>
            <div class="kpi-header">
              <mat-icon class="kpi-icon">trending_up</mat-icon>
              <div class="kpi-info">
                <h3>Expédiées Aujourd'hui</h3>
                <p>{{ shippedToday }} commandes</p>
              </div>
            </div>
            <div class="kpi-value">
              <span class="value">{{ shippedToday }}</span>
              <span class="subtitle">Commandes</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card">
          <mat-card-content>
            <div class="kpi-header">
              <mat-icon class="kpi-icon">schedule</mat-icon>
              <div class="kpi-info">
                <h3>Délai Moyen</h3>
                <p>{{ averageDeliveryTime }} jours</p>
              </div>
            </div>
            <div class="kpi-value">
              <span class="value">{{ averageDeliveryTime }}</span>
              <span class="subtitle">Jours</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card">
          <mat-card-content>
            <div class="kpi-header">
              <mat-icon class="kpi-icon">assignment_return</mat-icon>
              <div class="kpi-info">
                <h3>Retours</h3>
                <p>{{ pendingReturns }} en attente</p>
              </div>
            </div>
            <div class="kpi-value">
              <span class="value">{{ pendingReturns }}</span>
              <span class="subtitle">En attente</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Contenu principal -->
      <div class="shipping-content">
        <mat-tab-group>
          <!-- Onglet Commandes à Expédier -->
          <mat-tab label="À Expédier">
            <div class="tab-content">
              <!-- Filtres -->
              <div class="shipping-filters">
                <mat-form-field appearance="outline" class="search-field">
                  <mat-label>Rechercher une commande</mat-label>
                  <input matInput [(ngModel)]="searchQuery" (input)="filterOrders()">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>

                <mat-select [(ngModel)]="selectedStatus" (selectionChange)="filterOrders()" placeholder="Statut">
                  <mat-option value="all">Tous les statuts</mat-option>
                  <mat-option value="pending">En attente</mat-option>
                  <mat-option value="preparing">En préparation</mat-option>
                  <mat-option value="shipped">Expédiée</mat-option>
                </mat-select>

                <mat-select [(ngModel)]="selectedCarrier" (selectionChange)="filterOrders()" placeholder="Transporteur">
                  <mat-option value="all">Tous les transporteurs</mat-option>
                  @for (carrier of carriers; track carrier.id) {
                    <mat-option [value]="carrier.id">{{ carrier.name }}</mat-option>
                  }
                </mat-select>

                <button mat-raised-button (click)="bulkShip()">
                  <mat-icon>local_shipping</mat-icon>
                  Expédier en Lot
                </button>
              </div>

              <!-- Liste des commandes -->
              <div class="orders-list">
                @for (order of filteredOrders; track order.id) {
                  <mat-card class="order-card" [class.pending]="order.status === 'pending'" [class.preparing]="order.status === 'preparing'">
                    <mat-card-content>
                      <div class="order-header">
                        <div class="order-info">
                          <h4>Commande #{{ order.orderNumber }}</h4>
                          <p>{{ order.customer.name }} - {{ order.customer.email }}</p>
                          <div class="order-details">
                            <span><mat-icon>location_on</mat-icon> {{ order.address.city }}, {{ order.address.state }}</span>
                            <span><mat-icon>inventory</mat-icon> {{ order.items.length }} articles</span>
                            <span><mat-icon>scale</mat-icon> {{ order.totalWeight }}kg</span>
                            <span><mat-icon>attach_money</mat-icon> {{ order.totalValue | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
                          </div>
                        </div>
                        
                        <div class="order-status">
                          <mat-chip [ngClass]="'status-' + order.status">
                            {{ getStatusLabel(order.status) }}
                          </mat-chip>
                          @if (order.carrier.trackingNumber) {
                            <div class="tracking-info">
                              <small>Suivi: {{ order.carrier.trackingNumber }}</small>
                            </div>
                          }
                        </div>

                        <div class="order-actions">
                          @if (order.status === 'pending') {
                            <button mat-raised-button color="primary" (click)="prepareOrder(order)">
                              <mat-icon>inventory_2</mat-icon>
                              Préparer
                            </button>
                          }
                          @if (order.status === 'preparing') {
                            <button mat-raised-button color="primary" (click)="shipOrder(order)">
                              <mat-icon>local_shipping</mat-icon>
                              Expédier
                            </button>
                          }
                          <button mat-raised-button (click)="generateLabel(order)">
                            <mat-icon>print</mat-icon>
                            Étiquette
                          </button>
                          <button mat-icon-button [matMenuTriggerFor]="orderMenu">
                            <mat-icon>more_vert</mat-icon>
                          </button>
                          
                          <mat-menu #orderMenu="matMenu">
                            <button mat-menu-item (click)="viewOrderDetails(order)">
                              <mat-icon>visibility</mat-icon>
                              Détails
                            </button>
                            <button mat-menu-item (click)="editOrder(order)">
                              <mat-icon>edit</mat-icon>
                              Modifier
                            </button>
                            <button mat-menu-item (click)="trackOrder(order)">
                              <mat-icon>track_changes</mat-icon>
                              Suivre
                            </button>
                            <button mat-menu-item (click)="cancelOrder(order)">
                              <mat-icon>cancel</mat-icon>
                              Annuler
                            </button>
                          </mat-menu>
                        </div>
                      </div>

                      <!-- Détails des articles -->
                      <div class="order-items">
                        <h5>Articles à expédier :</h5>
                        <div class="items-list">
                          @for (item of order.items; track item.name) {
                            <div class="item-row">
                              <span class="item-name">{{ item.name }}</span>
                              <span class="item-quantity">x{{ item.quantity }}</span>
                              <span class="item-weight">{{ item.weight }}kg</span>
                              <span class="item-value">{{ item.value | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
                            </div>
                          }
                        </div>
                      </div>

                      <!-- Adresse de livraison -->
                      <div class="delivery-address">
                        <h5>Adresse de livraison :</h5>
                        <p>{{ order.address.address_line_1 }}</p>
                        <p>{{ order.address.postal_code }} {{ order.address.city }}</p>
                        <p>{{ order.address.state }}, {{ order.address.country }}</p>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            </div>
          </mat-tab>

          <!-- Onglet Transporteurs -->
          <mat-tab label="Transporteurs">
            <div class="tab-content">
              <div class="carriers-header">
                <button mat-raised-button color="primary" (click)="addCarrier()">
                  <mat-icon>add</mat-icon>
                  Nouveau Transporteur
                </button>
              </div>

              <div class="carriers-list">
                @for (carrier of carriers; track carrier.id) {
                  <mat-card class="carrier-card">
                    <mat-card-content>
                      <div class="carrier-header">
                        <div class="carrier-info">
                          <div class="carrier-logo">
                            <img [src]="carrier.logo" [alt]="carrier.name">
                          </div>
                          <div class="carrier-details">
                            <h4>{{ carrier.name }}</h4>
                            <div class="carrier-rating">
                              @for (star of [1,2,3,4,5]; track star) {
                                <mat-icon [class.filled]="star <= carrier.rating">
                                  {{ star <= carrier.rating ? 'star' : 'star_border' }}
                                </mat-icon>
                              }
                              <span>{{ carrier.rating }}/5</span>
                            </div>
                            <div class="carrier-status">
                              <mat-chip [ngClass]="carrier.isActive ? 'active' : 'inactive'">
                                {{ carrier.isActive ? 'Actif' : 'Inactif' }}
                              </mat-chip>
                            </div>
                          </div>
                        </div>

                        <div class="carrier-actions">
                          <button mat-raised-button (click)="configureCarrier(carrier)">
                            <mat-icon>settings</mat-icon>
                            Configurer
                          </button>
                          <button mat-icon-button [matMenuTriggerFor]="carrierMenu">
                            <mat-icon>more_vert</mat-icon>
                          </button>
                          
                          <mat-menu #carrierMenu="matMenu">
                            <button mat-menu-item (click)="editCarrier(carrier)">
                              <mat-icon>edit</mat-icon>
                              Modifier
                            </button>
                            <button mat-menu-item (click)="viewCarrierStats(carrier)">
                              <mat-icon>analytics</mat-icon>
                              Statistiques
                            </button>
                            <button mat-menu-item (click)="toggleCarrier(carrier)">
                              <mat-icon>{{ carrier.isActive ? 'pause' : 'play_arrow' }}</mat-icon>
                              {{ carrier.isActive ? 'Désactiver' : 'Activer' }}
                            </button>
                          </mat-menu>
                        </div>
                      </div>

                      <!-- Services du transporteur -->
                      <div class="carrier-services">
                        <h5>Services disponibles :</h5>
                        <div class="services-list">
                          @for (service of carrier.services; track service.name) {
                            <div class="service-item">
                              <div class="service-info">
                                <span class="service-name">{{ service.name }}</span>
                                <span class="service-description">{{ service.description }}</span>
                              </div>
                              <div class="service-details">
                                <span>{{ service.estimatedDays }} jours</span>
                                <span>{{ service.cost | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
                                <span>Max: {{ service.maxWeight }}kg</span>
                              </div>
                            </div>
                          }
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            </div>
          </mat-tab>

          <!-- Onglet Zones de Livraison -->
          <mat-tab label="Zones de Livraison">
            <div class="tab-content">
              <div class="zones-header">
                <button mat-raised-button color="primary" (click)="addDeliveryZone()">
                  <mat-icon>add</mat-icon>
                  Nouvelle Zone
                </button>
              </div>

              <div class="zones-list">
                @for (zone of deliveryZones; track zone.id) {
                  <mat-card class="zone-card">
                    <mat-card-content>
                      <div class="zone-header">
                        <div class="zone-info">
                          <h4>{{ zone.name }}</h4>
                          <p>{{ zone.regions.join(', ') }}</p>
                          <div class="zone-details">
                            <span><mat-icon>schedule</mat-icon> {{ zone.deliveryTime }} jours</span>
                            <span><mat-icon>attach_money</mat-icon> {{ zone.cost | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
                            <span><mat-icon>free_breakfast</mat-icon> Gratuit dès {{ zone.freeShippingThreshold | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
                          </div>
                        </div>
                        
                        <div class="zone-status">
                          <mat-chip [ngClass]="zone.isActive ? 'active' : 'inactive'">
                            {{ zone.isActive ? 'Active' : 'Inactive' }}
                          </mat-chip>
                        </div>

                        <div class="zone-actions">
                          <button mat-raised-button (click)="editZone(zone)">
                            <mat-icon>edit</mat-icon>
                            Modifier
                          </button>
                          <button mat-icon-button [matMenuTriggerFor]="zoneMenu">
                            <mat-icon>more_vert</mat-icon>
                          </button>
                          
                          <mat-menu #zoneMenu="matMenu">
                            <button mat-menu-item (click)="duplicateZone(zone)">
                              <mat-icon>content_copy</mat-icon>
                              Dupliquer
                            </button>
                            <button mat-menu-item (click)="toggleZone(zone)">
                              <mat-icon>{{ zone.isActive ? 'pause' : 'play_arrow' }}</mat-icon>
                              {{ zone.isActive ? 'Désactiver' : 'Activer' }}
                            </button>
                            <button mat-menu-item (click)="deleteZone(zone)">
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

          <!-- Onglet Retours -->
          <mat-tab label="Retours">
            <div class="tab-content">
              <div class="returns-list">
                @for (returnRequest of returnRequests; track returnRequest.id) {
                  <mat-card class="return-card" [class.pending]="returnRequest.status === 'pending'" [class.approved]="returnRequest.status === 'approved'">
                    <mat-card-content>
                      <div class="return-header">
                        <div class="return-info">
                          <h4>Retour #{{ returnRequest.id }}</h4>
                          <p>Commande #{{ returnRequest.orderId }} - {{ returnRequest.customer.name }}</p>
                          <div class="return-details">
                            <span><mat-icon>schedule</mat-icon> Demandé le {{ formatDate(returnRequest.requestedDate) }}</span>
                            <span><mat-icon>attach_money</mat-icon> {{ returnRequest.refundAmount | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
                            <span><mat-icon>inventory</mat-icon> {{ returnRequest.items.length }} articles</span>
                          </div>
                        </div>
                        
                        <div class="return-status">
                          <mat-chip [ngClass]="'status-' + returnRequest.status">
                            {{ getReturnStatusLabel(returnRequest.status) }}
                          </mat-chip>
                        </div>

                        <div class="return-actions">
                          @if (returnRequest.status === 'pending') {
                            <button mat-raised-button color="primary" (click)="approveReturn(returnRequest)">
                              <mat-icon>check</mat-icon>
                              Approuver
                            </button>
                            <button mat-raised-button (click)="rejectReturn(returnRequest)">
                              <mat-icon>close</mat-icon>
                              Rejeter
                            </button>
                          }
                          <button mat-raised-button (click)="viewReturnDetails(returnRequest)">
                            <mat-icon>visibility</mat-icon>
                            Détails
                          </button>
                        </div>
                      </div>

                      <!-- Raison du retour -->
                      <div class="return-reason">
                        <h5>Raison du retour :</h5>
                        <p>{{ returnRequest.reason }}</p>
                      </div>

                      <!-- Articles concernés -->
                      <div class="return-items">
                        <h5>Articles à retourner :</h5>
                        <div class="items-list">
                          @for (item of returnRequest.items; track item.name) {
                            <div class="item-row">
                              <span class="item-name">{{ item.name }}</span>
                              <span class="item-quantity">x{{ item.quantity }}</span>
                              <span class="item-reason">{{ item.reason }}</span>
                            </div>
                          }
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
    .vendor-shipping {
      background: #f8fafc;
      min-height: 100vh;
    }

    .shipping-header {
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

    .shipping-kpis {
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

    .shipping-content {
      padding: 0 2rem 2rem 2rem;
    }

    .tab-content {
      padding: 1.5rem 0;
    }

    .shipping-filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 300px;
    }

    .orders-list,
    .carriers-list,
    .zones-list,
    .returns-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .order-card,
    .carrier-card,
    .zone-card,
    .return-card {
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .order-card:hover,
    .carrier-card:hover,
    .zone-card:hover,
    .return-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .order-card.pending {
      border-left: 4px solid #ff9800;
    }

    .order-card.preparing {
      border-left: 4px solid #2196f3;
    }

    .return-card.pending {
      border-left: 4px solid #ff9800;
    }

    .return-card.approved {
      border-left: 4px solid #4caf50;
    }

    .order-header,
    .carrier-header,
    .zone-header,
    .return-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .order-info,
    .carrier-info,
    .zone-info,
    .return-info {
      flex: 1;
    }

    .order-info h4,
    .carrier-info h4,
    .zone-info h4,
    .return-info h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1.1rem;
      color: #1f2937;
    }

    .order-info p,
    .carrier-info p,
    .zone-info p,
    .return-info p {
      margin: 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .order-details,
    .zone-details,
    .return-details {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }

    .order-details span,
    .zone-details span,
    .return-details span {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.85rem;
      color: #6b7280;
    }

    .order-status,
    .carrier-status,
    .zone-status,
    .return-status {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .order-status mat-chip,
    .carrier-status mat-chip,
    .zone-status mat-chip,
    .return-status mat-chip {
      font-size: 0.75rem;
      height: 24px;
    }

    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .status-preparing {
      background: #dbeafe;
      color: #1e40af;
    }

    .status-shipped {
      background: #d1fae5;
      color: #065f46;
    }

    .status-in_transit {
      background: #e0e7ff;
      color: #3730a3;
    }

    .status-delivered {
      background: #d1fae5;
      color: #065f46;
    }

    .status-returned {
      background: #fef2f2;
      color: #dc2626;
    }

    .status-cancelled {
      background: #f3f4f6;
      color: #374151;
    }

    .status-approved {
      background: #d1fae5;
      color: #065f46;
    }

    .status-rejected {
      background: #fee2e2;
      color: #991b1b;
    }

    .status-processed {
      background: #e0e7ff;
      color: #3730a3;
    }

    .active {
      background: #d1fae5;
      color: #065f46;
    }

    .inactive {
      background: #f3f4f6;
      color: #374151;
    }

    .tracking-info {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .order-actions,
    .carrier-actions,
    .zone-actions,
    .return-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .order-items,
    .return-items {
      margin-top: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .order-items h5,
    .return-items h5 {
      margin: 0 0 0.5rem 0;
      color: #374151;
      font-size: 0.9rem;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: white;
      border-radius: 4px;
      font-size: 0.85rem;
    }

    .item-name {
      flex: 1;
      font-weight: 500;
      color: #1f2937;
    }

    .item-quantity,
    .item-weight,
    .item-value,
    .item-reason {
      margin-left: 1rem;
      color: #6b7280;
    }

    .delivery-address {
      margin-top: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .delivery-address h5 {
      margin: 0 0 0.5rem 0;
      color: #374151;
      font-size: 0.9rem;
    }

    .delivery-address p {
      margin: 0;
      color: #6b7280;
      font-size: 0.85rem;
    }

    .carrier-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .carrier-logo {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      background: #e5e7eb;
    }

    .carrier-logo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .carrier-details h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1.1rem;
      color: #1f2937;
    }

    .carrier-rating {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin-bottom: 0.5rem;
    }

    .carrier-rating mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .carrier-rating mat-icon.filled {
      color: #ffc107;
    }

    .carrier-rating mat-icon:not(.filled) {
      color: #d1d5db;
    }

    .carrier-rating span {
      font-size: 0.85rem;
      color: #6b7280;
      margin-left: 0.5rem;
    }

    .carrier-services {
      margin-top: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .carrier-services h5 {
      margin: 0 0 0.5rem 0;
      color: #374151;
      font-size: 0.9rem;
    }

    .services-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .service-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: white;
      border-radius: 4px;
    }

    .service-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .service-name {
      font-weight: 500;
      color: #1f2937;
      font-size: 0.9rem;
    }

    .service-description {
      color: #6b7280;
      font-size: 0.8rem;
    }

    .service-details {
      display: flex;
      gap: 1rem;
      font-size: 0.8rem;
      color: #6b7280;
    }

    .zone-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-top: 0.5rem;
    }

    .zone-details span {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.85rem;
      color: #6b7280;
    }

    .return-reason {
      margin-top: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .return-reason h5 {
      margin: 0 0 0.5rem 0;
      color: #374151;
      font-size: 0.9rem;
    }

    .return-reason p {
      margin: 0;
      color: #6b7280;
      font-size: 0.85rem;
    }

    .carriers-header,
    .zones-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 2rem;
    }

    @media (max-width: 768px) {
      .shipping-kpis {
        grid-template-columns: 1fr;
      }

      .shipping-filters {
        flex-direction: column;
      }

      .search-field {
        min-width: auto;
      }

      .order-header,
      .carrier-header,
      .zone-header,
      .return-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .order-actions,
      .carrier-actions,
      .zone-actions,
      .return-actions {
        justify-content: center;
      }

      .order-details,
      .zone-details,
      .return-details {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class VendorShippingComponent implements OnInit {
  searchQuery: string = '';
  selectedStatus: string = 'all';
  selectedCarrier: string = 'all';

  shippingOrders: ShippingOrder[] = [
    {
      id: '1',
      orderNumber: 'CMD-2025-001',
      customer: {
        name: 'Marie Kouassi',
        email: 'marie.kouassi@email.com',
        phone: '+228 90 12 34 56'
      },
      address: {
        address_line_1: '123 Rue de la Paix',
        city: 'Lomé',
        state: 'Maritime',
        postal_code: '00228',
        country: 'Togo'
      },
      items: [
        {
          name: 'Robe Ankara Élégante',
          quantity: 1,
          weight: 0.5,
          value: 25000
        },
        {
          name: 'Accessoires Perles',
          quantity: 2,
          weight: 0.2,
          value: 5000
        }
      ],
      carrier: {
        name: 'DHL Express',
        service: 'Express',
        trackingNumber: 'DHL123456789'
      },
      status: 'preparing',
      totalWeight: 0.7,
      totalValue: 30000,
      shippingCost: 5000,
      notes: 'Fragile - Manipuler avec précaution'
    },
    {
      id: '2',
      orderNumber: 'CMD-2025-002',
      customer: {
        name: 'Jean Dupont',
        email: 'jean.dupont@email.com',
        phone: '+228 91 23 45 67'
      },
      address: {
        address_line_1: '456 Avenue de la République',
        city: 'Kara',
        state: 'Kara',
        postal_code: '00228',
        country: 'Togo'
      },
      items: [
        {
          name: 'Chemise Wax Premium',
          quantity: 1,
          weight: 0.3,
          value: 18000
        }
      ],
      carrier: {
        name: 'FedEx',
        service: 'Standard'
      },
      status: 'pending',
      totalWeight: 0.3,
      totalValue: 18000,
      shippingCost: 3000
    }
  ];

  filteredOrders: ShippingOrder[] = [];

  carriers: Carrier[] = [
    {
      id: '1',
      name: 'DHL Express',
      logo: '/assets/images/carriers/dhl.png',
      services: [
        {
          name: 'Express',
          description: 'Livraison express 24h',
          estimatedDays: 1,
          cost: 5000,
          maxWeight: 30,
          maxDimensions: '120x80x80 cm'
        },
        {
          name: 'Standard',
          description: 'Livraison standard 2-3 jours',
          estimatedDays: 3,
          cost: 3000,
          maxWeight: 30,
          maxDimensions: '120x80x80 cm'
        }
      ],
      isActive: true,
      rating: 4.5
    },
    {
      id: '2',
      name: 'FedEx',
      logo: '/assets/images/carriers/fedex.png',
      services: [
        {
          name: 'Standard',
          description: 'Livraison standard 3-5 jours',
          estimatedDays: 4,
          cost: 2500,
          maxWeight: 25,
          maxDimensions: '100x70x70 cm'
        }
      ],
      isActive: true,
      rating: 4.2
    }
  ];

  deliveryZones: DeliveryZone[] = [
    {
      id: '1',
      name: 'Lomé et environs',
      regions: ['Lomé', 'Aneho', 'Tsevie'],
      deliveryTime: 1,
      cost: 2000,
      freeShippingThreshold: 50000,
      isActive: true
    },
    {
      id: '2',
      name: 'Région de Kara',
      regions: ['Kara', 'Sokodé', 'Bassar'],
      deliveryTime: 2,
      cost: 3000,
      freeShippingThreshold: 75000,
      isActive: true
    }
  ];

  returnRequests: ReturnRequest[] = [
    {
      id: 'RET-001',
      orderId: 'CMD-2025-001',
      customer: {
        name: 'Marie Kouassi',
        email: 'marie.kouassi@email.com'
      },
      reason: 'Taille incorrecte - Le produit ne correspond pas à la taille commandée',
      status: 'pending',
      requestedDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
      items: [
        {
          name: 'Robe Ankara Élégante',
          quantity: 1,
          reason: 'Taille trop petite'
        }
      ],
      refundAmount: 25000
    }
  ];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private vendorService: VendorService
  ) {}

  ngOnInit(): void {
    this.filteredOrders = this.shippingOrders;
    this.loadShippingMethods();
  }

  loadShippingMethods(): void {
    this.vendorService.getShippingMethods().subscribe({
      next: (response) => {
        if (response && response.carriers) {
          this.carriers = response.carriers;
        }
        if (response && response.zones) {
          this.deliveryZones = response.zones;
        }
        console.log('✅ Méthodes de livraison chargées');
      },
      error: (error) => {
        console.error('❌ Erreur chargement livraison:', error);
        // Garder les données de démonstration
      }
    });
  }

  get pendingShipments(): number {
    return this.shippingOrders.filter(order => order.status === 'pending' || order.status === 'preparing').length;
  }

  get shippedToday(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.shippingOrders.filter(order => 
      order.shippingDate && 
      order.shippingDate >= today && 
      order.status === 'shipped'
    ).length;
  }

  get averageDeliveryTime(): number {
    return 2.5; // Calculé à partir des données réelles
  }

  get pendingReturns(): number {
    return this.returnRequests.filter(request => request.status === 'pending').length;
  }

  filterOrders(): void {
    this.filteredOrders = this.shippingOrders.filter(order => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           order.customer.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           order.customer.email.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = this.selectedStatus === 'all' || order.status === this.selectedStatus;
      const matchesCarrier = this.selectedCarrier === 'all' || order.carrier.name.toLowerCase().includes(this.selectedCarrier.toLowerCase());
      return matchesSearch && matchesStatus && matchesCarrier;
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'En attente',
      'preparing': 'En préparation',
      'shipped': 'Expédiée',
      'in_transit': 'En transit',
      'delivered': 'Livrée',
      'returned': 'Retournée',
      'cancelled': 'Annulée'
    };
    return labels[status] || status;
  }

  getReturnStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'En attente',
      'approved': 'Approuvé',
      'rejected': 'Rejeté',
      'processed': 'Traité'
    };
    return labels[status] || status;
  }

  formatDate(timestamp: Date): string {
    return timestamp.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  prepareOrder(order: ShippingOrder): void {
    order.status = 'preparing';
    this.snackBar.open('Commande en préparation', 'Fermer', { duration: 3000 });
  }

  shipOrder(order: ShippingOrder): void {
    order.status = 'shipped';
    order.shippingDate = new Date();
    this.snackBar.open('Commande expédiée', 'Fermer', { duration: 3000 });
  }

  generateLabel(order: ShippingOrder): void {
    console.log('🏷️ Générer étiquette pour:', order.orderNumber);
    
    const dialogRef = this.dialog.open(LabelGeneratorDialogComponent, {
      width: '800px',
      maxHeight: '80vh',
      data: { order }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('✅ Étiquette générée:', result);
        this.snackBar.open('Étiquette générée avec succès', 'Fermer', { duration: 3000 });
        // TODO: Implémenter la génération réelle de l'étiquette
      }
    });
  }

  createShippingLabel(): void {
    console.log('🏷️ Créer une nouvelle étiquette');
    
    const dialogRef = this.dialog.open(LabelGeneratorDialogComponent, {
      width: '800px',
      maxHeight: '80vh',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('✅ Étiquette créée:', result);
        this.snackBar.open('Étiquette créée avec succès', 'Fermer', { duration: 3000 });
        // TODO: Implémenter la création réelle de l'étiquette
      }
    });
  }

  bulkShip(): void {
    console.log('📦 Expédier en lot');
    this.snackBar.open('Fonctionnalité d\'expédition en lot en cours de développement', 'Fermer', { duration: 3000 });
  }

  viewOrderDetails(order: ShippingOrder): void {
    console.log('👁️ Détails de la commande:', order.orderNumber);
    this.snackBar.open(`Détails de la commande ${order.orderNumber} - Fonctionnalité en développement`, 'Fermer', { duration: 3000 });
  }

  editOrder(order: ShippingOrder): void {
    console.log('✏️ Modifier la commande:', order.orderNumber);
    this.snackBar.open(`Modification de la commande ${order.orderNumber} - Fonctionnalité en développement`, 'Fermer', { duration: 3000 });
  }

  trackOrder(order: ShippingOrder): void {
    console.log('📍 Suivre la commande:', order.orderNumber);
    if (order.carrier.trackingNumber) {
      this.snackBar.open(`Suivi de la commande ${order.orderNumber} - Numéro: ${order.carrier.trackingNumber}`, 'Fermer', { duration: 5000 });
    } else {
      this.snackBar.open('Aucun numéro de suivi disponible pour cette commande', 'Fermer', { duration: 3000 });
    }
  }

  cancelOrder(order: ShippingOrder): void {
    order.status = 'cancelled';
    this.snackBar.open('Commande annulée', 'Fermer', { duration: 3000 });
  }

  addCarrier(): void {
    const dialogRef = this.dialog.open(CarrierConfigDialogComponent, {
      width: '900px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const carrier: Carrier = {
          id: Date.now().toString(),
          name: result.name,
          logo: result.logo,
          services: result.services,
          isActive: result.isActive,
          rating: result.rating
        };

        this.carriers.unshift(carrier);
        this.snackBar.open('Transporteur ajouté', 'Fermer', { duration: 3000 });
      }
    });
  }

  configureCarrier(carrier: Carrier): void {
    console.log('⚙️ Configurer le transporteur:', carrier.name);
    this.snackBar.open(`Configuration de ${carrier.name} - Fonctionnalité en développement`, 'Fermer', { duration: 3000 });
  }

  editCarrier(carrier: Carrier): void {
    console.log('✏️ Modifier le transporteur:', carrier.name);
    this.snackBar.open(`Modification de ${carrier.name} - Fonctionnalité en développement`, 'Fermer', { duration: 3000 });
  }

  viewCarrierStats(carrier: Carrier): void {
    console.log('📊 Statistiques du transporteur:', carrier.name);
    this.snackBar.open(`Statistiques de ${carrier.name} - Fonctionnalité en développement`, 'Fermer', { duration: 3000 });
  }

  toggleCarrier(carrier: Carrier): void {
    carrier.isActive = !carrier.isActive;
    this.snackBar.open(
      `Transporteur ${carrier.isActive ? 'activé' : 'désactivé'}`,
      'Fermer',
      { duration: 3000 }
    );
  }

  addDeliveryZone(): void {
    const dialogRef = this.dialog.open(ZoneConfigDialogComponent, {
      width: '800px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const zone: DeliveryZone = {
          id: Date.now().toString(),
          name: result.name,
          regions: result.regions,
          deliveryTime: result.deliveryTime,
          cost: result.cost,
          freeShippingThreshold: result.freeShippingThreshold,
          isActive: true
        };

        this.deliveryZones.unshift(zone);
        this.snackBar.open('Zone de livraison créée', 'Fermer', { duration: 3000 });
      }
    });
  }

  editZone(zone: DeliveryZone): void {
    console.log('✏️ Modifier la zone:', zone.name);
    this.snackBar.open(`Modification de la zone ${zone.name} - Fonctionnalité en développement`, 'Fermer', { duration: 3000 });
  }

  duplicateZone(zone: DeliveryZone): void {
    console.log('📋 Dupliquer la zone:', zone.name);
    
    const newZone: DeliveryZone = {
      id: Date.now().toString(),
      name: `${zone.name} (Copie)`,
      regions: [...zone.regions],
      deliveryTime: zone.deliveryTime,
      cost: zone.cost,
      freeShippingThreshold: zone.freeShippingThreshold,
      isActive: false
    };

    this.deliveryZones.unshift(newZone);
    this.snackBar.open('Zone dupliquée avec succès', 'Fermer', { duration: 3000 });
  }

  toggleZone(zone: DeliveryZone): void {
    zone.isActive = !zone.isActive;
    this.snackBar.open(
      `Zone ${zone.isActive ? 'activée' : 'désactivée'}`,
      'Fermer',
      { duration: 3000 }
    );
  }

  deleteZone(zone: DeliveryZone): void {
    console.log('🗑️ Supprimer la zone:', zone.name);
    // Logique pour supprimer la zone
  }

  approveReturn(returnRequest: ReturnRequest): void {
    returnRequest.status = 'approved';
    this.snackBar.open('Retour approuvé', 'Fermer', { duration: 3000 });
  }

  rejectReturn(returnRequest: ReturnRequest): void {
    returnRequest.status = 'rejected';
    this.snackBar.open('Retour rejeté', 'Fermer', { duration: 3000 });
  }

  viewReturnDetails(returnRequest: ReturnRequest): void {
    console.log('👁️ Détails du retour:', returnRequest.id);
    // Logique pour afficher les détails du retour
  }

  openSettings(): void {
    console.log('⚙️ Ouvrir les paramètres de livraison');
    
    const dialogRef = this.dialog.open(ShippingSettingsDialogComponent, {
      width: '700px',
      maxHeight: '80vh',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('✅ Paramètres sauvegardés:', result);
        this.snackBar.open('Paramètres sauvegardés avec succès', 'Fermer', { duration: 3000 });
        // TODO: Sauvegarder les paramètres via l'API
      }
    });
  }

  // Méthodes utilitaires
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'warn',
      'preparing': 'accent',
      'shipped': 'primary',
      'in_transit': 'primary',
      'delivered': 'primary',
      'returned': 'warn',
      'cancelled': 'warn'
    };
    return colors[status] || 'primary';
  }

  getCarrierIcon(carrierName: string): string {
    const icons: { [key: string]: string } = {
      'DHL': 'local_shipping',
      'FedEx': 'flight',
      'UPS': 'truck',
      'Poste': 'mail',
      'Express': 'speed'
    };
    return icons[carrierName] || 'local_shipping';
  }

  calculateShippingCost(weight: number, distance: number, value: number, zone: string): number {
    // Logique de calcul des frais de livraison
    const baseRate = this.getBaseRate(zone);
    const weightRate = weight * 0.5; // 0.5 FCFA par gramme
    const distanceRate = distance * 0.1; // 0.1 FCFA par km
    const valueRate = value * 0.02; // 2% de la valeur
    
    return Math.max(baseRate + weightRate + distanceRate + valueRate, 200); // Minimum 200 FCFA
  }

  getBaseRate(zone: string): number {
    const rates: { [key: string]: number } = {
      'lome_center': 0,
      'lome_suburb': 500,
      'kara_center': 1500,
      'sokode_center': 2000,
      'other_cities': 3000
    };
    return rates[zone] || 3000;
  }

  getEstimatedDelivery(distance: number, carrier: string): number {
    // Estimation en jours
    const baseDays = Math.ceil(distance / 100); // 100km par jour
    const carrierMultiplier = this.getCarrierSpeed(carrier);
    return Math.max(1, Math.ceil(baseDays * carrierMultiplier));
  }

  getCarrierSpeed(carrier: string): number {
    const speeds: { [key: string]: number } = {
      'DHL': 0.8,
      'FedEx': 0.9,
      'UPS': 1.0,
      'Poste': 1.5,
      'Express': 0.7
    };
    return speeds[carrier] || 1.0;
  }

  formatWeight(weight: number): string {
    if (weight < 1000) {
      return `${weight}g`;
    } else {
      return `${(weight / 1000).toFixed(1)}kg`;
    }
  }

  formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else {
      return `${distance.toFixed(1)}km`;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
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
}


