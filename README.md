# ng-smooth-carousel

A smooth, customizable carousel component for Angular 14+ applications, supporting both vertical and horizontal orientations.

## Features

- 🎯 Smooth scrolling animation
- 🔄 Flexible orientation support (vertical & horizontal)
- 🎨 Highly customizable navigation buttons and styling
- 🔍 Built-in search functionality
- 📱 Responsive design
- ⚡ Efficient rendering with virtual scrolling
- 🎮 Multiple navigation options
- 🎯 Custom item templates
- 🔄 Auto-play support
- 🔄 Loop functionality

## Installation

```bash
npm install ng-smooth-carousel
```

## Usage

1. Import the `NgSmoothCarouselModule` in your module or component:

```typescript
import { NgSmoothCarouselModule } from 'ng-smooth-carousel';

@Component({
  // ...
  imports: [NgSmoothCarouselModule],
  // ...
})
```

2. Use the carousel component in your template:

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
<nsc [items]="items" [config]="{ orientation: 'vertical', ...otherConfig }">
  <ng-template #carouselItem let-item>
    <div class="custom-item">
      {{ item.title }}
    </div>
  </ng-template>
</nsc>
```

## Configuration Example

Here's a comprehensive example of the carousel configuration:

```typescript
const carouselConfig: CarouselConfig = {
  // Layout Configuration
  containerWidth: '100%',
  containerHeight: '100%',
  itemWidth: '200px',
  itemHeight: '200px',
  itemGap: '20px',
  orientation: 'horizontal', // or 'vertical'
  
  // Navigation Configuration
  showNavigation: true, // defaults to true
  navigationSize: '60px',
  navigationPadding: '4px',
  
  // Animation & Scroll
  animationDuration: '300ms',
  scrollSize: '10xl',
  
  // Search Configuration
  enableSearch: true,
  searchPlaceholder: 'Search...',
  searchModalTitle: 'Search Items',
  
  // Navigation Styling
  navigationStyle: {
    buttonShape: 'circle', // 'circle' | 'rounded' | 'square'
    nextButton: {
      backgroundColor: 'red',
      color: 'white',
      border: 'none',
      padding: '10px',
      width: '40px',
      height: '40px',
    },
    prevButton: {
      backgroundColor: 'blue',
      color: 'white',
      border: 'none',
      padding: '10px',
      width: '40px',
      height: '40px',
    },
    icons: {
      next: 'N',
      prev: 'P',
      vertical: {
        next: '↓',
        prev: '↑'
      }
    },
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
| `itemGap` | string | undefined | Gap between carousel items |
| `showNavigation` | boolean | true | Show/hide navigation buttons |
| `orientation` | 'horizontal' \| 'vertical' | 'horizontal' | Carousel orientation |
| `animationDuration` | string | '300ms' | Duration of scroll animation |
| `animationTiming` | string | 'ease' | Timing function for animation |

### Navigation Configuration

| Property | Type | Description |
|----------|------|-------------|
| `navigationSize` | string | Size of navigation buttons area |
| `navigationPadding` | string | Padding around navigation buttons |
| `buttonShape` | 'circle' \| 'rounded' \| 'square' | Shape of navigation buttons |
| `nextButton` | ButtonStyle | Styles for next button |
| `prevButton` | ButtonStyle | Styles for previous button |
| `icons` | NavigationIcons | Custom icons for buttons |

### Search Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enableSearch` | boolean | false | Enable/disable search functionality |
| `searchPlaceholder` | string | 'Search...' | Placeholder text for search input |
| `searchModalTitle` | string | 'Filter Items' | Title for search modal |
| `searchStyle` | SearchStyle | undefined | Custom styles for search components |

### Scroll Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `scrollSize` | ScrollSize | 'sm' | Amount to scroll per navigation click |
| `loop` | boolean | false | Enable/disable infinite loop |
| `autoplay` | boolean | false | Enable/disable autoplay |
| `autoplayDelay` | string | '3000ms' | Delay between autoplay slides |

## Types

```typescript
type ScrollSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl' | '10xl';

type ButtonShape = 'circle' | 'rounded' | 'square';

interface ButtonStyle {
  backgroundColor?: string;
  color?: string;
  border?: string;
  padding?: string;
  borderRadius?: string;
  width?: string;
  height?: string;
  [key: string]: string | undefined;
}

interface NavigationIcons {
  next?: string;
  prev?: string;
  search?: string;
  vertical?: {
    next?: string;
    prev?: string;
  };
}

interface SearchStyle {
  button?: ButtonStyle;
  modal?: Record<string, string>;
}
```

## Roadmap

Here are the upcoming features and improvements planned for ng-smooth-carousel:

### In Progress 🚧
- 🔍 Enhanced Search Functionality
  - Full-text search with highlighting
  - Advanced filtering options
  - Customizable search results display
  - Search history and suggestions

### Coming Soon 🔜
- 🎯 Touch and Swipe Gestures
  - Smooth touch interactions
  - Customizable swipe sensitivity
  - Multi-touch support
- ⌨️ Keyboard Navigation
  - Arrow key navigation
  - Keyboard shortcuts for common actions
- 🌐 RTL (Right-to-Left) Support
  - Full RTL layout support
  - Automatic direction detection
  - RTL-specific animations
- ♿ Accessibility Improvements
  - ARIA attributes
  - Screen reader support
  - Keyboard focus management
- 🎨 Additional Features
  - Multiple item selection
  - Drag and drop reordering
  - Custom transition effects
  - Lazy loading improvements
  - Thumbnail navigation option
  - Dynamic item height support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please create an issue in the [GitHub repository](https://github.com/kinleyrabgay/ng-smooth-carousel/issues).

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and updates.
