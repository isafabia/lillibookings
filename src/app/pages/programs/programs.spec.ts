import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramsComponent } from './programs';

describe('Programs', () => {
  let component: ProgramsComponent;
  let fixture: ComponentFixture<ProgramsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
