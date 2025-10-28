import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: 'img[appLazyLoad]',
  standalone: true
})
export class LazyLoadImageDirective implements OnInit {
  @Input() appLazyLoad: string = '';
  @Input() defaultImage: string = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E';

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    // Définir l'image par défaut immédiatement
    this.renderer.setAttribute(this.el.nativeElement, 'src', this.defaultImage);
    this.renderer.addClass(this.el.nativeElement, 'lazy-loading');

    // Observer l'intersection avec le viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage();
            observer.unobserve(this.el.nativeElement);
          }
        });
      },
      {
        rootMargin: '50px' // Commencer à charger 50px avant d'entrer dans le viewport
      }
    );

    observer.observe(this.el.nativeElement);
  }

  private loadImage() {
    const img = new Image();
    img.onload = () => {
      this.renderer.setAttribute(this.el.nativeElement, 'src', this.appLazyLoad);
      this.renderer.removeClass(this.el.nativeElement, 'lazy-loading');
      this.renderer.addClass(this.el.nativeElement, 'lazy-loaded');
    };
    img.onerror = () => {
      // En cas d'erreur, garder l'image par défaut
      this.renderer.removeClass(this.el.nativeElement, 'lazy-loading');
      this.renderer.addClass(this.el.nativeElement, 'lazy-error');
    };
    img.src = this.appLazyLoad;
  }
}
