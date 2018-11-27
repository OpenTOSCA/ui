import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationInstanceBoundaryDefinitionInterfacesListComponent } from './application-instance-boundary-definition-interfaces-list.component';

describe('ApplicationInstanceBoundaryDefinitionInterfacesListComponent', () => {
  let component: ApplicationInstanceBoundaryDefinitionInterfacesListComponent;
  let fixture: ComponentFixture<ApplicationInstanceBoundaryDefinitionInterfacesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationInstanceBoundaryDefinitionInterfacesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationInstanceBoundaryDefinitionInterfacesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
