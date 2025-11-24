import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../../../core/services/category.service';
import { ActivatedRoute } from '@angular/router';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  subcategories?: CategoryOption[];
}

interface ProductFormData {
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  status: 'draft' | 'active' | 'inactive' | 'out_of_stock';
  category: string;
  fabricType?: string;
  genderTarget?: string;
  ageGroup?: string;
  season?: string;
  occasion?: string;
  stockQuantity: number;
  lowStockThreshold?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  colorsAvailable: string[];
  sizesAvailable: string[];
  materials: string[];
  careInstructions?: string;
  culturalSignificance?: string;
  artisanName?: string;
  artisanStory?: string;
  artisanLocation?: string;
  handmade?: boolean;
  customizable?: boolean;
  featured?: boolean;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  images?: string[];
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor],
  template: `
    <div class="product-form-overlay" *ngIf="isVisible" (click)="onOverlayClick($event)">
      <div class="product-form-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ isEditMode ? 'Modifier le produit' : 'Ajouter un produit' }}</h2>
<button class="close-btn" 
        (click)="close.emit(); $event.stopPropagation()" 
        type="button">
                    <i class="fas fa-times"></i>
          </button>
        </div>

        <form class="product-form" (ngSubmit)="onSubmit()">
          <!-- Navigation par onglets -->
          <div class="tabs">
            <button type="button" 
              class="tab" 
              [class.active]="activeTab === 'basic'"
              (click)="activeTab = 'basic'">
              <i class="fas fa-info-circle"></i>
              Informations de base
            </button>
            <button type="button" 
              class="tab" 
              [class.active]="activeTab === 'images'"
              (click)="activeTab = 'images'">
              <i class="fas fa-images"></i>
              Photos ({{ selectedImages.length }})
            </button>
            <button type="button" 
              class="tab" 
              [class.active]="activeTab === 'variants'"
              (click)="activeTab = 'variants'">
              <i class="fas fa-palette"></i>
              Couleurs & Tailles
            </button>
            <button type="button" 
              class="tab" 
              [class.active]="activeTab === 'details'"
              (click)="activeTab = 'details'">
              <i class="fas fa-list"></i>
              Caractéristiques
            </button>
            <button type="button" 
              class="tab" 
              [class.active]="activeTab === 'seo'"
              (click)="activeTab = 'seo'">
              <i class="fas fa-search"></i>
              SEO
            </button>
          </div>

          <div class="form-content">
            <!-- ONGLET 1: INFORMATIONS DE BASE -->
            <div class="tab-content" *ngIf="activeTab === 'basic'">
              <div class="form-section">
                <h3>Informations principales</h3>
                <div class="form-grid">
                  <div class="form-group full-width">
                    <label for="name">Nom du produit * <span class="counter" [class.warning]="(formData.name || '').length > 180" [class.error]="(formData.name || '').length >= 200">{{ (formData.name || '').length }}/200</span></label>
                    <input 
                      type="text" 
                      id="name" 
                      [(ngModel)]="formData.name" 
                      name="name"
                      required
                      maxlength="200"
                      (input)="onNameInput($event)"
                      placeholder="Ex: Robe Ankara Élégante à Motifs Traditionnels">
                  </div>

                  <div class="form-group full-width">
                    <label for="shortDescription">Description courte <span class="counter" [class.warning]="(formData.shortDescription || '').length > 180" [class.error]="(formData.shortDescription || '').length >= 200">{{ (formData.shortDescription || '').length }}/200</span></label>
                    <input 
                      type="text" 
                      id="shortDescription" 
                      [(ngModel)]="formData.shortDescription" 
                      name="shortDescription"
                      maxlength="200"
                      (input)="onShortDescriptionInput($event)"
                      placeholder="Résumé en une phrase pour les listes de produits">
                  </div>

                  <div class="form-group full-width">
                    <label for="description">Description complète * <span class="counter">{{ (formData.description || '').length }}</span></label>
                    <textarea 
                      id="description" 
                      [(ngModel)]="formData.description" 
                      name="description"
                      required
                      rows="6"
                      (input)="onDescriptionInput($event)"
                      placeholder="Décrivez votre produit en détail : matériaux, coupe, inspiration culturelle, occasions d'utilisation..."></textarea>
                  </div>
                </div>
              </div>

              <div class="form-section">
                <h3>Catégorie & Classification</h3>
                <div class="form-grid">
                  <div class="form-group">
                    <label for="category">Catégorie *</label>
                    <select 
                      id="category" 
                      [(ngModel)]="formData.category" 
                      name="category" 
                      required
                      [disabled]="loadingCategories">
                      <option value="">{{ loadingCategories ? 'Chargement...' : 'Sélectionner une catégorie' }}</option>
                      <option 
                        *ngFor="let cat of flatCategories" 
                        [value]="cat.id || cat.slug || cat.name">
                        {{ cat.name }}
                      </option>
                    </select>
                    <small class="help-text" *ngIf="loadingCategories">
                      Chargement des catégories...
                    </small>
                    <small class="help-text" *ngIf="!loadingCategories && flatCategories.length === 0">
                      Aucune catégorie disponible. Créez-en une depuis le dashboard admin.
                    </small>
                  </div>

                  <div class="form-group">
                    <label for="fabricType">Type de tissu</label>
                    <select id="fabricType" [(ngModel)]="formData.fabricType" name="fabricType">
                      <option value="">Sélectionner un tissu</option>
                      <option value="wax">Wax</option>
                      <option value="bazin">Bazin</option>
                      <option value="ankara">Ankara</option>
                      <option value="kente">Kente</option>
                      <option value="bogolan">Bogolan (Mud Cloth)</option>
                      <option value="aso-oke">Aso-Oke</option>
                      <option value="shweshwe">Shweshwe</option>
                      <option value="kitenge">Kitenge</option>
                      <option value="dashiki">Dashiki</option>
                      <option value="coton">Coton</option>
                      <option value="soie">Soie</option>
                      <option value="lin">Lin</option>
                      <option value="satin">Satin</option>
                      <option value="dentelle">Dentelle</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="genderTarget">Genre cible</label>
                    <select id="genderTarget" [(ngModel)]="formData.genderTarget" name="genderTarget">
                      <option value="unisexe">Unisexe</option>
                      <option value="femme">Femme</option>
                      <option value="homme">Homme</option>
                      <option value="fille">Fille</option>
                      <option value="garcon">Garçon</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="ageGroup">Tranche d'âge</label>
                    <select id="ageGroup" [(ngModel)]="formData.ageGroup" name="ageGroup">
                      <option value="adulte">Adulte</option>
                      <option value="adolescent">Adolescent</option>
                      <option value="enfant">Enfant</option>
                      <option value="bebe">Bébé</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="season">Saison</label>
                    <select id="season" [(ngModel)]="formData.season" name="season">
                      <option value="toute_saison">Toute saison</option>
                      <option value="ete">Été</option>
                      <option value="hiver">Hiver</option>
                      <option value="printemps">Printemps</option>
                      <option value="automne">Automne</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="occasion">Occasion</label>
                    <select id="occasion" [(ngModel)]="formData.occasion" name="occasion">
                      <option value="quotidien">Quotidien</option>
                      <option value="travail">Travail</option>
                      <option value="ceremonie">Cérémonie</option>
                      <option value="mariage">Mariage</option>
                      <option value="fete">Fête</option>
                      <option value="traditionnel">Événement traditionnel</option>
                      <option value="sportif">Sportif</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="form-section">
                <h3>Prix & Stock</h3>
                <div class="form-grid">
                  <div class="form-group">
                    <label for="price">Prix (FCFA) *</label>
                    <input 
                      type="number" 
                      id="price" 
                      [(ngModel)]="formData.price" 
                      name="price"
                      required
                      min="0"
                      step="100"
                      placeholder="25000">
                  </div>

                  <div class="form-group">
                    <label for="compareAtPrice">Prix comparé (FCFA)</label>
                    <input 
                      type="number" 
                      id="compareAtPrice" 
                      [(ngModel)]="formData.compareAtPrice" 
                      name="compareAtPrice"
                      min="0"
                      step="100"
                      placeholder="30000">
                    <small class="help-text">Pour montrer les réductions</small>
                  </div>

                  <div class="form-group">
                    <label for="sku">SKU (Code produit) *</label>
                    <input 
                      type="text" 
                      id="sku" 
                      [(ngModel)]="formData.sku" 
                      name="sku"
                      required
                      (blur)="generateSkuIfEmpty()"
                      placeholder="ROB-1234">
                    <small class="help-text">Généré automatiquement si vide</small>
                  </div>

                  <div class="form-group">
                    <label for="status">Statut *</label>
                    <select id="status" [(ngModel)]="formData.status" name="status" required>
                      <option value="draft">📝 Brouillon</option>
                      <option value="active">✅ Actif</option>
                      <option value="inactive">⏸️ Inactif</option>
                      <option value="out_of_stock">❌ Rupture de stock</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="stockQuantity">Quantité en stock *</label>
                    <input 
                      type="number" 
                      id="stockQuantity" 
                      [(ngModel)]="formData.stockQuantity" 
                      name="stockQuantity"
                      required
                      min="0"
                      placeholder="50">
                  </div>

                  <div class="form-group">
                    <label for="lowStockThreshold">Seuil stock faible</label>
                    <input 
                      type="number" 
                      id="lowStockThreshold" 
                      [(ngModel)]="formData.lowStockThreshold" 
                      name="lowStockThreshold"
                      min="0"
                      placeholder="10">
                    <small class="help-text">Alertez-vous à ce niveau</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- ONGLET 2: IMAGES -->
            <div class="tab-content" *ngIf="activeTab === 'images'">
              <div class="form-section">
                <h3>Photos du produit</h3>
                <p class="help-text">Ajoutez jusqu'à 10 photos. La première image sera la photo principale.</p>
                
                <div class="image-upload-area">
                  <input 
                    type="file" 
                    id="imageUpload" 
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" 
                    multiple
                    (change)="onFilesSelected($event)"
                    [disabled]="selectedImages.length >= 10"
                    style="display: none">
                  
                  <label for="imageUpload" class="upload-label" [class.disabled]="selectedImages.length >= 10">
                    <i class="fas fa-cloud-upload"></i>
                    <span>Cliquez ou glissez vos images ici</span>
                    <small>PNG, JPG, WEBP, GIF (max 5 Mo chacune, minimum 1 image requise)</small>
                  </label>
                  
                  <div class="image-validation-info" *ngIf="selectedImages.length === 0">
                    <small class="error-text">⚠️ Au moins une image est requise pour créer un produit</small>
                  </div>
                </div>

                <div class="images-preview" *ngIf="selectedImages.length > 0">
                  <div class="image-item" *ngFor="let image of selectedImages; let i = index">
                    <img [src]="image.preview" [alt]="'Image ' + (i + 1)">
                    <div class="image-overlay">
                      <div class="image-badge" *ngIf="i === 0">Principal</div>
                      <div class="image-actions">
                        <button type="button" class="action-btn" (click)="moveImageUp(i)" [disabled]="i === 0" title="Monter">
                          <i class="fas fa-arrow-up"></i>
                        </button>
                        <button type="button" class="action-btn" (click)="moveImageDown(i)" [disabled]="i === selectedImages.length - 1" title="Descendre">
                          <i class="fas fa-arrow-down"></i>
                        </button>
                        <button type="button" class="action-btn delete" (click)="removeImage(i)" title="Supprimer">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ONGLET 3: COULEURS & TAILLES -->
            <div class="tab-content" *ngIf="activeTab === 'variants'">
              <div class="form-section">
                <h3>Couleurs disponibles</h3>
                <div class="color-grid">
                  <div class="color-option" *ngFor="let color of availableColors" (click)="toggleColor(color.value)">
                    <div class="color-circle" [style.background]="color.hex" [class.selected]="isColorSelected(color.value)">
                      <i class="fas fa-check" *ngIf="isColorSelected(color.value)"></i>
                    </div>
                    <span>{{ color.label }}</span>
                  </div>
                </div>
              </div>

              <div class="form-section">
                <h3>Tailles disponibles</h3>
                <div class="size-grid">
                  <button type="button" 
                    class="size-option" 
                    *ngFor="let size of availableSizes" 
                    (click)="toggleSize(size)"
                    [class.selected]="isSizeSelected(size)">
                    {{ size }}
                  </button>
                </div>
              </div>
            </div>

            <!-- ONGLET 4: CARACTÉRISTIQUES -->
            <div class="tab-content" *ngIf="activeTab === 'details'">
              <div class="form-section">
                <h3>Dimensions & Poids</h3>
                <div class="form-grid">
                  <div class="form-group">
                    <label for="weight">Poids (kg)</label>
                    <input 
                      type="number" 
                      id="weight" 
                      [(ngModel)]="formData.weight" 
                      name="weight"
                      min="0"
                      step="0.1"
                      placeholder="0.5">
                  </div>
                  <div class="form-group">
                    <label for="length">Longueur (cm)</label>
                    <input 
                      type="number" 
                      id="length" 
                      [ngModel]="formData.dimensions?.length" 
                      (ngModelChange)="updateDimension('length', $event)"
                      name="length"
                      min="0"
                      placeholder="50">
                  </div>
                  <div class="form-group">
                    <label for="width">Largeur (cm)</label>
                    <input 
                      type="number" 
                      id="width" 
                      [ngModel]="formData.dimensions?.width" 
                      (ngModelChange)="updateDimension('width', $event)"
                      name="width"
                      min="0"
                      placeholder="40">
                  </div>
                  <div class="form-group">
                    <label for="height">Hauteur (cm)</label>
                    <input 
                      type="number" 
                      id="height" 
                      [ngModel]="formData.dimensions?.height" 
                      (ngModelChange)="updateDimension('height', $event)"
                      name="height"
                      min="0"
                      placeholder="5">
                  </div>
                </div>
              </div>

              <div class="form-section">
                <h3>Matériaux</h3>
                <div class="form-group">
                  <label for="materials">Liste des matériaux (séparés par des virgules)</label>
                  <input 
                    type="text" 
                    id="materials" 
                    [(ngModel)]="materialsInput" 
                    name="materials"
                    (blur)="updateMaterials()"
                    placeholder="100% Coton, Wax, Broderie">
                  <div class="tags-display" *ngIf="formData.materials.length > 0">
                    <span class="tag" *ngFor="let material of formData.materials">
                      {{ material }}
                      <i class="fas fa-times" (click)="removeMaterial(material)"></i>
                    </span>
                  </div>
                </div>
              </div>

              <div class="form-section">
                <h3>Instructions d'entretien</h3>
                <div class="form-group">
                  <label for="careInstructions">Conseils d'entretien</label>
                  <textarea 
                    id="careInstructions" 
                    [(ngModel)]="formData.careInstructions" 
                    name="careInstructions"
                    rows="3"
                    placeholder="Lavage à la main à l'eau froide. Séchage à plat. Repassage à basse température."></textarea>
                </div>
              </div>

              <div class="form-section">
                <h3>Signification culturelle</h3>
                <div class="form-group">
                  <label for="culturalSignificance">Histoire et signification</label>
                  <textarea 
                    id="culturalSignificance" 
                    [(ngModel)]="formData.culturalSignificance" 
                    name="culturalSignificance"
                    rows="3"
                    placeholder="Partagez l'histoire, les motifs traditionnels ou la signification culturelle de ce produit..."></textarea>
                </div>
              </div>

              <div class="form-section">
                <h3>Artisan & Fabrication</h3>
                <div class="form-grid">
                  <div class="form-group">
                    <label for="artisanName">Nom de l'artisan</label>
                    <input 
                      type="text" 
                      id="artisanName" 
                      [(ngModel)]="formData.artisanName" 
                      name="artisanName"
                      placeholder="Fatou Diallo">
                  </div>
                  <div class="form-group">
                    <label for="artisanLocation">Lieu de fabrication</label>
                    <input 
                      type="text" 
                      id="artisanLocation" 
                      [(ngModel)]="formData.artisanLocation" 
                      name="artisanLocation"
                      placeholder="Lomé, Togo">
                  </div>
                  <div class="form-group full-width">
                    <label for="artisanStory">Histoire de l'artisan</label>
                    <textarea 
                      id="artisanStory" 
                      [(ngModel)]="formData.artisanStory" 
                      name="artisanStory"
                      rows="3"
                      placeholder="Partagez l'histoire de l'artisan, son savoir-faire, ses techniques..."></textarea>
                  </div>
                </div>
              </div>

              <div class="form-section">
                <h3>Options spéciales</h3>
                <div class="checkbox-group">
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="formData.handmade" name="handmade">
                    <span>✋ Fait main</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="formData.customizable" name="customizable">
                    <span>🎨 Personnalisable</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="formData.featured" name="featured">
                    <span>⭐ Produit vedette</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- ONGLET 5: SEO -->
            <div class="tab-content" *ngIf="activeTab === 'seo'">
              <div class="form-section">
                <h3>Optimisation pour les moteurs de recherche</h3>
                <div class="form-grid">
                  <div class="form-group full-width">
                    <label for="metaTitle">Titre SEO <span class="counter" [class.warning]="(formData.metaTitle || formData.name || '').length > 60" [class.error]="(formData.metaTitle || formData.name || '').length >= 70">{{ (formData.metaTitle || formData.name || '').length }}/70</span></label>
                    <input 
                      type="text" 
                      id="metaTitle" 
                      [(ngModel)]="formData.metaTitle" 
                      name="metaTitle"
                      maxlength="70"
                      (input)="onMetaTitleInput($event)"
                      [placeholder]="formData.name || 'Titre SEO'">
                    <small class="help-text">Si vide, le nom du produit sera utilisé</small>
                  </div>

                  <div class="form-group full-width">
                    <label for="metaDescription">Description SEO <span class="counter" [class.warning]="getMetaDescriptionLength() > 140" [class.error]="getMetaDescriptionLength() >= 160">{{ getMetaDescriptionLength() }}/160</span></label>
                    <textarea 
                      id="metaDescription" 
                      [(ngModel)]="formData.metaDescription" 
                      name="metaDescription"
                      maxlength="160"
                      rows="3"
                      (input)="onMetaDescriptionInput($event)"
                      [placeholder]="formData.shortDescription || (formData.description ? formData.description.substring(0, 160) : 'Description SEO')"></textarea>
                    <small class="help-text">Si vide, la description courte sera utilisée</small>
                  </div>

                  <div class="form-group full-width">
                    <label for="tags">Tags (mots-clés séparés par des virgules)</label>
                    <input 
                      type="text" 
                      id="tags" 
                      [(ngModel)]="tagsInput" 
                      name="tags"
                      (blur)="updateTags()"
                      placeholder="ankara, robe, africain, fait main, traditionnel">
                    <div class="tags-display" *ngIf="formData.tags.length > 0">
                      <span class="tag" *ngFor="let tag of formData.tags">
                        {{ tag }}
                        <i class="fas fa-times" (click)="removeTag(tag)"></i>
                      </span>
                    </div>
                  </div>

                  <div class="form-group full-width">
                    <label>URL du produit (aperçu)</label>
                    <div class="url-preview">
                      /produits/{{ generateSlug(formData.name) }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-section">
                <h3>Aperçu dans les résultats de recherche</h3>
                <div class="search-preview">
                  <div class="preview-url">votresite.com › produits › {{ generateSlug(formData.name) }}</div>
                  <div class="preview-title">{{ formData.metaTitle || formData.name || 'Titre du produit' }}</div>
                  <div class="preview-description">{{ formData.metaDescription || formData.shortDescription || (formData.description ? formData.description.substring(0, 160) : 'Description du produit') }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pied de formulaire avec boutons d'action -->
          <div class="modal-footer">
            <div class="footer-left">
              <button type="button" class="btn btn-secondary" (click)="saveDraft()">
                <i class="fas fa-save"></i>
                Enregistrer comme brouillon
              </button>
            </div>
            <div class="footer-right">
<button type="button" class="btn btn-outline" (click)="close.emit()">                Annuler
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="!isFormValid()">
                <i class="fas fa-check"></i>
                {{ isEditMode ? 'Mettre à jour' : 'Créer le produit' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .product-form-overlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background: rgba(0, 0, 0, 0.5) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 99999 !important; /* Au-dessus de tout (Material Dialog: 1000, Admin: peut-être plus élevé) */
      padding: 20px !important;
      overflow-y: auto !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    .product-form-modal {
      position: relative !important;
      z-index: 100000 !important;
      background: white !important;
      border-radius: 12px !important;
      width: 100% !important;
      max-width: 900px !important;
      max-height: 90vh !important;
      display: flex !important;
      flex-direction: column !important;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2) !important;
      margin: auto !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    .modal-header {
      padding: 20px 30px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0; /* ✅ AJOUT: Empêche le header de se compresser */
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #1a1a1a;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #666;
      cursor: pointer;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .close-btn:hover {
      background: #f5f5f5;
      color: #333;
    }

    .product-form {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden; /* ✅ AJOUT: Nécessaire pour que le scroll interne fonctionne */
    }

    .tabs {
      display: flex;
      border-bottom: 2px solid #e0e0e0;
      padding: 0 30px;
      gap: 10px;
      background: #fafafa;
      overflow-x: auto;
      flex-shrink: 0; /* ✅ AJOUT: Empêche les tabs de se compresser */
    }

    .tab {
      background: none;
      border: none;
      padding: 15px 20px;
      font-size: 0.95rem;
      color: #666;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
    }

    .tab:hover {
      color: #333;
      background: rgba(0, 0, 0, 0.03);
    }

    .tab.active {
      color: #2563eb;
      border-bottom-color: #2563eb;
      font-weight: 600;
    }

    .form-content {
      flex: 1;
      overflow-y: auto; /* ✅ AJOUT: Permet le scroll du contenu */
      padding: 30px;
    }

    .tab-content {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .form-section {
      margin-bottom: 30px;
    }

    .form-section:last-child {
      margin-bottom: 0;
    }

    .form-section h3 {
      font-size: 1.1rem;
      color: #1a1a1a;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e0e0e0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      font-size: 0.9rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .counter {
      font-size: 0.8rem;
      color: #999;
      font-weight: 400;
      transition: color 0.3s ease;
    }

    .counter.warning {
      color: #f59e0b;
      font-weight: 600;
    }

    .counter.error {
      color: #dc2626;
      font-weight: 700;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 0.95rem;
      font-family: inherit;
      transition: all 0.3s ease;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .form-group textarea {
      resize: vertical;
      min-height: 80px;
    }

    .help-text {
      font-size: 0.8rem;
      color: #666;
      margin-top: 5px;
    }

    .image-validation-info {
      margin-top: 10px;
      text-align: center;
    }

    .error-text {
      color: #dc2626;
      font-weight: 600;
    }

    /* Images */
    .image-upload-area {
      margin-bottom: 20px;
    }

    .upload-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      border: 2px dashed #ddd;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #fafafa;
    }

    .upload-label:hover:not(.disabled) {
      border-color: #2563eb;
      background: #f0f7ff;
    }

    .upload-label.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .upload-label i {
      font-size: 2rem;
      color: #2563eb;
      margin-bottom: 10px;
    }

    .upload-label span {
      font-size: 1rem;
      color: #333;
      margin-bottom: 5px;
    }

    .upload-label small {
      font-size: 0.85rem;
      color: #666;
    }

    .images-preview {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 15px;
    }

    .image-item {
      position: relative;
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid #e0e0e0;
    }

    .image-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: opacity 0.3s ease;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 10px;
    }

    .image-item:hover .image-overlay {
      opacity: 1;
    }

    .image-badge {
      background: #2563eb;
      color: white;
      padding: 5px 10px;
      border-radius: 5px;
      font-size: 0.8rem;
      align-self: flex-start;
    }

    .image-actions {
      display: flex;
      gap: 5px;
      justify-content: center;
    }

    .action-btn {
      background: white;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .action-btn:hover:not(:disabled) {
      background: #2563eb;
      color: white;
    }

    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .action-btn.delete:hover {
      background: #dc2626;
    }

    /* Couleurs */
    .color-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 15px;
    }

    .color-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 10px;
      border-radius: 8px;
      transition: background 0.3s ease;
    }

    .color-option:hover {
      background: #f5f5f5;
    }

    .color-circle {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid transparent;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .color-circle.selected {
      border-color: #2563eb;
      transform: scale(1.1);
    }

    .color-circle i {
      color: white;
      font-size: 1.2rem;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }

    .color-option span {
      font-size: 0.85rem;
      color: #333;
    }

    /* Tailles */
    .size-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 10px;
    }

    .size-option {
      padding: 15px;
      border: 2px solid #ddd;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .size-option:hover {
      border-color: #2563eb;
      background: #f0f7ff;
    }

    .size-option.selected {
      border-color: #2563eb;
      background: #2563eb;
      color: white;
    }

    /* Tags */
    .tags-display {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }

    .tag {
      background: #e0e0e0;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tag i {
      cursor: pointer;
      font-size: 0.75rem;
      opacity: 0.7;
      transition: opacity 0.3s ease;
    }

    .tag i:hover {
      opacity: 1;
    }

    /* Checkboxes */
    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      padding: 12px;
      border-radius: 8px;
      transition: background 0.3s ease;
    }

    .checkbox-label:hover {
      background: #f5f5f5;
    }

    .checkbox-label input[type="checkbox"] {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }

    .checkbox-label span {
      font-size: 0.95rem;
    }

    /* URL Preview */
    .url-preview {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 8px;
      font-family: monospace;
      color: #666;
    }

    .search-preview {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .preview-url {
      font-size: 0.8rem;
      color: #666;
      margin-bottom: 5px;
    }

    .preview-title {
      font-size: 1.2rem;
      color: #1a0dab;
      margin-bottom: 5px;
    }

    .preview-description {
      font-size: 0.9rem;
      color: #545454;
      line-height: 1.5;
    }

    /* Footer */
    .modal-footer {
      padding: 20px 30px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fafafa;
      flex-shrink: 0; /* ✅ AJOUT: Empêche le footer de se compresser */
    }

    .footer-left,
    .footer-right {
      display: flex;
      gap: 10px;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: #2563eb;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1d4ed8;
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
    }

    .btn-secondary:hover {
      background: #4b5563;
    }

    .btn-outline {
      background: white;
      color: #333;
      border: 1px solid #ddd;
    }

    .btn-outline:hover {
      background: #f5f5f5;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .product-form-modal {
        max-width: 100%;
        max-height: 100vh;
        border-radius: 0;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .tabs {
        padding: 0 15px;
      }

      .form-content {
        padding: 20px;
      }

      .modal-footer {
        flex-direction: column;
        gap: 10px;
      }

      .footer-left,
      .footer-right {
        width: 100%;
      }

      .btn {
        flex: 1;
        justify-content: center;
      }
    }
  `]
})
export class ProductFormComponent implements OnInit, OnChanges {
  @Input() isVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() productData?: any;
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  activeTab: 'basic' | 'images' | 'variants' | 'details' | 'seo' = 'basic';

  formData: ProductFormData = {
    name: '',
    description: '',
    shortDescription: '',
    price: 0,
    compareAtPrice: 0,
    sku: '',
    status: 'draft',
    category: '',
    fabricType: '',
    genderTarget: 'unisexe',
    ageGroup: 'adulte',
    season: 'toute_saison',
    occasion: 'quotidien',
    stockQuantity: 0,
    lowStockThreshold: 10,
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0
    },
    colorsAvailable: [],
    sizesAvailable: [],
    materials: [],
    careInstructions: '',
    culturalSignificance: '',
    artisanName: '',
    artisanStory: '',
    artisanLocation: '',
    handmade: false,
    customizable: false,
    featured: false,
    tags: [],
    metaTitle: '',
    metaDescription: ''
  };

  selectedImages: Array<{ file: File | null; preview: string }> = [];
  tagsInput: string = '';
  materialsInput: string = '';

  availableColors = [
    { label: 'Rouge', value: 'rouge', hex: '#DC2626' },
    { label: 'Bleu', value: 'bleu', hex: '#2563EB' },
    { label: 'Vert', value: 'vert', hex: '#059669' },
    { label: 'Jaune', value: 'jaune', hex: '#F59E0B' },
    { label: 'Orange', value: 'orange', hex: '#EA580C' },
    { label: 'Violet', value: 'violet', hex: '#9333EA' },
    { label: 'Rose', value: 'rose', hex: '#EC4899' },
    { label: 'Noir', value: 'noir', hex: '#000000' },
    { label: 'Blanc', value: 'blanc', hex: '#FFFFFF' },
    { label: 'Gris', value: 'gris', hex: '#6B7280' },
    { label: 'Marron', value: 'marron', hex: '#92400E' },
    { label: 'Beige', value: 'beige', hex: '#D4A373' }
  ];

  availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
  
  categories: CategoryOption[] = [];
  loadingCategories = false;
  flatCategories: CategoryOption[] = []; // Liste plate pour le select

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    // Charger les catégories dès l'initialisation
    this.loadCategories();
    if (this.productData) {
      this.loadProductData(this.productData);
    }
  }

  // Méthode pour recharger les catégories si nécessaire
  ngOnChanges(changes: SimpleChanges) {
    // Si le formulaire devient visible et qu'on n'a pas encore de catégories, les charger
    if (changes['isVisible'] && changes['isVisible'].currentValue === true && 
        this.flatCategories.length === 0 && !this.loadingCategories) {
      console.log('📋 Formulaire visible - Chargement des catégories...');
      this.loadCategories();
    }
    
    // Si le formulaire devient invisible, réinitialiser les données
    if (changes['isVisible'] && changes['isVisible'].currentValue === false) {
      this.resetForm();
    }
    
    // Si les données du produit changent, les charger
    if (changes['productData'] && changes['productData'].currentValue) {
      this.loadProductData(changes['productData'].currentValue);
    }
  }
  
  /**
   * Réinitialise le formulaire
   */
  resetForm() {
    this.selectedImages = [];
    this.formData = {
      name: '',
      description: '',
      shortDescription: '',
      price: 0,
      compareAtPrice: undefined,
      sku: '',
      status: 'draft',
      category: '',
      fabricType: '',
      genderTarget: 'unisexe',
      ageGroup: 'adulte',
      season: 'toute_saison',
      occasion: 'quotidien',
      stockQuantity: 0,
      lowStockThreshold: undefined,
      weight: undefined,
      dimensions: { length: 0, width: 0, height: 0 },
      colorsAvailable: [],
      sizesAvailable: [],
      materials: [],
      careInstructions: '',
      culturalSignificance: '',
      artisanName: '',
      artisanStory: '',
      artisanLocation: '',
      handmade: false,
      customizable: false,
      featured: false,
      tags: [],
      metaTitle: '',
      metaDescription: ''
    };
    this.tagsInput = '';
    this.materialsInput = '';
    this.activeTab = 'basic';
  }

  loadCategories() {
    this.loadingCategories = true;
    console.log('🔄 Chargement des catégories...');
    this.categoryService.getCategories(true, true).subscribe({
      next: (response: any) => {
        console.log('📦 Réponse API catégories:', response);
        
        // Extraire les catégories de la réponse
        // La réponse peut être : { success: true, data: [...] } ou { data: { categories: [...] } } ou { categories: [...] } ou directement [...]
        let categoriesData = [];
        
        if (response.success && response.data) {
          // Format: { success: true, data: [...] }
          if (Array.isArray(response.data)) {
            categoriesData = response.data;
          } else if (response.data.categories && Array.isArray(response.data.categories)) {
            categoriesData = response.data.categories;
          }
        } else if (response.data?.categories && Array.isArray(response.data.categories)) {
          categoriesData = response.data.categories;
        } else if (response.categories && Array.isArray(response.categories)) {
          categoriesData = response.categories;
        } else if (Array.isArray(response)) {
          categoriesData = response;
        } else if (response.data && Array.isArray(response.data)) {
          categoriesData = response.data;
        }
        
        console.log('📋 Catégories extraites:', categoriesData.length, categoriesData);
        
        if (categoriesData.length > 0) {
          this.categories = this.flattenCategories(categoriesData);
          this.flatCategories = this.categories;
          console.log('✅ Catégories chargées:', this.flatCategories.length);
        } else {
          console.warn('⚠️ Aucune catégorie trouvée dans la réponse');
          this.categories = [];
          this.flatCategories = [];
        }
        
        this.loadingCategories = false;
        
        // Si on charge un produit existant, mapper la catégorie
        if (this.productData && this.formData.category) {
          this.mapCategoryToForm();
        }
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des catégories:', error);
        console.error('Détails:', error.error || error.message);
        this.loadingCategories = false;
        // En cas d'erreur, utiliser les catégories par défaut
        this.categories = [];
        this.flatCategories = [];
      }
    });
  }

  // Mapper la catégorie du produit existant vers le formulaire
  mapCategoryToForm() {
    const categoryValue = this.formData.category;
    if (!categoryValue) return;
    
    // Chercher la catégorie par ID, slug ou nom
    const foundCategory = this.flatCategories.find(cat => 
      cat.id === categoryValue || 
      cat.slug === categoryValue || 
      cat.name === categoryValue
    );
    
    if (foundCategory) {
      // Utiliser l'ID en priorité, sinon le slug, sinon le nom
      this.formData.category = foundCategory.id || foundCategory.slug || foundCategory.name;
    }
  }

  // Aplatir l'arbre de catégories en liste plate pour le select
  flattenCategories(categories: any[], parentName: string = ''): CategoryOption[] {
    let flat: CategoryOption[] = [];
    categories.forEach(cat => {
      const displayName = parentName ? `${parentName} > ${cat.name}` : cat.name;
      flat.push({
        id: cat.id,
        name: displayName,
        slug: cat.slug || '',
        subcategories: cat.children || cat.subcategories
      });
      // Gérer à la fois 'children' (format API) et 'subcategories' (format alternatif)
      const subcats = cat.children || cat.subcategories || [];
      if (subcats.length > 0) {
        flat = flat.concat(this.flattenCategories(subcats, displayName));
      }
    });
    return flat;
  }

  loadProductData(data: any) {
    // Mapper la catégorie - peut être un ID, slug, nom ou objet
    let categoryValue = '';
    if (data.category) {
      if (typeof data.category === 'object' && data.category.id) {
        categoryValue = data.category.id;
      } else if (typeof data.category === 'object' && data.category.slug) {
        categoryValue = data.category.slug;
      } else if (data.category_id) {
        categoryValue = data.category_id;
      } else {
        categoryValue = data.category;
      }
    }
    
    this.formData = {
      name: data.name || '',
      description: data.description || '',
      shortDescription: data.shortDescription || data.short_description,
      price: data.price || 0,
      compareAtPrice: data.compareAtPrice || data.compare_at_price,
      sku: data.sku || '',
      status: data.status || 'draft',
      category: categoryValue,
      fabricType: data.fabricType || data.fabric_type,
      genderTarget: data.genderTarget || data.gender_target,
      ageGroup: data.ageGroup || data.age_group,
      season: data.season,
      occasion: data.occasion,
      stockQuantity: data.stockQuantity || data.stock_quantity || 0,
      lowStockThreshold: data.lowStockThreshold || data.low_stock_threshold,
      weight: data.weight,
      dimensions: data.dimensions || { length: 0, width: 0, height: 0 },
      colorsAvailable: data.colorsAvailable || data.colors_available || [],
      sizesAvailable: data.sizesAvailable || data.sizes_available || [],
      materials: data.materials || [],
      careInstructions: data.careInstructions || data.care_instructions,
      culturalSignificance: data.culturalSignificance || data.cultural_significance,
      artisanName: data.artisanName || data.artisan_name,
      artisanStory: data.artisanStory || data.artisan_story,
      artisanLocation: data.artisanLocation || data.artisan_location,
      handmade: data.handmade || false,
      customizable: data.customizable || false,
      featured: data.featured || false,
      tags: data.tags || [],
      metaTitle: data.metaTitle || data.meta_title,
      metaDescription: data.metaDescription || data.meta_description
    };
    
    this.tagsInput = this.formData.tags.join(', ');
    this.materialsInput = this.formData.materials.join(', ');
    
    // Réinitialiser les images avant de charger
    this.selectedImages = [];
    
    // Normaliser et charger les images
    const normalizedImages = this.normalizeProductImages(data);
    normalizedImages.forEach((imageUrl: string) => {
      if (imageUrl && imageUrl.trim() !== '') {
        this.selectedImages.push({
          file: null,
          preview: imageUrl
        });
      }
    });
    
    // Mapper la catégorie après le chargement si les catégories sont déjà chargées
    if (this.flatCategories.length > 0) {
      this.mapCategoryToForm();
    }
  }


  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    const remainingSlots = 10 - this.selectedImages.length;
    const filesToAdd = files.slice(0, remainingSlots);

    // Types d'images autorisés
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5 Mo
    const errors: string[] = [];

    filesToAdd.forEach((file, index) => {
      // Validation du type
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        errors.push(`${file.name}: Type de fichier non autorisé. Utilisez JPG, PNG, WEBP ou GIF.`);
        return;
      }

      // Validation de la taille
      if (file.size > maxSize) {
        errors.push(`${file.name}: Fichier trop volumineux (max 5 Mo). Taille actuelle: ${(file.size / 1024 / 1024).toFixed(2)} Mo`);
        return;
      }

      // Validation de la taille minimale (éviter les fichiers vides ou corrompus)
      if (file.size < 100) {
        errors.push(`${file.name}: Fichier trop petit ou corrompu.`);
        return;
      }

      // Vérifier si on n'a pas déjà atteint la limite
      if (this.selectedImages.length >= 10) {
        errors.push(`Limite de 10 images atteinte.`);
        return;
      }

      // Lire et ajouter l'image
        const reader = new FileReader();
        reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          this.selectedImages.push({
            file: file,
            preview: result
          });
        }
      };
      reader.onerror = () => {
        errors.push(`${file.name}: Erreur lors de la lecture du fichier.`);
        };
        reader.readAsDataURL(file);
    });

    // Afficher les erreurs s'il y en a
    if (errors.length > 0) {
      alert('Erreurs de validation:\n' + errors.join('\n'));
    }

    // Afficher un message si certains fichiers ont été ignorés
    if (files.length > filesToAdd.length) {
      const ignored = files.length - filesToAdd.length;
      alert(`${ignored} fichier(s) ignoré(s) car la limite de 10 images est atteinte.`);
    }

    input.value = '';
  }

  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
  }

  moveImageUp(index: number) {
    if (index > 0) {
      const temp = this.selectedImages[index];
      this.selectedImages[index] = this.selectedImages[index - 1];
      this.selectedImages[index - 1] = temp;
    }
  }

  moveImageDown(index: number) {
    if (index < this.selectedImages.length - 1) {
      const temp = this.selectedImages[index];
      this.selectedImages[index] = this.selectedImages[index + 1];
      this.selectedImages[index + 1] = temp;
    }
  }

  isColorSelected(color: string): boolean {
    return this.formData.colorsAvailable.includes(color);
  }

  toggleColor(color: string) {
    const index = this.formData.colorsAvailable.indexOf(color);
    if (index > -1) {
      this.formData.colorsAvailable.splice(index, 1);
    } else {
      this.formData.colorsAvailable.push(color);
    }
  }

  isSizeSelected(size: string): boolean {
    return this.formData.sizesAvailable.includes(size);
  }

  toggleSize(size: string) {
    const index = this.formData.sizesAvailable.indexOf(size);
    if (index > -1) {
      this.formData.sizesAvailable.splice(index, 1);
    } else {
      this.formData.sizesAvailable.push(size);
    }
  }

  updateMaterials() {
    if (this.materialsInput.trim()) {
      this.formData.materials = this.materialsInput
        .split(',')
        .map(material => material.trim())
        .filter(material => material.length > 0);
    }
  }

  removeMaterial(material: string) {
    this.formData.materials = this.formData.materials.filter(m => m !== material);
    this.materialsInput = this.formData.materials.join(', ');
  }

  updateTags() {
    if (this.tagsInput.trim()) {
      this.formData.tags = this.tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    }
  }

  removeTag(tag: string) {
    this.formData.tags = this.formData.tags.filter(t => t !== tag);
    this.tagsInput = this.formData.tags.join(', ');
  }

  updateDimension(field: 'length' | 'width' | 'height', value: number) {
    if (!this.formData.dimensions) {
      this.formData.dimensions = { length: 0, width: 0, height: 0 };
    }
    this.formData.dimensions[field] = value || 0;
  }

  generateSkuIfEmpty() {
    if (!this.formData.sku && this.formData.name) {
      const prefix = this.formData.name.substring(0, 3).toUpperCase();
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      this.formData.sku = `${prefix}-${random}`;
    }
  }

  generateSlug(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Méthodes pour gérer l'input en temps réel et limiter la saisie
  onNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value.length > 200) {
      this.formData.name = value.substring(0, 200);
      input.value = this.formData.name;
    }
  }

  onShortDescriptionInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value.length > 200) {
      this.formData.shortDescription = value.substring(0, 200);
      input.value = this.formData.shortDescription;
    }
  }

  onDescriptionInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    // Pas de limite pour la description complète, juste mettre à jour le compteur
  }

  onMetaTitleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value.length > 70) {
      this.formData.metaTitle = value.substring(0, 70);
      input.value = this.formData.metaTitle;
    }
  }

  onMetaDescriptionInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const value = textarea.value;
    if (value.length > 160) {
      this.formData.metaDescription = value.substring(0, 160);
      textarea.value = this.formData.metaDescription;
    }
  }

  getMetaDescriptionLength(): number {
    return (this.formData.metaDescription || 
            this.formData.shortDescription || 
            (this.formData.description ? this.formData.description.substring(0, 160) : '')).length;
  }

  isFormValid(): boolean {
    // Validation des champs obligatoires
    const hasName = this.formData.name && this.formData.name.trim().length > 0;
    const hasDescription = this.formData.description && this.formData.description.trim().length > 0;
    const hasValidPrice = this.formData.price > 0;
    const hasSku = this.formData.sku && this.formData.sku.trim().length > 0;
    const hasCategory = this.formData.category && this.formData.category.trim().length > 0;
    const hasValidStock = this.formData.stockQuantity >= 0;
    
    // Validation des images : au moins une image requise
    const hasAtLeastOneImage = this.selectedImages.length > 0;
    
    // Validation des fichiers images
    const allImagesValid = this.selectedImages.every(img => {
      if (img.file) {
        // Vérifier le type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(img.file.type.toLowerCase())) {
          return false;
        }
        // Vérifier la taille (max 5 Mo)
        if (img.file.size > 5 * 1024 * 1024) {
          return false;
        }
        // Vérifier la taille minimale
        if (img.file.size < 100) {
          return false;
        }
      }
      return true;
    });
    
    return !!(
      hasName &&
      hasDescription &&
      hasValidPrice &&
      hasSku &&
      hasCategory &&
      hasValidStock &&
      hasAtLeastOneImage &&
      allImagesValid
    );
  }

  saveDraft() {
    this.formData.status = 'draft';
    this.onSubmit();
  }

  onSubmit() {
    if (!this.isFormValid()) {
      // Vérifier spécifiquement les images
      if (this.selectedImages.length === 0) {
        alert('⚠️ Veuillez ajouter au moins une image au produit.');
        this.activeTab = 'images';
        return;
      }
      
      // Vérifier la validité des fichiers
      const invalidImages = this.selectedImages.filter(img => {
        if (img.file) {
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
          return !allowedTypes.includes(img.file!.type.toLowerCase()) || 
                 img.file!.size > 5 * 1024 * 1024 || 
                 img.file!.size < 100;
        }
        return false;
      });
      
      if (invalidImages.length > 0) {
        alert('⚠️ Certaines images ne sont pas valides. Veuillez vérifier les types de fichiers (JPG, PNG, WEBP, GIF) et leur taille (max 5 Mo).');
        this.activeTab = 'images';
        return;
      }
      
      console.warn('⚠️ Formulaire invalide:', {
        name: this.formData.name,
        description: this.formData.description,
        price: this.formData.price,
        sku: this.formData.sku,
        category: this.formData.category,
        stockQuantity: this.formData.stockQuantity,
        imagesCount: this.selectedImages.length
      });
      return;
    }

    try {
      const submitData: any = { ...this.formData };
      
      // Nettoyer les chaînes de caractères
      submitData.name = (submitData.name || '').trim();
      submitData.description = (submitData.description || '').trim();
      submitData.shortDescription = (submitData.shortDescription || '').trim();
      submitData.sku = (submitData.sku || '').trim();
      
      // Toujours inclure le statut pour éviter qu'il soit réinitialisé
      if (!submitData.status) {
        submitData.status = this.formData.status || 'draft';
      }
      
      // Convertir les valeurs numériques
      submitData.price = parseFloat(submitData.price.toString()) || 0;
      submitData.compareAtPrice = submitData.compareAtPrice ? parseFloat(submitData.compareAtPrice.toString()) : undefined;
      submitData.stockQuantity = parseInt(submitData.stockQuantity.toString()) || 0;
      submitData.lowStockThreshold = submitData.lowStockThreshold ? parseInt(submitData.lowStockThreshold.toString()) : undefined;
      submitData.weight = submitData.weight ? parseFloat(submitData.weight.toString()) : undefined;
      
      // Gérer les dimensions
      if (submitData.dimensions) {
        submitData.dimensions.length = submitData.dimensions.length ? parseFloat(submitData.dimensions.length.toString()) : 0;
        submitData.dimensions.width = submitData.dimensions.width ? parseFloat(submitData.dimensions.width.toString()) : 0;
        submitData.dimensions.height = submitData.dimensions.height ? parseFloat(submitData.dimensions.height.toString()) : 0;
      }
      
      // Gérer les images : séparer les fichiers des images existantes
      const newImageFiles = this.selectedImages
        .filter(img => img.file !== null)
        .map(img => img.file as File);
      
      const existingImageUrls = this.selectedImages
        .filter(img => img.file === null && img.preview && !img.preview.startsWith('data:'))
        .map(img => img.preview);
      
      // Toujours envoyer les images (même si vides) pour que le backend sache quoi faire
      if (newImageFiles.length > 0) {
        submitData.imageFiles = newImageFiles;
      }
      
      // Toujours envoyer les images existantes (même si vides) pour préserver les images actuelles
      submitData.existingImages = existingImageUrls;
      
      // S'assurer que les tableaux ne sont pas undefined
      submitData.colorsAvailable = submitData.colorsAvailable || [];
      submitData.sizesAvailable = submitData.sizesAvailable || [];
      submitData.materials = submitData.materials || [];
      submitData.tags = submitData.tags || [];
      
      console.log('✅ Données du formulaire validées:', submitData);
      this.save.emit(submitData);
    } catch (error) {
      console.error('❌ Erreur lors de la préparation des données:', error);
      alert('Une erreur est survenue lors de la préparation des données. Veuillez vérifier les champs du formulaire.');
    }
  }

  // ✅ Méthode pour gérer le clic sur l'overlay (fond noir)
  onOverlayClick(event: Event) {
    // Ferme seulement si on clique directement sur l'overlay
    if (event.target === event.currentTarget) {
      this.closeForm();
    }
  }

  // ✅ Méthode pour gérer le clic sur le bouton X
  onCloseClick() {
    this.closeForm();
  }

  closeForm() {
    this.close.emit();
  }

  /**
   * Normalise les images d'un produit pour le formulaire
   */
  private normalizeProductImages(data: any): string[] {
    // Essayer différents champs possibles
    let images = data.images;
    
    // Si pas d'images, essayer d'autres champs
    if (!images || (Array.isArray(images) && images.length === 0)) {
      if (data.primary_image) {
        images = [data.primary_image];
      } else if (data.image_url) {
        images = [data.image_url];
      } else if (data.image) {
        images = Array.isArray(data.image) ? data.image : [data.image];
      }
    }
    
    if (!images) return [];
    
    // Si c'est un tableau
    if (Array.isArray(images)) {
      return images.map((img: any) => {
        if (typeof img === 'string') return img;
        if (img && typeof img === 'object') {
          return img.url || img.path || img.image_url || img.src || img.primary_image || '';
        }
        return '';
      }).filter((url: string) => url && url.trim() !== '');
    }
    
    // Si c'est une chaîne JSON
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) {
          return parsed.map((img: any) => {
            if (typeof img === 'string') return img;
            if (img && typeof img === 'object') {
              return img.url || img.path || img.image_url || img.src || '';
            }
            return '';
          }).filter((url: string) => url && url.trim() !== '');
        }
        return [images];
      } catch {
        return [images];
      }
    }
    
    // Si c'est un objet unique
    if (typeof images === 'object') {
      const url = images.url || images.path || images.image_url || images.src || images.primary_image || '';
      return url ? [url] : [];
    }
    
    return [];
  }
}