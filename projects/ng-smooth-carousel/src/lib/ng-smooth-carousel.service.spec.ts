import { TestBed } from '@angular/core/testing';

import { NgSmoothCarouselService } from './ng-smooth-carousel.service';

describe('NgSmoothCarouselService', () => {
  let service: NgSmoothCarouselService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgSmoothCarouselService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
