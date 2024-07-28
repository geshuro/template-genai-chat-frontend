import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptimizedImgComponent } from './optimized-img.component';

describe('OptimizedImgComponent', () => {
  let component: OptimizedImgComponent;
  let fixture: ComponentFixture<OptimizedImgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OptimizedImgComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OptimizedImgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
