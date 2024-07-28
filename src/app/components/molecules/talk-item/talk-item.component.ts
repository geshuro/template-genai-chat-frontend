import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TalkMenuComponent } from '../talk-menu/talk-menu.component';
import { ChatInteractionService } from '@shared/services/utils/chat-services/chat-interaction.service';
import { ChatHistoryService } from '@shared/services/utils/chat-services/chat-history.service';
import { CommonModule } from '@angular/common';
import { IChat } from '@shared/models/chat-interaction.model';
import { UserEventsService } from '@shared/services/utils/user-events.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-talk-item',
  templateUrl: './talk-item.component.html',
  styleUrls: ['./talk-item.component.scss'],
  standalone: true,
  imports: [MatIconModule, TalkMenuComponent, CommonModule, TranslateModule],
})
export class TalkItemComponent {
  @Input() itemTopic!: IChat;
  listIcons = this.interactionService.baseKnowledgeList;

  constructor(
    private interactionService: ChatInteractionService,
    private chatHistoryService: ChatHistoryService,
    private userEventsService: UserEventsService
  ) {
    this.interactionService.onClear().subscribe(() => {
      this.itemTopic.activate = false;
    });
  }

  async chatClicked() {
    //console.time('chatClicked');
    this.interactionService.openChat(
      this.itemTopic.id,
      this.itemTopic.unique,
      this.itemTopic.baseKnowledge,
      this.itemTopic.model
    );
    this.chatHistoryService.sendClickEventHistory(this.itemTopic);
    this.userEventsService.sendClickEvent('', 'clickTalkItem');
    // console.timeEnd('chatClicked');
  }

  get chatActivate() {
    return this.interactionService.chatActivate;
  }
}
