import { Component, OnInit, Input } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Constants } from '@shared/utils/constants';

import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { ListItemComponent } from '@components/atoms/list-item/list-item.component';
import { EditModalComponent } from '../edit-modal/edit-modal.component';
import { IconModalComponent } from '../icon-modal/icon-modal.component';

import { IndexedDBChatApiService } from '@shared/services/utils/indexedb-chat-api.service';
import { UiService } from '@shared/services/utils/ui.service';
import { ChatHistoryService } from '@shared/services/utils/chat-services/chat-history.service';
import { ChatInteractionService } from '@shared/services/utils/chat-services/chat-interaction.service';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { IChat } from '@shared/models/chat-interaction.model';
import { SpinnerComponent } from '@components/atoms/spinner/spinner.component';
import {
  TaggingEvents,
  TaggingService,
} from '@shared/services/utils/tagging-service';
import { RoleBasedDirective } from '@shared/directive/role-based.directive';

@Component({
  selector: 'app-talk-menu',
  templateUrl: './talk-menu.component.html',
  styleUrls: ['./talk-menu.component.scss'],
  imports: [
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    ListItemComponent,
    TranslateModule,
    SpinnerComponent,
    RoleBasedDirective,
  ],
  standalone: true,
})
export class TalkMenuComponent implements OnInit {
  unPinned: any;
  pinned: any;
  options: any;
  common: any;

  @Input() topic!: IChat;

  constructor(
    private indexedDBChat: IndexedDBChatApiService,
    private uiService: UiService,
    private translate: TranslateService,
    private chatHistory: ChatHistoryService,
    private chatInteraction: ChatInteractionService,
    private dialog: MatDialog,
    private taggingService: TaggingService
  ) {}

  ngOnInit(): void {
    this.setList();
  }

  setList(): void {
    this.unPinned = Constants.unPinnedList;
    this.pinned = Constants.pinnedList;
    this.common = Constants.listCommon;

    if (!this.topic.favorite) {
      this.options = this.unPinned.concat(this.common);
    } else {
      this.options = this.pinned.concat(this.common);
    }
  }

  optionSelected(option: string): void {
    switch (option) {
      case 'PING_CHAT':
        this.changeFavoriteState(this.topic);
        break;
      case 'UN_PING_CHAT':
        this.changeFavoriteState(this.topic);
        break;
      case 'EDIT_CHAT':
        this.editChat(this.topic);
        break;
      case 'EXPORT_CHAT':
        this.exportChat(this.topic);
        break;
      case 'DELETE_CHAT':
        this.deleteChat(this.topic);
        break;
      case 'EDIT_EMOJI':
        this.changeIcon(this.topic);
        break;
      default:
        break;
    }
  }

  async changeFavoriteState(topic: IChat): Promise<void> {
    await this.indexedDBChat.updateFavoriteChat(topic.id, !topic.favorite);
    this.chatHistory.sendClickEventHistory(topic, true);
  }

  editChat(topic: any): void {
    const dialogEdit = this.dialog.open(EditModalComponent, {
      data: {
        title: this.translate.instant('EDIT_CHAT_TITLE'),
        cancel: this.translate.instant('BUTTON_CANCEL'),
        confirm: this.translate.instant('EDIT_CHAT_CONFIRM'),
        text: topic.title,
      },
    });

    dialogEdit.afterClosed().subscribe(response => {
      const currentTopic = topic;

      if (response !== undefined && response.action === 'confirm') {
        this.indexedDBChat.updateTitleChat(currentTopic.id, response.value);
        this.chatHistory.sendClickEventHistory(currentTopic, true);
      }
    });
    this.taggingService.tag(TaggingEvents.rename_conversation);
  }

  async exportChat(topic: any) {
    const messages = await this.indexedDBChat.getMessageByChatId(topic.id);

    const pdfContent = [
      { text: `Chat: ${topic.title}`, style: 'title' },
      { text: '\n\n' },
    ];

    messages?.forEach((message: any) => {
      const role = message.role === 'assistant' ? 'Assistant' : 'User';
      const style =
        message.role === 'assistant' ? 'assistantMessage' : 'userMessage';
      pdfContent.push({
        text: `${role}: ${message.text}`,
        style: style,
      });
    });

    const pdfDefinition: any = {
      content: pdfContent,
      styles: {
        title: {
          fontSize: 16,
          alignment: 'left',
          color: '#0F004F',
          bold: true,
        },
        userMessage: {
          margin: [0, 5, 0, 5],
          bold: true,
          italics: true,
          color: 'black',
        },
        assistantMessage: {
          margin: [0, 0, 0, 10],
          color: '#4D4D4D',
        },
      },
    };

    const pdf = pdfMake.createPdf(
      pdfDefinition,
      undefined,
      undefined,
      pdfFonts.pdfMake.vfs
    );
    pdf.download('chat-export.pdf');
    this.taggingService.tag(TaggingEvents.export_conversation);
  }

  async deleteChat(topic: any) {
    const dialogDelete = this.dialog.open(ConfirmModalComponent, {
      data: {
        title: this.translate.instant('DELETE_CHAT_TITLE'),
        question: this.translate.instant('DELETE_CHAT_QUESTION'),
        cancel: this.translate.instant('BUTTON_CANCEL'),
        confirm: this.translate.instant('EDIT_CHAT_CONFIRM'),
        text: topic.title,
      },
    });

    dialogDelete.afterClosed().subscribe(response => {
      const currentTopic = topic;

      if (response !== undefined && response.action === 'confirm') {
        this.indexedDBChat.deleteChat(currentTopic.id);
        this.chatInteraction.idChat === currentTopic.id &&
          this.chatInteraction.clear();
      }
      this.chatHistory.sendClickEventHistory(currentTopic, true);
    });

    this.taggingService.tag(TaggingEvents.delete_conversation);
  }

  changeIcon(topic: any): void {
    const dialogEdit = this.dialog.open(IconModalComponent, {
      data: {
        title: this.translate.instant('EDIT_ICON_TITLE'),
        cancel: this.translate.instant('BUTTON_CANCEL'),
        accept: this.translate.instant('BUTTON_ACCEPT'),
        emoji: topic.emoji,
        baseKnowledge: topic.baseKnowledge,
      },
    });

    dialogEdit.afterClosed().subscribe(response => {
      if (response !== undefined && response.action === 'updateEmoji') {
        this.indexedDBChat.updateIconChat(topic.id, response.value);
        this.chatHistory.sendClickEventHistory(topic, true);
      }
    });
  }
}
