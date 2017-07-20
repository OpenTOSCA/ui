import { TestBed, inject } from '@angular/core/testing';

import { BuildplanMonitoringService } from './buildplan-monitoring.service';

describe('BuildplanMonitoringService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BuildplanMonitoringService]
    });
  });

  it('should be created', inject([BuildplanMonitoringService], (service: BuildplanMonitoringService) => {
    expect(service).toBeTruthy();
  }));
});
