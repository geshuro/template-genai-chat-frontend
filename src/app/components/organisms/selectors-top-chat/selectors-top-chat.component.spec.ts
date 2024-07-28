import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorsTopChatComponent } from './selectors-top-chat.component';

describe('SelectorsTopChatComponent', () => {
  let component: SelectorsTopChatComponent;
  let fixture: ComponentFixture<SelectorsTopChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectorsTopChatComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectorsTopChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
