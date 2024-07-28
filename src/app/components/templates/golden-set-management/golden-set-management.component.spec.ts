import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoldenSetManagementComponent } from './golden-set-management.component';

describe('GoldenSetManagementComponent', () => {
  let component: GoldenSetManagementComponent;
  let fixture: ComponentFixture<GoldenSetManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoldenSetManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GoldenSetManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
