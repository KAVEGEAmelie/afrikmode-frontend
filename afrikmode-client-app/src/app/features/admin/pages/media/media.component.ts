// src/app/features/admin/pages/media/media.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { AdminService } from '../../../../core/services/admin.service';
import { ToastService } from '../../../../core/services/toast.service';

/**
 * Interface for media item
 */
interface MediaItem {
  id: string;
  filename: string;
  original_filename: string;
  mimetype: string;
  size: number;
  url: string;
  thumbnail_url?: string;
  title?: string;
  alt_text?: string;
  uploaded_at: string;
}

/**
 * Interface for media stats
 */
interface MediaStats {
  total_files: number;
  total_size: number;
  by_type: {
    images: number;
    documents: number;
    videos: number;
    others: number;
  };
}

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatDialogModule,
    MatMenuModule
  ],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">
            <mat-icon>perm_media</mat-icon>
            Bibliothèque Media
          </h1>
          <p class="page-subtitle">Gérez vos images et fichiers</p>
          <mat-chip-set *ngIf="stats">
            <mat-chip highlighted>{{ stats.total_files }} fichiers</mat-chip>
            <mat-chip>{{ formatFileSize(stats.total_size) }}</mat-chip>
          </mat-chip-set>
        </div>
        <button mat-raised-button color="primary" (click)="fileInput.click()" [disabled]="isUploading">
          <mat-spinner *ngIf="isUploading" diameter="20"></mat-spinner>
          <mat-icon *ngIf="!isUploading">cloud_upload</mat-icon>
          <span *ngIf="!isUploading">Téléverser</span>
          <span *ngIf="isUploading">Upload...</span>
        </button>
        <input
          #fileInput
          type="file"
          multiple
          accept="image/*"
          style="display: none"
          (change)="onFilesSelected($event)">
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Rechercher</mat-label>
            <input matInput [formControl]="searchControl" placeholder="Nom du fichier...">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Type de fichier</mat-label>
            <mat-select [formControl]="typeControl">
              <mat-option value="">Tous</mat-option>
              <mat-option value="image">Images</mat-option>
              <mat-option value="document">Documents</mat-option>
              <mat-option value="video">Vidéos</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Chargement des médias...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && mediaList.length === 0" class="empty-state">
        <mat-icon>photo_library</mat-icon>
        <h3>Aucun média</h3>
        <p>Commencez par téléverser vos premiers fichiers</p>
        <button mat-raised-button color="primary" (click)="fileInput.click()">
          <mat-icon>cloud_upload</mat-icon>
          Téléverser des fichiers
        </button>
      </div>

      <!-- Media Grid -->
      <div *ngIf="!isLoading && mediaList.length > 0" class="media-grid">
        <mat-card class="media-item" *ngFor="let media of mediaList">
          <div class="media-thumbnail" [class.has-image]="isImage(media.mimetype)">
            <img *ngIf="isImage(media.mimetype)" [src]="media.thumbnail_url || media.url" [alt]="media.alt_text || media.original_filename">
            <mat-icon *ngIf="!isImage(media.mimetype)">{{ getFileIcon(media.mimetype) }}</mat-icon>
          </div>

          <div class="media-info">
            <p class="media-name" [title]="media.original_filename">{{ truncateFilename(media.original_filename) }}</p>
            <p class="media-size">{{ formatFileSize(media.size) }}</p>
          </div>

          <div class="media-actions">
            <button mat-icon-button [matMenuTriggerFor]="menu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="viewMedia(media)">
                <mat-icon>visibility</mat-icon>
                <span>Voir</span>
              </button>
              <button mat-menu-item (click)="copyUrl(media.url)">
                <mat-icon>link</mat-icon>
                <span>Copier l'URL</span>
              </button>
              <button mat-menu-item (click)="deleteMedia(media)" class="delete-action">
                <mat-icon>delete</mat-icon>
                <span>Supprimer</span>
              </button>
            </mat-menu>
          </div>
        </mat-card>
      </div>

      <!-- Pagination -->
      <mat-card *ngIf="!isLoading && totalItems > 0" class="pagination-card">
        <mat-paginator
          [length]="totalItems"
          [pageSize]="pageSize"
          [pageIndex]="currentPage - 1"
          [pageSizeOptions]="[12, 24, 48, 96]"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-page { padding: 24px; background: #f8f9fa; min-height: 100%; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .header-left { flex: 1; }
    .page-title { display: flex; align-items: center; gap: 12px; margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #1e293b; }
    .page-title mat-icon { font-size: 36px; width: 36px; height: 36px; color: #3b82f6; }
    .page-subtitle { margin: 0 0 12px 0; color: #64748b; font-size: 16px; }
    .page-header button { height: 48px; padding: 0 32px; font-weight: 600; }
    .page-header button mat-spinner { display: inline-block; margin-right: 8px; }
    .page-header button mat-icon { margin-right: 8px; }

    .filters-card { padding: 24px; margin-bottom: 24px; border-radius: 12px; }
    .filters-row { display: flex; gap: 16px; align-items: center; }
    .search-field { flex: 1; }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      gap: 20px;
    }
    .loading-container p { color: #64748b; font-size: 16px; }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      text-align: center;
    }
    .empty-state mat-icon {
      font-size: 120px;
      width: 120px;
      height: 120px;
      color: #cbd5e1;
      margin-bottom: 24px;
    }
    .empty-state h3 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #1e293b;
    }
    .empty-state p {
      margin: 0 0 24px 0;
      color: #64748b;
      font-size: 16px;
    }
    .empty-state button mat-icon { margin-right: 8px; }

    .media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .media-item {
      padding: 16px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }
    .media-item:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }

    .media-thumbnail {
      width: 100%;
      height: 150px;
      background: #f1f5f9;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      overflow: hidden;
    }
    .media-thumbnail.has-image { padding: 0; }
    .media-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .media-thumbnail mat-icon { font-size: 48px; width: 48px; height: 48px; color: #94a3b8; }

    .media-info { flex: 1; min-width: 0; }
    .media-info p { margin: 0; }
    .media-name {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .media-size { font-size: 12px; color: #64748b; margin-top: 4px; }

    .media-actions {
      position: absolute;
      top: 8px;
      right: 8px;
    }
    .media-actions button {
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .delete-action { color: #ef4444; }
    .delete-action mat-icon { color: #ef4444; }

    .pagination-card { padding: 16px; border-radius: 12px; }
  `]
})
export class MediaComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  mediaList: MediaItem[] = [];
  stats: MediaStats | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 24;
  totalItems = 0;

  // Filters
  searchControl = new FormControl('');
  typeControl = new FormControl('');

  // Loading states
  isLoading = false;
  isUploading = false;

  constructor(
    private adminService: AdminService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadMediaStats();
    this.loadMedia();
    this.setupFilters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Setup filter controls with debounce
   */
  private setupFilters(): void {
    // Search filter
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadMedia();
      });

    // Type filter
    this.typeControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadMedia();
      });
  }

  /**
   * Load media stats
   */
  loadMediaStats(): void {
    this.adminService.getMediaStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.stats = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading media stats:', error);
        }
      });
  }

  /**
   * Load media list with pagination and filters
   */
  loadMedia(): void {
    this.isLoading = true;

    const params: any = {
      page: this.currentPage,
      limit: this.pageSize
    };

    if (this.searchControl.value) {
      params.search = this.searchControl.value;
    }

    if (this.typeControl.value) {
      params.type = this.typeControl.value;
    }

    this.adminService.getMediaList(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.mediaList = response.data;
            this.totalItems = response.pagination?.total || 0;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading media:', error);
          this.toastService.error('Erreur lors du chargement des médias');
          this.isLoading = false;
        }
      });
  }

  /**
   * Handle file selection for upload
   */
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const files = Array.from(input.files);
    this.uploadFiles(files);

    // Reset input
    input.value = '';
  }

  /**
   * Upload multiple files
   */
  private uploadFiles(files: File[]): void {
    if (files.length === 0) return;

    this.isUploading = true;
    let uploadedCount = 0;
    let errorCount = 0;

    files.forEach((file, index) => {
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        this.toastService.error(`${file.name}: Fichier trop volumineux (max 10MB)`);
        errorCount++;
        if (index === files.length - 1) {
          this.finishUpload(uploadedCount, errorCount);
        }
        return;
      }

      this.adminService.uploadMedia(file, { title: file.name })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              uploadedCount++;
            } else {
              errorCount++;
            }

            // Check if this is the last file
            if (index === files.length - 1) {
              this.finishUpload(uploadedCount, errorCount);
            }
          },
          error: (error) => {
            console.error(`Error uploading ${file.name}:`, error);
            errorCount++;

            if (index === files.length - 1) {
              this.finishUpload(uploadedCount, errorCount);
            }
          }
        });
    });
  }

  /**
   * Finish upload process and show summary
   */
  private finishUpload(successCount: number, errorCount: number): void {
    this.isUploading = false;

    if (successCount > 0) {
      this.toastService.success(`${successCount} fichier(s) uploadé(s) avec succès`);
      this.loadMedia();
      this.loadMediaStats();
    }

    if (errorCount > 0) {
      this.toastService.error(`${errorCount} fichier(s) n'ont pas pu être uploadés`);
    }
  }

  /**
   * Delete media item
   */
  deleteMedia(media: MediaItem): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${media.original_filename}" ?`)) {
      return;
    }

    this.adminService.deleteMedia(media.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.success('Média supprimé avec succès');
            this.loadMedia();
            this.loadMediaStats();
          } else {
            this.toastService.error('Erreur lors de la suppression');
          }
        },
        error: (error) => {
          console.error('Error deleting media:', error);
          this.toastService.error('Erreur lors de la suppression du média');
        }
      });
  }

  /**
   * View media in new tab
   */
  viewMedia(media: MediaItem): void {
    window.open(media.url, '_blank');
  }

  /**
   * Copy media URL to clipboard
   */
  copyUrl(url: string): void {
    navigator.clipboard.writeText(url).then(() => {
      this.toastService.success('URL copiée dans le presse-papiers');
    }).catch(() => {
      this.toastService.error('Erreur lors de la copie de l\'URL');
    });
  }

  /**
   * Handle page change
   */
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadMedia();
  }

  /**
   * Check if mimetype is an image
   */
  isImage(mimetype: string): boolean {
    return mimetype.startsWith('image/');
  }

  /**
   * Get appropriate icon for file type
   */
  getFileIcon(mimetype: string): string {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'videocam';
    if (mimetype.includes('pdf')) return 'picture_as_pdf';
    if (mimetype.includes('document') || mimetype.includes('word')) return 'description';
    if (mimetype.includes('spreadsheet') || mimetype.includes('excel')) return 'table_chart';
    return 'insert_drive_file';
  }

  /**
   * Format file size to human-readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Truncate filename if too long
   */
  truncateFilename(filename: string, maxLength: number = 30): string {
    if (filename.length <= maxLength) return filename;

    const extension = filename.substring(filename.lastIndexOf('.'));
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 3);

    return `${truncatedName}...${extension}`;
  }
}
