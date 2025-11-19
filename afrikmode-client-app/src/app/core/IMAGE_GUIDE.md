# 🖼️ Gestion des Images - Guide d'Utilisation

Ce système assure un affichage cohérent et fiable des images dans toute l'application avec gestion automatique des erreurs et fallbacks.

## 🎯 Composants Disponibles

### 1. **SafeImagePipe** (Recommandé)
Pipe Angular pour transformer les URLs d'images avec fallback automatique.

```html
<!-- Image de produit -->
<img [src]="product.image | safeImage:'product'" alt="Product">

<!-- Avatar utilisateur -->
<img [src]="user.avatar | safeImage:'avatar'" alt="Avatar">

<!-- Logo de boutique -->
<img [src]="store.logo | safeImage:'store'" alt="Store">
```

**Types disponibles:** `'product'` | `'avatar'` | `'store'` | `'category'`

### 2. **ImageFallbackDirective**
Directive pour gérer automatiquement les erreurs de chargement.

```html
<img 
  [src]="imageSrc" 
  appImageFallback
  [fallbackType]="'product'"
  alt="Image">
```

### 3. **SmartImageComponent** (Le plus complet)
Composant réutilisable avec toutes les fonctionnalités intégrées.

```html
<app-smart-image
  [src]="product.image"
  [imageType]="'product'"
  [alt]="product.name"
  [width]="'300px'"
  [height]="'300px'"
  [objectFit]="'cover'"
  [lazy]="true">
</app-smart-image>
```

### 4. **ImageService**
Service pour manipulation programmatique des images.

```typescript
constructor(private imageService: ImageService) {}

// Obtenir l'URL complète
const imageUrl = this.imageService.getImageUrl(product.image, 'product');

// Image par défaut
const defaultImg = this.imageService.getDefaultImage('avatar');

// Redimensionner une image
const resized = await this.imageService.resizeImage(file, 800, 600);

// Convertir en Data URL
const dataUrl = await this.imageService.fileToDataUrl(file);
```

## 📝 Import dans les Composants

### Composant Standalone

```typescript
import { SafeImagePipe } from '@core/pipes/safe-image.pipe';
import { ImageFallbackDirective } from '@core/directives/image-fallback.directive';
import { SmartImageComponent } from '@core/components/smart-image/smart-image.component';

@Component({
  standalone: true,
  imports: [
    SafeImagePipe,
    ImageFallbackDirective,
    SmartImageComponent
  ]
})
```

### Utilisation du Service

```typescript
import { ImageService } from '@core/services/image.service';

constructor(private imageService: ImageService) {}
```

## 🎨 Images Par Défaut

Les images de fallback sont automatiquement utilisées :

- **Produit:** `/assets/images/products/placeholder.jpg`
- **Avatar:** `/assets/images/avatar-placeholder.png`
- **Boutique:** `/assets/images/store-placeholder.jpg`
- **Catégorie:** `/assets/images/category-placeholder.jpg`

## 🔧 Configuration

Le système utilise `environment.ts` pour les URLs :

```typescript
export const environment = {
  apiUrl: 'http://localhost:3001/api',
  uploadsUrl: 'http://localhost:3001/uploads', // URL des fichiers
};
```

## ✨ Exemples d'Usage

### Galerie de Produits

```html
<div class="product-grid">
  @for (product of products; track product.id) {
    <div class="product-card">
      <app-smart-image
        [src]="product.primaryImage"
        [imageType]="'product'"
        [alt]="product.name"
        [width]="'100%'"
        [height]="'250px'"
        objectFit="cover">
      </app-smart-image>
    </div>
  }
</div>
```

### Liste d'Utilisateurs avec Avatars

```html
@for (user of users; track user.id) {
  <div class="user-item">
    <img 
      [src]="user.avatar | safeImage:'avatar'" 
      appImageFallback
      [fallbackType]="'avatar'"
      alt="{{ user.name }}"
      class="avatar">
    <span>{{ user.name }}</span>
  </div>
}
```

### Upload avec Prévisualisation

```typescript
async onFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    // Convertir en Data URL pour prévisualisation
    this.preview = await this.imageService.fileToDataUrl(file);
    
    // Redimensionner avant upload
    const resized = await this.imageService.resizeImage(file, 1200, 1200);
    
    // Upload...
  }
}
```

## 🚀 Bonnes Pratiques

1. **Toujours utiliser SafeImagePipe** pour les images dynamiques
2. **Spécifier le type d'image** approprié pour un fallback cohérent
3. **Ajouter des alt tags** descriptifs pour l'accessibilité
4. **Utiliser objectFit** pour contrôler le dimensionnement
5. **Activer lazy loading** pour les grandes listes

## 🐛 Résolution de Problèmes

### Image ne s'affiche pas
✅ Vérifier que `uploadsUrl` est configuré dans `environment.ts`
✅ Vérifier les permissions CORS du backend
✅ Vérifier le chemin de l'image dans la console

### Fallback ne fonctionne pas
✅ Vérifier que les images placeholder existent dans `/assets/images/`
✅ Importer `ImageFallbackDirective` dans le composant

### Images floues ou mal dimensionnées
✅ Utiliser `objectFit="cover"` ou `"contain"`
✅ Définir width/height explicites
✅ Redimensionner les images avant upload avec `ImageService`
