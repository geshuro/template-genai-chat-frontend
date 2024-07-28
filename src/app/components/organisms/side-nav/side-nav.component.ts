import { SessionService } from './../../../shared/services/utils/session.service';
import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { PrimaryButtonComponent } from '@components/atoms/primary-button/primary-button.component';
import { TalkItemComponent } from '@components/molecules/talk-item/talk-item.component';
import { ChatInteractionService } from '@shared/services/utils/chat-services/chat-interaction.service';
import { ChatHistoryService } from '@shared/services/utils/chat-services/chat-history.service';
import { IChat } from '@shared/models/chat-interaction.model';
import { UserEventsService } from '@shared/services/utils/user-events.service';
import {
  TaggingEvents,
  TaggingService,
} from '@shared/services/utils/tagging-service';
import { MenuEventsService } from '@shared/services/utils/menu-events.service';
import { UiService } from '@shared/services/utils/ui.service';
import { NgIf } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ThemingService } from '@shared/services/utils/theming.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  standalone: true,
  imports: [
    PrimaryButtonComponent,
    TranslateModule,
    TalkItemComponent,
    MatIconModule,
    MatMenuModule,
    NgIf,
  ],
})
export class SideNavComponent {
  isTitleChanged: boolean[] = [];
  chatSelected?: IChat;
  chats!: any[];

  private sessionService = inject(SessionService);
  private themeService = inject(ThemingService);
  private taggingService = inject(TaggingService);

  constructor(
    private chatInteraction: ChatInteractionService,
    private chatHistory: ChatHistoryService,
    private userEventsService: UserEventsService,
    private menuEventsService: MenuEventsService,
    private translate: TranslateService,
    private uiService: UiService
  ) {
    this.getChatList();
    this.chatHistory.getClickEventHistory().subscribe(({ chat, refresh }) => {
      this.chatSelected = chat;
      if (refresh) {
        this.getChatList();
      } else {
        chat && this.chatHistory.setActiveChat(chat.id);
        if (chat?.loading !== undefined) {
          this.chatHistory.setStatusLoadingChat(chat.id, chat?.loading);
        }
      }
    });

    this.userEventsService.getClickEvent().subscribe(response => {
      const action = response.action;
      if (action === 'chatsDeleted') {
        this.getChatList();
      }
    });
  }

  async getChatList(): Promise<void> {
    this.chats = await this.chatHistory.getChatHistory(
      this.chatInteraction.chatActivate?.value ?? 'RH+'
    );
    this.chatSelected && this.chatHistory.setActiveChat(this.chatSelected.id);
    if (this.chatSelected?.loading !== undefined && this.chatSelected?.id) {
      this.chatHistory.setStatusLoadingChat(
        this.chatSelected.id,
        this.chatSelected?.loading
      );
    }
  }

  clearChat(): void {
    this.chats.forEach((item: any) => {
      item.topics.forEach((topic: any) => (topic.active = false));
    });
    this.chatInteraction.clear();
    this.taggingService.tag(TaggingEvents.new_conversation);
    setTimeout(() => {
      this.userEventsService.sendClickEvent('', 'clearChat');
    }, 100);
  }

  startTour(): void {
    this.taggingService.tag(TaggingEvents.open_tour);
    this.menuEventsService.showTour();
  }

  openUpdates(): void {
    this.taggingService.tag(TaggingEvents.open_updates);
    this.menuEventsService.openUpdates();
  }

  openHelpGuide(): void {
    this.taggingService.tag(TaggingEvents.open_help_guide);
    this.menuEventsService.openHelpGuide();
  }

  openReportIssue(): void {
    this.taggingService.tag(TaggingEvents.open_error_report);
    this.menuEventsService.openReportIssue();
  }

  openExternalWebsite(url: string): void {
    window.open(url, '_blank');
  }

  changeTheme(darkMode: boolean) {
    this.themeService.changeTheme(true, darkMode);
  }

  getLanguage(): string {
    return this.translate.currentLang ?? 'es';
  }

  async setLanguage(lang: string) {
    await firstValueFrom(this.translate.use(lang));
    localStorage.setItem('language', lang);
    this.uiService.showInfoDialog(
      this.translate.instant('TITLE_NEW_LANGUAGE'),
      this.translate.instant('NEW_LANGUAGE_SET')
    );
  }

  get isChatLibre(): boolean {
    return this.sessionService.isChatLibre;
  }

  get isDarkMode(): boolean {
    return this.themeService.isDarkMode;
  }
}
