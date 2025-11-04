import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { VendorService, VendorOrder } from '../../../../core/services/vendor.service';

interface Order {
  id: string;
  reference: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    id?: string;
    address?: string;
  };
  items: {
    product_name: string;
    quantity: number;
    price: number;
    image: string;
    product_id?: string;
    sku?: string;
    size?: string;
    color?: string;
    weight?: number;
  }[];
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_method: string;
  payment_reference?: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  discount?: number;
  total: number;
  shipping_address: {
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
    full_address?: string;
  };
  billing_address?: {
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
  };
  tracking_number?: string;
  carrier?: string;
  estimated_delivery?: string;
  notes?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  timeline?: {
    status: string;
    date: string;
    note?: string;
  }[];
}

@Component({
  selector: 'app-vendor-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  template: `
    <div class="vendor-orders">
      <!-- Header avec gradient -->
      <div class="page-header">
        <div class="header-content">
          <h1>
            <mat-icon>shopping_bag</mat-icon>
            Gestion des Commandes
          </h1>
          <p>Suivez et gérez toutes vos commandes clients</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button class="export-btn" (click)="exportOrders()">
            <mat-icon>download</mat-icon>
            Exporter
          </button>
          <button mat-raised-button color="primary" (click)="refreshOrders()">
            <mat-icon>refresh</mat-icon>
            Actualiser
          </button>
        </div>
      </div>

      <!-- Statistiques des commandes -->
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-icon">
            <mat-icon>shopping_cart</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ orders.length }}</h3>
            <p>Total Commandes</p>
            <span class="stat-period">Ce mois</span>
          </div>
        </div>

        <div class="stat-card pending">
          <div class="stat-icon">
            <mat-icon>schedule</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getOrdersByStatus('pending').length }}</h3>
            <p>En Attente</p>
            <span class="stat-period">À traiter</span>
          </div>
        </div>

        <div class="stat-card processing">
          <div class="stat-icon">
            <mat-icon>inventory_2</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getOrdersByStatus('preparing').length }}</h3>
            <p>En Préparation</p>
            <span class="stat-period">En cours</span>
          </div>
        </div>

        <div class="stat-card shipped">
          <div class="stat-icon">
            <mat-icon>local_shipping</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getOrdersByStatus('shipped').length }}</h3>
            <p>Expédiées</p>
            <span class="stat-period">En livraison</span>
          </div>
        </div>

        <div class="stat-card delivered">
          <div class="stat-icon">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getOrdersByStatus('delivered').length }}</h3>
            <p>Livrées</p>
            <span class="stat-period">Terminées</span>
          </div>
        </div>

        <div class="stat-card revenue">
          <div class="stat-icon">
            <mat-icon>account_balance_wallet</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getTotalRevenue() | number:'1.0-0' }} FCFA</h3>
            <p>Revenus</p>
            <span class="stat-period">Ce mois</span>
          </div>
        </div>
      </div>

      <!-- Filtres et recherche -->
      <div class="filters-section">
        <div class="search-bar">
          <mat-icon>search</mat-icon>
          <input 
            type="text" 
            placeholder="Rechercher par référence, client, email..." 
            [(ngModel)]="searchTerm"
            (input)="filterOrders()">
        </div>
        
        <div class="filters">
          <select [(ngModel)]="statusFilter" (change)="filterOrders()">
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmée</option>
            <option value="preparing">En préparation</option>
            <option value="shipped">Expédiée</option>
            <option value="delivered">Livrée</option>
            <option value="cancelled">Annulée</option>
            <option value="refunded">Remboursée</option>
          </select>

          <select [(ngModel)]="paymentFilter" (change)="filterOrders()">
            <option value="">Tous les paiements</option>
            <option value="paid">Payé</option>
            <option value="pending">En attente</option>
            <option value="refunded">Remboursé</option>
          </select>

          <select [(ngModel)]="sortBy" (change)="sortOrders()">
            <option value="date_desc">Plus récent</option>
            <option value="date_asc">Plus ancien</option>
            <option value="amount_desc">Montant décroissant</option>
            <option value="amount_asc">Montant croissant</option>
          </select>
        </div>
      </div>

      <!-- Liste des commandes -->
      <div class="orders-section">
        <div class="orders-header">
          <h2>Commandes ({{ filteredOrders.length }})</h2>
        </div>

        <div class="orders-list">
          @for (order of filteredOrders; track order.id) {
            <div class="order-card" [class.expanded]="expandedOrderId === order.id">
              <!-- En-tête de commande -->
              <div class="order-header" (click)="toggleOrderExpand(order.id)">
                <div class="order-main-info">
                  <div class="order-reference">
                    <mat-icon>receipt</mat-icon>
                    <span class="ref-number">{{ order.reference }}</span>
                  </div>
                  
                  <div class="customer-info">
                    <div class="customer-avatar">
                      @if (order.customer.avatar) {
                        <img [src]="order.customer.avatar" [alt]="order.customer.name">
                      } @else {
                        <mat-icon>person</mat-icon>
                      }
                    </div>
                    <div class="customer-details">
                      <div class="customer-name">{{ order.customer.name }}</div>
                      <div class="customer-contact">{{ order.customer.email }}</div>
                    </div>
                  </div>
                </div>

                <div class="order-meta">
                  <div class="order-amount">
                    <span class="amount-label">Total</span>
                    <span class="amount-value">{{ order.total | number:'1.0-0' }} FCFA</span>
                  </div>

                  <mat-chip class="status-chip" [class]="'status-' + order.status">
                    <mat-icon>{{ getStatusIcon(order.status) }}</mat-icon>
                    {{ getStatusLabel(order.status) }}
                  </mat-chip>

                  <mat-chip class="payment-chip" [class]="'payment-' + order.payment_status">
                    {{ getPaymentStatusLabel(order.payment_status) }}
                  </mat-chip>

                  <div class="order-date">
                    <mat-icon>calendar_today</mat-icon>
                    {{ formatDate(order.created_at) }}
                  </div>

                  <button mat-icon-button class="expand-btn" (click)="toggleOrderExpand(order.id); $event.stopPropagation()">
                    <mat-icon>{{ expandedOrderId === order.id ? 'expand_less' : 'expand_more' }}</mat-icon>
                  </button>
                </div>
              </div>

              <!-- Détails de commande (expandable) -->
              @if (expandedOrderId === order.id) {
                <div class="order-details" @slideDown>
                  <div class="details-grid">
                    <!-- Produits -->
                    <div class="detail-section products-section">
                      <h3>
                        <mat-icon>inventory</mat-icon>
                        Produits ({{ order.items.length }})
                      </h3>
                      <div class="products-list">
                        @for (item of order.items; track item.product_name) {
                          <div class="product-item">
                            <div class="product-image">
                              <img [src]="item.image" [alt]="item.product_name">
                              @if (item.sku) {
                                <div class="product-sku">SKU: {{ item.sku }}</div>
                              }
                            </div>
                            <div class="product-info">
                              <div class="product-name">{{ item.product_name }}</div>
                              <div class="product-details">
                                <div class="product-meta">
                                  <span class="quantity">Quantité: {{ item.quantity }}</span>
                                  <span class="price">Prix unitaire: {{ item.price | number:'1.0-0' }} FCFA</span>
                                </div>
                                @if (item.size || item.color) {
                                  <div class="product-attributes">
                                    @if (item.size) {
                                      <span class="attribute">Taille: {{ item.size }}</span>
                                    }
                                    @if (item.color) {
                                      <span class="attribute">Couleur: {{ item.color }}</span>
                                    }
                                  </div>
                                }
                                @if (item.weight) {
                                  <div class="product-weight">Poids: {{ item.weight }}g</div>
                                }
                              </div>
                            </div>
                            <div class="product-total">
                              <div class="total-label">Sous-total</div>
                              <div class="total-value">{{ item.quantity * item.price | number:'1.0-0' }} FCFA</div>
                            </div>
                          </div>
                        }
                      </div>

                      <div class="order-summary">
                        <div class="summary-row">
                          <span>Sous-total</span>
                          <span>{{ order.subtotal | number:'1.0-0' }} FCFA</span>
                        </div>
                        <div class="summary-row">
                          <span>Livraison</span>
                          <span>{{ order.shipping_cost | number:'1.0-0' }} FCFA</span>
                        </div>
                        <div class="summary-row">
                          <span>Taxes</span>
                          <span>{{ order.tax | number:'1.0-0' }} FCFA</span>
                        </div>
                        <div class="summary-row total">
                          <span>Total</span>
                          <span>{{ order.total | number:'1.0-0' }} FCFA</span>
                        </div>
                      </div>
                    </div>

                    <!-- Livraison -->
                    <div class="detail-section shipping-section">
                      <h3>
                        <mat-icon>local_shipping</mat-icon>
                        Livraison
                      </h3>
                      <div class="shipping-info">
                        <div class="address">
                          <mat-icon>location_on</mat-icon>
                          <div>
                            <div class="address-title">Adresse de livraison</div>
                            <div class="address-details">
                              <div>{{ order.shipping_address.address_line_1 }}</div>
                              <div>{{ order.shipping_address.city }}, {{ order.shipping_address.state }}</div>
                              <div>{{ order.shipping_address.postal_code }}, {{ order.shipping_address.country }}</div>
                            </div>
                          </div>
                        </div>

                        @if (order.tracking_number) {
                          <div class="tracking">
                            <mat-icon>my_location</mat-icon>
                            <div>
                              <div class="tracking-label">Suivi de livraison</div>
                              <div class="tracking-number">{{ order.tracking_number }}</div>
                              @if (order.carrier) {
                                <div class="carrier">Transporteur: {{ order.carrier }}</div>
                              }
                              @if (order.estimated_delivery) {
                                <div class="estimated-delivery">Livraison prévue: {{ order.estimated_delivery }}</div>
                              }
                            </div>
                          </div>
                        }

                        <div class="contact-info">
                          <div class="contact">
                            <mat-icon>phone</mat-icon>
                            <div>
                              <div class="contact-label">Téléphone</div>
                              <div class="contact-value">{{ order.customer.phone }}</div>
                            </div>
                          </div>
                          <div class="contact">
                            <mat-icon>email</mat-icon>
                            <div>
                              <div class="contact-label">Email</div>
                              <div class="contact-value">{{ order.customer.email }}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Paiement -->
                    <div class="detail-section payment-section">
                      <h3>
                        <mat-icon>payment</mat-icon>
                        Paiement
                      </h3>
                      <div class="payment-info">
                        <div class="payment-details">
                          <div class="payment-method">
                            <mat-icon>credit_card</mat-icon>
                            <div>
                              <div class="method-label">Méthode de paiement</div>
                              <div class="method-value">{{ order.payment_method }}</div>
                            </div>
                          </div>
                          @if (order.payment_reference) {
                            <div class="payment-reference">
                              <mat-icon>receipt</mat-icon>
                              <div>
                                <div class="reference-label">Référence de paiement</div>
                                <div class="reference-value">{{ order.payment_reference }}</div>
                              </div>
                            </div>
                          }
                          <div class="payment-status">
                            <mat-chip [class]="'payment-' + order.payment_status">
                              {{ getPaymentStatusLabel(order.payment_status) }}
                            </mat-chip>
                          </div>
                        </div>
                      </div>

                      @if (order.notes || order.internal_notes) {
                        <div class="notes-section">
                          @if (order.notes) {
                            <div class="notes">
                              <mat-icon>note</mat-icon>
                              <div>
                                <div class="notes-label">Notes du client</div>
                                <div class="notes-content">{{ order.notes }}</div>
                              </div>
                            </div>
                          }
                          @if (order.internal_notes) {
                            <div class="internal-notes">
                              <mat-icon>admin_panel_settings</mat-icon>
                              <div>
                                <div class="notes-label">Notes internes</div>
                                <div class="notes-content">{{ order.internal_notes }}</div>
                              </div>
                            </div>
                          }
                        </div>
                      }
                    </div>

                    <!-- Timeline de la commande -->
                    @if (order.timeline && order.timeline.length > 0) {
                      <div class="detail-section timeline-section">
                        <h3>
                          <mat-icon>timeline</mat-icon>
                          Historique de la commande
                        </h3>
                        <div class="timeline">
                          @for (event of order.timeline; track event.date) {
                            <div class="timeline-item">
                              <div class="timeline-marker">
                                <mat-icon>{{ getStatusIcon(event.status) }}</mat-icon>
                              </div>
                              <div class="timeline-content">
                                <div class="timeline-status">{{ getStatusLabel(event.status) }}</div>
                                <div class="timeline-date">{{ formatDate(event.date) }}</div>
                                @if (event.note) {
                                  <div class="timeline-note">{{ event.note }}</div>
                                }
                              </div>
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Actions -->
                  <div class="order-actions">
                    @if (order.status === 'pending') {
                      <button mat-raised-button color="primary" (click)="confirmOrder(order)">
                        <mat-icon>check</mat-icon>
                        Confirmer
                      </button>
                    }
                    
                    @if (order.status === 'confirmed' || order.status === 'pending') {
                      <button mat-raised-button class="preparing-btn" (click)="startPreparing(order)">
                        <mat-icon>inventory_2</mat-icon>
                        Préparer
                      </button>
                    }

                    @if (order.status === 'preparing') {
                      <button mat-raised-button class="ship-btn" (click)="shipOrder(order)">
                        <mat-icon>local_shipping</mat-icon>
                        Expédier
                      </button>
                    }

                    @if (order.status === 'shipped') {
                      <button mat-raised-button class="deliver-btn" (click)="markAsDelivered(order)">
                        <mat-icon>check_circle</mat-icon>
                        Marquer comme livrée
                      </button>
                    }

                    <button mat-raised-button (click)="printOrder(order)">
                      <mat-icon>print</mat-icon>
                      Imprimer
                    </button>

                    <button mat-icon-button [matMenuTriggerFor]="orderMenu">
                      <mat-icon>more_vert</mat-icon>
                    </button>

                    <mat-menu #orderMenu="matMenu">
                      <button mat-menu-item (click)="viewCustomer(order)">
                        <mat-icon>person</mat-icon>
                        Voir le client
                      </button>
                      <button mat-menu-item (click)="addTracking(order)">
                        <mat-icon>add_location</mat-icon>
                        Ajouter suivi
                      </button>
                      <button mat-menu-item (click)="contactCustomer(order)">
                        <mat-icon>email</mat-icon>
                        Contacter client
                      </button>
                      @if (order.status !== 'cancelled') {
                        <button mat-menu-item (click)="cancelOrder(order)" class="danger">
                          <mat-icon>cancel</mat-icon>
                          Annuler commande
                        </button>
                      }
                    </mat-menu>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- État vide -->
        @if (filteredOrders.length === 0) {
          <div class="empty-state">
            <mat-icon>shopping_cart_outlined</mat-icon>
            <h3>Aucune commande trouvée</h3>
            <p>
              @if (searchTerm || statusFilter || paymentFilter) {
                Essayez de modifier vos filtres
              } @else {
                Vous n'avez pas encore de commandes
              }
            </p>
            @if (searchTerm || statusFilter || paymentFilter) {
              <button mat-raised-button color="primary" (click)="clearFilters()">
                <mat-icon>clear</mat-icon>
                Effacer les filtres
              </button>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .vendor-orders {
      background: #f8fafc;
      min-height: 100vh;
    }

    .page-header {
      background: linear-gradient(135deg, #8B2E2E 0%, #6B1F1F 100%);
      color: white;
      padding: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
      font-size: 1rem;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .export-btn {
      background: rgba(255, 255, 255, 0.2) !important;
      color: white !important;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      padding: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      border-left: 4px solid transparent;
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .stat-card.total { border-left-color: #8B2E2E; }
    .stat-card.pending { border-left-color: #f59e0b; }
    .stat-card.processing { border-left-color: #3b82f6; }
    .stat-card.shipped { border-left-color: #8b5cf6; }
    .stat-card.delivered { border-left-color: #10b981; }
    .stat-card.revenue { border-left-color: #D9744F; }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .stat-card.total .stat-icon { background: linear-gradient(135deg, #8B2E2E, #6B1F1F); color: white; }
    .stat-card.pending .stat-icon { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }
    .stat-card.processing .stat-icon { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; }
    .stat-card.shipped .stat-icon { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; }
    .stat-card.delivered .stat-icon { background: linear-gradient(135deg, #10b981, #059669); color: white; }
    .stat-card.revenue .stat-icon { background: linear-gradient(135deg, #D9744F, #C06040); color: white; }

    .stat-content h3 {
      font-size: 1.75rem;
      margin: 0;
      color: #1f2937;
      font-weight: 700;
    }

    .stat-content p {
      margin: 0.25rem 0 0 0;
      color: #6b7280;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .stat-period {
      font-size: 0.75rem;
      color: #9ca3af;
    }

    .filters-section {
      background: white;
      padding: 1.5rem 2rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .search-bar {
      position: relative;
      flex: 1;
      min-width: 300px;
    }

    .search-bar mat-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #6b7280;
    }

    .search-bar input {
      width: 100%;
      padding: 0.875rem 1rem 0.875rem 3rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 0.95rem;
      transition: all 0.3s ease;
    }

    .search-bar input:focus {
      outline: none;
      border-color: #8B2E2E;
      box-shadow: 0 0 0 3px rgba(139, 46, 46, 0.1);
    }

    .filters {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filters select {
      padding: 0.875rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      background: white;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .filters select:focus {
      outline: none;
      border-color: #8B2E2E;
    }

    .orders-section {
      padding: 2rem;
    }

    .orders-header {
      margin-bottom: 1.5rem;
    }

    .orders-header h2 {
      font-size: 1.5rem;
      color: #1f2937;
      margin: 0;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .order-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .order-card:hover {
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .order-header {
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .order-header:hover {
      background: #f9fafb;
    }

    .order-main-info {
      display: flex;
      align-items: center;
      gap: 2rem;
      flex: 1;
    }

    .order-reference {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #8B2E2E;
      font-size: 1.1rem;
    }

    .customer-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .customer-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #8B2E2E, #D9744F);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      overflow: hidden;
    }

    .customer-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .customer-name {
      font-weight: 600;
      color: #1f2937;
      font-size: 1rem;
    }

    .customer-contact {
      font-size: 0.85rem;
      color: #6b7280;
    }

    .order-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .order-amount {
      text-align: right;
    }

    .amount-label {
      display: block;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .amount-value {
      display: block;
      font-size: 1.2rem;
      font-weight: 700;
      color: #8B2E2E;
    }

    .status-chip {
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .status-chip.status-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .status-chip.status-confirmed {
      background: #dbeafe;
      color: #1e40af;
    }

    .status-chip.status-preparing {
      background: #e0e7ff;
      color: #3730a3;
    }

    .status-chip.status-shipped {
      background: #ede9fe;
      color: #5b21b6;
    }

    .status-chip.status-delivered {
      background: #d1fae5;
      color: #065f46;
    }

    .status-chip.status-cancelled {
      background: #fee2e2;
      color: #991b1b;
    }

    .status-chip.status-refunded {
      background: #f3f4f6;
      color: #374151;
    }

    .payment-chip {
      font-size: 0.8rem;
      padding: 0.4rem 0.8rem;
      border-radius: 16px;
    }

    .payment-chip.payment-paid {
      background: #d1fae5;
      color: #065f46;
    }

    .payment-chip.payment-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .payment-chip.payment-refunded {
      background: #f3f4f6;
      color: #374151;
    }

    .order-date {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.85rem;
      color: #6b7280;
    }

    .expand-btn {
      color: #8B2E2E;
    }

    .order-details {
      padding: 0 1.5rem 1.5rem 1.5rem;
      border-top: 1px solid #e5e7eb;
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin: 1.5rem 0;
    }

    .detail-section {
      background: #f9fafb;
      padding: 1.5rem;
      border-radius: 12px;
    }

    .detail-section h3 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      margin: 0 0 1rem 0;
      color: #1f2937;
    }

    .products-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .product-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: white;
      padding: 1rem;
      border-radius: 8px;
    }

    .product-item img {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 8px;
    }

    .product-info {
      flex: 1;
    }

    .product-name {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.25rem;
    }

    .product-meta {
      font-size: 0.85rem;
      color: #6b7280;
    }

    .product-total {
      font-weight: 700;
      color: #8B2E2E;
    }

    .order-summary {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      color: #6b7280;
    }

    .summary-row.total {
      font-weight: 700;
      color: #1f2937;
      font-size: 1.1rem;
      border-top: 2px solid #e5e7eb;
      margin-top: 0.5rem;
      padding-top: 1rem;
    }

    .shipping-info,
    .payment-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .address,
    .tracking,
    .contact,
    .payment-method,
    .notes {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      background: white;
      padding: 1rem;
      border-radius: 8px;
    }

    .address mat-icon,
    .tracking mat-icon,
    .contact mat-icon,
    .payment-method mat-icon,
    .notes mat-icon {
      color: #8B2E2E;
    }

    .tracking-label,
    .notes-label {
      font-size: 0.75rem;
      color: #6b7280;
      margin-bottom: 0.25rem;
    }

    .tracking-number,
    .notes-content {
      font-weight: 600;
      color: #1f2937;
    }

    .order-actions {
      display: flex;
      gap: 1rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
      flex-wrap: wrap;
    }

    .preparing-btn {
      background: #3b82f6 !important;
      color: white !important;
    }

    .ship-btn {
      background: #8b5cf6 !important;
      color: white !important;
    }

    .deliver-btn {
      background: #10b981 !important;
      color: white !important;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #6b7280;
      background: white;
      border-radius: 16px;
    }

    .empty-state mat-icon {
      font-size: 5rem;
      width: 5rem;
      height: 5rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: #374151;
      font-size: 1.5rem;
    }

    .empty-state p {
      margin: 0 0 2rem 0;
    }

    /* Styles pour les nouvelles sections */
    .product-image {
      position: relative;
    }

    .product-sku {
      position: absolute;
      bottom: 4px;
      left: 4px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 500;
    }

    .product-details {
      margin-top: 8px;
    }

    .product-attributes {
      display: flex;
      gap: 12px;
      margin-top: 4px;
    }

    .attribute {
      background: #f3f4f6;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      color: #6b7280;
    }

    .product-weight {
      font-size: 0.8rem;
      color: #6b7280;
      margin-top: 4px;
    }

    .total-label {
      font-size: 0.8rem;
      color: #6b7280;
      margin-bottom: 2px;
    }

    .total-value {
      font-weight: 600;
      color: #1f2937;
    }

    .address-title {
      font-weight: 600;
      color: #374151;
      margin-bottom: 4px;
    }

    .address-details {
      color: #6b7280;
      line-height: 1.4;
    }

    .tracking-label {
      font-weight: 600;
      color: #374151;
      margin-bottom: 4px;
    }

    .tracking-number {
      font-family: monospace;
      background: #f3f4f6;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 600;
      color: #1f2937;
    }

    .carrier, .estimated-delivery {
      font-size: 0.9rem;
      color: #6b7280;
      margin-top: 4px;
    }

    .contact-info {
      display: flex;
      gap: 24px;
      margin-top: 16px;
    }

    .contact-label {
      font-size: 0.8rem;
      color: #6b7280;
      margin-bottom: 2px;
    }

    .contact-value {
      font-weight: 500;
      color: #374151;
    }

    .payment-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .method-label, .reference-label {
      font-size: 0.8rem;
      color: #6b7280;
      margin-bottom: 2px;
    }

    .method-value, .reference-value {
      font-weight: 500;
      color: #374151;
    }

    .notes-section {
      margin-top: 16px;
    }

    .internal-notes {
      margin-top: 12px;
      padding: 12px;
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      border-radius: 4px;
    }

    .timeline-section {
      margin-top: 24px;
    }

    .timeline {
      position: relative;
      padding-left: 24px;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 12px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #e5e7eb;
    }

    .timeline-item {
      position: relative;
      margin-bottom: 16px;
    }

    .timeline-marker {
      position: absolute;
      left: -18px;
      top: 4px;
      width: 24px;
      height: 24px;
      background: #8B2E2E;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
    }

    .timeline-content {
      background: white;
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .timeline-status {
      font-weight: 600;
      color: #374151;
      margin-bottom: 4px;
    }

    .timeline-date {
      font-size: 0.8rem;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .timeline-note {
      font-size: 0.9rem;
      color: #6b7280;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
      }

      .order-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .order-main-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .order-meta {
        flex-wrap: wrap;
        width: 100%;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }

      .contact-info {
        flex-direction: column;
        gap: 12px;
      }

      .product-attributes {
        flex-direction: column;
        gap: 8px;
      }

      .timeline {
        padding-left: 16px;
      }

      .timeline-marker {
        left: -12px;
        width: 20px;
        height: 20px;
        font-size: 10px;
      }
    }
  `]
})
export class VendorOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  expandedOrderId: string | null = null;
  errorMessage: string | null = null;
  isLoading = false;
  
  searchTerm: string = '';
  statusFilter: string = '';
  paymentFilter: string = '';
  sortBy: string = 'date_desc';

  constructor(private vendorService: VendorService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    
    // Charger les commandes depuis l'API
    this.vendorService.getOrders().subscribe({
      next: (response) => {
        this.orders = response.orders.map(this.convertVendorOrderToOrder);
        this.filteredOrders = [...this.orders];
        this.filterOrders();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des commandes:', error);
        this.isLoading = false;
        // Ne pas charger de données mockées en production
        this.orders = [];
        this.filteredOrders = [];
        this.errorMessage = 'Erreur lors du chargement des commandes. Veuillez réessayer.';
      }
    });
  }

  private convertVendorOrderToOrder(vendorOrder: VendorOrder): Order {
    return {
      id: vendorOrder.id || '',
      reference: vendorOrder.orderNumber || '',
      customer: {
        name: vendorOrder.customerName || '',
        email: vendorOrder.customerEmail || '',
        phone: '', // Pas disponible dans VendorOrder
        avatar: undefined
      },
      items: vendorOrder.items.map(item => ({
        product_name: item.name || item.product_name || '',
        quantity: item.quantity || 1,
        price: item.price || 0,
        image: item.image || '',
        product_id: item.id || item.product_id || ''
      })),
      status: vendorOrder.status as any,
      payment_status: 'paid' as any, // Valeur par défaut
      payment_method: '', // Pas disponible dans VendorOrder
      subtotal: vendorOrder.total * 0.9, // Estimation
      shipping_cost: vendorOrder.total * 0.05, // Estimation
      tax: vendorOrder.total * 0.05, // Estimation
      total: vendorOrder.total,
        shipping_address: {
          address_line_1: '',
          city: '',
          state: '',
          postal_code: '',
          country: ''
        },
      created_at: vendorOrder.createdAt || new Date().toISOString(),
      updated_at: vendorOrder.updatedAt || new Date().toISOString(),
      timeline: []
    };
  }

  // Supprimé loadMockOrders() - utiliser uniquement l'API
  private _loadMockOrdersRemoved(): void {
    // Données de simulation - supprimées, utiliser uniquement l'API
    this.orders = [
      {
        id: '1',
        reference: 'AFM-20250116-0001',
        customer: {
          name: 'Marie Kouassi',
          email: 'marie.kouassi@email.com',
          phone: '+228 90 12 34 56'
        },
        items: [
          {
            product_name: 'Robe Ankara Élégante',
            quantity: 2,
            price: 45000,
            image: '/assets/images/products/robe-1.jpg',
            product_id: 'PROD-001',
            sku: 'ROBE-ANK-001',
            size: 'M',
            color: 'Rouge et Or',
            weight: 800
          },
          {
            product_name: 'Chemise Wax Premium',
            quantity: 1,
            price: 35000,
            image: '/assets/images/products/chemise-1.jpg',
            product_id: 'PROD-002',
            sku: 'CHEM-WAX-001',
            size: 'L',
            color: 'Bleu et Blanc',
            weight: 600
          }
        ],
        status: 'pending',
        payment_status: 'paid',
        payment_method: 'Carte bancaire',
        payment_reference: 'PAY-20250116-001',
        subtotal: 125000,
        shipping_cost: 5000,
        tax: 0,
        discount: 0,
        total: 130000,
        shipping_address: {
          address_line_1: '123 Avenue de la Libération',
          city: 'Lomé',
          state: 'Maritime',
          postal_code: 'BP 1234',
          country: 'Togo'
        },
        notes: 'Livraison avant 18h si possible',
        internal_notes: 'Client VIP - Priorité haute',
        created_at: '2025-01-16T10:30:00',
        updated_at: '2025-01-16T10:30:00',
        timeline: [
          {
            status: 'pending',
            date: '2025-01-16T10:30:00',
            note: 'Commande reçue'
          }
        ]
      },
      {
        id: '2',
        reference: 'AFM-20250115-0087',
        customer: {
          name: 'Jean Dupont',
          email: 'jean.dupont@email.com',
          phone: '+228 91 23 45 67'
        },
        items: [
          {
            product_name: 'Ensemble Kente Royal',
            quantity: 1,
            price: 85000,
            image: '/assets/images/products/ensemble-1.jpg',
            product_id: 'PROD-003',
            sku: 'ENS-KEN-001',
            size: 'XL',
            color: 'Or et Noir',
            weight: 1200
          }
        ],
        status: 'shipped',
        payment_status: 'paid',
        payment_method: 'Mobile Money',
        payment_reference: 'MM-20250115-087',
        subtotal: 85000,
        shipping_cost: 3000,
        tax: 0,
        discount: 0,
        total: 88000,
        shipping_address: {
          address_line_1: '45 Rue du Commerce',
          city: 'Kara',
          state: 'Kara',
          postal_code: 'BP 5678',
          country: 'Togo'
        },
        tracking_number: 'TG-SHIP-20250115-001',
        carrier: 'Togo Express',
        estimated_delivery: '2025-01-18',
        created_at: '2025-01-15T14:20:00',
        updated_at: '2025-01-16T09:15:00',
        confirmed_at: '2025-01-15T15:30:00',
        shipped_at: '2025-01-16T09:15:00',
        timeline: [
          {
            status: 'pending',
            date: '2025-01-15T14:20:00',
            note: 'Commande reçue'
          },
          {
            status: 'confirmed',
            date: '2025-01-15T15:30:00',
            note: 'Commande confirmée par le vendeur'
          },
          {
            status: 'shipped',
            date: '2025-01-16T09:15:00',
            note: 'Commande expédiée - Numéro de suivi: TG-SHIP-20250115-001'
          }
        ]
      },
      {
        id: '3',
        reference: 'AFM-20250114-0056',
        customer: {
          name: 'Fatou Diallo',
          email: 'fatou.diallo@email.com',
          phone: '+228 92 34 56 78'
        },
        items: [
          {
            product_name: 'Chemise Wax Premium',
            quantity: 3,
            price: 35000,
            image: '/assets/images/products/chemise-1.jpg',
            product_id: 'PROD-002',
            sku: 'CHEM-WAX-001',
            size: 'M',
            color: 'Vert et Jaune',
            weight: 600
          }
        ],
        status: 'delivered',
        payment_status: 'paid',
        payment_method: 'Carte bancaire',
        payment_reference: 'CB-20250114-056',
        subtotal: 105000,
        shipping_cost: 4000,
        tax: 0,
        discount: 0,
        total: 109000,
        shipping_address: {
          address_line_1: '78 Boulevard Circulaire',
          city: 'Lomé',
          state: 'Maritime',
          postal_code: 'BP 9012',
          country: 'Togo'
        },
        tracking_number: 'TG-SHIP-20250114-045',
        carrier: 'Togo Express',
        estimated_delivery: '2025-01-16',
        created_at: '2025-01-14T11:45:00',
        updated_at: '2025-01-15T16:30:00',
        confirmed_at: '2025-01-14T12:30:00',
        shipped_at: '2025-01-15T08:00:00',
        delivered_at: '2025-01-15T16:30:00',
        timeline: [
          {
            status: 'pending',
            date: '2025-01-14T11:45:00',
            note: 'Commande reçue'
          },
          {
            status: 'confirmed',
            date: '2025-01-14T12:30:00',
            note: 'Commande confirmée par le vendeur'
          },
          {
            status: 'shipped',
            date: '2025-01-15T08:00:00',
            note: 'Commande expédiée - Numéro de suivi: TG-SHIP-20250114-045'
          },
          {
            status: 'delivered',
            date: '2025-01-15T16:30:00',
            note: 'Commande livrée avec succès'
          }
        ]
      }
    ];
    
    this.filteredOrders = [...this.orders];
    this.sortOrders();
  }

  filterOrders(): void {
    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch = !this.searchTerm || 
        order.reference.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || order.status === this.statusFilter;
      const matchesPayment = !this.paymentFilter || order.payment_status === this.paymentFilter;
      
      return matchesSearch && matchesStatus && matchesPayment;
    });
    
    this.sortOrders();
  }

  sortOrders(): void {
    this.filteredOrders.sort((a, b) => {
      switch (this.sortBy) {
        case 'date_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'amount_desc':
          return b.total - a.total;
        case 'amount_asc':
          return a.total - b.total;
        default:
          return 0;
      }
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.paymentFilter = '';
    this.filterOrders();
  }

  toggleOrderExpand(orderId: string): void {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  getOrdersByStatus(status: string): Order[] {
    return this.orders.filter(order => order.status === status);
  }

  getTotalRevenue(): number {
    return this.orders.reduce((sum, order) => {
      if (order.payment_status === 'paid') {
        return sum + order.total;
      }
      return sum;
    }, 0);
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'En attente',
      'confirmed': 'Confirmée',
      'preparing': 'En préparation',
      'shipped': 'Expédiée',
      'delivered': 'Livrée',
      'cancelled': 'Annulée',
      'refunded': 'Remboursée'
    };
    return labels[status] || status;
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'pending': 'schedule',
      'confirmed': 'check',
      'preparing': 'inventory_2',
      'shipped': 'local_shipping',
      'delivered': 'check_circle',
      'cancelled': 'cancel',
      'refunded': 'money_off'
    };
    return icons[status] || 'help';
  }

  getPaymentStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'En attente',
      'paid': 'Payé',
      'refunded': 'Remboursé'
    };
    return labels[status] || status;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Il y a quelques minutes';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else if (diffInDays === 1) {
      return 'Hier';
    } else if (diffInDays < 7) {
      return `Il y a ${diffInDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  }

  refreshOrders(): void {
    console.log('🔄 Actualisation des commandes...');
    this.loadOrders();
  }

  exportOrders(): void {
    console.log('📥 Export des commandes...');
    // Logique d'export à implémenter
  }

  confirmOrder(order: Order): void {
    this.updateOrderStatus(order, 'confirmed');
  }

  startPreparing(order: Order): void {
    this.updateOrderStatus(order, 'preparing');
  }

  shipOrder(order: Order): void {
    this.updateOrderStatus(order, 'shipped');
  }

  markAsDelivered(order: Order): void {
    this.updateOrderStatus(order, 'delivered');
  }

  cancelOrder(order: Order): void {
    if (confirm(`Êtes-vous sûr de vouloir annuler la commande ${order.reference} ?`)) {
      this.updateOrderStatus(order, 'cancelled');
    }
  }

  private updateOrderStatus(order: Order, newStatus: string): void {
    this.vendorService.updateOrderStatus(order.id, newStatus).subscribe({
      next: (updatedOrder) => {
        order.status = newStatus as any;
        console.log(`✅ Statut de la commande ${order.reference} mis à jour: ${newStatus}`);
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du statut:', error);
        alert('Erreur lors de la mise à jour du statut de la commande');
      }
    });
  }

  printOrder(order: Order): void {
    console.log('🖨️ Impression de la commande', order.reference);
    // Logique d'impression à implémenter
  }

  viewCustomer(order: Order): void {
    console.log('👤 Affichage du profil client', order.customer.name);
  }

  addTracking(order: Order): void {
    const trackingNumber = prompt('Numéro de suivi :');
    if (trackingNumber) {
      order.tracking_number = trackingNumber;
      console.log('📍 Numéro de suivi ajouté', trackingNumber);
    }
  }

  contactCustomer(order: Order): void {
    console.log('📧 Contacter le client', order.customer.email);
  }
}
