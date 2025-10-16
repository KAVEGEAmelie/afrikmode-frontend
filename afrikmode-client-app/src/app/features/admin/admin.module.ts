// src/app/features/admin/admin.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// CDK
import { LayoutModule } from '@angular/cdk/layout';

// Routing
import { AdminRoutingModule } from './admin-routing.module';

// Material Modules
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

// Layout Components
import { AdminComponent } from './admin.component';
import { AdminTopbarComponent } from './shared/components/admin-topbar/admin-topbar.component';

@NgModule({
  declarations: [
    // Layout - AdminComponent est maintenant standalone
  ],
  imports: [
    // Angular Core - CommonModule doit être en premier
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    
    // CDK
    LayoutModule,
    
    // Routing
    AdminRoutingModule,
    
    // Material Design
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDividerModule,
    
    // Standalone Components - Ne pas importer dans un module
  ]
})
export class AdminModule {
  constructor() {
    console.log('✅ Admin Module Loaded - AfrikMode Dashboard');
  }
}