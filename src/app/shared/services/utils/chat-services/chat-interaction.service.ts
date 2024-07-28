import { TranslateService } from '@ngx-translate/core';
import { Injectable, OnDestroy, inject } from '@angular/core';
import { ApiClientService } from '../../external/api-client.service';
import { Base64Pipe } from '@shared/pipes/base64.pipe';
import {
  IRequestAnswer,
  IRequestCommand,
  IRequestImage,
  IRequestVision,
} from '@shared/models/api-answer.model';
import {
  Observable,
  Subject,
  Subscription,
  firstValueFrom,
  interval,
  take,
} from 'rxjs';
import { IndexedDBChatApiService } from '../indexedb-chat-api.service';
import {
  IMessage,
  IMessageInteraction,
  IQuestion,
  IQuestionAndAnswers,
} from '@shared/models/chat-interaction.model';
import { v4 as uuidv4 } from 'uuid';
import { marked } from 'marked';
import { ChatHistoryService } from './chat-history.service';
import { ISelectorItem } from '@shared/models/selector-top.model';
import { TaggingEvents, TaggingService } from '../tagging-service';
import { IPanelChat } from '@shared/models/available-chats.model';
import { SessionService } from '../session.service';
import { ChatFilesService } from './chat-files.service';
import { ICreateMessage } from '@shared/models/bd-indexdb.model';
import { ChatType, ChatTypeIA, ChatTypeRole } from '../tagging-service/types';
import { UserEventsService } from '../user-events.service';
import { ThemingService } from '../theming.service';
import { fileToBlob } from '@shared/utils/file-to-blob';

marked.use({
  breaks: true,
});

@Injectable({
  providedIn: 'root',
})
export class ChatInteractionService implements OnDestroy {
  private responseSubject = new Subject<IMessageInteraction>();
  private questionSubject = new Subject<IQuestion>();
  private errorSubject = new Subject<any>();
  private clearSubject = new Subject<boolean>();
  private messagesSubject = new Subject<{
    messages: IMessageInteraction[];
    isLoadHistory: boolean;
  }>();
  private httpSubscription: Subscription | null = null;

  messages: IMessageInteraction[] = [];

  private questionsAndAnswers: Map<number, IQuestionAndAnswers> = new Map<
    number,
    any
  >();

  chatActivate?: IPanelChat;

  baseKnowledgeList: ISelectorItem[] = [];

  modelsList: ISelectorItem[] = [];
  modelsListAll: ISelectorItem[] = [];

  lastMessage!: IMessage;
  question: string = '';
  loading: boolean = false;
  loadingUI: boolean = false;
  idChat?: number;
  countMessagesInBD: number = 0;
  uniqueChat?: string;
  baseKnowledgeSelected?: ISelectorItem;
  modelSelected!: ISelectorItem;
  private modelsFilesList: string[] = ['gemini_15_pro', 'gemini_15_flash'];

  modelSelectedFile?: ISelectorItem;
  secondInterval = interval(1000);
  isLimitSeconds!: boolean;
  formImageFile: FormData = new FormData();

  themeSkeletonlight = {
    'border-radius': '5px',
    'background-color': '#e6e9f6',
    border: '1px solid #f3f6fc',
    height: '50px',
    'animation-duration': '2s',
  };

  themeSkeletonDark = {
    'border-radius': '5px',
    height: '50px',
    'background-color': '#323232',
    border: '1px solid #323232',
    'animation-duration': '2s',
  };

  isChatChange: boolean = true;

  fileVision?: File;

  private themeService = inject(ThemingService);

  constructor(
    private apiClient: ApiClientService,
    private base64Pipe: Base64Pipe,
    private indexedDBChatApiService: IndexedDBChatApiService,
    private chatHistoryService: ChatHistoryService,
    private taggingService: TaggingService,
    private sessionService: SessionService,
    private chatFilesService: ChatFilesService,
    private userEventsService: UserEventsService,
    private translateService: TranslateService
  ) {
    this.baseKnowledgeList = this.getSettingsKnowledgeBase();
  }

  async sendChatMessage(
    question: string,
    type: ChatTypeIA,
    retry: boolean = false,
    regenerate: boolean = false,
    formDataImage?: FormData
  ): Promise<void> {
    this.question = question;
    this.isLimitSeconds = false;
    this.loading = true;
    const subscriptionLoading = this.secondInterval.subscribe(second => {
      if (second === 30 && this.loading) {
        this.isLimitSeconds = true;
      }
    });

    setTimeout(() => {
      subscriptionLoading.unsubscribe();
    }, 31000);

    await this.createChat(retry);
    this.chatHistoryService.setStatusLoadingChat(this.idChat!, true);
    const files = this.chatFilesService.getSelectedFiles();

    let previewImage;
    if (this.fileVision && type === ChatTypeIA.vision) {
      previewImage = [await fileToBlob(this.fileVision)];
    }

    const messageDBUser: ICreateMessage = {
      content: previewImage ?? question,
      text: question,
      role: 'user',
      type,
      idChat: this.idChat!,
      unique: type === ChatTypeIA.image ? uuidv4() : undefined,
      timeResponse: 0,
      model: this.modelSelected?.value ?? this.getDefaultModel(type),
      files: type === ChatTypeIA.text ? files : undefined,
    };

    const { idMessage, uuidMessage } = await this.createMessage(messageDBUser);

    const request = await this.buildRequest(
      type,
      question,
      uuidMessage,
      formDataImage
    );

    this.handleMessageSending(
      type,
      retry,
      regenerate,
      idMessage,
      messageDBUser,
      previewImage
    );

    const startTime = performance.now();
    this.httpSubscription = this.getApiRequest(type, request, idMessage)
      .pipe(take(1))
      .subscribe({
        next: async (responseApi: any) => {
          await this.handleResponse(
            responseApi,
            startTime,
            type,
            question,
            idMessage,
            uuidMessage
          );
        },
        error: async (error: any) => {
          await this.handleError(
            error,
            startTime,
            retry,
            type,
            question,
            idMessage,
            uuidMessage
          );
        },
      });
  }

  private async buildRequest(
    type: ChatTypeIA,
    question: string,
    uuidMessage: string | undefined,
    formDataImage?: FormData
  ): Promise<
    IRequestCommand | IRequestAnswer | IRequestImage | IRequestVision
  > {
    let request:
      | IRequestCommand
      | IRequestAnswer
      | IRequestImage
      | IRequestVision;

    switch (type) {
      case ChatTypeIA.text: {
        const history: Array<IQuestionAndAnswers> = [];
        Array.from(this.questionsAndAnswers.values()).forEach(item => {
          history.push({
            user: this.base64Pipe.transform(item?.user ?? ''),
            assistant: this.base64Pipe.transform(
              (item?.assistant as string) ?? ''
            ),
          });
        });

        let grounding_context = undefined;
        if (this.chatFilesService.getChildrenSelected()?.length > 0) {
          if (this.modelsFilesList.includes(this.modelSelected?.value)) {
            grounding_context = this.chatFilesService.getAllTextFiles();
            grounding_context = `<DOCUMENT>${grounding_context}</DOCUMENT>\n\n`;
          } else {
            const embeddingsQuestionResponse = await firstValueFrom(
              this.apiClient.embeddings(this.base64Pipe.transform(question))
            );
            grounding_context =
              this.chatFilesService.calculateSemanticSimilarity(
                embeddingsQuestionResponse?.embedding ?? []
              );
            grounding_context = `### DOCUMENT ###${grounding_context}### DOCUMENT ###\n\n`;
          }
        }

        const language = this.translateService.currentLang;
        // Construir solicitud para mensajes de texto
        request = {
          interaction_id: this.base64Pipe.transform(uuidMessage),
          conversation_id: this.base64Pipe.transform(this.uniqueChat),
          email_hash: this.base64Pipe.transform(
            this.sessionService.usr!.userEmail!
          ),
          user: this.base64Pipe.transform(question),
          history: history, // Historial de la conversación
          knowledgebase: this.chatActivate?.viewLetf // Knowledge base si está activa
            ? this.base64Pipe.transform(this.baseKnowledgeSelected?.value)
            : undefined,
          model: this.modelSelected?.value,
          idChat: this.idChat,
          grounding_context: grounding_context // Contexto si está disponible
            ? this.base64Pipe.transform(grounding_context)
            : undefined,
          language, // Idioma
        };
        break;
      }
      case ChatTypeIA.image:
        // Construir solicitud para generación de imágenes
        request = {
          prompt: this.base64Pipe.transform(question),
          preview: true,
          compress: true,
          quality: 50,
          idChat: this.idChat!,
          model: this.modelSelected?.value,
          uuidMessage: uuidMessage!, // UUID del mensaje
        };
        break;

      case ChatTypeIA.command:
        // Construir solicitud para comandos
        request = {
          idChat: this.idChat!,
          command: question,
        };
        break;

      case ChatTypeIA.vision:
        formDataImage!.append('file', this.fileVision!);
        request = {
          formDataImage: formDataImage!,
          idChat: this.idChat!,
          model: this.modelSelected?.value,
        };
        break;

      default:
        throw new Error(
          'Tipo de mensaje no válido para construir la solicitud.'
        );
    }

    return request;
  }

  // Método para obtener el modelo por defecto según el tipo de mensaje
  private getDefaultModel(type: ChatTypeIA): string {
    switch (type) {
      case ChatTypeIA.text.toString():
        return 'gpt_35_turbo';
      case ChatTypeIA.image.toString():
        return 'dalle_3';
      default:
        return 'gpt_35_turbo'; // Valor por defecto
    }
  }

  // Método para obtener la solicitud al API correcta según el tipo de mensaje
  private getApiRequest(
    type: ChatTypeIA,
    request: any,
    idMessage: number
  ): Observable<any> {
    switch (type) {
      case ChatTypeIA.text:
        return this.apiClient.getAnswer(
          request,
          idMessage,
          this.chatActivate?.pathAnswer
        );
      case ChatTypeIA.image:
        return this.apiClient.generateImage(request, idMessage);
      case ChatTypeIA.command:
        return this.apiClient.getAnswerCommand(request, idMessage);
      case ChatTypeIA.vision:
        return this.apiClient.generateImagePreview(request, idMessage);
      default:
        throw new Error('Tipo de mensaje no válido');
    }
  }

  // Método para manejar el envío del mensaje (independiente de la respuesta)
  private handleMessageSending(
    type: ChatTypeIA,
    retry: boolean,
    regenerate: boolean,
    idMessage: number,
    messageDBUser: ICreateMessage,
    previewImage?: Blob[]
  ) {
    if (!retry) {
      if (regenerate && type === ChatTypeIA.image) {
        this.indexedDBChatApiService.deleteMessageByUnique(
          this.lastMessage.unique!
        );
      }
      this.questionSubject.next({
        question: this.question,
        unique: messageDBUser.unique,
        files:
          type === ChatTypeIA.text
            ? this.chatFilesService.getSelectedFiles()
            : undefined,
        preview: previewImage,
        isVision: type === ChatTypeIA.vision,
      });
    } else {
      this.indexedDBChatApiService.deleteMessage(this.lastMessage.id);
    }

    const message: IMessage = {
      id: idMessage,
      idChat: this.idChat,
      unique: this.uniqueChat,
      isNew: true,
      questionAndAnswers: this.buildQuestionAndAnswer(
        idMessage,
        undefined,
        this.question,
        '',
        messageDBUser.unique! // Usando el unique del mensaje creado
      ),
      timeResponse: 0,
      model: messageDBUser.model,
      createdAt: new Date(),
      files: type === ChatTypeIA.text ? messageDBUser.files : undefined,
    };
    this.lastMessage = message;
  }

  private async handleResponse(
    responseApi: any,
    startTime: number,
    type: ChatTypeIA,
    question: string,
    idMessage: number,
    uuidMessage: string
  ): Promise<void> {
    const endTime = performance.now();
    const timeElapsed = endTime - startTime;
    const { response, request, idAnswer } = responseApi;

    // Procesamiento de la respuesta según el tipo de mensaje
    let content: any;
    const urlsSing: string[] = [];
    let urls: string[] = [];
    switch (type) {
      case ChatTypeIA.image:
        // content = response.map((item: any) => base64toBlob(item.image));
        urls = response.map((item: any) => item.compressed_blob_name);
        for (const item of response) {
          const responseSing = await firstValueFrom(
            this.apiClient.generateSingUrl(item.compressed_blob_name, 15)
          );
          urlsSing.push(responseSing.signed_url);
        }
        break;
      case ChatTypeIA.command:
        if (response.text === '0') {
          response.text = this.translateService.instant(
            'chat_response_vacations_zero'
          );
        } else if (response.text.length && !isNaN(Number(response.text))) {
          response.text =
            this.translateService.instant('chat_response_vacations') +
            ''.replace('{DAYS}', response.text);
        }
        content = this.convertString(
          marked.parse(response.text, { mangle: false, headerIds: false })
        );
        break;
      default:
        content = this.convertString(
          marked.parse(response.text, { mangle: false, headerIds: false })
        );
        break;
    }

    const message: IMessage = {
      id: 0,
      idChat: this.idChat,
      unique: request.uuidMessage,
      isNew: true,
      timeResponse: Math.floor(timeElapsed / 1000),
      model: request.model!,
      createdAt: new Date(),
    };

    this.taggingService.tag(TaggingEvents.receive_response, {
      elapsed_time: message.timeResponse,
      module: ChatType[this.chatActivate?.label as keyof typeof ChatType],
      model: message.model,
    });

    if (request.idChat === this.idChat) {
      this.responseSubject.next({
        role: ChatTypeRole.Assistant,
        content,
        text: type === ChatTypeIA.image ? undefined : response.text, // Ajustar para imágenes
        interaction: message,
        isVision: type === ChatTypeIA.vision,
        type,
        urls: urlsSing,
      });
      this.loading = false;
    }

    this.chatHistoryService.setStatusLoadingChat(request.idChat, false);

    // Creación del mensaje de respuesta en la base de datos
    const messageDB: ICreateMessage = {
      content,
      text: type === ChatTypeIA.image ? '' : response.text, // Ajustar para imágenes
      role: ChatTypeRole.Assistant,
      type,
      idChat: request!.idChat!,
      unique: uuidMessage,
      timeResponse: Math.floor(timeElapsed / 1000),
      model: request?.model ?? this.getDefaultModel(type),
      idAnswer,
      urls,
    };

    const { idMessage: idMessageAssistant } =
      await this.createMessage(messageDB);

    const questionAndAnswers = this.buildQuestionAndAnswer(
      idMessage,
      idMessageAssistant,
      question,
      type === ChatTypeIA.image.toString()
        ? response.map((item: any) => item.image)
        : response.text, // Ajustar para imágenes
      uuidMessage
    );

    message['id'] = idMessageAssistant;
    message['questionAndAnswers'] = questionAndAnswers;

    this.lastMessage = message;
  }

  private async handleError(
    error: any,
    startTime: number,
    retry: boolean,
    type: ChatTypeIA,
    question: string,
    idMessage: number,
    uuidMessage: string
  ): Promise<void> {
    console.error('Error en la solicitud:', error); // Log del error
    this.loading = false;
    const endTime = performance.now();
    const timeElapsed = endTime - startTime;

    if (!retry) {
      try {
        // Creación del mensaje de error en la base de datos
        const messageDB: ICreateMessage = {
          content: error.detail ?? error.message,
          text: error.detail ?? error.message,
          role: 'assistant',
          type,
          idChat: error.idChat ?? error?.request?.idChat ?? this.idChat!,
          unique: uuidMessage,
          timeResponse: Math.floor(timeElapsed / 1000),
          model:
            error.model ??
            this.modelSelected?.value ??
            this.getDefaultModel(type),
          idAnswer: error.idAnswer,
        };

        const { idMessage: idMessageAssistant } =
          await this.createMessage(messageDB);

        const questionAndAnswers = this.buildQuestionAndAnswer(
          idMessage,
          idMessageAssistant,
          question,
          error.detail ?? error.message,
          uuidMessage
        );

        const message = {
          id: idMessage,
          idChat: this.idChat,
          unique: this.uniqueChat,
          isNew: true,
          questionAndAnswers,
          timeResponse: Math.floor(timeElapsed / 1000),
          model:
            error.model ??
            this.modelSelected?.value ??
            this.getDefaultModel(type),
          createdAt: new Date(),
        };

        // Envío del mensaje de error a la interfaz de usuario
        if ((error.idChat ?? error?.request?.idChat) === this.idChat) {
          this.responseSubject.next({
            role: 'assistant',
            content: error.detail ?? error.message,
            text: error.detail ?? error.message,
            interaction: message,
            type, // Usar el tipo del mensaje original
          });
        }

        this.lastMessage = message;
      } catch (dbError) {
        console.error(
          'Error al guardar el mensaje de error en la base de datos:',
          dbError
        );
        // Manejar el error de la base de datos (mostrar un mensaje al usuario, etc.)
      }
    }

    this.chatHistoryService.setStatusLoadingChat(
      error?.idChat ?? error?.request?.idChat,
      false
    );
  }

  public async openChat(
    topicId: number,
    uniqueChat: string,
    knowledgeBase: string,
    model: string
  ) {
    //console.time('openChat');
    knowledgeBase =
      !knowledgeBase || knowledgeBase === '' ? 'all' : knowledgeBase;
    this.clearNotEvent();
    this.idChat = topicId;
    this.uniqueChat = uniqueChat;
    this.setBaseKnowledgeSelected(knowledgeBase);
    this.modelSelected =
      this.modelsList.find(item => item.value === model) ?? this.modelsList[0];
    this.questionsAndAnswers = new Map<number, any>();
    this.messages = [];
    this.messagesSubject.next({
      messages: this.messages,
      isLoadHistory: false,
    });
    this.loading = true;
    this.countMessagesInBD =
      (await this.indexedDBChatApiService.getCountMessagesByChatId(topicId)) ??
      1;
    // extrae la ultima interaccion
    const startMessageLoad = this.chatActivate?.startMessageLoad ?? 4;
    this.countMessagesInBD = this.countMessagesInBD - startMessageLoad;
    if (this.countMessagesInBD < 0) this.countMessagesInBD = 0;
    const resp: any[] =
      (await this.indexedDBChatApiService.getMessaByChatIdLazy(
        topicId,
        startMessageLoad,
        this.countMessagesInBD
      )) ?? [];
    await this.singsUrlsByImages(resp);
    this.loadMessagesLazy(resp);
  }

  private async singsUrlsByImages(resp: ICreateMessage[]) {
    for (const item of resp) {
      const urls: string[] = [];
      if (!item.urls || item.urls.length === 0) continue;
      for (const url of item.urls) {
        const responseSing = await firstValueFrom(
          this.apiClient.generateSingUrl(url, 15)
        );
        urls.push(responseSing.signed_url);
      }
      item.urls = urls;
    }
  }

  private loadMessagesLazy(
    resp: ICreateMessage[],
    isLoadHistory: boolean = false
  ) {
    const mapInteraction = this.mapMessages(resp);
    if (!mapInteraction || mapInteraction?.length === 0) return;

    this.updateMessages(mapInteraction, isLoadHistory);
    this.updateLastMessage();

    const lastInteractionUser = this.findLastUserInteraction();
    this.setModelInteraction(lastInteractionUser);

    if (lastInteractionUser?.files && lastInteractionUser?.files.length > 0) {
      this.handleFiles(lastInteractionUser);
    }

    this.updateQuestionAndAnswers();
    this.updateMessagesSubjectAndLoadingState(isLoadHistory);
  }

  private mapMessages(resp: ICreateMessage[]): IMessageInteraction[] {
    return resp?.map((item: any) => {
      const sendFeedback =
        item.sendFeedback === undefined
          ? item.preselectComment || item.badComment
          : item.sendFeedback;

      const activeFeedback =
        item.feedback === 'bad'
          ? item.preselectComment || item.badComment
            ? 2
            : 0
          : item.activeFeedback;

      return {
        role: item.role,
        content: item.content,
        text: item.text,
        interaction: {
          id: item.id,
          idChat: this.idChat,
          unique: item.unique,
          isNew: false,
          feedback: item.feedback,
          preselectComment: item.preselectComment,
          badComment: item.badComment,
          activeFeedback,
          sendFeedback: sendFeedback ?? false,
          timeResponse: item.timeResponse ?? 1,
          model: item.model,
          createdAt: item.createAt,
        },
        type: item.type ?? 'Text',
        files: item.files,
        urls: item.urls,
      } as IMessageInteraction;
    });
  }

  private updateMessages(
    mapInteraction: IMessageInteraction[],
    isLoadHistory: boolean
  ) {
    if (isLoadHistory) this.messages.unshift(...mapInteraction);
    else this.messages.push(...mapInteraction);
  }

  private updateLastMessage() {
    this.lastMessage = this.messages[this.messages.length - 1].interaction;
  }

  private findLastUserInteraction(): IMessageInteraction | undefined {
    const lastInteractionUserAssistant = this.messages.filter(
      message => message.interaction?.unique === this.lastMessage.unique
    );
    return lastInteractionUserAssistant?.find(
      (interaction: any) => interaction.role === 'user'
    );
  }

  private handleFiles(lastInteractionUser: IMessageInteraction) {
    const idsFilesSelected =
      lastInteractionUser?.files?.flatMap(file => file.id)?.filter(id => id) ??
      [];
    const namesFilesSelected =
      lastInteractionUser?.files
        ?.flatMap(file => file.name)
        ?.filter(name => name) ?? [];

    if (idsFilesSelected.length > 0) {
      this.chatFilesService.filesHistory = [];
      this.indexedDBChatApiService
        .getListFilesByIds(idsFilesSelected)
        .then(filesInBD => {
          if (filesInBD && filesInBD.length > 0) {
            this.updateTreeFiles(filesInBD, lastInteractionUser);
          }
        });
    } else {
      this.indexedDBChatApiService.getListFiles().then(filesHistoryInBD => {
        const filesHistory = filesHistoryInBD?.filter(file =>
          namesFilesSelected.includes(file.nameFile)
        );
        if (filesHistory && filesHistory.length > 0) {
          this.updateTreeFiles(filesHistory, lastInteractionUser);
        }
      });
    }
  }

  private updateQuestionAndAnswers() {
    if (this.messages.length > 1) {
      this.processMultipleMessages();
    } else if (this.messages.length === 1) {
      this.processSingleMessage();
    }
  }

  private processMultipleMessages(): void {
    let count = 0;
    let previousMessage: IMessageInteraction | null = null;

    for (const message of this.messages) {
      if (previousMessage) {
        this.updateActiveFeedback(previousMessage);

        if (previousMessage.role === 'user') {
          this.assignUniqueId(previousMessage);
          const questionAndAnswers = this.createQuestionAndAnswers(
            previousMessage,
            message
          );
          this.questionsAndAnswers.set(count, questionAndAnswers);
          this.assignQuestionAndAnswersToMessage(message, questionAndAnswers);
          count++;
        }
      }
      previousMessage = message;
    }
  }

  private processSingleMessage() {
    this.questionsAndAnswers.set(0, {
      user: this.messages[0].text,
      assistant: 'Sin respuesta o Cancelado',
      unique: this.messages[0].interaction?.unique,
      idAssistant: 0,
      idUser: this.messages[0].interaction?.id,
    });
  }

  private updateActiveFeedback(message: IMessageInteraction) {
    message.interaction.activeFeedback =
      message.interaction?.activeFeedback ?? 1;
  }

  private assignUniqueId(message: IMessageInteraction) {
    const unique = uuidv4();
    if (!message.interaction?.unique) {
      message.interaction.unique = unique;
    }
  }

  private createQuestionAndAnswers(
    previousMessage: IMessageInteraction,
    currentMessage: IMessageInteraction
  ): IQuestionAndAnswers {
    let messageAssistant = 'Sin respuesta';
    let idAssistant = 0;

    if (currentMessage.role == 'assistant') {
      messageAssistant =
        this.modelSelected.type === 'Text'
          ? currentMessage.text
          : (currentMessage.content as any);
      idAssistant = currentMessage.interaction.id;
      if (!currentMessage.interaction?.unique) {
        currentMessage.interaction.unique = previousMessage.interaction.unique;
      }
    }

    return {
      user: previousMessage.text,
      assistant: messageAssistant,
      unique: currentMessage.interaction?.unique,
      idAssistant,
      idUser: previousMessage.interaction?.id,
    };
  }

  private assignQuestionAndAnswersToMessage(
    message: IMessageInteraction,
    questionAndAnswers: IQuestionAndAnswers
  ) {
    if (
      questionAndAnswers.unique === message.interaction?.unique ||
      !message.interaction?.questionAndAnswers
    ) {
      message.interaction.questionAndAnswers = questionAndAnswers;
    }
  }

  private updateMessagesSubjectAndLoadingState(isLoadHistory: boolean) {
    this.messagesSubject.next({ messages: this.messages, isLoadHistory });
    this.loading =
      this.chatHistoryService.topicLoading.get(Number(this.idChat)) ?? false;
  }

  async updateTreeFiles(
    filesInBD: any[],
    lastInteractionUser?: IMessageInteraction
  ) {
    await this.chatFilesService.openHistoryFiles(filesInBD, true, true);
    this.setModelInteraction(lastInteractionUser);
  }

  public setDefaultModel(isFile: boolean = false) {
    this.modelSelected =
      this.modelsList.find(model => model.value === 'gpt_4o_dedicated') ??
      (isFile && this.modelSelectedFile
        ? this.modelSelectedFile
        : this.modelsList[0]);
  }

  public setModelInteraction(lastInteractionUser?: IMessageInteraction) {
    this.modelSelected = lastInteractionUser
      ? this.modelsListAll.find(
          model => model.value === lastInteractionUser.interaction.model
        ) ?? this.modelsList[0]
      : this.modelsList[0];
    if (
      this.modelSelected &&
      this.modelSelected.value === 'gemini_10_pro_vision'
    ) {
      this.modelsList = [this.modelSelected];
    }
  }
  private convertString(input: string) {
    return input.split('<a').join('<a target="_blank"');
  }

  private buildQuestionAndAnswer(
    idMessage: number,
    idMessageAssistant: number | undefined,
    question: string,
    response: string | string[],
    uuidMessage: string
  ) {
    const questionAndAnswers: IQuestionAndAnswers = {
      idUser: idMessage,
      idAssistant: idMessageAssistant,
      assistant: response,
      user: question,
      unique: uuidMessage,
    };
    this.questionsAndAnswers.set(idMessage, questionAndAnswers);
    return questionAndAnswers;
  }

  private async createChat(retry?: boolean) {
    if (!retry) {
      if (!this.questionsAndAnswers.size || !this.idChat || !this.uniqueChat) {
        this.uniqueChat = uuidv4();
        this.idChat = await this.indexedDBChatApiService.addChat(
          this.question,
          false,
          this.uniqueChat,
          this.baseKnowledgeSelected?.value,
          this.modelSelected?.value ?? 'gpt_35_turbo',
          this.chatActivate?.value
        );
        this.chatHistoryService.topicLoading.set(this.idChat, true);
        this.chatHistoryService.sendClickEventHistory(
          {
            id: this.idChat,
            loading: true,
          } as any,
          true
        );
      }
    }
  }

  private async createMessage(data: ICreateMessage) {
    if (!data.unique) data.unique = uuidv4();
    const idMessage = await this.indexedDBChatApiService.addMessage(data);
    return { uuidMessage: data.unique, idMessage };
  }

  clearNotEvent() {
    this.idChat = undefined;
    this.uniqueChat = undefined;
    this.lastMessage = {} as any;
    this.setBaseKnowledgeSelected();
    this.setDefaultModel();
    this.questionsAndAnswers = new Map<number, any>();
    this.chatFilesService.clearChecklistSelection();
    this.fileVision = undefined;
  }

  clear() {
    this.loading = false;
    this.idChat = undefined;
    this.uniqueChat = undefined;
    this.lastMessage = {} as any;
    this.setBaseKnowledgeSelected();
    this.setDefaultModel();
    this.questionsAndAnswers = new Map<number, any>();
    this.clearSubject.next(true);
    this.chatFilesService.clearChecklistSelection();
    this.fileVision = undefined;
  }

  getSettingsKnowledgeBase() {
    const baseKnowledgeList: ISelectorItem[] = [
      {
        icon: 'rh+_logo.png',
        label: 'RRHH',
        value: 'Recursos Humanos',
        roles: [
          /* 'chat_metatron_user_basic',
        'chat_metatron_user_pro',
        'chat_metatron_user_admin',
        'chat_metatron_airport_agent',
        'chat_metatron_legal_leasing',
        'chat_metatron_aircraft_technician',
        'chat_metatron_user_airtalk',*/
        ],
        description: 'TEXT_DESCRIPTION_RRHH',
        commands: ['/vacations'],
      },
      {
        icon: 'sd_logo.png',
        label: 'Service Desk',
        value: 'Service Desk',
        roles: [
          /* 'chat_metatron_user_basic',
        'chat_metatron_user_pro',
        'chat_metatron_user_admin',
        'chat_metatron_airport_agent',
        'chat_metatron_legal_leasing',
        'chat_metatron_aircraft_technician',
        'chat_metatron_user_airtalk',*/
        ],
        description: 'TEXT_DESCRIPTION_SERVICE_DESK',
        commands: [],
      },
      {
        icon: 'zendesk-logo.png',
        label: 'Zendesk',
        value: 'Zendesk',
        roles: ['chat_metatron_user_admin', 'chat_metatron_user_pro'],
        rolesKnowledgeDefault: [''],
        description: 'TEXT_DESCRIPTION_SERVICE_DESK',
      },
      {
        icon: 'msp-icon.svg',
        label: 'MSP | Agentes Apto',
        value: 'Manual del Servicio al Pasajero',
        roles: ['chat_metatron_user_admin', 'chat_metatron_airport_agent'],
        rolesKnowledgeDefault: ['chat_metatron_airport_agent'],
        description: 'TEXT_DESCRIPTION_MSP',
      },
      {
        icon: 'emantto-icon.png',
        label: 'eMantto',
        value: 'Maintenance-B767',
        roles: [
          'chat_metatron_user_admin',
          'chat_metatron_aircraft_technician',
        ],
        rolesKnowledgeDefault: ['chat_metatron_aircraft_technician'],
        description: 'TEXT_DESCRIPTION_EMANTTO',
      },
      // {
      //   icon: 'copilot_logo.png',
      //   label: Constants.GENERAL_KNOWLEDGEBASE_LABEL,
      //   value: 'all',
      //   roles: [
      //     /* 'chat_metatron_user_basic',
      //   'chat_metatron_user_pro',
      //   'chat_metatron_user_admin',
      //   'chat_metatron_airport_agent',
      //   'chat_metatron_legal_leasing',
      //   'chat_metatron_aircraft_technician',
      //   'chat_metatron_user_airtalk',*/
      //   ],
      //   description: 'TEXT_DESCRIPTION_GENERAL',
      // },
    ];
    return baseKnowledgeList.filter(baseKnow => {
      const userRoles = this.sessionService.usr?.roles;
      return (
        baseKnow.roles?.length == 0 ||
        baseKnow.roles?.some(role => userRoles?.includes(role))
      );
    });
  }

  onClear(): Observable<boolean> {
    return this.clearSubject.asObservable();
  }

  onQuestion(): Observable<IQuestion> {
    return this.questionSubject.asObservable();
  }

  onResponse(): Observable<IMessageInteraction> {
    return this.responseSubject.asObservable();
  }
  onError(): Observable<string> {
    return this.errorSubject.asObservable();
  }

  onLoadMessages(): Observable<{
    messages: IMessageInteraction[];
    isLoadHistory: boolean;
  }> {
    return this.messagesSubject.asObservable();
  }

  cancelAnswer(): void {
    if (this.httpSubscription) {
      this.httpSubscription.unsubscribe();
      this.httpSubscription = null;
    }

    this.chatHistoryService.setStatusLoadingChat(this.idChat!, false);
    this.loading = false;
  }

  setModelListByChat(chat: IPanelChat) {
    const isAdmin: boolean = this.sessionService.isAdmin();
    const isUserPro: boolean = this.sessionService.isUserPro();
    this.modelsList = this.modelsListAll.filter(
      model =>
        model.type == chat.type &&
        model.disabled == false &&
        (!chat.modelsListValue || isAdmin || isUserPro
          ? true
          : chat.modelsListValue?.some(
              modelValue => modelValue === model.value
            ))
    );
  }

  setModelListByFiles() {
    this.modelsList = this.modelsListAll.filter(model => model.usedFiles);
  }

  setBaseKnowledgeSelected(knowledgeBase?: string) {
    this.baseKnowledgeSelected = this.chatActivate?.viewLetf
      ? knowledgeBase
        ? this.baseKnowledgeList.find(item => item.value === knowledgeBase)
        : this.getDefaultBaseKnowledge()
      : this.getDefaultBaseKnowledge();
    this.baseKnowledgeSelected &&
      this.userEventsService.sendClickEvent(
        this.baseKnowledgeSelected.value,
        'selectedTopLeftOnlyTitle'
      );
  }

  getDefaultBaseKnowledge() {
    const userRoles = this.sessionService.usr?.roles;
    const baseKnowledgeDefault = this.baseKnowledgeList.find(item => {
      return (
        item.rolesKnowledgeDefault?.some(role => userRoles?.includes(role)) ??
        false
      );
    });

    // Si el usuario es ADMIN o PRO, se sobreescribe el selector por defecto
    if (
      userRoles?.includes('chat_metatron_user_admin') ||
      userRoles?.includes('chat_metatron_user_pro')
    ) {
      return this.baseKnowledgeList[0];
    } else {
      return baseKnowledgeDefault ?? this.baseKnowledgeList[0];
    }
  }

  ngOnDestroy(): void {
    this.cancelAnswer();
  }

  loadingTextLog(): void {
    this.isLimitSeconds = false;
    const currentModel = this.modelSelected?.value;
    let secondsModel: number = 0;

    if (currentModel === 'gpt_4_turbo') {
      secondsModel = 25;
    } else if (currentModel === 'text_unicorn') {
      secondsModel = 20;
    } else {
      secondsModel = 8;
    }

    const subscriptionLoading = this.secondInterval.subscribe(second => {
      if (second === secondsModel && this.loading) {
        this.isLimitSeconds = true;
      }
    });

    setTimeout(() => {
      subscriptionLoading.unsubscribe();
    }, secondsModel * 1500);
  }

  changeChat(chat: IPanelChat) {
    // TODO: would be nice to make these chat labels an Enum of possible values
    // to maintain consistency with downstream code such as the tagging service,
    // but it's a good practice in general.
    document.title = chat?.label;
    this.isChatChange = chat !== this.chatActivate;
    this.chatActivate = chat;
    this.sessionService.isChatLibre = chat.isChatLibre;
    this.themeService.changeTheme(false);
    this.clear();
    this.setModelListByChat(chat);
    this.setDefaultModel();
    this.chatHistoryService.sendClickEventHistory(undefined, true);
    this.userEventsService.sendUpdatePromptExamples(true);
    sessionStorage.setItem('chatActive', JSON.stringify(chat));
    if (!this.chatActivate.viewLetf) this.baseKnowledgeSelected = undefined;
    this.taggingService.tag(TaggingEvents.select_chat_type, {
      type: ChatType[chat.label as keyof typeof ChatType],
    });
  }

  get themeSkeleton(): any {
    return this.themeService.isDarkMode
      ? this.themeSkeletonDark
      : this.themeSkeletonlight;
  }

  public async onScrollLoadData() {
    const cantMessageLoad = this.chatActivate?.cantMessageLoad ?? 2;
    this.countMessagesInBD =
      this.countMessagesInBD < cantMessageLoad && this.countMessagesInBD > 0
        ? cantMessageLoad
        : this.countMessagesInBD - cantMessageLoad;
    if (this.countMessagesInBD < 0) return;
    //console.time('openChat');
    const resp =
      (await this.indexedDBChatApiService.getMessaByChatIdLazy(
        this.idChat!,
        cantMessageLoad,
        this.countMessagesInBD
      )) ?? [];
    await this.singsUrlsByImages(resp);
    this.loadMessagesLazy(resp, true);
  }
}
