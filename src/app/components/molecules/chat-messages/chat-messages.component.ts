import { DatePipe, NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  input,
  Output,
  ViewChild,
  OnInit,
  OnDestroy,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { ChatInputActionsComponent } from '../chat-input-actions/chat-input-actions.component';
import { ChatInputFeedbackComponent } from '../chat-input-feedback/chat-input-feedback.component';
import {
  IGridImage,
  IMessageInteraction,
} from '@shared/models/chat-interaction.model';
import { MatCardModule } from '@angular/material/card';
import { GridImagesComponent } from '@components/molecules/grid-images/grid-images.component';
import { TranslateModule } from '@ngx-translate/core';
import { ChatInteractionService } from '@shared/services/utils/chat-services/chat-interaction.service';
import { SpinnerComponent } from '@components/atoms/spinner/spinner.component';
import { ApiClientService } from '@shared/services/external/api-client.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ChatTypeIA } from '@shared/services/utils/tagging-service/types';
import { Subject, interval, takeUntil } from 'rxjs';

@Component({
  selector: 'app-chat-messages',
  standalone: true,
  imports: [
    NgClass,
    ChatInputActionsComponent,
    ChatInputFeedbackComponent,
    GridImagesComponent,
    MatCardModule,
    DatePipe,
    TranslateModule,
    SpinnerComponent,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './chat-messages.component.html',
  styleUrl: './chat-messages.component.scss',
})
export class ChatMessagesComponent
  implements AfterViewInit, OnInit, OnChanges, OnDestroy
{
  processing = input.required<any>();
  isNewMessage = input.required<boolean>();
  messages = input.required<IMessageInteraction[]>();
  @Output() loadComponent = new EventEmitter<HTMLDivElement>();
  @Output() messagesChange = new EventEmitter<IMessageInteraction[]>();

  @ViewChild('scrollMe')
  scrollElement?: ElementRef<HTMLDivElement>;

  private destroy$ = new Subject<void>();
  private destroyTimer$ = new Subject<void>();

  listOfTitlesText = [
    { title: 'STEP_1_ACTION_LOG_TEXT', timeInSecodsMin: 0, timeInSecodsMax: 3 },
    {
      title: 'STEP_2_ACTION_LOG_TEXT',
      timeInSecodsMin: 4,
      timeInSecodsMax: 29,
    },
    {
      title: 'STEP_3_ACTION_LOG_TEXT',
      timeInSecodsMin: 30,
      timeInSecodsMax: 100000,
    },
    {
      title: 'STEP_4_ACTION_LOG_TEXT',
      timeInSecodsMin: -1,
      timeInSecodsMax: -1,
    },
  ];
  titleGeneraleImage = 'STEP_1_ACTION_LOG_IMAGE';

  visibleTitles: any[] = [];
  currentStep: number = 0;
  isComplete: boolean = false;
  showLoadingFirst: boolean = true;
  showLoadingSecond: boolean = true;
  status!: boolean;
  tabSelected!: string;
  labelTabImages: string = 'IMAGENES';
  errorText: string = 'ERROR_IMAGE_ACTION_LOG';
  errorImage: string = 'ERROR_IMAGE_ACTION_LOG';
  lastRole!: string;
  lastMessage?: IMessageInteraction;

  lazyLoading = false;

  imagesRender: IGridImage[] = [];

  questionRegenerate: string = '';

  constructor(
    private chatInteractionService: ChatInteractionService,
    private apiClient: ApiClientService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isNewMessage'] && this.tabSelected !== this.labelTabImages) {
      this.loadingListText();
      this.getTheLastMessage();
    }
  }

  ngOnInit(): void {
    this.tabSelected = this.chatActivate?.label;
    this.getTheLastMessage();
    this.chatInteractionService
      .onResponse()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: _mensaje => {
          this.destroyTimer$.next();
          this.getTheLastMessage();
        },
      });
    this.chatInteractionService
      .onQuestion()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: _mensaje => {
          this.getTheLastMessage();
          this.loadingListText();
        },
      });
  }

  loadingListText(): void {
    this.currentStep = 0;
    interval(1000)
      .pipe(takeUntil(this.destroyTimer$))
      .subscribe(() => {
        this.currentStep++;
      });
  }

  async getTheLastMessage() {
    setTimeout(() => {
      this.lastMessage = this.messages()[this.messages().length - 1];
      this.lastRole = this.lastMessage?.role;
    }, 500);
  }

  buildImageGrid(
    message: IMessageInteraction,
    isVision: boolean = false
  ): IGridImage[] {
    if (!message.content?.length || typeof message.content === 'string')
      return [];
    if (
      typeof message.content[0] === 'object' &&
      'src' in (message.content[0] as IGridImage)
    )
      return message.content as IGridImage[];
    const imagesMap = message.content as Blob[];
    if (isVision)
      this.chatInteractionService.fileVision = new File(imagesMap, 'image');
    const lengthImages = message.content.length;
    message.content = imagesMap.map((image: Blob, index: number) => ({
      src: URL.createObjectURL(image),
      position: index,
      alt: 'image',
      first: index === 0,
      last: index === lengthImages - 1,
    }));

    return message.content;
  }

  buildImageGridBySingUrl(message: IMessageInteraction): IGridImage[] {
    if (message.urls?.length) {
      if (
        typeof message.urls[0] === 'object' &&
        'src' in (message.urls[0] as IGridImage)
      )
        return message.urls as IGridImage[];
      const lengthImages = message.urls.length;
      const imagesMap = message.urls as string[];
      message.urls = imagesMap.map((image: string, index: number) => ({
        src: image,
        position: index,
        alt: 'image',
        first: index === 0,
        last: index === lengthImages - 1,
      }));
    }
    return [];
  }

  ngAfterViewInit(): void {
    this.loadComponent.emit(this.scrollElement?.nativeElement);
  }

  public async onScrollLoadData(isButton: boolean = false): Promise<void> {
    const nativeElement = this.scrollElement!.nativeElement;
    if (
      (nativeElement.scrollTop === 0 || isButton) &&
      this.countMessagesInBD >= 0
    ) {
      this.lazyLoading = true;
      try {
        await this.chatInteractionService.onScrollLoadData();
      } finally {
        this.lazyLoading = false;
      }
      nativeElement.scrollTop = 1;
    }
    if (isButton) {
      setTimeout(() => {
        nativeElement.scrollTop = 1;
      }, 100);
    }
    /* LOAD WHEN IS FINAL SCROLL
    if (
      nativeElement.clientHeight + Math.round(nativeElement.scrollTop) ===
      nativeElement.scrollHeight
    ) {
      console.log('cargar');
    }*/
  }

  sendRegenerate(message: IMessageInteraction) {
    this.currentStep = 0;
    message.isEdit = false;
    const filterMessages = this.messages().filter(
      message =>
        message?.interaction?.unique !== this.lastMessage?.interaction?.unique
    );
    this.messagesChange.emit(filterMessages);
    this.chatInteractionService.messages = filterMessages;
    this.chatInteractionService
      .sendChatMessage(this.questionRegenerate, ChatTypeIA.image, false, true)
      .then(() => {
        this.questionRegenerate = '';
        this.getTheLastMessage();
      });
  }

  get loadingStatus(): boolean {
    return this.chatInteractionService.loading;
  }

  get moreThanLimitSeconds(): boolean {
    return this.chatInteractionService.isLimitSeconds;
  }

  get chatActivate(): any {
    return this.chatInteractionService.chatActivate;
  }

  get errorMessage(): any {
    return this.apiClient.hasError;
  }

  get countMessagesInBD(): number {
    return this.chatInteractionService.countMessagesInBD;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyTimer$.next();
    this.destroyTimer$.complete();
  }
}
