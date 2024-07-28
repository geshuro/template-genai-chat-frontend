import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import {
  provideRouter,
  withDisabledInitialNavigation,
  withEnabledBlockingInitialNavigation,
  withHashLocation,
} from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { routes } from './routes';
import { environment } from './environments/environment';
import { enableProdMode, isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
  provideHttpClient,
} from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalBroadcastService,
  MsalGuard,
  MsalGuardConfiguration,
  MsalInterceptor,
  MsalInterceptorConfiguration,
  MsalService,
} from '@azure/msal-angular';
import {
  BrowserCacheLocation,
  BrowserUtils,
  IPublicClientApplication,
  InteractionType,
  LogLevel,
  PublicClientApplication,
} from '@azure/msal-browser';
import { VERSION as CDK_VERSION } from '@angular/cdk';
import {
  VERSION as MAT_VERSION,
  MatNativeDateModule,
} from '@angular/material/core';
import { AuthGuardService } from '@shared/services/security/auth-guard.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { httpInterceptorProviders } from '@shared/services/http/interceptors';
import { Base64Pipe } from '@shared/pipes/base64.pipe';
import { OverlayModule } from '@angular/cdk/overlay';
import { NgxGoogleAnalyticsModule } from 'ngx-google-analytics';

if (environment.production) {
  enableProdMode();
  environment.clientId = sessionStorage.getItem('azure_app_client_id') ?? '';
  environment.authority =
    sessionStorage.getItem('azure_authority') ?? environment.authority;
  environment.apiUrl = sessionStorage.getItem('dns_record_api') ?? '';
  environment.gtmId = sessionStorage.getItem('gtm_tag') ?? environment.gtmId;
  environment.gApiKey =
    sessionStorage.getItem('gApiKey') ?? environment.gApiKey;
  environment.gClientId =
    sessionStorage.getItem('gClientId') ?? environment.gClientId;
}

export function HttpLoaderFactory(http: HttpClient): any {
  return new TranslateHttpLoader(
    http,
    './assets/i18n/',
    '.json?ngsw-bypass=true'
  );
}

export function loggerCallback(logLevel: LogLevel, message: string) {
  console.log(message);
}

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.clientId,
      authority: environment.authority,
      redirectUri: environment.redirectUri,
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
      storeAuthStateInCookie: false,
    },
    system: {
      allowNativeBroker: false, // Disables WAM Broker
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Info,
        piiLoggingEnabled: false,
      },
    },
  });
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: ['User.Read', 'Directory.Read.All'],
      prompt: 'select_account',
    },
  };
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set('https://graph.microsoft.com/v1.0/me', [
    'User.Read',
  ]);
  protectedResourceMap.set('https://graph.microsoft.com/v1.0/groups', [
    'Group.Read.All',
  ]);

  return {
    interactionType: InteractionType.Popup,
    protectedResourceMap,
  };
}

console.info('Angular CDK version', CDK_VERSION.full);
console.info('Angular Material version', MAT_VERSION.full);

const initialNavigation =
  !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup()
    ? withEnabledBlockingInitialNavigation() // Set to enabledBlocking to use Angular Universal
    : withDisabledInitialNavigation();

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, initialNavigation, withHashLocation()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideHttpClient(),
    importProvidersFrom(
      BrowserAnimationsModule,
      BrowserModule,
      HttpClientModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      }),
      NgxGoogleAnalyticsModule.forRoot(environment.gtmId),
      MatBottomSheetModule,
      MatSnackBarModule,
      MatNativeDateModule,
      OverlayModule,
      NgxSkeletonLoaderModule
    ),
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory,
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true,
    },
    httpInterceptorProviders,
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    AuthGuardService,
    Base64Pipe,
  ],
}).catch(err => console.error(err));
