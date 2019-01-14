import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementPlanInstanceListComponent } from './management-plan-instance-list.component';

describe('ManagementPlanInstanceListComponent', () => {
  let component: ManagementPlanInstanceListComponent;
  let fixture: ComponentFixture<ManagementPlanInstanceListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagementPlanInstanceListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagementPlanInstanceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
