import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineModalManagementComponent } from './timeline-modal-management.component';

describe('TimelineModalManagementComponent', () => {
  let component: TimelineModalManagementComponent;
  let fixture: ComponentFixture<TimelineModalManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineModalManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimelineModalManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
