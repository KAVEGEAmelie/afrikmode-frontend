import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private defaultImages = {
    product: '/assets/images/products/placeholder.jpg',
    avatar: '/assets/images/avatar-placeholder.png',
    store: '/assets/images/store-placeholder.jpg',
    category: '/assets/images/category-placeholder.jpg'
  };

  /**
   * Construit l'URL complète d'une image
   * @param imagePath Chemin de l'image (peut être relatif ou absolu)
   * @param type Type d'image pour le fallback
   * @returns URL complète de l'image ou image par défaut
   */
  getImageUrl(
    imagePath: string | null | undefined,
    type: 'product' | 'avatar' | 'store' | 'category' = 'product'
  ): string {
    // Si pas d'image fournie, retourner l'image par défaut
    if (!imagePath || imagePath.trim() === '') {
      return this.defaultImages[type];
    }

    // Si c'est déjà une URL complète (http:// ou https://)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Si c'est un chemin assets
    if (imagePath.startsWith('assets/') || imagePath.startsWith('/assets/')) {
      return imagePath.startsWith('/') ? imagePath : '/' + imagePath;
    }

    // Si c'est un data URL
    if (imagePath.startsWith('data:')) {
      return imagePath;
    }

    // Si c'est juste un nom de fichier (sans /)
    if (!imagePath.includes('/')) {
      return `${environment.apiUrl}/uploads/${imagePath}`;
    }

    // Si c'est un chemin relatif, construire l'URL avec le serveur backend
    if (environment.uploadsUrl) {
      // Enlever le / au début si présent
      const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
      return `${environment.uploadsUrl}/${cleanPath}`;
    }

    // Par défaut, essayer avec l'API URL
    return `${environment.apiUrl}/${imagePath}`;
  }

  /**
   * Obtient l'image par défaut pour un type donné
   */
  getDefaultImage(type: 'product' | 'avatar' | 'store' | 'category' = 'product'): string {
    return this.defaultImages[type];
  }

  /**
   * Vérifie si une URL d'image est valide
   */
  async isImageValid(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  /**
   * Convertit un fichier en Data URL
   */
  fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Redimensionne une image
   */
  async resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = height * (maxWidth / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = width * (maxHeight / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to resize image'));
            }
          }, file.type);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
