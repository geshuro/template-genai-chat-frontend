import {
  Injectable,
  Renderer2,
  RendererFactory2,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ThemeInfix, ThemePrefix, ThemeSuffix } from './model/theme.model';
import { SessionService } from './session.service';
import { IndexedDBChatApiService } from './indexedb-chat-api.service';
import { TaggingEvents, TaggingService, ThemeMode } from './tagging-service';

@Injectable({
  providedIn: 'root',
})
export class ThemingService {
  isDarkMode = false;
  loadingFirst: boolean = true;
  private renderer: Renderer2;
  theme = computed(() => {
    return (
      this.themePrefix() + '-' + this.themeInfix() + '-' + this.themeSuffix
    );
  });

  themeSuffix = ThemeSuffix.theme;
  themeInfix = signal<ThemeInfix>(ThemeInfix.light);
  themePrefix = signal<ThemePrefix>(ThemePrefix['RH+']);

  private sessionService = inject(SessionService);

  constructor(
    private _renderer: RendererFactory2,
    private indexedDBChatApiService: IndexedDBChatApiService,
    private taggingService: TaggingService
  ) {
    //Applies user's theme preference
    //this.windowTheme();
    //Applies user's theme preference on theme change
    effect(() => {
      document.body.setAttribute('class', '');
      document.body.classList.add('mat-typography');
      document.body.classList.add(this.theme());
    });
    this.renderer = this._renderer.createRenderer(null, null);
  }

  windowTheme() {
    // Checks if browser has a theme preference
    if (window.matchMedia('(prefers-color-scheme: dark)').media === 'not all') {
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? this.themeInfix.set(ThemeInfix.dark)
        : this.themeInfix.set(ThemeInfix.light);
    } else {
      this.themeInfix.set(ThemeInfix.dark);
    }
  }

  changeTheme(change: boolean, darkMode?: boolean) {
    this.isDarkMode = !this.sessionService.isChatLibre
      ? false
      : darkMode !== undefined
        ? darkMode
        : localStorage.getItem('darkMode') === 'true';
    if (change) {
      this.taggingService.tag(TaggingEvents.change_theme, {
        mode: this.isDarkMode ? ThemeMode.DARK : ThemeMode.LIGHT,
      });
    }

    if (this.sessionService.isChatLibre) {
      this.themePrefix.set(ThemePrefix.CHAT_LIBRE);
      localStorage.setItem('darkMode', this.isDarkMode.toString());
      this.indexedDBChatApiService.updateSettings('darkMode', this.isDarkMode);
    } else {
      this.themePrefix.set(ThemePrefix['RH+']);
    }

    this.setDataTheme(this.isDarkMode);
  }

  setDataTheme(isDarkMode: boolean) {
    this.themeInfix.set(isDarkMode ? ThemeInfix.dark : ThemeInfix.light);
    this.renderer.setAttribute(
      document.body,
      'data-theme',
      isDarkMode ? 'dark' : 'light'
    );
  }
}
