# @ngfly/carousel

![Angular 17 Compatible](https://img.shields.io/badge/Angular-17-brightgreen)

A smooth, customizable carousel component for Angular, supporting both vertical and horizontal orientations.

> **Note:** All configurations and examples can be customized to fit your specific needs. Feel free to modify any aspect of the carousel to match your application's requirements.

> **Demo Coming Soon:** Interactive examples and live demos will be available soon!

## Features

- 🎯 Smooth scrolling animation ✅
- 🔄 Flexible orientation support (vertical & horizontal) ✅
- 🎨 Highly customizable navigation buttons and styling ✅
- 📱 Responsive design ✅
- 🎮 Multiple navigation options ✅
- 🎯 Custom item templates ✅
- 🔄 Auto-play support ✅
- 🔄 Full-width single item support ✅
- 🎨 Custom empty state templates ✅
- 🎯 Customizable navigation button positions ✅
- 🌟 Standalone component (Angular 17+) ✅
- 🔄 Loop functionality ✅
- 🎯 Customizable indicators with animations ✅
- 🌟 Lazy loading images for performance ✅

## Coming Soon

- 🔍 Enhanced search filtering with advanced options ❌
- ⚡ Click-hold-swap interaction for improved user experience ❌

## Installation

```typescript
npm install @ngfly/carousel
```

Or with yarn:

```typescript
yarn add @ngfly/carousel
```

## Usage

### For Standalone Components

Import and use the component directly in your standalone component:

```typescript
import { Component } from '@angular/core';
import { CarouselComponent, CarouselConfig, LazyLoadDirective } from '@ngfly/carousel';

@Component({
  // ...
  standalone: true,
  imports: [CarouselComponent, LazyLoadDirective]
})
export class YourComponent {
  // Your component code
}
```

### For NgModule-based Applications

1. Import the `CarouselModule` in your module:

```typescript
import { NgModule } from '@angular/core';
import { CarouselModule } from '@ngfly/carousel';

@NgModule({
  imports: [
    CarouselModule
  ],
  // ...
})
export class YourModule {}
```

### Use in your template:

```html
<!-- Horizontal Carousel (Default) -->
<carousel [slides]="slides" [configs]="carouselConfigs">
  <ng-template #carouselItem let-item>
    <div class="custom-item w-full h-full">
      {{ item.title }}
    </div>
  </ng-template>
</carousel>

<!-- Vertical Carousel -->
<carousel [slides]="slides" [configs]="{ orientation: 'vertical' }">
  <ng-template #carouselItem let-item>
    <div class="custom-item w-full h-full">
      {{ item.title }}
    </div>
  </ng-template>
</carousel>
```

### Sample Slide Data Structure

```typescript
slides = [
  {
    image: 'https://picsum.photos/200/300',
    title: 'Slide 1',
    description: 'This is the first slide'
  },
  {
    image: 'https://picsum.photos/200/300',
    title: 'Slide 2',
    description: 'This is the second slide'
  },
  {
    image: 'https://picsum.photos/200/300',
    title: 'Slide 3',
    description: 'This is the third slide'
  }
];
```

### Using the LazyLoadDirective

The package includes a directive for lazy loading images, which can improve performance, also set height and width explicitly for proper display:

```html
<carousel [slides]="slides" [configs]="carouselConfigs">
  <ng-template #carouselItem let-item>
    <div class="custom-item w-full h-full">
      <img [carouselLazyLoad]="item.imageUrl" [errorImage]="'assets/images/fallback.png'" [alt]="item.title" class="w-[300px] h-[500px] object-cover">
    </div>
  </ng-template>
</carousel>
```

### Example with Custom Empty State Template

```html
<carousel [slides]="products" [configs]="carouselConfigs">
  <!-- Regular item template -->
  <ng-template #carouselItem let-item>
    <div class="custom-item w-full h-full">
      <h3>{{ item.title }}</h3>
      <p>{{ item.description }}</p>
      <button>View Details</button>
    </div>
  </ng-template>

  <!-- Custom empty state template -->
  <ng-template #emptyState>
    <div class="custom-empty-state w-full h-full">
      <h3>No Products Available</h3>
      <p>Please check back later or try a different search.</p>
      <button>Browse All Categories</button>
    </div>
  </ng-template>
</carousel>
```

The carousel component will use your custom empty state template when there are no items to display, such as when filtering returns no results or when the provided items array is empty.

## Configuration Examples

### Horizontal Full-Width Carousel with Indicators

Perfect for hero banners or promotional sliders with pagination dots.

```typescript
carouselConfig: CarouselConfig = {
  containerWidth: '100%',
  containerHeight: '300px',
  itemWidth: '100%',
  itemHeight: '100%',
  singleItemMode: true,
  showIndicators: true,
  showNavigation: false,
  indicatorStyle: {
    spacing: '4px',
    position: {
      bottom: '10px',
      left: '50%'
    },
    active: {
      backgroundColor: '#007bff',
      boxShadow: '0 0 5px rgba(0, 123, 255, 0.5)',
      width: '16px',
      height: '8px',
      borderRadius: '4px',
    },
    inactive: {
      backgroundColor: '#e0e0e0',
      opacity: '0.7',
      width: '8px',
      height: '8px',
    }
  },
  navigationStyle: {
    nextButton: {
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      width: '40px',
      height: '40px',
    },
    prevButton: {
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      width: '40px',
      height: '40px',
    }
  }
};
```

### Horizontal Multi-Item Carousel with Navigation

Great for product showcases or card galleries that display multiple items at once.

```typescript
carouselConfig: CarouselConfig = {
  containerWidth: '700px',
  containerHeight: '300px',
  itemWidth: '300px',
  itemHeight: '100%',
  itemGap: '24px',
  scrollSize: 'xl',
  navigationStyle: {
    nextButton: {
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      width: '40px',
      height: '40px',
    },
    prevButton: {
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      width: '40px',
      height: '40px',
    }
  }
};
```

### Vertical Multi-Item Carousel with Navigation

Useful for content feeds, sidebar lists, or vertical galleries.

```typescript
carouselConfig: CarouselConfig = {
  containerWidth: '300px',
  containerHeight: '500px',
  itemWidth: '100%',
  itemHeight: '200px',
  itemGap: '24px',
  scrollSize: 'xl',
  orientation: 'vertical',
  navigationStyle: {
    nextButton: {
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      width: '40px',
      height: '40px',
    },
    prevButton: {
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      width: '40px',
      height: '40px',
    }
  }
}
```

### Vertical Single-Item Carousel with Navigation

Ideal for story-like content presentation or vertical testimonial sliders.

```typescript
carouselConfig: CarouselConfig = {
  containerWidth: '300px',
  containerHeight: '500px',
  itemWidth: '100%',
  itemHeight: '100%',
  scrollSize: 'xl',
  orientation: 'vertical',
  singleItemMode: true,
  navigationStyle: {
    nextButton: {
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      width: '40px',
      height: '40px',
    },
    prevButton: {
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      width: '40px',
      height: '40px',
    }
  }
}
```

### Vertical Single-Item Carousel with Indicators

For vertical storytelling interfaces with discrete pagination display.

```typescript
carouselConfig: CarouselConfig = {
  containerWidth: '300px',
  containerHeight: '500px',
  itemWidth: '100%',
  itemHeight: '100%',
  scrollSize: 'xl',
  orientation: 'vertical',
  singleItemMode: true,
  showNavigation: false,
  showIndicators: true,
  indicatorStyle: {
    spacing: '4px',
    animation: {
      type: 'custom',
      custom: 'carousel__indicator-expand 0.3s forwards',
      timing: 'ease-in-out'
    },
    position: {
      bottom: '10px',
      left: '50%'
    },
    active: {
      backgroundColor: '#007bff',
      boxShadow: '0 0 5px rgba(0, 123, 255, 0.5)',
      width: '16px',
      height: '8px',
      borderRadius: '4px',
    },
    inactive: {
      backgroundColor: '#e0e0e0',
      opacity: '0.7',
      width: '8px',
      height: '8px',
    }
  }
}
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

### Navigation Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `navigationStyle.buttonShape` | 'circle' \| 'square' \| 'rounded' | 'circle' | Shape of navigation buttons |
| `navigationStyle.prevButton` | ButtonStyle | {} | Style for previous button |
| `navigationStyle.nextButton` | ButtonStyle | {} | Style for next button |
| `navigationStyle.icons` | object | {} | Custom icons for navigation buttons |

### Indicator Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `showIndicators` | boolean | false | Show/hide pagination indicators |
| `indicatorStyle.active` | object | {} | Styles for active indicator |
| `indicatorStyle.inactive` | object | {} | Styles for inactive indicators |
| `indicatorStyle.container` | object | {} | Styles for indicator container |
| `indicatorStyle.spacing` | string | '5px' | Gap between indicators |
| `indicatorStyle.position` | object | {} | Position of indicator container |
| `indicatorStyle.animation` | object | {} | Animation settings for indicators |

### Advanced Features

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `autoplay` | boolean | false | Enable autoplay |
| `autoplayDelay` | string | '3000ms' | Delay between autoplay slides |
| `loop` | boolean | false | Enable infinite loop |
| `scrollSize` | string \| ScrollSize | 'sm' | Size of scroll amount |
| `singleItemMode` | boolean | false | Enable one-item-at-a-time scrolling |

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

For support, please create an issue in the [GitHub repository](https://github.com/kinleyrabgay/@ngfly/carousel/issues).

## Changelog

See CHANGELOG.md for a list of changes and updates.