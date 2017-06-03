import { TestBed, inject } from '@angular/core/testing';

import { RepositoryManagementService } from './repository-management.service';

describe('RepositoryManagementService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RepositoryManagementService]
    });
  });

  it('should ...', inject([RepositoryManagementService], (service: RepositoryManagementService) => {
    expect(service).toBeTruthy();
  }));
});
