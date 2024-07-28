import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { SpinnerComponent } from '@components/atoms/spinner/spinner.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChatHistoryService } from '@shared/services/utils/chat-services/chat-history.service';
import { IndexedDBChatApiService } from '@shared/services/utils/indexedb-chat-api.service';
import { UserEventsService } from '@shared/services/utils/user-events.service';
import { jwtDecode } from 'jwt-decode';
import { SessionService } from '@shared/services/utils/session.service';

@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [MatIconModule, NgClass, TranslateModule, SpinnerComponent],
  templateUrl: './profile-modal.component.html',
  styleUrl: './profile-modal.component.scss',
})
export class ProfileModalComponent implements OnInit {
  name: string = '';
  email: string = '';
  isChangingAvatar: boolean = false;
  roles!: any;
  currentRole: string = '';
  paxList: string[] = ['pax1', 'pax2', 'pax3', 'pax4', 'pax5', 'pax6'];
  paxIconValue: string = '';
  chatsRH!: any;
  chatsIMAGES!: any;
  chatsCHATLIBRE!: any;
  combinedChats!: any;
  isChatsLoaded: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ProfileModalComponent>,
    private indexedDBChatApiService: IndexedDBChatApiService,
    private chatHistory: ChatHistoryService,
    private indexedDBChat: IndexedDBChatApiService,
    private userEventsService: UserEventsService,
    private translateService: TranslateService,
    private sessionService: SessionService
  ) {
    this.getChats();
  }

  ngOnInit(): void {
    this.setUserInformation();
    this.definePhotoProfile();
  }

  setUserInformation(): void {
    const userData: any = jwtDecode(this.sessionService.usr!.token!);
    this.name = userData.name;
    this.email = userData.preferred_username;

    this.roles = this.sessionService.usr?.roles;

    const lastIndex = this.roles.length - 1;
    let comma = '';

    this.roles.forEach((role: any) => {
      const index = this.roles.indexOf(role);
      role = this.translateService.instant(role);
      comma = index === lastIndex ? '' : ', ';
      this.currentRole = this.currentRole.concat(role);
      this.currentRole = this.currentRole.concat(comma);
    });
  }

  async definePhotoProfile() {
    this.indexedDBChatApiService
      .getSettings()
      .then(async (settings: any[] | undefined) => {
        const userPhoto = settings?.find(
          setting => setting.key === 'userPhotoProfile'
        );
        if (userPhoto) {
          this.paxIconValue = userPhoto!.value;
        } else {
          this.paxIconValue = 'pax3';
        }
      });
  }

  async getChats() {
    this.chatsRH = await this.chatHistory.getChatHistory('RH+');
    this.chatsIMAGES = await this.chatHistory.getChatHistory('IMAGENES');
    this.chatsCHATLIBRE = await this.chatHistory.getChatHistory('CHAT_LIBRE');
    this.combinedChats = [
      ...this.chatsRH,
      ...this.chatsIMAGES,
      ...this.chatsCHATLIBRE,
    ];
    this.isChatsLoaded = true;
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  changeAvatar(): void {
    this.isChangingAvatar = true;
  }

  resetAvatar(): void {
    this.paxIconValue = 'pax3';
  }

  uploadUserIcon(): void {
    this.isChangingAvatar = !this.isChangingAvatar;
  }

  deleteChats() {
    this.combinedChats.forEach((chat: any) => {
      chat.topics.forEach((element: any) => {
        this.indexedDBChat.deleteChat(element.id);
      });
    });
    this.userEventsService.sendClickEvent('', 'chatsDeleted');
  }

  cancelUpload(): void {
    this.definePhotoProfile();
    this.isChangingAvatar = !this.isChangingAvatar;
  }

  async saveUpload() {
    await this.indexedDBChatApiService.updateSettings(
      'userPhotoProfile',
      this.paxIconValue
    );
    this.definePhotoProfile();
    this.isChangingAvatar = !this.isChangingAvatar;
    this.userEventsService.sendClickEvent('', 'photoUpdated');
  }

  changePhotoIcon(pax: any): void {
    this.paxIconValue = pax;
  }
}
