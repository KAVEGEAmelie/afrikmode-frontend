import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTreeModule } from '@angular/material/tree';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-admin-loyalty',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatListModule,
    MatTabsModule,
    MatStepperModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatProgressBarModule,
    MatToolbarModule,
    MatSidenavModule,
    MatGridListModule,
    MatTreeModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatRadioModule
  ],
  template: `
    <div class="loyalty-management">
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1>Programme de Fidélité</h1>
            <p>Gérez les points de fidélité, les récompenses et les niveaux de membres</p>
          </div>
          <div class="header-actions">
            <button mat-raised-button color="primary">
              <mat-icon>add</mat-icon>
              Nouvelle Règle
            </button>
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <mat-icon>loyalty</mat-icon>
            </div>
            <div class="stat-info">
              <h3>12,456</h3>
              <p>Points distribués</p>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <mat-icon>card_giftcard</mat-icon>
            </div>
            <div class="stat-info">
              <h3>1,234</h3>
              <p>Récompenses utilisées</p>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <mat-icon>people</mat-icon>
            </div>
            <div class="stat-info">
              <h3>5,678</h3>
              <p>Membres actifs</p>
            </div>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <mat-icon>trending_up</mat-icon>
            </div>
            <div class="stat-info">
              <h3>+15.2%</h3>
              <p>Croissance mensuelle</p>
            </div>
          </div>
        </mat-card>
      </div>

      <!-- Contenu principal -->
      <div class="content-grid">
        <mat-card class="main-card">
          <mat-card-header>
            <mat-card-title>Règles de Fidélité</mat-card-title>
            <mat-card-subtitle>Configurez les règles d'attribution et d'utilisation des points</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Gestion des règles de fidélité en cours de développement...</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="main-card">
          <mat-card-header>
            <mat-card-title>Niveaux de Membres</mat-card-title>
            <mat-card-subtitle>Définissez les différents niveaux et leurs avantages</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Configuration des niveaux de membres en cours de développement...</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styleUrls: ['./admin-loyalty.component.scss']
})
export class AdminLoyaltyComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    console.log('Programme de fidélité chargé');
  }
}






