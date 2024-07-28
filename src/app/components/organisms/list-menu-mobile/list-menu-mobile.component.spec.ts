import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMenuMobileComponent } from './list-menu-mobile.component';

describe('ListMenuMobileComponent', () => {
  let component: ListMenuMobileComponent;
  let fixture: ComponentFixture<ListMenuMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListMenuMobileComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListMenuMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
