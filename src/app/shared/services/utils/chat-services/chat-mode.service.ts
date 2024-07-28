import { Injectable, inject } from '@angular/core';
import { IPanelChat } from '@shared/models/available-chats.model';
import { Constants } from '@shared/utils/constants';
import { ChatInteractionService } from './chat-interaction.service';
import { UserEventsService } from '@shared/services/utils/user-events.service';
import { SessionService } from '../session.service';

@Injectable({
  providedIn: 'root',
})
export class ChatModeService {
  private sessionService = inject(SessionService);

  constructor(
    private interactionService: ChatInteractionService,
    private userEventsService: UserEventsService
  ) {}

  getSettigsTabsChats(darkMode: boolean) {
    const availableChats: IPanelChat[] = [
      {
        viewLetf: true,
        viewRight: true,
        label: 'RH+',
        subtitle: 'ZERO_STATE_SUBTITLE_RH+',
        mobileDesc: 'ZERO_STATE_MOBILE_DESC_RH+',
        value: 'RH+',
        type: 'text',
        roles: Constants.ALL_ROLES,
        showPromptExamples: true,
        localPrompts: false,
        showDisclaimer: true,
        textDisclaimer: 'DISCLAIMER_RH+',
        pathAnswer: '/chat/knowledgebase/search',
        localPathAnswer: '',
        iconAssistant: `url("/assets/icons/${darkMode ? 'negative' : 'positive'}/copilot-icon.png")`,
        loading: false,
        modelsListValue: ['gpt_4o_dedicated'],
        cantMessageLoad: 4,
        startMessageLoad: 100,
        isChatLibre: false,
        logo: 'assets/pics/logo-rhplus.svg',
      },
      {
        viewLetf: false,
        viewRight: true,
        label: 'CHAT LIBRE',
        subtitle: 'ZERO_STATE_SUBTITLE_CHAT_LIBRE',
        mobileDesc: 'ZERO_STATE_MOBILE_DESC_CHAT_LIBRE',
        value: 'CHAT_LIBRE',
        type: 'text',
        roles: Constants.ALL_ROLES,
        showPromptExamples: true,
        localPrompts: true,
        showDisclaimer: true,
        textDisclaimer: 'DISCLAIMER_CHAT_LIBRE',
        pathAnswer: '/chat/knowledgebase/search', // path del backend para el chat libre
        localPathAnswer: 'assets/prompts/chat-libre-prompts.json',
        domains: ['chat-ai-libre', 'chatlibre'],
        iconAssistant: 'url("/assets/icons/assistant-avatar-libre.svg")',
        iconHistory: `assistant-avatar-libre.svg`,
        loading: false,
        modelsListValue: ['gpt_4o_dedicated'],
        cantMessageLoad: 2, // siempre multiplos de 2 pregunta y respuesta
        startMessageLoad: 100,
        isChatLibre: true,
        logo: `assets/pics/logo-chat-libre.svg`,
      },
      {
        viewLetf: false,
        viewRight: true,
        label: 'IMAGENES',
        subtitle: 'ZERO_STATE_SUBTITLE_IMAGENES',
        mobileDesc: 'ZERO_STATE_MOBILE_DESC_IMAGENES',
        value: 'IMAGENES',
        type: 'image',
        roles: Constants.ALL_ROLES,
        showPromptExamples: true,
        localPrompts: true,
        showDisclaimer: true,
        textDisclaimer: 'DISCLAIMER_IMAGENES',
        pathAnswer: '',
        localPathAnswer: 'assets/prompts/images-prompts.json',
        iconAssistant: 'url("/assets/icons/assistant-avatar-images.svg")',
        iconHistory: `assistant-avatar-images.svg`,
        loading: false,
        cantMessageLoad: 2,
        startMessageLoad: 4,
        isChatLibre: true,
        logo: `assets/pics/logo-images.svg`,
      },
    ];
    // const userRoles = this.sessionService.usr?.roles;
    // const isAdmin = this.sessionService.isAdmin();
    // const isUserPro = this.sessionService.isUserPro();
    // const isChatLibre = this.sessionService.isChatLibre;

    // return availableChats.filter(chat => {
    //   const hasPermission = chat.roles.some(role => userRoles?.includes(role));
    //   const isAllowedByStatus = isChatLibre === chat.isChatLibre;
    //   return hasPermission && (isAdmin || isUserPro || isAllowedByStatus);
    // });
    return availableChats;
  }

  changeChat(chat: IPanelChat) {
    this.interactionService.changeChat(chat);
    this.userEventsService.sendClickEvent('', 'clearChat');
  }
}
