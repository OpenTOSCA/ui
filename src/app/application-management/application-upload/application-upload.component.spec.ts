import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationUploadComponent } from './application-upload.component';

describe('ApplicationUploadComponent', () => {
  let component: ApplicationUploadComponent;
  let fixture: ComponentFixture<ApplicationUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
