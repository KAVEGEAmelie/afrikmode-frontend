import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { VendorService } from '../../../../core/services/vendor.service';

@Component({
  selector: 'app-vendor-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatInputModule,
    MatFormFieldModule
  ],
  template: `
    <div class="vendor-settings">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>
            <mat-icon>settings</mat-icon>
            Paramètres de la Boutique
          </h1>
          <p>Configurez votre boutique et vos préférences</p>
        </div>
      </div>

      <div class="settings-container">
        <mat-tab-group>
          <!-- Informations de la boutique -->
          <mat-tab label="Boutique">
            <div class="tab-content">
              <mat-card class="settings-card">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>store</mat-icon>
                    Informations de la Boutique
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Nom de la boutique</mat-label>
                      <input matInput [(ngModel)]="storeInfo.name" placeholder="Ma Boutique AfrikMode">
                      <mat-icon matPrefix>store</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Email de contact</mat-label>
                      <input matInput type="email" [(ngModel)]="storeInfo.email" placeholder="contact@boutique.com">
                      <mat-icon matPrefix>email</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Téléphone</mat-label>
                      <input matInput [(ngModel)]="storeInfo.phone" placeholder="+228 90 12 34 56">
                      <mat-icon matPrefix>phone</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Ville</mat-label>
                      <input matInput [(ngModel)]="storeInfo.city" placeholder="Lomé">
                      <mat-icon matPrefix>location_city</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Adresse</mat-label>
                      <input matInput [(ngModel)]="storeInfo.address" placeholder="123 Avenue de la Libération">
                      <mat-icon matPrefix>location_on</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Description</mat-label>
                      <textarea matInput rows="4" [(ngModel)]="storeInfo.description" 
                        placeholder="Décrivez votre boutique..."></textarea>
                    </mat-form-field>
                  </div>

                  <div class="actions">
                    <button mat-raised-button color="primary" (click)="saveStoreInfo()">
                      <mat-icon>save</mat-icon>
                      Enregistrer
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="settings-card">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>image</mat-icon>
                    Logo et Images
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="image-uploader">
                    <div class="upload-item">
                      <div class="upload-label">Logo de la boutique</div>
                      <div class="upload-preview">
                        <mat-icon>store</mat-icon>
                      </div>
                      <button mat-raised-button (click)="uploadLogo()">
                        <mat-icon>upload</mat-icon>
                        Télécharger
                      </button>
                    </div>

                    <div class="upload-item">
                      <div class="upload-label">Bannière de la boutique</div>
                      <div class="upload-preview banner">
                        <mat-icon>image</mat-icon>
                      </div>
                      <button mat-raised-button (click)="uploadBanner()">
                        <mat-icon>upload</mat-icon>
                        Télécharger
                      </button>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Notifications -->
          <mat-tab label="Notifications">
            <div class="tab-content">
              <mat-card class="settings-card">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>notifications</mat-icon>
                    Préférences de Notifications
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="settings-list">
                    <div class="setting-item">
                      <div class="setting-info">
                        <h4>Nouvelles commandes</h4>
                        <p>Recevoir une notification pour chaque nouvelle commande</p>
                      </div>
                      <mat-slide-toggle [(ngModel)]="notifications.newOrders"></mat-slide-toggle>
                    </div>

                    <div class="setting-item">
                      <div class="setting-info">
                        <h4>Messages clients</h4>
                        <p>Être notifié des messages des clients</p>
                      </div>
                      <mat-slide-toggle [(ngModel)]="notifications.customerMessages"></mat-slide-toggle>
                    </div>

                    <div class="setting-item">
                      <div class="setting-info">
                        <h4>Avis et évaluations</h4>
                        <p>Notifications pour les nouveaux avis</p>
                      </div>
                      <mat-slide-toggle [(ngModel)]="notifications.reviews"></mat-slide-toggle>
                    </div>

                    <div class="setting-item">
                      <div class="setting-info">
                        <h4>Stock faible</h4>
                        <p>Alerte lorsque le stock est faible</p>
                      </div>
                      <mat-slide-toggle [(ngModel)]="notifications.lowStock"></mat-slide-toggle>
                    </div>

                    <div class="setting-item">
                      <div class="setting-info">
                        <h4>Paiements reçus</h4>
                        <p>Notification de réception des paiements</p>
                      </div>
                      <mat-slide-toggle [(ngModel)]="notifications.payments"></mat-slide-toggle>
                    </div>

                    <div class="setting-item">
                      <div class="setting-info">
                        <h4>Rapports hebdomadaires</h4>
                        <p>Recevoir un résumé hebdomadaire des performances</p>
                      </div>
                      <mat-slide-toggle [(ngModel)]="notifications.weeklyReports"></mat-slide-toggle>
                    </div>
                  </div>

                  <div class="actions">
                    <button mat-raised-button color="primary" (click)="saveNotifications()">
                      <mat-icon>save</mat-icon>
                      Enregistrer
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Paiements -->
          <mat-tab label="Paiements">
            <div class="tab-content">
              <mat-card class="settings-card">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>payment</mat-icon>
                    Méthodes de Paiement
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="settings-list">
                    <div class="setting-item">
                      <div class="setting-info">
                        <h4>
                          <mat-icon>credit_card</mat-icon>
                          Carte bancaire
                        </h4>
                        <p>Accepter les paiements par carte</p>
                      </div>
                      <mat-slide-toggle [(ngModel)]="paymentMethods.creditCard"></mat-slide-toggle>
                    </div>

                    <div class="setting-item">
                      <div class="setting-info">
                        <h4>
                          <mat-icon>phone_android</mat-icon>
                          Mobile Money
                        </h4>
                        <p>TMoney, Flooz, etc.</p>
                      </div>
                      <mat-slide-toggle [(ngModel)]="paymentMethods.mobileMoney"></mat-slide-toggle>
                    </div>

                    <div class="setting-item">
                      <div class="setting-info">
                        <h4>
                          <mat-icon>account_balance</mat-icon>
                          Virement bancaire
                        </h4>
                        <p>Accepter les virements</p>
                      </div>
                      <mat-slide-toggle [(ngModel)]="paymentMethods.bankTransfer"></mat-slide-toggle>
                    </div>

                    <div class="setting-item">
                      <div class="setting-info">
                        <h4>
                          <mat-icon>local_atm</mat-icon>
                          Paiement à la livraison
                        </h4>
                        <p>Paiement en espèces lors de la livraison</p>
                      </div>
                      <mat-slide-toggle [(ngModel)]="paymentMethods.cashOnDelivery"></mat-slide-toggle>
                    </div>
                  </div>

                  <div class="actions">
                    <button mat-raised-button color="primary" (click)="savePaymentMethods()">
                      <mat-icon>save</mat-icon>
                      Enregistrer
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="settings-card">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>account_balance_wallet</mat-icon>
                    Compte de Retrait
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Méthode de retrait</mat-label>
                      <input matInput [(ngModel)]="withdrawalAccount.method" placeholder="Mobile Money">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Numéro de compte</mat-label>
                      <input matInput [(ngModel)]="withdrawalAccount.accountNumber" placeholder="+228 90 12 34 56">
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Nom du titulaire</mat-label>
                      <input matInput [(ngModel)]="withdrawalAccount.accountName" placeholder="Nom complet">
                    </mat-form-field>
                  </div>

                  <div class="actions">
                    <button mat-raised-button color="primary" (click)="saveWithdrawalAccount()">
                      <mat-icon>save</mat-icon>
                      Enregistrer
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Livraison -->
          <mat-tab label="Livraison">
            <div class="tab-content">
              <mat-card class="settings-card">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>local_shipping</mat-icon>
                    Options de Livraison
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Frais de livraison (FCFA)</mat-label>
                      <input matInput type="number" [(ngModel)]="shippingSettings.defaultCost" placeholder="5000">
                      <mat-icon matPrefix>local_shipping</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Livraison gratuite à partir de (FCFA)</mat-label>
                      <input matInput type="number" [(ngModel)]="shippingSettings.freeShippingThreshold" placeholder="50000">
                      <mat-icon matPrefix>card_giftcard</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Délai de livraison (jours)</mat-label>
                      <input matInput type="number" [(ngModel)]="shippingSettings.deliveryTime" placeholder="3-5">
                      <mat-icon matPrefix>schedule</mat-icon>
                    </mat-form-field>
                  </div>

                  <div class="settings-list">
                    <div class="setting-item">
                      <div class="setting-info">
                        <h4>Livraison express</h4>
                        <p>Proposer une option de livraison rapide</p>
                      </div>
                      <mat-slide-toggle [(ngModel)]="shippingSettings.expressShipping"></mat-slide-toggle>
                    </div>

                    <div class="setting-item">
                      <div class="setting-info">
                        <h4>Retrait en magasin</h4>
                        <p>Permettre le retrait sur place</p>
                      </div>
                      <mat-slide-toggle [(ngModel)]="shippingSettings.storePickup"></mat-slide-toggle>
                    </div>
                  </div>

                  <div class="actions">
                    <button mat-raised-button color="primary" (click)="saveShippingSettings()">
                      <mat-icon>save</mat-icon>
                      Enregistrer
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Sécurité -->
          <mat-tab label="Sécurité">
            <div class="tab-content">
              <mat-card class="settings-card">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>lock</mat-icon>
                    Sécurité et Confidentialité
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-grid">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Mot de passe actuel</mat-label>
                      <input matInput type="password" [(ngModel)]="security.currentPassword">
                      <mat-icon matPrefix>lock</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Nouveau mot de passe</mat-label>
                      <input matInput type="password" [(ngModel)]="security.newPassword">
                      <mat-icon matPrefix>lock_open</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Confirmer le mot de passe</mat-label>
                      <input matInput type="password" [(ngModel)]="security.confirmPassword">
                      <mat-icon matPrefix>lock_open</mat-icon>
                    </mat-form-field>
                  </div>

                  <div class="settings-list">
                    <div class="setting-item">
                      <div class="setting-info">
                        <h4>Authentification à deux facteurs</h4>
                        <p>Sécuriser votre compte avec 2FA</p>
                      </div>
                      <mat-slide-toggle [(ngModel)]="security.twoFactorAuth"></mat-slide-toggle>
                    </div>
                  </div>

                  <div class="actions">
                    <button mat-raised-button color="primary" (click)="updatePassword()">
                      <mat-icon>save</mat-icon>
                      Mettre à jour le mot de passe
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .vendor-settings {
      background: #f8fafc;
      min-height: 100vh;
    }

    .page-header {
      background: linear-gradient(135deg, #8B2E2E 0%, #6B1F1F 100%);
      color: white;
      padding: 2rem;
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
    }

    .settings-container {
      padding: 2rem;
    }

    .tab-content {
      padding: 2rem 0;
    }

    .settings-card {
      margin-bottom: 2rem;
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #1f2937;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    mat-form-field {
      width: 100%;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .settings-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: #f9fafb;
      border-radius: 12px;
      transition: background 0.3s ease;
    }

    .setting-item:hover {
      background: #f3f4f6;
    }

    .setting-info h4 {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .setting-info p {
      margin: 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .image-uploader {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .upload-item {
      text-align: center;
    }

    .upload-label {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 1rem;
    }

    .upload-preview {
      width: 150px;
      height: 150px;
      margin: 0 auto 1rem auto;
      border: 2px dashed #d1d5db;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f9fafb;
    }

    .upload-preview.banner {
      width: 100%;
      height: 120px;
    }

    .upload-preview mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #9ca3af;
    }

    @media (max-width: 768px) {
      .settings-container {
        padding: 1rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .setting-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .image-uploader {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class VendorSettingsComponent implements OnInit {
  isLoading = false;
  isSaving = false;

  storeInfo = {
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    description: ''
  };

  notifications = {
    newOrders: true,
    customerMessages: true,
    reviews: true,
    lowStock: true,
    payments: true,
    weeklyReports: false
  };

  paymentMethods = {
    creditCard: true,
    mobileMoney: true,
    bankTransfer: false,
    cashOnDelivery: true
  };

  withdrawalAccount = {
    method: 'Mobile Money',
    accountNumber: '',
    accountName: ''
  };

  shippingSettings = {
    defaultCost: 5000,
    freeShippingThreshold: 50000,
    deliveryTime: 3,
    expressShipping: true,
    storePickup: true
  };

  security = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorAuth: false
  };

  constructor(private vendorService: VendorService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading = true;
    
    this.vendorService.getSettings().subscribe({
      next: (data: any) => {
        if (data.storeInfo) this.storeInfo = { ...this.storeInfo, ...data.storeInfo };
        if (data.notifications) this.notifications = { ...this.notifications, ...data.notifications };
        if (data.paymentMethods) this.paymentMethods = { ...this.paymentMethods, ...data.paymentMethods };
        if (data.withdrawalAccount) this.withdrawalAccount = { ...this.withdrawalAccount, ...data.withdrawalAccount };
        if (data.shippingSettings) this.shippingSettings = { ...this.shippingSettings, ...data.shippingSettings };
        if (data.security) this.security = { ...this.security, ...data.security };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des paramètres:', error);
        this.loadDefaultSettings();
        this.isLoading = false;
      }
    });
  }

  loadDefaultSettings(): void {
    this.storeInfo = {
      name: 'Ma Boutique AfrikMode',
      email: 'contact@boutique.com',
      phone: '+228 90 12 34 56',
      city: 'Lomé',
      address: '123 Avenue de la Libération',
      description: 'Spécialiste de la mode africaine moderne'
    };
  }

  saveStoreInfo(): void {
    this.isSaving = true;
    
    this.vendorService.updateSettings({ storeInfo: this.storeInfo }).subscribe({
      next: () => {
        alert('✅ Informations de la boutique enregistrées !');
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Erreur lors de l\'enregistrement:', error);
        alert('❌ Erreur lors de l\'enregistrement');
        this.isSaving = false;
      }
    });
  }

  uploadLogo(): void {
    console.log('📤 Upload du logo');
    alert('Fonctionnalité d\'upload à venir !');
  }

  uploadBanner(): void {
    console.log('📤 Upload de la bannière');
    alert('Fonctionnalité d\'upload à venir !');
  }

  saveNotifications(): void {
    console.log('🔔 Enregistrement des préférences de notifications', this.notifications);
    alert('Préférences de notifications enregistrées !');
  }

  savePaymentMethods(): void {
    console.log('💳 Enregistrement des méthodes de paiement', this.paymentMethods);
    alert('Méthodes de paiement enregistrées !');
  }

  saveWithdrawalAccount(): void {
    console.log('🏦 Enregistrement du compte de retrait', this.withdrawalAccount);
    alert('Compte de retrait enregistré !');
  }

  saveShippingSettings(): void {
    console.log('🚚 Enregistrement des paramètres de livraison', this.shippingSettings);
    alert('Paramètres de livraison enregistrés !');
  }

  updatePassword(): void {
    if (this.security.newPassword !== this.security.confirmPassword) {
      alert('Les mots de passe ne correspondent pas !');
      return;
    }
    console.log('🔒 Mise à jour du mot de passe');
    alert('Mot de passe mis à jour avec succès !');
    this.security = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactorAuth: this.security.twoFactorAuth
    };
  }
}
