import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildplanMonitorComponent } from './buildplan-monitor.component';

describe('BuildplanMonitorComponent', () => {
  let component: BuildplanMonitorComponent;
  let fixture: ComponentFixture<BuildplanMonitorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildplanMonitorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildplanMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
