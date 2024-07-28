import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule } from '@angular/router';
import { DialogMenuMobileComponent } from '@components/templates/dialog-menu-mobile/dialog-menu-mobile.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuEventsService } from '@shared/services/utils/menu-events.service';
import { SessionService } from '@shared/services/utils/session.service';
import { ThemingService } from '@shared/services/utils/theming.service';
import { UiService } from '@shared/services/utils/ui.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-list-menu-mobile',
  standalone: true,
  imports: [
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatDialogClose,
    MatMenuModule,
    MatDividerModule,
    CommonModule,
    NgIf,
    NgFor,
    RouterModule,
  ],
  templateUrl: './list-menu-mobile.component.html',
  styleUrl: './list-menu-mobile.component.scss',
})
export class ListMenuMobileComponent {
  private themeService = inject(ThemingService);

  constructor(
    private router: Router,
    private translate: TranslateService,
    private uiService: UiService,
    private sessionService: SessionService,
    private menuEventsService: MenuEventsService,
    public dialogRef: MatDialogRef<DialogMenuMobileComponent>
  ) {}

  changeTheme(dark: boolean) {
    this.themeService.changeTheme(true, dark);
  }

  async setLanguage(lang: string) {
    await firstValueFrom(this.translate.use(lang));
    localStorage.setItem('language', lang);

    //StorageService.setLanguageCode(lang);

    this.uiService.showInfoDialog(
      this.translate.instant('TITLE_NEW_LANGUAGE'),
      this.translate.instant('NEW_LANGUAGE_SET')
    );
  }

  getLanguage() {
    return this.translate.currentLang ?? 'es';
  }

  openReportIssue() {
    this.menuEventsService.openReportIssue();
  }

  openUpdates() {
    this.menuEventsService.openUpdates();
  }

  logout() {
    this.dialogRef.close();
    this.sessionService.logout();
    this.router.navigate(['/login']);
  }

  get isChatLibre() {
    return this.sessionService.isChatLibre;
  }

  get isDarkMode() {
    return this.themeService.isDarkMode;
  }
}
