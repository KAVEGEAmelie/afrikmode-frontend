import { Directive, Input, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: 'img[appImageFallback]',
  standalone: true
})
export class ImageFallbackDirective {
  @Input() appImageFallback: string = '/assets/images/products/placeholder.jpg';
  @Input() fallbackType: 'product' | 'avatar' | 'store' = 'product';
  
  private hasError = false;

  private fallbacks = {
    product: '/assets/images/products/placeholder.jpg',
    avatar: '/assets/images/avatar-placeholder.png',
    store: '/assets/images/store-placeholder.jpg'
  };

  constructor(private el: ElementRef<HTMLImageElement>) {}

  @HostListener('error')
  onError(): void {
    if (!this.hasError) {
      this.hasError = true;
      const fallbackSrc = this.appImageFallback || this.fallbacks[this.fallbackType];
      this.el.nativeElement.src = fallbackSrc;
    }
  }

  @HostListener('load')
  onLoad(): void {
    this.hasError = false;
  }
}
