import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatingOverviewComponent } from './heating-overview.component';

describe('HeatingOverviewComponent', () => {
  let component: HeatingOverviewComponent;
  let fixture: ComponentFixture<HeatingOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeatingOverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatingOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
