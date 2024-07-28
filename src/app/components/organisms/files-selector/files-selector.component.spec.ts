import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesSelectorComponent } from './files-selector.component';

describe('FilesSelectorComponent', () => {
  let component: FilesSelectorComponent;
  let fixture: ComponentFixture<FilesSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilesSelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilesSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
