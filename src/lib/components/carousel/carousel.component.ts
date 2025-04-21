import {
  Component,
  Input,
  ContentChild,
  TemplateRef,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
  OnInit,
  NgZone,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { CarouselConfig, ScrollSize } from '../../interfaces/carousel-config.interface';
import { CarouselService, CAROUSEL_DEFAULTS } from '../../services/carousel.service';
import { createTranslation } from '../../utils/animation';

@Component({
  selector: 'carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  providers: [CarouselService]
})
export class CarouselComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly ngZone: NgZone = inject(NgZone);
  private readonly carouselService: CarouselService = inject(CarouselService);

  @Input() slides: any[] = [];
  @Input() configs: CarouselConfig = {};

  /**
   * Template for rendering carousel slides & empty state
   */
  @ContentChild('carouselItem') itemTemplate!: TemplateRef<any>;
  @ContentChild('emptyState') emptyStateTemplate!: TemplateRef<any>;

  /**
   * Reference to the carousel track element & wrapper element
   */
  @ViewChild('track') trackElement!: ElementRef<HTMLElement>;
  @ViewChild('wrapper') wrapperElement!: ElementRef<HTMLElement>;

  // Private state variables
  private currentTranslate = 0;
  currentIndex = 0;
  private destroy$ = new Subject<void>();
  private autoplayInterval?: ReturnType<typeof setInterval>;
  private itemWidths: number[] = [];
  private itemHeights: number[] = [];
  private containerWidth = 0;
  private containerHeight = 0;
  private intersectionObserver: IntersectionObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private visibilityChangeTimeout: any = null;
  private initialized = false;

  // Scroll size definitions
  private readonly scrollSizeMap = {
    xs: 50,
    sm: 100,
    md: 150,
    lg: 200,
    xl: 250,
    '2xl': 300,
    '3xl': 350,
    '4xl': 400,
    '5xl': 450,
    '6xl': 500,
    '7xl': 550,
    '8xl': 600,
    '9xl': 650,
    '10xl': 700,
    full: 1,
  };

  showPrevButton = false;
  showNextButton = false;
  filteredItems: any[] = [];
  emptyStateText = 'No items found';
  emptyStateIcon = '📭';
  emptyStateTextColor = '#666';
  showEmptyStateIcon = true;

  ngOnInit(): void {
    this.filteredItems = this.slides || [];
    
    // Initialize navigation button visibility early
    const hasMultipleItems = this.filteredItems.length > 1;
    if (hasMultipleItems) {
      this.showPrevButton = true;
      this.showNextButton = true;
    }
    
    if (this.configs.emptyState) {
      this.emptyStateText = this.configs.emptyState.text || this.emptyStateText;
      this.emptyStateIcon = this.configs.emptyState.icon || this.emptyStateIcon;
      this.emptyStateTextColor = this.configs.emptyState.textColor || this.emptyStateTextColor;
      this.showEmptyStateIcon = this.configs.emptyState.hideIcon ? false : true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['slides']) {
      this.filteredItems = this.slides || [];

      if (this.initialized) {
        setTimeout(() => {
          this.updateContainerDimensions();
          this.calculateItemDimensions();
          this.checkOverflow();
          this.cdr.detectChanges();
        });
      }
    }

    if (changes['configs'] && this.initialized) {
      setTimeout(() => {
        this.updateContainerDimensions();
        this.calculateItemDimensions();
        this.checkOverflow();
        this.setupAutoplay();
        this.cdr.detectChanges();
      });
    }
  }

  private setupAutoplay(): void {
    this.clearAutoplayInterval();

    if (!this.configs.autoplay) return;

    const delay = this.carouselService.parseTimeToMs(this.configs.autoplayDelay || '3000ms');
    
    this.autoplayInterval = setInterval(() => {
      const track = this.trackElement?.nativeElement;
      const wrapper = this.wrapperElement?.nativeElement;

      // Exit if elements not ready
      if (!track || !wrapper) return;

      const max = this.isVertical
        ? track.offsetHeight - wrapper.offsetHeight
        : track.offsetWidth - wrapper.offsetWidth;

      if (this.currentTranslate >= max) {
        if (!this.configs.loop) {
          this.clearAutoplayInterval();
          return;
        }
        
        this.currentTranslate = 0;
        this.currentIndex = 0;
      } else {
        this.next();
      }

      this.cdr.detectChanges();
    }, delay);
  }

  private clearAutoplayInterval(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = undefined;
    }
  }

  ngAfterViewInit(): void {
    // Initialize early to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.ngZone.run(() => {
          this.initializeCarousel();
          this.setupResizeListener();
          this.setupIntersectionObserver();
          this.setupResizeObserver();
          
          this.updateContainerDimensions();
          this.calculateItemDimensions();
          this.checkOverflow();
          this.initialized = true;
          
          // Ensure changes are applied before next change detection cycle
          this.cdr.detectChanges();
          
          // Setup autoplay after initialization to avoid change detection issues
          setTimeout(() => {
            this.setupAutoplay();
          });
    
          // Force another update after layout is complete
          setTimeout(() => {
            this.updateContainerDimensions();
            this.calculateItemDimensions();
            this.checkOverflow();
            this.cdr.detectChanges();
          }, 100);
        });
      });
    });
  }

  ngOnDestroy(): void {
    // Clear any interval timers
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = undefined;
    }

    // Disconnect observers
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Clear any timeouts
    if (this.visibilityChangeTimeout) {
      clearTimeout(this.visibilityChangeTimeout);
      this.visibilityChangeTimeout = null;
    }

    // Complete all observables
    this.destroy$.next();
    this.destroy$.complete();

    // Clear arrays
    this.itemWidths = [];
    this.itemHeights = [];
    this.filteredItems = [];
  }

  get isVertical(): boolean { return this.configs.orientation === 'vertical'; }

  get containerStyles(): Record<string, string> {
    const styles = this.configs.containerStyle || {};

    if (!('width' in styles)) { styles['width'] = this.configs.containerWidth || '100%'; }
    if (!('height' in styles)) { styles['height'] = this.configs.containerHeight || 'auto'; }

    return styles;
  }

  get trackStyles(): Record<string, string> {
    const transform = createTranslation(this.currentTranslate, this.isVertical);
    const base = { transform };

    return this.isVertical ? { ...base, flexDirection: 'column' } : base;
  }

  private initializeCarousel(): void {
    if (!this.trackElement || !this.wrapperElement) return;
    this.currentTranslate = 0;
    this.currentIndex = 0;

    // Initialize navigation buttons
    this.checkOverflow();
  }

  /**
   * Set up window resize listener
   */
  private setupResizeListener(): void {
    fromEvent(window, 'resize')
      .pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateContainerDimensions();
        this.calculateItemDimensions();
        this.checkOverflow();
      });
  }

  /**
   * Set up intersection observer to detect when carousel becomes visible
   */
  private setupIntersectionObserver(): void {
    if ('IntersectionObserver' in window) {
      this.ngZone.runOutsideAngular(() => {
        this.intersectionObserver = new IntersectionObserver(
          (entries) => {
            const isVisible = entries[0]?.isIntersecting;

            if (isVisible && this.initialized) {
              this.ngZone.run(() => {
                this.visibilityChangeTimeout = setTimeout(() => {
                  this.updateContainerDimensions();
                  this.calculateItemDimensions();
                  this.checkOverflow();
                }, 50);
              });
            }
          },
          { threshold: 0.1 }
        );

        if (this.wrapperElement?.nativeElement) {
          this.intersectionObserver.observe(this.wrapperElement.nativeElement);
        }
      });
    }
  }

  /**
   * Set up resize observer to detect when carousel's size changes
   */
  private setupResizeObserver(): void {
    if ('ResizeObserver' in window) {
      this.ngZone.runOutsideAngular(() => {
        this.resizeObserver = new ResizeObserver(() => {
          if (this.initialized) {
            this.ngZone.run(() => {
              this.updateContainerDimensions();
              this.calculateItemDimensions();
              this.checkOverflow();
            });
          }
        });

        if (this.wrapperElement?.nativeElement) {
          this.resizeObserver.observe(this.wrapperElement.nativeElement);
        }
      });
    }
  }

  private updateContainerDimensions(): void {
    if (!this.wrapperElement) return;
    this.containerWidth = this.wrapperElement.nativeElement.offsetWidth;
    this.containerHeight = this.wrapperElement.nativeElement.offsetHeight;
  }

  /**
   * Check if content overflows and update button visibility
   */
  private checkOverflow(): void {
    // Skip check if not yet initialized to avoid change detection errors
    if (!this.initialized && !this.trackElement?.nativeElement) return;

    // Always show navigation in one-item mode with more than one slide
    if (this.filteredItems.length > 1 && this.configs.singleItemMode) {
      // In one-item mode with loop, always show both buttons if we have more than one slide
      if (this.configs.loop) {
        this.showPrevButton = true;
        this.showNextButton = true;
        return;
      }

      // Otherwise, buttons depend on current index
      this.showPrevButton = this.currentIndex > 0;
      this.showNextButton = this.currentIndex < this.filteredItems.length - 1;
      return;
    }

    // First set default visibility based on showNavigation config
    if (!this.showNavigation || this.filteredItems.length <= 1) {
      this.showPrevButton = false;
      this.showNextButton = false;
      return;
    }

    const track = this.trackElement?.nativeElement;
    const wrapper = this.wrapperElement?.nativeElement;
    if (!track || !wrapper) return;

    // Skip if element has zero dimensions (may be hidden)
    if (wrapper.offsetWidth === 0 || wrapper.offsetHeight === 0) return;

    // Check if there's room to scroll in either direction
    // When loop is enabled, always show both buttons if there are items
    if (this.configs.loop && this.filteredItems.length > 1) {
      this.showPrevButton = true;
      this.showNextButton = true;
    } else {
      // Standard overflow checking (no loop)
      this.showPrevButton = this.currentTranslate > 0;

      if (this.isVertical) {
        // For vertical carousels
        const trackHeight = track.offsetHeight;
        const wrapperHeight = wrapper.offsetHeight;
        this.showNextButton = trackHeight - this.currentTranslate > wrapperHeight + 1;
      } else {
        // For horizontal carousels
        const trackWidth = track.offsetWidth;
        const wrapperWidth = wrapper.offsetWidth;
        this.showNextButton = trackWidth - this.currentTranslate > wrapperWidth + 1;
      }
    }

    this.cdr.detectChanges();
  }

  /**
   * Calculate dimensions of carousel items
   */
  private calculateItemDimensions(): void {
    if (!this.trackElement || !this.wrapperElement) return;

    const wrapper = this.wrapperElement.nativeElement;
    const containerHeight = wrapper.offsetHeight;
    const containerWidth = wrapper.offsetWidth;

    // Update stored container dimensions
    this.containerWidth = containerWidth;
    this.containerHeight = containerHeight;

    const items = Array.from(
      this.trackElement.nativeElement.children
    ) as HTMLElement[];

    if (items.length === 0) return;

    // Add a small delay to ensure images are loaded and measured correctly
    setTimeout(() => {
      if (this.configs.singleItemMode) {
        // In single item mode, set all items to wrapper dimensions
        if (this.isVertical) {
          // For vertical mode, each item should be full height
          this.itemHeights = items.map(() => containerHeight);

          this.itemWidths = items.map((item) => {
            const style = window.getComputedStyle(item);
            const width = item.offsetWidth;
            const marginLeft = parseInt(style.marginLeft || '0', 10);
            const marginRight = parseInt(style.marginRight || '0', 10);
            return width + marginLeft + marginRight;
          });
        } else {
          // For horizontal mode, each item should be full width
          this.itemWidths = items.map(() => containerWidth);

          this.itemHeights = items.map((item) => {
            const style = window.getComputedStyle(item);
            const height = item.offsetHeight;
            const marginTop = parseInt(style.marginTop || '0', 10);
            const marginBottom = parseInt(style.marginBottom || '0', 10);
            return height + marginTop + marginBottom;
          });
        }

        // Apply the calculated dimensions immediately
        this.updateTranslatePosition();
        this.cdr.detectChanges();
        return;
      }

      // For multi-item mode, calculate actual dimensions
      this.itemWidths = items.map((item) => {
        const style = window.getComputedStyle(item);
        const width = item.offsetWidth;
        const marginLeft = parseInt(style.marginLeft || '0', 10);
        const marginRight = parseInt(style.marginRight || '0', 10);
        return width + marginLeft + marginRight;
      });

      this.itemHeights = items.map((item) => {
        const style = window.getComputedStyle(item);
        const height = item.offsetHeight;
        const marginTop = parseInt(style.marginTop || '0', 10);
        const marginBottom = parseInt(style.marginBottom || '0', 10);
        return height + marginTop + marginBottom;
      });
      
      this.cdr.detectChanges();
    }, 50); // Small delay to ensure images are loaded
  }

  /**
   * Calculate scroll amount based on configuration
   */
  private getScrollAmount(): number {
    const wrapper = this.wrapperElement?.nativeElement;
    if (!wrapper) return 0;

    // For one-item-scroll mode, return item dimension
    if (this.configs.singleItemMode) {
      if (this.isVertical && this.itemHeights.length > 0) {
        // Return height of current item or default to wrapper height
        return this.currentIndex < this.itemHeights.length
          ? this.itemHeights[this.currentIndex]
          : this.itemHeights[0] || wrapper.offsetHeight;
      } else if (this.itemWidths.length > 0) {
        // Return width of current item or default to wrapper width
        return this.currentIndex < this.itemWidths.length
          ? this.itemWidths[this.currentIndex]
          : this.itemWidths[0] || wrapper.offsetWidth;
      }
    }

    // Otherwise, use configured scroll size
    const size = this.configs.scrollSize || 'sm';
    if (size === 'full') {
      // Full size returns container dimension
      return this.isVertical ? wrapper.offsetHeight : wrapper.offsetWidth;
    }

    // If size is a percentage, calculate based on container size
    if (typeof size === 'string' && size.endsWith('%')) {
      const percent = parseInt(size, 10) / 100;
      return this.isVertical
        ? wrapper.offsetHeight * percent
        : wrapper.offsetWidth * percent;
    }

    // Return pixel value from map or default to small
    return this.scrollSizeMap[size as ScrollSize] || this.scrollSizeMap['sm'];
  }

  /**
   * Navigate to previous item
   */
  previous(): void {
    if (!this.showPrevButton) return;

    if (this.configs.singleItemMode) {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.updateTranslatePosition();
      } else if (this.configs.loop && this.filteredItems.length > 0) {
        // For loop mode, go to the last slide
        this.currentIndex = this.filteredItems.length - 1;
        this.updateTranslatePosition();
      }
    } else {
      const scrollAmount = this.getScrollAmount();
      this.currentTranslate = Math.max(0, this.currentTranslate - scrollAmount);
    }

    this.checkOverflow();
  }

  /**
   * Navigate to next item
   */
  next(): void {
    if (!this.showNextButton) return;

    const track = this.trackElement?.nativeElement;
    const wrapper = this.wrapperElement?.nativeElement;

    if (!track || !wrapper) return;

    if (this.configs.singleItemMode) {
      if (this.currentIndex < this.filteredItems.length - 1) {
        this.currentIndex++;
        this.updateTranslatePosition();
      } else if (this.configs.loop && this.filteredItems.length > 0) {
        // For loop mode, go back to the first slide
        this.currentIndex = 0;
        this.currentTranslate = 0;
      }
    } else {
      const scrollAmount = this.getScrollAmount();
      const maxTranslate = this.isVertical
        ? track.offsetHeight - wrapper.offsetHeight
        : track.offsetWidth - wrapper.offsetWidth;
      this.currentTranslate = Math.min(maxTranslate, this.currentTranslate + scrollAmount);
    }

    this.checkOverflow();
  }

  private updateTranslatePosition(): void {
    if (this.currentIndex === 0) {
      this.currentTranslate = 0;
      return;
    }

    const gap = this.configs.itemGap ? parseInt(this.configs.itemGap.replace('px', ''), 10) : 0;
    let position = 0;

    // Calculate cumulative position based on item dimensions
    for (let i = 0; i < this.currentIndex; i++) {
      if (this.isVertical) {
        position += (this.itemHeights[i] || 0) + gap;
      } else {
        position += (this.itemWidths[i] || 0) + gap;
      }
    }

    this.currentTranslate = position;
  }

  getItemStyle(index: number): Record<string, string> {
    const styles: Record<string, string> = {
      flexShrink: '0',
      flexGrow: '0',
      boxSizing: 'border-box',
      overflow: 'hidden',
      borderRadius: 'inherit',
    };

    if (this.configs.itemWidth) {
      if (this.configs.itemWidth === '100%' && this.containerWidth > 0) {
        styles['width'] = this.containerWidth + 'px';
        styles['maxWidth'] = '100%';
      } else {
        styles['width'] = this.configs.itemWidth;
      }
    }

    if (this.configs.itemHeight) {
      if ((this.configs.itemHeight === '100%' || parseInt(this.configs.itemHeight, 10) === this.containerHeight) && this.containerHeight > 0) {
        styles['height'] = this.containerHeight + 'px';
        styles['minHeight'] = this.containerHeight + 'px';
        styles['maxHeight'] = '100%';
        styles['display'] = 'flex';
        styles['flexDirection'] = 'column';
        styles['alignItems'] = 'stretch';
        styles['justifyContent'] = 'stretch';
      } else {
        styles['height'] = this.configs.itemHeight;
      }
    } else if (this.isVertical && this.configs.containerHeight) {
      styles['height'] = this.containerHeight + 'px';
      styles['minHeight'] = this.containerHeight + 'px';
    }

    // Add margin for gap between items (except first item)
    if (!this.configs.itemGap) return styles;

    const marginProperty = this.isVertical ? 'marginTop' : 'marginLeft';
    styles[marginProperty] = index === 0 ? '0' : this.configs.itemGap;

    return styles;
  }

  get contentPadding(): string { return this.configs.contentPadding || CAROUSEL_DEFAULTS.CONTENT_PADDING; }
  get animationDuration(): string { return (this.configs.animationDuration || CAROUSEL_DEFAULTS.ANIMATION_DURATION); }
  get animationTiming(): string { return this.configs.animationTiming || CAROUSEL_DEFAULTS.ANIMATION_TIMING; }
  get showNavigation(): boolean { return this.configs.showNavigation ?? true; }

  getEmptyStateContainerStyle(): Record<string, string> {
    return {
      width: '100%',
      boxSizing: 'border-box',
      borderRadius: 'inherit',
      backgroundColor: this.configs.emptyState?.backgroundColor || 'transparent',
    };
  }

  hasItems(): boolean { return this.filteredItems?.length > 0; }
  getNavControlsClass(): string { return 'carousel__nav-controls'; }

  getNavControlsStyle(): Record<string, string> {
    return {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '100',
    };
  }

  get prevIcon(): string {
    const icons = this.carouselService.getNavigationIcons(
      this.isVertical,
      this.configs.navigationStyle?.icons
    );
    return icons.prev;
  }

  get nextIcon(): string {
    const icons = this.carouselService.getNavigationIcons(
      this.isVertical,
      this.configs.navigationStyle?.icons
    );
    return icons.next;
  }

  getIconStyles(isNext: boolean): Record<string, string> {
    const color = isNext
      ? (this.configs.navigationStyle?.nextButton as any)?.color || '#666'
      : (this.configs.navigationStyle?.prevButton as any)?.color || '#666';

    return { color };
  }

  /**
   * Calculate position styles for navigation buttons
   */
  private getButtonPositionStyle(button: 'prev' | 'next'): Record<string, any> {
    const navConfig = this.configs.navigationStyle;
    const buttonStyle = button === 'prev' ? navConfig?.prevButton || {} : navConfig?.nextButton || {};
    const style: Record<string, any> = {
      zIndex: (buttonStyle as any).zIndex || '1000',
      position: 'absolute',
      pointerEvents: 'auto'
    };

    // Handle positioning properties
    ['top', 'bottom', 'left', 'right'].forEach(prop => {
      const value = (buttonStyle as any)[prop];
      if (value !== undefined) {
        style[prop] = value === 0 || value === '0' ? '0px' : value;
      }
    });

    // Handle transforms based on positioning
    const transformMap = {
      'left=50%': 'translateX(-50%)',
      'right=50%': 'translateX(50%)', 
      'top=50%': 'translateY(-50%)',
      'bottom=50%': 'translateY(50%)'
    };

    // Find matching transform
    for (const [position, transform] of Object.entries(transformMap)) {
      const [prop, value] = position.split('=');
      if ((buttonStyle as any)[prop] === value) {
        style['transform'] = (buttonStyle as any).transform 
          ? `${(buttonStyle as any).transform} ${transform}`
          : transform;
        break;
      }
    }

    // Use custom transform if specified
    if (!style['transform'] && (buttonStyle as any).transform) {
      style['transform'] = (buttonStyle as any).transform;
    }

    // Apply default positioning if none specified
    const hasPosition = ['top', 'bottom', 'left', 'right'].some(prop => 
      (buttonStyle as any)[prop] !== undefined
    );

    if (!hasPosition) {
      if (this.isVertical) {
        style['left'] = '50%';
        style['transform'] = 'translateX(-50%)';
        style[button === 'prev' ? 'top' : 'bottom'] = '0px';
      } else {
        style['top'] = '50%';
        style['transform'] = 'translateY(-50%)';
        style[button === 'prev' ? 'left' : 'right'] = '0px';
      }
    }

    return style;
  }

  /**
   * Get full styles for navigation buttons
   * @param buttonType - Type of button ('prev' or 'next')
   */
  private getButtonFullStyles(buttonType: 'prev' | 'next'): Record<string, any> {
    // Get base styles including shape styles
    const styles = {
      ...this.carouselService.getButtonShapeStyles(
        this.configs.navigationStyle?.buttonShape
      ),
    };

    // Apply custom styles from config
    const buttonConfig = this.configs.navigationStyle?.[`${buttonType}Button`];
    if (buttonConfig) {
      // Apply position styles first
      const positionStyles = this.getButtonPositionStyle(buttonType);
      Object.assign(styles, positionStyles);

      // Apply custom button styles but preserve shape styles
      const buttonShape = this.configs.navigationStyle?.buttonShape;
      if (buttonShape) {
        const { borderRadius, ...otherButtonConfig } = buttonConfig as Record<string, any>;
        Object.assign(styles, otherButtonConfig);
      } else {
        Object.assign(styles, buttonConfig);
      }
    }

    return styles;
  }

  getPrevButtonFullStyles(): Record<string, any> { return this.getButtonFullStyles('prev'); }
  getNextButtonFullStyles(): Record<string, any> { return this.getButtonFullStyles('next'); }

  getPrevIndex(activeIndex: number): number {
    const itemsCount = this.filteredItems?.length || 0;
    if (itemsCount === 0) return activeIndex;

    return activeIndex > 0
      ? activeIndex - 1
      : this.configs.loop
        ? itemsCount - 1
        : activeIndex;
  }

  goToPrevSlide(): void {
    const prevIndex = this.getPrevIndex(this.currentIndex);
    if (prevIndex !== this.currentIndex) {
      this.currentIndex = prevIndex;
      this.updateTranslatePosition();
      this.checkOverflow();
    }
  }

  getIndicatorContainerStyles(): Record<string, string> { return this.carouselService.getIndicatorContainerStyles(this.configs.indicatorStyle); }

  /**
   * Get styles for an individual indicator
   * @param index Index of the indicator
   */
  getIndicatorItemStyles(index: number): Record<string, string> {
    const isActive = index === this.currentIndex;
    return this.carouselService.getIndicatorStyles(this.configs.indicatorStyle, isActive);
  }

  /**
   * Navigate to a specific slide when indicator is clicked
   * @param index Target slide index
   */
  goToSlide(index: number): void {
    if (index === this.currentIndex || index < 0 || index >= this.filteredItems.length) return;
    
    this.currentIndex = index;

    if (this.configs.singleItemMode) {
      this.updateTranslatePosition();
      this.checkOverflow();
      return;
    }

    const track = this.trackElement?.nativeElement;
    const wrapper = this.wrapperElement?.nativeElement;
    
    if (!track || !wrapper) return;
    
    const gap = parseInt(this.configs.itemGap?.replace('px', '') || '0', 10);
    const dimensions = this.isVertical ? this.itemHeights : this.itemWidths;
    
    // Calculate cumulative position up to target index
    const position = dimensions
      .slice(0, index)
      .reduce((sum, size) => sum + (size || 0) + gap, 0);
    
    const maxTranslate = this.isVertical
      ? track.offsetHeight - wrapper.offsetHeight 
      : track.offsetWidth - wrapper.offsetWidth;
      
    this.currentTranslate = Math.min(maxTranslate, Math.max(0, position));
    this.checkOverflow();
  }

  /**
   * Whether to show indicators
   */
  get showIndicators(): boolean { return this.configs.showIndicators ?? false; }
}
