// src/app/features/admin/pages/profile/admin-profile.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatTabsModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatChipsModule
  ],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <mat-icon>account_circle</mat-icon>
            Mon Profil Administrateur
          </h1>
          <p class="page-subtitle">Gérez vos informations personnelles et préférences</p>
        </div>
        <button mat-raised-button color="primary" class="save-button">
          <mat-icon>save</mat-icon>
          Enregistrer les modifications
        </button>
      </div>

      <div class="profile-layout">
        <!-- Sidebar Profile Card -->
        <mat-card class="profile-sidebar">
          <div class="profile-avatar-section">
            <div class="avatar-wrapper">
              <div class="avatar-circle">
                <mat-icon>person</mat-icon>
              </div>
              <button mat-mini-fab color="primary" class="avatar-edit-button">
                <mat-icon>photo_camera</mat-icon>
              </button>
            </div>
            <h2 class="profile-name">Super Admin</h2>
            <p class="profile-email">admin@afrikmode.com</p>
            <div class="profile-badge">
              <mat-icon>verified</mat-icon>
              Administrateur Système
            </div>
          </div>

          <div class="profile-stats">
            <div class="stat-item">
              <div class="stat-value">2 ans</div>
              <div class="stat-label">Membre depuis</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">4,582</div>
              <div class="stat-label">Actions</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">98%</div>
              <div class="stat-label">Disponibilité</div>
            </div>
          </div>

          <div class="profile-actions">
            <button mat-stroked-button color="primary" class="full-width-button">
              <mat-icon>history</mat-icon>
              Historique d'activité
            </button>
            <button mat-stroked-button class="full-width-button">
              <mat-icon>security</mat-icon>
              Journal de sécurité
            </button>
          </div>
        </mat-card>

        <!-- Main Content -->
        <div class="profile-content">
          <mat-tab-group class="profile-tabs" animationDuration="300ms">
            <!-- Informations Personnelles -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>person</mat-icon>
                Informations
              </ng-template>
              <div class="tab-content">
                <mat-card class="content-card">
                  <h3 class="section-title">Informations personnelles</h3>
                  
                  <div class="form-grid">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Prénom</mat-label>
                      <input matInput value="Super" placeholder="Votre prénom">
                      <mat-icon matPrefix>person</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Nom</mat-label>
                      <input matInput value="Admin" placeholder="Votre nom">
                      <mat-icon matPrefix>badge</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Email</mat-label>
                      <input matInput type="email" value="admin@afrikmode.com">
                      <mat-icon matPrefix>email</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Téléphone</mat-label>
                      <input matInput value="+33 6 12 34 56 78">
                      <mat-icon matPrefix>phone</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Poste</mat-label>
                      <input matInput value="Administrateur Système">
                      <mat-icon matPrefix>work</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Département</mat-label>
                      <mat-select value="tech">
                        <mat-option value="tech">Technique</mat-option>
                        <mat-option value="management">Management</mat-option>
                        <mat-option value="support">Support</mat-option>
                      </mat-select>
                      <mat-icon matPrefix>business</mat-icon>
                    </mat-form-field>
                  </div>

                  <h3 class="section-title">Adresse</h3>
                  
                  <div class="form-grid">
                    <mat-form-field appearance="outline" class="span-2">
                      <mat-label>Adresse complète</mat-label>
                      <input matInput placeholder="123 Rue de la Paix">
                      <mat-icon matPrefix>location_on</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Ville</mat-label>
                      <input matInput placeholder="Paris">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Code postal</mat-label>
                      <input matInput placeholder="75001">
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="span-2">
                      <mat-label>Pays</mat-label>
                      <mat-select value="fr">
                        <mat-option value="fr">France</mat-option>
                        <mat-option value="be">Belgique</mat-option>
                        <mat-option value="ch">Suisse</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                </mat-card>
              </div>
            </mat-tab>

            <!-- Sécurité -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>lock</mat-icon>
                Sécurité
              </ng-template>
              <div class="tab-content">
                <mat-card class="content-card">
                  <h3 class="section-title">Modifier le mot de passe</h3>
                  
                  <div class="form-grid">
                    <mat-form-field appearance="outline" class="span-2">
                      <mat-label>Mot de passe actuel</mat-label>
                      <input matInput type="password" placeholder="Entrez votre mot de passe actuel">
                      <mat-icon matPrefix>lock_outline</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="span-2">
                      <mat-label>Nouveau mot de passe</mat-label>
                      <input matInput type="password" placeholder="Minimum 8 caractères">
                      <mat-icon matPrefix>vpn_key</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="span-2">
                      <mat-label>Confirmer le nouveau mot de passe</mat-label>
                      <input matInput type="password" placeholder="Re-entrez le mot de passe">
                      <mat-icon matPrefix>check_circle</mat-icon>
                    </mat-form-field>
                  </div>

                  <div class="password-requirements">
                    <h4>Exigences du mot de passe :</h4>
                    <ul>
                      <li><mat-icon>check_circle</mat-icon> Minimum 8 caractères</li>
                      <li><mat-icon>check_circle</mat-icon> Une majuscule</li>
                      <li><mat-icon>check_circle</mat-icon> Un chiffre</li>
                      <li><mat-icon>check_circle</mat-icon> Un caractère spécial</li>
                    </ul>
                  </div>

                  <button mat-raised-button color="primary">
                    <mat-icon>security</mat-icon>
                    Changer le mot de passe
                  </button>
                </mat-card>

                <mat-card class="content-card">
                  <h3 class="section-title">Authentification à deux facteurs</h3>
                  <p class="section-description">Ajoutez une couche de sécurité supplémentaire à votre compte</p>
                  
                  <div class="two-factor-section">
                    <div class="two-factor-info">
                      <mat-icon class="large-icon">phonelink_lock</mat-icon>
                      <div>
                        <h4>Activez l'authentification 2FA</h4>
                        <p>Protection renforcée de votre compte administrateur</p>
                      </div>
                    </div>
                    <mat-slide-toggle color="primary">Activer 2FA</mat-slide-toggle>
                  </div>
                </mat-card>

                <mat-card class="content-card">
                  <h3 class="section-title">Sessions actives</h3>
                  
                  <div class="session-list">
                    <div class="session-item">
                      <mat-icon class="session-icon">computer</mat-icon>
                      <div class="session-details">
                        <h4>Windows 11 - Chrome</h4>
                        <p>Paris, France • Session actuelle</p>
                        <span class="session-date">Aujourd'hui à 10:30</span>
                      </div>
                      <mat-chip class="active-chip">Actif</mat-chip>
                    </div>

                    <div class="session-item">
                      <mat-icon class="session-icon">phone_iphone</mat-icon>
                      <div class="session-details">
                        <h4>iPhone 13 Pro - Safari</h4>
                        <p>Paris, France</p>
                        <span class="session-date">Hier à 18:45</span>
                      </div>
                      <button mat-button color="warn">Déconnecter</button>
                    </div>
                  </div>

                  <button mat-stroked-button color="warn" class="full-width-button">
                    <mat-icon>logout</mat-icon>
                    Déconnecter tous les autres appareils
                  </button>
                </mat-card>
              </div>
            </mat-tab>

            <!-- Préférences -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>tune</mat-icon>
                Préférences
              </ng-template>
              <div class="tab-content">
                <mat-card class="content-card">
                  <h3 class="section-title">Notifications</h3>
                  
                  <div class="preference-item">
                    <div class="preference-info">
                      <h4>Notifications par email</h4>
                      <p>Recevoir des notifications importantes par email</p>
                    </div>
                    <mat-slide-toggle color="primary" checked></mat-slide-toggle>
                  </div>

                  <div class="preference-item">
                    <div class="preference-info">
                      <h4>Notifications push</h4>
                      <p>Alertes en temps réel dans le navigateur</p>
                    </div>
                    <mat-slide-toggle color="primary" checked></mat-slide-toggle>
                  </div>

                  <div class="preference-item">
                    <div class="preference-info">
                      <h4>Résumé quotidien</h4>
                      <p>Rapport quotidien des activités de la plateforme</p>
                    </div>
                    <mat-slide-toggle color="primary"></mat-slide-toggle>
                  </div>

                  <div class="preference-item">
                    <div class="preference-info">
                      <h4>Alertes de sécurité</h4>
                      <p>Notifications pour les événements de sécurité</p>
                    </div>
                    <mat-slide-toggle color="primary" checked></mat-slide-toggle>
                  </div>
                </mat-card>

                <mat-card class="content-card">
                  <h3 class="section-title">Interface</h3>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Langue</mat-label>
                    <mat-select value="fr">
                      <mat-option value="fr">Français</mat-option>
                      <mat-option value="en">English</mat-option>
                      <mat-option value="es">Español</mat-option>
                    </mat-select>
                    <mat-icon matPrefix>language</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Fuseau horaire</mat-label>
                    <mat-select value="paris">
                      <mat-option value="paris">Paris (GMT+1)</mat-option>
                      <mat-option value="london">London (GMT+0)</mat-option>
                      <mat-option value="newyork">New York (GMT-5)</mat-option>
                    </mat-select>
                    <mat-icon matPrefix>schedule</mat-icon>
                  </mat-form-field>

                  <div class="preference-item">
                    <div class="preference-info">
                      <h4>Mode sombre</h4>
                      <p>Basculer l'interface en mode sombre</p>
                    </div>
                    <mat-slide-toggle color="primary"></mat-slide-toggle>
                  </div>

                  <div class="preference-item">
                    <div class="preference-info">
                      <h4>Animations réduites</h4>
                      <p>Désactiver les animations pour améliorer les performances</p>
                    </div>
                    <mat-slide-toggle color="primary"></mat-slide-toggle>
                  </div>
                </mat-card>
              </div>
            </mat-tab>
          </mat-tab-group>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page {
      padding: 24px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      
      .header-content {
        flex: 1;
      }
      
      .page-title {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0 0 8px 0;
        font-size: 32px;
        font-weight: 700;
        color: #1e293b;
        
        mat-icon {
          font-size: 36px;
          width: 36px;
          height: 36px;
          color: #3b82f6;
        }
      }
      
      .page-subtitle {
        margin: 0;
        color: #64748b;
        font-size: 16px;
      }
      
      .save-button {
        height: 48px;
        padding: 0 24px;
        font-size: 15px;
        font-weight: 600;
        
        mat-icon {
          margin-right: 8px;
        }
      }
    }

    .profile-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 24px;
    }

    .profile-sidebar {
      height: fit-content;
      padding: 0;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      
      .profile-avatar-section {
        padding: 32px 24px;
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        text-align: center;
        
        .avatar-wrapper {
          position: relative;
          display: inline-block;
          margin-bottom: 16px;
          
          .avatar-circle {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 4px solid rgba(255, 255, 255, 0.3);
            
            mat-icon {
              font-size: 64px;
              width: 64px;
              height: 64px;
              color: white;
            }
          }
          
          .avatar-edit-button {
            position: absolute;
            bottom: 0;
            right: 0;
            background: white;
            color: #3b82f6;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            
            mat-icon {
              font-size: 20px;
              width: 20px;
              height: 20px;
            }
          }
        }
        
        .profile-name {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 700;
          color: white;
        }
        
        .profile-email {
          margin: 0 0 16px 0;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .profile-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          color: white;
          
          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
        }
      }
      
      .profile-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        border-bottom: 1px solid #e2e8f0;
        
        .stat-item {
          padding: 20px;
          text-align: center;
          border-right: 1px solid #e2e8f0;
          
          &:last-child {
            border-right: none;
          }
          
          .stat-value {
            font-size: 20px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 4px;
          }
          
          .stat-label {
            font-size: 12px;
            color: #64748b;
          }
        }
      }
      
      .profile-actions {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        
        .full-width-button {
          width: 100%;
          justify-content: flex-start;
          
          mat-icon {
            margin-right: 12px;
          }
        }
      }
    }

    .profile-content {
      .profile-tabs {
        background: transparent;
        
        ::ng-deep .mat-mdc-tab-labels {
          background: white;
          border-radius: 16px 16px 0 0;
          padding: 0 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        ::ng-deep .mat-mdc-tab {
          min-width: 160px;
          
          .mdc-tab__text-label {
            display: flex;
            align-items: center;
            gap: 8px;
            
            mat-icon {
              font-size: 20px;
              width: 20px;
              height: 20px;
            }
          }
        }
        
        ::ng-deep .mat-mdc-tab-body-wrapper {
          background: transparent;
        }
      }
      
      .tab-content {
        padding: 24px 0;
        
        .content-card {
          padding: 32px;
          border-radius: 16px;
          margin-bottom: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .section-title {
            margin: 0 0 8px 0;
            font-size: 20px;
            font-weight: 700;
            color: #1e293b;
          }
          
          .section-description {
            margin: 0 0 24px 0;
            color: #64748b;
            font-size: 14px;
          }
        }
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 24px;
      
      .full-width {
        width: 100%;
      }
      
      .span-2 {
        grid-column: span 2;
      }
    }

    .password-requirements {
      padding: 20px;
      background: #f8fafc;
      border-radius: 12px;
      margin-bottom: 24px;
      
      h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
        color: #1e293b;
      }
      
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        
        li {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 14px;
          color: #64748b;
          
          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
            color: #10b981;
          }
          
          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }

    .two-factor-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      background: #f8fafc;
      border-radius: 12px;
      
      .two-factor-info {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .large-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          color: #3b82f6;
        }
        
        h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }
        
        p {
          margin: 0;
          font-size: 14px;
          color: #64748b;
        }
      }
    }

    .session-list {
      margin-bottom: 20px;
      
      .session-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        background: #f8fafc;
        border-radius: 12px;
        margin-bottom: 12px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .session-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: #64748b;
        }
        
        .session-details {
          flex: 1;
          
          h4 {
            margin: 0 0 4px 0;
            font-size: 15px;
            font-weight: 600;
            color: #1e293b;
          }
          
          p {
            margin: 0 0 4px 0;
            font-size: 13px;
            color: #64748b;
          }
          
          .session-date {
            font-size: 12px;
            color: #94a3b8;
          }
        }
        
        .active-chip {
          background: #10b981;
          color: white;
          font-weight: 600;
        }
      }
    }

    .preference-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 0;
      border-bottom: 1px solid #e2e8f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .preference-info {
        h4 {
          margin: 0 0 4px 0;
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
        }
        
        p {
          margin: 0;
          font-size: 13px;
          color: #64748b;
        }
      }
    }

    @media (max-width: 1024px) {
      .profile-layout {
        grid-template-columns: 1fr;
      }
      
      .page-header {
        flex-direction: column;
        gap: 16px;
        
        .save-button {
          width: 100%;
        }
      }
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
        
        .span-2 {
          grid-column: span 1;
        }
      }
    }
  `]
})
export class AdminProfileComponent {}
