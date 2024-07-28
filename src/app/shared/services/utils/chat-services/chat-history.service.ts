import { Injectable } from '@angular/core';
import { IndexedDBChatApiService } from '../indexedb-chat-api.service';
import { v4 as uuidv4 } from 'uuid';
import { Observable, Subject } from 'rxjs';
import {
  IChat,
  IClickEventHistory,
} from '@shared/models/chat-interaction.model';

@Injectable({
  providedIn: 'root',
})
export class ChatHistoryService {
  chatHistory: { period: string; topics: IChat[] }[] = [];
  idChat?: number;
  subject = new Subject<IClickEventHistory>();
  allTopics: Map<number, IChat> = new Map();
  topicSelected?: IChat;
  topicLoading: Map<number, boolean> = new Map();

  constructor(private indexedDBChat: IndexedDBChatApiService) {}

  async getChatHistory(chat: string): Promise<any> {
    const response = await this.indexedDBChat.getChatsList(chat);
    if (response) {
      this.sortChatHistory(response);
      this.processChatHistory(response);
      this.groupChatHistoryByPeriod(response);
    }

    return this.chatHistory;
  }

  private sortChatHistory(response: any[]) {
    response.sort((a, b) => {
      if (a.favorite) a.createAt = new Date();
      if (b.favorite) b.createAt = new Date();
      return b.createAt.getTime() - a.createAt.getTime();
    });
  }

  private processChatHistory(response: any[]) {
    response.forEach(chat => {
      chat.period = this.checkDate(chat.createAt, chat.favorite);
      if (!chat.unique) {
        chat.unique = uuidv4();
        this.indexedDBChat.updateUniqueChat(chat.id, chat.unique);
      }
    });
  }

  private groupChatHistoryByPeriod(response: any[]) {
    const map = {} as any;
    response.forEach((item: any) => {
      if (!map['FAVORITES_CHAT']) {
        if (item.favorite) {
          map['FAVORITES_CHAT'] = {
            period: 'FAVORITES_CHAT',
            topics: [],
          };
        }
      }
      if (!map[item.period]) {
        map[item.period] = {
          period: item.period,
          topics: [],
        };
      }
      const loading = this.topicLoading.get(Number(item.id)) ?? false;
      const topic: IChat = {
        unique: item.unique,
        id: item.id,
        activate: this.idChat == item.id,
        title: item.title,
        favorite: item.favorite,
        baseKnowledge: item.baseKnowledge,
        createAt: item.createAt,
        emoji: item.emoji ?? '',
        model: item.model ?? 'gpt3.5',
        chat: item.chat ?? 'RH+',
        loading,
      };
      map[item.period].topics.push(topic);
    });

    this.chatHistory = Object.values(map);
    this.topicSelected = undefined;
    this.updateSelectedTopics();
  }

  private updateSelectedTopics() {
    this.chatHistory.forEach(item => {
      item.topics.forEach(topic => {
        this.allTopics.set(topic.id, topic);
        this.topicSelected =
          topic.id === this.topicSelected?.id ? topic : undefined;
      });
    });
  }

  checkDate(inputDate: Date, favorite: boolean): string {
    const currentDate = new Date();

    if (favorite) {
      return 'FAVORITES_CHAT';
    }

    if (inputDate.getDate() == currentDate.getDate()) {
      return 'TODAY_CHAT';
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (
      inputDate.getDate() >= yesterday.getDate() &&
      inputDate.getDate() < currentDate.getDate()
    ) {
      return 'YESTERDAY_CHAT';
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (
      inputDate.getDate() >= sevenDaysAgo.getDate() &&
      inputDate.getDate() < yesterday.getDate()
    ) {
      return 'SEVEN_AGO_CHAT';
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (
      inputDate.getDate() >= thirtyDaysAgo.getDate() &&
      inputDate.getDate() < sevenDaysAgo.getDate()
    ) {
      return 'THIRTY_AGO_CHAT';
    }

    return inputDate.toLocaleString('default', { month: 'long' });
  }

  sendClickEventHistory(activeChat?: IChat, refresh: boolean = false) {
    this.idChat = activeChat?.id;
    this.subject.next({ chat: activeChat, refresh });
  }

  setActiveChat(idChat?: number): void {
    if (!idChat) return;
    this.idChat = idChat;
    this.allTopics.forEach(topic => {
      topic.activate = false;
    });
    const topic = this.allTopics.get(idChat);
    if (topic) {
      topic.activate = true;
      this.topicSelected = topic;
    }
  }

  setStatusLoadingChat(idChat: number, status: boolean): void {
    const topic = this.allTopics.get(idChat);
    if (topic) {
      this.topicLoading.set(idChat, status);
      topic.loading = status;
    }
  }

  getClickEventHistory(): Observable<IClickEventHistory> {
    return this.subject.asObservable();
  }
}
