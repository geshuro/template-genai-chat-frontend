import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContinuousReviewManagementComponent } from './continuous-review-management.component';

describe('ContinuousReviewManagementComponent', () => {
  let component: ContinuousReviewManagementComponent;
  let fixture: ComponentFixture<ContinuousReviewManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContinuousReviewManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContinuousReviewManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
