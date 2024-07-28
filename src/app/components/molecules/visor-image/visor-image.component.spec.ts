import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisorImageComponent } from './visor-image.component';

describe('VisorImageComponent', () => {
  let component: VisorImageComponent;
  let fixture: ComponentFixture<VisorImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisorImageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VisorImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
