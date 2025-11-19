import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ToastService } from '../../../../core/services/toast.service';

export interface ShippingZone {
  id: string;
  name: string;
  description?: string;
  country_code: string;
  zone_type: 'country' | 'region' | 'city';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShippingRate {
  id: string;
  zone_id: string;
  name: string;
  min_weight: number;
  max_weight?: number;
  price: number;
  estimated_days?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-admin-shipping-zones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatDialogModule,
    MatMenuModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule
  ],
  template: `
    <div class="shipping-zones-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>
            <mat-icon>local_shipping</mat-icon>
            Zones de Livraison
          </h1>
          <p class="subtitle">Gérez les zones et tarifs de livraison</p>
        </div>
        <div class="header-right">
          <button mat-raised-button color="primary" (click)="openZoneDialog()">
            <mat-icon>add</mat-icon>
            Nouvelle Zone
          </button>
        </div>
      </div>

      <!-- Loading -->
      @if (loading) {
        <div class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Chargement des zones...</p>
        </div>
      }

      <!-- Content -->
      @if (!loading) {
        <mat-tab-group>
          <!-- Zones Tab -->
          <mat-tab label="Zones de Livraison">
            <div class="zones-section">
              <!-- Zones Table -->
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Zones de Livraison</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="table-container">
                    <table mat-table [dataSource]="zones" class="zones-table">
                      <!-- Name Column -->
                      <ng-container matColumnDef="name">
                        <th mat-header-cell *matHeaderCellDef>Nom</th>
                        <td mat-cell *matCellDef="let zone">
                          <div class="zone-name">
                            <strong>{{ zone.name }}</strong>
                            @if (zone.description) {
                              <span class="zone-description">{{ zone.description }}</span>
                            }
                          </div>
                        </td>
                      </ng-container>

                      <!-- Country Column -->
                      <ng-container matColumnDef="country">
                        <th mat-header-cell *matHeaderCellDef>Pays</th>
                        <td mat-cell *matCellDef="let zone">
                          <mat-chip>{{ zone.country_code }}</mat-chip>
                        </td>
                      </ng-container>

                      <!-- Type Column -->
                      <ng-container matColumnDef="type">
                        <th mat-header-cell *matHeaderCellDef>Type</th>
                        <td mat-cell *matCellDef="let zone">
                          <mat-chip>{{ getZoneTypeLabel(zone.zone_type) }}</mat-chip>
                        </td>
                      </ng-container>

                      <!-- Status Column -->
                      <ng-container matColumnDef="status">
                        <th mat-header-cell *matHeaderCellDef>Statut</th>
                        <td mat-cell *matCellDef="let zone">
                          <mat-chip [ngClass]="zone.is_active ? 'active' : 'inactive'">
                            {{ zone.is_active ? 'Actif' : 'Inactif' }}
                          </mat-chip>
                        </td>
                      </ng-container>

                      <!-- Rates Count Column -->
                      <ng-container matColumnDef="rates">
                        <th mat-header-cell *matHeaderCellDef>Tarifs</th>
                        <td mat-cell *matCellDef="let zone">
                          <button mat-button (click)="viewRates(zone)">
                            <mat-icon>list</mat-icon>
                            Voir tarifs
                          </button>
                        </td>
                      </ng-container>

                      <!-- Actions Column -->
                      <ng-container matColumnDef="actions">
                        <th mat-header-cell *matHeaderCellDef>Actions</th>
                        <td mat-cell *matCellDef="let zone">
                          <button mat-icon-button [matMenuTriggerFor]="menu">
                            <mat-icon>more_vert</mat-icon>
                          </button>
                          <mat-menu #menu="matMenu">
                            <button mat-menu-item (click)="editZone(zone)">
                              <mat-icon>edit</mat-icon>
                              <span>Modifier</span>
                            </button>
                            <button mat-menu-item (click)="addRate(zone)">
                              <mat-icon>add</mat-icon>
                              <span>Ajouter tarif</span>
                            </button>
                            <button mat-menu-item (click)="toggleZoneStatus(zone)">
                              <mat-icon>{{ zone.is_active ? 'block' : 'check_circle' }}</mat-icon>
                              <span>{{ zone.is_active ? 'Désactiver' : 'Activer' }}</span>
                            </button>
                            <button mat-menu-item (click)="deleteZone(zone)" class="danger">
                              <mat-icon>delete</mat-icon>
                              <span>Supprimer</span>
                            </button>
                          </mat-menu>
                        </td>
                      </ng-container>

                      <tr mat-header-row *matHeaderRowDef="zoneColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: zoneColumns;"></tr>
                    </table>

                    @if (zones.length === 0) {
                      <div class="empty-state">
                        <mat-icon>local_shipping</mat-icon>
                        <p>Aucune zone de livraison</p>
                        <button mat-raised-button color="primary" (click)="openZoneDialog()">
                          Créer une zone
                        </button>
                      </div>
                    }
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Rates Tab (for selected zone) -->
          @if (selectedZone) {
            <mat-tab [label]="'Tarifs - ' + selectedZone.name">
              <div class="rates-section">
                <mat-card>
                  <mat-card-header>
                    <div class="card-header-content">
                      <mat-card-title>Tarifs de Livraison - {{ selectedZone.name }}</mat-card-title>
                      <button mat-raised-button color="primary" (click)="addRate(selectedZone)">
                        <mat-icon>add</mat-icon>
                        Nouveau Tarif
                      </button>
                    </div>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="table-container">
                      <table mat-table [dataSource]="rates" class="rates-table">
                        <!-- Name Column -->
                        <ng-container matColumnDef="name">
                          <th mat-header-cell *matHeaderCellDef>Nom</th>
                          <td mat-cell *matCellDef="let rate">{{ rate.name }}</td>
                        </ng-container>

                        <!-- Weight Column -->
                        <ng-container matColumnDef="weight">
                          <th mat-header-cell *matHeaderCellDef>Poids</th>
                          <td mat-cell *matCellDef="let rate">
                            {{ rate.min_weight }}g
                            @if (rate.max_weight) {
                              - {{ rate.max_weight }}g
                            } @else {
                              +
                            }
                          </td>
                        </ng-container>

                        <!-- Price Column -->
                        <ng-container matColumnDef="price">
                          <th mat-header-cell *matHeaderCellDef>Prix</th>
                          <td mat-cell *matCellDef="let rate">
                            {{ formatCurrency(rate.price) }}
                          </td>
                        </ng-container>

                        <!-- Estimated Days Column -->
                        <ng-container matColumnDef="days">
                          <th mat-header-cell *matHeaderCellDef>Délai</th>
                          <td mat-cell *matCellDef="let rate">
                            {{ rate.estimated_days ? rate.estimated_days + ' jours' : 'N/A' }}
                          </td>
                        </ng-container>

                        <!-- Status Column -->
                        <ng-container matColumnDef="status">
                          <th mat-header-cell *matHeaderCellDef>Statut</th>
                          <td mat-cell *matCellDef="let rate">
                            <mat-chip [ngClass]="rate.is_active ? 'active' : 'inactive'">
                              {{ rate.is_active ? 'Actif' : 'Inactif' }}
                            </mat-chip>
                          </td>
                        </ng-container>

                        <!-- Actions Column -->
                        <ng-container matColumnDef="actions">
                          <th mat-header-cell *matHeaderCellDef>Actions</th>
                          <td mat-cell *matCellDef="let rate">
                            <button mat-icon-button [matMenuTriggerFor]="rateMenu">
                              <mat-icon>more_vert</mat-icon>
                            </button>
                            <mat-menu #rateMenu="matMenu">
                              <button mat-menu-item (click)="editRate(rate)">
                                <mat-icon>edit</mat-icon>
                                <span>Modifier</span>
                              </button>
                              <button mat-menu-item (click)="toggleRateStatus(rate)">
                                <mat-icon>{{ rate.is_active ? 'block' : 'check_circle' }}</mat-icon>
                                <span>{{ rate.is_active ? 'Désactiver' : 'Activer' }}</span>
                              </button>
                              <button mat-menu-item (click)="deleteRate(rate)" class="danger">
                                <mat-icon>delete</mat-icon>
                                <span>Supprimer</span>
                              </button>
                            </mat-menu>
                          </td>
                        </ng-container>

                        <tr mat-header-row *matHeaderRowDef="rateColumns"></tr>
                        <tr mat-row *matRowDef="let row; columns: rateColumns;"></tr>
                      </table>

                      @if (rates.length === 0) {
                        <div class="empty-state">
                          <mat-icon>receipt</mat-icon>
                          <p>Aucun tarif pour cette zone</p>
                          <button mat-raised-button color="primary" (click)="addRate(selectedZone)">
                            Créer un tarif
                          </button>
                        </div>
                      }
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </mat-tab>
          }
        </mat-tab-group>
      }
    </div>

    <!-- Zone Dialog -->
    @if (showZoneDialog) {
      <div class="dialog-overlay" (click)="closeZoneDialog()">
        <div class="dialog-content" (click)="$event.stopPropagation()">
          <div class="dialog-header">
            <h2>{{ editingZone ? 'Modifier' : 'Créer' }} une Zone</h2>
            <button mat-icon-button (click)="closeZoneDialog()">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <form [formGroup]="zoneForm" (ngSubmit)="saveZone()">
            <div class="dialog-body">
              <mat-form-field appearance="outline">
                <mat-label>Nom de la zone</mat-label>
                <input matInput formControlName="name" required>
                <mat-error *ngIf="zoneForm.get('name')?.hasError('required')">
                  Le nom est requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Code Pays</mat-label>
                <input matInput formControlName="country_code" required placeholder="TG">
                <mat-hint>Code ISO du pays (ex: TG, FR, US)</mat-hint>
                <mat-error *ngIf="zoneForm.get('country_code')?.hasError('required')">
                  Le code pays est requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Type de zone</mat-label>
                <mat-select formControlName="zone_type" required>
                  <mat-option value="country">Pays</mat-option>
                  <mat-option value="region">Région</mat-option>
                  <mat-option value="city">Ville</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-slide-toggle formControlName="is_active">
                Zone active
              </mat-slide-toggle>
            </div>
            <div class="dialog-actions">
              <button mat-button type="button" (click)="closeZoneDialog()">Annuler</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="zoneForm.invalid || saving">
                {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Rate Dialog -->
    @if (showRateDialog) {
      <div class="dialog-overlay" (click)="closeRateDialog()">
        <div class="dialog-content" (click)="$event.stopPropagation()">
          <div class="dialog-header">
            <h2>{{ editingRate ? 'Modifier' : 'Créer' }} un Tarif</h2>
            <button mat-icon-button (click)="closeRateDialog()">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <form [formGroup]="rateForm" (ngSubmit)="saveRate()">
            <div class="dialog-body">
              <mat-form-field appearance="outline">
                <mat-label>Nom du tarif</mat-label>
                <input matInput formControlName="name" required>
                <mat-error *ngIf="rateForm.get('name')?.hasError('required')">
                  Le nom est requis
                </mat-error>
              </mat-form-field>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Poids minimum (g)</mat-label>
                  <input matInput type="number" formControlName="min_weight" required>
                  <mat-error *ngIf="rateForm.get('min_weight')?.hasError('required')">
                    Requis
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Poids maximum (g)</mat-label>
                  <input matInput type="number" formControlName="max_weight">
                  <mat-hint>Laisser vide pour illimité</mat-hint>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline">
                <mat-label>Prix (XOF)</mat-label>
                <input matInput type="number" formControlName="price" required>
                <mat-error *ngIf="rateForm.get('price')?.hasError('required')">
                  Le prix est requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Délai estimé (jours)</mat-label>
                <input matInput type="number" formControlName="estimated_days">
                <mat-hint>Délai de livraison estimé</mat-hint>
              </mat-form-field>

              <mat-slide-toggle formControlName="is_active">
                Tarif actif
              </mat-slide-toggle>
            </div>
            <div class="dialog-actions">
              <button mat-button type="button" (click)="closeRateDialog()">Annuler</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="rateForm.invalid || saving">
                {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .shipping-zones-page {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-header h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 28px;
      font-weight: 600;
      margin: 0;
    }

    .subtitle {
      color: #666;
      margin: 4px 0 0 0;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      gap: 16px;
    }

    .zones-section, .rates-section {
      padding: 20px 0;
    }

    .table-container {
      overflow-x: auto;
    }

    .zones-table, .rates-table {
      width: 100%;
    }

    .zone-name {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .zone-description {
      font-size: 12px;
      color: #666;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .card-header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog-content {
      background: white;
      border-radius: 8px;
      padding: 24px;
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 20px;
    }

    .dialog-body {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    mat-chip.active {
      background-color: #4caf50;
      color: white;
    }

    mat-chip.inactive {
      background-color: #f44336;
      color: white;
    }

    .danger {
      color: #f44336;
    }
  `]
})
export class AdminShippingZonesComponent implements OnInit {
  zones: ShippingZone[] = [];
  rates: ShippingRate[] = [];
  selectedZone: ShippingZone | null = null;
  loading = false;
  saving = false;
  
  showZoneDialog = false;
  showRateDialog = false;
  editingZone: ShippingZone | null = null;
  editingRate: ShippingRate | null = null;

  zoneColumns: string[] = ['name', 'country', 'type', 'status', 'rates', 'actions'];
  rateColumns: string[] = ['name', 'weight', 'price', 'days', 'status', 'actions'];

  zoneForm: FormGroup;
  rateForm: FormGroup;

  private apiUrl = `${environment.apiUrl}/admin/shipping`;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private toast: ToastService
  ) {
    this.zoneForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      country_code: ['', Validators.required],
      zone_type: ['country', Validators.required],
      is_active: [true]
    });

    this.rateForm = this.fb.group({
      name: ['', Validators.required],
      min_weight: [0, Validators.required],
      max_weight: [null],
      price: [0, Validators.required],
      estimated_days: [null],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    this.loadZones();
  }

  loadZones(): void {
    this.loading = true;
    this.http.get<{ success: boolean; data: ShippingZone[] }>(`${this.apiUrl}/zones`).subscribe({
      next: (response) => {
        if (response.success) {
          this.zones = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement zones:', error);
        this.toast.error('Erreur lors du chargement des zones');
        this.loading = false;
      }
    });
  }

  loadRates(zoneId: string): void {
    this.http.get<{ success: boolean; data: ShippingRate[] }>(`${this.apiUrl}/zones/${zoneId}/rates`).subscribe({
      next: (response) => {
        if (response.success) {
          this.rates = response.data;
        }
      },
      error: (error) => {
        console.error('Erreur chargement tarifs:', error);
        this.toast.error('Erreur lors du chargement des tarifs');
      }
    });
  }

  openZoneDialog(zone?: ShippingZone): void {
    this.editingZone = zone || null;
    if (zone) {
      this.zoneForm.patchValue({
        name: zone.name,
        description: zone.description || '',
        country_code: zone.country_code,
        zone_type: zone.zone_type,
        is_active: zone.is_active
      });
    } else {
      this.zoneForm.reset({
        name: '',
        description: '',
        country_code: '',
        zone_type: 'country',
        is_active: true
      });
    }
    this.showZoneDialog = true;
  }

  closeZoneDialog(): void {
    this.showZoneDialog = false;
    this.editingZone = null;
  }

  saveZone(): void {
    if (this.zoneForm.invalid) return;

    this.saving = true;
    const data = this.zoneForm.value;

    const request = this.editingZone
      ? this.http.put(`${this.apiUrl}/zones/${this.editingZone.id}`, data)
      : this.http.post(`${this.apiUrl}/zones`, data);

    request.subscribe({
      next: (response: any) => {
        if (response.success) {
          this.toast.success(this.editingZone ? 'Zone modifiée' : 'Zone créée');
          this.closeZoneDialog();
          this.loadZones();
        }
        this.saving = false;
      },
      error: (error) => {
        console.error('Erreur sauvegarde zone:', error);
        this.toast.error(error.error?.message || 'Erreur lors de la sauvegarde');
        this.saving = false;
      }
    });
  }

  editZone(zone: ShippingZone): void {
    this.openZoneDialog(zone);
  }

  deleteZone(zone: ShippingZone): void {
    if (!confirm(`Supprimer la zone "${zone.name}" ?`)) return;

    this.http.delete(`${this.apiUrl}/zones/${zone.id}`).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.toast.success('Zone supprimée');
          this.loadZones();
          if (this.selectedZone?.id === zone.id) {
            this.selectedZone = null;
            this.rates = [];
          }
        }
      },
      error: (error) => {
        console.error('Erreur suppression zone:', error);
        this.toast.error(error.error?.message || 'Erreur lors de la suppression');
      }
    });
  }

  toggleZoneStatus(zone: ShippingZone): void {
    const data = { ...zone, is_active: !zone.is_active };
    this.http.put(`${this.apiUrl}/zones/${zone.id}`, data).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.toast.success(`Zone ${data.is_active ? 'activée' : 'désactivée'}`);
          this.loadZones();
        }
      },
      error: (error) => {
        console.error('Erreur changement statut:', error);
        this.toast.error('Erreur lors du changement de statut');
      }
    });
  }

  viewRates(zone: ShippingZone): void {
    this.selectedZone = zone;
    this.loadRates(zone.id);
  }

  addRate(zone: ShippingZone): void {
    this.selectedZone = zone;
    this.editingRate = null;
    this.rateForm.reset({
      name: '',
      min_weight: 0,
      max_weight: null,
      price: 0,
      estimated_days: null,
      is_active: true
    });
    this.showRateDialog = true;
  }

  closeRateDialog(): void {
    this.showRateDialog = false;
    this.editingRate = null;
  }

  saveRate(): void {
    if (this.rateForm.invalid || !this.selectedZone) return;

    this.saving = true;
    const data = this.rateForm.value;

    const request = this.editingRate
      ? this.http.put(`${this.apiUrl}/rates/${this.editingRate.id}`, data)
      : this.http.post(`${this.apiUrl}/zones/${this.selectedZone.id}/rates`, data);

    request.subscribe({
      next: (response: any) => {
        if (response.success) {
          this.toast.success(this.editingRate ? 'Tarif modifié' : 'Tarif créé');
          this.closeRateDialog();
          this.loadRates(this.selectedZone!.id);
        }
        this.saving = false;
      },
      error: (error) => {
        console.error('Erreur sauvegarde tarif:', error);
        this.toast.error(error.error?.message || 'Erreur lors de la sauvegarde');
        this.saving = false;
      }
    });
  }

  editRate(rate: ShippingRate): void {
    this.editingRate = rate;
    this.rateForm.patchValue({
      name: rate.name,
      min_weight: rate.min_weight,
      max_weight: rate.max_weight || null,
      price: rate.price,
      estimated_days: rate.estimated_days || null,
      is_active: rate.is_active
    });
    this.showRateDialog = true;
  }

  deleteRate(rate: ShippingRate): void {
    if (!confirm(`Supprimer le tarif "${rate.name}" ?`)) return;

    this.http.delete(`${this.apiUrl}/rates/${rate.id}`).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.toast.success('Tarif supprimé');
          if (this.selectedZone) {
            this.loadRates(this.selectedZone.id);
          }
        }
      },
      error: (error) => {
        console.error('Erreur suppression tarif:', error);
        this.toast.error(error.error?.message || 'Erreur lors de la suppression');
      }
    });
  }

  toggleRateStatus(rate: ShippingRate): void {
    const data = { ...rate, is_active: !rate.is_active };
    this.http.put(`${this.apiUrl}/rates/${rate.id}`, data).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.toast.success(`Tarif ${data.is_active ? 'activé' : 'désactivé'}`);
          if (this.selectedZone) {
            this.loadRates(this.selectedZone.id);
          }
        }
      },
      error: (error) => {
        console.error('Erreur changement statut:', error);
        this.toast.error('Erreur lors du changement de statut');
      }
    });
  }

  getZoneTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'country': 'Pays',
      'region': 'Région',
      'city': 'Ville'
    };
    return labels[type] || type;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(value);
  }
}

