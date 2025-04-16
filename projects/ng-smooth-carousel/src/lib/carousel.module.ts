import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarouselComponent } from './carousel.component';

/**
 * Module for ng-smooth-carousel
 * @deprecated Use standalone import instead for Angular 15+ applications
 * Example: `import { CarouselComponent } from 'ng-smooth-carousel';`
 */
@NgModule({
  imports: [
    CommonModule, 
    FormsModule,
    CarouselComponent  // Using standalone component in module imports
  ],
  exports: [CarouselComponent],
})
export class NgSmoothCarouselModule {}
