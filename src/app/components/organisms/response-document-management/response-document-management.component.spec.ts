import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponseDocumentManagementComponent } from './response-document-management.component';

describe('ResponseDocumentManagementComponent', () => {
  let component: ResponseDocumentManagementComponent;
  let fixture: ComponentFixture<ResponseDocumentManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResponseDocumentManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResponseDocumentManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
