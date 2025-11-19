import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VariantService } from '../../../core/services/variant.service';
import { ProductVariant, VariantFormData } from '../../../core/models/variant.interface';

@Component({
  selector: 'app-variant-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="variant-manager">
      <!-- Header -->
      <div class="manager-header">
        <h3>
          <i class="fas fa-palette"></i>
          Variantes du produit
        </h3>
        <button class="btn-primary" (click)="openVariantModal()">
          <i class="fas fa-plus"></i>
          Ajouter une variante
        </button>
      </div>

      <!-- Variantes List -->
      <div class="variants-list" *ngIf="variants.length > 0">
        <div class="table-responsive">
          <table class="variants-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>SKU</th>
                <th>Nom</th>
                <th>Couleur</th>
                <th>Taille</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let variant of variants; trackBy: trackByVariantId">
                <td>
                  <div class="variant-image">
                    <img [src]="variant.primary_image || '/assets/images/placeholder.png'"
                         [alt]="variant.name">
                  </div>
                </td>
                <td>
                  <span class="sku-badge">{{ variant.sku }}</span>
                </td>
                <td>
                  <strong>{{ variant.name }}</strong>
                </td>
                <td>
                  <div class="color-cell" *ngIf="variant.color">
                    <span class="color-swatch"
                          [style.background-color]="variant.color_hex || '#ccc'"></span>
                    {{ variant.color }}
                  </div>
                  <span *ngIf="!variant.color" class="text-muted">-</span>
                </td>
                <td>
                  <span class="size-badge" *ngIf="variant.size">{{ variant.size }}</span>
                  <span *ngIf="!variant.size" class="text-muted">-</span>
                </td>
                <td>
                  <span *ngIf="variant.price">{{ variant.price | number }} FCFA</span>
                  <span *ngIf="!variant.price" class="text-muted">Prix par défaut</span>
                </td>
                <td>
                  <span class="stock-badge" [class]="getStockClass(variant)">
                    {{ variant.stock_quantity }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" [class]="'status-' + variant.status">
                    {{ getStatusLabel(variant.status) }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-icon" (click)="editVariant(variant)" title="Modifier">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" (click)="updateStock(variant)" title="Gérer le stock">
                      <i class="fas fa-box"></i>
                    </button>
                    <button class="btn-icon btn-danger" (click)="deleteVariant(variant.id)" title="Supprimer">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="variants.length === 0 && !loading">
        <i class="fas fa-palette"></i>
        <h4>Aucune variante</h4>
        <p>Ajoutez des variantes pour proposer différentes options (couleurs, tailles, etc.)</p>
        <button class="btn-primary" (click)="openVariantModal()">
          <i class="fas fa-plus"></i>
          Créer la première variante
        </button>
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Chargement des variantes...</p>
      </div>
    </div>

    <!-- Modal Variante -->
    <div class="modal-overlay" *ngIf="showVariantModal" (click)="closeVariantModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editingVariant ? 'Modifier' : 'Ajouter' }} une variante</h3>
          <button class="btn-close" (click)="closeVariantModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form [formGroup]="variantForm" (ngSubmit)="saveVariant()">
          <div class="modal-body">
            <!-- Identification -->
            <div class="form-section">
              <h4>Identification</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>SKU *</label>
                  <input type="text" formControlName="sku" class="form-control"
                         placeholder="Ex: PROD-001-RED-M">
                  <small class="form-text">Code unique de la variante</small>
                </div>

                <div class="form-group">
                  <label>Nom *</label>
                  <input type="text" formControlName="name" class="form-control"
                         placeholder="Ex: Rouge - Taille M">
                </div>
              </div>
            </div>

            <!-- Attributs -->
            <div class="form-section">
              <h4>Attributs</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>Couleur</label>
                  <input type="text" formControlName="color" class="form-control"
                         placeholder="Ex: Rouge">
                </div>

                <div class="form-group">
                  <label>Code couleur</label>
                  <input type="color" formControlName="color_hex" class="form-control-color">
                </div>

                <div class="form-group">
                  <label>Taille</label>
                  <select formControlName="size" class="form-control">
                    <option value="">-- Choisir --</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                    <option value="XXXL">XXXL</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Matériau</label>
                  <input type="text" formControlName="material" class="form-control"
                         placeholder="Ex: Coton">
                </div>

                <div class="form-group">
                  <label>Motif</label>
                  <input type="text" formControlName="pattern" class="form-control"
                         placeholder="Ex: Rayures">
                </div>
              </div>
            </div>

            <!-- Prix -->
            <div class="form-section">
              <h4>Prix</h4>
              <p class="section-note">Laissez vide pour utiliser le prix du produit principal</p>
              <div class="form-row">
                <div class="form-group">
                  <label>Prix de vente</label>
                  <input type="number" formControlName="price" class="form-control"
                         placeholder="0" min="0">
                </div>

                <div class="form-group">
                  <label>Prix comparé</label>
                  <input type="number" formControlName="compare_at_price" class="form-control"
                         placeholder="0" min="0">
                </div>

                <div class="form-group">
                  <label>Prix de revient</label>
                  <input type="number" formControlName="cost_price" class="form-control"
                         placeholder="0" min="0">
                </div>
              </div>
            </div>

            <!-- Stock -->
            <div class="form-section">
              <h4>Inventaire</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>Quantité en stock *</label>
                  <input type="number" formControlName="stock_quantity" class="form-control"
                         placeholder="0" min="0">
                </div>

                <div class="form-group">
                  <label>Seuil stock faible</label>
                  <input type="number" formControlName="low_stock_threshold" class="form-control"
                         placeholder="5" min="0">
                </div>
              </div>

              <div class="form-row">
                <div class="form-check">
                  <input type="checkbox" formControlName="track_inventory" class="form-check-input" id="trackInventory">
                  <label class="form-check-label" for="trackInventory">
                    Suivre le stock pour cette variante
                  </label>
                </div>

                <div class="form-check">
                  <input type="checkbox" formControlName="allow_backorders" class="form-check-input" id="allowBackorders">
                  <label class="form-check-label" for="allowBackorders">
                    Autoriser les précommandes
                  </label>
                </div>
              </div>
            </div>

            <!-- Poids -->
            <div class="form-section">
              <h4>Expédition (optionnel)</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>Poids (grammes)</label>
                  <input type="number" formControlName="weight" class="form-control"
                         placeholder="0" min="0">
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="closeVariantModal()">
              Annuler
            </button>
            <button type="submit" class="btn-primary" [disabled]="!variantForm.valid || saving">
              <i class="fas fa-spinner fa-spin" *ngIf="saving"></i>
              <i class="fas fa-check" *ngIf="!saving"></i>
              {{ editingVariant ? 'Mettre à jour' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Stock Update -->
    <div class="modal-overlay" *ngIf="showStockModal" (click)="closeStockModal()">
      <div class="modal-content modal-small" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Gérer le stock</h3>
          <button class="btn-close" (click)="closeStockModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form [formGroup]="stockForm" (ngSubmit)="saveStock()">
          <div class="modal-body">
            <p><strong>{{ selectedVariant?.name }}</strong></p>
            <p>Stock actuel: <strong>{{ selectedVariant?.stock_quantity }}</strong></p>

            <div class="form-group">
              <label>Opération *</label>
              <select formControlName="operation" class="form-control">
                <option value="set">Définir (remplacer)</option>
                <option value="add">Ajouter</option>
                <option value="subtract">Retirer</option>
              </select>
            </div>

            <div class="form-group">
              <label>Quantité *</label>
              <input type="number" formControlName="stock_quantity" class="form-control"
                     placeholder="0" min="0">
            </div>

            <div class="form-group">
              <label>Raison</label>
              <input type="text" formControlName="reason" class="form-control"
                     placeholder="Ex: Réapprovisionnement">
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="closeStockModal()">
              Annuler
            </button>
            <button type="submit" class="btn-primary" [disabled]="!stockForm.valid || saving">
              <i class="fas fa-spinner fa-spin" *ngIf="saving"></i>
              <i class="fas fa-check" *ngIf="!saving"></i>
              Mettre à jour
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./variant-manager.component.scss']
})
export class VariantManagerComponent implements OnInit, OnDestroy {
  @Input() productId!: string;

  variants: ProductVariant[] = [];
  loading = false;
  saving = false;

  showVariantModal = false;
  showStockModal = false;

  variantForm!: FormGroup;
  stockForm!: FormGroup;

  editingVariant: ProductVariant | null = null;
  selectedVariant: ProductVariant | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private variantService: VariantService
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    if (this.productId) {
      this.loadVariants();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForms(): void {
    this.variantForm = this.fb.group({
      sku: ['', Validators.required],
      name: ['', Validators.required],
      color: [''],
      color_hex: [''],
      size: [''],
      material: [''],
      pattern: [''],
      price: [null],
      compare_at_price: [null],
      cost_price: [null],
      stock_quantity: [0, [Validators.required, Validators.min(0)]],
      low_stock_threshold: [5, Validators.min(0)],
      track_inventory: [true],
      allow_backorders: [false],
      weight: [null]
    });

    this.stockForm = this.fb.group({
      operation: ['set', Validators.required],
      stock_quantity: [0, [Validators.required, Validators.min(0)]],
      reason: ['']
    });
  }

  loadVariants(): void {
    this.loading = true;
    this.variantService.getProductVariants(this.productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.variants = response.data;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading variants:', error);
          this.loading = false;
        }
      });
  }

  openVariantModal(variant?: ProductVariant): void {
    this.editingVariant = variant || null;

    if (variant) {
      this.variantForm.patchValue({
        sku: variant.sku,
        name: variant.name,
        color: variant.color,
        color_hex: variant.color_hex,
        size: variant.size,
        material: variant.material,
        pattern: variant.pattern,
        price: variant.price,
        compare_at_price: variant.compare_at_price,
        cost_price: variant.cost_price,
        stock_quantity: variant.stock_quantity,
        low_stock_threshold: variant.low_stock_threshold,
        track_inventory: variant.track_inventory,
        allow_backorders: variant.allow_backorders,
        weight: variant.weight
      });
    } else {
      this.variantForm.reset({
        stock_quantity: 0,
        low_stock_threshold: 5,
        track_inventory: true,
        allow_backorders: false
      });
    }

    this.showVariantModal = true;
  }

  closeVariantModal(): void {
    this.showVariantModal = false;
    this.editingVariant = null;
  }

  editVariant(variant: ProductVariant): void {
    this.openVariantModal(variant);
  }

  saveVariant(): void {
    if (this.variantForm.invalid) return;

    this.saving = true;
    const formData = this.variantForm.value;

    const observable = this.editingVariant
      ? this.variantService.updateVariant(this.editingVariant.id, formData)
      : this.variantService.createVariant(this.productId, formData);

    observable.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadVariants();
          this.closeVariantModal();
          alert(response.message);
        }
        this.saving = false;
      },
      error: (error) => {
        console.error('Error saving variant:', error);
        alert('Erreur lors de la sauvegarde de la variante');
        this.saving = false;
      }
    });
  }

  updateStock(variant: ProductVariant): void {
    this.selectedVariant = variant;
    this.stockForm.reset({
      operation: 'set',
      stock_quantity: variant.stock_quantity,
      reason: ''
    });
    this.showStockModal = true;
  }

  closeStockModal(): void {
    this.showStockModal = false;
    this.selectedVariant = null;
  }

  saveStock(): void {
    if (this.stockForm.invalid || !this.selectedVariant) return;

    this.saving = true;
    const formData = this.stockForm.value;

    this.variantService.updateVariantStock(this.selectedVariant.id, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.loadVariants();
            this.closeStockModal();
            alert(response.message);
          }
          this.saving = false;
        },
        error: (error) => {
          console.error('Error updating stock:', error);
          alert('Erreur lors de la mise à jour du stock');
          this.saving = false;
        }
      });
  }

  deleteVariant(variantId: string): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette variante ?')) return;

    this.variantService.deleteVariant(variantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.loadVariants();
            alert(response.message);
          }
        },
        error: (error) => {
          console.error('Error deleting variant:', error);
          alert('Erreur lors de la suppression de la variante');
        }
      });
  }

  getStockClass(variant: ProductVariant): string {
    if (variant.stock_quantity === 0) return 'stock-out';
    if (variant.stock_quantity <= variant.low_stock_threshold) return 'stock-low';
    return 'stock-ok';
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      active: 'Actif',
      inactive: 'Inactif',
      out_of_stock: 'Rupture'
    };
    return labels[status] || status;
  }

  trackByVariantId(index: number, variant: ProductVariant): string {
    return variant.id;
  }
}
