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
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { VendorService } from '../../core/services/vendor.service';
import { AuthService } from '../../../../core/services/auth.service';
import { StoreService } from '../../../../core/services/store.service';
import { SafeImagePipe } from '../../../../core/pipes/safe-image.pipe';

interface VendorProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  bio?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  companyInfo: {
    name: string;
    taxId: string;
    registrationNumber: string;
  };
}

@Component({
  selector: 'app-vendor-profile',
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
    MatDividerModule,
    MatChipsModule,
    SafeImagePipe
  ],
  template: `
    <div class="vendor-profile">
      <!-- En-tête -->
      <div class="profile-header">
        <div class="header-content">
          <div class="avatar-section">
            <div class="avatar">
              @if (profile.avatar) {
                <img [src]="profile.avatar | safeImage:'avatar'" alt="Avatar">
              } @else {
                <i class="fas fa-user"></i>
              }
            </div>
            <button class="btn-change-avatar" mat-raised-button color="primary">
              <i class="fas fa-camera"></i>
              Changer la photo
            </button>
          </div>
          <div class="profile-info">
            <h1>{{ profile.firstName }} {{ profile.lastName }}</h1>
            <p class="email">{{ profile.email }}</p>
            <mat-chip-set>
              <mat-chip class="status-chip verified">
                <i class="fas fa-check-circle"></i>
                Compte vérifié
              </mat-chip>
              <mat-chip class="status-chip active">
                <i class="fas fa-store"></i>
                Boutique active
              </mat-chip>
            </mat-chip-set>
          </div>
        </div>
      </div>

      <!-- Onglets -->
      <mat-tab-group class="profile-tabs" [(selectedIndex)]="selectedTabIndex">
        <!-- Informations personnelles -->
        <mat-tab label="Informations personnelles">
          <div class="tab-content">
            <form [formGroup]="personalInfoForm" (ngSubmit)="savePersonalInfo()">
              <mat-card class="form-card">
                <mat-card-header>
                  <mat-card-title>
                    <i class="fas fa-user"></i>
                    Informations de base
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Prénom</mat-label>
                      <input matInput formControlName="firstName" placeholder="Votre prénom">
                      <mat-icon matPrefix>person</mat-icon>
                      @if (personalInfoForm.get('firstName')?.hasError('required')) {
                        <mat-error>Le prénom est obligatoire</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Nom</mat-label>
                      <input matInput formControlName="lastName" placeholder="Votre nom">
                      <mat-icon matPrefix>person</mat-icon>
                      @if (personalInfoForm.get('lastName')?.hasError('required')) {
                        <mat-error>Le nom est obligatoire</mat-error>
                      }
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Email</mat-label>
                    <input matInput formControlName="email" type="email" placeholder="votre@email.com">
                    <mat-icon matPrefix>email</mat-icon>
                    @if (personalInfoForm.get('email')?.hasError('required')) {
                      <mat-error>L'email est obligatoire</mat-error>
                    }
                    @if (personalInfoForm.get('email')?.hasError('email')) {
                      <mat-error>Email invalide</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Téléphone</mat-label>
                    <input matInput formControlName="phone" placeholder="+33 6 12 34 56 78">
                    <mat-icon matPrefix>phone</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Bio</mat-label>
                    <textarea matInput formControlName="bio" rows="4" placeholder="Parlez-nous de vous..."></textarea>
                    <mat-icon matPrefix>description</mat-icon>
                  </mat-form-field>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-raised-button color="primary" type="submit" [disabled]="!personalInfoForm.valid || saving">
                    <i class="fas fa-save"></i>
                    Enregistrer les modifications
                  </button>
                  <button mat-button type="button" (click)="resetPersonalInfo()">
                    <i class="fas fa-undo"></i>
                    Annuler
                  </button>
                </mat-card-actions>
              </mat-card>
            </form>
          </div>
        </mat-tab>

        <!-- Adresse -->
        <mat-tab label="Adresse">
          <div class="tab-content">
            <form [formGroup]="addressForm" (ngSubmit)="saveAddress()">
              <mat-card class="form-card">
                <mat-card-header>
                  <mat-card-title>
                    <i class="fas fa-map-marker-alt"></i>
                    Adresse de facturation
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Rue</mat-label>
                    <input matInput formControlName="street" placeholder="Numéro et nom de rue">
                    <mat-icon matPrefix>home</mat-icon>
                  </mat-form-field>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Ville</mat-label>
                      <input matInput formControlName="city" placeholder="Ville">
                      <mat-icon matPrefix>location_city</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="quarter-width">
                      <mat-label>Code postal</mat-label>
                      <input matInput formControlName="zipCode" placeholder="75001">
                      <mat-icon matPrefix>markunread_mailbox</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="quarter-width">
                      <mat-label>État/Région</mat-label>
                      <input matInput formControlName="state" placeholder="Région">
                      <mat-icon matPrefix>map</mat-icon>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Pays</mat-label>
                    <input matInput formControlName="country" placeholder="France">
                    <mat-icon matPrefix>public</mat-icon>
                  </mat-form-field>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-raised-button color="primary" type="submit" [disabled]="!addressForm.valid || saving">
                    <i class="fas fa-save"></i>
                    Enregistrer l'adresse
                  </button>
                  <button mat-button type="button" (click)="resetAddress()">
                    <i class="fas fa-undo"></i>
                    Annuler
                  </button>
                </mat-card-actions>
              </mat-card>
            </form>
          </div>
        </mat-tab>

        <!-- Informations d'entreprise -->
        <mat-tab label="Entreprise">
          <div class="tab-content">
            <form [formGroup]="companyForm" (ngSubmit)="saveCompanyInfo()">
              <mat-card class="form-card">
                <mat-card-header>
                  <mat-card-title>
                    <i class="fas fa-building"></i>
                    Informations d'entreprise
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Nom de l'entreprise</mat-label>
                    <input matInput formControlName="name" placeholder="Ma Société SARL">
                    <mat-icon matPrefix>business</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Numéro SIRET</mat-label>
                    <input matInput formControlName="registrationNumber" placeholder="123 456 789 00010">
                    <mat-icon matPrefix>badge</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Numéro de TVA</mat-label>
                    <input matInput formControlName="taxId" placeholder="FR 12 345678901">
                    <mat-icon matPrefix>receipt</mat-icon>
                  </mat-form-field>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-raised-button color="primary" type="submit" [disabled]="!companyForm.valid || saving">
                    <i class="fas fa-save"></i>
                    Enregistrer les informations
                  </button>
                  <button mat-button type="button" (click)="resetCompanyInfo()">
                    <i class="fas fa-undo"></i>
                    Annuler
                  </button>
                </mat-card-actions>
              </mat-card>
            </form>
          </div>
        </mat-tab>

        <!-- Sécurité -->
        <mat-tab label="Sécurité">
          <div class="tab-content">
            <form [formGroup]="securityForm" (ngSubmit)="changePassword()">
              <mat-card class="form-card">
                <mat-card-header>
                  <mat-card-title>
                    <i class="fas fa-lock"></i>
                    Changer le mot de passe
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Mot de passe actuel</mat-label>
                    <input matInput formControlName="currentPassword" type="password">
                    <mat-icon matPrefix>lock</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Nouveau mot de passe</mat-label>
                    <input matInput formControlName="newPassword" type="password">
                    <mat-icon matPrefix>lock_open</mat-icon>
                    @if (securityForm.get('newPassword')?.hasError('minlength')) {
                      <mat-error>Le mot de passe doit contenir au moins 8 caractères</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Confirmer le mot de passe</mat-label>
                    <input matInput formControlName="confirmPassword" type="password">
                    <mat-icon matPrefix>lock_open</mat-icon>
                    @if (securityForm.hasError('passwordMismatch')) {
                      <mat-error>Les mots de passe ne correspondent pas</mat-error>
                    }
                  </mat-form-field>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-raised-button color="primary" type="submit" [disabled]="!securityForm.valid || saving">
                    <i class="fas fa-key"></i>
                    Changer le mot de passe
                  </button>
                  <button mat-button type="button" (click)="resetSecurity()">
                    <i class="fas fa-undo"></i>
                    Annuler
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
    .vendor-profile {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .profile-header {
      background: linear-gradient(135deg, #8B2E2E 0%, #D9744F 100%);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 32px;
      color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 32px;
    }

    .avatar-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      color: #8B2E2E;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .btn-change-avatar {
      background: white !important;
      color: #8B2E2E !important;
      font-size: 0.9rem;
    }

    .profile-info h1 {
      margin: 0 0 8px 0;
      font-size: 2rem;
      font-weight: 700;
    }

    .email {
      margin: 0 0 16px 0;
      opacity: 0.9;
      font-size: 1.1rem;
    }

    .status-chip {
      background: white !important;
      color: #8B2E2E !important;
      font-weight: 500;
    }

    .status-chip i {
      margin-right: 6px;
    }

    .status-chip.verified {
      background: #D1FAE5 !important;
      color: #065F46 !important;
    }

    .status-chip.active {
      background: #FEF3C7 !important;
      color: #92400E !important;
    }

    .profile-tabs {
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

    .quarter-width {
      flex: 0.5;
      min-width: 150px;
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

    @media (max-width: 768px) {
      .vendor-profile {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
      }

      .profile-info h1 {
        font-size: 1.5rem;
      }

      .form-row {
        flex-direction: column;
      }

      .half-width,
      .quarter-width {
        width: 100%;
      }
    }
  `]
})
export class VendorProfileComponent implements OnInit {
  profile: VendorProfile = {
    firstName: 'Vendor',
    lastName: 'Test',
    email: 'vendor@test.com',
    phone: '+33 6 12 34 56 78',
    bio: 'Vendeur passionné de mode africaine',
    address: {
      street: '123 Rue de la Mode',
      city: 'Paris',
      state: 'Île-de-France',
      zipCode: '75001',
      country: 'France'
    },
    companyInfo: {
      name: 'Ma Boutique AfrikMode',
      taxId: 'FR 12 345678901',
      registrationNumber: '123 456 789 00010'
    }
  };

  personalInfoForm: FormGroup;
  addressForm: FormGroup;
  companyForm: FormGroup;
  securityForm: FormGroup;
  selectedTabIndex = 0;
  saving = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private vendorService: VendorService,
    private authService: AuthService,
    private storeService: StoreService
  ) {
    this.personalInfoForm = this.fb.group({
      firstName: [this.profile.firstName, [Validators.required]],
      lastName: [this.profile.lastName, [Validators.required]],
      email: [this.profile.email, [Validators.required, Validators.email]],
      phone: [this.profile.phone],
      bio: [this.profile.bio]
    });

    this.addressForm = this.fb.group({
      street: [this.profile.address.street],
      city: [this.profile.address.city],
      state: [this.profile.address.state],
      zipCode: [this.profile.address.zipCode],
      country: [this.profile.address.country]
    });

    this.companyForm = this.fb.group({
      name: [this.profile.companyInfo.name],
      taxId: [this.profile.companyInfo.taxId],
      registrationNumber: [this.profile.companyInfo.registrationNumber]
    });

    this.securityForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.loadProfile();
  }

  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  loadProfile() {
    this.loading = true;
    
    // Charger les informations de l'utilisateur connecté
    this.authService.currentUser$.subscribe({
      next: (user) => {
        if (user) {
          console.log('✅ Utilisateur connecté chargé:', user);
          
          // Mettre à jour le profil avec les vraies données
          this.profile = {
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            email: user.email || '',
            phone: user.phone || '',
            avatar: (user as any).avatar_url || (user as any).avatar || undefined,
            bio: this.profile.bio, // Garder la bio mockée pour l'instant
            address: this.profile.address, // Garder l'adresse mockée pour l'instant
            companyInfo: this.profile.companyInfo // Garder les infos entreprise mockées
          };
          
          // Mettre à jour les formulaires
          this.personalInfoForm.patchValue({
            firstName: this.profile.firstName,
            lastName: this.profile.lastName,
            email: this.profile.email,
            phone: this.profile.phone,
            bio: this.profile.bio
          });
          
          // Charger les infos de la boutique si disponible
          this.storeService.getMyStore().subscribe({
            next: (store: any) => {
              console.log('✅ Boutique chargée:', store);
              if (store) {
                this.profile.companyInfo.name = store.name || this.profile.companyInfo.name;
                this.companyForm.patchValue({
                  name: store.name
                });
              }
              this.loading = false;
            },
            error: (error: any) => {
              console.log('ℹ️ Pas de boutique trouvée:', error);
              this.loading = false;
            }
          });
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('❌ Erreur chargement utilisateur:', error);
        this.loading = false;
      }
    });
  }

  savePersonalInfo() {
    if (this.personalInfoForm.valid) {
      this.saving = true;
      console.log('Sauvegarde des informations personnelles:', this.personalInfoForm.value);
      
      setTimeout(() => {
        this.saving = false;
        this.snackBar.open('Informations personnelles enregistrées avec succès', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }, 1000);
    }
  }

  saveAddress() {
    if (this.addressForm.valid) {
      this.saving = true;
      console.log('Sauvegarde de l\'adresse:', this.addressForm.value);
      
      setTimeout(() => {
        this.saving = false;
        this.snackBar.open('Adresse enregistrée avec succès', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }, 1000);
    }
  }

  saveCompanyInfo() {
    if (this.companyForm.valid) {
      this.saving = true;
      console.log('Sauvegarde des informations d\'entreprise:', this.companyForm.value);
      
      setTimeout(() => {
        this.saving = false;
        this.snackBar.open('Informations d\'entreprise enregistrées avec succès', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }, 1000);
    }
  }

  changePassword() {
    if (this.securityForm.valid) {
      this.saving = true;
      console.log('Changement de mot de passe');
      
      setTimeout(() => {
        this.saving = false;
        this.securityForm.reset();
        this.snackBar.open('Mot de passe changé avec succès', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }, 1000);
    }
  }

  resetPersonalInfo() {
    this.personalInfoForm.reset(this.profile);
  }

  resetAddress() {
    this.addressForm.reset(this.profile.address);
  }

  resetCompanyInfo() {
    this.companyForm.reset(this.profile.companyInfo);
  }

  resetSecurity() {
    this.securityForm.reset();
  }
}
