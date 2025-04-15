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
      <div *ngIf="showNavigation" [style.--nav-size]="navigationSize" [style.--nav-padding]="navigationPadding" class="nsc__nav-area nsc__nav-area--prev">
        <div class="nsc__nav-group">
          <div class="nsc__search" *ngIf="showSearch">
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
        </div>
      </div>

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

      <div *ngIf="showNavigation" [style.--nav-size]="navigationSize" [style.--nav-padding]="navigationPadding" class="nsc__nav-area nsc__nav-area--next">
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
      .nsc {
        position: relative;
        overflow: hidden;
        width: 100%;
        display: flex;
        align-items: stretch;
      }

      .nsc--vertical {
        flex-direction: column;
      }

      .nsc__nav-area {
        flex: 0 0 var(--nav-size, 60px);
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        padding: 0 var(--nav-padding, 10px);
      }

      .nsc--vertical .nsc__nav-area {
        height: var(--nav-size, 60px);
        flex: 0 0 var(--nav-size, 60px);
        width: 100%;
        padding: var(--nav-padding, 10px) 0;
      }

      .nsc__wrapper {
        flex: 1;
        overflow: hidden;
        position: relative;
        padding: var(--content-padding, 10px) 0;
      }

      .nsc--vertical .nsc__wrapper {
        padding: 0 var(--content-padding, 10px);
      }

      .nsc__track {
        display: flex;
        flex-wrap: nowrap;
        transition: transform var(--animation-duration, 0.3s) var(--animation-timing, ease);
        width: fit-content;
      }

      .nsc__track--vertical {
        flex-direction: column;
        width: 100%;
        height: fit-content;
      }

      .nsc__item {
        flex: 0 0 auto;
      }

      .nsc--vertical .nsc__item {
        width: 100%;
      }

      .nsc__item-default {
        background: white;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        padding: 20px;
      }

      .nsc__nav-button {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 1px solid #e0e0e0;
        width: 32px;
        height: 32px;
        padding: 0;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        z-index: 1;
      }

      .nsc__nav-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        font-size: 16px;
        line-height: 1;
      }

      .nsc__nav-button:hover:not(.nsc__nav-button--disabled) {
        opacity: 0.8;
        transform: translate(-50%, -50%) scale(1.05);
      }

      .nsc--vertical .nsc__nav-button:hover:not(.nsc__nav-button--disabled) {
        transform: scale(1.05);
      }

      .nsc__nav-button--disabled {
        opacity: 0.4;
        cursor: not-allowed;
        background-color: #f5f5f5;
        border-color: #ddd;
        transition: all 0.2s ease;
      }

      .nsc__nav-group {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        height: 100%;
      }

      .nsc--vertical .nsc__nav-group {
        flex-direction: row;
        justify-content: center;
      }

      .nsc--vertical .nsc__search {
        position: relative;
        bottom: auto;
        left: auto;
        transform: none;
        margin-right: 16px;
      }

      .nsc--vertical .nsc__nav-button {
        position: static;
        transform: none;
      }

      .nsc__search {
        position: absolute;
        bottom: 50px;
        left: 50%;
        z-index: 1000;
        transform: translateX(-50%);
      }

      .nsc__nav-button--search {
        position: static;
        transform: none;
      }
        
      .nsc__dropdown {
        position: absolute;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        min-width: 200px;
      }

      .nsc--vertical .nsc__dropdown {
        left: calc(100% + 8px);
        top: 0;
      }

      .nsc__dropdown--vertical {
        top: 100%;
        left: 0;
        margin-top: 8px;
      }

      .nsc__search-input {
        width: 100%;
        padding: 8px 12px;
        border: none;
        font-size: 14px;
        outline: none;
      }

      .nsc__search-input:focus {
        background: #f8f8f8;
      }

      .nsc__empty-state {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
      }

      .nsc__empty-icon {
        font-size: 48px;
        color: #999;
        line-height: 1;
      }

      .nsc__empty-text {
        color: #666;
        font-size: 14px;
        margin: 0;
      }

      .nsc__reset-button {
        background: none;
        border: none;
        padding: 6px 12px;
        font-size: 13px;
        color: #007bff;
        cursor: pointer;
        transition: opacity 0.2s ease;
      }

      .nsc__reset-button:hover {
        opacity: 0.7;
      }

      .nsc--vertical .nsc__nav-button .nsc__nav-icon {
        transform: rotate(90deg);
      }
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
  private destroy$ = new Subject<void>();
  private autoplayInterval?: ReturnType<typeof setInterval>;

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

    if (this.isVertical) {
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

  private getScrollAmount(): number {
    const size = this.config.scrollSize || 'sm';
    return this.scrollSizeMap[size] || this.scrollSizeMap['sm'];
  }

  previous(): void {
    const scrollAmount = this.getScrollAmount();
    this.currentTranslate = Math.max(0, this.currentTranslate - scrollAmount);
    this.checkOverflow();
  }

  next(): void {
    const track = this.trackElement.nativeElement;
    const wrapper = this.wrapperElement.nativeElement;
    const scrollAmount = this.getScrollAmount();
    const maxTranslate = this.isVertical
      ? track.offsetHeight - wrapper.offsetHeight
      : track.offsetWidth - wrapper.offsetWidth;

    this.currentTranslate = Math.min(
      maxTranslate,
      this.currentTranslate + scrollAmount
    );
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

    if (!this.config.itemGap) return baseStyles;

    const marginProperty = this.isVertical ? 'marginTop' : 'marginLeft';
    return {
      ...baseStyles,
      [marginProperty]: index === 0 ? '0' : this.config.itemGap
    };
  }

  get navigationSize(): string {
    return this.config.navigationSize || '60px';
  }

  get navigationPadding(): string {
    return this.config.navigationPadding || '4px';
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
    this.checkOverflow();
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
