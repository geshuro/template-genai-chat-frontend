import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { Component, Input, OnDestroy } from '@angular/core';
import { PromptExampleComponent } from '@components/atoms/prompt-example/prompt-example.component';
import { TranslateModule } from '@ngx-translate/core';
import { ApiClientService } from '@shared/services/external/api-client.service';
import { UserEventsService } from '@shared/services/utils/user-events.service';
import { Subject, finalize, take, takeUntil } from 'rxjs';
import { ChatInteractionService } from '@shared/services/utils/chat-services/chat-interaction.service';
import { MatIconModule } from '@angular/material/icon';
import { Constants } from '@shared/utils/constants';
import { BannerComponent } from '@components/atoms/banner/banner.component';
import { SelectorsTopChatComponent } from '@components/organisms/selectors-top-chat/selectors-top-chat.component';
import { Materials } from '@shared/utils/materials-emantto';

@Component({
  selector: 'app-zero-state-container',
  standalone: true,
  imports: [
    PromptExampleComponent,
    TranslateModule,
    MatIconModule,
    NgxSkeletonLoaderModule,
    BannerComponent,
    SelectorsTopChatComponent,
  ],
  templateUrl: './zero-state-container.component.html',
  styleUrl: './zero-state-container.component.scss',
})
export class ZeroStateContainerComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  private destroyPopular$ = new Subject<void>();
  private destroyCustom$ = new Subject<void>();

  @Input()
  showPromptExamples: boolean = true;

  promptExamplesService: any[] = [];

  boxColors: string[] = ['yellow', 'purple', 'red', 'pink'];
  newColor!: string;
  knowledgebaseTitle: string = 'Recursos Humanos';
  promptExamples: any;
  isShowed: boolean = true;
  baseSubtitle!: string;
  selectBaseChanged: boolean = false;
  hasAlert: boolean = false;

  itemsSkeleton = [1, 2, 3, 4];
  crypto = window.crypto || (window as any).msCrypto;

  airCrafts = Materials.aircrafts;

  constructor(
    private userEventsService: UserEventsService,
    private apiService: ApiClientService,
    public interactionService: ChatInteractionService
  ) {
    this.userEventsService
      .getClickEvent()
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        const action = response.action;
        if (action === 'selectedTopLeft') {
          this.knowledgebaseTitle = response.title;
          this.getExamplesValues(true);
          this.selectBaseChanged = true;
        }

        if (action === 'selectedTopLeftOnlyTitle') {
          this.knowledgebaseTitle = response.title;
          this.isShowed = true;

          this.getExamplesValues();
        }

        if (action === 'clearChat') {
          this.getExamplesValues(true);
        }
      });
    this.userEventsService
      .getUpdatePromptExamples()
      .pipe(takeUntil(this.destroy$))
      .subscribe(_response => {
        this.getExamplesValues(true, _response.isFiles);
      });

    this.getExamplesValues(true);
  }

  setPromptExamples(isCustom: boolean): void {
    this.setFourRandomPrompts(this.promptExamplesService, isCustom);
  }

  getExamplesValues(reload: boolean = false, isFile: boolean = false): void {
    if (!this.interactionService.isChatChange && !reload) return;
    if (this.interactionService.chatActivate?.localPrompts) {
      this.destroyPopular$.next();
      this.destroyCustom$.next();
      this.interactionService.chatActivate!.loading = true;
      this.apiService
        .getLocalPromptsExamples(
          isFile
            ? 'assets/prompts/chat-libre-files-prompts.json'
            : this.interactionService.chatActivate.localPathAnswer
        )
        .pipe(
          finalize(() => this.setPromptExamples(true)),
          take(1),
          takeUntil(this.destroyCustom$)
        )
        .subscribe({
          next: response => {
            this.promptExamplesService = response;
            this.interactionService.chatActivate!.loading = false;
          },
          complete: () =>
            (this.interactionService.chatActivate!.loading = false),
        });
    } else {
      this.knowledgebaseTitle =
        this.interactionService.baseKnowledgeSelected?.value ?? '';
      const filter = {
        query_lang: 'SPANISH',
        knowledgebase: this.knowledgebaseTitle,
      };
      this.destroyPopular$.next();
      this.destroyCustom$.next();
      this.interactionService.chatActivate!.loading = true;
      this.apiService
        .getPromptsExamples(filter, this.interactionService.chatActivate?.value)
        .pipe(
          finalize(() => this.setPromptExamples(false)),
          take(1),
          takeUntil(this.destroyPopular$)
        )
        .subscribe({
          next: result => {
            if (
              result.chatValue === this.interactionService.chatActivate?.value
            ) {
              this.promptExamplesService = result?.response?.slice(0, 4);
            }
            this.interactionService.chatActivate!.loading = false;
          },
          complete: () =>
            (this.interactionService.chatActivate!.loading = false),
        });
    }
  }

  setFourRandomPrompts(promptsList: any, isCustom: boolean): void {
    let prompts = [...promptsList];

    if (!isCustom) {
      prompts = prompts.filter(
        object => object.knowledgebase === this.knowledgebaseTitle
      );
    }

    this.promptExamplesService = prompts.slice(0, 4);

    this.setColorsRandomly();

    this.promptExamplesService.forEach((element: any) => {
      element.query_category =
        element.query_category === Constants.UNKNOWN_QUERY_CATEGORY
          ? this.knowledgebaseTitle
          : element.query_category;

      // The  'all' knowledgebase is a not very nice name for the end user
      // So we change it to 'GENERAL_KNOWLEDGEBASE_LABEL'
      element.query_category =
        element.query_category === 'all'
          ? Constants.GENERAL_KNOWLEDGEBASE_LABEL
          : element.query_category;

      element.color = this.setColorsRandomly();
      element.icon = '✅';
    });
  }

  shufflePrompts(prompts: any): void {
    for (let i = prompts.length - 1; i > 0; i--) {
      const j = this.getRandomNumber(i + 1);
      [prompts[i], prompts[j]] = [prompts[j], prompts[i]];
    }
  }

  setColorsRandomly(): string {
    const position = this.getRandomNumber(this.boxColors.length);
    this.newColor = this.boxColors[position];
    return this.newColor;
  }

  private getRandomNumber(max: number): number {
    const randomBytes = new Uint32Array(1);
    this.crypto.getRandomValues(randomBytes);
    return randomBytes[0] % max;
  }

  get chatActivate() {
    return this.interactionService.chatActivate;
  }

  get themeSkeleton() {
    return this.interactionService.themeSkeleton;
  }

  get getSelectedKnowledgeBase() {
    return this.interactionService.baseKnowledgeSelected;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyPopular$.next();
    this.destroyPopular$.complete();
    this.destroyCustom$.next();
    this.destroyCustom$.complete();
  }
}
