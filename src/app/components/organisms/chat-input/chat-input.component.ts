import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {
  MatAutocompleteModule,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { LoadingScreenComponent } from '@components/organisms/loading-screen/loading-screen.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChatInputMicComponent } from '../../molecules/chat-input-mic/chat-input-mic.component';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, Subscriber, map, merge, of, tap } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { adjustTextAreaHeight } from '@shared/utils/adjust-textarea-height';
import { ChatInteractionService } from '@shared/services/utils/chat-services/chat-interaction.service';
import { IMessage } from '@shared/models/chat-interaction.model';
import { SpeechRecognizerService } from '@shared/services/utils/speech-recognizer.service';
import { SpeechEvent } from '@shared/services/utils/model/speech-event';
import { SpeechError } from '@shared/services/utils/model/speech-error';
import { SpeechNotification } from '@shared/services/utils/model/speech-notification';
import { UserEventsService } from '@shared/services/utils/user-events.service';
import { MatDialog } from '@angular/material/dialog';
import { FilesSelectorComponent } from '../files-selector/files-selector.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChatFilesService } from '@shared/services/utils/chat-services/chat-files.service';
import { MatBadgeModule } from '@angular/material/badge';
import {
  TaggingEvents,
  TaggingService,
} from '@shared/services/utils/tagging-service';
import { ISelectorItem } from '@shared/models/selector-top.model';
import {
  ChatType,
  ChatTypeIA,
} from '@shared/services/utils/tagging-service/types';
import { GoogleDriveService } from '@shared/services/utils/google-service/google-drive.service';

interface KnowledgeNode {
  id?: number;
  nameFile: string;
  embedding?: any[];
  size?: string;
  createAt?: Date;
  embeddings?: any[];
  category?: string;
  children?: KnowledgeNode[];
}

interface FileFlatNode {
  expandable: boolean;
  empty: boolean;
  file: KnowledgeNode;
  level: number;
}

enum Langs {
  en = 'en-US',
  es = 'es-ES',
  pt = 'pt-BR',
}

@Component({
  selector: 'app-chat-input',
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.scss'],
  standalone: true,
  imports: [
    LoadingScreenComponent,
    CommonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule,
    ChatInputMicComponent,
    FormsModule,
    MatBadgeModule,
    MatMenuModule,
    MatAutocompleteModule,
  ],
  providers: [],
})
export class ChatInputComponent implements OnInit {
  private _processing!: boolean;

  @ViewChild('chatInput') chatInput!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('chat-mic') childMic!: ChatInputMicComponent;
  @ViewChild('autoTrigger', { read: MatAutocompleteTrigger })
  autoTrigger?: MatAutocompleteTrigger;

  filteredCommands?: Observable<any[]>;

  isAttachPanel: boolean = false;
  question: string = '';
  lastMessage: string = '';
  activeChat: boolean = false;
  isNewMessage: boolean = false;

  messages: IMessage[] = [];
  uniqueChat: string = '';
  idChat: number = 0;
  idMessage: any;
  filesChange: any;
  isTitleChanged: boolean[] = [];
  chatHistory: any[] = [];
  questionsAndAnswers = new Map<number, any>();
  formFiles: FormData = new FormData();
  filesHistory?: any[] = [];
  myImage!: string;
  base64code!: any;
  imageString!: string;
  encryptedImage!: string;
  hasImage: boolean = false;
  formDataImage = new FormData();
  showScanIcon!: boolean;
  getFromInput!: any;

  categorySelected: FileFlatNode = {
    file: { nameFile: 'OTHERS' },
    expandable: true,
    empty: false,
    level: 0,
  };

  transcript$?: Observable<string>;
  listening$?: Observable<boolean>;
  errorMessage$?: Observable<string>;
  defaultError$ = new Subject<string | undefined>();

  isMobile: boolean = false;

  constructor(
    private chatInteractionService: ChatInteractionService,
    private chatFileService: ChatFilesService,
    private speechRecognizer: SpeechRecognizerService,
    private translate: TranslateService,
    private userEventsService: UserEventsService,
    private modalService: MatDialog,
    private breakpointObserver: BreakpointObserver,
    private taggingService: TaggingService,
    private googleDriveService: GoogleDriveService
  ) {
    this.userEventsService.getClickEvent().subscribe(response => {
      const action = response.action;
      const title = response.title;
      if (action === 'promptExample') {
        this.setTextInputChat(title);
      } else {
        this.chatInput.nativeElement.value = '';
        this.filteredCommands = of([]);
        this.hasImage = false;
      }
    });

    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Tablet])
      .subscribe(result => {
        this.isMobile = result.matches;
      });

    this.chatFileService.getSelectedFilesObservable().subscribe(_change => {
      if (this.chatInteractionService.modelSelected.usedFiles) {
        this.chatInteractionService.modelSelectedFile =
          this.chatInteractionService.modelSelected;
      }
      if (this.checklistSelection.length > 0) {
        this.chatInteractionService.setModelListByFiles();
        this.showScanIcon = false;
        this.userEventsService.sendUpdatePromptExamples(false, true);
      }
      if (this.checklistSelection.length === 0) {
        this.chatInteractionService.setModelListByChat(
          this.chatInteractionService.chatActivate!
        );
        this.showScanIcon = true;
        this.userEventsService.sendUpdatePromptExamples(false, false);
      }
      this.chatInteractionService.setDefaultModel(true);
    });

    this.googleDriveService.pickerSelectFile().subscribe(_file => {
      this.openAttachPanel();
    });
  }

  ngOnInit(): void {
    this.showScanIcon = this.checklistSelection.length === 0;
    this.initSpeechRecognition(this.translate.currentLang ?? 'es');
    this.translate.onLangChange.subscribe(event => {
      this.initSpeechRecognition(event.lang);
    });
  }

  initSpeechRecognition(lang: string) {
    const indexOfS = Object.keys(Langs).indexOf(lang);
    const langSelected = Object.values(Langs)[indexOfS];
    const webSpeechReady = this.speechRecognizer.initialize(langSelected);
    if (webSpeechReady) {
      this.initRecognition();
    } else {
      console.error('Your Browser is not supported');
      this.errorMessage$ = of(
        'Your Browser is not supported. Please try Google Chrome.'
      );
    }
  }

  private initRecognition(): void {
    this.transcript$ = this.speechRecognizer.onResult().pipe(
      tap(notification => {
        this.processNotification(notification);
      }),
      map(notification => notification.content ?? '')
    );

    this.transcript$.subscribe();

    this.listening$ = merge(
      this.speechRecognizer.onStart(),
      this.speechRecognizer.onEnd()
    ).pipe(
      tap(notification => {
        this.processNotification(notification);
      }),
      map(notification => notification.event === SpeechEvent.Start)
    );

    this.errorMessage$ = merge(
      this.speechRecognizer.onError(),
      this.defaultError$
    ).pipe(
      map(data => {
        if (data === undefined) {
          return '';
        }
        if (typeof data === 'string') {
          return data;
        }
        let message;
        switch (data.error) {
          case SpeechError.NotAllowed:
            message = `Cannot run the demo.
            Your browser is not authorized to access your microphone.
            Verify that your browser has access to your microphone and try again.`;
            break;
          case SpeechError.NoSpeech:
            message = `No speech has been detected. Please try again.`;
            break;
          case SpeechError.AudioCapture:
            message = `Microphone is not available. Plese verify the connection of your microphone and try again.`;
            break;
          default:
            message = '';
            break;
        }
        return message;
      })
    );
  }

  private processNotification(notification: SpeechNotification<string>): void {
    const message = notification.content?.trim() ?? '';
    if (notification.event === SpeechEvent.FinalContent) {
      this.lastMessage += message + ' ';
      setTimeout(() => {
        adjustTextAreaHeight({ target: this.chatInput.nativeElement });
      }, 100);
    }

    if (notification.event === SpeechEvent.InterimContent) {
      this.question = `${this.lastMessage} ${message}`;
      adjustTextAreaHeight({ target: this.chatInput.nativeElement });
    }

    if (notification.event === SpeechEvent.End) {
      this.lastMessage = '';
    }
  }

  preventEnter(event: KeyboardEvent) {
    if (event.key === 'Enter' && event.shiftKey === false) {
      event.preventDefault();
    }
  }

  public async onTypingQuestion(event: any) {
    if (this.processing) {
      return;
    }

    if (this.question.trim().length <= 1) {
      return;
    }

    if (event.keyCode == 13) {
      event.preventDefault();
      event.stopPropagation();
      if (!this.activeChat) {
        this.activeChat = !this.activeChat;
      }

      if (this.chatInteractionService.fileVision) {
        await this.sendImagePreview(this.question);
      } else {
        await this.sendMessage(this.question);
      }

      this.question = '';
    }
  }

  onSelectionChange(event: any) {
    if (event.option.value) {
      this.sendMessage(event.option.value, false, true);
    }
    setTimeout(() => {
      this.question = '';
    }, 100);
  }

  public openGDriveAttach() {
    this.googleDriveService.createPicker();
    this.taggingService.tag(TaggingEvents.click_attachment_button);
  }

  public openAttachPanel() {
    this.isAttachPanel = !this.isAttachPanel;
    this.modalService.open(FilesSelectorComponent, {
      width: this.isMobile ? 'calc(100% - 10px)' : 'calc(50% - 30px)',
      maxWidth: '100%',
    });
    this.taggingService.tag(TaggingEvents.click_attachment_button);
  }

  public async onSend() {
    this.childMic?.stop();
    if (this.question.length === 0) return;

    this.activeChat = true;
    if (this.chatInteractionService.fileVision) {
      await this.sendImagePreview(this.question);
    } else {
      await this.sendMessage(this.question);
    }

    this.question = '';
  }

  stopChat(): void {
    this.chatInteractionService.cancelAnswer();
  }

  public adjustTextArea(event: any) {
    if (event.target instanceof HTMLTextAreaElement) {
      if (event.target.value === '/') {
        this.filteredCommands = of(this.commandsList);
      }
      if ((event.target.value as string).startsWith('/')) {
        const filter = this.commandsList.filter(
          item =>
            item.toLowerCase().indexOf(event.target.value.toLowerCase()) > -1
        );
        this.filteredCommands = of(filter);
      } else {
        this.filteredCommands = of([]);
      }
    }
    adjustTextAreaHeight(event);
  }

  private async sendMessage(
    question: string,
    retry: boolean = false,
    isCommand: boolean = false
  ) {
    question = question.trim() + '';

    /*     if (this.hasImage) {
      this.hasImage = false;
      this.sendImagePreview();
    } */
    this.chatInteractionService.sendChatMessage(
      question,
      isCommand
        ? ChatTypeIA.command
        : ChatTypeIA[
            this.chatInteractionService.modelSelected
              .type! as keyof typeof ChatTypeIA
          ],
      retry
    );

    this.taggingService.tag(TaggingEvents.send_message, {
      model: this.chatInteractionService.modelSelected?.value,
      module:
        ChatType[
          this.chatInteractionService.chatActivate
            ?.label as keyof typeof ChatType
        ],
    });
  }

  public setTextInputChat(text: string) {
    this.question = text;
    this.chatInput.nativeElement.value = text;
    adjustTextAreaHeight({ target: this.chatInput.nativeElement });
  }

  onPhotoSelected(event: any): void {
    this.userEventsService.sendClickEvent('', 'describeImageRequested');
    this.chatInteractionService.fileVision = event.target.files[0];

    this.getFromInput = document.getElementById('photo') as HTMLInputElement;
    if (this.getFromInput) {
      this.convertToBase64(this.getFromInput.files![0]);
      this.hasImage = true;
    }
  }

  convertToBase64(file: File): void {
    const observable = new Observable((subscriber: Subscriber<any>) => {
      this.readFile(file, subscriber);
    });

    observable.subscribe(res => {
      this.myImage = res;
      this.base64code = res;
      this.sendImageTextPrompt();
    });
  }

  readFile(file: File, subscriber: Subscriber<any>) {
    const filereader = new FileReader();

    filereader.readAsDataURL(file);

    filereader.onload = () => {
      subscriber.next(filereader.result);
      subscriber.complete();

      filereader.onerror = () => {
        subscriber.error();
        subscriber.complete();
      };
    };
  }

  openAutocomplete() {
    const filter = this.commandsList.filter(
      item => item.toLowerCase().indexOf('/') > -1
    );
    this.filteredCommands = of(filter);
    setTimeout(() => {
      this.autoTrigger?.openPanel();
    }, 100);
  }

  closePreview(): void {
    this.hasImage = false;
    this.imageString = '';
  }

  sendImageTextPrompt(): void {
    this.hasImage = true;
    this.imageString = this.myImage.slice(
      this.myImage.indexOf(',') + 1,
      this.myImage.length
    );
    this.encryptedImage = 'data:image/jpeg;base64,' + this.imageString;
  }

  async sendImagePreview(question: string) {
    this.hasImage = false;
    this.formDataImage.append('prompt', this.question);

    await this.chatInteractionService.sendChatMessage(
      question,
      ChatTypeIA.vision,
      false,
      false,
      this.formDataImage
    );
  }

  get processing(): boolean {
    return this.chatInteractionService.loading;
  }

  @Input()
  set processing(value: boolean) {
    this._processing = value;
  }

  get checklistSelection() {
    return this.chatFileService.getChildrenSelected();
  }

  get chatActiveType(): string | undefined {
    return this.chatInteractionService.chatActivate?.value;
  }

  get itemSelected(): ISelectorItem | undefined {
    return this.chatInteractionService.baseKnowledgeSelected;
  }

  get commandsList(): string[] {
    return this.itemSelected?.commands ?? [];
  }

  get isRHplus(): boolean {
    return this.chatInteractionService.chatActivate?.value === 'RH+';
  }

  get isChatLibre(): boolean {
    return this.chatInteractionService.chatActivate?.value === 'CHAT_LIBRE';
  }
}
