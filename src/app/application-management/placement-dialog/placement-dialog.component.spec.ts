import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlacementDialogComponent } from './placement-dialog.component';

describe('PlacementDialogComponent', () => {
  let component: PlacementDialogComponent;
  let fixture: ComponentFixture<PlacementDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlacementDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlacementDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
