// src/app/features/admin/pages/stores/stores.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

// Angular Material Modules
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

interface Store {
  id: string;
  name: string;
  description: string;
  owner: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  verified: boolean;
  logo: string;
  banner: string;
  categories: string[];
  createdAt: Date;
  totalProducts: number;
  totalSales: number;
  rating: number;
  reviews: number;
}

@Component({
  selector: 'app-stores',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgFor,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './stores.component.html',
  styleUrls: ['./stores.component.scss']
})
export class StoresComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<Store>([]);
  displayedColumns: string[] = ['logo', 'name', 'owner', 'location', 'status', 'verified', 'products', 'sales', 'rating', 'actions'];
  
  loading = false;
  searchForm: FormGroup;
  
  statuses = [
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
    { value: 'pending', label: 'En attente' },
    { value: 'suspended', label: 'Suspendu' }
  ];

  countries = [
    { value: 'FR', label: 'France' },
    { value: 'SN', label: 'Sénégal' },
    { value: 'CI', label: 'Côte d\'Ivoire' },
    { value: 'ML', label: 'Mali' },
    { value: 'BF', label: 'Burkina Faso' }
  ];

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      search: [''],
      status: [''],
      country: [''],
      verified: ['']
    });
  }

  ngOnInit(): void {
    this.loadStores();
    this.setupSearch();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private setupSearch(): void {
    this.searchForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  private applyFilters(): void {
    const filters = this.searchForm.value;
    
    this.dataSource.filterPredicate = (data: Store, filter: string) => {
      const searchMatch = !filters.search || 
        data.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        data.owner.toLowerCase().includes(filters.search.toLowerCase()) ||
        data.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        data.city.toLowerCase().includes(filters.search.toLowerCase());
      
      const statusMatch = !filters.status || data.status === filters.status;
      const countryMatch = !filters.country || data.country === filters.country;
      const verifiedMatch = filters.verified === '' || data.verified === (filters.verified === 'true');
      
      return searchMatch && statusMatch && countryMatch && verifiedMatch;
    };
    
    this.dataSource.filter = Math.random().toString();
  }

  loadStores(): void {
    this.loading = true;
    
    // Simuler des données pour l'instant
    const mockStores: Store[] = [
      {
        id: '1',
        name: 'Boutique Afrique',
        description: 'Spécialisée dans les vêtements traditionnels',
        owner: 'Marie Diop',
        email: 'marie@boutique-afrique.com',
        phone: '+33 1 23 45 67 89',
        address: '123 Rue de la Paix',
        city: 'Paris',
        country: 'FR',
        status: 'active',
        verified: true,
        logo: 'logo1.jpg',
        banner: 'banner1.jpg',
        categories: ['femmes', 'hommes'],
        createdAt: new Date('2024-01-15'),
        totalProducts: 45,
        totalSales: 12500.50,
        rating: 4.5,
        reviews: 23
      },
      {
        id: '2',
        name: 'Mode Ghana',
        description: 'Tissus Kente authentiques',
        owner: 'Kwame Asante',
        email: 'kwame@mode-ghana.com',
        phone: '+233 24 123 4567',
        address: '456 Independence Avenue',
        city: 'Accra',
        country: 'GH',
        status: 'active',
        verified: true,
        logo: 'logo2.jpg',
        banner: 'banner2.jpg',
        categories: ['hommes', 'accessoires'],
        createdAt: new Date('2024-02-20'),
        totalProducts: 32,
        totalSales: 8750.25,
        rating: 4.2,
        reviews: 18
      },
      {
        id: '3',
        name: 'Petits Africains',
        description: 'Vêtements pour enfants',
        owner: 'Fatou Diallo',
        email: 'fatou@petits-africains.com',
        phone: '+221 77 123 4567',
        address: '789 Avenue Bourguiba',
        city: 'Dakar',
        country: 'SN',
        status: 'pending',
        verified: false,
        logo: 'logo3.jpg',
        banner: 'banner3.jpg',
        categories: ['enfants'],
        createdAt: new Date('2024-03-10'),
        totalProducts: 28,
        totalSales: 3200.75,
        rating: 4.8,
        reviews: 12
      },
      {
        id: '4',
        name: 'Artisanat Africain',
        description: 'Accessoires et bijoux artisanaux',
        owner: 'Jean Kouassi',
        email: 'jean@artisanat-africain.com',
        phone: '+225 07 123 4567',
        address: '321 Rue des Artisans',
        city: 'Abidjan',
        country: 'CI',
        status: 'inactive',
        verified: true,
        logo: 'logo4.jpg',
        banner: 'banner4.jpg',
        categories: ['accessoires'],
        createdAt: new Date('2024-01-25'),
        totalProducts: 15,
        totalSales: 2100.00,
        rating: 4.0,
        reviews: 8
      },
      {
        id: '5',
        name: 'Traditions Sénégal',
        description: 'Boubou et vêtements traditionnels',
        owner: 'Aminata Ba',
        email: 'aminata@traditions-senegal.com',
        phone: '+221 78 987 6543',
        address: '654 Avenue Léopold Sédar Senghor',
        city: 'Dakar',
        country: 'SN',
        status: 'suspended',
        verified: false,
        logo: 'logo5.jpg',
        banner: 'banner5.jpg',
        categories: ['femmes', 'hommes'],
        createdAt: new Date('2024-02-05'),
        totalProducts: 38,
        totalSales: 5600.30,
        rating: 3.8,
        reviews: 15
      }
    ];

    setTimeout(() => {
      this.dataSource.data = mockStores;
      this.loading = false;
    }, 1000);
  }

  getStatusLabel(status: string): string {
    const statusObj = this.statuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'primary';
      case 'inactive':
        return 'accent';
      case 'pending':
        return 'warn';
      case 'suspended':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getCountryLabel(country: string): string {
    const countryObj = this.countries.find(c => c.value === country);
    return countryObj ? countryObj.label : country;
  }

  editStore(store: Store): void {
    console.log('Edit store:', store);
    // TODO: Ouvrir dialog d'édition
  }

  deleteStore(store: Store): void {
    console.log('Delete store:', store);
    // TODO: Confirmer suppression
  }

  verifyStore(store: Store): void {
    console.log('Verify store:', store);
    // TODO: Vérifier la boutique
  }

  suspendStore(store: Store): void {
    console.log('Suspend store:', store);
    // TODO: Suspendre la boutique
  }

  activateStore(store: Store): void {
    console.log('Activate store:', store);
    // TODO: Activer la boutique
  }

  viewStoreDetails(store: Store): void {
    console.log('View store details:', store);
    // TODO: Naviguer vers détails boutique
  }

  exportStores(): void {
    console.log('Export stores');
    // TODO: Exporter les boutiques
  }

  addStore(): void {
    console.log('Add new store');
    // TODO: Ouvrir dialog d'ajout
  }

  clearFilters(): void {
    this.searchForm.reset();
  }
}
