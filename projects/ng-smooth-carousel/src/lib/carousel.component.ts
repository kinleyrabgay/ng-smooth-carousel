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
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { CarouselConfig, ButtonStyle, ScrollSize } from './carousel-config.interface';

/**
 * NgSmoothCarousel Component
 * 
 * A carousel/slider component for Angular applications with smooth scrolling capabilities.
 * Supports both horizontal and vertical orientations, custom navigation styling,
 * and multiple configuration options.
 */
@Component({
  selector: 'nsc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [class.nsc--vertical]="isVertical" [ngStyle]="containerStyles" class="nsc">
      <div
        #wrapper
        [style.--content-padding]="contentPadding"
        class="nsc__wrapper">
        <div
          #track
          [ngStyle]="trackStyles"
          [class.nsc__track--vertical]="isVertical"
          [style.--animation-duration]="animationDuration"
          [style.--animation-timing]="animationTiming"
          class="nsc__track">
          <ng-container *ngIf="hasItems(); else emptyState">
            <ng-container *ngFor="let item of filteredItems; let i = index">
              <div class="nsc__item" [ngStyle]="getItemStyle(i)">
                <ng-container *ngIf="itemTemplate; else defaultTemplate">
                  <ng-container *ngTemplateOutlet="itemTemplate; context: { $implicit: item, index: i }"></ng-container>
                </ng-container>
                <ng-template #defaultTemplate>
                  <div class="nsc__item-default">
                    {{ item }}
                  </div>
                </ng-template>
              </div>
            </ng-container>
          </ng-container>
          
          <ng-template #emptyState>
            <div class="nsc__empty-container" [ngStyle]="getEmptyStateContainerStyle()">
              <ng-container *ngIf="emptyStateTemplate; else defaultEmptyState">
                <ng-container *ngTemplateOutlet="emptyStateTemplate; context: { $implicit: 'No items found' }"></ng-container>
              </ng-container>
              <ng-template #defaultEmptyState>
                <div class="nsc__empty-state">
                  <div class="nsc__empty-icon">📭</div>
                  <div class="nsc__empty-text">No items found</div>
                  <!-- <button class="nsc__reset-button" (click)="resetSearch()">
                    Show all items
                  </button> -->
                </div>
              </ng-template>
            </div>
          </ng-template>
        </div>
      </div>

      <div *ngIf="showNavigation && hasItems()" [ngClass]="getNavControlsClass()" [ngStyle]="getNavControlsStyle()">
        <!-- <div *ngIf="showSearch" class="nsc__search" style="position:absolute; bottom:16px; right:16px; pointer-events:auto;">
          <button [ngStyle]="searchButtonStyles" (click)="toggleSearchModal()" class="nsc__nav-button nsc__nav-button--search">
            <span class="nsc__nav-icon" [ngStyle]="searchIconStyles">{{ searchIcon }}</span>
          </button>
          <div *ngIf="isSearchModalOpen" [class.nsc__dropdown--vertical]="isVertical" (click)="$event.stopPropagation()" class="nsc__dropdown" >
            <input
              type="text"
              [placeholder]="searchPlaceholder"
              [(ngModel)]="searchQuery"
              (keyup.enter)="applySearch()"
              class="nsc__search-input"
              #searchInput
            />
          </div>
        </div> -->
        
        <button 
          [class.nsc__nav-button--disabled]="!showPrevButton" 
          [disabled]="!showPrevButton" 
          [ngStyle]="getPrevButtonFullStyles()" 
          (click)="previous()" 
          style="pointer-events:auto;"
          class="nsc__nav-button">
          <span class="nsc__nav-icon" [ngStyle]="prevIconStyles">{{ prevIcon }}</span>
        </button>
        
        <button
          [class.nsc__nav-button--disabled]="!showNextButton"
          [disabled]="!showNextButton"
          [ngStyle]="getNextButtonFullStyles()"
          (click)="next()"
          style="pointer-events:auto;"
          class="nsc__nav-button">
          <span class="nsc__nav-icon" [ngStyle]="nextIconStyles">{{ nextIcon }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .nsc{position:relative;overflow:hidden;display:flex;flex-direction:column;border-radius:inherit}
      .nsc--vertical{flex-direction:column}
      .nsc__wrapper{flex:1;overflow:hidden;position:relative;padding:var(--content-padding,10px) 0;width:100%;border-radius:inherit}
      .nsc--vertical .nsc__wrapper{padding:0 var(--content-padding,10px)}
      .nsc__track{display:flex;flex-wrap:nowrap;transition:transform var(--animation-duration,.3s) var(--animation-timing,ease);width:fit-content;min-width:100%;border-radius:inherit}
      .nsc__track--vertical{flex-direction:column;width:100%;height:fit-content}
      .nsc__item{flex:0 0 auto;box-sizing:border-box;border-radius:inherit}
      .nsc--vertical .nsc__item{width:100%}
      .nsc__item-default{background:#fff;height:100%;display:flex;align-items:center;justify-content:center;border:1px solid #e0e0e0;border-radius:inherit;padding:20px}
      .nsc__empty-container{width:100%;box-sizing:border-box;border-radius:inherit}
      .nsc__empty-state{background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;text-align:center;color:#666;border-radius:inherit;min-height:200px}
      .nsc__nav-controls{position:absolute;display:flex;gap:24px;z-index:100;pointer-events:auto}
      .nsc__nav-button{background:#fff;border:1px solid #e0e0e0;width:32px;height:32px;padding:0;margin:0;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:101;position:relative}
      .nsc__nav-icon{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:16px;line-height:1}
      .nsc__nav-button:hover:not(.nsc__nav-button--disabled){opacity:0.9}
      .nsc__nav-button--disabled{opacity:.4;cursor:not-allowed;background-color:#f5f5f5;border-color:#ddd}
      .nsc__search{position:relative}
      .nsc__dropdown{position:absolute;background:#fff;border:1px solid #e0e0e0;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.1);z-index:1000;min-width:200px;top:100%;right:0;margin-top:8px}
      .nsc__dropdown--vertical{right:auto;left:100%;top:0;margin-top:0;margin-left:8px}
      .nsc__search-input{width:100%;padding:8px 12px;border:none;border-radius:4px;font-size:14px;outline:none}
      .nsc__empty-icon{font-size:32px;margin-bottom:12px}
      .nsc__empty-text{font-size:16px;margin-bottom:12px}
      .nsc__reset-button{background:none;border:none;padding:6px 12px;font-size:13px;color:#007bff;cursor:pointer;transition:opacity .2s ease}
      .nsc__reset-button:hover{opacity:.7}
      .nsc--vertical .nsc__nav-button .nsc__nav-icon{transform:rotate(90deg)}
    `,
  ],
})
export class CarouselComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() items: any[] = [];
  @Input() config: CarouselConfig = {};

  @ContentChild('carouselItem') itemTemplate!: TemplateRef<any>;
  @ContentChild('emptyState') emptyStateTemplate!: TemplateRef<any>;
  @ViewChild('track') trackElement!: ElementRef<HTMLElement>;
  @ViewChild('wrapper') wrapperElement!: ElementRef<HTMLElement>;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  private currentTranslate = 0;
  private currentIndex = 0;
  private destroy$ = new Subject<void>();
  private autoplayInterval?: ReturnType<typeof setInterval>;
  private itemWidths: number[] = [];
  private itemHeights: number[] = [];
  private containerWidth: number = 0;
  private containerHeight: number = 0;
  private intersectionObserver: IntersectionObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private visibilityChangeTimeout: any = null;
  private initialized = false;

  private readonly scrollSizeMap = {
    'xs': 50, 'sm': 100, 'md': 150, 'lg': 200, 'xl': 250,
    '2xl': 300, '3xl': 350, '4xl': 400, '5xl': 450, '6xl': 500,
    '7xl': 550, '8xl': 600, '9xl': 650, '10xl': 700, 'full': 1
  };

  showPrevButton = false;
  showNextButton = false;
  searchQuery = '';
  isSearchModalOpen = false;
  filteredItems: any[] = [];

  constructor(private readonly cdr: ChangeDetectorRef, private readonly ngZone: NgZone) {}

  /**
   * @description Initialize component on init
   */
  ngOnInit(): void {
    this.filteredItems = this.items || [];
  }

  /**
   * @description Handle changes to inputs
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.filteredItems = this.items || [];
      
      if (this.initialized) {
        setTimeout(() => {
          this.updateContainerWidth();
          this.calculateItemWidths();
          this.checkOverflow();
          this.cdr.detectChanges();
        });
      }
    }
  }

  /**
   * @description Convert time string to milliseconds
   */
  private parseTimeToMs(time: string): number {
    if (time.endsWith('ms')) return parseInt(time.slice(0, -2), 10);
    if (time.endsWith('s')) return parseFloat(time.slice(0, -1)) * 1000;
    return parseInt(time, 10);
  }

  /**
   * @description Setup autoplay functionality if enabled
   */
  private setupAutoplay(): void {
    if (this.autoplayInterval) clearInterval(this.autoplayInterval);
    if (!this.config.autoplay) return;

    const delay = this.parseTimeToMs(this.config.autoplayDelay || '3000ms');
    this.autoplayInterval = setInterval(() => {
      const t = this.trackElement?.nativeElement;
      const w = this.wrapperElement?.nativeElement;
      
      if (!t || !w) return;
      
      const max = this.isVertical ? t.offsetHeight - w.offsetHeight : t.offsetWidth - w.offsetWidth;
      if (this.currentTranslate >= max) {
        if (this.config.loop) this.currentTranslate = 0;
        else {
          clearInterval(this.autoplayInterval);
          return;
        }
      } else this.next();
      
      this.cdr.detectChanges();
    }, delay);
  }

  /**
   * @description Initialize component after view is initialized
   */
  ngAfterViewInit(): void {
    this.initializeCarousel();
    this.setupResizeListener();
    this.setupIntersectionObserver();
    this.setupResizeObserver();
    this.setupAutoplay();
    
    setTimeout(() => {
      this.updateContainerWidth();
      this.calculateItemWidths();
      this.checkOverflow();
      this.initialized = true;
    });
  }

  /**
   * @description Clean up resources on component destruction
   */
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

  /**
   * @description Whether carousel orientation is vertical
   */
  get isVertical(): boolean {
    return this.config.orientation === 'vertical';
  }

  /**
   * @description Get container styles based on configuration
   */
  get containerStyles(): Record<string, string> {
    return {
      width: this.config.containerWidth || '100%',
      height: this.config.containerHeight || 'auto',
    };
  }

  /**
   * @description Get track styles including transform property for translation
   */
  get trackStyles(): Record<string, string> {
    const base = {
      transform: this.isVertical
        ? `translateY(-${this.currentTranslate}px)`
        : `translateX(-${this.currentTranslate}px)`,
    };
    return this.isVertical ? { ...base, flexDirection: 'column' } : base;
  }

  /**
   * @description Initialize carousel state
   */
  private initializeCarousel(): void {
    if (!this.trackElement || !this.wrapperElement) return;
    this.currentTranslate = 0;
    this.checkOverflow();
  }

  private setupResizeListener(): void {
    fromEvent(window, 'resize')
      .pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateContainerWidth();
        this.calculateItemWidths();
        this.checkOverflow();
      });
  }

  private setupIntersectionObserver(): void {
    // Create an IntersectionObserver to detect when the carousel becomes visible
    if ('IntersectionObserver' in window) {
      this.ngZone.runOutsideAngular(() => {
        this.intersectionObserver = new IntersectionObserver(entries => {
          const isVisible = entries[0]?.isIntersecting;
          
          if (isVisible && this.initialized) {
            // When component becomes visible, recalculate dimensions and update buttons
            this.ngZone.run(() => {
              // Use a small timeout to ensure the DOM has settled
              this.visibilityChangeTimeout = setTimeout(() => {
                this.updateContainerWidth();
                this.calculateItemWidths();
                this.checkOverflow();
              }, 50);
            });
          }
        }, { threshold: 0.1 });
        
        if (this.wrapperElement?.nativeElement) {
          this.intersectionObserver.observe(this.wrapperElement.nativeElement);
        }
      });
    }
  }

  private setupResizeObserver(): void {
    // Create a ResizeObserver to detect when the carousel's size changes
    if ('ResizeObserver' in window) {
      this.ngZone.runOutsideAngular(() => {
        this.resizeObserver = new ResizeObserver(entries => {
          if (this.initialized) {
            this.ngZone.run(() => {
              this.updateContainerWidth();
              this.calculateItemWidths();
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

  private updateContainerWidth(): void {
    if (!this.wrapperElement) return;
    this.containerWidth = this.wrapperElement.nativeElement.offsetWidth;
    this.containerHeight = this.wrapperElement.nativeElement.offsetHeight;
  }

  /**
   * @description Check if content overflows and update button visibility
   */
  private checkOverflow(): void {
    if (!this.showNavigation) {
      this.showPrevButton = this.showNextButton = false;
      return;
    }

    const t = this.trackElement?.nativeElement;
    const w = this.wrapperElement?.nativeElement;
    if (!t || !w) return;

    // Skip if element has zero dimensions (may be hidden)
    if (w.offsetWidth === 0 || w.offsetHeight === 0) return;

    if (this.config.enableOneItemScroll) {
      // In one-item mode, buttons depend on current index
      this.showPrevButton = this.currentIndex > 0;
      this.showNextButton = this.currentIndex < this.filteredItems.length - 1;
    } else if (this.isVertical) {
      // In vertical mode, check translation against content height
      this.showPrevButton = this.currentTranslate > 0;
      this.showNextButton = t.offsetHeight - this.currentTranslate > w.offsetHeight;
    } else {
      // In horizontal mode, check translation against content width
      this.showPrevButton = this.currentTranslate > 0;
      this.showNextButton = t.offsetWidth - this.currentTranslate > w.offsetWidth;
    }

    this.cdr.detectChanges();
  }

  private calculateItemWidths(): void {
    if (!this.trackElement || !this.wrapperElement) return;
    
    const w = this.wrapperElement.nativeElement;
    const items = Array.from(this.trackElement.nativeElement.children) as HTMLElement[];
    
    if (this.config.enableOneItemScroll) {
      if (this.isVertical) {
        const pHeight = w.offsetHeight;
        this.itemHeights = items.map(() => pHeight);
        
        this.itemWidths = items.map(item => {
          const style = window.getComputedStyle(item);
          const width = item.offsetWidth;
          const ml = parseInt(style.marginLeft || '0', 10);
          const mr = parseInt(style.marginRight || '0', 10);
          return width + ml + mr;
        });
      } else {
        const pWidth = w.offsetWidth;
        this.itemWidths = items.map(() => pWidth);
        
        this.itemHeights = items.map(item => {
          const style = window.getComputedStyle(item);
          const height = item.offsetHeight;
          const mt = parseInt(style.marginTop || '0', 10);
          const mb = parseInt(style.marginBottom || '0', 10);
          return height + mt + mb;
        });
      }
      return;
    }
    
    this.itemWidths = items.map(item => {
      const style = window.getComputedStyle(item);
      const width = item.offsetWidth;
      const ml = parseInt(style.marginLeft || '0', 10);
      const mr = parseInt(style.marginRight || '0', 10);
      return width + ml + mr;
    });
    
    this.itemHeights = items.map(item => {
      const style = window.getComputedStyle(item);
      const height = item.offsetHeight;
      const mt = parseInt(style.marginTop || '0', 10);
      const mb = parseInt(style.marginBottom || '0', 10);
      return height + mt + mb;
    });
  }

  /**
   * @description Calculate scroll amount based on configuration
   */
  private getScrollAmount(): number {
    // For one-item-scroll mode, return item dimension
    if (this.config.enableOneItemScroll) {
      if (this.isVertical && this.itemHeights.length > 0) {
        // Return height of current item or default to wrapper height
        return this.currentIndex < this.itemHeights.length 
          ? this.itemHeights[this.currentIndex] 
          : (this.itemHeights[0] || this.wrapperElement.nativeElement.offsetHeight);
      } else if (this.itemWidths.length > 0) {
        // Return width of current item or default to wrapper width
        return this.currentIndex < this.itemWidths.length 
          ? this.itemWidths[this.currentIndex] 
          : (this.itemWidths[0] || this.wrapperElement.nativeElement.offsetWidth);
      }
    }
    
    // Otherwise, use configured scroll size
    const size = this.config.scrollSize || 'sm';
    if (size === 'full') {
      // Full size returns container dimension
      return this.isVertical 
        ? this.wrapperElement.nativeElement.offsetHeight 
        : this.wrapperElement.nativeElement.offsetWidth;
    }
    
    // Return pixel value from map or default to small
    return this.scrollSizeMap[size as ScrollSize] || this.scrollSizeMap['sm'];
  }

  /**
   * @description Navigate to previous item
   */
  previous(): void {
    if (this.config.enableOneItemScroll) {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        if (this.currentIndex === 0) {
          this.currentTranslate = 0;
        } else {
          const gap = this.config.itemGap ? parseInt(this.config.itemGap.replace('px', ''), 10) : 0;
          
          if (this.isVertical) {
            const ih = this.itemHeights[this.currentIndex] || this.wrapperElement.nativeElement.offsetHeight;
            this.currentTranslate = this.currentIndex * (ih + gap);
          } else {
            const iw = this.itemWidths[this.currentIndex] || this.wrapperElement.nativeElement.offsetWidth;
            this.currentTranslate = this.currentIndex * (iw + gap);
          }
        }
      }
    } else {
      const scrollAmount = this.getScrollAmount();
      this.currentTranslate = Math.max(0, this.currentTranslate - scrollAmount);
    }
    this.checkOverflow();
  }

  /**
   * @description Navigate to next item
   */
  next(): void {
    const t = this.trackElement.nativeElement;
    const w = this.wrapperElement.nativeElement;
    
    if (this.config.enableOneItemScroll) {
      if (this.currentIndex < this.filteredItems.length - 1) {
        const gap = this.config.itemGap ? parseInt(this.config.itemGap.replace('px', ''), 10) : 0;
        
        this.currentIndex++;
        
        if (this.isVertical) {
          const ih = this.itemHeights[this.currentIndex - 1] || w.offsetHeight;
          
          if (this.config.itemHeight === '100%') {
            this.currentTranslate = this.currentIndex * (ih + gap);
          } else {
            this.currentTranslate += ih + gap;
          }
        } else {
          const iw = this.itemWidths[this.currentIndex - 1] || w.offsetWidth;
          
          if (this.config.itemWidth === '100%') {
            this.currentTranslate = this.currentIndex * (iw + gap);
          } else {
            this.currentTranslate += iw + gap;
          }
        }
      }
    } else {
      const amt = this.getScrollAmount();
      const max = this.isVertical ? t.offsetHeight - w.offsetHeight : t.offsetWidth - w.offsetWidth;
      this.currentTranslate = Math.min(max, this.currentTranslate + amt);
    }
    this.checkOverflow();
  }

  /**
   * @description Get button shape styles based on configuration
   */
  private getButtonShapeStyles(): Record<string, string> {
    const shape = this.config.navigationStyle?.buttonShape;
    switch (shape) {
      case 'circle': return { borderRadius: '50%' };
      case 'rounded': return { borderRadius: '4px' };
      default: return { borderRadius: '0' };
    }
  }

  /**
   * @description Get styles for next button
   */
  get nextButtonStyles(): Record<string, any> {
    const bs = { ...(this.config.navigationStyle?.nextButton || {}) };
    const ss = this.getButtonShapeStyles();
    if (this.config.navigationStyle?.buttonShape && bs) delete bs['borderRadius'];
    return { ...ss, ...bs };
  }

  /**
   * @description Get styles for previous button
   */
  get prevButtonStyles(): Record<string, any> {
    const bs = { ...(this.config.navigationStyle?.prevButton || {}) };
    const ss = this.getButtonShapeStyles();
    if (this.config.navigationStyle?.buttonShape && bs) delete bs['borderRadius'];
    return { ...ss, ...bs };
  }

  /**
   * @description Get styles for search button
   * @deprecated COMING SOON - Search functionality will be available in future releases
   */
  // get searchButtonStyles(): Record<string, any> {
  //   const bs = { ...(this.config.searchStyle?.button || {}) };
  //   const ss = this.getButtonShapeStyles();
  //   if (this.config.navigationStyle?.buttonShape && bs) delete bs['borderRadius'];
  //   return { ...ss, ...bs };
  // }

  /**
   * @description Get individual item styling
   */
  getItemStyle(index: number): Record<string, string> {
    const s: Record<string, string> = {
      flexShrink: '0',
      flexGrow: '0',
      boxSizing: 'border-box',
      overflow: 'hidden',
      borderRadius: 'inherit'
    };

    // Handle width calculation
    if (this.config.itemWidth) {
      if (this.config.itemWidth === '100%' && this.config.enableOneItemScroll && this.containerWidth > 0) {
        // For full-width items, adjust based on orientation
        const widthAdjustment = this.isVertical ? 4 : 0;
        s['width'] = (this.containerWidth - widthAdjustment) + 'px';
        s['maxWidth'] = '100%';
      } else {
        s['width'] = this.config.itemWidth;
      }
    } else {
      s['width'] = '100%';
    }
      
    // Handle height calculation
    if (this.config.itemHeight) {
      if (this.config.itemHeight === '100%' && this.wrapperElement) {
        const containerHeight = this.wrapperElement.nativeElement.offsetHeight;
        if (containerHeight > 0) {
          // For full-height items, adjust based on orientation
          const heightAdjustment = this.isVertical ? 0 : 4;
          s['height'] = (containerHeight - heightAdjustment) + 'px';
          s['maxHeight'] = '100%';
        } else {
          s['height'] = this.config.itemHeight;
        }
      } else {
        s['height'] = this.config.itemHeight;
      }
    } else {
      s['height'] = 'auto';
    }

    // Add margin for gap between items (except first item)
    if (!this.config.itemGap) return s;

    const m = this.isVertical ? 'marginTop' : 'marginLeft';
    return { ...s, [m]: index === 0 ? '0' : this.config.itemGap };
  }

  /**
   * @description Content padding for the carousel
   */
  get contentPadding(): string { return this.config.contentPadding || '4px'; }
  
  /**
   * @description Animation duration for scrolling
   */
  get animationDuration(): string { return this.config.animationDuration || '300ms'; }
  
  /**
   * @description Animation timing function
   */
  get animationTiming(): string { return this.config.animationTiming || 'ease'; }
  
  /**
   * @description Whether search functionality is enabled
   * @deprecated COMING SOON - Search functionality will be available in future releases
   */
  // get showSearch(): boolean { return this.config.enableSearch ?? false; }
  
  /**
   * @description Placeholder text for search input
   * @deprecated COMING SOON - Search functionality will be available in future releases
   */
  // get searchPlaceholder(): string { return this.config.searchPlaceholder || 'Search...'; }
  
  /**
   * @description Title for search modal
   * @deprecated COMING SOON - Search functionality will be available in future releases
   */
  // get searchModalTitle(): string { return this.config.searchModalTitle || 'Filter Items'; }
  
  /**
   * @description Styles for search modal
   * @deprecated COMING SOON - Search functionality will be available in future releases
   */
  // get searchModalStyles(): Record<string, string> { return this.config.searchStyle?.modal || {}; }

  /**
   * @description Toggle search modal visibility
   * @deprecated COMING SOON - Search functionality will be available in future releases
   */
  // toggleSearchModal(): void {
  //   this.isSearchModalOpen = !this.isSearchModalOpen;
  //   if (this.isSearchModalOpen && this.searchInput) {
  //     setTimeout(() => this.searchInput.nativeElement.focus());
  //   }
  // }

  /**
   * @description Close search modal
   * @deprecated COMING SOON - Search functionality will be available in future releases
   */
  // closeSearchModal(): void {
  //   this.isSearchModalOpen = false;
  // }

  /**
   * @description Apply search filter to items
   * @deprecated COMING SOON - Search functionality will be available in future releases
   */
  // applySearch(): void {
  //   const q = this.searchQuery.trim().toLowerCase();
  //   if (!q) {
  //     this.filteredItems = this.items;
  //   } else {
  //     this.filteredItems = this.items.filter(item => {
  //       if (typeof item === 'string') return item.toLowerCase().includes(q);
  //       return Object.values(item).some(v => typeof v === 'string' && v.toLowerCase().includes(q));
  //     });
  //   }

  //   this.currentTranslate = 0;
  //   this.currentIndex = 0;
  //   this.checkOverflow();
  //   this.closeSearchModal();
  // }

  /**
   * @description Handle clicks outside search modal
   * @deprecated COMING SOON - Search functionality will be available in future releases
   */
  // @HostListener('document:click', ['$event'])
  // handleClickOutside(event: MouseEvent): void {
  //   const sc = document.querySelector('.nsc__search');
  //   if (this.isSearchModalOpen && sc && !sc.contains(event.target as Node)) {
  //     this.closeSearchModal();
  //   }
  // }

  /**
   * @description Reset search and show all items
   * @deprecated COMING SOON - Search functionality will be available in future releases
   */
  // resetSearch(): void {
  //   this.searchQuery = '';
  //   this.filteredItems = this.items;
  //   this.currentTranslate = 0;
  //   this.currentIndex = 0;
  //   setTimeout(() => {
  //     this.updateContainerWidth();
  //     this.calculateItemWidths();
  //     this.checkOverflow();
  //   });
  // }

  /**
   * @description Get navigation icons based on configuration
   */
  private getNavigationIcons(): { prev: string; next: string; search?: string } {
    const defIcons = {
      horizontal: { prev: '❮', next: '❯' },
      vertical: { prev: '❮', next: '❯' },
      // search: '🔍'
    };

    const cfgIcons = this.config.navigationStyle?.icons || {};
    const vIcons = cfgIcons.vertical || {};

    // Get icons based on orientation
    return {
      prev: this.isVertical ? (vIcons.prev || defIcons.vertical.prev) : (cfgIcons.prev || defIcons.horizontal.prev),
      next: this.isVertical ? (vIcons.next || defIcons.vertical.next) : (cfgIcons.next || defIcons.horizontal.next),
      // search: cfgIcons.search || defIcons.search
    };
  }

  /**
   * @description Previous button icon
   */
  get prevIcon(): string { return this.getNavigationIcons().prev; }
  
  /**
   * @description Next button icon
   */
  get nextIcon(): string { return this.getNavigationIcons().next; }
  
  /**
   * @description Search button icon
   * @deprecated COMING SOON - Search functionality will be available in future releases
   */
  // get searchIcon(): string { return this.getNavigationIcons().search; }

  /**
   * @description Next button icon styles
   */
  get nextIconStyles(): Record<string, string> {
    return { color: (this.config.navigationStyle?.nextButton || {})['color'] || '#666' };
  }

  /**
   * @description Previous button icon styles
   */
  get prevIconStyles(): Record<string, string> {
    return { color: (this.config.navigationStyle?.prevButton || {})['color'] || '#666' };
  }

  /**
   * @description Search button icon styles
   * @deprecated COMING SOON - Search functionality will be available in future releases
   */
  // get searchIconStyles(): Record<string, string> {
  //   return { color: (this.config.searchStyle?.button || {})['color'] || '#666' };
  // }

  /**
   * @description Whether navigation buttons should be shown
   */
  get showNavigation(): boolean {
    return this.config.showNavigation ?? true;
  }

  /**
   * @description Get styles for empty state container
   */
  getEmptyStateContainerStyle(): Record<string, string> {
    return {
      width: '100%',
      boxSizing: 'border-box',
      borderRadius: 'inherit'
    };
  }

  /**
   * @description Determines if carousel contains items
   */
  hasItems(): boolean {
    return this.filteredItems?.length > 0;
  }

  /**
   * @description Default CTA position (fixed to bottom-right)
   * @deprecated Will be removed in future versions
   */
  get ctaPosition(): string {
    return 'bottom-right';
  }

  /**
   * @description Get class for navigation controls container
   */
  getNavControlsClass(): string {
    return 'nsc__nav-controls';
  }
  
  /**
   * @description Get styles for navigation controls container
   */
  getNavControlsStyle(): Record<string, string> {
    return {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '100'
    };
  }

  /**
   * @description Calculate position styles for navigation buttons
   */
  private getButtonPositionStyle(button: 'prev' | 'next'): Record<string, any> {
    const navConfig = this.config.navigationStyle;
    const buttonStyle: ButtonStyle = 
      button === 'prev' 
        ? navConfig?.prevButton || {} 
        : navConfig?.nextButton || {};
    
    // Create a base style object with high z-index
    const style: Record<string, any> = {
      zIndex: buttonStyle['zIndex'] || '1000',
      position: 'absolute', // Always use absolute positioning
      pointerEvents: 'auto'
    };
    
    // Apply direct positioning if specified
    if (buttonStyle['top'] !== undefined) style['top'] = buttonStyle['top'];
    if (buttonStyle['bottom'] !== undefined) style['bottom'] = buttonStyle['bottom'];
    if (buttonStyle['left'] !== undefined) style['left'] = buttonStyle['left'];
    if (buttonStyle['right'] !== undefined) style['right'] = buttonStyle['right'];
    
    // Set transform if specified
    if (buttonStyle['transform'] !== undefined) {
      style['transform'] = buttonStyle['transform'];
    }
    
    // Apply default positioning if no position is provided
    if (buttonStyle['top'] === undefined && buttonStyle['bottom'] === undefined && 
        buttonStyle['left'] === undefined && buttonStyle['right'] === undefined) {
      // Use default center positions
      style['top'] = '50%';
      style['transform'] = 'translateY(-50%)';
      
      if (button === 'prev') {
        style['left'] = '-10px';
      } else {
        style['right'] = '-10px';
      }
    }
    
    return style;
  }

  /**
   * @description Get full styles for previous button
   */
  getPrevButtonFullStyles(): Record<string, any> {
    const styles = { ...this.prevButtonStyles };
    
    // If the z-index is specified, ensure it's applied with higher priority
    if (styles['zIndex']) {
      styles['zIndex'] = (parseInt(styles['zIndex']) || 0).toString();
    }
    
    // Apply position styles if needed
    const positionStyles = this.getButtonPositionStyle('prev');
    return { ...positionStyles, ...styles };
  }

  /**
   * @description Get full styles for next button
   */
  getNextButtonFullStyles(): Record<string, any> {
    const styles = { ...this.nextButtonStyles };
    
    // If the z-index is specified, ensure it's applied with higher priority
    if (styles['zIndex']) {
      styles['zIndex'] = (parseInt(styles['zIndex']) || 0).toString();
    }
    
    // Apply position styles if needed
    const positionStyles = this.getButtonPositionStyle('next');
    return { ...positionStyles, ...styles };
  }
}