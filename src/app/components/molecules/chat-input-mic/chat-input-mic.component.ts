import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SpeechRecognizerService } from '@shared/services/utils/speech-recognizer.service';

import { Observable } from 'rxjs';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-chat-input-mic',
  templateUrl: './chat-input-mic.component.html',
  styleUrls: ['./chat-input-mic.component.scss'],
  standalone: true,
  imports: [MatIconModule, NgIf, CommonModule],
})
export class ChatInputMicComponent {
  @Input()
  listening$?: Observable<boolean>;

  constructor(private speechRecognizer: SpeechRecognizerService) {}

  start(): void {
    if (this.speechRecognizer.isListening) {
      this.stop();
      return;
    }
    this.speechRecognizer.start();
  }

  stop(): void {
    this.speechRecognizer.stop();
  }
}
