import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

export interface FilterOption {
  value: string;
  label: string;
  selected?: boolean;
}

@Component({
  selector: 'app-dashboard-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSelectModule, MatChipsModule, MatIconModule],
  template: `
    <div class="filters-container">
      <div class="filters-section">
        <h4 class="filters-title">Mois</h4>
        <div class="filters-grid">
          @for (month of months; track month.value) {
            <mat-chip 
              [class.selected]="month.selected"
              (click)="toggleMonth(month)"
              class="filter-chip">
              {{ month.label }}
            </mat-chip>
          }
        </div>
      </div>

      <div class="filters-section">
        <h4 class="filters-title">Catégories</h4>
        <div class="filters-grid">
          @for (category of categories; track category.value) {
            <mat-chip 
              [class.selected]="category.selected"
              (click)="toggleCategory(category)"
              class="filter-chip">
              {{ category.label }}
            </mat-chip>
          }
        </div>
      </div>

      <div class="filters-section">
        <h4 class="filters-title">Références</h4>
        <div class="filters-grid">
          @for (reference of references; track reference.value) {
            <mat-chip 
              [class.selected]="reference.selected"
              (click)="toggleReference(reference)"
              class="filter-chip">
              {{ reference.label }}
            </mat-chip>
          }
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard-filters.component.scss']
})
export class DashboardFiltersComponent {
  @Input() months: FilterOption[] = [];
  @Input() categories: FilterOption[] = [];
  @Input() references: FilterOption[] = [];
  
  @Output() filtersChanged = new EventEmitter<{
    months: FilterOption[];
    categories: FilterOption[];
    references: FilterOption[];
  }>();

  toggleMonth(month: FilterOption) {
    month.selected = !month.selected;
    this.emitFilters();
  }

  toggleCategory(category: FilterOption) {
    category.selected = !category.selected;
    this.emitFilters();
  }

  toggleReference(reference: FilterOption) {
    reference.selected = !reference.selected;
    this.emitFilters();
  }

  private emitFilters() {
    this.filtersChanged.emit({
      months: this.months,
      categories: this.categories,
      references: this.references
    });
  }
}
