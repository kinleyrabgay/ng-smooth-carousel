![image](https://github.com/user-attachments/assets/7c78f4d1-fcdf-4ed4-8ad8-2c091241d875)# ng-smooth-carousel

A smooth, customizable carousel component for Angular 14+ applications, supporting both vertical and horizontal orientations.

## Features

- 🎯 Smooth scrolling animation ✅
- 🔄 Flexible orientation support (vertical & horizontal) ✅
- 🎨 Highly customizable navigation buttons and styling ✅
- 🔍 Built-in search functionality ✅
- 📱 Responsive design ✅
- ⚡ Efficient rendering with virtual scrolling ✅
- 🎮 Multiple navigation options ✅
- 🎯 Custom item templates ✅
- 🔄 Auto-play support ✅
- 🔄 Loop functionality ❌

## Installation

```bash
npm install ng-smooth-carousel
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
export class YourModule { }
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
export class YourComponent { }
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
type ButtonShape = 'circle' | 'rounded' | 'square';
```

### Navigation Style Interface

```typescript
interface NavigationStyle {
  buttonShape?: ButtonShape;
  nextButton?: ButtonStyle;
  prevButton?: ButtonStyle;
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

interface ButtonStyle {
  backgroundColor?: string;
  color?: string;
  border?: string;
  padding?: string;
  width?: string;
  height?: string;
  [key: string]: string | undefined;
}
```
## Demo

### Horizontal
![Single Item](https://github.com/user-attachments/assets/ada0fea8-ae30-4e30-912d-f31aaf08de37)
![Multiple Items](https://github.com/user-attachments/assets/2cacfc06-8e1f-4f63-8965-7906dca17460)

### Vertical
![Single Item](https://github.com/user-attachments/assets/fd0a2174-2b83-4fa8-b5d8-94ee0f70c204)
![Multiple Items](https://github.com/user-attachments/assets/7094e49a-ad8d-4ee8-81f4-a846cdff9af7)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please create an issue in the [GitHub repository](https://github.com/kinleyrabgay/ng-smooth-carousel/issues).

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and updates.
