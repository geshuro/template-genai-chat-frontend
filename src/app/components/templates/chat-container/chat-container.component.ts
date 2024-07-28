import { CommonModule } from '@angular/common';
import {
  AfterContentInit,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChatInputComponent } from '@components/organisms/chat-input/chat-input.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { ChatMessagesComponent } from '@components/molecules/chat-messages/chat-messages.component';
import { ChatInteractionService } from '@shared/services/utils/chat-services/chat-interaction.service';
import { Subject, take, takeUntil } from 'rxjs';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import {
  IMessageInteraction,
  IModelsResponse,
} from '@shared/models/chat-interaction.model';
import { DriveStep, PopoverDOM, driver } from 'driver.js';
import { IndexedDBChatApiService } from '@shared/services/utils/indexedb-chat-api.service';
import { MenuEventsService } from '@shared/services/utils/menu-events.service';
import { ItemChatKnowledgeComponent } from '@components/atoms/item-chat-knowledge/item-chat-knowledge.component';
import { SelectorsTopChatComponent } from '@components/organisms/selectors-top-chat/selectors-top-chat.component';
import { ZeroStateContainerComponent } from '@components/molecules/zero-state-container/zero-state-container.component';
import { ApiClientService } from '@shared/services/external/api-client.service';
import {
  TaggingService,
  TaggingEvents,
} from '@shared/services/utils/tagging-service';
import { TourStepsConf } from '@shared/utils/tour-steps';
import { Materials } from '@shared/utils/materials-emantto';
import { OverlayBlockService } from '@shared/services/utils/overlay-block.service';
import { UserEventsService } from '@shared/services/utils/user-events.service';

@Component({
  selector: 'app-chat-container',
  templateUrl: './chat-container.component.html',
  styleUrls: ['./chat-container.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatFormFieldModule,
    TranslateModule,
    RouterModule,
    ChatInputComponent,
    ChatMessagesComponent,
    ItemChatKnowledgeComponent,
    FormsModule,
    SelectorsTopChatComponent,
    ZeroStateContainerComponent,
  ],
})
export class ChatContainerComponent
  implements OnInit, AfterContentInit, OnDestroy
{
  scrollElement?: HTMLDivElement;

  private destroy$ = new Subject<void>();

  history: any = { opened: true };
  activeChat: boolean = false;
  tipo: any;
  title: string | any;
  isNewMessage: any;
  messages: IMessageInteraction[] = [];
  processing: boolean = false;
  question: any;
  isAttachPanel: any;
  availableModels: IModelsResponse[] = [];
  stepsConfig: DriveStep[] = [];
  guidedTour = true;

  driverObj = driver();
  snackBarRefError?: MatSnackBarRef<any>;

  airCrafts = Materials.aircrafts;

  private loadingService = inject(OverlayBlockService);
  content!: string | Blob[] | null;

  constructor(
    public chatInteractionService: ChatInteractionService,
    private menuEventsService: MenuEventsService,
    private translate: TranslateService,
    private _snackBar: MatSnackBar,
    private indexedDBChatApiService: IndexedDBChatApiService,
    private apiService: ApiClientService,
    private taggingService: TaggingService,
    private userEventsService: UserEventsService
  ) {}

  ngOnInit() {
    this.chatInteractionService
      .onQuestion()
      .pipe(takeUntil(this.destroy$))
      .subscribe(mensaje => {
        this.snackBarRefError?.dismiss();
        this.activeChat = true;
        this.isNewMessage = true;

        if (mensaje.isVision && mensaje.preview) {
          this.content = mensaje.preview;
        } else {
          this.content = mensaje.question;
        }

        this.messages.push({
          role: 'user',
          content: this.content,
          text: mensaje.question,
          interaction: { unique: mensaje.unique } as any,
          type: '',
          files: mensaje.files,
          isVision: mensaje.isVision,
        });
        this.question = mensaje;
        this.goScrollTopEnd();
      });

    this.chatInteractionService
      .onResponse()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: mensaje => {
          this.snackBarRefError?.dismiss();
          this.isNewMessage = true;
          this.messages.push(mensaje);
          this.goScrollTopEnd();
        },
        complete: () => {
          this.isNewMessage = false;
        },
      });

    this.chatInteractionService
      .onError()
      .pipe(takeUntil(this.destroy$))
      .subscribe(_error => {
        this.isNewMessage = false;
      });
    this.chatInteractionService
      .onClear()
      .pipe(takeUntil(this.destroy$))
      .subscribe(_status => {
        this.snackBarRefError?.dismiss();
        this.isNewMessage = false;
        this.messages = [];
        this.activeChat = false;
      });

    this.chatInteractionService
      .onLoadMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.snackBarRefError?.dismiss();
        this.activeChat = true;
        this.messages = result.messages;
        if (!result.isLoadHistory) this.goScrollTopEnd();
      });

    this.menuEventsService
      .onShowTour()
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.snackBarRefError?.dismiss();
        this.guidedTour = status;
        status && this.startTour();
      });

    this.fillAvailableModels();
  }

  ngAfterContentInit() {
    setTimeout(() => {
      // Elimina archivos que no fueron procesados por embedings
      this.indexedDBChatApiService
        .getFilesIsProcessing()
        .then((resp: any[] | undefined) => {
          if (resp && resp.length > 0) {
            resp.forEach(file => {
              this.indexedDBChatApiService.deleteFile(file.id);
            });
          }
        });
    }, 6000);

    setTimeout(() => {
      this.indexedDBChatApiService
        .getSettings()
        .then(async (settings: any[] | undefined) => {
          const settingGuidedTour = settings?.find(
            setting => setting.key === 'guidedTour'
          );
          if (settingGuidedTour) {
            this.guidedTour = settingGuidedTour!.value;
          } else {
            await this.indexedDBChatApiService.addSettings('guidedTour', true);
            this.guidedTour = true;
          }
          this.startTour();
        });
    }, 500);
  }

  goScrollTopEnd() {
    if (this.scrollElement)
      setTimeout(() => {
        this.scrollElement!.scrollTop = this.scrollElement!.scrollHeight;
      }, 10);
  }

  startTour(): void {
    this.defineTourType();
    if (this.guidedTour) {
      this.driverObj = driver({
        popoverClass: 'chatdriver-theme',
        showProgress: false,
        allowClose: true,
        nextBtnText: this.translate.instant('TOUR_NEXT_BUTTON'),
        prevBtnText: this.translate.instant('TOUR_PREV_BUTTON'),
        doneBtnText: this.translate.instant('TOUR_CLOSE_BUTTON'),
        onPopoverRender: (popover: PopoverDOM, { state }) => {
          this.checkFirstStep(popover);
          this.checkLastStep(popover);
          this.checkActiveStep(state);

          // const element = document.getElementsByClassName(
          //   'cdk-overlay-backdrop-showing'
          // )[0] as HTMLElement;

          // for (let i = 0; i < 3; i++) {
          //   element.click();
          // }
        },
        onDestroyed: (...args) => {
          const activeStep = args?.[1];
          // eslint-disable-next-line no-unsafe-optional-chaining
          const { config: { steps = [] } = {} } = args?.[2];
          const stepName = activeStep?.popover?.title || 'unknown';
          const stepNumber = steps.findIndex(
            (step: any) => step?.popover?.title === stepName
          );
          this.taggingService.tag(TaggingEvents.exit_tour, {
            stepName,
            stepNumber,
          });
        },
        steps: this.stepsConfig,
      });
      this.driverObj.drive();
      this.taggingService.tag(TaggingEvents.begin_tour);
    }
  }

  defineTourType() {
    const chatMode = this.chatInteractionService.chatActivate?.label;
    const screenWidth = window.innerWidth;
    if (screenWidth < 1280) {
      this.setSteps(TourStepsConf.widthUnder1280);
    } else if (chatMode === 'IMAGENES' || chatMode === 'CHAT LIBRE') {
      this.setSteps(TourStepsConf.basicUserVision);
    } else {
      this.setSteps(TourStepsConf.basicUser);
    }
  }

  checkFirstStep(popover: PopoverDOM) {
    if (this.driverObj.isFirstStep()) {
      const icon = document.createElement('i');
      icon.classList.add('assistant-logo');

      popover.description.appendChild(icon);

      const checkDiv = document.createElement('div');
      checkDiv.id = 'checkDiv';
      checkDiv.style.display = 'flex';
      checkDiv.style.alignItems = 'center';
      checkDiv.style.justifyContent = 'center';
      checkDiv.style.marginTop = '10px';

      const checkButton = document.createElement('input');
      checkButton.type = 'checkbox';
      checkButton.id = 'hideTour';

      const span = document.createElement('span');
      span.innerText = this.translate.instant('TOUR_HIDE_LABEL');
      span.style.marginLeft = '10px';

      checkDiv.appendChild(checkButton);
      checkDiv.appendChild(span);

      popover.wrapper.appendChild(checkDiv);

      checkButton.addEventListener('click', () => {
        if (checkButton.checked) {
          this.guidedTour = false;
          this.indexedDBChatApiService.updateSettings(
            'guidedTour',
            this.guidedTour
          );
        }
      });
    }
  }

  checkLastStep(popover: PopoverDOM) {
    if (this.driverObj.isLastStep()) {
      const checkDiv = document.createElement('div');
      checkDiv.id = 'checkDiv';
      checkDiv.style.display = 'flex';
      checkDiv.style.alignItems = 'center';
      checkDiv.style.justifyContent = 'center';
      checkDiv.style.marginTop = '10px';

      const checkButton = document.createElement('input');
      checkButton.type = 'checkbox';
      checkButton.id = 'hideTour';

      const span = document.createElement('span');
      span.innerText = this.translate.instant('TOUR_HIDE_LABEL');
      span.style.marginLeft = '10px';

      checkDiv.appendChild(checkButton);
      checkDiv.appendChild(span);

      popover.wrapper.appendChild(checkDiv);

      checkButton.addEventListener('click', () => {
        if (checkButton.checked) {
          this.guidedTour = false;
          this.indexedDBChatApiService.updateSettings(
            'guidedTour',
            this.guidedTour
          );
        }
      });
      this.taggingService.tag(TaggingEvents.finish_tour, {
        no_more: this.guidedTour,
      });
      //Cerrar al terminar el tour
      document.getElementById('mat-option-0')?.click();
      // document.getElementById('mainMenuIcon')?.click();
    }
  }

  checkActiveStep(state: any) {
    if (state.activeStep?.element === '.sidenav-side') {
      document.getElementById('mat-select-6')?.click();
    }

    if (state.activeStep?.element === '#mat-select-6-panel') {
      document.getElementById('mat-select-4')?.click();
    }

    if (state.activeStep?.element === '#send-prompt') {
      document.getElementById('mat-option-0')?.click();
    }

    if (state.activeStep?.element === '#speech-mic') {
      document.getElementById('btn-menu-help-options')?.click();
    }
  }

  setSteps(steps: any): void {
    this.stepsConfig = [];
    steps.map((element: any) => {
      if (
        Object.hasOwn(element.popover, 'title') &&
        Object.hasOwn(element.popover, 'description')
      ) {
        element.popover.title = this.translate.instant(element.popover.title);
        element.popover.description = this.translate.instant(
          element.popover.description
        );
      }
      this.stepsConfig.push(element);
    });
  }

  loadScrollElement(element: HTMLDivElement) {
    this.scrollElement = element;
    this.goScrollTopEnd();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fillAvailableModels() {
    this.apiService
      .getModels()
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.chatInteractionService.modelsList = response.map(
            (model: IModelsResponse) => ({
              type: model.type,
              label: model.name,
              speed: model.speed,
              value: model.name,
              icon: model.name,
              default: model.default,
              usedFiles:
                model.name === 'gpt_4_turbo' ||
                model.name === 'gemini_15_pro' ||
                model.name === 'gemini_15_flash',
              disabled:
                model.name === 'gemini_ultra' ||
                model.name === 'gemini_15_pro' ||
                model.name === 'gemini_10_pro_vision',
              // model.name === 'gemini_15_flash',
            })
          );
          this.chatInteractionService.modelsListAll = [
            ...this.chatInteractionService.modelsList,
          ];
          this.chatInteractionService.modelsList =
            this.chatInteractionService.modelsListAll.filter(
              model =>
                model.type == this.chatInteractionService.chatActivate?.type &&
                model.disabled === false
            );
          this.chatInteractionService.setDefaultModel();
          this.chatInteractionService.changeChat(
            this.chatInteractionService.chatActivate!
          );
        },
        complete: () => {
          this.loadingService.hideLoading();
        },
      });
  }

  get showPromptExamples() {
    return this.chatInteractionService.chatActivate?.showPromptExamples;
  }
}
