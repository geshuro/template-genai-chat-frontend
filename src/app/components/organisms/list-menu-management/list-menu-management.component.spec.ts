import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMenuManagementComponent } from './list-menu-management.component';

describe('ListMenuManagementComponent', () => {
  let component: ListMenuManagementComponent;
  let fixture: ComponentFixture<ListMenuManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListMenuManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListMenuManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
