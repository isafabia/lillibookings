import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RotaComponent } from './rota';

describe('Rota', () => {
  let component: RotaComponent;
  let fixture: ComponentFixture<RotaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RotaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RotaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
