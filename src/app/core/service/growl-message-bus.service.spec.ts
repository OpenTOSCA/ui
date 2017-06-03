import { TestBed, inject } from '@angular/core/testing';

import { GrowlMessageBusService } from './growl-message-bus.service';

describe('GrowlMessageBusService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GrowlMessageBusService]
    });
  });

  it('should ...', inject([GrowlMessageBusService], (service: GrowlMessageBusService) => {
    expect(service).toBeTruthy();
  }));
});
