import { TestBed, inject } from '@angular/core/testing';

import { ApplicationInstancesManagementService } from './application-instances-management.service';

describe('ApplicationInstancesManagementService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApplicationInstancesManagementService]
    });
  });

  it('should ...', inject([ApplicationInstancesManagementService], (service: ApplicationInstancesManagementService) => {
    expect(service).toBeTruthy();
  }));
});
