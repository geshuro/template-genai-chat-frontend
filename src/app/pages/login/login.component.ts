import { ThemingService } from '@shared/services/utils/theming.service';
import { Component, OnInit, inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { Router } from '@angular/router';
import { SessionService } from '@shared/services/utils/session.service';
import { FooterComponent } from '@components/organisms/footer/footer.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {
  TaggingService,
  TaggingEvents,
} from '@shared/services/utils/tagging-service';
import { ApiClientService } from '@shared/services/external/api-client.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, FooterComponent, TranslateModule, MatButtonModule],

  standalone: true,
})
export class LoginComponent implements OnInit {
  loggedIn: boolean = false;

  errorLogin: boolean = false;

  showLogin = false;

  private themingService = inject(ThemingService);

  constructor(
    private sessionService: SessionService,
    private authService: MsalService,
    private router: Router,
    private taggingService: TaggingService,
    private apiClient: ApiClientService
  ) {
    // this.loggedIn = this.isLoggedIn();
    this.taggingService.tag(TaggingEvents.open_login);
    sessionStorage.setItem('countRefresh', '0');
    if (this.isChatLibre) {
      document.title = 'CHAT LIBRE';
    }
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.themingService.setDataTheme(false);
    }, 100);
  }

  async login() {
    this.taggingService.tag(TaggingEvents.click_login_button);
    this.logout();
    await this.sessionService.loginWithAzureAD();
    this.apiClient.getZendeskToken();
    this.themingService.changeTheme(false);
    this.taggingService.tag(TaggingEvents.login_app, {
      // Login will never really fail if we use Azure SSO Login. Azure handles that.
      success: true,
    });
    this.sessionService.startSessionTimer();
    this.router.navigate(['chat']);
  }

  logout() {
    this.sessionService.logout();
    this.loggedIn = false;
  }

  private isLoggedIn() {
    return this.sessionService.isLoggedIn();
  }

  setLoginDisplay() {
    this.showLogin = this.authService.instance.getAllAccounts().length > 0;
  }

  get isChatLibre() {
    return this.sessionService.isChatLibre;
  }
}
