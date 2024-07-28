import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemMenuManagementComponent } from './item-menu-management.component';

describe('ItemMenuManagementComponent', () => {
  let component: ItemMenuManagementComponent;
  let fixture: ComponentFixture<ItemMenuManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemMenuManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemMenuManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
