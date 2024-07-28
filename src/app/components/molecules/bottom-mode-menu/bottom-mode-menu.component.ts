import { Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { IPanelChat } from '@shared/models/available-chats.model';
import { TranslateModule } from '@ngx-translate/core';
import { ChatModeService } from '@shared/services/utils/chat-services/chat-mode.service';

@Component({
  selector: 'app-bottom-mode-menu',
  standalone: true,
  imports: [MatListModule, TranslateModule],
  templateUrl: './bottom-mode-menu.component.html',
  styleUrl: './bottom-mode-menu.component.scss',
})
export class BottomModeMenuComponent {
  availableChats: IPanelChat[] = [];

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<BottomModeMenuComponent>,
    private chatModeService: ChatModeService
  ) {
    this.availableChats = this.chatModeService.getSettigsTabsChats(false);
  }

  changeChat(chat: IPanelChat) {
    this.chatModeService.changeChat(chat);
    this._bottomSheetRef.dismiss(chat);
  }
}
