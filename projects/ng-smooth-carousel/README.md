# ng-smooth-carousel

A smooth, flexible, and customizable carousel component for Angular 14+.

## Features

- Fully customizable item templates using ng-template
- Dynamic configuration for container and item dimensions
- Responsive design with breakpoints support
- Customizable navigation arrows
- Smooth animations with configurable timing
- Auto-play support
- Touch-friendly
- TypeScript support with full type definitions

## Installation

```bash
npm install ng-smooth-carousel
```

## Usage

1. Import the module in your app.module.ts:

```typescript
import { NgSmoothCarouselModule } from 'ng-smooth-carousel';

@NgModule({
  imports: [
    NgSmoothCarouselModule
  ]
})
export class AppModule { }
```

2. Use the carousel in your component:

```typescript
import { Component } from '@angular/core';
import { CarouselConfig } from 'ng-smooth-carousel';

@Component({
  selector: 'app-root',
  template: `
    <nsc-carousel [items]="items" [config]="carouselConfig">
      <ng-template #carouselItem let-item let-i="index">
        <div class="custom-item">
          {{ item.title }}
        </div>
      </ng-template>
    </nsc-carousel>
  `
})
export class AppComponent {
  items = [
    { title: 'Item 1' },
    { title: 'Item 2' },
    { title: 'Item 3' }
  ];

  carouselConfig: CarouselConfig = {
    containerWidth: '100%',
    containerHeight: '300px',
    itemWidth: '200px',
    itemHeight: '200px',
    itemGap: '20px',
    showNavigation: true,
    navigationPosition: 'inside',
    animationDuration: 300,
    autoplay: true,
    autoplayDelay: 3000
  };
}
```

## Configuration Options

The carousel can be configured using the `CarouselConfig` interface:

```typescript
interface CarouselConfig {
  // Container configuration
  containerWidth?: string;
  containerHeight?: string;
  
  // Item configuration
  itemWidth?: string;
  itemHeight?: string;
  itemGap?: string;
  
  // Navigation configuration
  showNavigation?: boolean;
  navigationPosition?: 'inside' | 'outside';
  navigationStyle?: {
    prevButton?: Partial<ButtonStyle>;
    nextButton?: Partial<ButtonStyle>;
  };
  
  // Animation configuration
  animationDuration?: number;
  animationTimingFunction?: string;
  
  // Behavior configuration
  autoplay?: boolean;
  autoplayDelay?: number;
  loop?: boolean;
  
  // Responsive configuration
  breakpoints?: {
    [key: number]: Partial<CarouselConfig>;
  };
}
```

## Styling

The carousel comes with minimal default styling that can be easily overridden using CSS classes:

```css
.nsc-carousel-container {
  /* Container styles */
}

.nsc-carousel-item {
  /* Item styles */
}

.nsc-carousel-nav {
  /* Navigation button styles */
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
