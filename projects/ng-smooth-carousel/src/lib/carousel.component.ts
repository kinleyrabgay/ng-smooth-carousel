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
  HostListener,
  OnInit,
} from '@angular/core';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { CarouselConfig } from './carousel-config.interface';

/**
 * A smooth, customizable carousel component for Angular applications.
 * 
 * @description
 * This component provides a flexible carousel/slider with the following features:
 * - Horizontal and vertical orientations
 * - Customizable navigation buttons with different shapes and styles
 * - Search functionality with filtering
 * - Responsive design with configurable item sizes
 * - Custom item templates
 * - Autoplay with configurable delay
 * - Loop functionality
 * 
 * @example
 * ```html
 * <nsc
 *   [items]="items"
 *   [config]="{
 *     orientation: 'horizontal',
 *     navigationStyle: {
 *       buttonShape: 'rounded',
 *       nextButton: { color: '#333' },
 *       prevButton: { color: '#333' }
 *     }
 *   }">
 *   <ng-template #carouselItem let-item>
 *     {{ item }}
 *   </ng-template>
 * </nsc>
 * ```
 */
@Component({
  selector: 'nsc',
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
          <ng-container *ngIf="filteredItems.length > 0; else noResults">
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
          <ng-template #noResults>
            <div class="nsc__item" [ngStyle]="getEmptyStateStyle()">
              <div class="nsc__empty-state">
                <div class="nsc__empty-icon">📭</div>
                <div class="nsc__empty-text">No items found</div>
                <button class="nsc__reset-button" (click)="resetSearch()">
                  Show all items
                </button>
              </div>
            </div>
          </ng-template>
        </div>
      </div>

      <div *ngIf="showNavigation" class="nsc__nav-controls">
        <div *ngIf="showSearch" class="nsc__search">
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
        </div>
        
        <button 
          [class.nsc__nav-button--disabled]="!showPrevButton" 
          [disabled]="!showPrevButton" 
          [ngStyle]="prevButtonStyles" 
          (click)="previous()" 
          class="nsc__nav-button">
          <span class="nsc__nav-icon" [ngStyle]="prevIconStyles">{{ prevIcon }}</span>
        </button>
        
        <button
          [class.nsc__nav-button--disabled]="!showNextButton"
          [disabled]="!showNextButton"
          [ngStyle]="nextButtonStyles"
          (click)="next()"
          class="nsc__nav-button">
          <span class="nsc__nav-icon" [ngStyle]="nextIconStyles">{{ nextIcon }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .nsc{position:relative;overflow:hidden;width:100%;display:flex;flex-direction:column}
      .nsc--vertical{flex-direction:column}
      .nsc__wrapper{flex:1;overflow:hidden;position:relative;padding:var(--content-padding,10px) 0;width:100%}
      .nsc--vertical .nsc__wrapper{padding:0 var(--content-padding,10px)}
      .nsc__track{display:flex;flex-wrap:nowrap;transition:transform var(--animation-duration,.3s) var(--animation-timing,ease);width:fit-content;min-width:100%}
      .nsc__track--vertical{flex-direction:column;width:100%;height:fit-content}
      .nsc__item{flex:0 0 auto;box-sizing:border-box}
      .nsc--vertical .nsc__item{width:100%}
      .nsc__item-default{background:#fff;height:100%;display:flex;align-items:center;justify-content:center;border:1px solid #e0e0e0;border-radius:4px;padding:20px}
      .nsc__nav-controls{position:absolute;bottom:16px;right:16px;display:flex;gap:24px;z-index:10}
      .nsc__nav-button{background:#fff;border:1px solid #e0e0e0;width:32px;height:32px;padding:0;margin:0;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s ease;z-index:1}
      .nsc__nav-icon{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:16px;line-height:1}
      .nsc__nav-button:hover:not(.nsc__nav-button--disabled){opacity:.8;transform:scale(1.05)}
      .nsc__nav-button--disabled{opacity:.4;cursor:not-allowed;background-color:#f5f5f5;border-color:#ddd;transition:all .2s ease}
      .nsc__search{position:relative}
      .nsc__dropdown{position:absolute;background:#fff;border:1px solid #e0e0e0;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.1);z-index:1000;min-width:200px;top:100%;right:0;margin-top:8px}
      .nsc__dropdown--vertical{right:auto;left:100%;top:0;margin-top:0;margin-left:8px}
      .nsc__search-input{width:100%;padding:8px 12px;border:none;border-radius:4px;font-size:14px;outline:none}
      .nsc__empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;text-align:center;color:#666}
      .nsc__empty-icon{font-size:32px;margin-bottom:12px}
      .nsc__empty-text{font-size:16px;margin-bottom:12px}
      .nsc__reset-button{background:none;border:none;padding:6px 12px;font-size:13px;color:#007bff;cursor:pointer;transition:opacity .2s ease}
      .nsc__reset-button:hover{opacity:.7}
      .nsc--vertical .nsc__nav-button .nsc__nav-icon{transform:rotate(90deg)}
    `,
  ],
})
export class CarouselComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() items: any[] = [];
  @Input() config: CarouselConfig = {};

  @ContentChild('carouselItem') itemTemplate!: TemplateRef<any>;
  @ViewChild('track') trackElement!: ElementRef<HTMLElement>;
  @ViewChild('wrapper') wrapperElement!: ElementRef<HTMLElement>;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  private currentTranslate = 0;
  private currentIndex = 0;
  private destroy$ = new Subject<void>();
  private autoplayInterval?: ReturnType<typeof setInterval>;
  private itemWidths: number[] = [];

  private readonly scrollSizeMap: Record<string, number> = {
    'xs': 50,
    'sm': 100,
    'md': 150,
    'lg': 200,
    'xl': 250,
    '2xl': 300,
    '3xl': 350,
    '4xl': 400,
    '5xl': 450,
    '6xl': 500,
    '7xl': 550,
    '8xl': 600,
    '9xl': 650,
    '10xl': 700,
    'full': 1,
  };

  showPrevButton = false;
  showNextButton = false;
  searchQuery = '';
  isSearchModalOpen = false;
  filteredItems: any[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.filteredItems = this.items;
  }

  private parseTimeToMs(time: string): number {
    if (time.endsWith('ms')) {
      return parseInt(time.slice(0, -2), 10);
    }
    if (time.endsWith('s')) {
      return parseFloat(time.slice(0, -1)) * 1000;
    }
    return parseInt(time, 10);
  }

  private setupAutoplay(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }

    if (!this.config.autoplay) return;

    const delay = this.parseTimeToMs(this.config.autoplayDelay || '3000ms');

    this.autoplayInterval = setInterval(() => {
      const track = this.trackElement?.nativeElement;
      const wrapper = this.wrapperElement?.nativeElement;
      
      if (!track || !wrapper) return;
      
      const maxTranslate = this.isVertical
        ? track.offsetHeight - wrapper.offsetHeight
        : track.offsetWidth - wrapper.offsetWidth;

      if (this.currentTranslate >= maxTranslate) {
        if (this.config.loop) {
          this.currentTranslate = 0;
        } else {
          clearInterval(this.autoplayInterval);
          return;
        }
      } else {
        this.next();
      }
      this.cdr.detectChanges();
    }, delay);
  }

  ngAfterViewInit(): void {
    this.initializeCarousel();
    this.setupResizeListener();
    this.setupAutoplay();
    
    setTimeout(() => {
      this.calculateItemWidths();
      this.checkOverflow();
    });
  }

  ngOnDestroy(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isVertical(): boolean {
    return this.config.orientation === 'vertical';
  }

  get containerStyles(): Record<string, string> {
    return {
      width: this.config.containerWidth || '100%',
      height: this.config.containerHeight || 'auto',
    };
  }

  get trackStyles(): Record<string, string> {
    const baseStyles = {
      transform: this.isVertical
        ? `translateY(-${this.currentTranslate}px)`
        : `translateX(-${this.currentTranslate}px)`,
    };

    return this.isVertical
      ? { ...baseStyles, flexDirection: 'column' }
      : baseStyles;
  }

  private initializeCarousel(): void {
    if (!this.trackElement || !this.wrapperElement) return;
    
    this.currentTranslate = 0;
    this.checkOverflow();
  }

  private setupResizeListener(): void {
    fromEvent(window, 'resize')
      .pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(() => {
        this.checkOverflow();
      });
  }

  private checkOverflow(): void {
    if (!this.showNavigation) {
      this.showPrevButton = false;
      this.showNextButton = false;
      return;
    }

    const track = this.trackElement?.nativeElement;
    const wrapper = this.wrapperElement?.nativeElement;

    if (!track || !wrapper) return;

    if (this.config.enableOneItemScroll) {
      this.showPrevButton = this.currentIndex > 0;
      this.showNextButton = this.currentIndex < this.filteredItems.length - 1;
    } else if (this.isVertical) {
      this.showPrevButton = this.currentTranslate > 0;
      this.showNextButton = 
        track.offsetHeight - this.currentTranslate > wrapper.offsetHeight;
    } else {
      this.showPrevButton = this.currentTranslate > 0;
      this.showNextButton = 
        track.offsetWidth - this.currentTranslate > wrapper.offsetWidth;
    }

    this.cdr.detectChanges();
  }

  private calculateItemWidths(): void {
    if (!this.trackElement || !this.wrapperElement) return;
    
    const track = this.trackElement.nativeElement;
    const wrapper = this.wrapperElement.nativeElement;
    const items = Array.from(track.children) as HTMLElement[];
    
    // When items should take up 100% of parent width
    if (this.config.itemWidth === '100%' && this.config.enableOneItemScroll) {
      // Just use the parent width for all items
      const parentWidth = wrapper.offsetWidth;
      this.itemWidths = items.map(() => parentWidth);
      return;
    }
    
    this.itemWidths = items.map(item => {
      // Get the full width including margins
      const style = window.getComputedStyle(item);
      const width = item.offsetWidth;
      const marginLeft = parseInt(style.marginLeft || '0', 10);
      const marginRight = parseInt(style.marginRight || '0', 10);
      
      return width + marginLeft + marginRight;
    });
  }

  private getScrollAmount(): number {
    if (this.config.enableOneItemScroll && this.itemWidths.length > 0) {
      if (this.currentIndex < this.itemWidths.length) {
        return this.itemWidths[this.currentIndex];
      }
      // Fallback to the first item's width if currentIndex is out of bounds
      return this.itemWidths[0] || this.wrapperElement.nativeElement.offsetWidth;
    }
    
    const size = this.config.scrollSize || 'sm';
    
    // If scrollSize is numeric, use it as the number of items to scroll
    if (size === 'full') {
      // Use the wrapper's width (parent container) instead of the screen width
      return this.wrapperElement.nativeElement.offsetWidth;
    }
    
    return this.scrollSizeMap[size] || this.scrollSizeMap['sm'];
  }

  previous(): void {
    if (this.config.enableOneItemScroll) {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        // Calculate the exact position based on previous item widths
        if (this.currentIndex === 0) {
          // If we're at the first item, ensure we're at the beginning
          this.currentTranslate = 0;
        } else {
          // Calculate position based on widths of all previous items plus gaps
          const itemWidth = this.itemWidths[this.currentIndex] || this.wrapperElement.nativeElement.offsetWidth;
          
          // If we have gaps, consider them too
          const gapWidth = this.config.itemGap ? 
            parseInt(this.config.itemGap.replace('px', ''), 10) : 0;
          
          this.currentTranslate = this.currentIndex * (itemWidth + gapWidth);
        }
      }
    } else {
      const scrollAmount = this.getScrollAmount();
      this.currentTranslate = Math.max(0, this.currentTranslate - scrollAmount);
    }
    this.checkOverflow();
  }

  next(): void {
    const track = this.trackElement.nativeElement;
    const wrapper = this.wrapperElement.nativeElement;
    
    if (this.config.enableOneItemScroll) {
      if (this.currentIndex < this.filteredItems.length - 1) {
        // Get the width of the current item
        const itemWidth = this.itemWidths[this.currentIndex] || wrapper.offsetWidth;
        
        // If we have gaps, consider them too
        const gapWidth = this.config.itemGap ? 
          parseInt(this.config.itemGap.replace('px', ''), 10) : 0;
        
        this.currentIndex++;
        
        // Calculate position based on all previous items plus gaps
        if (this.config.itemWidth === '100%') {
          // For 100% width items, simply multiply by the index
          this.currentTranslate = this.currentIndex * (itemWidth + gapWidth);
        } else {
          // For variable width items, add the current item width
          this.currentTranslate += itemWidth + gapWidth;
        }
      }
    } else {
      const scrollAmount = this.getScrollAmount();
      const maxTranslate = this.isVertical
        ? track.offsetHeight - wrapper.offsetHeight
        : track.offsetWidth - wrapper.offsetWidth;

      this.currentTranslate = Math.min(
        maxTranslate,
        this.currentTranslate + scrollAmount
      );
    }
    this.checkOverflow();
  }

  /**
   * Gets the button shape styles based on configuration.
   * @private
   * @returns {Record<string, string>} The button shape styles
   */
  private getButtonShapeStyles(): Record<string, string> {
    const shape = this.config.navigationStyle?.buttonShape;
    
    // If borderRadius is explicitly set in button styles, warn about conflict
    if (this.config.navigationStyle?.nextButton?.['borderRadius'] || 
        this.config.navigationStyle?.prevButton?.['borderRadius'] ||
        this.config.searchStyle?.button?.['borderRadius']) {
      console.warn('Both buttonShape and borderRadius are set. buttonShape will take precedence.');
    }

    switch (shape) {
      case 'circle':
        return { borderRadius: '50%' };
      case 'rounded':
        return { borderRadius: '4px' };
      case 'square':
      default:
        return { borderRadius: '0' };
    }
  }

  /**
   * Gets the styles for the next navigation button.
   * @returns {Record<string, string>} The button styles
   */
  get nextButtonStyles(): Record<string, string> {
    const buttonStyles = { ...(this.config.navigationStyle?.nextButton || {}) };
    const shapeStyles = this.getButtonShapeStyles();
    
    // Remove borderRadius from buttonStyles if shape is specified
    if (this.config.navigationStyle?.buttonShape && buttonStyles) {
      delete buttonStyles['borderRadius'];
    }

    return {
      ...shapeStyles,
      ...buttonStyles
    };
  }

  /**
   * Gets the styles for the previous navigation button.
   * @returns {Record<string, string>} The button styles
   */
  get prevButtonStyles(): Record<string, string> {
    const buttonStyles = { ...(this.config.navigationStyle?.prevButton || {}) };
    const shapeStyles = this.getButtonShapeStyles();
    
    // Remove borderRadius from buttonStyles if shape is specified
    if (this.config.navigationStyle?.buttonShape && buttonStyles) {
      delete buttonStyles['borderRadius'];
    }

    return {
      ...shapeStyles,
      ...buttonStyles
    };
  }

  /**
   * Gets the styles for the search button.
   * @returns {Record<string, string>} The button styles
   */
  get searchButtonStyles(): Record<string, string> {
    const buttonStyles = { ...(this.config.searchStyle?.button || {}) };
    const shapeStyles = this.getButtonShapeStyles();
    
    // Remove borderRadius from buttonStyles if shape is specified
    if (this.config.navigationStyle?.buttonShape && buttonStyles) {
      delete buttonStyles['borderRadius'];
    }

    return {
      ...shapeStyles,
      ...buttonStyles
    };
  }

  /** Get styles for carousel items */
  getItemStyle(index: number): Record<string, string> {
    const baseStyles: Record<string, string> = {
      width: this.config.itemWidth || '200px',
      height: this.config.itemHeight || '100%',
      flexShrink: '0',
      flexGrow: '0',
      boxSizing: 'border-box'
    };

    // Ensure width is relative to parent when set to 100%
    if (this.config.itemWidth === '100%' && this.config.enableOneItemScroll) {
      baseStyles['width'] = '100%';
      baseStyles['maxWidth'] = '100%';
    }

    if (!this.config.itemGap) return baseStyles;

    const marginProperty = this.isVertical ? 'marginTop' : 'marginLeft';
    return {
      ...baseStyles,
      [marginProperty]: index === 0 ? '0' : this.config.itemGap
    };
  }

  get contentPadding(): string {
    return this.config.contentPadding || '4px';
  }

  get animationDuration(): string {
    return this.config.animationDuration || '300ms';
  }

  get animationTiming(): string {
    return this.config.animationTiming || 'ease';
  }

  get showSearch(): boolean {
    return this.config.enableSearch ?? false;
  }

  get searchPlaceholder(): string {
    return this.config.searchPlaceholder || 'Search...';
  }

  get searchModalTitle(): string {
    return this.config.searchModalTitle || 'Filter Items';
  }

  get searchModalStyles(): Record<string, string> {
    return this.config.searchStyle?.modal || {};
  }

  toggleSearchModal(): void {
    this.isSearchModalOpen = !this.isSearchModalOpen;
    if (this.isSearchModalOpen && this.searchInput) {
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
      });
    }
  }

  closeSearchModal(): void {
    this.isSearchModalOpen = false;
  }

  applySearch(): void {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      this.filteredItems = this.items;
    } else {
      this.filteredItems = this.items.filter((item) => {
        if (typeof item === 'string') {
          return item.toLowerCase().includes(query);
        }
        return Object.values(item).some(
          (value) =>
            typeof value === 'string' && value.toLowerCase().includes(query)
        );
      });
    }

    this.currentTranslate = 0;
    this.currentIndex = 0;
    this.checkOverflow();
    this.closeSearchModal();
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    const searchContainer = document.querySelector('.nsc__search');
    if (
      this.isSearchModalOpen &&
      searchContainer &&
      !searchContainer.contains(event.target as Node)
    ) {
      this.closeSearchModal();
    }
  }

  getEmptyStateStyle(): Record<string, string> {
    return this.getItemStyle(0);
  }

  resetSearch(): void {
    this.searchQuery = '';
    this.filteredItems = this.items;
    this.currentTranslate = 0;
    this.currentIndex = 0;
    
    // Recalculate item widths when items change
    setTimeout(() => {
      this.calculateItemWidths();
      this.checkOverflow();
    });
  }

  /** Get navigation icons based on configuration and orientation */
  private getNavigationIcons(): { prev: string; next: string; search: string } {
    const defaultIcons = {
      horizontal: { prev: '❮', next: '❯' },
      vertical: { prev: '❮', next: '❯' },
      search: '🔍'
    };

    const configIcons = this.config.navigationStyle?.icons || {};
    const verticalIcons = configIcons.vertical || {};

    if (this.isVertical) {
      return {
        prev: verticalIcons.prev || defaultIcons.vertical.prev,
        next: verticalIcons.next || defaultIcons.vertical.next,
        search: configIcons.search || defaultIcons.search
      };
    }

    return {
      prev: configIcons.prev || defaultIcons.horizontal.prev,
      next: configIcons.next || defaultIcons.horizontal.next,
      search: configIcons.search || defaultIcons.search
    };
  }

  /** Get icon for previous button */
  get prevIcon(): string {
    return this.getNavigationIcons().prev;
  }

  /** Get icon for next button */
  get nextIcon(): string {
    return this.getNavigationIcons().next;
  }

  /** Get icon for search button */
  get searchIcon(): string {
    return this.getNavigationIcons().search;
  }

  /** Get icon styles based on button configuration */
  get nextIconStyles(): Record<string, string> {
    const buttonStyles = this.config.navigationStyle?.nextButton || {};
    return {
      color: buttonStyles['color'] || '#666'
    };
  }

  /** Get icon styles based on button configuration */
  get prevIconStyles(): Record<string, string> {
    const buttonStyles = this.config.navigationStyle?.prevButton || {};
    return {
      color: buttonStyles['color'] || '#666'
    };
  }

  /** Get icon styles based on button configuration */
  get searchIconStyles(): Record<string, string> {
    const buttonStyles = this.config.searchStyle?.button || {};
    return {
      color: buttonStyles['color'] || '#666'
    };
  }

  /** Get whether navigation should be shown */
  get showNavigation(): boolean {
    return this.config.showNavigation ?? true;
  }
}