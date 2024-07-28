import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogMenuMobileComponent } from './dialog-menu-mobile.component';

describe('DialogMenuMobileComponent', () => {
  let component: DialogMenuMobileComponent;
  let fixture: ComponentFixture<DialogMenuMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogMenuMobileComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogMenuMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
