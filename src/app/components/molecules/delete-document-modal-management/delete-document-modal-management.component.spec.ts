import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteDocumentModalManagementComponent } from './delete-document-modal-management.component';

describe('DeleteDocumentModalManagementComponent', () => {
  let component: DeleteDocumentModalManagementComponent;
  let fixture: ComponentFixture<DeleteDocumentModalManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteDocumentModalManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteDocumentModalManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
