import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuUserManagementComponent } from './menu-user-management.component';

describe('MenuUserManagementComponent', () => {
  let component: MenuUserManagementComponent;
  let fixture: ComponentFixture<MenuUserManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuUserManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuUserManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
