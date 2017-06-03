import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationInstanceDetailComponent } from './application-instance-detail.component';

describe('ApplicationInstanceDetailComponent', () => {
  let component: ApplicationInstanceDetailComponent;
  let fixture: ComponentFixture<ApplicationInstanceDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationInstanceDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationInstanceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
