import { TestBed } from '@angular/core/testing';

import { HeatControlService } from './heat-control.service';

describe('HeatControlService', () => {
  let service: HeatControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeatControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
