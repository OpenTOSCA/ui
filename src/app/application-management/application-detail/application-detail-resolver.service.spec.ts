import { TestBed, inject } from '@angular/core/testing';

import { ApplicationDetailResolverService } from './application-detail-resolver.service';

describe('ApplicationDetailResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApplicationDetailResolverService]
    });
  });

  it('should ...', inject([ApplicationDetailResolverService], (service: ApplicationDetailResolverService) => {
    expect(service).toBeTruthy();
  }));
});
