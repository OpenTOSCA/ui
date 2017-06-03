import { TestBed, inject } from '@angular/core/testing';

import { ApplicationManagementService } from './application-management.service';

describe('ApplicationManagementService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApplicationManagementService]
    });
  });

  it('should ...', inject([ApplicationManagementService], (service: ApplicationManagementService) => {
    expect(service).toBeTruthy();
  }));
});
