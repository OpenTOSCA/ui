import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationInstanceListComponent } from './application-instance-list.component';

describe('ApplicationInstanceListComponent', () => {
  let component: ApplicationInstanceListComponent;
  let fixture: ComponentFixture<ApplicationInstanceListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationInstanceListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationInstanceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
