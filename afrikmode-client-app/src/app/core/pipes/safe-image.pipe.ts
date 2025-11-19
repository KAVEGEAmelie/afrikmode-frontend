import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
  name: 'safeImage',
  standalone: true
})
export class SafeImagePipe implements PipeTransform {
  private defaultImages = {
    product: '/assets/images/products/placeholder.jpg',
    avatar: '/assets/images/avatar-placeholder.png',
    store: '/assets/images/store-placeholder.jpg',
    category: '/assets/images/category-placeholder.jpg'
  };

  transform(
    value: string | null | undefined, 
    type: 'product' | 'avatar' | 'store' | 'category' = 'product',
    fallback?: string
  ): string {
    // Si une valeur est fournie
    if (value && value.trim() !== '') {
      // Si c'est déjà une URL complète
      if (value.startsWith('http://') || value.startsWith('https://')) {
        return value;
      }
      
      // Si c'est un chemin relatif commençant par /
      if (value.startsWith('/')) {
        return value;
      }
      
      // Si c'est un chemin assets
      if (value.startsWith('assets/')) {
        return '/' + value;
      }
      
      // Si c'est juste un nom de fichier, construire l'URL avec le backend
      if (!value.includes('/')) {
        return `${environment.apiUrl}/uploads/${value}`;
      }
      
      // Sinon, ajouter le préfixe du serveur backend si configuré
      if (environment.uploadsUrl) {
        return `${environment.uploadsUrl}/${value}`;
      }
      
      return value;
    }
    
    // Utiliser le fallback fourni ou l'image par défaut du type
    return fallback || this.defaultImages[type];
  }
}
