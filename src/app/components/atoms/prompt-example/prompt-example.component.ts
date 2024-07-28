import { SessionService } from '@shared/services/utils/session.service';
import { Component, Input, HostBinding, inject } from '@angular/core';
import { UserEventsService } from '@shared/services/utils/user-events.service';

@Component({
  selector: 'app-prompt-example',
  standalone: true,
  imports: [],
  templateUrl: './prompt-example.component.html',
  styleUrl: './prompt-example.component.scss',
})
export class PromptExampleComponent {
  @Input() example!: {
    user: string;
    assistant: string;
    query_category: string;
    query_lang: string;
    knowledgebase: string;
    popularity: number;
    icon: any;
    color: string;
  };

  private sessionService = inject(SessionService);

  constructor(private userEventsService: UserEventsService) {}

  useQuestion(): void {
    const textExample = this.example.user;
    const action = 'promptExample';
    this.userEventsService.sendClickEvent(textExample, action);
  }

  @HostBinding('class.chatlibre-theme')
  get isDarkMode(): boolean {
    return this.sessionService.isChatLibre;
  }
}
