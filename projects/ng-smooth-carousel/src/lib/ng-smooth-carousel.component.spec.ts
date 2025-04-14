import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgSmoothCarouselComponent } from './ng-smooth-carousel.component';

describe('NgSmoothCarouselComponent', () => {
  let component: NgSmoothCarouselComponent;
  let fixture: ComponentFixture<NgSmoothCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgSmoothCarouselComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NgSmoothCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
