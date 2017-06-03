import { TestBed, inject } from '@angular/core/testing';

import { OpenToscaLoggerService } from './open-tosca-logger.service';

describe('OpenToscaLoggerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OpenToscaLoggerService]
    });
  });

  it('should ...', inject([OpenToscaLoggerService], (service: OpenToscaLoggerService) => {
    expect(service).toBeTruthy();
  }));
});
