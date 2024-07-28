import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipListboxChange } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { IndexedDBChatApiService } from '@shared/services/utils/indexedb-chat-api.service';
import { ApiClientService } from '@shared/services/external/api-client.service';
import { take } from 'rxjs';
import { Base64Pipe } from '@shared/pipes/base64.pipe';
import { IRequestFeedback } from '@shared/models/api-feedback.model';
import { IMessage } from '@shared/models/chat-interaction.model';

@Component({
  selector: 'app-chat-input-feedback',
  templateUrl: './chat-input-feedback.component.html',
  styleUrls: ['./chat-input-feedback.component.scss'],
  standalone: true,
  imports: [
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
    TranslateModule,
    MatInputModule,
  ],
  providers: [Base64Pipe],
})
export class ChatInputFeedbackComponent {
  @Input() message!: IMessage;

  constructor(
    private indexedDBChatApiService: IndexedDBChatApiService,
    private apiClient: ApiClientService,
    private base64Pipe: Base64Pipe
  ) {}

  closesaveAndSendFeedback(message: IMessage, onlyClose: boolean) {
    if (onlyClose) {
      message.activeFeedback = message.sendFeedback ? 2 : 0;
      this.indexedDBChatApiService.updateMessageActiveFeedback(
        message.id,
        message.activeFeedback
      );
    } else {
      message.activeFeedback = 2;
      message.sendFeedback = true;
      this.indexedDBChatApiService.updatePreselectBadCommentAndTextBadComment(
        message.id,
        message.badComment!,
        message.preselectComment ?? '',
        message.activeFeedback,
        message.sendFeedback
      );

      const valoration = message.preselectComment
        ? this.base64Pipe.transform(message.preselectComment ?? '')
        : undefined;

      const request: IRequestFeedback = {
        interaction_id: this.base64Pipe.transform(
          message.questionAndAnswers?.unique ?? ''
        ),
        feedback: this.base64Pipe.transform(message?.feedback ?? ''),
        valoration: valoration ? [valoration] : [],
        comment: this.base64Pipe.transform(message.badComment ?? ''),
      };
      this.apiClient
        .sendFeedBack(request)
        .pipe(take(1))
        .subscribe(() => {});
    }
  }

  selectedBadChip(event: MatChipListboxChange, message: IMessage) {
    message.preselectComment = event.value;
  }
}
