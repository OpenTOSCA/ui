import { TestBed, inject } from '@angular/core/testing';

import { ApplicationInstanceDetailResolverService } from './application-instance-detail-resolver.service';

describe('ApplicationInstanceDetailResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApplicationInstanceDetailResolverService]
    });
  });

  it('should ...', inject([ApplicationInstanceDetailResolverService], (service: ApplicationInstanceDetailResolverService) => {
    expect(service).toBeTruthy();
  }));
});
