import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemChatKnowledgeComponent } from './item-chat-knowledge.component';

describe('ItemChatKnowledgeComponent', () => {
  let component: ItemChatKnowledgeComponent;
  let fixture: ComponentFixture<ItemChatKnowledgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemChatKnowledgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemChatKnowledgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
