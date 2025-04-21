import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';

/**
 * LazyLoadDirective
 * 
 * A directive for lazy loading images in a carousel component.
 * Uses Intersection Observer API to detect when images enter the viewport.
 */
@Directive({
  selector: '[carouselLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  @Input() carouselLazyLoad: string = '';
  @Input() errorImage: string = 'assets/images/no-image.png';
  
  private observer: IntersectionObserver | undefined;
  private isLoaded = false;
  
  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}
  
  /**
   * Initialize the directive and set up the Intersection Observer
   */
  ngOnInit(): void {
    // Skip if already loaded or no image URL provided
    if (this.isLoaded || !this.carouselLazyLoad) {
      return;
    }
    
    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage();
            this.observer?.unobserve(this.el.nativeElement);
          }
        });
      });
      
      this.observer.observe(this.el.nativeElement);
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      this.loadImage();
    }
  }
  
  /**
   * Clean up the observer when directive is destroyed
   */
  ngOnDestroy(): void {
    // Clean up the observer when directive is destroyed
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }
  
  /**
   * Load the image by setting the src attribute
   */
  private loadImage(): void {
    this.isLoaded = true;
    
    const element = this.el.nativeElement;
    const isImgElement = element.tagName === 'IMG';
    
    if (isImgElement) {
      // Handle <img> elements
      this.renderer.setAttribute(element, 'src', this.carouselLazyLoad);
      
      // Handle errors
      const errorHandler = () => {
        this.renderer.setAttribute(element, 'src', this.errorImage);
        const unlistenFn = this.renderer.listen(element, 'error', errorHandler);
        unlistenFn();
      };
      
      this.renderer.listen(element, 'error', errorHandler);
    } else {
      // Handle non-image elements with background image
      this.renderer.setStyle(
        element,
        'background-image',
        `url('${this.carouselLazyLoad}')`
      );
    }
  }
}