import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { StoreService } from '../../../../core/services/store.service';
import { AuthService } from '../../../../core/services/auth.service';
import { SafeImagePipe } from '../../../../core/pipes/safe-image.pipe';

interface StoreInfo {
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  phone: string;
  email: string;
  website?: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
  businessHours: {
    monday: { open: string; close: string; enabled: boolean };
    tuesday: { open: string; close: string; enabled: boolean };
    wednesday: { open: string; close: string; enabled: boolean };
    thursday: { open: string; close: string; enabled: boolean };
    friday: { open: string; close: string; enabled: boolean };
    saturday: { open: string; close: string; enabled: boolean };
    sunday: { open: string; close: string; enabled: boolean };
  };
  policies: {
    returnPolicy: string;
    shippingPolicy: string;
    privacyPolicy: string;
  };
}

@Component({
  selector: 'app-vendor-store',
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
    MatSnackBarModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatSelectModule,
    SafeImagePipe
  ],
  template: `
    <div class="vendor-store">
      <!-- En-tête -->
      <div class="page-header">
        <div class="header-content">
          <h1>
            <i class="fas fa-store"></i>
            Ma Boutique
          </h1>
          <p>Gérez les informations et l'apparence de votre boutique</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="previewStore()">
            <i class="fas fa-eye"></i>
            Prévisualiser
          </button>
        </div>
      </div>

      <!-- Statistiques rapides -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-eye"></i>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ storeStats.views }}</span>
            <span class="stat-label">Vues cette semaine</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-heart"></i>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ storeStats.favorites }}</span>
            <span class="stat-label">Favoris</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-star"></i>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ storeStats.rating }}</span>
            <span class="stat-label">Note moyenne</span>
          </div>
        </div>
      </div>

      <!-- Onglets -->
      <mat-tab-group class="store-tabs">
        <!-- Informations générales -->
        <mat-tab label="Informations générales">
          <div class="tab-content">
            <form [formGroup]="storeInfoForm" (ngSubmit)="saveStoreInfo()">
              <mat-card class="form-card">
                <mat-card-header>
                  <mat-card-title>
                    <i class="fas fa-info-circle"></i>
                    Informations de base
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Nom de la boutique</mat-label>
                    <input matInput formControlName="name" placeholder="AfrikMode Boutique">
                    <mat-icon matPrefix>store</mat-icon>
                    @if (storeInfoForm.get('name')?.hasError('required')) {
                      <mat-error>Le nom est obligatoire</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Description</mat-label>
                    <textarea matInput formControlName="description" rows="6" 
                      placeholder="Décrivez votre boutique et ce qui la rend unique..."></textarea>
                    <mat-icon matPrefix>description</mat-icon>
                  </mat-form-field>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Email de contact</mat-label>
                      <input matInput formControlName="email" type="email" placeholder="contact@boutique.com">
                      <mat-icon matPrefix>email</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Téléphone</mat-label>
                      <input matInput formControlName="phone" placeholder="+33 6 12 34 56 78">
                      <mat-icon matPrefix>phone</mat-icon>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Site web</mat-label>
                    <input matInput formControlName="website" placeholder="https://www.votresite.com">
                    <mat-icon matPrefix>language</mat-icon>
                  </mat-form-field>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-raised-button color="primary" type="submit" [disabled]="!storeInfoForm.valid || saving">
                    <i class="fas fa-save"></i>
                    Enregistrer
                  </button>
                </mat-card-actions>
              </mat-card>
            </form>
          </div>
        </mat-tab>

        <!-- Apparence -->
        <mat-tab label="Apparence">
          <div class="tab-content">
            <mat-card class="form-card">
              <mat-card-header>
                <mat-card-title>
                  <i class="fas fa-image"></i>
                  Images de la boutique
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="image-upload-section">
                  <div class="upload-box">
                    <div class="upload-preview">
                      @if (storeInfo.logo) {
                        <img [src]="storeInfo.logo | safeImage:'store'" alt="Logo">
                      } @else {
                        <i class="fas fa-image"></i>
                      }
                    </div>
                    <div class="upload-info">
                      <h4>Logo de la boutique</h4>
                      <p>Format recommandé : 200x200px (PNG, JPG)</p>
                      <button mat-raised-button color="primary">
                        <i class="fas fa-upload"></i>
                        Télécharger le logo
                      </button>
                    </div>
                  </div>

                  <div class="upload-box banner">
                    <div class="upload-preview banner">
                      @if (storeInfo.banner) {
                        <img [src]="storeInfo.banner | safeImage:'store'" alt="Bannière">
                      } @else {
                        <i class="fas fa-image"></i>
                      }
                    </div>
                    <div class="upload-info">
                      <h4>Bannière de la boutique</h4>
                      <p>Format recommandé : 1200x400px (PNG, JPG)</p>
                      <button mat-raised-button color="primary">
                        <i class="fas fa-upload"></i>
                        Télécharger la bannière
                      </button>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Réseaux sociaux -->
        <mat-tab label="Réseaux sociaux">
          <div class="tab-content">
            <form [formGroup]="socialMediaForm" (ngSubmit)="saveSocialMedia()">
              <mat-card class="form-card">
                <mat-card-header>
                  <mat-card-title>
                    <i class="fas fa-share-alt"></i>
                    Liens vers vos réseaux sociaux
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Facebook</mat-label>
                    <input matInput formControlName="facebook" placeholder="https://facebook.com/votre-page">
                    <mat-icon matPrefix class="social-icon facebook">facebook</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Instagram</mat-label>
                    <input matInput formControlName="instagram" placeholder="https://instagram.com/votre-compte">
                    <i class="fab fa-instagram social-icon instagram" matPrefix></i>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Twitter</mat-label>
                    <input matInput formControlName="twitter" placeholder="https://twitter.com/votre-compte">
                    <i class="fab fa-twitter social-icon twitter" matPrefix></i>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>TikTok</mat-label>
                    <input matInput formControlName="tiktok" placeholder="https://tiktok.com/@votre-compte">
                    <i class="fab fa-tiktok social-icon tiktok" matPrefix></i>
                  </mat-form-field>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-raised-button color="primary" type="submit" [disabled]="saving">
                    <i class="fas fa-save"></i>
                    Enregistrer
                  </button>
                </mat-card-actions>
              </mat-card>
            </form>
          </div>
        </mat-tab>

        <!-- Horaires -->
        <mat-tab label="Horaires">
          <div class="tab-content">
            <mat-card class="form-card">
              <mat-card-header>
                <mat-card-title>
                  <i class="fas fa-clock"></i>
                  Horaires d'ouverture
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                @for (day of weekDays; track day.key) {
                  <div class="business-hours-row">
                    <mat-slide-toggle 
                      [(ngModel)]="storeInfo.businessHours[day.key].enabled"
                      [ngModelOptions]="{standalone: true}">
                      {{ day.label }}
                    </mat-slide-toggle>
                    @if (storeInfo.businessHours[day.key].enabled) {
                      <div class="time-inputs">
                        <mat-form-field appearance="outline">
                          <mat-label>Ouverture</mat-label>
                          <input matInput type="time" 
                            [(ngModel)]="storeInfo.businessHours[day.key].open"
                            [ngModelOptions]="{standalone: true}">
                        </mat-form-field>
                        <span class="time-separator">-</span>
                        <mat-form-field appearance="outline">
                          <mat-label>Fermeture</mat-label>
                          <input matInput type="time" 
                            [(ngModel)]="storeInfo.businessHours[day.key].close"
                            [ngModelOptions]="{standalone: true}">
                        </mat-form-field>
                      </div>
                    }
                  </div>
                }
              </mat-card-content>
              <mat-card-actions>
                <button mat-raised-button color="primary" (click)="saveBusinessHours()" [disabled]="saving">
                  <i class="fas fa-save"></i>
                  Enregistrer les horaires
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Politiques -->
        <mat-tab label="Politiques">
          <div class="tab-content">
            <form [formGroup]="policiesForm" (ngSubmit)="savePolicies()">
              <mat-card class="form-card">
                <mat-card-header>
                  <mat-card-title>
                    <i class="fas fa-file-contract"></i>
                    Politiques de la boutique
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Politique de retour</mat-label>
                    <textarea matInput formControlName="returnPolicy" rows="6" 
                      placeholder="Décrivez votre politique de retour..."></textarea>
                    <mat-icon matPrefix>assignment_return</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Politique de livraison</mat-label>
                    <textarea matInput formControlName="shippingPolicy" rows="6" 
                      placeholder="Décrivez votre politique de livraison..."></textarea>
                    <mat-icon matPrefix>local_shipping</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Politique de confidentialité</mat-label>
                    <textarea matInput formControlName="privacyPolicy" rows="6" 
                      placeholder="Décrivez votre politique de confidentialité..."></textarea>
                    <mat-icon matPrefix>privacy_tip</mat-icon>
                  </mat-form-field>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-raised-button color="primary" type="submit" [disabled]="saving">
                    <i class="fas fa-save"></i>
                    Enregistrer les politiques
                  </button>
                </mat-card-actions>
              </mat-card>
            </form>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .vendor-store {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header-content h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #2C3E50;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-content p {
      color: #6B7280;
      margin: 0;
      font-size: 1.1rem;
    }

    .header-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background: linear-gradient(135deg, #8B2E2E 0%, #D9744F 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #2C3E50;
      line-height: 1;
    }

    .stat-label {
      color: #6B7280;
      font-size: 0.9rem;
      margin-top: 4px;
    }

    .store-tabs {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .tab-content {
      padding: 24px;
    }

    .form-card {
      margin-bottom: 24px;
    }

    .form-card mat-card-header {
      margin-bottom: 24px;
    }

    .form-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #2C3E50;
      font-size: 1.3rem;
    }

    .form-card mat-card-title i {
      color: #8B2E2E;
    }

    .form-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
      min-width: 250px;
    }

    mat-form-field {
      margin-bottom: 16px;
    }

    mat-card-actions {
      display: flex;
      gap: 12px;
      padding: 16px;
      border-top: 1px solid #E5E7EB;
    }

    mat-card-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .image-upload-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .upload-box {
      display: flex;
      gap: 24px;
      padding: 24px;
      border: 2px dashed #D1D5DB;
      border-radius: 12px;
      align-items: center;
    }

    .upload-preview {
      width: 150px;
      height: 150px;
      border-radius: 12px;
      background: #F3F4F6;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }

    .upload-preview.banner {
      width: 300px;
      height: 100px;
    }

    .upload-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .upload-preview i {
      font-size: 3rem;
      color: #9CA3AF;
    }

    .upload-info h4 {
      margin: 0 0 8px 0;
      color: #2C3E50;
    }

    .upload-info p {
      margin: 0 0 16px 0;
      color: #6B7280;
      font-size: 0.9rem;
    }

    .social-icon {
      font-size: 1.5rem;
    }

    .social-icon.facebook {
      color: #1877F2;
    }

    .social-icon.instagram {
      color: #E4405F;
    }

    .social-icon.twitter {
      color: #1DA1F2;
    }

    .social-icon.tiktok {
      color: #000000;
    }

    .business-hours-row {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 16px;
      border-bottom: 1px solid #E5E7EB;
    }

    .business-hours-row mat-slide-toggle {
      width: 150px;
    }

    .time-inputs {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .time-inputs mat-form-field {
      width: 150px;
      margin-bottom: 0;
    }

    .time-separator {
      color: #6B7280;
      font-size: 1.2rem;
    }

    @media (max-width: 768px) {
      .vendor-store {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        align-items: stretch;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .upload-box {
        flex-direction: column;
        text-align: center;
      }

      .business-hours-row {
        flex-direction: column;
        align-items: stretch;
      }

      .time-inputs {
        flex-direction: column;
      }

      .time-inputs mat-form-field {
        width: 100%;
      }
    }
  `]
})
export class VendorStoreComponent implements OnInit {
  storeInfo: StoreInfo = {
    name: 'Ma Boutique AfrikMode',
    description: 'Découvrez notre collection unique de mode africaine',
    phone: '+33 6 12 34 56 78',
    email: 'contact@boutique.com',
    website: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      tiktok: ''
    },
    businessHours: {
      monday: { open: '09:00', close: '18:00', enabled: true },
      tuesday: { open: '09:00', close: '18:00', enabled: true },
      wednesday: { open: '09:00', close: '18:00', enabled: true },
      thursday: { open: '09:00', close: '18:00', enabled: true },
      friday: { open: '09:00', close: '18:00', enabled: true },
      saturday: { open: '10:00', close: '17:00', enabled: true },
      sunday: { open: '', close: '', enabled: false }
    },
    policies: {
      returnPolicy: 'Retours acceptés sous 30 jours',
      shippingPolicy: 'Livraison gratuite à partir de 50€',
      privacyPolicy: 'Vos données sont protégées'
    }
  };

  weekDays = [
    { key: 'monday' as keyof typeof this.storeInfo.businessHours, label: 'Lundi' },
    { key: 'tuesday' as keyof typeof this.storeInfo.businessHours, label: 'Mardi' },
    { key: 'wednesday' as keyof typeof this.storeInfo.businessHours, label: 'Mercredi' },
    { key: 'thursday' as keyof typeof this.storeInfo.businessHours, label: 'Jeudi' },
    { key: 'friday' as keyof typeof this.storeInfo.businessHours, label: 'Vendredi' },
    { key: 'saturday' as keyof typeof this.storeInfo.businessHours, label: 'Samedi' },
    { key: 'sunday' as keyof typeof this.storeInfo.businessHours, label: 'Dimanche' }
  ];

  storeInfoForm: FormGroup;
  socialMediaForm: FormGroup;
  policiesForm: FormGroup;
  saving = false;
  loading = false;
  
  storeStats = {
    views: 0,
    favorites: 0,
    rating: 0
  };

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private storeService: StoreService,
    private authService: AuthService
  ) {
    this.storeInfoForm = this.fb.group({
      name: [this.storeInfo.name, [Validators.required]],
      description: [this.storeInfo.description],
      phone: [this.storeInfo.phone],
      email: [this.storeInfo.email, [Validators.email]],
      website: [this.storeInfo.website]
    });

    this.socialMediaForm = this.fb.group({
      facebook: [this.storeInfo.socialMedia.facebook],
      instagram: [this.storeInfo.socialMedia.instagram],
      twitter: [this.storeInfo.socialMedia.twitter],
      tiktok: [this.storeInfo.socialMedia.tiktok]
    });

    this.policiesForm = this.fb.group({
      returnPolicy: [this.storeInfo.policies.returnPolicy],
      shippingPolicy: [this.storeInfo.policies.shippingPolicy],
      privacyPolicy: [this.storeInfo.policies.privacyPolicy]
    });
  }

  ngOnInit() {
    this.loadStoreInfo();
  }

  loadStoreInfo() {
    this.loading = true;
    
    // Charger les informations de la boutique depuis l'API
    this.storeService.getMyStore().subscribe({
      next: (store: any) => {
        if (store) {
          console.log('✅ Boutique chargée:', store);
          
          // Mettre à jour storeInfo avec les vraies données
          this.storeInfo.name = store.name || this.storeInfo.name;
          this.storeInfo.description = store.description || this.storeInfo.description;
          this.storeInfo.phone = store.phone || this.storeInfo.phone;
          this.storeInfo.email = store.email || this.storeInfo.email;
          this.storeInfo.website = store.website || this.storeInfo.website;
          
          // Charger les statistiques réelles
          this.storeStats.views = store.views_count || 0;
          this.storeStats.favorites = store.favorites_count || 0;
          this.storeStats.rating = store.average_rating || 0;
          
          // Mettre à jour le formulaire
          this.storeInfoForm.patchValue({
            name: this.storeInfo.name,
            description: this.storeInfo.description,
            phone: this.storeInfo.phone,
            email: this.storeInfo.email,
            website: this.storeInfo.website
          });
          
          // Charger les infos utilisateur pour email/phone si manquants
          this.authService.currentUser$.subscribe(user => {
            if (user) {
              if (!this.storeInfo.phone && user.phone) {
                this.storeInfo.phone = user.phone;
                this.storeInfoForm.patchValue({ phone: user.phone });
              }
              if (!this.storeInfo.email && user.email) {
                this.storeInfo.email = user.email;
                this.storeInfoForm.patchValue({ email: user.email });
              }
            }
          });
        } else {
          console.log('ℹ️ Aucune boutique trouvée - utilisation des valeurs par défaut');
          
          // Statistiques à 0 pour une nouvelle boutique
          this.storeStats.views = 0;
          this.storeStats.favorites = 0;
          this.storeStats.rating = 0;
          
          // Charger au moins l'email/phone de l'utilisateur
          this.authService.currentUser$.subscribe(user => {
            if (user) {
              if (user.phone) {
                this.storeInfo.phone = user.phone;
                this.storeInfoForm.patchValue({ phone: user.phone });
              }
              if (user.email) {
                this.storeInfo.email = user.email;
                this.storeInfoForm.patchValue({ email: user.email });
              }
            }
          });
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('❌ Erreur chargement boutique:', error);
        // Statistiques à 0 en cas d'erreur
        this.storeStats.views = 0;
        this.storeStats.favorites = 0;
        this.storeStats.rating = 0;
        this.loading = false;
      }
    });
  }

  saveStoreInfo() {
    if (this.storeInfoForm.valid) {
      this.saving = true;
      console.log('Sauvegarde des informations:', this.storeInfoForm.value);
      
      setTimeout(() => {
        this.saving = false;
        this.snackBar.open('Informations enregistrées avec succès', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }, 1000);
    }
  }

  saveSocialMedia() {
    this.saving = true;
    console.log('Sauvegarde des réseaux sociaux:', this.socialMediaForm.value);
    
    setTimeout(() => {
      this.saving = false;
      this.snackBar.open('Réseaux sociaux enregistrés avec succès', 'Fermer', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }, 1000);
  }

  saveBusinessHours() {
    this.saving = true;
    console.log('Sauvegarde des horaires:', this.storeInfo.businessHours);
    
    setTimeout(() => {
      this.saving = false;
      this.snackBar.open('Horaires enregistrés avec succès', 'Fermer', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }, 1000);
  }

  savePolicies() {
    this.saving = true;
    console.log('Sauvegarde des politiques:', this.policiesForm.value);
    
    setTimeout(() => {
      this.saving = false;
      this.snackBar.open('Politiques enregistrées avec succès', 'Fermer', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }, 1000);
  }

  previewStore() {
    console.log('Prévisualisation de la boutique');
    this.snackBar.open('Fonctionnalité de prévisualisation bientôt disponible', 'Fermer', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
