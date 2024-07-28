import { Component, Input, OnInit, inject } from '@angular/core';
import { SelectIconComponent } from '@components/molecules/select-icon/select-icon.component';
import { ISelectorItem } from '@shared/models/selector-top.model';
import { ChatInteractionService } from '@shared/services/utils/chat-services/chat-interaction.service';
import {
  TaggingEvents,
  TaggingService,
} from '@shared/services/utils/tagging-service';
import { UserEventsService } from '@shared/services/utils/user-events.service';
import { SessionService } from '@shared/services/utils/session.service';

@Component({
  selector: 'app-selectors-top-chat',
  standalone: true,
  imports: [SelectIconComponent],
  templateUrl: './selectors-top-chat.component.html',
  styleUrl: './selectors-top-chat.component.scss',
})
export class SelectorsTopChatComponent implements OnInit {
  isEnabledRight: boolean = true;
  isMantto: boolean = false;
  @Input() itemsLeft?: ISelectorItem[];
  @Input() itemsRight?: ISelectorItem[];
  @Input() itemsCenter?: ISelectorItem[];
  @Input() viewLetf: boolean = true;
  @Input() viewRight: boolean = true;
  @Input() disabled?: boolean;
  @Input() isVisibleSelectKnowledgebase!: boolean;
  @Input() isVisibleSelectEngine!: boolean;
  viewCenter: boolean = false;
  valueDefaultCenter!: ISelectorItem;
  visionModel!: ISelectorItem | any;

  sessionService = inject(SessionService);

  constructor(
    public chatInteractionService: ChatInteractionService,
    private userEventsService: UserEventsService,
    private taggingService: TaggingService
  ) {
    this.userEventsService.getClickEvent().subscribe(response => {
      const action = response.action;
      if (action === 'clearChat' || action === 'clickTalkItem') {
        this.chatInteractionService.setModelListByChat(
          this.chatInteractionService.chatActivate!
        );
        this.chatInteractionService.setDefaultModel();
        this.viewCenter = false;
      }

      if (action === 'describeImageRequested') {
        this.loadModelVision();
        this.onSelectedRight(this.visionModel);
      }
    });
  }

  ngOnInit(): void {
    this.configureSelectors();
    this.modelsAndViewBasic();
  }

  loadModelVision(): void {
    this.visionModel = this.chatInteractionService.modelsListAll.find(
      (model: any) => model.label === 'gemini_10_pro_vision'
    );
  }

  configureSelectors(): void {
    if (this.itemsCenter) {
      this.valueDefaultCenter = this.itemsCenter[0];
    }
  }

  modelsAndViewBasic(): void {
    if (this.sessionService.isBasic()) {
      this.viewRight = false;
    } else {
      this.viewRight = true;
    }
  }

  onSelectedLeft(item: ISelectorItem) {
    const selectorItem = item;
    this.viewCenter = item.label === 'eMantto' ? true : false;
    if (this.viewCenter && this.itemsCenter) {
      selectorItem.value = this.itemsCenter[0].value;
    }

    this.chatInteractionService.baseKnowledgeSelected = selectorItem;
    this.userEventsService.sendClickEvent(item.value, 'selectedTopLeft');
    this.taggingService.tag(TaggingEvents.select_knowledgebase, {
      name: item.label,
    });
  }

  onSelectedCenter(item: ISelectorItem) {
    const baseKnowledge: any =
      this.chatInteractionService.baseKnowledgeSelected;
    baseKnowledge.value = item.value;
    this.chatInteractionService.baseKnowledgeSelected = baseKnowledge;
    this.userEventsService.sendClickEvent(item.value, 'selectedTopLeft');
  }

  onSelectedRight(item: ISelectorItem) {
    this.chatInteractionService.modelsList = [item];
    this.chatInteractionService.modelSelected = item;
    this.taggingService.tag(TaggingEvents.select_model, { name: item.label });
  }
}
