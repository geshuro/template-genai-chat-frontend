import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { TranslateModule } from '@ngx-translate/core';
import { ServiceWorkerModule, SwUpdate } from '@angular/service-worker';
import { CheckForUpdateService } from '@shared/services/utils/updates-service/check-for-update.service';
import { HandleUnrecoverableStateService } from '@shared/services/utils/updates-service/handle-unrecoverable-state.service';
import { PromptUpdateService } from '@shared/services/utils/updates-service/prompt-update.service';
import { LogUpdateService } from '@shared/services/utils/updates-service/log-update.service.ts.service';

describe('AppComponent', () => {
  beforeEach(
    async () =>
      await TestBed.configureTestingModule({
        imports: [
          RouterTestingModule,
          AppComponent,
          TranslateModule.forRoot(),
          ServiceWorkerModule.register('', { enabled: false }),
        ],
        providers: [
          SwUpdate,
          CheckForUpdateService,
          HandleUnrecoverableStateService,
          PromptUpdateService,
          LogUpdateService,
        ],
      }).compileComponents()
  );

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
