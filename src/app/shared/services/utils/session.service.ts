import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  MsalGuardConfiguration,
  MSAL_GUARD_CONFIG,
  MsalGuardAuthRequest,
} from '@azure/msal-angular';
import {
  AccountInfo,
  AuthenticationResult,
  BrowserCacheLocation,
  IPublicClientApplication,
  PopupRequest,
  PublicClientApplication,
  SilentRequest,
} from '@azure/msal-browser';
import { UiService } from './ui.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject, delay, of, take, takeUntil } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private loggedInUsername: string = '';
  private timer: any;
  private timerMessage: any;
  private app?: IPublicClientApplication;
  private isMsalInitialized = false;
  public actionsAvailable: string[] = [];

  private readonly ROL_ADMIN = 'chat_metatron_user_admin';

  private readonly ROL_PRO = 'chat_metatron_user_pro';

  private _isChatlibre = false;

  private ngUnsubscribe = new Subject<void>();

  public usr?: {
    id: string;
    token: string;
    roles: string[];
    exp: number;
    uniqueId: string;
    userName: string | undefined;
    userEmail: string | undefined;
  };

  public clientApp: Promise<IPublicClientApplication> =
    PublicClientApplication.createPublicClientApplication({
      auth: {
        clientId: environment.clientId,
        authority: environment.authority,
        redirectUri: '/black.html',
        postLogoutRedirectUri: '/',
      },
      cache: {
        cacheLocation: BrowserCacheLocation.LocalStorage,
        storeAuthStateInCookie: false,
      },
    });

  constructor(
    private router: Router,
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private ui: UiService,
    private translate: TranslateService
  ) {
    this.clientApp.then(app => {
      this.app = app;
      this.startMsalApp();
    });
    this._isChatlibre = window.location.host.includes('chatlibre');
  }

  async startMsalApp() {
    await this.handleloginWithAzureADResponse(this.msalAccount);
    this.startSessionTimer();
  }

  /**
   * Rutas aceptadas por cada rol
   */
  private routesByRole: any = {
    chat_metatron_user_basic: ['chat'],
    chat_metatron_user_pro: ['chat'],
    chat_metatron_user_admin: ['chat'],
    chat_metatron_airport_agent: ['chat'],
    chat_metatron_legal_leasing: ['chat'],
    chat_metatron_aircraft_technician: ['chat'],
    chat_metatron_user_airtalk: ['chat'],
  };

  private allActionsHistory: any = [
    'deleteHistory',
    'editNameHistory',
    'editIconHistory',
    'exportHistory',
    'pingHistory',
  ];

  /**
   * Acciones aceptadas por cada rol
   */
  private actionsByRole: any = {
    chat_metatron_user_basic: [...this.allActionsHistory, 'sendAnswer'],
    chat_metatron_user_pro: [...this.allActionsHistory, 'sendAnswer'],
    chat_metatron_user_admin: [...this.allActionsHistory, 'sendAnswer'],
    chat_metatron_airport_agent: [...this.allActionsHistory, 'sendAnswer'],
    chat_metatron_legal_leasing: [...this.allActionsHistory, 'sendAnswer'],
    chat_metatron_aircraft_technician: [
      ...this.allActionsHistory,
      'sendAnswer',
    ],
    chat_metatron_user_airtalk: [...this.allActionsHistory, 'sendAnswer'],
  };

  public getLoggedInUsername() {
    const id = this.usr?.id;
    if (!id) {
      return '';
    }
    return atob(id);
  }

  public logout() {
    sessionStorage.clear();
    const isDarkMode = localStorage.getItem('darkMode');
    localStorage.clear();
    if (isDarkMode) {
      localStorage.setItem('darkMode', isDarkMode);
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getUniqueId(): any | null {
    const uniqueId = this.usr?.uniqueId;
    if (!uniqueId) {
      return null;
    }
    return uniqueId;
  }

  getUserEmail(): any | null {
    const userEmail = this.usr?.userEmail;
    if (!userEmail) {
      return null;
    }
    return userEmail;
  }

  isAdmin(): boolean {
    const roles = this.usr?.roles;
    if (roles == null) {
      return false;
    }
    return roles.includes(this.ROL_ADMIN);
  }

  isBasic(): boolean {
    const roles = this.usr?.roles;
    if (roles == null) {
      return false;
    }
    return roles.includes('chat_metatron_user_basic');
  }

  isUserPro(): boolean {
    const roles = this.usr?.roles;
    if (roles == null) {
      return false;
    }
    return roles.includes(this.ROL_PRO);
  }

  storeError(error: string) {
    sessionStorage.setItem('last_http_error', error);
  }

  getLastError(): string | null {
    return sessionStorage.getItem('last_http_error');
  }

  public async isLoggedIn() {
    await this.clientApp;
    const token = this.usr?.token;
    if (!token || token == 'undefined' || this.isTokenExpired()) {
      return false;
    }
    return true;
  }

  isTokenExpired(): boolean {
    const expiryTime: number = Number(this.usr?.exp);
    if (expiryTime) {
      return 1000 * expiryTime - new Date().getTime() < 5000;
    } else {
      return true;
    }
  }

  getAuthorizationToken(): string {
    const token = this.usr?.token;
    if (!token) {
      return 'null';
    }
    return token;
  }

  public async canUserAccessRoute(route: string) {
    const myRoles = this.usr?.roles;
    if (myRoles != null) {
      const routesByRole: any = this.routesByRole;
      return myRoles.some(role => routesByRole[role]?.includes(route));
    }
    return false;
  }

  public getAvailableRoutes(): string[] {
    const myRoles = this.usr?.roles;
    const myRoutes: string[] = [];
    if (myRoles != null) {
      const routesByRole: any = this.routesByRole;
      myRoles.forEach((role: string | number) => {
        if (routesByRole[role] !== undefined) {
          routesByRole[role].forEach((allowedRoute: any) => {
            myRoutes.push(allowedRoute);
          });
        }
      });
    }

    return myRoutes;
  }

  public getAvailableActions(): string[] {
    const myRoles = this.usr?.roles;
    const myActions: Set<string> = new Set();
    if (myRoles != null) {
      myRoles.forEach((role: string | number) => {
        if (this.actionsByRole[role] !== undefined) {
          this.actionsByRole[role].forEach((allowedRoute: any) => {
            myActions.add(allowedRoute);
          });
        }
      });
    }
    return Array.from(myActions);
  }

  public checkRoleForAction(action: string): boolean {
    if (this.actionsAvailable.length == 0) {
      this.actionsAvailable = this.getAvailableActions();
    }
    return this.actionsAvailable.includes(action);
  }

  private async initializeMsal(): Promise<void> {
    try {
      await this.app!.initialize();
      await this.app!.handleRedirectPromise();
      this.isMsalInitialized = true;
    } catch (error) {
      console.error('MSAL initialization error:', error);
    }
  }

  public async loginWithAzureAD(): Promise<any> {
    if (!this.isMsalInitialized) {
      await this.initializeMsal();
    }
    if (this.msalGuardConfig.authRequest) {
      const response = await this.app!.loginPopup({
        ...this.msalGuardConfig.authRequest,
      } as PopupRequest);
      await this.handleloginWithAzureADResponse(response);
    }
  }

  private encrypt(text: string): string {
    return btoa(text);
  }

  private async handleloginWithAzureADResponse(response: any) {
    const tokenClaims: any = JSON.parse(JSON.stringify(response.idTokenClaims));
    let id = this.encrypt(response.account?.username ?? response.username);
    if (id == null) {
      id = '';
    }
    this.loggedInUsername = id;

    this.usr = {
      id: id,
      token: response.idToken,
      roles: tokenClaims.roles,
      exp: tokenClaims.exp,
      uniqueId: response.uniqueId,
      userName: response.account?.name ?? response.name,
      userEmail: response.account?.username ?? response.username,
    };

    console.log(this.usr);

    this.actionsAvailable = this.getAvailableActions();
  }

  public startSessionTimer(): void {
    const tokenExpiration = this.msalAccount?.idTokenClaims?.exp ?? 0;

    // Check for missing token or claims to avoid potential errors
    if (!tokenExpiration) {
      this.logout();
      this.router.navigate(['/login']);
      console.warn('Token expiration not found in msalAccount.idTokenClaims');
      return;
    }
    const bufferTime = 10 * 60; // 10 minutes to refresh
    const currentTimeInSecs = Date.now() / 1000;

    const remainingTimeInSecs =
      tokenExpiration - currentTimeInSecs - bufferTime;
    const expirationTimeInMs = remainingTimeInSecs * 1000;
    of(true)
      .pipe(delay(expirationTimeInMs), take(1), takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: async () => {
          const count = Number(sessionStorage.getItem('countRefresh') ?? '0');
          if (count >= environment.attemptsRefreshToken) {
            const res = await this.ui.showQuestionDialog(
              this.translate.instant('TIMEOUT_LOGOUT_TITTLE'),
              this.translate.instant('TIMEOUT_LOGOUT_MESSAGE'),
              'full-screen-modal',
              120
            );
            if (res == 'yes') {
              this.refreshToken();
            } else {
              this.logout();
              this.router.navigate(['/login']);
            }
            sessionStorage.setItem('countRefresh', '0');
          } else {
            this.refreshToken();
            const count = Number(sessionStorage.getItem('countRefresh') ?? '0');
            sessionStorage.setItem('countRefresh', (count + 1).toString());
          }
        },
      });
  }

  private get msalAccount(): AccountInfo {
    if (!this.app) return undefined as any;
    return this.app.getAllAccounts()[0];
  }

  private refreshToken(): void {
    console.log('==> Session Manager: Refreshing token...');

    const { scopes } = this.msalGuardConfig.authRequest as MsalGuardAuthRequest;
    const request: SilentRequest = {
      scopes: scopes as string[],
      account: this.msalAccount,
      forceRefresh: true,
    };

    this.app!.acquireTokenSilent(request)
      .then(async (res: AuthenticationResult) => {
        console.log('==> Session Manager: Token refrescado exitosamente');
        this.handleloginWithAzureADResponse(res);
        this.resetSessionTimer();
      })
      .catch(error => {
        console.error(
          '==> Session Manager: Error al refrescar el token:',
          error
        );
        this.logout();
        this.router.navigate(['/login']);
      });
  }
  resetSessionTimer(): void {
    console.log('==> Session Manager: Resetting Session timer...');
    clearTimeout(this.timer);
    clearTimeout(this.timerMessage);
    this.startSessionTimer();
  }

  get isChatLibre(): boolean {
    return this._isChatlibre;
  }

  set isChatLibre(value: boolean) {
    this._isChatlibre = value;
  }
}
