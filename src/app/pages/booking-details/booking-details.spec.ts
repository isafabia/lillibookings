import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingDetailsComponent } from './booking-details';

describe('BookingDetails', () => {
  let component: BookingDetailsComponent;
  let fixture: ComponentFixture<BookingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingDetailsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  
});
