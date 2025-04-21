/**
 * Main export file for the NSC library
 *
 * Available inputs:
 * - slides: The collection of items to display in the carousel
 * - configs: The configuration object for the carousel
 */

// Module
export * from './carousel.module';

// Components
export * from './components/carousel/carousel.component';

// Interfaces
export * from './interfaces/carousel-config.interface';

// Services
export * from './services/carousel.service';

// Directives
export * from './directives/lazy-load.directive';

// Utilities
export * from './utils/animation';