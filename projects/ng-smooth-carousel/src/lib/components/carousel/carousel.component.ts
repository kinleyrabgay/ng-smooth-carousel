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
import { CarouselConfig } from '../../models/carousel-config.interface';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'ng-smooth-carousel',
  template: `
    <div [class.vertical]="isVertical" [ngStyle]="containerStyles" class="nsc-carousel-container">
      <div [style.--nav-size]="navigationSize" [style.--nav-padding]="navigationPadding" class="nsc-carousel-nav-area nsc-carousel-prev-area">
        <div class="nsc-carousel-nav-group">
          <div class="nsc-search-container" *ngIf="showSearch">
            <button [ngStyle]="searchButtonStyles" (click)="toggleSearchModal()" class="nsc-carousel-nav nsc-carousel-search">
              <span class="nav-icon" [ngStyle]="searchIconStyles">{{ searchIcon }}</span>
            </button>
            <div *ngIf="isSearchModalOpen" [class.vertical]="isVertical" (click)="$event.stopPropagation()" class="nsc-search-dropdown" >
              <input
                type="text"
                [placeholder]="searchPlaceholder"
                [(ngModel)]="searchQuery"
                (keyup.enter)="applySearch()"
                class="nsc-search-input"
                #searchInput
              />
            </div>
          </div>
          <button [class.disabled]="!showPrevButton" [disabled]="!showPrevButton" [ngStyle]="prevButtonStyles" (click)="previous()" class="nsc-carousel-nav">
            <span class="nav-icon" [ngStyle]="prevIconStyles">{{ prevIcon }}</span>
          </button>
        </div>
      </div>

      <div
        #wrapper
        [style.--content-padding]="contentPadding"
        class="nsc-carousel-wrapper">
        <div
          #track
          [ngStyle]="trackStyles"
          [class.vertical]="isVertical"
          [style.--animation-duration]="animationDuration"
          [style.--animation-timing]="animationTiming"
          class="nsc-carousel-track">
          <ng-container *ngIf="filteredItems.length > 0; else noResults">
            <ng-container *ngFor="let item of filteredItems; let i = index">
              <div class="nsc-carousel-item" [ngStyle]="getItemStyle(i)">
                <ng-container *ngIf="itemTemplate; else defaultTemplate">
                  <ng-container *ngTemplateOutlet="itemTemplate; context: { $implicit: item, index: i }"></ng-container>
                </ng-container>
                <ng-template #defaultTemplate>
                  <div class="nsc-carousel-default-item">
                    {{ item }}
                  </div>
                </ng-template>
              </div>
            </ng-container>
          </ng-container>
          <ng-template #noResults>
            <div class="nsc-carousel-item" [ngStyle]="getEmptyStateStyle()">
              <div class="nsc-carousel-empty-state">
                <div class="empty-icon">📭</div>
                <div class="empty-text">No items found</div>
                <button class="reset-search" (click)="resetSearch()">
                  Show all items
                </button>
              </div>
            </div>
          </ng-template>
        </div>
      </div>

      <div [style.--nav-size]="navigationSize" [style.--nav-padding]="navigationPadding" class="nsc-carousel-nav-area nsc-carousel-next-area">
        <button
          [class.disabled]="!showNextButton"
          [disabled]="!showNextButton"
          [ngStyle]="nextButtonStyles"
          (click)="next()"
          class="nsc-carousel-nav">
          <span class="nav-icon" [ngStyle]="nextIconStyles">{{ nextIcon }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .nsc-carousel-container {
        position: relative;
        overflow: hidden;
        width: 100%;
        display: flex;
        align-items: stretch;
      }

      .nsc-carousel-container.vertical {
        flex-direction: column;
      }

      .nsc-carousel-nav-area {
        flex: 0 0 var(--nav-size, 60px);
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        padding: 0 var(--nav-padding, 10px);
      }

      .vertical .nsc-carousel-nav-area {
        height: var(--nav-size, 60px);
        flex: 0 0 var(--nav-size, 60px);
        width: 100%;
        padding: var(--nav-padding, 10px) 0;
      }

      .nsc-carousel-wrapper {
        flex: 1;
        overflow: hidden;
        position: relative;
        padding: var(--content-padding, 10px) 0;
      }

      .vertical .nsc-carousel-wrapper {
        padding: 0 var(--content-padding, 10px);
      }

      .nsc-carousel-track {
        display: flex;
        flex-wrap: nowrap;
        transition: transform var(--animation-duration, 0.3s)
          var(--animation-timing, ease);
        width: fit-content;
      }

      .nsc-carousel-track.vertical {
        flex-direction: column;
        width: 100%;
        height: fit-content;
      }

      .nsc-carousel-item {
        flex: 0 0 auto;
      }

      .vertical .nsc-carousel-item {
        width: 100%;
      }

      .nsc-carousel-default-item {
        background: white;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        padding: 20px;
      }

      .nsc-carousel-nav {
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
        transition: all var(--animation-duration, 0.3s)
          var(--animation-timing, ease);
        z-index: 1;
      }

      .nav-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        font-size: 16px;
        line-height: 1;
      }

      .nsc-carousel-nav:hover:not(.disabled) {
        opacity: 0.8;
      }

      .nsc-carousel-nav.disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .nsc-carousel-nav-group {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        height: 100%;
      }

      .vertical .nsc-carousel-nav-group {
        flex-direction: row;
        justify-content: center;
      }

      .vertical .nsc-search-container {
        position: relative;
        bottom: auto;
        left: auto;
        transform: none;
        margin-right: 8px;
      }

      .vertical .nsc-carousel-nav {
        position: static;
        transform: none;
      }

      .nsc-search-container {
        position: absolute;
        bottom: -40px;
        left: 50%;
        transform: translateX(-50%);
      }

      .nsc-carousel-search {
        position: static;
        transform: none;
      }

      .nsc-search-dropdown {
        position: absolute;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        min-width: 200px;
      }

      /* Position dropdown based on orientation */
      .nsc-search-dropdown:not(.vertical) {
        left: 100%;
        top: 0;
        margin-left: 8px;
      }

      .nsc-search-dropdown.vertical {
        top: 100%;
        left: 0;
        margin-top: 8px;
      }

      .nsc-search-input {
        width: 100%;
        padding: 8px 12px;
        border: none;
        font-size: 14px;
        outline: none;
      }

      .nsc-search-input:focus {
        background: #f8f8f8;
      }

      .nsc-carousel-empty-state {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
      }

      .empty-icon {
        font-size: 48px;
        color: #999;
        line-height: 1;
      }

      .empty-text {
        color: #666;
        font-size: 14px;
        margin: 0;
      }

      .reset-search {
        background: none;
        border: none;
        padding: 6px 12px;
        font-size: 13px;
        color: #007bff;
        cursor: pointer;
        transition: opacity 0.2s ease;
      }

      .reset-search:hover {
        opacity: 0.7;
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
      const track = this.trackElement.nativeElement;
      const wrapper = this.wrapperElement.nativeElement;
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
    if (this.trackElement && this.wrapperElement) {
      this.checkOverflow();
    }
  }

  private setupResizeListener(): void {
    fromEvent(window, 'resize')
      .pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(() => {
        this.checkOverflow();
      });
  }

  private checkOverflow(): void {
    if (!this.config.showNavigation) {
      this.showPrevButton = false;
      this.showNextButton = false;
      return;
    }

    const track = this.trackElement.nativeElement;
    const wrapper = this.wrapperElement.nativeElement;

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

  /** Get button shape styles based on configuration */
  private getButtonShapeStyles(): Record<string, string> {
    const shape = this.config.navigationStyle?.buttonShape;
    switch (shape) {
      case 'circle':
        return {
          borderRadius: '50%'
        };
      case 'rounded':
        return {
          borderRadius: '8px'
        };
      case 'square':
      default:
        return {
          borderRadius: '0'
        };
    }
  }

  /** Get styles for next navigation button */
  get nextButtonStyles(): Record<string, string> {
    const buttonStyles = this.config.navigationStyle?.nextButton || {};
    return {
      ...this.getButtonShapeStyles(),
      ...buttonStyles,
      // Ensure border-radius is applied last
      borderRadius: this.config.navigationStyle?.buttonShape === 'circle' ? '50%' : buttonStyles['borderRadius'] || '0'
    };
  }

  /** Get styles for previous navigation button */
  get prevButtonStyles(): Record<string, string> {
    const buttonStyles = this.config.navigationStyle?.prevButton || {};
    return {
      ...this.getButtonShapeStyles(),
      ...buttonStyles,
      // Ensure border-radius is applied last
      borderRadius: this.config.navigationStyle?.buttonShape === 'circle' ? '50%' : buttonStyles['borderRadius'] || '0'
    };
  }

  /** Get styles for search button */
  get searchButtonStyles(): Record<string, string> {
    const buttonStyles = this.config.searchStyle?.button || {};
    return {
      ...this.getButtonShapeStyles(),
      ...buttonStyles,
      // Ensure border-radius is applied last
      borderRadius: this.config.navigationStyle?.buttonShape === 'circle' ? '50%' : buttonStyles['borderRadius'] || '0'
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
    return this.config.navigationPadding || '10px';
  }

  get contentPadding(): string {
    return this.config.contentPadding || '10px';
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
    const searchContainer = document.querySelector('.nsc-search-container');
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
      horizontal: { prev: '←', next: '→' },
      vertical: { prev: '↑', next: '↓' },
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
}
