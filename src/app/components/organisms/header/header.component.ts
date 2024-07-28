import { Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { UiService } from '@shared/services/utils/ui.service';
import { MenuUserComponent } from '@components/molecules/menu-user/menu-user.component';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { SessionService } from '@shared/services/utils/session.service';
import { HelpMenuComponent } from '@components/molecules/help-menu/help-menu.component';
import { SelectorsTopChatComponent } from '../selectors-top-chat/selectors-top-chat.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ChatInteractionService } from '@shared/services/utils/chat-services/chat-interaction.service';
import { IPanelChat } from '@shared/models/available-chats.model';
import { UserEventsService } from '@shared/services/utils/user-events.service';
import { SidenavService } from '@shared/services/utils/sidenav.service';
import {
  MatBottomSheet,
  MatBottomSheetModule,
} from '@angular/material/bottom-sheet';
import { BottomModeMenuComponent } from '@components/molecules/bottom-mode-menu/bottom-mode-menu.component';
import { ChatModeService } from '@shared/services/utils/chat-services/chat-mode.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    MenuUserComponent,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    HelpMenuComponent,
    SelectorsTopChatComponent,
    MatTabsModule,
    MatButtonModule,
    MatBottomSheetModule,
    BottomModeMenuComponent,
  ],
})
export class HeaderComponent {
  @ViewChild('darkModeSwitch', { read: ElementRef }) element:
    | ElementRef
    | undefined;
  darkMode = false;
  disabled = false;

  user: any;
  name: string = '';
  // activeChat: boolean = false;

  @Input() title: string | undefined;

  private supportedLanguages: Array<string> = ['es', 'en', 'pt'];

  availableChats: IPanelChat[] = [];

  sessionService = inject(SessionService);

  constructor(
    private translate: TranslateService,
    private router: Router,
    private uiService: UiService,
    public chatInteractionService: ChatInteractionService,
    private interactionService: ChatInteractionService,
    private userEventsService: UserEventsService,
    private sidenavService: SidenavService,
    private bottomModeMenu: MatBottomSheet,
    private chatModeService: ChatModeService
  ) {
    // this.links = SessionService.getAvailableRoutes();
    // this.links = this.filter();
    this.name = this.sessionService.usr?.userName || '';

    this.availableChats = this.chatModeService.getSettigsTabsChats(
      this.darkMode
    );
    //@TODO Validate when the chat is not available redirect to not found page
    const availableByDomain = this.availableChats.find(chat =>
      chat.domains?.find(domain => window.location.host.includes(domain))
    );
    const sessionChatActive = sessionStorage.getItem('chatActive');
    const newChatActive =
      (sessionChatActive ? JSON.parse(sessionChatActive) : undefined) ??
      availableByDomain ??
      this.availableChats[0];
    newChatActive && this.interactionService.changeChat(newChatActive);
  }

  getFlag(key: string) {
    switch (key) {
      case 'es':
        return 'fi fi-cl';

      case 'en':
        return 'fi fi-us';

      case 'pt':
        return 'fi fi-br';

      default:
        return '';
    }
  }

  getSupported() {
    return this.supportedLanguages;
  }

  async logout() {
    const translations = await firstValueFrom(
      this.translate.get(['TITLE_LOGOUT', 'QUESTION_ARE_YOU_SURE'])
    );
    const title = translations['TITLE_LOGOUT'];
    const question = translations['QUESTION_ARE_YOU_SURE'];
    const ret = await this.uiService.showQuestionDialog(title, question);
    if (ret == 'yes' || ret == 'ok') {
      this.sessionService.logout();
      this.router.navigate(['/login']);
    }
  }

  async setLanguage(lang: string) {
    await firstValueFrom(this.translate.use(lang));

    //StorageService.setLanguageCode(lang);

    this.uiService.showInfoDialog(
      this.translate.instant('TITLE_NEW_LANGUAGE'),
      this.translate.instant('NEW_LANGUAGE_SET')
    );
  }

  getLanguage() {
    return this.translate.currentLang ?? 'es';
  }

  get activeChat() {
    return this.interactionService.chatActivate;
  }

  changeChat(chat: IPanelChat) {
    this.chatModeService.changeChat(chat);
  }

  toggleSidenav() {
    this.sidenavService.toggle();
  }

  isSidenavOpen() {
    return this.sidenavService.isOpen();
  }

  openBottomSheet(): void {
    this.bottomModeMenu.open(BottomModeMenuComponent);
  }
}
