import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatInputFeedbackComponent } from './chat-input-feedback.component';

describe('ChatInputFeedbackComponent', () => {
  let component: ChatInputFeedbackComponent;
  let fixture: ComponentFixture<ChatInputFeedbackComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatInputFeedbackComponent],
    });
    fixture = TestBed.createComponent(ChatInputFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
