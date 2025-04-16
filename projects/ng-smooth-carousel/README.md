# ng-smooth-carousel

![Angular 14 Compatible](https://img.shields.io/badge/Angular-14-brightgreen)

A smooth, customizable carousel component for Angular, supporting both vertical and horizontal orientations.

## Features

- 🎯 Smooth scrolling animation ✅
- 🔄 Flexible orientation support (vertical & horizontal) ✅
- 🎨 Highly customizable navigation buttons and styling ✅
- 📱 Responsive design ✅
- 🎮 Multiple navigation options ✅
- 🎯 Custom item templates ✅
- 🔄 Auto-play support ✅
- 🔄 Full-width single item support ✅
- 🔄 Tab-friendly with visibility detection ✅

## Coming Soon

- 🔍 Enhanced search filtering with advanced options ❌
- ⚡ Click-hold-swap interaction for improved user experience ❌
- 🔄 Loop functionality ❌

## Installation

**For Angular 14:**

```typescript
npm install ng-smooth-carousel@14.0.3
```

Or with yarn:

```typescript
yarn add ng-smooth-carousel@14.0.3
```

## Usage

1. Import the `NgSmoothCarouselModule` in your module:

```typescript
import { NgModule } from '@angular/core';
import { NgSmoothCarouselModule } from 'ng-smooth-carousel';

@NgModule({
  imports: [
    NgSmoothCarouselModule
  ],
  // ...
})
export class YourModule {}
```

2. For standalone components:

```typescript
import { Component } from '@angular/core';
import { NgSmoothCarouselModule } from 'ng-smooth-carousel';

@Component({
  // ...
  standalone: true,
  imports: [NgSmoothCarouselModule]
})
export class YourComponent {}
```

3. Use in your template:

```html
<!-- Horizontal Carousel (Default) -->
<nsc [items]="items" [config]="carouselConfig">
  <ng-template #carouselItem let-item>
    <div class="custom-item">
      {{ item.title }}
    </div>
  </ng-template>
</nsc>

<!-- Vertical Carousel -->
<nsc [items]="items" [config]="{ orientation: 'vertical' }">
  <ng-template #carouselItem let-item>
    <div class="custom-item">
      {{ item.title }}
    </div>
  </ng-template>
</nsc>
```

4. Configure in your component:

```typescript
import { Component } from '@angular/core';
import { CarouselConfig } from 'ng-smooth-carousel';

@Component({
  // ...
})
export class YourComponent {
  items = [
    { title: 'Item 1' },
    { title: 'Item 2' },
    // ...
  ];

  carouselConfig: CarouselConfig = {
    // Layout Configuration
    containerWidth: '100%',
    containerHeight: 'auto',
    itemWidth: '200px',
    itemHeight: '200px',
    itemGap: '16px',
    orientation: 'horizontal', // or 'vertical'
    
    // Navigation Configuration
    showNavigation: true,     // defaults to true
    navigationSize: '60px',
    navigationPadding: '4px',
    
    // Animation & Scroll
    animationDuration: '300ms',
    scrollSize: 'md',         // 'xs' to '10xl'
    
    // Features
    enableSearch: false,
    loop: false,
    autoplay: false,
    autoplayDelay: '3000ms',
    
    // Navigation Styling
    navigationStyle: {
      buttonShape: 'rounded', // 'circle' | 'rounded' | 'square'
      nextButton: {
        backgroundColor: '#fff',
        color: '#333',
        border: '1px solid #ddd'
      },
      prevButton: {
        backgroundColor: '#fff',
        color: '#333',
        border: '1px solid #ddd'
      }
    }
  };
}
```

### Basic Carousel
```typescript
carouselConfig: CarouselConfig = {
  containerWidth: '100%',
  containerHeight: '300px',
  itemWidth: '400px',
  itemHeight: '100%',
  itemGap: '24px',
  navigationStyle: {
    buttonShape: 'rounded',
  },
};
```

## Configuration Options

### Basic Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `containerWidth` | string | '100%' | Width of the carousel container |
| `containerHeight` | string | 'auto' | Height of the carousel container |
| `itemWidth` | string | '200px' | Width of each carousel item |
| `itemHeight` | string | '100%' | Height of each carousel item |
| `itemGap` | string | '0px' | Gap between carousel items |
| `showNavigation` | boolean | true | Show/hide navigation buttons |
| `orientation` | 'horizontal' \| 'vertical' | 'horizontal' | Carousel orientation |
| `animationDuration` | string | '300ms' | Duration of scroll animation |
| `animationTiming` | string | 'ease' | Timing function for animation |
| `contentPadding` | string | '10px' | Padding for the content area |
| `navigationSize` | string | '60px' | Size of navigation areas |
| `navigationPadding` | string | '10px' | Padding for navigation areas |

### Advanced Features

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `autoplay` | boolean | false | Enable autoplay ✅ |
| `autoplayDelay` | string | '3000ms' | Delay between autoplay slides ✅ |
| `loop` | boolean | false | Enable infinite loop ❌ |
| `enableSearch` | boolean | false | Enable search functionality ✅ |
| `searchPlaceholder` | string | 'Search...' | Placeholder text for search input ✅ |
| `searchModalTitle` | string | 'Search Items' | Title for search modal ✅ |
| `enableOneItemScroll` | boolean | false | Enable scrolling one item at a time ✅ |

### Full-Width Single Item Carousel

To create a carousel that displays and scrolls through one full-width item at a time (common for hero sliders or product showcases), use the following configuration:

```typescript
carouselConfig: CarouselConfig = {
  containerWidth: '100%',
  containerHeight: '300px',
  itemWidth: '100%',
  itemHeight: '100%',
  enableOneItemScroll: true,
};
```

This configuration creates a clean, full-width carousel where each item takes up the entire container width and scrolls individually.

### Scroll Sizes

The `scrollSize` property accepts the following values, each moving by a specific number of pixels:

```typescript
type ScrollSize = 
  | 'xs'   // 50px
  | 'sm'   // 100px
  | 'md'   // 150px
  | 'lg'   // 200px
  | 'xl'   // 250px
  | '2xl'  // 300px
  | '3xl'  // 350px
  | '4xl'  // 400px
  | '5xl'  // 450px
  | '6xl'  // 500px
  | '7xl'  // 550px
  | '8xl'  // 600px
  | '9xl'  // 650px
  | '10xl' // 700px
```

### Button Shapes

The `buttonShape` property in `navigationStyle` accepts:

```typescript
type NavButtonShape = 'circle' | 'rounded' | 'square';
```

### NavigationStyle Interface

```typescript
interface NavigationStyle {
  buttonShape?: NavButtonShape;
  nextButton?: Record<string, string>;
  prevButton?: Record<string, string>;
  icons?: {
    next?: string;
    prev?: string;
    search?: string;
    vertical?: {
      next?: string;
      prev?: string;
    };
  };
}
```

### ButtonStyle Interface

```typescript
interface ButtonStyle {
  backgroundColor?: string;
  color?: string;
  borderRadius?: string;
  padding?: string;
  fontSize?: string;
  border?: string;
  boxShadow?: string;
}
```

### SearchStyle Interface

```typescript
interface SearchStyle {
  button?: Record<string, string>;
  modal?: Record<string, string>;
}
```

## Angular Version Compatibility

| Angular Version | Package Version |
|-----------------|-----------------|
| Angular 14      | 14.0.4          |
| Angular 17+     | Coming soon     |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please create an issue in the [GitHub repository](https://github.com/kinleyrabgay/ng-smooth-carousel/issues).

## Changelog

See CHANGELOG.md for a list of changes and updates.