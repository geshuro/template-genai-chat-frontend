import { Injectable } from '@angular/core';
import { ICreateMessage } from '@shared/models/bd-indexdb.model';
import { IChat } from '@shared/models/chat-interaction.model';
import { base64toBlob } from '@shared/utils/base64-to-blob';
import Dexie from 'dexie';

@Injectable({
  providedIn: 'root',
})
export class IndexedDBChatApiService {
  private dbChat!: Dexie;
  private dbFiles!: Dexie;
  private tableListChats?: Dexie.Table<any>;
  private tableListMessages?: Dexie.Table<any>;
  private tableListFiles?: Dexie.Table<any>;
  private tableSettings?: Dexie.Table<any>;
  private tableCategorys!: Dexie.Table<any>;

  constructor() {
    this.initIndexedDBChat();
    this.initIndexedDBFiles();
  }

  private initIndexedDBChat() {
    this.dbChat = new Dexie('db-chat-dios');
    this.dbChat
      .version(10)
      .stores({
        chats:
          '++id, title, createAt, favorite, unique, baseKnowledge, emoji, chat',
        messages:
          '++id, idChat, content, text, role, type, feedback, badComment, preselectComment, activeFeedback, files, createAt, unique, idAnswer, timeResponse, model, urls',
        settings: '++id, &key, value',
      })
      .upgrade((tx: any) => {
        return tx.messages
          .filter(
            (x: any) =>
              Array.isArray(x.content) &&
              x.content.length > 0 &&
              typeof x.content[0] === 'string'
          )
          .modify((message: any) => {
            message.content = message.content.map((content: string) =>
              base64toBlob(content)
            );
          });
      });

    this.tableListChats = this.dbChat.table('chats');
    this.tableListMessages = this.dbChat.table('messages');
    this.tableSettings = this.dbChat.table('settings');
  }

  private initIndexedDBFiles() {
    this.dbFiles = new Dexie('db-chat-dios-files');
    this.dbFiles.version(1).stores({
      files:
        '++id, &nameFile, content, embedding, createAt, category, numChars, numChunks, numTokens, isProcessing',
      categorys: '++id, &nameFile, orden, createAt',
    });
    this.tableListFiles = this.dbFiles.table('files');
    this.tableCategorys = this.dbFiles.table('categorys');
  }

  async addChat(
    title: string,
    favorite: boolean,
    unique: string,
    baseKnowledge?: string,
    model: string = 'gpt3.5',
    chat: string = 'RH+'
  ): Promise<number> {
    return await this.tableListChats?.add({
      title,
      createAt: new Date(),
      favorite,
      unique,
      baseKnowledge,
      model,
      chat,
    });
  }

  async addMessage(data: ICreateMessage): Promise<number> {
    const {
      idChat,
      content,
      text,
      role,
      type,
      feedback,
      files,
      unique,
      idAnswer,
      timeResponse,
      model,
      urls,
    } = data;
    const fileData = files?.map(file => ({
      id: file.id,
      size: file.size,
      name: file.name,
      type: file.type,
      createAt: file.createAt,
    }));
    return await this.tableListMessages?.add({
      idChat,
      content,
      text,
      role,
      type,
      feedback,
      files: fileData,
      createAt: new Date(),
      unique,
      idAnswer,
      timeResponse,
      model,
      urls,
    });
  }

  async addOrUpdateFile(
    nameFile: string,
    embedding: {
      content: string;
      embedding: number[];
    }[],
    category: string,
    content?: string,
    numChars?: number,
    numChunks?: number,
    numTokens?: number,
    isProcessing?: 'true' | 'false'
  ): Promise<number> {
    const exist = await this.tableListFiles
      ?.where('nameFile')
      .equals(nameFile)
      .toArray();
    if (exist && exist.length > 0) {
      await this.tableListFiles?.update(exist[0].id, {
        nameFile,
        content,
        embedding,
        category,
        createAt: new Date(),
        numChars,
        numChunks,
        numTokens,
        isProcessing,
      });
      return exist[0].id;
    }
    return await this.tableListFiles?.add({
      nameFile,
      embedding,
      category,
      createAt: new Date(),
      isProcessing,
    });
  }

  async updateCategoryFile(id: number, category: string) {
    return await this.tableListFiles?.update(id, {
      category: category.toUpperCase(),
    });
  }
  async deleteFile(id: number) {
    return await this.tableListFiles?.delete(id);
  }

  async getFileByName(nameFile: string) {
    return await this.tableListFiles

      ?.where('nameFile')

      .equals(nameFile)

      .toArray();
  }

  async getFilesIsProcessing(): Promise<any[] | undefined> {
    return await this.tableListFiles
      ?.where('isProcessing')
      .equals('true')
      .toArray();
  }

  async getChatsList(chat: string): Promise<IChat[] | undefined> {
    return await this.tableListChats?.where({ chat: chat })?.toArray();
  }

  async getListFiles() {
    return await this.tableListFiles?.toArray();
  }

  async getListFilesByIds(ids: number[]) {
    return await this.tableListFiles?.where('id').anyOf(ids).toArray();
  }

  async getListFilesByNames(names: string[]) {
    return await this.tableListFiles?.where('name').anyOf(names).toArray();
  }

  async getListFilesByCategory(category: string) {
    return await this.tableListFiles?.where({ category }).toArray();
  }

  async getMessageByChatId(idChat: number) {
    return await this.tableListMessages
      ?.where({
        idChat,
      })
      .toArray();
  }

  async getMessaByChatIdLazy(idChat: number, limit: number, offset: number) {
    return await this.tableListMessages
      ?.where({
        idChat,
      })
      .offset(offset)
      .limit(limit)
      .toArray();
  }

  async getCountMessagesByChatId(idChat: number) {
    return await this.tableListMessages
      ?.where({
        idChat,
      })
      .count();
  }

  async updateTitleChat(id: number, title: string) {
    return await this.tableListChats?.update(id, { title });
  }

  async updateFavoriteChat(id: number, favorite: boolean) {
    return await this.tableListChats?.update(id, { favorite });
  }

  async updateUniqueChat(id: number, unique: string) {
    return await this.tableListChats?.update(id, { unique });
  }

  async updateTypeChat(id: number, chat: string) {
    return await this.tableListChats?.update(id, { chat });
  }

  async updateIconChat(id: number, emoji: string) {
    return await this.tableListChats?.update(id, { emoji });
  }

  async updateFeedbackMessage(
    id: number,
    feedback: string,
    activeFeedback?: number
  ) {
    return await this.tableListMessages?.update(id, {
      feedback,
      activeFeedback,
    });
  }

  async deleteMessage(id: number) {
    return await this.tableListMessages?.delete(id);
  }

  async deleteMessageByUnique(unique: string) {
    const interactionsDelete = await this.tableListMessages
      ?.where({
        unique,
      })
      .toArray();
    if (interactionsDelete?.length)
      await this.tableListMessages?.bulkDelete(
        interactionsDelete?.map(interaction => interaction.id)
      );
  }

  async deleteChat(id: any) {
    return await this.tableListChats?.delete(id);
  }

  async getMessagesById(id: number) {
    return await this.tableListMessages
      ?.where({
        id,
      })
      .toArray();
  }

  async getMessagesByChatId(idChat: number) {
    return await this.tableListMessages
      ?.where({
        idChat,
      })
      .toArray();
  }

  async updatePreselectBadCommentAndTextBadComment(
    id: number,
    badComment: string,
    preselectComment: string,
    activeFeedback?: number,
    sendFeedback?: boolean
  ) {
    return await this.tableListMessages?.update(id, {
      badComment,
      preselectComment,
      activeFeedback,
      sendFeedback,
    });
  }

  async updateMessageActiveFeedback(id: number, activeFeedback: number) {
    return await this.tableListMessages?.update(id, {
      activeFeedback,
    });
  }

  async addSettings(key: string, value: any) {
    return await this.tableSettings?.add({ key, value });
  }

  async getSettings() {
    return await this.tableSettings?.toArray();
  }

  async updateSettings(key: string, value: any) {
    const settings = await this.getSettings();
    const setting = settings?.find(setting => setting.key === key);
    if (!setting) return await this.addSettings(key, value);
    return await this.tableSettings?.update(setting.id, { key, value });
  }

  async createCategorys(nameFile: string, orden: number) {
    return await this.tableCategorys.add({
      nameFile: nameFile.toUpperCase(),
      children: [],
      orden,
      createAt: new Date(),
    });
  }

  async getCategorys() {
    return await this.tableCategorys.orderBy('createAt').reverse().toArray();
  }

  async getCategoryByName(name: string) {
    return await this.tableCategorys
      .where('nameFile')
      .equalsIgnoreCase(name)
      .toArray();
  }

  async deleteCategory(id: number) {
    return await this.tableCategorys.delete(id);
  }

  async updateCategory(id: number, nameFile: string) {
    return await this.tableCategorys.update(id, { nameFile });
  }

  updateMessageUnique(questionAndAnswers: {
    user: string;
    assistant: string;
    unique: string;
    idAssistant: number;
    idUser: number;
  }) {
    this.tableListMessages?.update(questionAndAnswers.idUser, {
      unique: questionAndAnswers.unique,
    });

    this.tableListMessages?.update(questionAndAnswers.idAssistant, {
      unique: questionAndAnswers.unique,
      idAnswer: questionAndAnswers.idUser,
    });
  }
}
