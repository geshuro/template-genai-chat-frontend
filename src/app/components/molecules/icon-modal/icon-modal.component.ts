import { ThemingService } from '@shared/services/utils/theming.service';
import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { Constants } from '@shared/utils/constants';
import { PrimaryButtonComponent } from '@components/atoms/primary-button/primary-button.component';
import { SecondaryButtonComponent } from '@components/atoms/secondary-button/secondary-button.component';
import { IndexedDBChatApiService } from '@shared/services/utils/indexedb-chat-api.service';

@Component({
  selector: 'app-icon-modal',
  standalone: true,
  imports: [
    PickerComponent,
    CommonModule,
    TranslateModule,
    PrimaryButtonComponent,
    SecondaryButtonComponent,
    MatIconModule,
  ],
  templateUrl: './icon-modal.component.html',
  styleUrl: './icon-modal.component.scss',
})
export class IconModalComponent implements OnInit {
  private themingService = inject(ThemingService);
  constructor(
    public dialogRef: MatDialogRef<IconModalComponent>,
    private indexedDBChatApiService: IndexedDBChatApiService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      cancel: string;
      accept: string;
      emoji: string;
      baseKnowledge: string;
    }
  ) {}

  showEmojiPicker: boolean = false;
  emojiSelected!: string;
  imageIconSelected: string = '';
  customEmojis = {} as any;
  settingDarkMode?: { id: number; key: string; value: any };

  ngOnInit(): void {
    this.currentDarkModeState();
    if (this.data.baseKnowledge && this.data.emoji == '') {
      this.defineEmojiButton();
      this.defineIconCustom();
    } else {
      this.emojiSelected = this.data.emoji ? this.data.emoji : '😀';
      this.defineIconCustom();
    }
  }

  currentDarkModeState(): void {
    const darkMode = localStorage.getItem('darkMode');
    if (typeof darkMode === 'string' && darkMode) {
      this.themingService.isDarkMode = darkMode === 'true';
    } else {
      this.indexedDBChatApiService
        .getSettings()
        .then(async (settings: any[] | undefined) => {
          this.settingDarkMode = settings?.find(
            setting => setting.key === 'darkMode'
          );
          this.themingService.isDarkMode = Boolean(this.settingDarkMode?.value);
          localStorage.setItem(
            'darkMode',
            Boolean(this.settingDarkMode?.value).toString()
          );
        });
    }
  }

  defineIconCustom(): void {
    switch (this.data.baseKnowledge) {
      case 'Recursos Humanos':
        this.customEmojis = Constants.customEmojiRRHH;
        break;
      case 'Service Desk':
        this.customEmojis = Constants.customEmojiServiceDesk;
        break;
      case 'all':
        this.customEmojis = Constants.customEmojiGeneral;
        break;
      default:
        this.imageIconSelected = '';
        break;
    }
  }

  defineEmojiButton(): void {
    switch (this.data.baseKnowledge) {
      case 'Recursos Humanos':
        this.imageIconSelected = 'icons-rh+/icon-512x512.png';
        break;
      case 'Service Desk':
        this.imageIconSelected = 'sd_logo.png';
        break;
      case 'all':
        this.imageIconSelected = 'copilot_logo.png';
        break;
      default:
        this.imageIconSelected = '';
        break;
    }
  }

  toggleEmojiPicker(): void {
    this.currentDarkModeState();
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  selectEmoji(event: any): void {
    const rhFolderPath = 'icons-rh+/';
    if (event.emoji.imageUrl) {
      const url = event.emoji.imageUrl;
      const parts = event.emoji.imageUrl.split('/');
      const fileName = parts[parts.length - 1];
      this.imageIconSelected = url.includes(rhFolderPath)
        ? rhFolderPath + fileName
        : fileName;
      this.emojiSelected = '';
    } else {
      this.imageIconSelected = '';
      this.emojiSelected = event.emoji.native;
    }
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  updateIcon(): void {
    this.dialogRef.close({
      action: 'updateEmoji',
      value: this.emojiSelected,
    });
  }

  clickCancel(): void {
    this.dialogRef.close({
      action: 'cancel',
      value: '',
    });
  }

  get isDarkMode(): boolean {
    return this.themingService.isDarkMode;
  }
}
