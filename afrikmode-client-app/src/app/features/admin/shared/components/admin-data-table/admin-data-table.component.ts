// src/app/features/admin/shared/components/admin-data-table/admin-data-table.component.ts

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'status' | 'date' | 'badge' | 'action' | 'checkbox';
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
}

export interface TableAction {
  label: string;
  icon?: string;
  color?: 'primary' | 'accent' | 'warn';
  action: (row: any) => void;
  visible?: (row: any) => boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages?: number;
}

@Component({
  standalone: true,
  selector: 'app-admin-data-table',
  templateUrl: './admin-data-table.component.html',
  styleUrls: ['./admin-data-table.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    NgIf,
    NgFor
  ]
})
export class AdminDataTableComponent implements OnInit {
  // Exposer Math pour le template
  protected readonly Math = Math;
  
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() loading: boolean = false;
  @Input() selectable: boolean = false;
  @Input() actions: TableAction[] = [];
  @Input() searchable: boolean = true;
  @Input() pagination: Pagination | null = null;
  @Input() paginated: boolean = true;
  @Input() pageSize: number = 10;
  @Input() emptyMessage: string = 'Aucune donnée disponible';
  @Input() exportable: boolean = false;

  @Output() rowSelect = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() sortChange = new EventEmitter<{column: string, direction: 'asc' | 'desc'}>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() exportData = new EventEmitter<void>();

  displayedColumns: string[] = [];
  selectedRows: Set<any> = new Set();
  filteredData: any[] = [];
  paginatedData: any[] = [];
  searchTerm: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage: number = 1;
  totalPages: number = 1;

  ngOnInit() {
    this.initializeTable();
  }

  ngOnChanges() {
    this.initializeTable();
  }

  private initializeTable() {
    this.displayedColumns = [];
    
    if (this.selectable) {
      this.displayedColumns.push('select');
    }
    
    this.displayedColumns.push(...this.columns.map(col => col.key));
    
    if (this.actions.length > 0) {
      this.displayedColumns.push('actions');
    }

    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.data];

    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter(row => 
        this.columns.some(col => 
          String(row[col.key] || '').toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      );
    }

    // Apply sort
    if (this.sortColumn) {
      filtered.sort((a, b) => {
        const aVal = a[this.sortColumn];
        const bVal = b[this.sortColumn];
        
        if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    this.filteredData = filtered;
    this.updatePagination();
  }

  updatePagination() {
    if (this.paginated) {
      this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.paginatedData = this.filteredData.slice(start, end);
    } else {
      this.paginatedData = this.filteredData;
    }
  }

  onSort(column: TableColumn) {
    if (!column.sortable) return;

    if (this.sortColumn === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }

    this.applyFilters();
    this.sortChange.emit({ column: this.sortColumn, direction: this.sortDirection });
  }

  onSearch() {
    this.currentPage = 1;
    this.applyFilters();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  isAllSelected(): boolean {
    return this.paginatedData.length > 0 && 
           this.paginatedData.every(row => this.selectedRows.has(row));
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.paginatedData.forEach(row => this.selectedRows.delete(row));
    } else {
      this.paginatedData.forEach(row => this.selectedRows.add(row));
    }
    this.selectionChange.emit(Array.from(this.selectedRows));
  }

  toggleRow(row: any) {
    if (this.selectedRows.has(row)) {
      this.selectedRows.delete(row);
    } else {
      this.selectedRows.add(row);
    }
    this.selectionChange.emit(Array.from(this.selectedRows));
  }

  isRowSelected(row: any): boolean {
    return this.selectedRows.has(row);
  }

  onRowClick(row: any) {
    this.rowSelect.emit(row);
  }

  onSelectRow(row: any, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedRows.add(row);
    } else {
      this.selectedRows.delete(row);
    }
    this.selectionChange.emit(Array.from(this.selectedRows));
  }

  formatCellValue(row: any, column: TableColumn): string {
    const value = row[column.key];
    
    if (column.format) {
      return column.format(value);
    }
    
    switch (column.type) {
      case 'date':
        return value ? new Date(value).toLocaleDateString('fr-FR') : '';
      case 'number':
        return typeof value === 'number' ? value.toLocaleString('fr-FR') : '';
      default:
        return String(value || '');
    }
  }

  executeAction(action: TableAction, row: any) {
    action.action(row);
  }

  isActionVisible(action: TableAction, row: any): boolean {
    return !action.visible || action.visible(row);
  }

  getPaginationArray(): number[] {
    return Array.from({length: this.totalPages}, (_, i) => i + 1);
  }
}
