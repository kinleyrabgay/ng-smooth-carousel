import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarouselComponent } from './carousel.component';

@NgModule({
  declarations: [CarouselComponent],
  imports: [CommonModule, FormsModule],
  exports: [CarouselComponent],
})
export class NgSmoothCarouselModule {}
