import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeImagePipe } from '../../pipes/safe-image.pipe';
import { ImageFallbackDirective } from '../../directives/image-fallback.directive';

@Component({
  selector: 'app-smart-image',
  standalone: true,
  imports: [CommonModule, SafeImagePipe, ImageFallbackDirective],
  template: `
    <img 
      [src]="imageSrc | safeImage:imageType" 
      [alt]="alt"
      [class]="imageClass"
      [style.width]="width"
      [style.height]="height"
      [style.object-fit]="objectFit"
      appImageFallback
      [fallbackType]="imageType"
      (error)="onImageError()"
      (load)="onImageLoad()"
    />
  `,
  styles: [`
    img {
      display: block;
      max-width: 100%;
      transition: opacity 0.3s ease;
    }
    
    img.loading {
      opacity: 0.5;
    }
    
    img.error {
      opacity: 0.7;
    }
  `]
})
export class SmartImageComponent implements OnInit {
  @Input() src: string | null | undefined = '';
  @Input() alt: string = 'Image';
  @Input() imageType: 'product' | 'avatar' | 'store' | 'category' = 'product';
  @Input() imageClass: string = '';
  @Input() width?: string;
  @Input() height?: string;
  @Input() objectFit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down' = 'cover';
  @Input() lazy: boolean = true;

  imageSrc: string | null | undefined = '';
  isLoading = true;
  hasError = false;

  ngOnInit(): void {
    this.imageSrc = this.src;
  }

  onImageLoad(): void {
    this.isLoading = false;
    this.hasError = false;
  }

  onImageError(): void {
    this.isLoading = false;
    this.hasError = true;
  }
}
