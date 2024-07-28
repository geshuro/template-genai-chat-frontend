import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IMessage } from '@shared/models/chat-interaction.model';
import { IndexedDBChatApiService } from '@shared/services/utils/indexedb-chat-api.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs';
import { ApiClientService } from '@shared/services/external/api-client.service';
import { ChatInteractionService } from '@shared/services/utils/chat-services/chat-interaction.service';
import { IRequestFeedback } from '@shared/models/api-feedback.model';
import { Base64Pipe } from '@shared/pipes/base64.pipe';
import {
  TaggingService,
  TaggingEvents,
  FeedbackType,
} from '@shared/services/utils/tagging-service';

@Component({
  selector: 'app-chat-input-actions',
  templateUrl: './chat-input-actions.component.html',
  styleUrls: ['./chat-input-actions.component.scss'],
  standalone: true,
  imports: [
    MatButtonToggleModule,
    MatIconModule,
    FormsModule,
    TranslateModule,
    MatTooltipModule,
  ],
  providers: [Base64Pipe],
})
export class ChatInputActionsComponent {
  @Input() message!: IMessage;
  @Input() scrollElement!: HTMLDivElement;

  constructor(
    private indexedDBChatApiService: IndexedDBChatApiService,
    private base64Pipe: Base64Pipe,
    private taggingService: TaggingService,
    private clipboard: Clipboard,
    private _snackBar: MatSnackBar,
    private translate: TranslateService,
    private apiClient: ApiClientService,
    private interactionService: ChatInteractionService
  ) {}

  async evaluateResponse(event: any, value: string) {
    const currentMessage = await this.getCurrentMessage();
    if (this.shouldSkipFeedback(currentMessage, value)) {
      return;
    }
    if (value === 'bad') {
      this.handleBadFeedback();
    }
    if (value === 'good') {
      this.handleGoodFeedback();
    }
    if (value == 'google') {
      this.handleGoogleResponse(event);
      return;
    }
    if (value == 'clipboard') {
      this.handleClipboardResponse(event);
      return;
    }
    if (value == 'download') {
      this.handleDownloadResponse(event);
      return;
    }
    this.updateFeedbackMessage(currentMessage, value);
    this.sendFeedbackRequest();
  }

  private async getCurrentMessage(): Promise<IMessage[]> {
    return (await this.indexedDBChatApiService.getMessagesById(
      this.message.questionAndAnswers?.idAssistant ?? 0
    )) as IMessage[];
  }

  private shouldSkipFeedback(
    currentMessage: IMessage[],
    value: string
  ): boolean {
    return (
      currentMessage &&
      currentMessage.length > 0 &&
      currentMessage[0].feedback === value
    );
  }

  private handleBadFeedback(): void {
    this.message.activeFeedback = 1;
    setTimeout(() => {
      const containerFeedback = document.getElementById(
        `container-feedback-${this.message.questionAndAnswers?.idAssistant}`
      );
      if (containerFeedback) {
        this.scrollElement.scrollTop = containerFeedback.offsetTop - 100;
      }
    }, 100);
    this.taggingService.tag(TaggingEvents.send_feedback, {
      type: FeedbackType.BAD,
    });
  }

  private handleGoodFeedback(): void {
    this.taggingService.tag(TaggingEvents.send_feedback, {
      type: FeedbackType.GOOD,
    });
  }

  private handleGoogleResponse(event: any): void {
    const answerUser = this.message.questionAndAnswers?.user ?? '';
    window.open(
      new URL('https://www.google.com/search?q=' + answerUser),
      '_blank'
    );
    this.message.selectedToggleMultiple = [];
    event.preventDefault();
    this.taggingService.tag(TaggingEvents.google_response);
  }

  private handleClipboardResponse(event: any): void {
    const dirtyString =
      (this.message.questionAndAnswers?.assistant as string) ?? '';
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(dirtyString, 'text/html');
    const cleanedString = htmlDoc.body.textContent ?? '';
    this.clipboard.copy(cleanedString);
    this._snackBar.open(
      this.translate.instant('CLIPBOARD_MESSAGE'),
      this.translate.instant('SNACKBAR_CLOSE'),
      {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 10000,
      }
    );
    this.message.selectedToggleMultiple = [];
    event.preventDefault();
    this.taggingService.tag(TaggingEvents.copy_response);
  }

  private handleDownloadResponse(event: any): void {
    if (typeof this.message.questionAndAnswers!.assistant === 'string') {
      this.message.questionAndAnswers!.assistant = [
        this.message.questionAndAnswers!.assistant,
      ];
    }
    this.message.questionAndAnswers!.assistant.forEach((element, index) => {
      const link = document.createElement('a');
      link.href = 'data:image/jpg;base64,' + element;
      link.download = `${this.message.id}-${index + 1}-image-generate.png`;
      link.dispatchEvent(new MouseEvent('click'));
    });

    this.message.selectedToggleMultiple = [];
    event?.preventDefault();
  }

  private updateFeedbackMessage(
    currentMessage: IMessage[],
    value: string
  ): void {
    this.indexedDBChatApiService.updateFeedbackMessage(
      this.message.questionAndAnswers?.idAssistant ?? 0,
      value,
      value === 'bad' ? 0 : undefined
    );
  }

  private sendFeedbackRequest(): void {
    const valoration = this.message.preselectComment
      ? this.base64Pipe.transform(this.message.preselectComment ?? '')
      : undefined;

    const request: IRequestFeedback = {
      interaction_id: this.base64Pipe.transform(
        this.message.questionAndAnswers?.unique ?? ''
      ),
      feedback: this.base64Pipe.transform(this.message?.feedback ?? ''),
      valoration: valoration ? [valoration] : [],
      comment: this.base64Pipe.transform(this.message.badComment ?? ''),
    };
    this.apiClient
      .sendFeedBack(request)
      .pipe(take(1))
      .subscribe((_response: any) => {});
  }

  get processing(): boolean {
    return this.interactionService.loading;
  }

  get isText(): boolean {
    return this.interactionService.modelSelected.type?.toLowerCase() === 'text';
  }
}
