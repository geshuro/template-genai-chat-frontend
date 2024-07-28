import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatInputActionsComponent } from './chat-input-actions.component';

describe('ChatInputActionsComponent', () => {
  let component: ChatInputActionsComponent;
  let fixture: ComponentFixture<ChatInputActionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatInputActionsComponent],
    });
    fixture = TestBed.createComponent(ChatInputActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
