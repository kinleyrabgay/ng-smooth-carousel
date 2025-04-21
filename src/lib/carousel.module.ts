import { NgModule } from '@angular/core';
import { CarouselComponent } from './components/carousel/carousel.component';
import { LazyLoadDirective } from './directives/lazy-load.directive';

/**
 * Carousel Module
 * 
 * This module provides a smooth, customizable carousel component for Angular applications.
 * While the components are standalone, this module is provided for backward compatibility.
 */
@NgModule({
  imports: [
    CarouselComponent,
    LazyLoadDirective
  ],
  exports: [
    CarouselComponent,
    LazyLoadDirective
  ]
})
export class CarouselModule {}
