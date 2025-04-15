import { Component } from '@angular/core';
import { CarouselConfig, NgSmoothCarouselModule } from '../../../ng-smooth-carousel/src/public-api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgSmoothCarouselModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'demo';

  items = [
    { title: 'Item 1' },
    { title: 'Item 2' },
    { title: 'Item 3' },
    { title: 'Item 4' },
    { title: 'Item 5' },
    { title: 'Item 6' },
    { title: 'Item 7' },
    { title: 'Item 8' },
    { title: 'Item 9' },
  ];

  carouselConfig: CarouselConfig = {
    containerWidth: '100%',
    containerHeight: '100%',
    itemWidth: '150px',
    itemHeight: '150px',
    itemGap: '16px',
    // showNavigation: false,
    animationDuration: '300ms',
    scrollSize: '2xl',
    // orientation: 'vertical',
    navigationPadding: '2px',
    navigationStyle: {
      buttonShape: 'rounded',
    },
  };
}
