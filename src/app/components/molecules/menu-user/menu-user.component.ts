import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuEventsService } from '@shared/services/utils/menu-events.service';
import { SessionService } from '@shared/services/utils/session.service';
import {
  LanguageEnum,
  TaggingEvents,
  TaggingService,
} from '@shared/services/utils/tagging-service';
import { UiService } from '@shared/services/utils/ui.service';
import { firstValueFrom } from 'rxjs';
import { ProfileModalComponent } from '../profile-modal/profile-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { ThemingService } from '@shared/services/utils/theming.service';
import { UserEventsService } from '@shared/services/utils/user-events.service';
import { IndexedDBChatApiService } from '@shared/services/utils/indexedb-chat-api.service';

@Component({
  selector: 'app-menu-user',
  templateUrl: './menu-user.component.html',
  styleUrls: ['./menu-user.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    TranslateModule,
    RouterModule,
    NgIf,
    NgFor,
    MatCardModule,
    ProfileModalComponent,
  ],
})
export class MenuUserComponent implements OnInit {
  links: any[] = [];
  @Input()
  userName: string = 'Usuario';

  isBasicView!: boolean | null;
  roles!: any;
  oldRolesAdmin!: any;
  isAdminProUser!: any | null;
  paxIconValue: string = '';
  hasUserPhoto!: boolean;
  private themeService = inject(ThemingService);

  constructor(
    private router: Router,
    private translate: TranslateService,
    private uiService: UiService,
    private sessionService: SessionService,
    private menuEventsService: MenuEventsService,
    private taggingService: TaggingService,
    private dialog: MatDialog,
    private userEventsService: UserEventsService,
    private indexedDBChatApiService: IndexedDBChatApiService
  ) {
    this.userEventsService.getClickEvent().subscribe((response: any) => {
      const action = response.action;
      if (action === 'photoUpdated') {
        this.checkUserPhoto();
      }
    });
  }

  ngOnInit(): void {
    this.setTypeOfView();
    this.checkUserPhoto();
  }

  async setLanguage(lang: string) {
    await firstValueFrom(this.translate.use(lang));

    //StorageService.setLanguageCode(lang);

    this.taggingService.tag(TaggingEvents.change_language, {
      language: LanguageEnum[lang as keyof typeof LanguageEnum],
    });

    this.uiService.showInfoDialog(
      this.translate.instant('TITLE_NEW_LANGUAGE'),
      this.translate.instant('NEW_LANGUAGE_SET')
    );
  }

  getLanguage() {
    return this.translate.currentLang ?? 'es';
  }

  logout() {
    this.themeService.setDataTheme(false);
    this.sessionService.logout();
    this.taggingService.tag(TaggingEvents.logout_app);
    this.router.navigate(['/login']);
  }

  setTypeOfView(): void {
    if (
      sessionStorage.getItem('BackedRoles') === 'true' &&
      this.sessionService.usr?.roles.some(
        (role: any) => role === 'chat_metatron_user_basic'
      )
    ) {
      this.isBasicView = true;
    } else {
      this.isBasicView = false;
    }

    this.isSuperUser();
    sessionStorage.setItem('isBasicView', String(this.isBasicView));
  }

  seeAs(isAdmin: boolean): void {
    this.isBasicView = isAdmin;
    //sessionStorage.setItem('isBasicView', String(isAdmin));

    const roles: any = this.sessionService.usr?.roles;
    const oldRoles: any = sessionStorage.getItem('old_roles');
    const isBackedRoles: string | null = sessionStorage.getItem('BackedRoles');

    if (isBackedRoles === null) {
      sessionStorage.setItem('old_roles', roles);
      sessionStorage.setItem('BackedRoles', 'true');
    }

    let newArrayRoles: any = [];
    newArrayRoles = roles;
    if (newArrayRoles?.includes['chat_metatron_airport_agent']) {
      sessionStorage.setItem('roles', '["chat_metatron_airport_agent"]');
    } else if (newArrayRoles?.includes['chat_metatron_aircraft_technician']) {
      sessionStorage.setItem('roles', '["chat_metatron_aircraft_technician"]');
    } else {
      sessionStorage.setItem('roles', '["chat_metatron_user_basic"]');
    }

    if (isAdmin) {
      sessionStorage.setItem('roles', oldRoles);
    }

    location.reload();
  }

  isSuperUser(): void {
    this.roles = this.sessionService.usr?.roles;
    this.oldRolesAdmin = sessionStorage.getItem('old_roles');
    this.oldRolesAdmin = JSON.parse(this.oldRolesAdmin);

    this.checkRolesLoaded();
    if (this.oldRolesAdmin) {
      this.checkOldRolesLoaded();
    }
  }

  checkRolesLoaded(): void {
    if (
      this.roles?.includes('chat_metatron_user_admin') ||
      this.roles?.includes('chat_metatron_user_pro')
    ) {
      this.isAdminProUser = true;
    }
  }

  checkOldRolesLoaded(): void {
    if (
      this.oldRolesAdmin.includes('chat_metatron_user_admin') ||
      this.oldRolesAdmin.includes('chat_metatron_user_pro')
    ) {
      this.isAdminProUser = true;
    } else {
      this.isAdminProUser = false;
    }
  }

  openUserProfile(): void {
    this.dialog.open(ProfileModalComponent);
  }

  openMenuMobile() {
    this.menuEventsService.openMenuMobile();
  }

  checkUserPhoto(): void {
    this.indexedDBChatApiService
      .getSettings()
      .then(async (settings: any[] | undefined) => {
        const userPhoto = settings?.find(
          setting => setting.key === 'userPhotoProfile'
        );
        if (userPhoto) {
          this.paxIconValue = userPhoto!.value;
          this.hasUserPhoto = true;
        } else {
          this.hasUserPhoto = false;
        }
      });
  }

  changeToManagement(): void {
    this.router.navigate(['/management-menu/list']);
  }
}
