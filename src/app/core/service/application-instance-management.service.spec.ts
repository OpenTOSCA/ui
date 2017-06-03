import { TestBed, inject } from '@angular/core/testing';

import { ApplicationInstanceManagementService } from './application-instance-management.service';

describe('ApplicationInstanceManagementService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApplicationInstanceManagementService]
    });
  });

  it('should ...', inject([ApplicationInstanceManagementService], (service: ApplicationInstanceManagementService) => {
    expect(service).toBeTruthy();
  }));
});
