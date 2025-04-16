/*
 * Public API Surface of ng-smooth-carousel
 */

// Export component for standalone usage
export { CarouselComponent } from './lib/carousel.component';

// Export interfaces and types
export { 
  CarouselConfig,
  ScrollSize,
  NavButtonShape,
  NavigationStyle,
  SearchStyle,
  ButtonStyle 
} from './lib/carousel-config.interface';

// Export module for Angular 14 compatibility
export { NgSmoothCarouselModule } from './lib/carousel.module';
