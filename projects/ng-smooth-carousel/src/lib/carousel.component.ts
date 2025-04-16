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
            <div class="nsc__item" [ngStyle]="getItemStyle(0)">
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
      .nsc{position:relative;overflow:hidden;display:flex;flex-direction:column;border-radius:inherit}
      .nsc--vertical{flex-direction:column}
      .nsc__wrapper{flex:1;overflow:hidden;position:relative;padding:var(--content-padding,10px) 0;width:100%;border-radius:inherit}
      .nsc--vertical .nsc__wrapper{padding:0 var(--content-padding,10px)}
      .nsc__track{display:flex;flex-wrap:nowrap;transition:transform var(--animation-duration,.3s) var(--animation-timing,ease);width:fit-content;min-width:100%;border-radius:inherit}
      .nsc__track--vertical{flex-direction:column;width:100%;height:fit-content}
      .nsc__item{flex:0 0 auto;box-sizing:border-box;border-radius:inherit}
      .nsc--vertical .nsc__item{width:100%}
      .nsc__item-default{background:#fff;height:100%;display:flex;align-items:center;justify-content:center;border:1px solid #e0e0e0;border-radius:inherit;padding:20px}
      .nsc__nav-controls{position:absolute;bottom:16px;right:16px;display:flex;gap:24px;z-index:5}
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
  private itemHeights: number[] = [];
  private containerWidth: number = 0;
  private containerHeight: number = 0;

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

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.filteredItems = this.items;
  }

  private parseTimeToMs(time: string): number {
    if (time.endsWith('ms')) return parseInt(time.slice(0, -2), 10);
    if (time.endsWith('s')) return parseFloat(time.slice(0, -1)) * 1000;
    return parseInt(time, 10);
  }

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

  ngAfterViewInit(): void {
    this.initializeCarousel();
    this.setupResizeListener();
    this.setupAutoplay();
    
    setTimeout(() => {
      this.updateContainerWidth();
      this.calculateItemWidths();
      this.checkOverflow();
    });
  }

  ngOnDestroy(): void {
    if (this.autoplayInterval) clearInterval(this.autoplayInterval);
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
    const base = {
      transform: this.isVertical
        ? `translateY(-${this.currentTranslate}px)`
        : `translateX(-${this.currentTranslate}px)`,
    };
    return this.isVertical ? { ...base, flexDirection: 'column' } : base;
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
        this.updateContainerWidth();
        this.calculateItemWidths();
        this.checkOverflow();
      });
  }

  private updateContainerWidth(): void {
    if (!this.wrapperElement) return;
    this.containerWidth = this.wrapperElement.nativeElement.offsetWidth;
    this.containerHeight = this.wrapperElement.nativeElement.offsetHeight;
  }

  private checkOverflow(): void {
    if (!this.showNavigation) {
      this.showPrevButton = this.showNextButton = false;
      return;
    }

    const t = this.trackElement?.nativeElement;
    const w = this.wrapperElement?.nativeElement;
    if (!t || !w) return;

    if (this.config.enableOneItemScroll) {
      this.showPrevButton = this.currentIndex > 0;
      this.showNextButton = this.currentIndex < this.filteredItems.length - 1;
    } else if (this.isVertical) {
      this.showPrevButton = this.currentTranslate > 0;
      this.showNextButton = t.offsetHeight - this.currentTranslate > w.offsetHeight;
    } else {
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

  private getScrollAmount(): number {
    if (this.config.enableOneItemScroll) {
      if (this.isVertical && this.itemHeights.length > 0) {
        if (this.currentIndex < this.itemHeights.length) {
          return this.itemHeights[this.currentIndex];
        }
        return this.itemHeights[0] || this.wrapperElement.nativeElement.offsetHeight;
      } else if (this.itemWidths.length > 0) {
        if (this.currentIndex < this.itemWidths.length) {
          return this.itemWidths[this.currentIndex];
        }
        return this.itemWidths[0] || this.wrapperElement.nativeElement.offsetWidth;
      }
    }
    
    const size = this.config.scrollSize || 'sm';
    if (size === 'full') {
      return this.isVertical 
        ? this.wrapperElement.nativeElement.offsetHeight 
        : this.wrapperElement.nativeElement.offsetWidth;
    }
    return this.scrollSizeMap[size as keyof typeof this.scrollSizeMap] || this.scrollSizeMap['sm'];
  }

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

  private getButtonShapeStyles(): Record<string, string> {
    const shape = this.config.navigationStyle?.buttonShape;
    switch (shape) {
      case 'circle': return { borderRadius: '50%' };
      case 'rounded': return { borderRadius: '4px' };
      default: return { borderRadius: '0' };
    }
  }

  get nextButtonStyles(): Record<string, string> {
    const bs = { ...(this.config.navigationStyle?.nextButton || {}) };
    const ss = this.getButtonShapeStyles();
    if (this.config.navigationStyle?.buttonShape && bs) delete bs['borderRadius'];
    return { ...ss, ...bs };
  }

  get prevButtonStyles(): Record<string, string> {
    const bs = { ...(this.config.navigationStyle?.prevButton || {}) };
    const ss = this.getButtonShapeStyles();
    if (this.config.navigationStyle?.buttonShape && bs) delete bs['borderRadius'];
    return { ...ss, ...bs };
  }

  get searchButtonStyles(): Record<string, string> {
    const bs = { ...(this.config.searchStyle?.button || {}) };
    const ss = this.getButtonShapeStyles();
    if (this.config.navigationStyle?.buttonShape && bs) delete bs['borderRadius'];
    return { ...ss, ...bs };
  }

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
        // Adjust width based on orientation
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
          // Adjust height based on orientation
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

    // Apply border radius based on button shape
    if (this.config.navigationStyle?.buttonShape === 'rounded') {
      s['borderRadius'] = '4px';
    } else if (this.config.navigationStyle?.buttonShape === 'circle') {
      s['borderRadius'] = '50%';
    }

    // Add margin for gap between items
    if (!this.config.itemGap) return s;

    const m = this.isVertical ? 'marginTop' : 'marginLeft';
    return { ...s, [m]: index === 0 ? '0' : this.config.itemGap };
  }

  get contentPadding(): string { return this.config.contentPadding || '4px'; }
  get animationDuration(): string { return this.config.animationDuration || '300ms'; }
  get animationTiming(): string { return this.config.animationTiming || 'ease'; }
  get showSearch(): boolean { return this.config.enableSearch ?? false; }
  get searchPlaceholder(): string { return this.config.searchPlaceholder || 'Search...'; }
  get searchModalTitle(): string { return this.config.searchModalTitle || 'Filter Items'; }
  get searchModalStyles(): Record<string, string> { return this.config.searchStyle?.modal || {}; }

  toggleSearchModal(): void {
    this.isSearchModalOpen = !this.isSearchModalOpen;
    if (this.isSearchModalOpen && this.searchInput) {
      setTimeout(() => this.searchInput.nativeElement.focus());
    }
  }

  closeSearchModal(): void {
    this.isSearchModalOpen = false;
  }

  applySearch(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.filteredItems = this.items;
    } else {
      this.filteredItems = this.items.filter(item => {
        if (typeof item === 'string') return item.toLowerCase().includes(q);
        return Object.values(item).some(v => typeof v === 'string' && v.toLowerCase().includes(q));
      });
    }

    this.currentTranslate = 0;
    this.currentIndex = 0;
    this.checkOverflow();
    this.closeSearchModal();
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    const sc = document.querySelector('.nsc__search');
    if (this.isSearchModalOpen && sc && !sc.contains(event.target as Node)) {
      this.closeSearchModal();
    }
  }

  resetSearch(): void {
    this.searchQuery = '';
    this.filteredItems = this.items;
    this.currentTranslate = 0;
    this.currentIndex = 0;
    setTimeout(() => {
      this.updateContainerWidth();
      this.calculateItemWidths();
      this.checkOverflow();
    });
  }

  private getNavigationIcons(): { prev: string; next: string; search: string } {
    const defIcons = {
      horizontal: { prev: '❮', next: '❯' },
      vertical: { prev: '❮', next: '❯' },
      search: '🔍'
    };

    const cfgIcons = this.config.navigationStyle?.icons || {};
    const vIcons = cfgIcons.vertical || {};

    if (this.isVertical) {
      return {
        prev: vIcons.prev || defIcons.vertical.prev,
        next: vIcons.next || defIcons.vertical.next,
        search: cfgIcons.search || defIcons.search
      };
    }

    return {
      prev: cfgIcons.prev || defIcons.horizontal.prev,
      next: cfgIcons.next || defIcons.horizontal.next,
      search: cfgIcons.search || defIcons.search
    };
  }

  get prevIcon(): string { return this.getNavigationIcons().prev; }
  get nextIcon(): string { return this.getNavigationIcons().next; }
  get searchIcon(): string { return this.getNavigationIcons().search; }

  get nextIconStyles(): Record<string, string> {
    return { color: (this.config.navigationStyle?.nextButton || {})['color'] || '#666' };
  }

  get prevIconStyles(): Record<string, string> {
    return { color: (this.config.navigationStyle?.prevButton || {})['color'] || '#666' };
  }

  get searchIconStyles(): Record<string, string> {
    return { color: (this.config.searchStyle?.button || {})['color'] || '#666' };
  }

  get showNavigation(): boolean {
    return this.config.showNavigation ?? true;
  }
}