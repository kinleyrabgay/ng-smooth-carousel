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
    { title: 'Item 10' },
    { title: 'Item 11' },
    { title: 'Item 12' },
    { title: 'Item 13' },
    { title: 'Item 14' },
    { title: 'Item 15' },
    { title: 'Item 16' },
  ];

  carouselConfig: CarouselConfig = {
    containerWidth: '100%',
    containerHeight: '100%',
    itemWidth: '200px',
    itemHeight: '200px',
    itemGap: '20px',
    showNavigation: true,
    animationDuration: '300ms',
    scrollSize: '10xl',
    enableSearch: true,
    searchPlaceholder: 'Search...',
    searchModalTitle: 'Search Items',
    navigationStyle: {
      buttonShape: 'circle',
      nextButton: {
        backgroundColor: 'red',
        color: 'white',
        border: 'none',
        padding: '10px',
        borderRadius: '4px',
        width: '40px',
        height: '40px',
      },
      prevButton: {
        backgroundColor: 'blue',
        color: 'white',
        border: 'none',
        padding: '10px',
        borderRadius: '4px',
        width: '40px',
        height: '40px',
      },
      icons: {
        next: 'N',
        prev: 'P',
      },
    },
  };
}
