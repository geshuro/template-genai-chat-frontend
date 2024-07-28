import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomModeMenuComponent } from './bottom-mode-menu.component';

describe('BottomModeMenuComponent', () => {
  let component: BottomModeMenuComponent;
  let fixture: ComponentFixture<BottomModeMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomModeMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomModeMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
