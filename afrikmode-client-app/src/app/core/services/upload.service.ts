// src/app/core/services/upload.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpEvent, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { map } from 'rxjs/operators';

export interface UploadProgress {
  percentage: number;
  loaded: number;
  total: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  size?: number;
  mime_type?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('auth_token');
    let headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * Upload un fichier unique
   */
  uploadFile(
    file: File,
    endpoint: string = '/upload',
    additionalData?: { [key: string]: any }
  ): Observable<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http.post<UploadResult>(`${this.baseUrl}${endpoint}`, formData, {
      headers: this.getHeaders()
    });
  }

  /**
   * Upload un fichier avec suivi de progression
   */
  uploadFileWithProgress(
    file: File,
    endpoint: string = '/upload',
    additionalData?: { [key: string]: any }
  ): Observable<UploadProgress | UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http.post<UploadResult>(`${this.baseUrl}${endpoint}`, formData, {
      headers: this.getHeaders(),
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const progressEvent = event as HttpProgressEvent;
          const percentage = progressEvent.total 
            ? Math.round((100 * progressEvent.loaded) / progressEvent.total)
            : 0;
          
          return {
            percentage,
            loaded: progressEvent.loaded,
            total: progressEvent.total || 0
          } as UploadProgress;
        } else if (event.type === HttpEventType.Response) {
          return event.body as UploadResult;
        }
        return { percentage: 0, loaded: 0, total: 0 } as UploadProgress;
      })
    );
  }

  /**
   * Upload plusieurs fichiers
   */
  uploadMultipleFiles(
    files: File[],
    endpoint: string = '/upload/multiple',
    additionalData?: { [key: string]: any }
  ): Observable<UploadResult[]> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append('files', file);
    });

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http.post<UploadResult[]>(`${this.baseUrl}${endpoint}`, formData, {
      headers: this.getHeaders()
    });
  }

  /**
   * Upload une image
   */
  uploadImage(file: File): Observable<UploadResult> {
    return this.uploadFile(file, '/upload/image');
  }

  /**
   * Upload un avatar
   */
  uploadAvatar(file: File): Observable<UploadResult> {
    return this.uploadFile(file, '/users/avatar');
  }

  /**
   * Upload une image de produit
   */
  uploadProductImage(file: File, productId: string): Observable<UploadResult> {
    return this.uploadFile(file, `/products/${productId}/images`);
  }

  /**
   * Upload un document
   */
  uploadDocument(file: File): Observable<UploadResult> {
    return this.uploadFile(file, '/upload/document');
  }

  /**
   * Supprimer un fichier
   */
  deleteFile(fileUrl: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/upload/delete`, {
      headers: this.getHeaders(),
      body: { url: fileUrl }
    });
  }

  /**
   * Valider un fichier avant upload
   */
  validateFile(file: File, options?: {
    maxSize?: number; // en bytes
    allowedTypes?: string[];
  }): { valid: boolean; error?: string } {
    const maxSize = options?.maxSize || 10 * 1024 * 1024; // 10MB par défaut
    const allowedTypes = options?.allowedTypes || [];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Le fichier est trop volumineux. Taille maximum: ${maxSize / (1024 * 1024)}MB`
      };
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Valider une image
   */
  validateImage(file: File): { valid: boolean; error?: string } {
    return this.validateFile(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    });
  }

  /**
   * Redimensionner une image avant upload (côté client)
   */
  resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
              if (blob) {
                const resizedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now()
                });
                resolve(resizedFile);
              } else {
                reject(new Error('Erreur lors du redimensionnement'));
              }
            }, file.type);
          } else {
            reject(new Error('Canvas context non disponible'));
          }
        };

        img.onerror = () => reject(new Error('Erreur de chargement de l\'image'));
        img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
      reader.readAsDataURL(file);
    });
  }
}