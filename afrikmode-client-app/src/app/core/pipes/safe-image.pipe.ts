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
    category: '/assets/images/products/placeholder.jpg'
  };

  transform(
    value: string | null | undefined, 
    type: 'product' | 'avatar' | 'store' | 'category' = 'product',
    fallback?: string
  ): string {
    // Si une valeur est fournie
    if (value && value.trim() !== '') {
      // Si c'est déjà une URL complète (http:// ou https://)
      if (value.startsWith('http://') || value.startsWith('https://')) {
        return value;
      }
      
      // Si c'est un data URL
      if (value.startsWith('data:')) {
        return value;
      }
      
      // Si c'est un chemin assets
      if (value.startsWith('assets/') || value.startsWith('/assets/')) {
        return value.startsWith('/') ? value : '/' + value;
      }
      
      // Si le chemin commence par /uploads, construire l'URL complète
      if (value.startsWith('/uploads')) {
        return `${environment.apiUrl}${value}`;
      }
      
      // Si le chemin contient uploads/ (sans / au début)
      if (value.includes('uploads/')) {
        const cleanPath = value.startsWith('/') ? value : `/${value}`;
        return `${environment.apiUrl}${cleanPath}`;
      }
      
      // Si c'est juste un nom de fichier (sans /), construire l'URL avec le backend
      if (!value.includes('/')) {
        // Déterminer le dossier selon le type
        let uploadPath = 'products';
        if (type === 'avatar') uploadPath = 'users';
        else if (type === 'store') uploadPath = 'stores';
        else if (type === 'category') uploadPath = 'categories';
        
        return `${environment.uploadsUrl || environment.apiUrl}/uploads/${uploadPath}/${value}`;
      }
      
      // Si environment.uploadsUrl est configuré, l'utiliser
      if (environment.uploadsUrl) {
        const cleanPath = value.startsWith('/') ? value.substring(1) : value;
        return `${environment.uploadsUrl}/${cleanPath}`;
      }
      
      // Par défaut, essayer avec l'API URL
      const cleanPath = value.startsWith('/') ? value.substring(1) : value;
      return `${environment.apiUrl}/${cleanPath}`;
    }
    
    // Utiliser le fallback fourni ou l'image par défaut du type
    return fallback || this.defaultImages[type];
  }
}
