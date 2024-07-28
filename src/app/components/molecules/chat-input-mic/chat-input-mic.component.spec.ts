import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatInputMicComponent } from './chat-input-mic.component';

describe('ChatInputMicComponent', () => {
  let component: ChatInputMicComponent;
  let fixture: ComponentFixture<ChatInputMicComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatInputMicComponent],
    });
    fixture = TestBed.createComponent(ChatInputMicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
