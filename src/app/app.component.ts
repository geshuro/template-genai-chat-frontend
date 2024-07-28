import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { TranslateService } from '@ngx-translate/core';
import { CheckForUpdateService } from '@shared/services/utils/updates-service/check-for-update.service';
import { HandleUnrecoverableStateService } from '@shared/services/utils/updates-service/handle-unrecoverable-state.service';
import { IndexedDBChatApiService } from '@shared/services/utils/indexedb-chat-api.service';
import { LogUpdateService } from '@shared/services/utils/updates-service/log-update.service.ts.service';
import {
  ThemeInfix,
  ThemePrefix,
} from '@shared/services/utils/model/theme.model';
import { PromptUpdateService } from '@shared/services/utils/updates-service/prompt-update.service';
import { SessionService } from '@shared/services/utils/session.service';
import {
  TaggingEvents,
  TaggingService,
} from '@shared/services/utils/tagging-service';
import { ThemingService } from '@shared/services/utils/theming.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  template: ` <router-outlet></router-outlet> `,
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterOutlet],
})
export class AppComponent implements OnInit {
  title = 'chatdios-ia-frontend';
  ThemePrefix = ThemePrefix;
  ThemeInfix = ThemeInfix;
  themeService = inject(ThemingService);
  private translate: TranslateService = inject(TranslateService);
  private swUpdate: SwUpdate = inject(SwUpdate);
  private checkForUpdateService: CheckForUpdateService = inject(
    CheckForUpdateService
  );
  private handleUnrecoverableStateService: HandleUnrecoverableStateService =
    inject(HandleUnrecoverableStateService);
  private promptUpdateService: PromptUpdateService =
    inject(PromptUpdateService);
  private logUpdateService: LogUpdateService = inject(LogUpdateService);
  private sessionService: SessionService = inject(SessionService);
  private taggingService: TaggingService = inject(TaggingService);
  private indexedDBChatApiService = inject(IndexedDBChatApiService);

  constructor() {
    this.translate.addLangs(['es', 'en', 'pt']);
    this.themeService.themePrefix.set(ThemePrefix['RH+']);
    this.themeService.loadingFirst = true;
    setTimeout(() => {
      this.currentDarkModeState();
    }, 1);
    const navigatorUserLang =
      localStorage.getItem('language') ?? navigator.language.split(/-|_/)[0];
    if (this.translate.getLangs().includes(navigatorUserLang)) {
      firstValueFrom(this.translate.use(navigatorUserLang)).catch(() => {
        this.translate.setDefaultLang('es');
        this.translate.use('es');
      });
    } else {
      this.translate.setDefaultLang('es');
      this.translate.use('es');
    }

    if (this.sessionService.isChatLibre) {
      this.themeService.themePrefix.set(ThemePrefix.CHAT_LIBRE);
    } else {
      this.themeService.themePrefix.set(ThemePrefix['RH+']);
    }
  }

  ngOnInit() {
    // const isLoggedIn = this.sessionService.isLoggedIn();
    // this.taggingService.tag(TaggingEvents.open_app, {
    //   logged_in: isLoggedIn,
    //   url: window.location.href,
    // });

    const search = window.location.search;
    const params = new URLSearchParams(search);
    const source = params.get('appSource');
    const data = params.get('data');

    if (source && data) {
      this.taggingService.tag(TaggingEvents.source_app, {
        source,
        email: data,
        url: window.location.href,
      });
    }
  }

  currentDarkModeState(): void {
    const darkMode = localStorage.getItem('darkMode');
    let darkModeValue = false;
    if (typeof darkMode === 'string' && darkMode) {
      darkModeValue = darkMode === 'true';
      this.themeService.isDarkMode = darkModeValue;
      this.changeTheme(darkModeValue);
    } else {
      this.indexedDBChatApiService
        .getSettings()
        .then(async (settings: any[] | undefined) => {
          const settingDarkMode = settings?.find(
            setting => setting.key === 'darkMode'
          );
          darkModeValue = Boolean(settingDarkMode?.value);
          this.themeService.isDarkMode = darkModeValue;
          localStorage.setItem('darkMode', darkModeValue.toString());
          this.changeTheme(darkModeValue);
        });
    }
  }

  changeTheme(darkMode: boolean) {
    this.themeService.changeTheme(
      false,
      this.sessionService.isChatLibre && darkMode
    );
    this.themeService.loadingFirst = false;
  }
}
